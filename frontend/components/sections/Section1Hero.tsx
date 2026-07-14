import CountUp from "@/components/motion/CountUp";

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

      {/* Small logo top-left → inicio */}
      <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute h-[34.12px] left-[214px] top-[99px] w-[175.28px]">
        <img loading="lazy" decoding="async" alt="Serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
      </a>

      {/* Big .serava. wordmark */}
      <div className="absolute h-[139.94px] left-[406px] top-[262px] w-[713.07px]">
        <img loading="lazy" decoding="async" alt=".serava." className="absolute block inset-0 max-w-none size-full" src={`${A}/d9b1e9d601a843e82663d6c4512aa26ff643e90e.svg`} />
      </div>

      {/* Left headline block */}
      <div className="[word-break:break-word] absolute font-medium leading-[0] left-[412px] not-italic text-cream text-[0px] top-[452px] whitespace-nowrap">
        <p className="leading-[normal] mb-0 text-[30px]">Invierte tu capital,</p>
        <p className="leading-[67.09%] text-tan text-[55px]">no tu tiempo.</p>
      </div>
      <div className="[word-break:break-word] absolute font-medium leading-[0] left-[416px] not-italic text-cream text-[0px] top-[587px] whitespace-nowrap">
        <p className="leading-[normal] mb-0 text-[30px]">Inversión inmobiliaria gestionada,</p>
        <p className="leading-[67.09%] text-tan text-[55px]">de principio a fin.</p>
      </div>

      {/* Right stats */}
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1212px] not-italic text-cream text-[30px] top-[342px] whitespace-nowrap">Proyectos estructurados</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1213px] not-italic text-cream text-[30px] top-[519px] whitespace-nowrap">Intervenidos</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1212px] not-italic text-cream text-[30px] top-[708px] whitespace-nowrap">Años de experiencia</p>
      <p className="[word-break:break-word] absolute font-extrabold leading-[normal] left-[1212px] not-italic text-cream text-[80px] top-[255px] whitespace-nowrap"><CountUp value={20} prefix="+" /></p>
      <p className="[word-break:break-word] absolute font-extrabold leading-[normal] left-[1212px] not-italic text-cream text-[80px] top-[619px] whitespace-nowrap"><CountUp value={20} prefix="+" /></p>
      <p className="[word-break:break-word] absolute font-extrabold leading-[normal] left-[1212px] not-italic text-cream text-[60px] top-[452px] whitespace-nowrap"><CountUp value={7000} prefix="+" suffix="m2" /></p>

      {/* Bottom claim */}
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-medium leading-[normal] left-[973px] not-italic text-cream text-[32px] text-center top-[893px] w-[1188px]">
        Serava encuentra el activo lo remodela sin sobrecostos y lo administra.
      </p>
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-black leading-[normal] left-[980.5px] not-italic text-cream text-[32px] text-center top-[931px] w-[1109px]">
        Tu sumas un inmueble a tu patrimonio, rentando y valorizándose.
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
      <div className="absolute bg-gradient-to-b from-[14.361%] from-[rgba(205,154,100,0)] h-[237px] left-0 to-[#e2cdae] to-[99.98%] top-[936px] via-[#e2cdae] via-[62.407%] w-[1920px]" />

      {/* Nav: Iniciar sesión (outline button) */}
      <a href="/login" className="ix-fill absolute border-4 border-sand border-solid flex items-center justify-center left-[1556px] px-[25px] py-[24px] rounded-[98px] top-[72px]">
        <p className="[word-break:break-word] font-medium leading-[normal] not-italic text-sand text-[24px] whitespace-nowrap">Iniciar sesión</p>
      </a>
      {/* Nav: Inicio */}
      <a href="/" className="ix-navlink absolute flex items-center justify-center left-[990px] p-[10px] top-[82px]">
        <p className="[word-break:break-word] font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Inicio</p>
      </a>
      {/* Nav: Hub */}
      <a href="/hub" className="ix-navlink absolute flex items-center justify-center left-[1155px] p-[10px] top-[82px]">
        <p className="[word-break:break-word] font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Hub</p>
      </a>
      {/* Nav: Modelo */}
      <a href="/modelo" className="ix-navlink absolute flex items-center justify-center left-[1304px] p-[10px] top-[82px]">
        <p className="[word-break:break-word] font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Modelo</p>
      </a>

      {/* CTA button → solicitud de acceso */}
      <a href="/solicitud-acceso" className="ix-invert ix-pulse absolute bg-cream h-[104px] left-[412px] overflow-clip rounded-[98px] top-[713px] w-[404px] flex items-center justify-center">
        <div className="[word-break:break-word] font-semibold not-italic text-brown-dark text-[24px] text-center leading-[1.15]">
          <p className="mb-0">Conoce el proceso</p>
          <p>de acceso</p>
        </div>
      </a>
    </div>
  );
}
