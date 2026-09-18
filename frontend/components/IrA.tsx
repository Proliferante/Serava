"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ENLACE QUE SÍ BAJA HASTA SU DESTINO DENTRO DEL LIENZO.

   DOS PROBLEMAS, LOS DOS DEL MISMO SITIO

   1) Los botones «Completar mi perfil» eran `<a href="#formulario">` y no
      hacían nada. El ancla existe y el id también: lo que falla es dónde
      viven. Todas las pantallas de escritorio son un `ScaledCanvas`, o sea un
      bloque de 1920 px escalado con `transform` dentro de un contenedor con
      `overflow: hidden`. Cuando el navegador resuelve un salto de fragmento
      busca el ancestro desplazable más cercano del destino, y ése es el
      contenedor del lienzo — que no se puede desplazar porque está recortado.
      Resultado: la página se queda donde está y el botón parece roto.

   2) Cada pantalla se monta dos veces: el árbol compacto y el de escritorio,
      y sólo el CSS decide cuál se ve. Los dos llevan el mismo `id`, así que
      `getElementById` devuelve el del árbol compacto — que en escritorio está
      en `display:none` y cuyo rectángulo es todo ceros. Buscar por id a secas
      mandaba la página al principio.

   CÓMO LO ARREGLA
   Se queda con el destino que de verdad está pintado (el que tiene
   rectángulos) y usa `getBoundingClientRect()`, que ya viene con la
   transformación aplicada: sumándole el scroll actual sale la posición en la
   página. Y desplaza la ventana, no el contenedor.

   El `href` se conserva: el enlace sigue siendo un enlace para el teclado y
   los lectores de pantalla.
   ═══════════════════════════════════════════════════════════════════════════ */

/** El destino visible, de entre los duplicados que dejan los dos árboles. */
function destinoVisible(id: string): HTMLElement | null {
  const todos = Array.from(
    document.querySelectorAll<HTMLElement>(`[id="${CSS.escape(id)}"]`)
  );
  return todos.find((n) => n.getClientRects().length > 0) ?? todos[0] ?? null;
}

/** Baja hasta el destino con el scroll de la ventana. */
export function bajarA(id: string, margen = 24, suave = true) {
  const nodo = destinoVisible(id);
  if (!nodo) return false;
  const y = nodo.getBoundingClientRect().top + window.scrollY - margen;
  window.scrollTo({ top: Math.max(0, y), behavior: suave ? "smooth" : "auto" });
  return true;
}

export default function IrA({
  destino, margen = 24, className, style, children, "aria-label": etiqueta,
}: {
  /** El `id` del elemento al que hay que bajar, sin almohadilla. */
  destino: string;
  /** Aire por encima del destino, para no dejarlo pegado al borde. */
  margen?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <a
      href={`#${destino}`}
      className={className}
      style={style}
      aria-label={etiqueta}
      onClick={(e) => {
        // Sin destino pintado, que el navegador haga lo suyo.
        if (bajarA(destino, margen)) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   LLEGAR YA COLOCADO

   Se usa cuando otra pantalla enlaza con almohadilla — por ejemplo el
   diagnóstico, que manda a `/solicitud-acceso#formulario`. El navegador
   tampoco puede resolver ese salto por lo mismo de arriba, así que lo
   resolvemos nosotros al montar. Sin animación: al cargar, un desplazamiento
   suave desde arriba se siente como un tirón.
   ─────────────────────────────────────────────────────────────────────────── */
export function AlLlegarBajar({ margen = 24 }: { margen?: number }) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    // Un fotograma de margen: el lienzo necesita medirse antes de que su
    // altura real exista, y sin eso el rectángulo sale de un sitio provisional.
    const t = window.setTimeout(() => bajarA(id, margen, false), 120);
    return () => window.clearTimeout(t);
  }, [margen]);
  return null;
}
