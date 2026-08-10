import ScaledCanvas from "@/components/ScaledCanvas";
import MisPropiedadesScreen, { MIS_PROPIEDADES_H } from "@/components/sections/predios/MisPropiedadesScreen";

/**
 * PREDIOS · MIS PROPIEDADES — Figma 656:2795 (1920 × 1813.32).
 *
 * El portafolio del inversionista: saludo, resumen en tres tarjetas, un activo
 * por tarjeta y lo último que se revisó. Cada tarjeta entra a la plataforma
 * privada de su activo.
 */
export default function MisPropiedadesPage() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={1920} height={MIS_PROPIEDADES_H}>
        <MisPropiedadesScreen />
      </ScaledCanvas>
    </main>
  );
}
