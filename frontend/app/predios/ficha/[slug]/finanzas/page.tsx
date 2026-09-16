import { notFound } from "next/navigation";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import FinanzasCompact from "@/components/responsive/predios/ficha/FinanzasCompact";
import FinanzasCanvas from "@/components/predios/ficha/FinanzasCanvas";
import { FichaProvider } from "@/components/predios/ficha/datos";
import { fichaPredio } from "@/lib/predios";

/** FICHA DE UN PREDIO PUBLICADO · FINANZAS. */
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fichaPredio(slug);
  return { title: d ? `${d.tarjeta.title} · Finanzas · Zequara` : "Predio no encontrado · Zequara" };
}

export default async function FichaPredioFinanzasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await fichaPredio(slug);
  if (!d) notFound();

  return (
    <FichaProvider datos={{ valores: d.ficha, fotos: d.fotos, slug: d.slug }}>
      <main className="min-h-screen" style={{ backgroundColor: "#e2cdae" }}>
        <Compact><FinanzasCompact /></Compact>
        <Desk><FinanzasCanvas /></Desk>
      </main>
    </FichaProvider>
  );
}
