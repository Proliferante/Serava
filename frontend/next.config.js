/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
