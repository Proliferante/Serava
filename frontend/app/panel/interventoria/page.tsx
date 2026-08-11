import PanelPage from "@/components/panel/PanelPage";
import InterventoriaCompact from "@/components/responsive/panel/InterventoriaCompact";
import InterventoriaScreen, { INTERVENTORIA_H } from "@/components/sections/panel/InterventoriaScreen";

/** PANEL · INTERVENTORÍA — Figma 472:3438 (1920 × 1200). */
export default function PanelInterventoriaPage() {
  return (
    <PanelPage active="interventoria" h={INTERVENTORIA_H} compact={<InterventoriaCompact />}>
      <InterventoriaScreen />
    </PanelPage>
  );
}
