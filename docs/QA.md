# Plan y evidencia de QA

## Automatizado

| Caso | Cobertura | Estado |
|---|---|---|
| QA-AUTH-001 | Registro con nombre, correo y contraseña | Pasa con cliente simulado |
| QA-AUTH-002 | Login correcto | Pasa con cliente simulado |
| QA-AUTH-003 | Login incorrecto | Pasa con cliente simulado |
| QA-AUTH-004 | Recuperar sesión | Pasa con cliente simulado |
| QA-AUTH-005 | Logout | Pasa con cliente simulado |
| QA-GAME-001 | Crear partida | Pasa |
| QA-GAME-002 | Letra correcta | Pasa |
| QA-GAME-003 | Letra incorrecta | Pasa |
| QA-GAME-004 | Letra repetida | Pasa |
| QA-GAME-005 | Victoria | Pasa |
| QA-GAME-006 | Derrota | Pasa |
| QA-DATA-001 | Guardar resultado local | Pasa |
| QA-DATA-002 | Consultar historial local | Pasa |

Comando ejecutado: `npm test`. Resultado actual: 6 archivos y 34 pruebas aprobadas.

### Flujo multijugador (unitario)

| Casos | Cobertura | Estado |
|---|---|---|
| ROOM-001 a ROOM-004 | Generación, normalización y validación del código | Pasa |
| ROOM-005 | Orden visible al incorporar participante | Pasa |
| ROOM-006 | Solo anfitrión y mínimo de jugadores | Pasa |
| ROOM-007 | Contrato de snapshot al iniciar | Pasa |
| ROOM-008 y ROOM-009 | Salida y transferencia de anfitrión | Pasa |
| GAME-MP-001 a GAME-MP-006 | Primer turno, bloqueo, aciertos, errores, rotación y repetición | Pasa |
| GAME-MP-007 a GAME-MP-009 | Victoria, derrota y reinicio conservando sala | Pasa |
| QA-AUTH-006 | Identidad Auth anónima | Pasa con cliente simulado |

También pasan `npm run typecheck`, `npm run lint` y `npm run build`.

`npx supabase db lint --local --level warning` no pudo ejecutarse: no hay Postgres local escuchando en `127.0.0.1:54322`. La migración SQL queda pendiente de lint/aplicación cuando Docker y Supabase local estén disponibles.

## Navegador local

| Caso | Evidencia | Estado |
|---|---|---|
| QA-RESP-001 | 390 × 844, sin desbordamiento horizontal | Pasa |
| QA-RESP-002 | Escritorio, ingreso y tablero renderizados | Pasa |
| Flujo invitado | Ingreso → partida → victoria → historial | Pasa |
| Consola | Sin errores de página ni overlay de Next.js | Pasa |
| Nuevo onboarding | Nombre generado/editable → landing | Pasa |
| Landing móvil | 390 × 844, acciones principales visibles y sin overflow horizontal | Pasa |
| Código inválido | `AB01O` muestra validación amigable y accesible | Pasa |
| Configuración | Nombre, práctica, cuenta e historial visibles | Pasa |
| Backend ausente | Crear sala muestra error controlado, sin crear estado local divergente | Pasa |

## Pendiente con Supabase real

- Registro y confirmación de correo reales.
- Login incorrecto contra Auth real.
- Persistencia de sesión después de recargar.
- RLS entre dos usuarios distintos.
- Inserción y consulta real del historial.
- Aplicar `20261005015931_multiplayer_rooms.sql` en un proyecto propio.
- Abrir dos navegadores con usuarios anónimos distintos y validar ROOM-003, ROOM-005, ROOM-007 y GAME-MP-007/008 de extremo a extremo por Realtime.
- Confirmar transferencia de anfitrión y cierre de sala contra la base real.
- Verificar configuración del proveedor Anonymous Sign-Ins y protección antiabuso antes de producción.

Estos casos no se marcan como completados hasta que exista un proyecto Supabase configurado.
