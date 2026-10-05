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
