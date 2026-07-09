import ScaledCanvas from "@/components/ScaledCanvas";
import { RevealLayer } from "@/components/motion/Reveal";
import ModeloSection1Hero from "@/components/sections/modelo/ModeloSection1Hero";
import ModeloSection2Christian from "@/components/sections/modelo/ModeloSection2Christian";
import ModeloSection3Pasos from "@/components/sections/modelo/ModeloSection3Pasos";
import AntesDespuesSection from "@/components/sections/AntesDespuesSection";
import ModeloSection4Control from "@/components/sections/modelo/ModeloSection4Control";
import ModeloSection5Acceso from "@/components/sections/modelo/ModeloSection5Acceso";
import Footer from "@/components/sections/Footer";

const CANVAS_W = 1920;
const CANVAS_H = 6216;

function Layer({ left, top, width, height, children }: { left: number; top: number; width: number; height: number; children: React.ReactNode }) {
  return <div style={{ position: "absolute", left, top, width, height }}>{children}</div>;
}

/**
 * PAGINA MODELO — reproducción exacta del frame de Figma (1920 × 6216).
 * Orden de pintado del diseño: 1, 2, 5, 4, Antes/Después, 3, footer.
 */
export default function ModeloPage() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        <Layer left={0} top={0} width={1920} height={1263}><ModeloSection1Hero /></Layer>
        <RevealLayer left={0} top={1079} width={1920} height={1135}><ModeloSection2Christian /></RevealLayer>
        <RevealLayer left={0} top={4900} width={1920} height={1260}><ModeloSection5Acceso /></RevealLayer>
        <RevealLayer left={0} top={4168} width={1920} height={966}><ModeloSection4Control /></RevealLayer>
        <RevealLayer left={0} top={2742} width={1920} height={1499}><AntesDespuesSection /></RevealLayer>
        <RevealLayer left={0} top={2022} width={1928} height={911}><ModeloSection3Pasos /></RevealLayer>
        <Layer left={0} top={5852} width={1922} height={364}><Footer /></Layer>
      </ScaledCanvas>
    </main>
  );
}
