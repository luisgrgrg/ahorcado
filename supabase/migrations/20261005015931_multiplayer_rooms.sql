-- Multiplayer rooms use authenticated Supabase users. Anonymous sign-ins are
-- authenticated users without email, so room membership can still be secured
-- with auth.uid() while the UI remains frictionless.

create type public.room_status as enum ('waiting', 'playing', 'finished');
create type public.room_game_status as enum ('playing', 'won', 'lost');

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code varchar(5) not null unique check (code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$'),
  status public.room_status not null default 'waiting',
  host_id uuid not null references auth.users(id),
  current_game_id uuid,
  created_at timestamptz not null default now()
);

create table public.room_players (
  room_id uuid not null references public.rooms(id) on delete cascade,
  player_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 32),
  joined_at timestamptz not null default now(),
  primary key (room_id, player_id)
);

create table public.room_games (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  masked_word text not null,
  guessed_letters text[] not null default '{}',
  incorrect_letters text[] not null default '{}',
  errors smallint not null default 0 check (errors between 0 and 6),
  current_player_id uuid not null references auth.users(id),
  status public.room_game_status not null default 'playing',
  revealed_word text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  check ((status = 'playing' and revealed_word is null and finished_at is null)
    or (status in ('won', 'lost') and revealed_word is not null and finished_at is not null))
);

alter table public.rooms
  add constraint rooms_current_game_fk
  foreign key (current_game_id) references public.room_games(id) on delete set null;

create table private.game_words (
  id bigint generated always as identity primary key,
  word text not null unique check (word = upper(word) and word ~ '^[A-Z]{4,16}$')
);

insert into private.game_words (word) values
  ('AVENTURA'), ('BRUJULA'), ('CASCADA'), ('CASTILLO'), ('COMETA'),
  ('DINOSAURIO'), ('ELEFANTE'), ('ESTRELLA'), ('GUITARRA'), ('MARIPOSA'),
  ('MONTANA'), ('PLANETA'), ('TESORO'), ('TIBURON'), ('VOLCAN');

create table private.room_game_secrets (
  game_id uuid primary key references public.room_games(id) on delete cascade,
  secret_word text not null
);

create index room_players_order_idx on public.room_players (room_id, joined_at, player_id);
create index room_games_room_started_idx on public.room_games (room_id, started_at desc);

alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.room_games enable row level security;

grant select on table public.rooms, public.room_players, public.room_games to authenticated;
revoke all on table public.rooms, public.room_players, public.room_games from anon;
revoke insert, update, delete on table public.rooms, public.room_players, public.room_games from authenticated;

create or replace function public.is_room_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.room_players
    where room_id = p_room_id and player_id = (select auth.uid())
  );
$$;

revoke all on function public.is_room_member(uuid) from public, anon;
grant execute on function public.is_room_member(uuid) to authenticated;

create policy rooms_select_members
on public.rooms for select to authenticated
using (public.is_room_member(id));

create policy room_players_select_members
on public.room_players for select to authenticated
using (public.is_room_member(room_id));

create policy room_games_select_members
on public.room_games for select to authenticated
using (public.is_room_member(room_id));

create or replace function private.make_room_code()
returns text
language sql
volatile
security invoker
set search_path = ''
as $$
  select string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::integer, 1),
    ''
  )
  from generate_series(1, 5);
$$;

revoke all on function private.make_room_code() from public, anon, authenticated;

create or replace function private.create_game_for_room(p_room_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game_id uuid;
  v_word text;
  v_first_player uuid;
  v_previous_word text;
begin
  select s.secret_word into v_previous_word
  from public.rooms r
  join private.room_game_secrets s on s.game_id = r.current_game_id
  where r.id = p_room_id;

  select word into v_word
  from private.game_words
  order by (word = coalesce(v_previous_word, '')) asc, random()
  limit 1;

  select player_id into v_first_player
  from public.room_players
  where room_id = p_room_id
  order by joined_at, player_id
  limit 1;

  if v_word is null or v_first_player is null then
    raise exception 'ROOM_NOT_READY';
  end if;

  insert into public.room_games (room_id, masked_word, current_player_id)
  values (p_room_id, repeat('_', char_length(v_word)), v_first_player)
  returning id into v_game_id;

  insert into private.room_game_secrets (game_id, secret_word)
  values (v_game_id, v_word);

  update public.rooms
  set status = 'playing', current_game_id = v_game_id
  where id = p_room_id;

  return v_game_id;
end;
$$;

revoke all on function private.create_game_for_room(uuid) from public, anon, authenticated;

create or replace function public.create_room(p_player_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_room_id uuid;
  v_code text;
  v_attempt smallint := 0;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(p_player_name)) not between 1 and 32 then raise exception 'INVALID_PLAYER_NAME'; end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := private.make_room_code();
    begin
      insert into public.rooms (code, host_id)
      values (v_code, v_user_id)
      returning id into v_room_id;
      exit;
    exception when unique_violation then
      if v_attempt >= 20 then raise exception 'ROOM_CODE_UNAVAILABLE'; end if;
    end;
  end loop;

  insert into public.room_players (room_id, player_id, name)
  values (v_room_id, v_user_id, left(trim(p_player_name), 32));

  return v_code;
end;
$$;

create or replace function public.join_room(p_code text, p_player_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_room public.rooms%rowtype;
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;
  if v_code !~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$' then raise exception 'INVALID_CODE'; end if;
  if char_length(trim(p_player_name)) not between 1 and 32 then raise exception 'INVALID_PLAYER_NAME'; end if;

  select * into v_room from public.rooms where code = v_code for update;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.status = 'playing' then raise exception 'ROOM_ALREADY_STARTED'; end if;
  if v_room.status = 'finished' then raise exception 'ROOM_CLOSED'; end if;

  insert into public.room_players (room_id, player_id, name)
  values (v_room.id, v_user_id, left(trim(p_player_name), 32))
  on conflict (room_id, player_id) do update set name = excluded.name;

  return v_code;
end;
$$;

create or replace function public.start_room_game(p_room_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.rooms%rowtype;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found or not public.is_room_member(p_room_id) then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.host_id <> (select auth.uid()) then raise exception 'HOST_ONLY'; end if;
  if v_room.status <> 'waiting' then raise exception 'ROOM_NOT_WAITING'; end if;
  if (select count(*) from public.room_players where room_id = p_room_id) < 2 then raise exception 'NOT_ENOUGH_PLAYERS'; end if;
  return private.create_game_for_room(p_room_id);
end;
$$;

create or replace function public.guess_room_letter(p_room_id uuid, p_letter text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.rooms%rowtype;
  v_game public.room_games%rowtype;
  v_secret text;
  v_letter text := upper(trim(coalesce(p_letter, '')));
  v_guessed text[];
  v_incorrect text[];
  v_masked text := '';
  v_errors smallint;
  v_status public.room_game_status := 'playing';
  v_next_player uuid;
  i integer;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found or not public.is_room_member(p_room_id) then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.status <> 'playing' or v_room.current_game_id is null then raise exception 'GAME_NOT_PLAYING'; end if;
  if v_letter !~ '^[A-ZÑ]$' then raise exception 'INVALID_LETTER'; end if;

  select * into v_game from public.room_games where id = v_room.current_game_id for update;
  if v_game.status <> 'playing' then raise exception 'GAME_NOT_PLAYING'; end if;
  if v_game.current_player_id <> (select auth.uid()) then raise exception 'NOT_YOUR_TURN'; end if;
  if v_letter = any(v_game.guessed_letters) then raise exception 'LETTER_ALREADY_USED'; end if;

  select secret_word into v_secret from private.room_game_secrets where game_id = v_game.id;
  v_guessed := array_append(v_game.guessed_letters, v_letter);
  v_incorrect := v_game.incorrect_letters;
  v_errors := v_game.errors;

  if position(v_letter in v_secret) = 0 then
    v_incorrect := array_append(v_incorrect, v_letter);
    v_errors := v_errors + 1;
  end if;

  for i in 1..char_length(v_secret) loop
    if substr(v_secret, i, 1) = any(v_guessed) then
      v_masked := v_masked || substr(v_secret, i, 1);
    else
      v_masked := v_masked || '_';
    end if;
  end loop;

  if position('_' in v_masked) = 0 then v_status := 'won';
  elsif v_errors >= 6 then v_status := 'lost';
  end if;

  if v_status = 'playing' then
    with ordered as (
      select player_id, row_number() over (order by joined_at, player_id) as turn_order
      from public.room_players where room_id = p_room_id
    ), current_turn as (
      select turn_order from ordered where player_id = v_game.current_player_id
    )
    select player_id into v_next_player
    from ordered
    where turn_order = case
      when (select turn_order from current_turn) = (select count(*) from ordered) then 1
      else (select turn_order from current_turn) + 1
    end;
  else
    v_next_player := v_game.current_player_id;
  end if;

  update public.room_games set
    masked_word = v_masked,
    guessed_letters = v_guessed,
    incorrect_letters = v_incorrect,
    errors = v_errors,
    current_player_id = v_next_player,
    status = v_status,
    revealed_word = case when v_status = 'playing' then null else v_secret end,
    finished_at = case when v_status = 'playing' then null else now() end
  where id = v_game.id;

  if v_status <> 'playing' then
    update public.rooms set status = 'finished' where id = p_room_id;
  end if;
end;
$$;

create or replace function public.restart_room_game(p_room_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_room public.rooms%rowtype;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found or not public.is_room_member(p_room_id) then raise exception 'ROOM_NOT_FOUND'; end if;
  if v_room.host_id <> (select auth.uid()) then raise exception 'HOST_ONLY'; end if;
  if v_room.status <> 'finished' then raise exception 'GAME_NOT_FINISHED'; end if;
  if (select count(*) from public.room_players where room_id = p_room_id) < 2 then raise exception 'NOT_ENOUGH_PLAYERS'; end if;
  return private.create_game_for_room(p_room_id);
end;
$$;

create or replace function public.leave_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_room public.rooms%rowtype;
  v_next_player uuid;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found or not public.is_room_member(p_room_id) then return; end if;

  delete from public.room_players where room_id = p_room_id and player_id = v_user_id;

  select player_id into v_next_player
  from public.room_players where room_id = p_room_id
  order by joined_at, player_id limit 1;

  if v_next_player is null then
    delete from public.rooms where id = p_room_id;
    return;
  end if;

  if v_room.host_id = v_user_id then
    update public.rooms set host_id = v_next_player where id = p_room_id;
  end if;

  if v_room.current_game_id is not null then
    update public.room_games
    set current_player_id = v_next_player
    where id = v_room.current_game_id and current_player_id = v_user_id and status = 'playing';
  end if;
end;
$$;

revoke all on function public.create_room(text) from public, anon;
revoke all on function public.join_room(text, text) from public, anon;
revoke all on function public.start_room_game(uuid) from public, anon;
revoke all on function public.guess_room_letter(uuid, text) from public, anon;
revoke all on function public.restart_room_game(uuid) from public, anon;
revoke all on function public.leave_room(uuid) from public, anon;

grant execute on function public.create_room(text) to authenticated;
grant execute on function public.join_room(text, text) to authenticated;
grant execute on function public.start_room_game(uuid) to authenticated;
grant execute on function public.guess_room_letter(uuid, text) to authenticated;
grant execute on function public.restart_room_game(uuid) to authenticated;
grant execute on function public.leave_room(uuid) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'rooms') then
    alter publication supabase_realtime add table public.rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_players') then
    alter publication supabase_realtime add table public.room_players;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_games') then
    alter publication supabase_realtime add table public.room_games;
  end if;
end;
$$;
