import { Compact, Desk } from "@/components/responsive/Adaptive";
import FinanzasCompact from "@/components/responsive/predios/ficha/FinanzasCompact";
import FinanzasCanvas from "@/components/predios/ficha/FinanzasCanvas";

/**
 * FICHA PREDIO · FINANZAS — frames 729:3168 (1920 × 1847) y 766:3638
 * (1920 × 4165) de Figma: el resumen y la ficha técnica desplegada.
 */
export default function FichaFinanzasPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <Compact><FinanzasCompact /></Compact>
      <Desk><FinanzasCanvas /></Desk>
    </main>
  );
}
