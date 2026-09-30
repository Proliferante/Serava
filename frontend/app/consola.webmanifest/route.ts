import { NextResponse, type NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════════════════════
   EL MANIFIESTO DE LA CONSOLA — lo que hace que el navegador ofrezca
   «Instalar» y la abra en su propia ventana, con el ZQ como icono.

   Sólo existe en el subdominio de la consola (`ADMIN_HOST`). En la web
   pública esta dirección da 404, como cualquier otra de la consola: ni el
   nombre ni la dirección de la consola tienen por qué verse desde www.

   Y aun en el subdominio, la página sólo lo enlaza con la sesión iniciada
   (ver `components/admin/Instalable.tsx`): en el login no hay nada
   instalable.
   ═══════════════════════════════════════════════════════════════════════════ */

const ADMIN_HOST = (process.env.ADMIN_HOST || "").trim().toLowerCase();

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (!ADMIN_HOST || host !== ADMIN_HOST) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(
    {
      id: "/",
      name: "Zequara · Consola interna",
      short_name: "Zequara",
      description: "Consola de operación del equipo de Zequara.",
      lang: "es",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#2a1e14",
      theme_color: "#492100",
      icons: [
        { src: "/consola/icono-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/consola/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/consola/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    {
      headers: {
        "content-type": "application/manifest+json",
        /* Que no se quede guardado en ningún CDN intermedio: depende del host. */
        "cache-control": "private, max-age=3600",
      },
    },
  );
}
