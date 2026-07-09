import ScaledCanvas from "@/components/ScaledCanvas";
import FichaPredio from "@/components/predios/FichaPredio";

/** FICHA PREDIO — reproducción exacta del frame de Figma (1920 × 2287). */
export default function FichaPredioPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <ScaledCanvas width={1920} height={2287}>
        <FichaPredio />
      </ScaledCanvas>
    </main>
  );
}
