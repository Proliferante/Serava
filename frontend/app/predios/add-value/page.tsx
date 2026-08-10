import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import AddValueCompact from "@/components/responsive/predios/AddValueCompact";
import AddValue from "@/components/predios/AddValue";

/** ANÁLISIS ADD VALUE — reproducción exacta del frame de Figma (1920 × 2805). */
export default function AddValuePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#efe6d5" }}>
      <Compact><AddValueCompact /></Compact>
      <Desk>
      <ScaledCanvas width={1920} height={2805}>
        <AddValue />
      </ScaledCanvas>
      </Desk>
    </main>
  );
}
