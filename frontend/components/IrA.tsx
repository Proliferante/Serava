"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ENLACE QUE SÍ BAJA HASTA SU DESTINO DENTRO DEL LIENZO.

   DOS PROBLEMAS, LOS DOS DEL MISMO SITIO

   1) Los botones «Completar mi perfil» eran `<a href="#formulario">` y no
      hacían nada. El ancla existía y el id también: lo que fallaba era dónde
      vivían. Todas las pantallas de escritorio son un `ScaledCanvas`, o sea un
      bloque de 1920 px escalado con `transform` dentro de un contenedor con
      `overflow: hidden`. Cuando el navegador resuelve un salto de fragmento
      busca el ancestro desplazable más cercano del destino, y ése es el
      contenedor del lienzo — que no se puede desplazar porque está recortado.
      Resultado: la página se queda donde está y el botón parece roto.

   2) Cada pantalla se monta DOS VECES —el árbol compacto y el de escritorio—
      y sólo el CSS decide cuál se ve (ver components/responsive/Adaptive.tsx).
      Los dos llevaban el mismo `id`, que en HTML tiene que ser único, así que
      `getElementById` devolvía el del árbol compacto —el primero del
      documento—, que en escritorio está en `display:none` y cuyo rectángulo es
      todo ceros. La página se iba al principio.

   CÓMO SE RESUELVE
   Los destinos se marcan con `data-ancla` y no con `id`: un `data-*` puede
   repetirse sin romper nada, así que los dos árboles pueden llevarlo y ningún
   `getElementById`, `htmlFor` ni `aria-labelledby` de la página queda
   envenenado. De entre los que hay, se coge el que de verdad está pintado.

   `getBoundingClientRect()` ya viene con la transformación del lienzo
   aplicada, así que sumándole el scroll actual sale la posición en la página.
   Y se desplaza la ventana, no el contenedor.

   El `href` se conserva: el enlace sigue siendo un enlace para el teclado y
   los lectores de pantalla, y la URL sigue contando a dónde lleva.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * El destino visible, de entre los duplicados que dejan los dos árboles.
 *
 * Busca por `data-ancla` y también por `id`, para que un destino que sí tenga
 * un id de verdad (uno que exista una sola vez) siga funcionando sin tener que
 * marcarlo aparte.
 */
function destinoVisible(nombre: string): HTMLElement | null {
  const n = CSS.escape(nombre);
  const todos = Array.from(
    document.querySelectorAll<HTMLElement>(`[data-ancla="${n}"], [id="${n}"]`)
  );
  return todos.find((e) => e.getClientRects().length > 0) ?? todos[0] ?? null;
}

/** Baja hasta el destino con el scroll de la ventana. */
export function bajarA(nombre: string, margen = 24, suave = true) {
  const nodo = destinoVisible(nombre);
  if (!nodo) return false;
  const y = nodo.getBoundingClientRect().top + window.scrollY - margen;
  window.scrollTo({ top: Math.max(0, y), behavior: suave ? "smooth" : "auto" });
  return true;
}

/**
 * Marca un punto al que se puede bajar.
 *
 * Es un `<span>` sin tamaño: sólo sirve de referencia de posición. Se puede
 * usar tal cual, o poner `data-ancla="…"` a mano sobre un elemento que ya
 * exista (una `<section>`, por ejemplo) — las dos formas valen.
 */
export function Ancla({ nombre, className, style }: {
  nombre: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <span data-ancla={nombre} className={className} style={style} aria-hidden />;
}

export default function IrA({
  destino, margen = 24, className, style, children, "aria-label": etiqueta,
}: {
  /** El `data-ancla` (o el `id`) del elemento al que hay que bajar. */
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
   tampoco puede resolver ese salto por lo de arriba, así que lo resolvemos
   nosotros al montar. Sin animación: al cargar, un desplazamiento suave desde
   arriba se siente como un tirón.
   ─────────────────────────────────────────────────────────────────────────── */
export function AlLlegarBajar({ margen = 24 }: { margen?: number }) {
  useEffect(() => {
    const nombre = window.location.hash.slice(1);
    if (!nombre) return;
    // Un fotograma de margen: el lienzo necesita medirse antes de que su
    // altura real exista, y sin eso el rectángulo sale de un sitio provisional.
    const t = window.setTimeout(() => bajarA(nombre, margen, false), 120);
    return () => window.clearTimeout(t);
  }, [margen]);
  return null;
}
