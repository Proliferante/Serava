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
  async headers() {
    return [
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
