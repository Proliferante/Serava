import { NextResponse, type NextRequest } from "next/server";

import { firma } from "@/lib/firma";

/* ═══════════════════════════════════════════════════════════════════════════
   Las peticiones del navegador a `/api/*` pasan por aquí antes de que la
   reescritura de `next.config.js` las mande al backend. Se les añade:

     · `x-zq-proxy`   la firma, para que el backend sepa que vienen del
                      frontend (ver `lib/firma.ts`);
     · `x-zq-cliente` la IP del visitante. Railway sólo ve la de Vercel, que
                      es quien se le conecta, y sin esto todos los visitantes
                      comparten el mismo tope por IP.

   Las dos se BORRAN primero de lo que manda el navegador. Si no, alguien
   podría escribir su propio `x-zq-cliente` y cambiarse de IP a voluntad para
   esquivar los topes; el backend sólo se cree la IP si viene firmada, pero
   mejor que ni llegue.

   `request.ip` la pone Vercel y no se puede falsificar desde el navegador. En
   local no existe, y entonces no se manda: el backend usa la de la conexión.
   ═══════════════════════════════════════════════════════════════════════════ */

export function middleware(request: NextRequest) {
  const cabeceras = new Headers(request.headers);
  cabeceras.delete("x-zq-proxy");
  cabeceras.delete("x-zq-cliente");

  for (const [k, v] of Object.entries(firma())) cabeceras.set(k, v);
  const ip = request.ip;
  if (ip) cabeceras.set("x-zq-cliente", ip);

  return NextResponse.next({ request: { headers: cabeceras } });
}

export const config = { matcher: "/api/:ruta*" };
