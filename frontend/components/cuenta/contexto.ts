"use client";

import { createContext } from "react";
import type { CuentaKey } from "@/components/AccountMenu";

/* ═══════════════════════════════════════════════════════════════════════════
   ÁREA DE CUENTA — cambiar de pantalla sin recargar.

   «Mi perfil» y «Configuración» son dos rutas pero una sola pantalla con dos
   pestañas: mismo fondo, misma barra, mismo encabezado. Este contexto es cómo
   se avisa al armazón —`CuentaRoute`— de que hay que cambiar; lo consumen el
   par de pestañas de la vista fluida y el menú del avatar.

   Cuando no hay armazón —un render suelto, o el HTML antes de hidratar— vale
   `null` y los enlaces navegan como enlaces.
   ═══════════════════════════════════════════════════════════════════════════ */

export const CuentaTabsCtx = createContext<((k: CuentaKey) => void) | null>(null);

export const CUENTA_HREF: Record<CuentaKey, string> = {
  perfil: "/cuenta/perfil",
  configuracion: "/cuenta/configuracion",
};

/** Qué pantalla sirve una ruta. Lo usa el armazón para responder al botón atrás. */
export function cuentaDeRuta(pathname: string): CuentaKey | null {
  if (pathname.endsWith("/cuenta/perfil")) return "perfil";
  if (pathname.endsWith("/cuenta/configuracion")) return "configuracion";
  return null;
}
