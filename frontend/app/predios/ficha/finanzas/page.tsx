import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import AddValueCompact from "@/components/responsive/predios/AddValueCompact";
import Finanzas from "@/components/predios/ficha/Finanzas";

/**
 * FICHA PREDIO · FINANZAS — frame 729:3168 de Figma (1920 × 3947).
 *
 * En móvil sigue mandando la vista del análisis Add Value: el rediseño de
 * Figma sólo trae el escritorio y el contenido de esta pestaña es el mismo.
 */
export default function FichaFinanzasPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <Compact><AddValueCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={3947}>
          <Finanzas />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
