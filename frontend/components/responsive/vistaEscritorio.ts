"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CLAVE_VISTA, esPrivada } from "@/components/responsive/vista";

/* ═══════════════════════════════════════════════════════════════════════════
   "VER EN ESCRITORIO" desde el móvil.

   Marca la raíz del documento con `data-vista="escritorio"`. Dos reglas de
   globals.css invierten entonces el corte de <Adaptive>: se apaga el árbol
   fluido y se enciende el lienzo de 1920, que el navegador encoge al ancho de
   la pantalla. Se lee entero con zoom, que el `viewport` deja abierto — es lo
   mismo que hace el "sitio para ordenador" de Chrome o Safari, pero sin salir
   de la aplicación.

   Sólo vale dentro del área privada. Es ahí donde se ofrece —el panel son diez
   pantallas de tablas que piden ancho— y ahí se queda: la preferencia se
   guardaba para toda la web, así que quien la aceptaba en el panel se
   encontraba después la portada en versión de escritorio sin haberlo pedido.
   El predicado y el guion de <head> están en `vista.ts`, que no es de cliente:
   el layout los necesita y es un componente de servidor.

   La preferencia se guarda en `localStorage` para no repetirla en cada pantalla
   del área privada, y se aplica antes de pintar desde el guion de <head> (ver
   `GUION_VISTA` en `vista.ts`), no aquí: leyéndola tras montar se veía un
   instante el árbol equivocado.
   ═══════════════════════════════════════════════════════════════════════════ */

function leer(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CLAVE_VISTA) === "escritorio";
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
  const ruta = usePathname();

  useEffect(() => {
    const raiz = document.documentElement;

    // Al navegar dentro de la aplicación el guion de <head> no vuelve a correr,
    // así que aquí se reevalúa: saliendo del área privada la vista vuelve a la
    // fluida aunque la preferencia siga guardada.
    const debe = esPrivada(ruta) && leer();
    if (raiz.dataset.vista !== (debe ? "escritorio" : "movil")) {
      raiz.dataset.vista = debe ? "escritorio" : "movil";
    }

    const sincronizar = () => setEscritorio(raiz.dataset.vista === "escritorio");
    sincronizar();

    const mo = new MutationObserver(sincronizar);
    mo.observe(raiz, { attributes: true, attributeFilter: ["data-vista"] });
    return () => mo.disconnect();
  }, [ruta]);

  const cambiar = useCallback((valor: boolean) => {
    document.documentElement.dataset.vista = valor ? "escritorio" : "movil";
    try {
      window.localStorage.setItem(CLAVE_VISTA, valor ? "escritorio" : "movil");
    } catch {
      /* sin persistencia, pero la sesión actual funciona igual */
    }
  }, []);

  return { escritorio, cambiar };
}
