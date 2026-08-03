import PanelPage from "@/components/panel/PanelPage";
import ResumenScreen, { RESUMEN_H } from "@/components/sections/panel/ResumenScreen";

/**
 * PANEL · RESUMEN — Figma 472:1510 (1920 × 1382).
 *
 * Portada del área privada, a la que se llega desde el "Reservar ahora" de la
 * valorización del predio.
 */
export default function PanelResumenPage() {
  return (
    <PanelPage active="resumen" h={RESUMEN_H}>
      <ResumenScreen />
    </PanelPage>
  );
}
