# Arquitectura del frontend

Documentación del código de [`frontend/`](../frontend). Es la única parte del
repositorio con implementación; el estado del resto está en el
[README](../README.md) y en [api-reference.md](api-reference.md).

---

## 1. Stack

| | |
|---|---|
| Framework | Next.js **14.2.5**, App Router, `reactStrictMode` |
| UI | React 18.3 |
| Lenguaje | TypeScript 5.5, `strict: true`, alias `@/*` → raíz de `frontend/` |
| Estilos | Tailwind 3.4 + un `globals.css` de 473 líneas para las micro-interacciones |
| Movimiento | framer-motion 12 |
| Imágenes | `next/image` + `sharp`, salida AVIF → WebP |
| Tipografía | Poppins vía `next/font/google`, pesos 200–900, expuesta como `--font-poppins` |

No hay tests, ni configuración de ESLint propia (sólo el `next lint` por defecto),
ni gestión de estado global, ni cliente HTTP: [`lib/api.ts`](../frontend/lib/api.ts)
existe pero está vacío.

Volumen: 118 archivos `.ts/.tsx/.css`, 16 778 líneas. El reparto dice bastante del
proyecto:

| Carpeta | Líneas |
|---|---|
| `components/sections/` (lienzo fijo) | 5 952 |
| `components/responsive/` (vista fluida) | 5 721 |
| `components/predios/` | 1 293 |
| `components/panel/` | 1 118 |
| `components/*.tsx` (raíz: modales, Navbar, primitivas) | 1 039 |
| `app/` | 674 |
| `components/motion/` | 508 |
| `styles/globals.css` | 473 |

Las dos primeras son casi iguales de grandes, y eso es la decisión central de la
arquitectura.

---

## 2. La decisión central: dos árboles, un contenido

El diseño llega de Figma como frames de **1920 px de ancho** medidos al píxel. La
reproducción es literal: casi todo va en posición absoluta con las coordenadas
del diseño.

Eso funciona en escritorio y se rompe en móvil, así que hay **dos árboles
distintos** para el mismo contenido, y un interruptor entre ellos.

### 2.1 `ScaledCanvas` — el lienzo fijo

[`components/ScaledCanvas.tsx`](../frontend/components/ScaledCanvas.tsx)

Pinta una caja de `width × height` en píxeles de diseño y la escala con
`transform: scale()` al ancho disponible. El resultado es idéntico al frame de
Figma en cualquier pantalla, sólo que más grande o más pequeño.

Dos detalles que importan:

- El envoltorio reserva su altura con `aspect-ratio`, sin JavaScript, así que la
  página no salta mientras se mide.
- El contenido escalado arranca con `opacity: 0` y aparece cuando ya hay factor
  de escala. Sin eso se veía un fogonazo: primero a escala 1 y luego encogido de
  golpe.

La medida va con `ResizeObserver` y `useLayoutEffect` en cliente
(`useEffect` en servidor, para no avisar de hidratación).

### 2.2 `Adaptive` — el interruptor

[`components/responsive/Adaptive.tsx`](../frontend/components/responsive/Adaptive.tsx)

```tsx
<Compact><HomeCompact /></Compact>   {/* xl:hidden        → < 1280 px */}
<Desk><ScaledCanvas …>…</ScaledCanvas></Desk>   {/* hidden xl:block → ≥ 1280 px */}
```

El corte está en **1280 px** (`xl` de Tailwind). Por debajo, el factor de escala
del lienzo sería 0,20 en un móvil de 390 y un texto de 16 px acabaría midiendo 3.

El cambio es **CSS y no JavaScript** a propósito: medir el viewport en el cliente
obliga a apostar por un árbol en el servidor y a fallar la mitad de las veces
—parpadeo al hidratar y contenido fuera del HTML inicial—. Con `display:none` los
dos van servidos. El coste es DOM de más en el árbol invisible; sus imágenes van
en `lazy`, así que no se descargan.

### 2.3 `CanvasImage` — imágenes dentro del lienzo

[`components/CanvasImage.tsx`](../frontend/components/CanvasImage.tsx)

Envuelve `next/image` en modo `fill` y calcula `sizes` exacto:

```
sizes = (w / 1920) * 100 vw
```

Funciona porque el lienzo entero se escala al viewport: una caja de `w` px del
lienzo ocupa **siempre** `w/1920` del ancho de pantalla, en cualquier dispositivo.
Es el raro caso en que `sizes` no es una estimación.

El parámetro `w` es lo único que hay que acertar: es el ancho **en píxeles del
lienzo** de la caja contenedora. Sin `sizes`, `next/image` supone `100vw` y pide
la imagen a resolución completa, con lo que la migración no serviría de nada.

**Cuándo `fill` no vale:** cuando el diseño estira la imagen por encima del ancho
de su caja (torres decorativas de `/predios`, fondo de la sección 9). `fill` fija
el ancho en línea y gana al CSS; en esos casos hay que usar `width`/`height`
normales, que Next escribe como atributos y el CSS sí puede pisar. Los dos casos
están comentados en el código.

---

## 3. Rutas

21 rutas, todas estáticas. Cada `page.tsx` es un server component que sólo
compone: elige el `Compact`, monta el `ScaledCanvas` con las medidas del frame y
coloca las secciones. La lógica no vive ahí.

### Público

| Ruta | Lienzo (px) | Vista de escritorio | Vista fluida |
|---|---|---|---|
| `/` | 1920 × 9539 | `sections/Section1Hero` … `Section10Diagnostico` + `Footer` | `responsive/home/HomeCompact` |
| `/modelo` | 1920 × 9717 | `sections/modelo/ComoOperamosScreen` (12 secciones) | `responsive/modelo/ModeloCompact` |
| `/oportunidades` | 1920 × 5701 | `sections/oportunidades/OportunidadesScreen` | `responsive/oportunidades/OportunidadesCompact` |
| `/hub` | 1920 × 3827 | `sections/hub/*` | `responsive/hub/HubCompact` |
| `/login` | 1920 × 1045 | `sections/login/LoginScreen` | `responsive/login/LoginCompact` |
| `/solicitud-acceso` | 1920 × 4470 | `sections/solicitud/SolicitudAccesoScreen` | `responsive/solicitud/SolicitudCompact` |
| `/solicitud-acceso/confirmacion` | 1920 × 1200 | `sections/solicitud/ConfirmacionAccesoScreen` | — *(sin vista fluida)* |

La home apila las secciones por coordenadas absolutas respetando el **orden de
pintado del diseño**, que no es el orden vertical: la sección 7 se monta antes
que la 5 porque en Figma se solapan así. No existe una `Section6`: el diseño la
eliminó y los números no se renumeraron.

### Área de predios

| Ruta | Lienzo (px) | Escritorio | Fluida |
|---|---|---|---|
| `/predios` | 1920 × 2850 | la propia página + `predios/PredioCard` | `responsive/predios/PrediosCompact` |
| `/predios/ficha` | 1920 × 2287 | `predios/FichaPredio` | `responsive/predios/FichaCompact` |
| `/predios/add-value` | 1920 × 2805 | `predios/AddValue` | `responsive/predios/AddValueCompact` |
| `/predios/mis-propiedades` | 1920 × 1813,32 | `sections/predios/MisPropiedadesScreen` | `responsive/predios/MisPropiedadesCompact` |

### Panel (área privada)

Diez vistas, todas montadas por el mismo envoltorio
[`components/panel/PanelPage.tsx`](../frontend/components/panel/PanelPage.tsx):

```tsx
<PanelPage active="avance" h={AVANCE_H} compact={<AvanceCompact />}>
  <AvanceScreen />
</PanelPage>
```

| Ruta | `PanelKey` | Alto del lienzo | Pantalla |
|---|---|---|---|
| `/panel` | `resumen` | 1382 | `panel/ResumenScreen` |
| `/panel/avance` | `avance` | 2169 | `panel/AvanceScreen` |
| `/panel/presupuesto` | `presupuesto` | 1200 | `panel/PresupuestoScreen` |
| `/panel/aprobaciones` | `aprobaciones` | 1110 | `panel/AprobacionesScreen` |
| `/panel/interventoria` | `interventoria` | 1200 | `panel/InterventoriaScreen` |
| `/panel/operacion` | `operacion` | 2299 | `panel/OperacionScreen` |
| `/panel/fotos` | `fotos` | 1881 | `panel/FotosScreen` |
| `/panel/valor` | `valor` | 1200 | `panel/ValorScreen` |
| `/panel/documentos` | `documentos` | 1200 | `panel/DocumentosScreen` |
| `/panel/gestor` | `gestor` | 1200 | `panel/GestorScreen` |

Cada pantalla exporta su altura (`export const AVANCE_H = 2169`) y la página se la
pasa al envoltorio. El ancho útil dentro del marco es siempre **1604 px**
(1920 − 248 de sidebar − 34 × 2 de margen).

A diferencia de la web pública, el panel **no lleva `Navbar` ni `Footer`**: la
navegación es el sidebar (o el cajón, en móvil) y el área privada no tiene pie.

---

## 4. Las capas de componentes

```
app/**/page.tsx            composición: elige árbol, mide el lienzo, coloca secciones
│
├── components/sections/**     ─┐
├── components/predios/**       ├─ ÁRBOL DE ESCRITORIO (posición absoluta, px de Figma)
├── components/panel/**        ─┘
│
└── components/responsive/**   ─── ÁRBOL FLUIDO (apilado, clamp(), sin coordenadas)
```

### 4.1 Piezas compartidas por los dos árboles

| Archivo | Qué hace |
|---|---|
| [`components/brand.ts`](../frontend/components/brand.ts) | Los dos logotipos (wordmark `.zequara.` y monograma), sus proporciones, y `tinted()` para repintarlos con `mask-image` |
| [`components/PageTransition.tsx`](../frontend/components/PageTransition.tsx) | Fundido global entre rutas; envuelve la app en el layout raíz |
| [`components/Navbar.tsx`](../frontend/components/Navbar.tsx) | Barra marrón de 1920 × 173 del sitio público (sólo escritorio) |
| [`components/ScaledCanvas.tsx`](../frontend/components/ScaledCanvas.tsx), [`CanvasImage.tsx`](../frontend/components/CanvasImage.tsx) | Ver §2 |
| [`components/ComparativaModal.tsx`](../frontend/components/ComparativaModal.tsx) | "Por tu cuenta vs. con Zequara": 7 pasos comparados, en portal |
| [`components/DiagnosticoModal.tsx`](../frontend/components/DiagnosticoModal.tsx) | Diagnóstico patrimonial: cuestionario de 7 preguntas con barra de progreso, captura de datos y resultado |
| [`components/CompararButton.tsx`](../frontend/components/CompararButton.tsx), [`DiagnosticoTrigger.tsx`](../frontend/components/DiagnosticoTrigger.tsx) | Los disparadores de esos dos modales |
| [`components/predios/data.ts`](../frontend/components/predios/data.ts) | Los 8 predios y los 6 filtros. Vive aparte **porque lo pintan los dos árboles** |

### 4.2 `components/panel/` — el área privada en escritorio

- [`Shell.tsx`](../frontend/components/panel/Shell.tsx) — el marco: sidebar de 248 px
  con dos grupos (`Tu obra`, `Tu activo`) y diez destinos, barra de proyecto de
  74,95 px, fondo de silueta de ciudad al 60 %, y el hueco de contenido de 1604 px.
  Exporta `SIDEBAR_W`, `TOPBAR_H`, `PAD`, `VIEW_W` y el tipo `PanelKey`.
- [`ui.tsx`](../frontend/components/panel/ui.tsx) — la paleta del panel y ~25
  primitivas posicionadas al píxel: `Card`, `Bar`, `Ring`, `Pill`, `Tag`, `Btn`,
  `StatCard`, `DocRow`, `CheckRow`, `Photo`, `ViewTitle`, `Eyebrow`…
- [`icons.tsx`](../frontend/components/panel/icons.tsx) — 27 iconos dibujados a mano
  (trazo 1,7 sobre rejilla 24) porque en Figma llegan como instancias ilegibles.
  `Ico` normaliza tamaño y hereda `currentColor`.
- [`BeforeAfter.tsx`](../frontend/components/panel/BeforeAfter.tsx) — comparador
  arrastrable. El recorte usa `clip-path: inset()` en **porcentaje**, no en píxeles,
  porque el lienzo va escalado y los porcentajes sobreviven al `transform`. El
  arrastre se escucha en `window` para que el puntero pueda salirse. Tiene
  `role="slider"` con teclado (flechas, Home/End).

### 4.3 `components/responsive/` — la vista fluida

Espeja la estructura anterior:

| Archivo | Papel |
|---|---|
| [`kit.tsx`](../frontend/components/responsive/kit.tsx) | Primitivas del sitio público fluido: `In`, `Eyebrow`, `H2`, `P`, `CTA`, `Words`, `Timeline`, `Step`, `Card`, `CheckList`, `Parallax`, `Reveal`. Columna de lectura `WRAP` (máx. 720 px) |
| [`panel/kit.tsx`](../frontend/components/responsive/panel/kit.tsx) | Las mismas piezas del panel pero apiladas: `PCard`, `PBar`, `PRing`, `PStat`, `PTag`, `PBtn`, `PDocRow`, `PCheckRow`, `PFoto`, `PTabla`. **Reutiliza los tokens de color de `panel/ui.tsx`**, así que una tarjeta de aquí y una de allí se ven iguales |
| [`MobileNav.tsx`](../frontend/components/responsive/MobileNav.tsx) | Barra sticky + cajón a pantalla completa. Se retira al bajar y vuelve al subir (umbral de 8 px contra el rebote; nunca se esconde por debajo de 120 px de scroll) |
| [`MobileFooter.tsx`](../frontend/components/responsive/MobileFooter.tsx) | Pie apilado: cada enlace ocupa una fila de 52 px y las acciones de cuenta suben a botones |
| [`predios/PrediosShell.tsx`](../frontend/components/responsive/predios/PrediosShell.tsx) | Cabecera del área de predios en dos filas, con la fila de píldoras deslizable y la activa siempre a la vista |
| [`panel/PanelShellCompact.tsx`](../frontend/components/responsive/panel/PanelShellCompact.tsx) | El sidebar convertido en cajón, con los mismos dos grupos y diez destinos, más una barra de pestañas deslizante |
| [`BeforeAfterTouch.tsx`](../frontend/components/responsive/BeforeAfterTouch.tsx) | Comparador para dedo: un `<input type="range">` transparente estirado sobre la foto. El navegador ya da arrastre, teclado y lectura por voz |
| [`AvisoPantalla.tsx`](../frontend/components/responsive/AvisoPantalla.tsx) | Aviso informativo al entrar al panel desde móvil. Una vez por sesión (`sessionStorage`, no `localStorage`) y sólo por debajo de 1024 px |

El detalle recurrente del árbol fluido: **no es un volcado del escritorio**. El pie
convierte enlaces en filas tocables, el nav convierte cuatro enlaces sueltos en un
cajón, el comparador cambia de mecanismo. Los comentarios de cada archivo explican
por qué en cada caso.

---

## 5. Sistema de diseño

### 5.1 Tokens

Tres sitios, por orden de alcance:

1. **[`tailwind.config.ts`](../frontend/tailwind.config.ts)** — los colores de marca
   disponibles como utilidades: `cream #e2cdae`, `cream-93 #f7f1e5`,
   `sand #dfc59f`, `tan #c59f72`, `brown-dark #492100`, `brown-48 #a57a4e`,
   `olive #9aa66f`.
2. **[`components/panel/ui.tsx`](../frontend/components/panel/ui.tsx)** — la paleta del
   área privada, como constantes TS: `SHELL`, `OIL`, `PAPER`, `CARD`, `LINE`,
   `INK`, `MUTED`, `DRIFT`, `LASER`, `VERD`, `AVOCADO`, `TUSCANY`, `TRACK`,
   `LINEN` (+ variantes alfa), más los degradados `BAR_FILL`, `GREEN_CARD`,
   `PHOTO_BG`.
3. **[`components/responsive/kit.tsx`](../frontend/components/responsive/kit.tsx)** — el
   subconjunto que usa la vista fluida pública.

Fuera de eso hay bastante color literal en línea, porque viene copiado del design
context de Figma junto a la geometría.

### 5.2 La marca

[`components/brand.ts`](../frontend/components/brand.ts) merece leerse entero. Lo
esencial:

- **`WORDMARK`** (`ZEQUARA-01.svg`) es la marca en grande: hero, cierres, footer.
  **`MARK`** (`ZEQUARA-02.svg`) es el monograma: navs, sidebar, cabeceras de modal.
- A los dos SVG se les ajustó el `viewBox` al contorno real; tal como salieron de
  Figma el monograma ocupaba el 41 % de su lienzo y se dibujaba diminuto.
- Llevan el crema `#e5dccf` **dentro del archivo**, porque las doce ubicaciones van
  sobre fondo oscuro. Cargados con `<img>` ese color no se puede cambiar desde CSS.
  Para pintarlos de otro color está `tinted()`, que usa `mask-image` y saca el color
  de `backgroundColor` (así lo hace Mis propiedades, la única pantalla del área con
  fondo claro).
- Hay un **token de caché** `V = "2"` en la URL: los SVG se editaron conservando el
  nombre y el navegador seguía sirviendo la copia vieja. Si se vuelve a exportar
  desde Figma hay que repetir el ajuste de viewBox y de color **y subir `V`**.

### 5.3 Tipografía

Poppins con nueve pesos, cargada por `next/font/google` con `display: swap`. Todo
el sitio la usa vía `font-sans`.

---

## 6. Movimiento

### 6.1 El vocabulario

[`components/motion/Kinetics.tsx`](../frontend/components/motion/Kinetics.tsx) es la
referencia. Lo usan las páginas de lienzo grandes (Cómo operamos, Oportunidades):

| Helper | Efecto |
|---|---|
| `Rise` | Sube y aparece al entrar en viewport. La base de casi todo |
| `MLine` | Línea de titular con máscara: el texto sube desde fuera de su caja. El relleno vertical (compensado con margen negativo) deja sitio a las ascendentes de Poppins, que sobresalen ~0,35 em |
| `Pop` | Aparición con sobreimpulso: iconos, puntos, badges |
| `Rule` / `Draw` | Filete horizontal / línea vertical que se trazan |
| `Bloom` | Contorno decorativo que escala desde dentro |
| `useParallaxY` | `y` suavizado ligado al scroll, para el interior de cajas recortadas |
| `Float` | Flotación vertical en bucle |
| `Orbit` | Giro perpetuo sobre un contorno **elíptico** sin deformarlo |

`Orbit` es el truco menos evidente y está explicado a fondo en el archivo: girar una
elipse la hace bailar porque sus semiejes no miden lo mismo (21 px de desvío visible
en el aro de Oportunidades). La solución es meter la rotación entre dos escalas
inversas —la de dentro convierte la elipse en círculo, que sí es invariante al giro,
y la de fuera lo devuelve a óvalo—, con las tres capas compartiendo el mismo
`transform-origin` en el centro de la elipse.

Otros helpers, más antiguos y de uso puntual:
[`Reveal.tsx`](../frontend/components/motion/Reveal.tsx) (`RevealLayer` para capas
absolutas de la home), [`CountUp.tsx`](../frontend/components/motion/CountUp.tsx)
(cifras que suben de 0, con formato es-CO),
[`GrowBar.tsx`](../frontend/components/motion/GrowBar.tsx),
[`DrawLine.tsx`](../frontend/components/motion/DrawLine.tsx),
[`Section3Timeline.tsx`](../frontend/components/motion/Section3Timeline.tsx).

### 6.2 Reglas

- **Sólo `transform` y `opacity`.** El lienzo mide 1920 px y se escala; animar
  layout o filtros sobre áreas así provoca tirones.
- **`EASE = [0.22, 1, 0.36, 1]`** en todas partes. Está redeclarada en varios
  archivos (Kinetics, los dos kits, los modales, las tarjetas) con el mismo valor.
- **`prefers-reduced-motion` por dos vías**: las páginas grandes van envueltas en
  `<MotionConfig reducedMotion="user">`, los helpers con bucle infinito comprueban
  `useReducedMotion()` directamente, y lo que se anima desde CSS se apaga en los dos
  bloques `@media (prefers-reduced-motion: reduce)` del final de `globals.css`.

---

## 7. `globals.css`

473 líneas, casi todas micro-interacciones reutilizables. Existe para que una
sección pueda tener hover sin convertirse en client component.

Dos familias de nombres:

**`.ix-*` — sitio público y área de predios**

| Clase | Efecto |
|---|---|
| `.ix-press` | Escala al pasar y se hunde al pulsar |
| `.ix-nav` | Baja la opacidad (logotipos, enlaces de marca) |
| `.ix-lift` | Se eleva con sombra (tarjetas) |
| `.ix-chip`, `.ix-pill` | Chips y píldoras de navegación; `.ix-pill[aria-current="page"]` pinta la activa en olivo |
| `.ix-navlink` | Enlace de nav: arena → verde olivo |
| `.ix-invert`, `.ix-invert-w`, `.ix-fill`, `.ix-reserve` | Las cuatro variantes de botón del diseño |
| `.ix-pulse*`, `.ix-live` | Pulsos de atención y punto de estado en vivo |
| `.ix-cta`, `.ix-cta-circle`, `.ix-cta-arrow`, `.ix-cta-shine` | El CTA grande "Compara tu inversión": pulso, barrido de luz, círculo que crece y flecha que dispara |
| `.ix-card`, `.ix-card-ico`, `.ix-row`, `.ix-zoom`, `.ix-thumb` | Tarjetas de contenido y sus partes |
| `.ix-breathe`, `.ix-sway`, `.ix-orbit` | Bucles perpetuos (halo del comparador, pista de arrastre, órbita) |
| `.ix-prop*`, `.ix-tip*` | Tarjeta de propiedad y tooltip del Score Zequara |
| `.ix-field`, `.ba-range` | Campos de formulario y el mando del comparador táctil |

**`.pnl-*` — panel**: `.pnl-card`, `.pnl-btn`, `.pnl-nav`, `.pnl-navitem`,
`.pnl-link-arrow`, `.pnl-photo-img`, `.pnl-input`, `.pnl-ba-handle`, `.pnl-fchip`.

Y `.ix-compact` / `.ix-desk`, que marcan los dos árboles de `Adaptive`.

Por qué CSS y no estilos en línea: **un estilo en línea gana a cualquier clase**, así
que una regla `:hover` no podría pisarlo. Está anotado en `PrediosNav`.

---

## 8. Rendimiento

[`next.config.js`](../frontend/next.config.js) concentra lo que se hizo, con el
razonamiento en comentarios:

- **`images.formats: ["image/avif", "image/webp"]`.** Las fotos ya eran WebP, así que
  el formato aporta poco por sí solo; lo que baja el peso de verdad es que
  `next/image` sirva la variante del tamaño al que se pinta — de ahí `CanvasImage`.
- **Cabeceras de caché.** `/figma/*` va con `max-age=31536000, immutable` porque los
  nombres llevan hash de contenido. `/antes-despues/*` tiene nombres estables, así
  que va una semana con `stale-while-revalidate`.
- **`optimizePackageImports: ["framer-motion"]`**, que se importa como barrel.
- El árbol oculto de `Adaptive` carga sus imágenes en `lazy`, así que el navegador
  no llega a descargarlas.

El historial recoge además la limpieza de 5,8 MB de imágenes sin usar y la migración
de los diez fondos más pesados a `next/image`.

---

## 9. Accesibilidad

- **Zoom abierto.** El `viewport` de [`app/layout.tsx`](../frontend/app/layout.tsx) se
  declara explícito para no poner `maximumScale`: en un sitio con tanto texto pequeño
  es la diferencia entre poder leerlo o no. De paso fija el `themeColor` al marrón.
- **Los dos comparadores** tienen `role="slider"` con `aria-valuenow`/`aria-valuetext`
  y control por teclado; el táctil delega en un `<input type="range">` real.
- **Los modales** (`ComparativaModal`, `DiagnosticoModal`, `AvisoPantalla`,
  `ConfirmacionModal`) van en portal, con `role="dialog"`, `aria-modal`,
  `aria-labelledby`, cierre con Escape y bloqueo del scroll del body.
- **Navegación** con `aria-current="page"` en sidebar y píldoras.
- **Logotipos**: `<img alt>` cuando se cargan como imagen; `role="img"` +
  `aria-label` cuando se pintan con máscara (una máscara no tiene `alt`).
- **`prefers-reduced-motion`** cubierto en las tres vías descritas en §6.2.

---

## 10. Convenciones y trampas conocidas

Cosas que ya costaron una vez y están anotadas en el código:

1. **Las coordenadas van literales, no calculadas.** En
   [`app/predios/page.tsx`](../frontend/app/predios/page.tsx) las filas y columnas de
   la rejilla son números escritos a mano y no `CARD_H + gap`: `PredioCard` es un
   client component y las constantes que exporta llegan al server component como
   referencia, no como número — al operar con ellas sale `NaN`.
2. **`fill` de `next/image` no sirve si el diseño estira la imagen** más allá de su
   caja: fija el ancho en línea y gana al CSS. Usar `width`/`height`.
3. **Recortes en porcentaje, no en píxeles**, dentro del lienzo escalado
   (`clip-path: inset(0 X% 0 0)`), porque los porcentajes sobreviven al `transform`.
4. **Los nombres de capa de Figma mienten.** En el header, "HUB" o "MODELO BTN" son
   instancias con override de texto; las etiquetas reales salen del render.
5. **El orden de pintado no es el orden vertical.** Varias secciones se solapan a
   propósito (la 7 antes que la 5 en la home; la 3 después de la 4 en Solicitud).
6. **Capas que en Figma quedan fuera del frame se conservan en el código** con su
   geometría real (la torre izquierda de `/predios` cae en x = −624). Se documentan
   en vez de borrarse, porque son capas del diseño.
7. **Al editar un SVG conservando el nombre, subir `V` en `brand.ts`** o el navegador
   sirve la copia vieja.
8. **No lanzar `next build` con el `dev` vivo**: comparten `.next`.

---

## 11. Cómo añadir una pantalla nueva

1. Exporta la pantalla de escritorio en `components/sections/…` con las coordenadas
   del frame, y si es del panel exporta también su alto (`export const X_H = …`).
2. Escribe la vista fluida en `components/responsive/…` usando `kit.tsx` (público) o
   `responsive/panel/kit.tsx` (panel). No traduzcas la geometría: repiensa la pieza
   para una columna.
3. Crea `app/…/page.tsx` con `<Compact>` + `<Desk>`, o con `<PanelPage>` si es del
   área privada.
4. Si es del panel, añade el destino en los **dos** sitios donde vive la navegación:
   `GROUPS` en [`panel/Shell.tsx`](../frontend/components/panel/Shell.tsx) y `GRUPOS` en
   [`responsive/panel/PanelShellCompact.tsx`](../frontend/components/responsive/panel/PanelShellCompact.tsx),
   más la clave en el tipo `PanelKey`.
5. Las fotos, con `CanvasImage` y el `w` correcto (§2.3).

---

## 12. Deuda y siguientes pasos

- **No hay capa de datos.** Todo el contenido está escrito en los componentes. Lo
  único extraído a un módulo es [`predios/data.ts`](../frontend/components/predios/data.ts),
  y sólo porque lo comparten los dos árboles. El resto habría que sacarlo antes de
  conectar una API.
- **Duplicación estructural entre árboles.** Es deliberada y está justificada, pero
  significa que cada cambio de contenido se toca dos veces. El patrón de `data.ts`
  es la salida natural.
- **`lib/api.ts` está vacío** y no hay cliente HTTP ni manejo de errores/carga.
- **Sin tests ni CI.**
- **Los formularios no envían nada.** Ver [api-reference.md](api-reference.md).
