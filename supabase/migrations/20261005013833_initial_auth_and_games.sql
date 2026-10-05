-- Perfiles mínimos vinculados con Supabase Auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 32),
  created_at timestamptz not null default now()
);

-- Resultados de partidas; nunca se almacena la palabra secreta.
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  player_name text not null check (char_length(player_name) between 1 and 32),
  word_length smallint not null check (word_length > 0),
  errors smallint not null check (errors between 0 and 6),
  result text not null check (result in ('won', 'lost')),
  started_at timestamptz not null,
  finished_at timestamptz not null check (finished_at >= started_at)
);

alter table public.profiles enable row level security;
alter table public.games enable row level security;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.games to authenticated;
revoke all on table public.profiles from anon;
revoke all on table public.games from anon;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "games_select_own"
on public.games for select to authenticated
using ((select auth.uid()) = user_id);

create policy "games_insert_own"
on public.games for insert to authenticated
with check ((select auth.uid()) = user_id);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Jugador'), 32)
  );
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create index if not exists games_user_finished_idx
on public.games (user_id, finished_at desc);
