import type { ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ADAPTIVE — el interruptor entre el lienzo fijo y la vista fluida.

   Todas las páginas son un <ScaledCanvas> de 1920 px escalado al ancho del
   viewport. En escritorio funciona, pero en un móvil de 390 el factor es 0.20
   y un texto de 16 px acaba midiendo 3: no hay ajuste que valga, hace falta
   maquetación propia.

   El corte va en 1280 px (`xl` de Tailwind). Por debajo manda la vista fluida,
   que cubre móvil y tablet con un solo árbol —una columna abajo, dos a partir
   de 640— y por encima sigue el lienzo de siempre, intacto.

   El cambio es CSS y no JavaScript a propósito: medir el viewport en el
   cliente obliga a apostar por un árbol en el servidor y a fallar la mitad de
   las veces, lo que trae parpadeo al hidratar y deja contenido fuera del HTML
   inicial. Con `display:none` los dos van servidos y resueltos. El coste es
   DOM de más en el árbol que no se ve; sus imágenes van en `lazy`, así que el
   navegador no llega a descargarlas.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Vista fluida: móvil y tablet, por debajo de 1280. */
export function Compact({ children }: { children: ReactNode }) {
  return <div className="xl:hidden">{children}</div>;
}

/** Lienzo fijo de 1920: de 1280 para arriba. */
export function Desk({ children }: { children: ReactNode }) {
  return <div className="hidden xl:block">{children}</div>;
}
