import FichaRoute from "@/components/predios/ficha/FichaRoute";

/**
 * FICHA PREDIO · OPORTUNIDAD — frame 729:2379 de Figma (1920 × 4745).
 *
 * Las tres pestañas de la ficha comparten armazón: `FichaRoute` las monta
 * todas y cambia entre ellas sin recargar, pero cada una conserva su ruta.
 */
export default function FichaOportunidadPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
      <FichaRoute tab="oportunidad" />
    </main>
  );
}
