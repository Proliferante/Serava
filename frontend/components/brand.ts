/* ═══════════════════════════════════════════════════════════════════════════
   MARCA ZEQUARA — los dos logotipos y cuándo va cada uno.

   · ZEQUARA-01 es el wordmark completo `.zequara.`  → la marca en grande:
     hero, cierres de sección, footer.
   · ZEQUARA-02 es el monograma (la Z ligada a la Q) → headers y cualquier
     aparición pequeña: navs, sidebar del panel, cabecera de modales.

   A los dos SVG se les ajustó el `viewBox` al contorno real del dibujo. Tal
   como salieron de Figma tenían mucho aire alrededor —el monograma sólo
   ocupaba el 41 % del ancho de su lienzo—, así que en una caja del tamaño de
   un header se dibujaba diminuto y descentrado. Los trazos no se tocaron.

   Los dos salieron de Figma sin `fill`, o sea negros. Se les puso el crema
   #e5dccf en la raíz del SVG —el mismo que traían los logotipos anteriores—
   porque las doce ubicaciones van sobre fondo oscuro. Al cargarse con `<img>`
   el color queda dentro del archivo y no se puede cambiar desde CSS: si algún
   día hace falta la marca oscura sobre fondo claro, toca pintarla con
   `mask-image` en vez de `<img>`, o guardar una segunda copia.

   Si se vuelven a exportar desde Figma hay que repetir el ajuste del viewBox y
   el del color, o las proporciones de abajo dejan de valer y saldrán negros.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Token de caché. Los SVG se editaron conservando el nombre, así que el
 * navegador seguía sirviendo la copia vieja —negra y con el viewBox flojo—
 * de la memoria. Subir este número al retocar un logotipo fuerza la recarga.
 */
const V = "2";

/** Wordmark completo. Sólo para presentaciones grandes de la marca. */
export const WORDMARK = `/figma/ZEQUARA-01.svg?v=${V}`;
/** Monograma. Para headers y presentaciones pequeñas. */
export const MARK = `/figma/ZEQUARA-02.svg?v=${V}`;

/** Proporción ancho/alto del wordmark, para dimensionar su caja sin deformarlo. */
export const WORDMARK_RATIO = 6.116;
/** Proporción ancho/alto del monograma: es casi cuadrado. */
export const MARK_RATIO = 1.096;

/** Ancho que le corresponde al wordmark para un alto dado. */
export const wordmarkW = (h: number) => +(h * WORDMARK_RATIO).toFixed(2);
/** Alto que le corresponde al wordmark para un ancho dado. */
export const wordmarkH = (w: number) => +(w / WORDMARK_RATIO).toFixed(2);
/** Ancho que le corresponde al monograma para un alto dado. */
export const markW = (h: number) => +(h * MARK_RATIO).toFixed(2);
