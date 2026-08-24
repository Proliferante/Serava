import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import ConfiguracionCompact from "@/components/responsive/cuenta/ConfiguracionCompact";
import ConfiguracionScreen, { CONFIG_H } from "@/components/sections/cuenta/ConfiguracionScreen";

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
      <Compact><ConfiguracionCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={CONFIG_H}>
          <ConfiguracionScreen />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
