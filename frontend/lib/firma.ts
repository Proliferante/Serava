/* ═══════════════════════════════════════════════════════════════════════════
   LA FIRMA DEL FRONTEND — lo que le dice al backend "esto viene de nosotros".

   Con `PROXY_SECRETO` configurado, el backend rechaza toda petición que no
   lleve esta cabecera (ver `backend/app/core/limites.py`). Así la URL de
   Railway, que es pública, no sirve para saltarse el firewall de Vercel.

   La ponen dos sitios:
     · `middleware.ts`, en las peticiones del navegador a `/api/*`;
     · los `fetch` de servidor de `lib/predios.ts` y `lib/hub.ts`, que van
       directo al backend sin pasar por el middleware.

   `PROXY_SECRETO` no lleva `NEXT_PUBLIC_` y no puede llevarlo nunca: con ese
   prefijo Next lo copia dentro del JavaScript que se descarga el navegador, y
   cualquiera lo leería con F12. Sin prefijo sólo existe en el servidor; en el
   navegador esto devuelve un objeto vacío.
   ═══════════════════════════════════════════════════════════════════════════ */

export function firma(): Record<string, string> {
  const secreto = process.env.PROXY_SECRETO;
  return secreto ? { "x-zq-proxy": secreto } : {};
}
