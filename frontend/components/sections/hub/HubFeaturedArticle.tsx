import { DocIcon, ArrowIcon } from "./icons";

/** PAGINA HUB · Artículo destacado (Component 3) — 1048 × 447.52 */
export default function HubFeaturedArticle() {
  return (
    <div className="ix-lift bg-brown-dark overflow-clip relative rounded-[24px] shadow-[0px_34px_70px_-36px_rgba(42,30,20,0.55)] size-full" data-name="Featured">
      {/* Left image placeholder */}
      <div className="absolute flex flex-col gap-[8.195px] h-[447.52px] items-center justify-center left-0 p-[16px] right-[487.44px] top-0" style={{ backgroundImage: "linear-gradient(135deg, rgba(201,168,119,0.12) 0%, rgba(201,168,119,0) 100%)" }}>
        <DocIcon size={28} style={{ color: "rgba(247,241,229,0.6)" }} />
        <div className="[word-break:break-word] flex flex-col font-semibold items-center leading-[0] not-italic text-[9.6px] text-center tracking-[1.152px] uppercase whitespace-nowrap" style={{ color: "rgba(247,241,229,0.6)" }}>
          <p className="leading-[14.4px] mb-0">Imagen artículo —</p>
          <p className="leading-[14.4px]">patrimonio</p>
        </div>
      </div>

      {/* Right text */}
      <div className="absolute flex flex-col h-[446.45px] items-start justify-center left-[560.56px] p-[56px] right-0 top-0">
        {/* Badges */}
        <div className="flex gap-[12px] items-center pb-[20px] relative w-full">
          <div className="bg-[rgba(201,168,119,0.22)] h-[28.36px] relative rounded-[999px] w-[109.42px]">
            <DocIcon size={13} className="-translate-y-1/2 absolute left-[12px] top-1/2 text-tan-63" />
            <p className="[word-break:break-word] -translate-y-1/2 absolute font-semibold leading-[16.37px] left-[32px] not-italic text-tan-63 text-[10.6px] top-1/2 tracking-[1.69px] uppercase">Artículo</p>
          </div>
          <p className="font-normal leading-[19.34px] not-italic text-cream-93 text-[12.5px] opacity-60">·</p>
          <p className="[word-break:break-word] font-semibold leading-[17.86px] not-italic text-tan-63 text-[11.5px] tracking-[1.382px] uppercase">Patrimonio</p>
        </div>

        {/* Heading */}
        <div className="[word-break:break-word] font-light leading-[0] not-italic pb-[16px] text-cream-93 text-[38.4px] tracking-[-0.768px] w-full">
          <p className="leading-[43px] mb-0">Cómo se construye</p>
          <p className="leading-[43px] mb-0">patrimonio con</p>
          <p className="leading-[43px] mb-0">finca raíz (y no solo</p>
          <p className="leading-[43px]">se compra)</p>
        </div>

        {/* Description */}
        <div className="[word-break:break-word] font-light leading-[0] max-w-[453.38px] not-italic pb-[20px] text-[16px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.82)" }}>
          <p className="leading-[24.8px] mb-0">La diferencia entre tener un inmueble y hacerlo</p>
          <p className="leading-[24.8px]">trabajar para tu patrimonio.</p>
        </div>

        {/* CTA */}
        <div className="flex gap-[10px] items-center">
          <p className="font-semibold leading-[23.56px] not-italic text-tan-63 text-[15.2px] whitespace-nowrap">Leer ahora</p>
          <ArrowIcon size={18} className="text-tan-63" />
        </div>
      </div>
    </div>
  );
}
