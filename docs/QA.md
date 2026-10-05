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

Comando ejecutado: `npm test`. Resultado: 4 archivos y 15 pruebas aprobadas.

## Navegador local

| Caso | Evidencia | Estado |
|---|---|---|
| QA-RESP-001 | 390 × 844, sin desbordamiento horizontal | Pasa |
| QA-RESP-002 | Escritorio, ingreso y tablero renderizados | Pasa |
| Flujo invitado | Ingreso → partida → victoria → historial | Pasa |
| Consola | Sin errores de página ni overlay de Next.js | Pasa |

## Pendiente con Supabase real

- Registro y confirmación de correo reales.
- Login incorrecto contra Auth real.
- Persistencia de sesión después de recargar.
- RLS entre dos usuarios distintos.
- Inserción y consulta real del historial.

Estos casos no se marcan como completados hasta que exista un proyecto Supabase configurado.
