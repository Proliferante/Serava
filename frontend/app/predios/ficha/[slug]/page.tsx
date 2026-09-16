import { notFound } from "next/navigation";
import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import OportunidadCompact from "@/components/responsive/predios/ficha/OportunidadCompact";
import Oportunidad from "@/components/predios/ficha/Oportunidad";
import { FichaProvider } from "@/components/predios/ficha/datos";
import { fichaPredio } from "@/lib/predios";

/**
 * FICHA DE UN PREDIO PUBLICADO · OPORTUNIDAD.
 *
 * El mismo lienzo que `/predios/ficha` —el prototipo— pero con el contenido
 * del predio dentro. Lo que no se haya escrito todavía sale con el texto de
 * referencia del diseño, no en blanco: ver `components/predios/ficha/datos.tsx`.
 */
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fichaPredio(slug);
  if (!d) return { title: "Predio no encontrado · Zequara" };
  return {
    title: `${d.tarjeta.title} · Zequara`,
    description: d.tarjeta.city,
  };
}

export default async function FichaPredioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fichaPredio(slug);
  if (!d) notFound();

  return (
    <FichaProvider datos={{ valores: d.ficha, fotos: d.fotos, slug: d.slug }}>
      <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
        <Compact><OportunidadCompact /></Compact>
        <Desk>
          <ScaledCanvas width={1920} height={4395}>
            <Oportunidad />
          </ScaledCanvas>
        </Desk>
      </main>
    </FichaProvider>
  );
}
