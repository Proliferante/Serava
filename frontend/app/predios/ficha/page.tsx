import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import OportunidadCompact from "@/components/responsive/predios/ficha/OportunidadCompact";
import Oportunidad from "@/components/predios/ficha/Oportunidad";

/** FICHA PREDIO · OPORTUNIDAD — frame 729:2379 de Figma (1920 × 4745). */
export default function FichaOportunidadPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <Compact><OportunidadCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={4745}>
          <Oportunidad />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
