"use client";

import { useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   LA CONSOLA COMO APP — sólo con la sesión iniciada.

   Mete en el `<head>` el enlace al manifiesto (`/consola.webmanifest`) y lo
   que Safari necesita para el iPhone. Con eso Chrome y Edge enseñan el icono
   de «Instalar» en la barra de direcciones, y el celular ofrece «Agregar a
   pantalla de inicio» con el ZQ.

   Se monta junto a la consola (ver `AdminGate`), así que el login no lleva
   nada de esto: quien llegue a admin.zequara.com sin cuenta no ve una app que
   instalar. Al cerrar sesión se desmonta y se quita todo.

   Sólo en el subdominio: en `/admin` (local, vistas previas) la app abriría
   `/`, que ahí es la web pública, no la consola.
   ═══════════════════════════════════════════════════════════════════════════ */

const ETIQUETAS: [string, Record<string, string>][] = [
  ["link", { rel: "manifest", href: "/consola.webmanifest" }],
  ["link", { rel: "apple-touch-icon", href: "/consola/apple-icono.png" }],
  ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
  ["meta", { name: "apple-mobile-web-app-title", content: "Zequara" }],
  ["meta", { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" }],
];

export default function Instalable() {
  useEffect(() => {
    if (!window.location.hostname.startsWith("admin.")) return;
    const puestas = ETIQUETAS.map(([tag, attrs]) => {
      const el = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      el.setAttribute("data-consola", "");
      document.head.appendChild(el);
      return el;
    });
    return () => puestas.forEach((el) => el.remove());
  }, []);
  return null;
}
