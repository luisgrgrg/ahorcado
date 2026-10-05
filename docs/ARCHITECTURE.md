# Arquitectura

## Objetivo

Mantener el juego comprensible y comprobable. La práctica individual funciona sin Supabase; las salas multijugador requieren el backend central para no degradar la seguridad ni crear estados divergentes por navegador.

## Capas

- **View:** rutas de `src/app` y componentes de `src/components`. Renderizan estado y capturan acciones.
- **Controller:** `use-game-controller.ts` coordina una partida y solicita la persistencia al terminar.
- **Domain / Services:** `GameService` contiene reglas puras; `WordService` selecciona palabras.
- **Repository:** la interfaz `GameRepository` abstrae el historial. `LocalGameRepository` atiende invitados y `SupabaseGameRepository` usuarios autenticados.
- **Infrastructure:** `src/lib/supabase` crea clientes separados para navegador, servidor y Proxy.
- **Room domain:** `RoomService` contiene formato de códigos, orden, permisos de inicio y selectores de turno. `MultiplayerGameService` conserva una versión pura de las reglas para pruebas de contrato.
- **Room repository:** `SupabaseRoomRepository` es el único adaptador usado por la UI para RPC, snapshots y suscripciones Realtime.

## Flujo

```text
Nombre temporal → Landing → Crear / entrar por código → Lobby
      → RPC transaccional → snapshot público → Realtime → todos los clientes
      → partida por turnos → resultado → repetir sin destruir la sala

Configuración → práctica individual → GameService → historial local o Supabase
```

## Responsabilidades importantes

- Los componentes no consultan tablas directamente.
- La palabra secreta nunca se persiste.
- La UI puede ejecutarse sin variables de Supabase.
- La identidad autenticada proviene de Supabase Auth; RLS usa `auth.uid()` y no metadatos editables.
- El modo invitado se limita al navegador actual.

## Fuente de verdad multijugador

- Supabase Auth anónimo entrega un `auth.uid()` real sin pedir correo ni contraseña.
- `rooms`, `room_players` y `room_games` exponen solo el estado compartible y están protegidas por RLS de membresía.
- Crear, entrar, salir, iniciar, adivinar y reiniciar se ejecutan mediante funciones RPC transaccionales.
- `private.room_game_secrets` guarda la palabra completa; el navegador solo recibe `masked_word`. `revealed_word` permanece nulo hasta victoria o derrota.
- Realtime escucha cambios Postgres en las tres tablas públicas. Ante cada evento el repositorio vuelve a leer un snapshot completo para evitar fusiones parciales inconsistentes.
- El orden de turno es el orden estable de `joined_at, player_id`. La base valida turno y letra repetida aunque la UI esté manipulada.
- Si sale el anfitrión se transfiere el rol al primer participante restante; si no queda nadie, la sala se elimina.
