"use client";

import { useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ÍNDICE VIVO — marca en el índice la sección que se está leyendo.

   No pinta nada: busca los enlaces del índice (`[data-legal-indice] a`) y le
   pone `aria-current="true"` al de la sección en curso; el estilo sale del
   CSS (`.legal-item[aria-current]`). Así la página sigue siendo de servidor
   y, sin JavaScript, el índice funciona igual, sólo que sin resaltar.

   Si el enlace activo se sale de la caja del índice fijo, se corre la caja
   tocando su `scrollTop`, no con `scrollIntoView`: ése desplaza también la
   ventana y le quita la lectura al usuario.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function IndiceVivo({ ids }: { ids: string[] }) {
  useEffect(() => {
    const secciones = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!secciones.length) return;

    let actual = "";
    let frame = 0;

    const marcar = () => {
      frame = 0;
      // La sección activa es la última cuyo arranque ya pasó el primer tercio
      // de la pantalla; al fondo de la página, la última.
      const linea = window.innerHeight * 0.3;
      let activa = secciones[0].id;
      for (const s of secciones) {
        if (s.getBoundingClientRect().top <= linea) activa = s.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const ultima = secciones[secciones.length - 1];
        if (ultima.getBoundingClientRect().top < window.innerHeight) activa = ultima.id;
      }
      if (activa === actual) return;
      actual = activa;

      document.querySelectorAll<HTMLAnchorElement>("[data-legal-indice] a").forEach((a) => {
        const es = a.getAttribute("href") === `#${activa}`;
        if (es) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");

        if (!es) return;
        const caja = a.closest<HTMLElement>("[data-legal-caja]");
        // Sin caja visible (el índice plegable de móvil, o el fijo oculto) no
        // hay nada que correr.
        if (!caja || caja.offsetParent === null || caja.scrollHeight <= caja.clientHeight) return;
        const arriba = a.getBoundingClientRect().top - caja.getBoundingClientRect().top + caja.scrollTop;
        if (arriba < caja.scrollTop + 40) caja.scrollTop = Math.max(0, arriba - 40);
        else if (arriba + a.offsetHeight > caja.scrollTop + caja.clientHeight - 40)
          caja.scrollTop = arriba + a.offsetHeight - caja.clientHeight + 40;
      });
    };

    const pedir = () => {
      if (!frame) frame = requestAnimationFrame(marcar);
    };

    marcar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return null;
}
