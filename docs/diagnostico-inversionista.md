# Diagnóstico del inversionista

Rama `feat/diagnostico-inversionista` · David (análisis de datos) · 1-oct-2026

## Qué resuelve

Pedido de Paola en el checkpoint del 30-sep:

- **El diagnóstico de la portada no tenía lógica.** Diera lo que diera la persona, salía siempre lo mismo: «82», «Valorización estratégica», «Balanceado».
- **No se guardaba nada.** Ni el diagnóstico ni el formulario de `/solicitud-acceso` enviaban los datos a ningún lado.
- **Había información doble.** El contacto, el objetivo, el capital (en pesos en uno y en dólares en el otro) y el plazo se preguntaban en los dos.
- **Había pasos sin regreso** y el flujo quedaba en loop.

**Ahora hay un solo flujo:** 10 preguntas → lectura parcial → registro → resultado completo. El registro **es** la solicitud de acceso y se guarda en la base. En `/solicitud-acceso` la tarjeta del formulario ahora abre el diagnóstico.

## La lógica (`frontend/lib/diagnostico.ts`)

Se apoya en dos marcos que ya existen:

- **El perfil de riesgo de la Superfinanciera** (conservador / moderado / agresivo). Su regla: el perfil es el **menor entre la tolerancia y la capacidad**.
- **Las estrategias inmobiliarias de la industria** (core, core-plus, value-add, oportunista). Zequara es value-add.

**Los cinco perfiles:**

| Perfil | Equivale a | Para quién |
|---|---|---|
| Patrimonio protegido | Core | Quiere preservar capital, con poco riesgo y horizonte largo |
| Renta estable | Core-plus | Busca un ingreso mensual predecible |
| Renta turística | Core-plus con operación | Quiere renta corta (es lo que pidió Paola) |
| Transformación y valor | Value-add, el modelo Zequara | Compra bajo mercado, remodela y valoriza en 3 a 5 años |
| Oportunidad | Oportunista | Acepta más riesgo por más retorno |

Además hay una etiqueta de **diversificación internacional**, que se suma a cualquier perfil (para quien quiere Panamá o patrimonio fuera del país).

**Cómo se cruzan las respuestas:**

1. **Perfil.** Cada respuesta suma puntos a uno o varios perfiles. El que más suma es el principal y el segundo es la estrategia secundaria. En un empate gana el más cercano al modelo de Zequara.
2. **Riesgo.** Se calcula con la reacción ante una caída del 15 %, el peso de la inversión en el patrimonio, el horizonte y la experiencia. Luego aplican dos reglas:
   - Con menos de 2 años de horizonte, o si vendería ante la caída, el riesgo es conservador.
   - Sin el «compraría más» ante la caída, nunca sale agresivo.
3. **Reglas que pesan más que los puntos.** A un conservador no se le propone «Oportunidad». Con poco horizonte baja «Transformación y valor». Quien eligió renta corta la ve al menos como estrategia secundaria.
4. **Compatibilidad con Zequara (0 a 100), solo para el equipo.** Desde el 2-oct **no se le muestra a la persona**, y tampoco la afinidad ni sus motivos: un «no encaja del todo» desanima a quien todavía puede llegar a invertir. Todo se guarda con la solicitud (columna `compatibilidad`; afinidad y motivos dentro de `resultado`) para priorizar y analizar. En su lugar, la persona ve la **propuesta de su perfil** (`PERFILES[...].propuesta`, «Con tu perfil, podríamos…»). Suma:
   - capital: 35 puntos;
   - horizonte: 20;
   - involucramiento (Zequara opera, así que suma más quien quiere delegar): 20;
   - estrategia: 15;
   - momento: 10.
5. **Capital mínimo: 500 millones** (`CAPITAL_MINIMO`).
   - El proyecto más barato posible cuesta ~$555M todo incluido: 60 m² en Laureles, compra en el p25 con 10 % de descuento y obra de $3,1M/m² (`mercado_referencia.json`).
   - Zequara no es crowdfunding: el inversionista compra el inmueble completo.
   - Por debajo de 500 millones la compatibilidad queda en 40 como máximo (afinidad baja, prioridad baja). A la persona no se le dice: el tema del capital se conversa en la cita.
6. **Moneda.** Una sola lista en pesos, con el equivalente en dólares en cada opción, a la TRM del 1-oct ($3.312,84). Todo se calcula en pesos, la misma unidad de las fichas.
7. **Para el equipo y la plataforma.** Se calcula una `prioridad` interna (alta / media / baja, según capital, momento y horizonte) y unas `etiquetas` (estrategia, riesgo, ticket, ciudades, renta corta) para personalizar los proyectos que se le muestran.

**Distribución.** Recorriendo las 691.200 combinaciones posibles (marcando un mercado), los perfiles salen así: valor 38,9 %, patrimonio 26,3 %, renta 22,8 %, turística 10,8 %, oportunidad 1,2 %.

## Qué cambió

| Dónde | Cambio |
|---|---|
| `frontend/lib/diagnostico.ts` | **Nuevo.** Preguntas, perfiles y lógica, sin dependencias. |
| `frontend/lib/diagnostico.test.mjs` | **Nuevo.** 11 pruebas: `cd frontend && node --test lib/diagnostico.test.mjs` (Node 22.6 o más, sin instalar nada). |
| `frontend/components/DiagnosticoModal.tsx` | Usa la lógica real, con 10 preguntas (una de opción múltiple) y «Anterior» en todos los pasos. El registro se valida, exige consentimiento y se envía a `POST /api/diagnostico`. Si el envío falla, igual muestra el resultado y ofrece reintentar. |
| `frontend/components/DiagnosticoTrigger.tsx` | Nueva propiedad `origen` (portada, solicitud-acceso, evento), que se guarda con cada solicitud. |
| `.../solicitud/SolicitudAccesoScreen.tsx` y `.../responsive/solicitud/SolicitudCompact.tsx` | Se quitó el formulario que no enviaba nada. En su lugar va una tarjeta que abre el diagnóstico. |
| `backend/app/api/diagnostico.py` | **Nuevo.** `POST /api/diagnostico` es público, valida en español y exige consentimiento. `GET /api/admin/diagnostico` lista las solicitudes y exige sesión. |
| `backend/app/main.py` | Monta los dos routers. |
| `database/schema.sql` | Tabla nueva `solicitudes_acceso`, en la sección 7 (idempotente). |
| `database/seguridad.sql` | REVOKE para anon/authenticated y RLS en la tabla nueva: tiene datos personales. |
| `backend/tests/test_auth.py` | Agrega `/api/diagnostico` a `ABIERTAS`, con la explicación de por qué es pública. |
| `backend/tests/test_diagnostico.py` | **Nuevo.** 8 pruebas: sin consentimiento no guarda, mensajes en español, 503 si falta la tabla, listado con sesión. |

## Para desplegar

1. **Correr `database/schema.sql` y `database/seguridad.sql`** en Supabase. Crean la tabla y la protegen. Mientras no se corran, el envío responde 503 («Todavía no podemos registrar solicitudes…») y la persona igual ve su resultado.
2. **Política de privacidad.** El texto de consentimiento remite a la «política de tratamiento de datos», y Paola todavía debe esa política. Cuando exista la página, hay que enlazarla en `CONSENTIMIENTO` (DiagnosticoModal) en lugar de los términos.
3. **Pendiente:** una vista en la consola para ver y gestionar las solicitudes. El endpoint `GET /api/admin/diagnostico` ya existe, y la tabla trae las columnas `estado` y `notas`.

## Cómo se probó

- Backend: 105 pruebas, incluidas las de Jesús.
- Lógica: 11 pruebas.
- Frontend: `tsc` sin errores.
- Recorrido completo en Chrome, en escritorio y celular, contra un backend de prueba local: un perfil value-add y uno de renta turística. Se probaron «Anterior», la validación del registro y que la solicitud llegue al backend con el perfil, el riesgo, la compatibilidad y el contacto.

## Ajustes del 2 de octubre

Después de revisar el diagnóstico con Paola, se hicieron tres cambios (rama `fix/diagnostico-ajustes`):

1. **Ni la compatibilidad ni el «encaje» se le muestran a la persona.** Se quitó el número de la lectura parcial y del resultado, y también la tarjeta de afinidad («se alinea / no encaja del todo») con sus motivos, para no desanimar a nadie. La tarjeta final ahora se llama «Lo que podemos hacer contigo» y muestra la propuesta del perfil (por ejemplo, para «Transformación y valor»: «Con tu perfil, podríamos buscar contigo un inmueble por debajo del precio de su zona, transformarlo con un proyecto de arquitectura y capturar su valorización en 3 a 5 años…»), seguida de «En tu cita la revisamos contigo con proyectos concretos». El número, la afinidad y los motivos se siguen calculando y se guardan con la solicitud para uso interno. Una prueba nueva verifica que las cinco propuestas existan y no digan «encaja», «compatibilidad» ni «no alcanza».
2. **Los botones invitan a agendar una cita**, en vez de «ver el diagnóstico»:
   - lectura parcial: «Quiero agendar mi cita»;
   - registro: el título es «Agenda tu cita con Zequara» y el botón «Enviar mis datos y agendar mi cita»;
   - confirmación: «Recibimos tus datos. Te escribiremos… para agendar tu cita».
3. **Pantalla vacía al terminar (error corregido).** Un doble toque, o un toque mientras la pantalla pasaba a la siguiente pregunta, hacía avanzar dos veces: se saltaba una pregunta, quedaba sin respuesta y al final la lectura parcial salía vacía (solo el fondo, el logo y «Salir»). El segundo caso además podía guardar la respuesta en la pregunta equivocada. Se corrigió así:
   - los toques se ignoran mientras hay un avance en curso;
   - cada toque se guarda en la pregunta que estaba en pantalla;
   - si al final faltara alguna respuesta, se vuelve a esa pregunta en vez de mostrar una pantalla vacía.

   Se reprodujo en Chrome antes de corregirlo y se volvió a probar después: con el doble toque (80 ms) y con el toque durante la animación (350 ms), ahora pasa de la pregunta 1 a la 2 y el final tiene contenido.
