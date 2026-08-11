import PanelPage from "@/components/panel/PanelPage";
import FotosCompact from "@/components/responsive/panel/FotosCompact";
import FotosScreen, { FOTOS_H } from "@/components/sections/panel/FotosScreen";

/** PANEL · FOTOS Y AVANCE VISUAL — Figma 492:1829 (1920 × 1881). */
export default function PanelFotosPage() {
  return (
    <PanelPage active="fotos" h={FOTOS_H} compact={<FotosCompact />}>
      <FotosScreen />
    </PanelPage>
  );
}
