# Arquitectura

## Objetivo

Mantener el juego comprensible, comprobable y funcional incluso cuando Supabase no esté disponible.

## Capas

- **View:** rutas de `src/app` y componentes de `src/components`. Renderizan estado y capturan acciones.
- **Controller:** `use-game-controller.ts` coordina una partida y solicita la persistencia al terminar.
- **Domain / Services:** `GameService` contiene reglas puras; `WordService` selecciona palabras.
- **Repository:** la interfaz `GameRepository` abstrae el historial. `LocalGameRepository` atiende invitados y `SupabaseGameRepository` usuarios autenticados.
- **Infrastructure:** `src/lib/supabase` crea clientes separados para navegador, servidor y Proxy.

## Flujo

```text
Identificación → Invitado o cuenta → Partida → GameService
      → resultado → GameRepository → localStorage o Supabase
      → resumen → nueva partida / historial
```

## Responsabilidades importantes

- Los componentes no consultan tablas directamente.
- La palabra secreta nunca se persiste.
- La UI puede ejecutarse sin variables de Supabase.
- La identidad autenticada proviene de Supabase Auth; RLS usa `auth.uid()` y no metadatos editables.
- El modo invitado se limita al navegador actual.
