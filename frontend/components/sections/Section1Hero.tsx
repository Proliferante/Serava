import CountUp from "@/components/motion/CountUp";
import { WORDMARK } from "@/components/brand";
import { CTA_PORTAFOLIO, CTA_PORTAFOLIO_HREF } from "@/components/copy";

const A = "/figma";

/** Seccion 1 — Hero (1920 × 1634) */
export default function Section1Hero() {
  return (
    <div className="relative size-full" data-name="Seccion 1">
      {/* Background video — falls back to the poster image until it loads (or if it can't play) */}
      <div className="absolute h-[2752px] left-[-229px] top-[-592px] w-[2149px]">
        <video
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={`${A}/hero-home-poster.webp`}
        >
          <source src={`${A}/hero-home.webm`} type="video/webm" />
          <source src={`${A}/hero-home.mp4`} type="video/mp4" />
        </video>
      </div>

      {/* Brown overlay */}
      <div className="absolute bg-[rgba(73,33,0,0.6)] h-[1634px] left-0 top-0 w-[1920px]" />

      {/* Glow ellipses behind wordmark */}
      <div className="absolute h-[827px] left-[1026px] top-[104px] w-[597px]">
        <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/1dfbb9b347803e8d29183672cfb540bcde4bf7f2.svg`} />
      </div>
      <div className="absolute h-[827px] left-[389px] top-[114px] w-[597px]">
        <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/1dfbb9b347803e8d29183672cfb540bcde4bf7f2.svg`} />
      </div>


      {/* Wordmark grande. Conserva el ancho y el centro vertical del bloque
          anterior: el de Zequara es algo más apaisado (6.12:1 contra 5.10:1). */}
      <div className="absolute h-[116.59px] left-[406px] top-[273.68px] w-[713.07px]">
        <img loading="lazy" decoding="async" alt="Zequara" className="absolute block inset-0 max-w-none size-full" src={WORDMARK} />
      </div>

      {/* H1 dominante. Manda la promesa, no el lema: el lema explica cómo se
          siente y la promesa dice qué es, y en el primer pantallazo hay que
          decir primero qué es.
          43 px y no los 55 de antes: medido en pantalla, «Inversión
          inmobiliaria gestionada» ocupa 782 px a 46 px de cuerpo desde
          x=412, o sea que llegaba a 1194 y se metía por encima del divisor
          vertical de x=1168. A 43 acaba en 1143 y deja aire. */}
      <h1 className="[word-break:break-word] absolute font-semibold leading-[1.05] left-[412px] not-italic text-cream text-[43px] top-[452px] whitespace-nowrap">
        <span className="block">Inversión inmobiliaria gestionada</span>
        <span className="block">de principio a fin.</span>
      </h1>
      {/* El lema, ahora de bajada. Ocupa la misma caja que ocupaba la promesa. */}
      <p className="[word-break:break-word] absolute font-medium leading-[1.25] left-[412px] not-italic text-cream text-[30px] top-[601px] whitespace-nowrap">
        Invierte tu capital,<br /><span className="text-tan">no tu tiempo.</span>
      </p>

      {/* Right stats */}
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1212px] not-italic text-cream text-[30px] top-[342px] whitespace-nowrap">Proyectos estructurados</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1213px] not-italic text-cream text-[30px] top-[519px] whitespace-nowrap">Intervenidos</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1212px] not-italic text-cream text-[30px] top-[708px] whitespace-nowrap">Años de experiencia</p>
      <p className="[word-break:break-word] absolute font-extrabold leading-[normal] left-[1212px] not-italic text-cream text-[80px] top-[255px] whitespace-nowrap"><CountUp value={20} prefix="+" /></p>
      <p className="[word-break:break-word] absolute font-extrabold leading-[normal] left-[1212px] not-italic text-cream text-[80px] top-[619px] whitespace-nowrap"><CountUp value={20} prefix="+" /></p>
      <p className="[word-break:break-word] absolute font-extrabold leading-[normal] left-[1212px] not-italic text-cream text-[60px] top-[452px] whitespace-nowrap"><CountUp value={7000} prefix="+" suffix="m2" /></p>

      {/* Bajada de cierre. Dice qué hace Zequara por ti, explícito: el texto
          anterior («encuentra el activo») no decía con qué criterio.
          Ocupa dos renglones, así que el degradado de más abajo se corrió de
          936 a 990 — se pinta después que esto, o sea encima. */}
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-medium leading-[1.15] left-[973px] not-italic text-cream text-[32px] text-center top-[861px] w-[1188px]">
        Zequara encuentra por ti el inmueble que tenga mayor potencial de valorización, lo remodela sin sobrecostos y lo administra.
      </p>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-black leading-[normal] left-[980.5px] not-italic text-cream text-[32px] text-center top-[941px] w-[1109px]">
        Tú sumas un inmueble a tu patrimonio, rentando y valorizándose.
      </p>

      {/* Vertical divider */}
      <div className="absolute flex h-[560px] items-center justify-center left-[1168px] top-[239px] w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[560px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <img loading="lazy" decoding="async" alt="" className="block max-w-none size-full" src={`${A}/8c07a4ebf48c45c15932e14ac70c3ec7615aa25e.svg`} />
            </div>
          </div>
        </div>
      </div>
      {/* Two short horizontal dividers between stats */}
      <div className="absolute flex h-[1.038px] items-center justify-center left-[1212px] top-[417px] w-[180px]">
        <div className="flex-none rotate-[-0.33deg]">
          <div className="h-0 relative w-[180.003px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <img loading="lazy" decoding="async" alt="" className="block max-w-none size-full" src={`${A}/b23a0fa6bdbbeca7b97667f44c377bfe6b7d95c4.svg`} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[1.038px] items-center justify-center left-[1212px] top-[591px] w-[180px]">
        <div className="flex-none rotate-[-0.33deg]">
          <div className="h-0 relative w-[180.003px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <img loading="lazy" decoding="async" alt="" className="block max-w-none size-full" src={`${A}/b23a0fa6bdbbeca7b97667f44c377bfe6b7d95c4.svg`} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bg-gradient-to-b from-[14.361%] from-[rgba(205,154,100,0)] h-[237px] left-0 to-[#e2cdae] to-[99.98%] top-[990px] via-[#e2cdae] via-[62.407%] w-[1920px]" />


      {/* CTA button → solicitud de acceso */}
      {/* El botón se ensancha de 404 a 470: «Quiero acceder al portafolio» no
          cabe en 404 a 24 px sin partirse en dos renglones dentro de una
          píldora de 104 px de alto. */}
      <a href={CTA_PORTAFOLIO_HREF} className="ix-olive ix-pulse-green absolute h-[104px] left-[412px] overflow-clip rounded-[98px] top-[713px] w-[470px] flex items-center justify-center" style={{ background: "#7f8b57" }}>
        <p className="[word-break:break-word] font-semibold not-italic text-[24px] text-center leading-[1.15]" style={{ color: "#f7f1e5" }}>
          {CTA_PORTAFOLIO}
        </p>
      </a>
    </div>
  );
}
