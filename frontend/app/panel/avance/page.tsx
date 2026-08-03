import PanelPage from "@/components/panel/PanelPage";
import AvanceScreen, { AVANCE_H } from "@/components/sections/panel/AvanceScreen";

/** PANEL · AVANCE DE OBRA — Figma 472:2091 (1920 × 2169). */
export default function PanelAvancePage() {
  return (
    <PanelPage active="avance" h={AVANCE_H}>
      <AvanceScreen />
    </PanelPage>
  );
}
