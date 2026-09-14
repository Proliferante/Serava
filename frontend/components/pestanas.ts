"use client";

/* ═══════════════════════════════════════════════════════════════════════════
   PESTAÑAS QUE SON RUTAS.

   Hay dos sitios en el sitio —la ficha de predio y el área de cuenta— donde
   varias rutas son en realidad pestañas de una misma pantalla. Cada una tiene
   su URL, se puede compartir y se sirve entera desde el servidor; pero ya en
   el cliente están todas montadas en el mismo árbol y cambiar de una a otra no
   pide nada a la red, así que se puede animar.

   Lo único que las dos comparten es cómo se escribe la URL, que tiene truco.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Cambia la barra de direcciones sin avisar al router.
 *
 * Next parchea `window.history.pushState` —como propiedad propia del objeto
 * `history`; el del prototipo sigue siendo el nativo— para enterarse de los
 * cambios de URL. Pasarle una ruta distinta de la que sirvió desmonta y vuelve
 * a montar el árbol de la ruta, y con él el estado de la pestaña: la URL
 * cambiaba y la pantalla se quedaba en la de antes.
 *
 * Aquí la URL es sólo el nombre de lo que ya está en pantalla, así que se
 * escribe con el método nativo. Se conserva el `state` que tenía puesto Next
 * para que su propio manejador de `popstate` siga reconociendo la entrada y el
 * botón atrás no acabe en una recarga.
 */
export function urlSilenciosa(href: string) {
  History.prototype.pushState.call(window.history, window.history.state, "", href);
}

/** Un clic normal; con modificador o botón del medio manda el navegador. */
export function clicSimple(e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number }) {
  return !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0;
}

/** Muelle con el que se mueven las píldoras de las barras de pestañas. */
export const GLIDE = { type: "spring", stiffness: 240, damping: 30, mass: 0.9 } as const;
