import ScaledCanvas from "@/components/ScaledCanvas";
import ConfirmacionAccesoScreen from "@/components/sections/solicitud/ConfirmacionAccesoScreen";

/** CONFIRMACIÓN ACCESO — frame de Figma (1920 × 1199.7), escalado al viewport. */
export default function ConfirmacionAccesoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <ScaledCanvas width={1920} height={1200}>
        <ConfirmacionAccesoScreen />
      </ScaledCanvas>
    </main>
  );
}
