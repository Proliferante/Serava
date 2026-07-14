import FiltroCard from "@/components/sections/FiltroCard";

const A = "/figma";

/** Seccion 2 — El criterio de entrada (1920 × 1337) */
export default function Section2Criterio() {
  return (
    <div className="bg-cream relative size-full" data-name="Seccion 2">
      {/* Bogotá map background */}
      <div className="absolute h-[3415px] left-[-709px] top-[-916px] w-[2629px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover opacity-20 pointer-events-none size-full" src={`${A}/2cddbd3323c70d04c23ee3ff2c94699c7988af39.webp`} />
      </div>

      {/* Heading (right aligned) */}
      <p className="-translate-x-full [word-break:break-word] absolute font-black leading-[normal] left-[1648px] not-italic text-brown-dark text-[60px] text-right top-[116px] w-[753px]">
        El criterio de entrada
      </p>
      <p className="-translate-x-full [word-break:break-word] absolute font-medium leading-[normal] left-[1468px] not-italic text-brown-dark text-[25px] text-right top-[188px] w-[573px]">
        No todo inmueble entra a
      </p>
      {/* .serava. logo (dark) next to subtitle */}
      <div className="absolute h-[184px] left-[1446px] overflow-clip top-[114px] w-[244px]">
        <div className="absolute inset-[40.84%_14.84%_40.84%_14.77%]">
          <img loading="lazy" decoding="async" alt="serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/b3c936d0ee3f55dc8ac3ee141faf4956708f4fbe.svg`} />
        </div>
      </div>

      {/* Three filter cards */}
      <FiltroCard
        cardLeft="883px"
        label="Filtro 01"
        title="La zona"
        body="Solo operamos en zonas donde la demanda es alta y la oferta es limitada. El terreno tiene que defender el valor por si mismo."
        bodyColor="rgba(247,241,229,0.9)" delay={0}
      />
      <FiltroCard
        cardLeft="1149.46px"
        label="Filtro 02"
        title="El inmueble"
        body="Cada predio pasa por un filtro arquitectónico, financiero y legal antes de entrar. Sin sorpresas estructurales ni jurídicas."
        bodyColor="rgba(247,241,229,0.78)" delay={0.12}
      />
      <FiltroCard
        cardLeft="1415.92px"
        label="Filtro 03"
        title="El momento"
        body="Los predios que pasan por el filtro se asignan rápido. Si está disponible, es porque hay oportunidad ahora."
        bodyColor="rgba(247,241,229,0.78)" delay={0.24}
      />

      {/* "Así se construye patrimonio." */}
      <p className="[word-break:break-word] absolute leading-[0] left-[883px] not-italic text-brown-dark top-[669px] w-[788px]">
        <span className="font-extralight leading-[normal] text-[55px]">Así se construye</span>
        <span className="font-bold leading-[normal] text-[55px]"> patrimonio.</span>
      </p>

      {/* CTA → solicitud de acceso */}
      <a href="/solicitud-acceso" className="ix-invert absolute bg-cream h-[104px] left-[1234px] overflow-clip rounded-[98px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] top-[787px] w-[404px] flex items-center justify-center">
        <div className="[word-break:break-word] font-semibold not-italic text-brown-dark text-[24px] text-center leading-[1.15]">
          <p className="mb-0">Conoce el proceso</p>
          <p>de acceso</p>
        </div>
      </a>
    </div>
  );
}
