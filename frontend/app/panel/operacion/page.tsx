import PanelPage from "@/components/panel/PanelPage";
import OperacionCompact from "@/components/responsive/panel/OperacionCompact";
import OperacionScreen, { OPERACION_H } from "@/components/sections/panel/OperacionScreen";

/** PANEL · OPERACIÓN DEL ACTIVO — Figma 600:2073 (1920 × 2299). */
export default function PanelOperacionPage() {
  return (
    <PanelPage
      active="operacion"
      h={OPERACION_H}
      meta="Apartamento 320 m² · Entregado y en operación"
      state="En operación · Arrendado"
      compact={<OperacionCompact />}
    >
      <OperacionScreen />
    </PanelPage>
  );
}
