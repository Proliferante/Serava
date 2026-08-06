import FiltroCard from "@/components/sections/FiltroCard";
import { tinted, WORDMARK } from "@/components/brand";

const A = "/figma";

/** Seccion 2 — Criterio de entrada · "Pocas oportunidades. Para pocos." (1920 × 1337) */
export default function Section2Criterio() {
  return (
    /* overflow-clip = "Clip content" del frame en Figma. Sin él, el mapa de
       abajo (2629 × 3415 desde -709,-916) se sale 916px por arriba y se pinta
       encima del hero, que va antes en el orden del documento: sobre el video
       oscuro no se nota, pero sobre el wordmark y el botón crema se ve el
       trazado de las calles. */
    <div className="bg-cream relative size-full overflow-clip" data-name="Seccion 2">
      {/* Bogotá map background */}
      <div className="pointer-events-none absolute h-[3415px] left-[-709px] top-[-916px] w-[2629px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover opacity-20 pointer-events-none size-full" src={`${A}/2cddbd3323c70d04c23ee3ff2c94699c7988af39.webp`} />
      </div>

      {/* Heading (right aligned) */}
      <h2 className="-translate-x-full [word-break:break-word] absolute font-black leading-[1] left-[1648px] not-italic text-brown-dark text-[60px] text-right top-[116px] w-[900px]">
        Pocas oportunidades.<br />Para pocos.
      </h2>
      <p className="-translate-x-full [word-break:break-word] absolute font-medium leading-[normal] left-[1468px] not-italic text-brown-dark text-[25px] text-right top-[250px] w-[573px]">
        No todo inmueble entra a
      </p>
      {/* Wordmark que cierra la frase "No todo inmueble entra a [.zequara.]"
          (LOGO ZEQUARA 3, 50:63). Conserva el ancho y el centro vertical del
          logotipo anterior: el de Zequara es más apaisado, así que baja de alto
          en vez de crecer a la derecha y chocar con el borde de la frase.
          Va en marrón (#492100, el mismo del logotipo que sustituye) porque
          esta sección es crema: se pinta con máscara, no con el crema que el
          SVG lleva dentro. */}
      <span
        role="img"
        aria-label="Zequara"
        className="absolute block h-[28.1px] left-[1482px] top-[253.9px] w-[171.8px]"
        style={tinted(WORDMARK, "#492100")}
      />

      {/* Three filter cards */}
      <FiltroCard
        cardLeft="883px"
        label="Filtro 01"
        title="La zona"
        body="Zonas consolidadas, con alta demanda, baja oferta y bajo riesgo de pérdida de valor, seleccionadas por el Score Zequara."
        bodyColor="rgba(247,241,229,0.9)" delay={0}
      />
      <FiltroCard
        cardLeft="1149.46px"
        label="Filtro 02"
        title="El inmueble"
        body="Inmuebles con potencial real de valorización, evaluados con criterios arquitectónicos, financieros y legales, y con capacidad de convertirse en una propiedad valiosa dentro de tu portafolio."
        bodyColor="rgba(247,241,229,0.78)" delay={0.12}
      />
      <FiltroCard
        cardLeft="1415.92px"
        label="Filtro 03"
        title="El momento"
        body="Pocas propiedades superan los filtros. Cuando una aparece, quienes tienen el capital disponible son los primeros en adquirirla."
        bodyColor="rgba(247,241,229,0.78)" delay={0.24}
      />

      {/* "Así se construye patrimonio." */}
      <p className="[word-break:break-word] absolute leading-[0] left-[883px] not-italic text-brown-dark top-[747px] w-[788px]">
        <span className="font-extralight leading-[normal] text-[55px]">Así se construye</span>
        <span className="font-bold leading-[normal] text-[55px]"> patrimonio.</span>
      </p>

      {/* CTA → solicitud de acceso. Va en marrón sobre el crema de la sección;
          por eso el hover es `ix-fill`, que aclara a crema, y no `ix-invert`,
          que oscurecía —lo correcto cuando el botón era crema. */}
      <a href="/solicitud-acceso" className="ix-fill ix-pulse-brown absolute bg-brown-dark h-[104px] left-[1234px] overflow-clip rounded-[98px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] top-[865px] w-[404px] flex items-center justify-center">
        <p className="[word-break:break-word] font-semibold not-italic text-cream text-[24px] text-center leading-[1.15]">
          Solicitar Entrevista
        </p>
      </a>
    </div>
  );
}
