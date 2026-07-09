import ScaledCanvas from "@/components/ScaledCanvas";
import { RevealLayer } from "@/components/motion/Reveal";
import Section1Hero from "@/components/sections/Section1Hero";
import Section2Criterio from "@/components/sections/Section2Criterio";
import Section3Proceso from "@/components/sections/Section3Proceso";
import Section4Caso from "@/components/sections/Section4Caso";
import Section5Crowdfunding from "@/components/sections/Section5Crowdfunding";
import Section7Remodelamos from "@/components/sections/Section7Remodelamos";
import Section8Control from "@/components/sections/Section8Control";
import Section9Mercados from "@/components/sections/Section9Mercados";
import Section10Diagnostico from "@/components/sections/Section10Diagnostico";
import Footer from "@/components/sections/Footer";

const CANVAS_W = 1920;
const CANVAS_H = 9539;

type Placed = {
  left: number;
  top: number;
  width: number;
  height: number;
  children: React.ReactNode;
};

function Layer({ left, top, width, height, children }: Placed) {
  return (
    <div style={{ position: "absolute", left, top, width, height }}>{children}</div>
  );
}

/**
 * HOME SERAVA — reproducción exacta del frame de Figma (1920 × 9539).
 * Las secciones se apilan por coordenadas absolutas respetando el orden de
 * pintado del diseño (Sección 7 se pinta antes que la 5, etc.).
 */
export default function Home() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        {/* Hero is visible on load — no scroll reveal (handled by PageTransition) */}
        <Layer left={0} top={0} width={1920} height={1634}><Section1Hero /></Layer>
        <RevealLayer left={0} top={1092} width={1920} height={1337}><Section2Criterio /></RevealLayer>
        <RevealLayer left={0} top={2077} width={1920} height={1345}><Section3Proceso /></RevealLayer>
        <RevealLayer left={0} top={3250} width={1920} height={972}><Section4Caso /></RevealLayer>
        <RevealLayer left={-2} top={4577} width={1922} height={1688}><Section7Remodelamos /></RevealLayer>
        <RevealLayer left={-2} top={4222} width={1922} height={490}><Section5Crowdfunding /></RevealLayer>
        <RevealLayer left={-2} top={5977} width={1922} height={1383}><Section8Control /></RevealLayer>
        <RevealLayer left={-2} top={7177} width={2010} height={1420}><Section9Mercados /></RevealLayer>
        <RevealLayer left={0} top={8442} width={1920} height={869}><Section10Diagnostico /></RevealLayer>
        <Layer left={-2} top={9175} width={1922} height={364}><Footer /></Layer>
      </ScaledCanvas>
    </main>
  );
}
