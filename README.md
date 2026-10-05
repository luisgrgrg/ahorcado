# Ahorcado Aventuras

Juego académico del ahorcado construido con Next.js, React, TypeScript estricto y Tailwind CSS. Conserva una interfaz casual 2D, permite jugar como invitado y está preparado para autenticación e historial persistente con Supabase.

## Estado actual

- Juego individual completo y desacoplado de la persistencia.
- Invitados con sesión e historial en `localStorage`.
- Registro, login, sesión y logout preparados con Supabase Auth.
- Historial con repositorio local o Supabase según el tipo de jugador.
- Migración reproducible con perfiles, partidas, restricciones y RLS.
- 15 pruebas automatizadas de dominio, persistencia y autenticación.
- Rutas responsive: `/`, `/juego` y `/historial`.

La conexión remota de Supabase, GitHub y Vercel siguen pendientes. No se consideran terminadas hasta validar sus respectivos entornos.

## Arquitectura

```text
View (src/components, src/app)
  ↓
Controller (src/controllers)
  ↓
Service / Domain (src/domain)
  ↓
Repository (src/lib/repositories)
  ↓
Supabase o almacenamiento local
```

La lógica de palabras, intentos, victoria y derrota no depende de React ni de Supabase. Consulta [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requisitos

- Node.js 20.9 o superior. Se recomienda Node.js 22 LTS para las versiones más recientes del ecosistema.
- npm 10 o superior.
- Un proyecto de Supabase sólo para habilitar cuentas e historial remoto.

## Instalación y ejecución local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). El modo invitado funciona sin Supabase.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` queda disponible sólo como compatibilidad con proyectos antiguos. Nunca se utiliza una clave `service_role` en el navegador. `.env.local` está excluido por Git.

## Supabase

1. Crear o seleccionar un proyecto.
2. Aplicar `supabase/migrations/20261005013833_initial_auth_and_games.sql`.
3. Configurar URL y clave publicable en `.env.local`.
4. Añadir `http://localhost:3000` a las URL permitidas de Auth.
5. Reiniciar `npm run dev`.

Las tablas públicas tienen RLS y permisos explícitos. Cada usuario sólo puede leer o escribir sus propios perfiles y partidas. Los invitados no escriben en Supabase.

## Comandos de calidad

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Despliegue

El orden previsto es local → GitHub → Vercel. La guía y el estado real están en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). No se debe desplegar antes de conectar y validar Supabase localmente.
