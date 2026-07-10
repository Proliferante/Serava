import ScaledCanvas from "@/components/ScaledCanvas";
import { RevealLayer, Reveal } from "@/components/motion/Reveal";
import HubSection1Hero from "@/components/sections/hub/HubSection1Hero";
import HubFeaturedArticle from "@/components/sections/hub/HubFeaturedArticle";
import HubNewsletter from "@/components/sections/hub/HubNewsletter";
import HubCardsGrid from "@/components/sections/hub/HubCardsGrid";
import Footer from "@/components/sections/Footer";

const A = "/figma";
const CANVAS_W = 1920;
const CANVAS_H = 3827;

function Layer({ left, top, width, height, children }: { left: number; top: number; width?: number; height?: number; children: React.ReactNode }) {
  return <div style={{ position: "absolute", left, top, width, height }}>{children}</div>;
}

/** PAGINA HUB — reproducción exacta del frame de Figma (1920 × 3827). */
export default function HubPage() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        {/* Hero */}
        <Layer left={0} top={0} width={1920} height={1263}><HubSection1Hero /></Layer>

        {/* Grid section (clipped frame): faint site-map texture + explora + newsletter + cards */}
        <div className="bg-cream" style={{ position: "absolute", left: 0, top: 1066, width: 1920, height: 2619, overflow: "hidden" }}>
          <div className="absolute left-0 top-[-332px] w-[1948px] h-[2923px] opacity-15 overflow-hidden pointer-events-none">
            <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover" src={`${A}/d97817dcb8ef87e0a52ccef1d65f05587ff8c8dd.webp`} />
          </div>

          {/* Explora header */}
          <p className="[word-break:break-word] absolute font-medium leading-[23.3px] left-[436px] not-italic text-[#3d2c1e] text-[20.8px] top-[628px] tracking-[-0.416px]">Explora el contenido</p>
          <p className="[word-break:break-word] absolute font-light leading-[21.33px] left-[1399.94px] not-italic text-[#5b4332] text-[13.8px] top-[631px]">9 resultados</p>

          {/* Newsletter */}
          <Reveal className="absolute left-[436px] top-[677.33px] w-[1048px]"><HubNewsletter /></Reveal>

          {/* Cards grid (cards stagger in individually) */}
          <div className="absolute left-[436px] top-[944.335px] w-[1048px]"><HubCardsGrid /></div>
        </div>

        {/* Featured article (painted on top, in the gap between hero and grid) */}
        <RevealLayer left={446} top={1148} width={1048} height={447.52}><HubFeaturedArticle /></RevealLayer>

        {/* Footer */}
        <Layer left={-2} top={3463} width={1922} height={364}><Footer /></Layer>
      </ScaledCanvas>
    </main>
  );
}
