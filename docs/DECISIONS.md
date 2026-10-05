# Log de decisiones

## ADR-001 — Migrar el prototipo estático a Next.js sin rediseñar

**Alternativas:** conservar HTML/JS estático; reescribir la experiencia visual; migrar gradualmente reutilizando estilos.

**Decisión:** migración gradual a Next.js con App Router, preservando tokens, clases y comportamiento visual del prototipo.

**Justificación:** el prototipo no cumplía TypeScript, React, pruebas ni la arquitectura solicitada. Reutilizar sus estilos evita un rediseño innecesario.

## ADR-002 — Dominio independiente de React y Supabase

**Alternativas:** colocar las reglas dentro del componente; ejecutar reglas en la base de datos; servicios puros.

**Decisión:** `GameService` y `WordService` son clases TypeScript sin dependencias de infraestructura.

**Justificación:** facilita pruebas, reduce acoplamiento y permite jugar aunque la red falle.

## ADR-003 — Supabase como backend ligero

**Alternativas:** backend propio; Firebase; sólo almacenamiento local; Supabase.

**Decisión:** Supabase para Auth, perfiles e historial; `localStorage` para invitados.

**Justificación:** aporta autenticación y Postgres con infraestructura mínima para el alcance académico. La sesión SSR usa `@supabase/ssr`, siguiendo la documentación vigente.

## ADR-004 — Clave publicable con compatibilidad anon

**Decisión:** priorizar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y aceptar `NEXT_PUBLIC_SUPABASE_ANON_KEY` como respaldo heredado.

**Justificación:** Supabase recomienda claves publicables para proyectos nuevos. Ninguna clave privada se expone al cliente.

## ADR-005 — RLS por propiedad

**Decisión:** perfiles y partidas sólo se consultan o escriben cuando `auth.uid()` coincide con el propietario. Invitados no acceden a tablas.

**Justificación:** evita acceso horizontal entre usuarios. No se utilizan políticas generales con `USING (true)`.

## ADR-006 — Onboarding con invitado primero

**Problema:** la autenticación era el primer paso y añadía fricción antes de jugar.

**Alternativas:** login obligatorio; usuario invitado; login e invitado con igual jerarquía.

**Decisión:** pedir únicamente un nombre generado y editable. Guardarlo en `localStorage`; cuando Supabase está disponible, crear además una sesión Auth anónima. El login tradicional pasa a configuración.

**Justificación:** lleva al usuario a la acción principal con un solo dato, pero conserva una identidad segura (`auth.uid()`) para RLS y futuras conversiones de cuenta.

## ADR-007 — Solo salas privadas con código

**Alternativas:** matchmaking aleatorio; salas privadas; ambas opciones.

**Decisión:** crear y unir únicamente salas privadas mediante un código de cinco caracteres sin `I`, `O`, `0` ni `1`.

**Justificación:** reduce complejidad técnica, evita moderación y mantiene controlada la interacción del ejercicio académico.

## ADR-008 — Estado central y secreto fuera del navegador

**Alternativas:** estado por navegador; sincronización peer-to-peer; estado transaccional en Supabase.

**Decisión:** Supabase Postgres es la fuente de verdad. Todas las mutaciones pasan por RPC; Realtime solo notifica y cada cliente recarga el snapshot autorizado.

**Justificación:** impide dos turnos simultáneos, rechaza letras repetidas en servidor y evita enviar la palabra secreta antes del final. Para el tamaño de una sala académica se eligió Postgres Changes por sencillez; Broadcast queda como opción de escala futura.

## ADR-009 — Salida y transferencia de anfitrión

**Decisión:** al salir un jugador se elimina su membresía. Si era anfitrión, el rol pasa al siguiente participante por orden de ingreso; si la sala queda vacía, se elimina. Una partida en curso mueve el turno si salió el jugador activo.

**Justificación:** evita salas sin control y no introduce pantallas de aprobación o elección de nuevo anfitrión.
