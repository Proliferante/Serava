import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import SolicitudCompact from "@/components/responsive/solicitud/SolicitudCompact";
import SolicitudAccesoScreen from "@/components/sections/solicitud/SolicitudAccesoScreen";

/** SOLICITUD ACCESO — frame de Figma ACCESO (1920 × 4470), escalado al viewport. */
export default function SolicitudAccesoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Compact><SolicitudCompact /></Compact>
      <Desk>
      <ScaledCanvas width={1920} height={4470}>
        <SolicitudAccesoScreen />
      </ScaledCanvas>
      </Desk>
    </main>
  );
}
