import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import TransformacionCompact from "@/components/responsive/predios/ficha/TransformacionCompact";
import Transformacion from "@/components/predios/ficha/Transformacion";

/**
 * FICHA PREDIO · TRANSFORMACIÓN — frame 752:2869 de Figma (1920 × 2705).
 */
export default function FichaTransformacionPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <Compact><TransformacionCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={2705}>
          <Transformacion />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
