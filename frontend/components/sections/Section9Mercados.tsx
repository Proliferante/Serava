import MercadoPill from "@/components/sections/MercadoPill";
import CityCard from "@/components/sections/CityCard";

const A = "/figma";

/** Seccion 9 — Mercados / criterio replicable (2010 × 1420) */
export default function Section9Mercados() {
  return (
    <div className="bg-brown-dark overflow-clip relative rounded-tl-[150px] size-full" data-name="Seccion 9">
      {/* Background image */}
      <div className="absolute h-[1249px] left-[-164px] top-[100px] w-[2237px]">
        <div className="absolute inset-0 opacity-20 overflow-hidden pointer-events-none">
          <img loading="lazy" decoding="async" alt="" className="absolute h-[119.49%] left-0 max-w-none top-[-19.49%] w-full" src={`${A}/63f0d4b26acea5bd4269d62fe7c1683462dc68c9.webp`} />
        </div>
      </div>

      {/* Heading (right aligned) */}
      <p className="[word-break:break-word] absolute font-black leading-[normal] left-[797px] not-italic text-cream text-[60px] text-right top-[97px] w-[753px]">El criterio de entrada</p>
      <div className="[word-break:break-word] absolute font-normal leading-[0] left-[711px] not-italic text-[25px] text-right top-[178px] w-[839px]" style={{ color: "rgba(247,241,229,0.78)" }}>
        <p className="leading-[29.26px] mb-0">Los datos, el diseño, la curaduría y el seguimiento son Serava,</p>
        <p className="leading-[29.26px]">estés donde estés.</p>
      </div>

      {/* Operación activa hoy + divider */}
      <p className="[word-break:break-word] absolute font-semibold leading-[17.86px] left-[401px] not-italic text-olive text-[18px] top-[341px] tracking-[2.995px] uppercase w-[307px]">Operación activa hoy</p>
      <div className="absolute bg-gradient-to-r from-[rgba(165,122,78,0.28)] h-[3px] left-[701px] to-[rgba(165,122,78,0)] top-[350px] w-[974px]" />

      {/* City cards (staggered scroll-in + hover) */}
      <CityCard left="399px" imgSrc={`${A}/5ff4aca097d9134d9e43d10cf9529ab553333003.webp`} shadow label="bOGOTÁ" delay={0} />
      <CityCard left="701.03px" imgSrc={`${A}/9ce42d8da5619ae5f7fc7aa4f180a3a3e5fbd140.webp`} crop label="MEDELLÍN" delay={0.12} />
      <CityCard left="1003.05px" imgSrc={`${A}/59fc56f5d5802c6aeac8c0975f569485d84c9956.webp`} crop label="BARRANQUILLA" delay={0.24} />
      <CityCard left="1307px" imgSrc={`${A}/06d0daed474f187ce01ccba75bba182d031da45c.webp`} label="PANAMÁ" delay={0.36} />

      {/* Interest panel */}
      <div className="absolute bg-[rgba(73,33,0,0.2)] backdrop-blur-[10px] border border-solid border-[rgba(247,241,229,0.12)] h-[357px] left-[399px] rounded-[50px] top-[832px] w-[1186px]" />

      <p className="[word-break:break-word] absolute font-normal leading-[24.8px] left-[463px] not-italic text-[16px] top-[882px] tracking-[4.16px] uppercase w-[405px]" style={{ color: "rgba(247,241,229,0.74)" }}>¿Dónde te gustaría invertir?</p>
      <div className="[word-break:break-word] absolute font-semibold leading-[0] left-[463px] not-italic text-[35px] text-cream-93 top-[919px] w-[539px]">
        <p className="leading-[40.32px] mb-0">Replicamos el modelo</p>
        <p className="leading-[40.32px] mb-0">completo a nuevos mercados</p>
        <p className="leading-[40.32px] mb-0">según el interés de nuestros</p>
        <p className="leading-[40.32px]">inversionistas.</p>
      </div>
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[465px] not-italic text-[16px] top-[1090px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.74)" }}>
        <p className="leading-[24.8px] mb-0">Cuéntanos a qué mercado mirarías. Lo tendremos</p>
        <p className="leading-[24.8px]">en cuenta para nuestras próximas plazas.</p>
      </div>

      {/* Country pills */}
      <MercadoPill left="1105px" top="896px" width="178px" label="México" />
      <MercadoPill left="1046px" top="972px" width="237px" label="Estados Unidos" />
      <MercadoPill left="1307px" top="896px" width="178px" label="Costa Rica" />
      <MercadoPill left="1307px" top="972px" width="178px" label="España" />
      <MercadoPill left="1307px" top="1048px" width="178px" label="Otro" />
    </div>
  );
}
