import PanelPage from "@/components/panel/PanelPage";
import PresupuestoScreen, { PRESUPUESTO_H } from "@/components/sections/panel/PresupuestoScreen";

/** PANEL · PRESUPUESTO — Figma 472:2519 (1920 × 1200). */
export default function PanelPresupuestoPage() {
  return (
    <PanelPage active="presupuesto" h={PRESUPUESTO_H}>
      <PresupuestoScreen />
    </PanelPage>
  );
}
