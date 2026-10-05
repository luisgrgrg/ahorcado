# Seguimiento del proyecto

## Bloque 1 — Versión local estable

**Actividad:** inspección del proyecto existente.  
**Rol:** Analista / Programador.  
**Estado:** Completado.  
**Decisión:** conservar el diseño del prototipo y migrar únicamente la estructura técnica requerida.  
**Resultado:** se identificó que el repositorio sólo contenía HTML, CSS y JavaScript estáticos.

**Actividad:** migración a Next.js, React, TypeScript estricto y Tailwind CSS.  
**Rol:** Programador.  
**Estado:** Completado.  
**Resultado:** rutas `/`, `/juego` y `/historial`; build exitoso.

**Problema real:** las últimas versiones de Supabase JS y una librería de pruebas exigían Node.js 22, mientras el entorno local usa Node.js 20.18.  
**Solución:** fijar versiones compatibles de `@supabase/ssr`, `@supabase/supabase-js` y herramientas de pruebas. Las dependencias de producción quedaron sin vulnerabilidades reportadas por `npm audit --omit=dev`.

**Problema real:** ESLint detectó una exportación anónima en PostCSS y el modo estricto bloqueó el comando.  
**Solución:** asignar la configuración a una constante con nombre antes de exportarla.

**Problema real:** `npm audit` completo reporta cinco avisos altos en dependencias transitivas de las herramientas de ESLint de Next.js; la corrección automática propone bajar a una versión mayor anterior e incompatible con el stack elegido.  
**Solución:** verificar por separado `npm audit --omit=dev`, que no reporta vulnerabilidades de producción, documentar el riesgo de desarrollo y evitar `npm audit fix --force` para no romper Next.js 16.

## Bloque 2 — Juego y persistencia local

**Actividad:** separar reglas, selección de palabras, controlador y repositorio.  
**Rol:** Arquitecto / Programador.  
**Estado:** Completado.  
**Resultado:** juego comprobable sin React ni backend; invitados con historial local.

## Bloque 3 — Integración Supabase preparada

**Actividad:** clientes browser/server, refresco de sesión, AuthService, repositorio y migración.  
**Rol:** Programador / Responsable de datos.  
**Estado:** Preparado, pendiente de conexión remota.  
**Resultado:** email y contraseña, sesión persistente por cookies, perfil mínimo, partidas y RLS implementados en código.

**Decisión:** no aplicar la migración a un proyecto no identificado ni inventar credenciales.  
**Resultado:** la aplicación sigue siendo plenamente jugable como invitado.

## Bloque 4 — QA local

**Actividad:** TypeScript, lint, pruebas, build y recorrido de navegador.  
**Rol:** QA.  
**Estado:** Completado.  
**Resultado:** TypeScript, lint y build correctos; 15/15 pruebas; flujo invitado y responsive verificados.

## Siguientes bloques

1. Seleccionar/conectar proyecto Supabase y aplicar migración.
2. Ejecutar QA Auth/Data contra el servicio real.
3. Preparar commits académicos y remoto GitHub.
4. Configurar Vercel y variables.
5. Validar producción y completar evidencias.

## Bloque 5 — Flujo principal y salas cooperativas

**Actividad:** sustituir el login protagonista por nombre temporal, landing de dos acciones y acceso secundario a cuenta, historial y configuración.
**Rol:** UX / Programador.
**Estado:** Implementado y verificado localmente.
**Resultado:** flujo `/` → `/inicio` → crear/entrar → `/sala/[code]`; práctica individual preservada en `/juego`.

**Actividad:** diseñar persistencia de salas, participantes, juegos y palabra privada.
**Rol:** Arquitecto / Responsable de datos.
**Estado:** Implementado en migración, pendiente de aplicación remota.
**Resultado:** estados tipados, RLS por membresía, permisos explícitos, RPC transaccionales, publicación Realtime y secreto en esquema `private`.

**Actividad:** lobby, turnos cooperativos, fin de partida, replay y salida.
**Rol:** Programador.
**Estado:** Implementado.
**Resultado:** anfitrión explícito, teclado condicionado por turno, estado compartido, resultado revelado al finalizar y sala conservada al repetir.

**Problema real:** no existe un proyecto Supabase propio conectado y Docker Desktop no ofrece un motor local disponible.
**Decisión:** no usar el proyecto remoto ajeno visible ni simular salas en `localStorage`, porque rompería la fuente de verdad y expondría la palabra. La UI informa que las salas requieren configuración; onboarding, landing y práctica siguen disponibles.

**QA local:** 34/34 pruebas, TypeScript y lint correctos. La verificación multicliente real continúa pendiente hasta conectar Supabase y aplicar las migraciones.
