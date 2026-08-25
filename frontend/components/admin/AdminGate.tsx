"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import AdminConsole from "@/components/admin/AdminConsole";
import AdminLogin from "@/components/admin/AdminLogin";

/* ═══════════════════════════════════════════════════════════════════════════
   PUERTA DE /admin — decide si se ve el acceso o la consola.

   La entrada se guarda en `sessionStorage` y no en `localStorage`: una consola
   de operación no debe quedar abierta para siempre en el navegador de nadie.
   Al cerrar la pestaña hay que volver a entrar.

   La comprobación va en `useLayoutEffect` y no en `useEffect`, con el mismo
   patrón que `ScaledCanvas`: corre después de montar pero antes de que el
   navegador pinte, así que quien ya tenía sesión no llega a ver el acceso ni
   un fotograma. En el servidor no existe `sessionStorage`, de modo que el HTML
   inicial es siempre el del acceso — que es también lo que debe indexarse y lo
   que hay que enseñar si el JavaScript no llega a cargar.
   ═══════════════════════════════════════════════════════════════════════════ */

const CLAVE = "zq:admin";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function AdminGate() {
  const [dentro, setDentro] = useState(false);

  useIsoLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(CLAVE) === "1") setDentro(true);
    } catch { /* sin sessionStorage se pide entrar cada vez */ }
  }, []);

  const entrar = () => {
    try { window.sessionStorage.setItem(CLAVE, "1"); } catch { /* da igual */ }
    setDentro(true);
  };

  const salir = () => {
    try { window.sessionStorage.removeItem(CLAVE); } catch { /* da igual */ }
    setDentro(false);
  };

  return dentro ? <AdminConsole onSalir={salir} /> : <AdminLogin onEntrar={entrar} />;
}
