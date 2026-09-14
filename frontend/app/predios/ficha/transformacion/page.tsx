import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import FichaCompact from "@/components/responsive/predios/FichaCompact";
import Transformacion from "@/components/predios/ficha/Transformacion";

/**
 * FICHA PREDIO · TRANSFORMACIÓN — frame 752:2869 de Figma (1920 × 2705).
 *
 * El rediseño sólo trae el escritorio, así que en móvil sigue la ficha
 * compacta de siempre.
 */
export default function FichaTransformacionPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <Compact><FichaCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={2705}>
          <Transformacion />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
