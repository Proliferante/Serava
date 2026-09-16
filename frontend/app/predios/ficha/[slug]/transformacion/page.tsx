import { notFound } from "next/navigation";
import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import TransformacionCompact from "@/components/responsive/predios/ficha/TransformacionCompact";
import Transformacion from "@/components/predios/ficha/Transformacion";
import { FichaProvider } from "@/components/predios/ficha/datos";
import { fichaPredio } from "@/lib/predios";

/** FICHA DE UN PREDIO PUBLICADO · TRANSFORMACIÓN. */
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fichaPredio(slug);
  return { title: d ? `${d.tarjeta.title} · Transformación · Zequara` : "Predio no encontrado · Zequara" };
}

export default async function FichaPredioTransformacionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fichaPredio(slug);
  if (!d) notFound();

  return (
    <FichaProvider datos={{ valores: d.ficha, fotos: d.fotos, slug: d.slug }}>
      <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
        <Compact><TransformacionCompact /></Compact>
        <Desk>
          <ScaledCanvas width={1920} height={2705}>
            <Transformacion />
          </ScaledCanvas>
        </Desk>
      </main>
    </FichaProvider>
  );
}
