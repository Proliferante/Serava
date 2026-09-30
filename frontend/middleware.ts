import { NextResponse, type NextRequest } from "next/server";

import { firma } from "@/lib/firma";

/* ═══════════════════════════════════════════════════════════════════════════
   Dos trabajos, en este orden:

   1. SEPARAR LA CONSOLA DE LA WEB PÚBLICA (sólo con `ADMIN_HOST`)

      La consola vive en su propio subdominio (`ADMIN_HOST`, p. ej.
      `admin.zequara.com`) y la web pública no la sirve. No es por esconder la
      dirección —un subdominio también se adivina—, es por el origen: para el
      navegador `zequara.com/admin` es el MISMO sitio que la página pública, y
      un script que se colara en lo público (un enlace del HUB, por ejemplo)
      correría con la sesión del admin. En un subdominio aparte, la cookie de
      sesión sólo existe ahí: lo público ni la tiene.

        · en `ADMIN_HOST`, cualquier ruta sirve la consola, con `noindex`;
        · en cualquier otro dominio, `/admin` da 404, y `/api/admin` y
          `/api/auth` también. Esas dos APIs sólo las llama la consola, y
          dejarlas abiertas en el dominio público permitiría iniciar sesión
          ahí y tener la cookie de admin en el origen que no toca.

      Sin `ADMIN_HOST` (en local, y en los despliegues de vista previa de
      Vercel) no se separa nada y la consola sigue en `/admin`. Así el cambio
      se enciende cuando el dominio esté listo, no antes.

      En local se prueba con ADMIN_HOST=admin.localhost y abriendo
      http://admin.localhost:3000 — los navegadores mandan `*.localhost` a la
      propia máquina sin tocar nada.

   2. FIRMAR LO QUE VA AL BACKEND (`/api/*`)

      Se añade:
        · `x-zq-proxy`   la firma, para que el backend sepa que viene del
                         frontend (ver `lib/firma.ts`);
        · `x-zq-cliente` la IP del visitante. Railway sólo ve la de Vercel,
                         que es quien se le conecta, y sin esto todos los
                         visitantes comparten el mismo tope por IP.

      Las dos se BORRAN primero de lo que manda el navegador: si no, alguien
      podría escribir su propio `x-zq-cliente` y cambiarse de IP a voluntad.
      `request.ip` la pone Vercel y no se puede falsificar; en local no
      existe, y entonces no se manda.
   ═══════════════════════════════════════════════════════════════════════════ */

const ADMIN_HOST = (process.env.ADMIN_HOST || "").trim().toLowerCase();

/** Las APIs que sólo usa la consola. */
const API_CONSOLA = ["/api/admin", "/api/auth"];

const empieza = (ruta: string, base: string) => ruta === base || ruta.startsWith(base + "/");

function noExiste(request: NextRequest) {
  /* Una ruta que no existe: Next pinta su 404 normal, con su estado 404. Así
     `zequara.com/admin` no se distingue de cualquier otra URL inventada. */
  return NextResponse.rewrite(new URL("/_no-existe", request.url));
}

function aLaApi(request: NextRequest) {
  const cabeceras = new Headers(request.headers);
  cabeceras.delete("x-zq-proxy");
  cabeceras.delete("x-zq-cliente");

  for (const [k, v] of Object.entries(firma())) cabeceras.set(k, v);
  const ip = request.ip;
  if (ip) cabeceras.set("x-zq-cliente", ip);

  return NextResponse.next({ request: { headers: cabeceras } });
}

export function middleware(request: NextRequest) {
  const ruta = request.nextUrl.pathname;
  const esApi = empieza(ruta, "/api");

  if (!ADMIN_HOST) return esApi ? aLaApi(request) : NextResponse.next();

  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  const enConsola = host === ADMIN_HOST;

  if (esApi) {
    if (!enConsola && API_CONSOLA.some((b) => empieza(ruta, b))) {
      return NextResponse.json({ detail: "Not Found" }, { status: 404 });
    }
    return aLaApi(request);
  }

  if (!enConsola) {
    return empieza(ruta, "/admin") ? noExiste(request) : NextResponse.next();
  }

  /* En el subdominio, `/admin` se ve como `/`: la dirección limpia es la
     del subdominio, sin repetir "admin" dos veces. */
  if (empieza(ruta, "/admin")) {
    /* Se arma con el `host` de la petición y no con `nextUrl.clone()`: en
       local `nextUrl` lleva el host con el que arrancó Next (`localhost`), y
       la redirección sacaba al usuario del subdominio. */
    const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
    const destino = new URL("/" + request.nextUrl.search, `${proto}://${request.headers.get("host")}`);
    return NextResponse.redirect(destino);
  }

  /* Cualquier ruta sirve la consola. Las páginas públicas no existen en este
     subdominio, y así un enlace viejo o una URL tecleada a mano no acaba en
     la web del inversionista con la cookie de admin encima. */
  const consola = request.nextUrl.clone();
  consola.pathname = "/admin";
  const r = NextResponse.rewrite(consola);
  r.headers.set("X-Robots-Tag", "noindex, nofollow");
  return r;
}

export const config = {
  /* Todo menos los archivos estáticos: lo de `/_next`, y cualquier ruta con
     extensión (imágenes de `/figma`, fuentes, favicon, robots.txt). La
     consola los necesita igual que la web, y no hay nada que decidir sobre
     ellos. `/api` va aparte y SIEMPRE entra, tenga o no un punto en la ruta:
     si no, `/api/admin/x.json` se saltaría la firma y el bloqueo. */
  matcher: ["/api/:ruta*", "/((?!_next/static|_next/image|.*\\..*).*)"],
};
