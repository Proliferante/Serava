import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import FinanzasCompact from "@/components/responsive/predios/ficha/FinanzasCompact";
import Finanzas from "@/components/predios/ficha/Finanzas";

/**
 * FICHA PREDIO · FINANZAS — frame 729:3168 de Figma (1920 × 3947).
 */
export default function FichaFinanzasPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <Compact><FinanzasCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={3947}>
          <Finanzas />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
