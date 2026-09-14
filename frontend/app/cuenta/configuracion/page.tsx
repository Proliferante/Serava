import CuentaRoute from "@/components/cuenta/CuentaRoute";

/**
 * CUENTA · CONFIGURACIÓN — Figma 688:4280 (1920 × 1581).
 *
 * Seguridad, avisos y preferencias. Comparte barra, encabezado y retícula con
 * Mi perfil; se salta entre las dos por el menú del avatar y, en la vista
 * fluida, por el par de pestañas del encabezado.
 */
export default function ConfiguracionPage() {
  return (
    <main style={{ background: "#492100" }}>
      <CuentaRoute tab="configuracion" />
    </main>
  );
}
