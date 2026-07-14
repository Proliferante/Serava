const A = "/figma";

type PasoProps = {
  cardLeft: string;
  cardBg: string;
  label: string;
  title: string;
  titleTop: number;
  body: React.ReactNode;
  bodyTop: number;
  bodyColor: string;
  badge?: boolean;
};

/**
 * Glass step card: frosted background + luminous edge (border) as in Figma,
 * with a hover lift and border-glow. Everything lives in one container so the
 * whole card reacts to hover.
 */
function PasoCard({ cardLeft, cardBg, label, title, titleTop, body, bodyTop, bodyColor, badge }: PasoProps) {
  return (
    <div
      className="group absolute h-[378px] top-[403px] w-[245.46px] transition-transform duration-300 will-change-transform hover:-translate-y-2"
      style={{ left: cardLeft }}
    >
      {/* Frosted glass surface with luminous border */}
      <div
        className="absolute inset-0 rounded-[50px] backdrop-blur-[10px] border border-solid border-[rgba(247,241,229,0.14)] transition-[border-color,box-shadow] duration-300 group-hover:border-[rgba(247,241,229,0.4)] group-hover:shadow-[0px_24px_48px_-20px_rgba(0,0,0,0.55)]"
        style={{ background: cardBg }}
      />
      <p className="[word-break:break-word] absolute left-[33px] top-[41px] w-[171.62px] font-semibold leading-[18.35px] not-italic text-tan-63 text-[11.8px] tracking-[2.368px]">{label}</p>
      <p className="[word-break:break-word] absolute left-[32px] w-[171.62px] font-semibold leading-[26.4px] not-italic text-cream-93 text-[24px] tracking-[-0.6px]" style={{ top: titleTop }}>{title}</p>
      <p className="[word-break:break-word] absolute left-[33px] w-[171.62px] font-light leading-[22.82px] not-italic text-[15px]" style={{ top: bodyTop, color: bodyColor }}>{body}</p>
      {badge && (
        <div className="absolute left-[38.83px] top-[313px] w-[167.65px] flex flex-col items-start pb-[5.36px] pt-[4px] px-[11px] rounded-[999px]" style={{ background: "rgba(247,241,229,0.2)" }}>
          <p className="[word-break:break-word] font-semibold leading-[16.37px] not-italic text-cream-93 text-[10.6px] text-center tracking-[1.69px] uppercase w-[145px]">El corazón del modelo</p>
        </div>
      )}
    </div>
  );
}

/** PAGINA MODELO · Seccion 3 — Veinte años, 4 pasos (1928 × 911) */
export default function ModeloSection3Pasos() {
  return (
    <div className="bg-brown-dark overflow-clip relative rounded-br-[150px] rounded-tl-[150px] size-full" data-name="Seccion 3">
      {/* Left image — node 279:1162, imagen ya recortada 713×911 */}
      <img
        loading="lazy"
        decoding="async"
        alt=""
        className="absolute object-cover pointer-events-none"
        style={{ left: 0, top: 0, width: 713, height: 911 }}
        src={`${A}/Pagina_Modelo_Seccion3.webp`}
      />

      {/* Eyebrow + divider */}
      <div className="absolute bg-[#a57a4e] h-px left-[1636px] opacity-80 top-[132px] w-[36px]" />
      <p className="[word-break:break-word] absolute font-semibold leading-[17.86px] left-[1436px] not-italic text-sand text-[11.5px] top-[124px] tracking-[3.456px] uppercase w-[183.16px]">Así trabaja para ti</p>

      {/* Heading (right aligned, right edge at x1679) */}
      <div className="[word-break:break-word] absolute font-semibold leading-[0] left-[713px] not-italic text-cream-93 text-[60px] text-right top-[158px] tracking-[-1.28px] w-[966px]">
        <p className="mb-0">
          <span className="font-extralight leading-[56.32px] not-italic">Veinte años de experiencia,</span>
          <span className="leading-[56.32px]"> </span>
          <span className="font-black leading-[56.32px] not-italic">en</span>
        </p>
        <p className="font-black leading-[56.32px]">cada etapa de tu inversión.</p>
      </div>

      {/* Subtitle (right aligned) */}
      <div className="[word-break:break-word] absolute font-light leading-[0] not-italic text-[18.4px] text-right top-[289px] w-[522px] left-[1157px]" style={{ color: "rgba(247,241,229,0.8)" }}>
        <p className="leading-[28.52px] mb-0">El criterio de Christian hoy es método: el mismo estándar,</p>
        <p className="leading-[28.52px]">aplicado paso a paso a tu activo.</p>
      </div>

      {/* Cards */}
      <PasoCard
        cardLeft="713px" cardBg="rgba(73,33,0,0.2)"
        label="01 · Entrar"
        title="Entrar" titleTop={146}
        body="Cada zona se analiza con tecnología. Inviertes donde la demanda lo respalda."
        bodyTop={215} bodyColor="rgba(247,241,229,0.78)"
      />
      <PasoCard
        cardLeft="979.48px" cardBg="rgba(73,33,0,0.2)"
        label="02 · Comprar"
        title="Comprar" titleTop={146}
        body="Predios curados por ese criterio. Recibes solo los que pasan el filtro."
        bodyTop={203} bodyColor="rgba(247,241,229,0.78)"
      />
      <PasoCard
        cardLeft="1245.95px" cardBg="rgba(104,117,64,0.2)"
        label="03 · Transformar"
        title="Transformar" titleTop={88}
        body={<>
          El corazón del modelo:<br />remodelación por<br />eficiencia, materiales con criterio, interventoría aparte de la obra, todo a costo cerrado.
        </>}
        bodyTop={132} bodyColor="rgba(247,241,229,0.9)"
        badge
      />
      <PasoCard
        cardLeft="1517.72px" cardBg="rgba(73,33,0,0.2)"
        label="04 · Sostener"
        title="Sostener" titleTop={154}
        body="Administración y arriendo coordinados durante toda la tenencia."
        bodyTop={199} bodyColor="rgba(247,241,229,0.78)"
      />
    </div>
  );
}
