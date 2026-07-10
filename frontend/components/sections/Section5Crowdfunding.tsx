const A = "/figma";

/** Seccion 5 — "no es crowdfunding" (1922 × 490) */
export default function Section5Crowdfunding() {
  return (
    <div className="bg-[#3d1a00] relative size-full" data-name="Seccion 5">
      {/* Heading: [.serava.] no es crowdfunding. */}
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-bold leading-[0] left-[1048px] not-italic text-[0px] text-center text-white top-[39px] w-[1048px] whitespace-pre-wrap">
        <span className="font-black leading-[1.142] text-[60px]">                     </span>
        <span className="font-black leading-[1.142] text-[#cd9a63] text-[60px]">no es </span>
        <span className="font-black leading-[1.142] text-[60px]">crowdfunding.</span>
      </p>
      {/* .serava. logo overlaying the leading space */}
      <div className="absolute h-[57.46px] left-[492px] top-[38px] w-[326px]">
        <img loading="lazy" decoding="async" alt="serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/2e39f364b769701627707fff24c20391c60f5845.svg`} />
      </div>

      {/* Body paragraph */}
      <div className="-translate-x-1/2 [word-break:break-word] absolute font-normal leading-[0] left-[995.5px] not-italic text-[20px] text-center text-white top-[147px] w-[1373px] whitespace-pre-wrap">
        <p className="font-black leading-[1.49] mb-0">Es inversión patrimonial en activos reales.</p>
        <p className="leading-[1.49] mb-0">&#8203;</p>
        <p className="leading-[1.49] mb-0">No compras una fracción colectiva.</p>
        <p className="leading-[1.49] mb-0">Inviertes en un inmueble tangible, seleccionado por su ubicación, potencial de valorización y capacidad de transformación.</p>
        <p className="leading-[1.49] mb-0">&#8203;</p>
        <p className="leading-[1.49] mb-0">Serava gestiona la operación y mantiene visible la información de mercado del inmueble, para que puedas evaluar cuándo conservar, arrendar, vender o reinvertir.</p>
        <p className="leading-[1.49] mb-0">&#8203;</p>
        <p className="leading-[1.49]">Una forma directa de invertir en finca raíz, con un activo propio y datos claros para tomar decisiones.</p>
      </div>
    </div>
  );
}
