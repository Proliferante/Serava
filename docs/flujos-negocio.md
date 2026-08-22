# Flujos y pantallas

Qué muestra cada pantalla, cómo se encadenan y qué está pintado pero todavía no
funciona. La arquitectura que hay debajo está en [arquitectura.md](arquitectura.md).

Todo el contenido es fijo: no hay API, ni base de datos, ni sesión. Los datos que
se ven (predios, cifras del panel, presupuesto, inquilino) están escritos en los
componentes.

---

## 1. El recorrido

```
                    ┌─────────────── SITIO PÚBLICO ───────────────┐
   /  ── /modelo ── /oportunidades ── /hub          (nav superior)
   │        │              │
   │        └──────────────┴──────────► /solicitud-acceso ──► confirmación (modal)
   │                                                          └─► /solicitud-acceso/confirmacion
   └─────────────────────────────────► /login
                                          │  (submit → router.push)
                    ┌─────────────────────▼───── ÁREA DE PREDIOS ──────────────┐
                    /predios ── /predios/ficha ── /predios/add-value
                        │                              │
                        └──► /predios/mis-propiedades  │ "Reservar ahora"
                                        │              │
                    ┌───────────────────▼──────────────▼──── PANEL ────────────┐
                    /panel  ·  avance · presupuesto · aprobaciones · interventoría
                            ·  operación · fotos · valor · documentos · gestor
```

Las tres píldoras `Predios disponibles · Análisis de valor · Mis propiedades`
son la navegación del área de predios; el sidebar de diez destinos es la del panel.

---

## 2. Sitio público

### `/` — Home

Nueve secciones, de arriba abajo:

| # | Sección | Contenido |
|---|---|---|
| 1 | Hero | Vídeo de fondo (mp4 + webm, con póster de reserva) y la promesa de marca |
| 2 | Criterio de entrada | "Pocas oportunidades. Para pocos." Mapa de Bogotá de fondo y cuatro tarjetas de filtro |
| 3 | Proceso | Timeline de pasos + el CTA **"Compara tu inversión"**, que abre el modal comparativo |
| 4 | Caso real | Tabla año a año (renta, valor, múltiplo) sobre cinco años, con las cifras animadas |
| 5 | "No es crowdfunding" | Franja de diferenciación |
| 7 | Remodelamos | Tarjetas de valor sobre foto de obra |
| 8 | Control de obra | Indicadores financieros + pantallazo del panel real |
| 9 | Mercados | Tarjetas de ciudad y las píldoras "¿Dónde te gustaría invertir?" |
| 10 | Diagnóstico | Entrada al **Diagnóstico Patrimonial** |

No hay sección 6: el diseño la eliminó y los números no se renumeraron.

### `/modelo` — Cómo operamos

Doce secciones en un solo componente de 57 KB
([`ComoOperamosScreen.tsx`](../frontend/components/sections/modelo/ComoOperamosScreen.tsx)),
del hero al cierre: método, zona, inmueble, preacuerdo, obra, renta y salida.
Es la página con más movimiento del sitio —parallax de fondos, órbitas, entradas
encadenadas— y la que mejor muestra el vocabulario de
[`Kinetics`](../frontend/components/motion/Kinetics.tsx).

### `/oportunidades`

Hero, comparador antes/después, ficha de oportunidad de ejemplo, la experiencia
del inversionista y el bloque de acceso al portafolio (con el aro en órbita).

### `/hub`

Contenido editorial: hero con buscador y pestañas (`Todos / Artículos / Videos /
Noticias`) más chips de filtro, artículo destacado, newsletter y una rejilla de
nueve tarjetas.

Las pestañas y los chips **sí tienen estado local** (`useState`), pero no filtran
nada: no hay catálogo detrás.

### Los dos modales del sitio público

- **Comparativa** ([`ComparativaModal.tsx`](../frontend/components/ComparativaModal.tsx)) —
  siete pasos del proceso (elegir zona, encontrar el predio, remodelar, arrendar,
  administrar, medir, salir) enfrentando "por tu cuenta" contra "con Zequara", cada
  uno con su conclusión. Se abre desde la sección 3 de la home.
- **Diagnóstico Patrimonial** ([`DiagnosticoModal.tsx`](../frontend/components/DiagnosticoModal.tsx)) —
  cuestionario de siete preguntas (objetivo, rango de inversión, momento, estrategia,
  riesgo, freno, involucramiento) con barra de progreso, un corte parcial, captura de
  datos y pantalla de resultado. Todo el recorrido es local: **las respuestas no se
  envían a ningún sitio**.

---

## 3. Acceso

### `/solicitud-acceso`

Formulario para pedir entrada al portafolio: hero, los tres pasos del proceso, el
formulario (con selección múltiple de mercados de interés), qué encuentras al
ingresar, y el cierre.

Al enviar **no hay POST**: se abre encima el modal de confirmación
([`ConfirmacionModal.tsx`](../frontend/components/sections/solicitud/ConfirmacionModal.tsx)).
La ruta `/solicitud-acceso/confirmacion` sigue existiendo y sirve la misma tarjeta
a pantalla completa; el modal se prefirió para no perder la página.

### `/login`

Usuario y contraseña (el diseño pasó del enlace por correo a credenciales, que se
envían por correo). El submit sólo comprueba que los campos no estén vacíos y hace
`router.push("/predios")`. **No hay autenticación ni sesión**: cualquiera puede
entrar escribiendo la URL del área privada.

---

## 4. Área de predios

### `/predios` — Predios disponibles

Encabezado sobre degradado oscuro, barra de seis filtros y la rejilla de ocho
oportunidades en 3 + 3 + 2. Los datos están en
[`components/predios/data.ts`](../frontend/components/predios/data.ts), compartidos con la
vista fluida.

Cada tarjeta ([`PredioCard`](../frontend/components/predios/PredioCard.tsx)) lleva:

- **Etiqueta de estado** en cinco tonos, y cada tono dice algo distinto:
  `Disponible` / `Reserva liberada` (verde), `Nueva oportunidad` (dorado),
  `Alta actividad` (ámbar), `En proceso de reserva` (acero), `Reservada` (oscuro).
- **Score Zequara** (85–96) con tooltip explicativo.
- Zona, titular, tipo de transformación, metros, precio, TIR estimada y horizonte.

Los seis filtros están pintados pero **no filtran**: no hay catálogo.

### `/predios/ficha` — Ficha del predio

El detalle de una oportunidad. Cierra con dos acciones:

- **"Ver Análisis Add Value"** → `/predios/add-value`.
- **"Reservar ahora"** → es un `<button>` sin acción. En esta pantalla el botón está
  muerto; el que sí navega es el de Add Value.

### `/predios/add-value` — Análisis de valor

La tesis de valorización del activo: inversión total, arriendo mensual, valor
esperado y ROI estimado, más la cascada de creación de valor. Su **"Reservar ahora"**
sí lleva a `/panel`, que es como se entra al área privada desde el prototipo.

### `/predios/mis-propiedades` — Portafolio del inversionista

Saludo con avatar, resumen en tres tarjetas (con barra de composición y sparkline),
un activo por tarjeta y una sección de "Lo último que revisaste".

Cada [`PropiedadCard`](../frontend/components/predios/PropiedadCard.tsx) cambia de
bloque de métrica según el estado del activo: **en obra** muestra avance con barra;
**arrendado** muestra el canon y el estado del inquilino. Las tarjetas entran al panel.

---

## 5. Panel — el área privada

Diez vistas bajo el mismo marco: sidebar de dos grupos (`Tu obra`, `Tu activo`) y
barra de proyecto con el activo, su estado y las notificaciones. El proyecto por
defecto es **La Cabrera · Bogotá — Apartamento 320 m², en obra, semana 9 de 12**.

### Tu obra

| Vista | Qué muestra | Qué no funciona |
|---|---|---|
| **Resumen** (`/panel`) | Avance general, foto del día, galería reciente, cuatro indicadores y las dos listas de cierre (actividad y documentos) | — |
| **Avance de obra** | Cumplimiento del cronograma, próxima actividad, las seis etapas con su estado y notas por etapa | La caja de notas y su botón están pintados; **no persisten** |
| **Presupuesto** | Presupuesto cerrado, ejecutado y sobrecosto (este en verde sólido), ejecución partida por partida y tabla de hitos de pago | — |
| **Aprobaciones** | Lo que espera decisión, con su impacto en costo, cronograma e interventoría, y el historial de lo ya decidido. Lleva badge `2` en el sidebar | Los botones de aprobar/rechazar no hacen nada |
| **Interventoría** | Los tres conteos de inspección y el registro completo. La observación abierta se marca en tuscany y apunta a Aprobaciones | — |

### Tu activo

| Vista | Qué muestra | Qué no funciona |
|---|---|---|
| **Operación del activo** | El inmueble ya entregado y rentando: estado del arriendo, cuatro indicadores, bitácora con filtros, columna de asamblea / mantenimiento / gestor, estado de cuenta y documentos | Los filtros de la bitácora están pintados pero **no filtran** |
| **Fotos y avance visual** | El comparador antes/después a tamaño completo y la galería por fecha en dos filas de cuatro | — |
| **Proyección de valor** | Cuatro indicadores del activo (con la TIR en verde), score de zona y las tres salidas posibles, más el descargo de responsabilidad | — |
| **Documentos** | El expediente completo en una tarjeta: contrato, cifras, cronograma, planos y estudios, cada uno con estado y descarga | Las descargas no apuntan a ningún archivo |
| **Mi gestor** | Ficha del interlocutor único, próxima reunión e hilo de mensajes | Escribir, agendar y añadir al calendario piden backend |

Es un detalle deliberado del producto que la vista de **Operación** entre con su
propio `meta` y `state` (`Entregado y en operación`, `Arrendado`) en vez del estado
de obra por defecto: es la única que retrata el activo después de la entrega.

### En móvil

El sidebar pasa a un cajón desde la derecha con los mismos diez destinos, más una
barra de pestañas deslizante. Al entrar por primera vez en la sesión sale el
[aviso de pantalla](../frontend/components/responsive/AvisoPantalla.tsx): informa de que
el panel está completo también ahí, y que desde un computador se ve en menos
desplazamientos. Es sólo informativo —no cambia ninguna configuración— y aparece
una vez por sesión, por debajo de 1024 px.

---

## 6. Resumen de lo que está pintado y no opera

| Dónde | Qué |
|---|---|
| `/login` | No autentica: entra directo a `/predios` |
| `/solicitud-acceso` | No envía el formulario |
| Diagnóstico Patrimonial | No envía las respuestas ni los datos de contacto |
| `/hub` | Buscador, pestañas y chips no filtran |
| `/predios` | Los seis filtros y "Limpiar filtros" no filtran |
| `/predios/ficha` | "Reservar ahora" no hace nada |
| `/panel/avance` | Las notas por etapa no persisten |
| `/panel/aprobaciones` | Aprobar/rechazar no hace nada |
| `/panel/operacion` | Los filtros de la bitácora no filtran |
| `/panel/documentos` y descargas en general | No hay archivos detrás |
| `/panel/gestor` | Escribir, agendar y calendario piden backend |

El inventario con archivo y línea, y lo que haría falta del lado servidor, está en
[api-reference.md](api-reference.md).
