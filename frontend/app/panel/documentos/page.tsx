import PanelPage from "@/components/panel/PanelPage";
import DocumentosScreen, { DOCUMENTOS_H } from "@/components/sections/panel/DocumentosScreen";

/** PANEL · DOCUMENTOS — Figma 472:4293 (1920 × 1200). */
export default function PanelDocumentosPage() {
  return (
    <PanelPage active="documentos" h={DOCUMENTOS_H}>
      <DocumentosScreen />
    </PanelPage>
  );
}
