# Proceso de despliegue

Este documento distingue lo realizado de lo pendiente. Un paso no se marca como completado sólo porque su configuración exista en el código.

## 1. Ejecución local — completada

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
```

La aplicación fue comprobada en `http://localhost:3000`, en escritorio y en un viewport móvil de 390 × 844.

## 2. Configuración de Supabase — pendiente de proyecto

1. Seleccionar o crear el proyecto Supabase.
2. Obtener Project URL y clave publicable desde **Connect**.
3. Aplicar `supabase/migrations/20261005013833_initial_auth_and_games.sql`.
4. Ejecutar asesores de seguridad y rendimiento.
5. Completar `.env.local`.

## 3. Auth — preparada, no validada remotamente

La aplicación implementa registro, login, recuperación de sesión y logout mediante `AuthService`. El Proxy de Next.js refresca las cookies. Falta confirmar estos flujos contra un proyecto real y configurar las Redirect URLs.

## 4. Base de datos y policies — preparada

La migración crea `profiles` y `games`, restricciones, índice y un trigger de perfil. RLS restringe filas mediante `auth.uid()`. La función del trigger vive en el esquema privado y no concede ejecución pública.

## 5. Git — preparado localmente

`.gitignore` excluye dependencias, builds, secretos, Vercel y archivos temporales. Antes de publicar se debe comprobar:

```bash
git status --short
git check-ignore -v .env.local
```

No se ha configurado todavía un remoto GitHub.

## 6. GitHub — pendiente

Crear el repositorio, revisar el historial y enlazar `origin` sólo después del QA real de Supabase. Nunca añadir `.env.local`.

## 7. Vercel — pendiente

Importar el repositorio desde GitHub y configurar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

No usar una clave secreta o `service_role` como variable pública.

## 8. Validación de producción — pendiente

Comprobar ingreso, registro, login, logout, recarga de sesión, partida, victoria, derrota, historial, responsive, navegación, consola y recarga directa de `/juego` y `/historial`.

## 9. Estado de entornos

```text
LOCAL (estable)
  ↓
SUPABASE REAL (pendiente)
  ↓
GITHUB (pendiente)
  ↓
VERCEL (pendiente)
```
