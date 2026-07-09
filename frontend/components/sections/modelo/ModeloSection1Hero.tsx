import CountUp from "@/components/motion/CountUp";

const A = "/figma";

/** PAGINA MODELO · Seccion 1 — Hero (1920 × 1263) */
export default function ModeloSection1Hero() {
  return (
    <div className="relative size-full" data-name="Seccion 1">
      {/* Background video — falls back to the poster until it loads (or if it can't play) */}
      <div className="absolute left-0 top-0 h-[1080px] w-[1920px]">
        <video
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={`${A}/0709_2-poster.jpg`}
        >
          <source src={`${A}/0709_2.webm`} type="video/webm" />
          <source src={`${A}/0709_2.mp4`} type="video/mp4" />
        </video>
      </div>
      {/* Brown overlay */}
      <div className="absolute bg-[rgba(73,33,0,0.6)] h-[1079px] left-0 top-0 w-[1920px]" />

      {/* Small logo → inicio */}
      <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute h-[34.12px] left-[222px] top-[115px] w-[175.28px]">
        <img alt="Serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
      </a>

      {/* Nav */}
      <a href="/" className="ix-navlink absolute flex items-center justify-center left-[1095px] p-[10px] top-[118px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Inicio</p>
      </a>
      <a href="/hub" className="ix-navlink absolute flex items-center justify-center left-[1270px] p-[10px] top-[117px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Hub</p>
      </a>
      <a href="/modelo" className="ix-navlink absolute flex items-center justify-center left-[1419px] p-[10px] top-[118px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Modelo</p>
      </a>
      <a href="/login" className="ix-fill absolute border-4 border-sand border-solid flex items-center justify-center left-[1609px] px-[25px] py-[24px] rounded-[98px] top-[106px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[24px] whitespace-nowrap">Iniciar sesión</p>
      </a>

      {/* Heading */}
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-medium justify-center leading-[0] left-[959.5px] not-italic text-cream-93 text-[80px] text-center top-[382px] tracking-[-2px] whitespace-nowrap">
        <p className="leading-[88px] mb-0">Suma las mejores</p>
        <p className="leading-[88px] mb-0">propiedades a tu</p>
        <p className="leading-[88px]">patrimonio.</p>
      </div>

      {/* Subtext */}
      <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-light justify-center leading-[0] left-[971px] not-italic text-[0px] text-center top-[603.5px] whitespace-nowrap">
        <p className="mb-0 text-[20.8px]">
          <span className="font-light leading-[32.24px] text-[rgba(247,241,229,0.86)]">Inviertes en finca raíz para hacer crecer tu patrimonio. </span>
          <span className="font-medium leading-[32.24px] text-[#f7f1e5]">Serava</span>
        </p>
        <p className="mb-0 text-[20.8px]">
          <span className="font-medium leading-[32.24px] text-[#f7f1e5]">pone el criterio técnico</span>
          <span className="font-light leading-[32.24px] text-[rgba(247,241,229,0.86)]"> y veinte años construyendo para que cada</span>
        </p>
        <p className="font-light leading-[32.24px] text-[20.8px] text-[rgba(247,241,229,0.86)]">operación sume.</p>
      </div>

      {/* CTA → solicitud de acceso */}
      <a href="/solicitud-acceso" className="ix-invert ix-pulse absolute bg-cream h-[104px] left-[758px] overflow-clip rounded-[98px] top-[682px] w-[404px] block">
        <div className="-translate-x-1/2 [word-break:break-word] absolute font-semibold h-[68px] leading-[0] left-[202px] not-italic text-brown-dark text-[24px] text-center top-[18px] w-[295px] whitespace-pre-wrap">
          <p className="leading-[90.645%] mb-0">Conoce el proceso </p>
          <p className="leading-[90.645%]">de acceso</p>
        </div>
      </a>

      {/* Stats */}
      <p className="absolute font-medium leading-[64.48px] left-[602px] not-italic text-tan-63 text-[50px] top-[847px] whitespace-nowrap"><CountUp value={20} prefix="+" /></p>
      <p className="absolute font-light leading-[20.34px] left-[602px] not-italic text-[20px] top-[911.47px] tracking-[0.525px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.75)" }}>Años de experiencia</p>

      <p className="absolute font-medium leading-[64.48px] left-[865px] not-italic text-tan-63 text-[50px] top-[846px] whitespace-nowrap"><CountUp value={20} prefix="+" /></p>
      <p className="absolute font-light leading-[20.34px] left-[865px] not-italic text-[20px] top-[910.47px] tracking-[0.525px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.75)" }}>Proyectos estructurados</p>

      <p className="absolute font-medium leading-[64.48px] left-[1146.19px] not-italic text-tan-63 text-[50px] top-[846px] whitespace-nowrap"><CountUp value={7000} prefix="+" suffix="m²" /></p>
      <p className="absolute font-light leading-[20.34px] left-[1157px] not-italic text-[20px] top-[909.47px] tracking-[0.525px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.75)" }}>Intervenidos</p>
    </div>
  );
}
