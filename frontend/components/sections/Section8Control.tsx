const A = "/figma";

/** Seccion 8 — Control de obra + indicadores (1922 × 1383) */
export default function Section8Control() {
  return (
    <div className="bg-cream overflow-clip relative rounded-tr-[250px] size-full" data-name="Seccion 8">
      {/* Heading */}
      <div className="[word-break:break-word] absolute font-medium leading-[0] left-[355px] not-italic text-brown-dark text-[0px] top-[95px] w-[1331px]">
        <p className="font-normal leading-[1.097] mb-0 text-[25px]">Control de obra + indicadores financieros</p>
        <p className="font-black leading-[1.097] text-[60px]">No solo ves tu inversión. La entiendes.</p>
      </div>
      <p className="[word-break:break-word] absolute font-normal leading-[1.142] left-[355px] not-italic text-brown-dark text-[25px] top-[197px] w-[1680px]">
        Nosotros la gestionamos. Tú la sigues y la entiendes, mes a mes
      </p>

      {/* Info band */}
      <div className="absolute bg-[rgba(197,156,108,0.2)] h-[224px] left-[355px] rounded-bl-[50px] rounded-tr-[50px] top-[276px] w-[1215px]" />

      {/* Column dividers */}
      <div className="absolute flex h-[156.003px] items-center justify-center left-[744px] top-[308px] w-0">
        <div className="-rotate-90 flex-none">
          <div className="h-0 relative w-[156.003px]">
            <div className="absolute inset-[-4px_0_0_0]">
              <img loading="lazy" decoding="async" alt="" className="block max-w-none size-full" src={`${A}/edbc63e282e73ce64eabf2c42701f7ba60028c2d.svg`} />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[156.003px] items-center justify-center left-[1217px] top-[308px] w-0">
        <div className="-rotate-90 flex-none">
          <div className="h-0 relative w-[156.003px]">
            <div className="absolute inset-[-4px_0_0_0]">
              <img loading="lazy" decoding="async" alt="" className="block max-w-none size-full" src={`${A}/2d593e4aee8eab6346a45d50b3c2eebf0abb06f5.svg`} />
            </div>
          </div>
        </div>
      </div>

      {/* Column 1 */}
      <p className="[word-break:break-word] absolute font-black leading-[normal] left-[380px] not-italic text-brown-dark text-[25px] top-[322px] w-[434px]">Cómo va la remodelación </p>
      <p className="[word-break:break-word] absolute font-normal leading-[normal] left-[380px] not-italic text-brown-dark text-[20px] top-[378px] w-[350px]">En qué etapa está la obra y qué se ha hecho, cuando quieras verlo.</p>
      {/* Column 2 */}
      <p className="[word-break:break-word] absolute font-black leading-[normal] left-[783px] not-italic text-brown-dark text-[25px] top-[322px] w-[434px]">Cómo van los números </p>
      <p className="[word-break:break-word] absolute font-normal leading-[normal] left-[783px] not-italic text-brown-dark text-[20px] top-[378px] w-[399px]">Cuánto se ha invertido, cuánto te renta y cuánto vale tu inmueble hoy.</p>
      {/* Column 3 */}
      <p className="[word-break:break-word] absolute font-black leading-[normal] left-[1245px] not-italic text-brown-dark text-[25px] top-[322px] w-[434px]">Cómo va tu zona</p>
      <p className="[word-break:break-word] absolute font-normal leading-[normal] left-[1238px] not-italic text-brown-dark text-[20px] top-[367px] w-[282px]">Si la demanda sigue firme y cómo se mueve el valor de tu predio, mes a mes.</p>

      {/* Dashboard image */}
      <div className="absolute h-[572px] left-[478px] rounded-[50px] top-[566px] w-[1003px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[50px] size-full" src={`${A}/4055e80987b7d215e0e7f999065b3a68fa45677b.webp`} />
      </div>

      {/* Badge under image */}
      <div className="absolute bg-[#c1986c] h-[86px] left-[1234px] rounded-bl-[61px] rounded-tr-[60px] shadow-[8px_5px_4.4px_0px_rgba(0,0,0,0.25)] top-[1066px] w-[302px]" />
      <div className="[word-break:break-word] absolute font-normal leading-[0] left-[1275px] not-italic text-[0px] text-white top-[1081px] w-[310px]">
        <p className="font-extrabold leading-[1.137] mb-0 text-brown-dark text-[16px]">Así se ve tu inversión</p>
        <p className="text-[16px]">
          <span className="leading-[1.137]">El mismo modelo que eligió tu inmueble, </span>
          <span className="[word-break:break-word] font-extrabold leading-[1.137] not-italic">ahora lo cuida.</span>
        </p>
      </div>
    </div>
  );
}
