import PanelPage from "@/components/panel/PanelPage";
import AprobacionesScreen, { APROBACIONES_H } from "@/components/sections/panel/AprobacionesScreen";

/** PANEL · APROBACIONES — Figma 472:3002 (1920 × 1110). */
export default function PanelAprobacionesPage() {
  return (
    <PanelPage active="aprobaciones" h={APROBACIONES_H}>
      <AprobacionesScreen />
    </PanelPage>
  );
}
