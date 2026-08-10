"use client";

import { useCallback, useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   "VER EN ESCRITORIO" desde el móvil.

   Marca la raíz del documento con `data-vista="escritorio"`. Dos reglas de
   globals.css invierten entonces el corte de <Adaptive>: se apaga el árbol
   fluido y se enciende el lienzo de 1920, que el navegador encoge al ancho de
   la pantalla. Se lee entero con zoom, que el `viewport` deja abierto — es lo
   mismo que hace el "sitio para ordenador" de Chrome o Safari, pero sin salir
   de la aplicación.

   La preferencia se guarda en `localStorage` para que no haya que repetirla en
   cada página, y se aplica antes de pintar (`useState` con inicializador) para
   que no se vea el árbol equivocado un instante.
   ═══════════════════════════════════════════════════════════════════════════ */

const CLAVE = "zq:vista";

function leer(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CLAVE) === "escritorio";
  } catch {
    // Navegación privada de Safari puede lanzar al tocar localStorage.
    return false;
  }
}

/**
 * La fuente de verdad es `data-vista` en la raíz, no el estado de React.
 *
 * Hay varios consumidores a la vez —el aviso del panel, el botón de volver y
 * cada <ScaledCanvas>— y cada uno tendría su propio estado: al cambiar desde
 * uno, los demás no se enterarían. Observando el atributo, todos se enteran
 * del cambio venga de donde venga, sin montar un contexto para dos banderas.
 */
export function useVistaEscritorio() {
  const [escritorio, setEscritorio] = useState(false);

  useEffect(() => {
    const raiz = document.documentElement;

    // Primera pasada: la preferencia guardada manda sobre el atributo, que en
    // el HTML servido no viene. Se lee tras montar y no en el render porque en
    // el servidor no hay `localStorage` y habría desajuste al hidratar.
    if (!raiz.dataset.vista) raiz.dataset.vista = leer() ? "escritorio" : "movil";

    const sincronizar = () => setEscritorio(raiz.dataset.vista === "escritorio");
    sincronizar();

    const mo = new MutationObserver(sincronizar);
    mo.observe(raiz, { attributes: true, attributeFilter: ["data-vista"] });
    return () => mo.disconnect();
  }, []);

  const cambiar = useCallback((valor: boolean) => {
    document.documentElement.dataset.vista = valor ? "escritorio" : "movil";
    try {
      window.localStorage.setItem(CLAVE, valor ? "escritorio" : "movil");
    } catch {
      /* sin persistencia, pero la sesión actual funciona igual */
    }
  }, []);

  return { escritorio, cambiar };
}
