import Image from "next/image";
import type { CSSProperties } from "react";

/** Ancho del lienzo de diseño. El mismo que usa `ScaledCanvas`. */
const CANVAS_W = 1920;

/**
 * Foto del lienzo servida por `next/image`.
 *
 * Rellena la caja posicionada que la envuelve, así que sustituye tal cual a un
 * `<img className="absolute inset-0 size-full object-cover">`: la geometría la
 * sigue poniendo el padre y no hay que tocar el encuadre.
 *
 * `w` es el ancho **en píxeles del lienzo** de esa caja, y es el único dato que
 * hay que acertar. `ScaledCanvas` escala el lienzo entero al ancho del
 * viewport, de modo que una caja de `w` px del lienzo ocupa siempre `w / 1920`
 * del viewport, en cualquier pantalla. Eso hace que aquí `sizes` sea exacto y
 * no una estimación, como pasaría en un layout normal.
 *
 * Importa acertarlo porque, sin `sizes`, `next/image` supone `100vw` y pide la
 * imagen a resolución completa — exactamente lo que hacíamos con `<img>`, con
 * lo que la migración no serviría de nada.
 */
export default function CanvasImage({
  src,
  w,
  alt = "",
  className = "",
  style,
  quality,
  priority = false,
}: {
  src: string;
  /** Ancho de la caja contenedora, en píxeles del lienzo de 1920. */
  w: number;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  quality?: number;
  /** Para la imagen visible al cargar: la descarga sin esperar y sin `lazy`. */
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={`${((w / CANVAS_W) * 100).toFixed(2)}vw`}
      quality={quality}
      priority={priority}
      /* `max-w-none` porque el CSS base limita las imágenes al ancho del padre
         y aquí el encuadre a veces se sale a propósito. */
      className={`max-w-none object-cover ${className}`}
      style={style}
      draggable={false}
    />
  );
}
