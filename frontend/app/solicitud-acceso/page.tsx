import ScaledCanvas from "@/components/ScaledCanvas";
import SolicitudAccesoScreen from "@/components/sections/solicitud/SolicitudAccesoScreen";

/** SOLICITUD ACCESO — frame de Figma 1920 × 1466.53, escalado al ancho del viewport. */
export default function SolicitudAccesoPage() {
  return (
    <main className="min-h-screen bg-cream">
      <ScaledCanvas width={1920} height={1467}>
        <SolicitudAccesoScreen />
      </ScaledCanvas>
    </main>
  );
}
