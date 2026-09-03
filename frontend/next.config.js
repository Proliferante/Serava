/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // framer-motion se importa como barrel; esto lo resuelve a imports directos
  // para que el tree-shaking descarte lo que no usamos.
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  images: {
    // AVIF primero, WebP para quien no lo soporte. Las fotos ya eran WebP, así
    // que el formato aporta poco por sí solo: lo que de verdad baja el peso es
    // que `next/image` sirva la variante del tamaño al que se pinta (ver
    // `components/CanvasImage.tsx`).
    formats: ["image/avif", "image/webp"],
    // La caché de las variantes hereda el `max-age` del archivo de origen, y
    // los de `/figma` van con `immutable` un año (ver `headers()` abajo), así
    // que las versiones optimizadas se cachean igual de bien.
  },
  // La consola llama a rutas relativas (`/api/auth/...`, `/api/admin/...`).
  // Sin esto, esas peticiones las atiende Next y devuelven 404 — que es por
  // lo que la consola siempre decía "Sin servidor" aunque el backend
  // estuviera corriendo: nunca llegaba a él.
  //
  // En desarrollo el destino es el uvicorn local; al desplegar se pone
  // BACKEND_URL apuntando al backend real. Va por reescritura y no llamando
  // directo a `http://127.0.0.1:8000` desde el navegador para que todo salga
  // del mismo origen: así no hay preflight de CORS ni un dominio distinto
  // que configurar en el frontend.
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    return [{ source: "/api/:ruta*", destination: `${backend}/api/:ruta*` }];
  },

  async headers() {
    return [
      {
        /* Cabeceras de seguridad para TODO el sitio. Son cuatro líneas y
           cierran cosas que de otro modo quedan abiertas por defecto:

           · frame-ancestors 'self' — que nadie meta la consola ni el login en
             un iframe dentro de su propia página para robar clics. Se deja
             'self' y no 'none' porque las pruebas de responsive montan la
             página en un iframe del mismo origen.
           · nosniff — que el navegador no adivine el tipo de un archivo y
             acabe ejecutando como script algo que se sirvió como texto.
           · Referrer-Policy — que al salir a otro dominio no se filtre la
             ruta completa desde la que se salió. Importa aquí: desde el flujo
             de inmuebles se abre el anuncio del portal en otra pestaña, y esa
             URL de origen dice en qué está trabajando el equipo.
           · Permissions-Policy — cámara, micrófono y ubicación no se usan;
             negarlos evita que un script de terceros los pida algún día.

           No se pone una CSP completa a propósito: Next inyecta scripts en
           línea y una CSP mal calibrada rompe el sitio en silencio. La de la
           API sí es estricta, y ahí no hay nada que ejecutar (ver
           `backend/app/main.py`). */
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Los assets de /figma usan nombres con hash de contenido:
        // si la imagen cambia, cambia el nombre → cacheable "para siempre".
        source: "/figma/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Las imágenes antes/después tienen nombres estables (no hash):
        // se cachean una semana y se revalidan en segundo plano.
        source: "/antes-despues/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
