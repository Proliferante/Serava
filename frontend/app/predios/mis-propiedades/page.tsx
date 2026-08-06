import ScaledCanvas from "@/components/ScaledCanvas";
import MisPropiedadesScreen, { MIS_PROPIEDADES_H } from "@/components/sections/predios/MisPropiedadesScreen";

/**
 * PREDIOS · MIS PROPIEDADES — Figma 600:3028 (1920 × 1379).
 *
 * El portafolio del inversionista. Cada tarjeta entra a la plataforma privada
 * de su activo.
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
