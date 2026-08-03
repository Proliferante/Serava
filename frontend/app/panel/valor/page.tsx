import PanelPage from "@/components/panel/PanelPage";
import ValorScreen, { VALOR_H } from "@/components/sections/panel/ValorScreen";

/** PANEL · PROYECCIÓN DE VALOR — Figma 472:3843 (1920 × 1200). */
export default function PanelValorPage() {
  return (
    <PanelPage active="valor" h={VALOR_H}>
      <ValorScreen />
    </PanelPage>
  );
}
