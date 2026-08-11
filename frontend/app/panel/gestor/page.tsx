import PanelPage from "@/components/panel/PanelPage";
import GestorCompact from "@/components/responsive/panel/GestorCompact";
import GestorScreen, { GESTOR_H } from "@/components/sections/panel/GestorScreen";

/** PANEL · MI GESTOR — Figma 472:4740 (1920 × 1200). */
export default function PanelGestorPage() {
  return (
    <PanelPage active="gestor" h={GESTOR_H} compact={<GestorCompact />}>
      <GestorScreen />
    </PanelPage>
  );
}
