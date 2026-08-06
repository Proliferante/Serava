import { MARK } from "@/components/brand";
const A = "/figma";

/**
 * HEADER compartido — frame 426:1114 de Figma (1920 × 173).
 *
 * Barra marrón con las esquinas inferiores redondeadas a 80px, el wordmark a
 * la izquierda, cuatro enlaces y el botón de acceso. Se pinta como la última
 * capa de cada página para quedar por encima del hero.
 *
 * Coordenadas tomadas del diseño; los enlaces son textos sueltos dentro del
 * frame, así que van en absoluto en lugar de un flex.
 */

type LinkProps = { href: string; left: number; top: number; children: React.ReactNode };
function NavLink({ href, left, top, children }: LinkProps) {
  return (
    <a
      href={href}
      className="ix-navlink absolute whitespace-nowrap font-medium leading-[45px] not-italic text-sand text-[30px]"
      style={{ left, top }}
    >
      {children}
    </a>
  );
}

export default function Navbar() {
  return (
    <nav className="absolute left-0 top-0 h-[173px] w-[1920px] rounded-bl-[80px] rounded-br-[80px] bg-brown-dark" aria-label="Principal">
      {/* Wordmark (426:1116) */}
      <a href="/" aria-label="Zequara — Inicio" className="ix-nav absolute left-[121px] top-[56px] h-[56px] w-[61.38px]">
        <img loading="lazy" decoding="async" alt="Zequara" className="absolute inset-0 block size-full max-w-none" src={MARK} />
      </a>

      {/* Los nombres de capa en Figma ("HUB", "MODELO BTN") están obsoletos:
          son instancias con override de texto. Las etiquetas reales salen del
          render del header de Cómo operamos (426:1129/1130/1131). */}
      <NavLink href="/" left={532} top={64}>Inicio</NavLink>
      <NavLink href="/modelo" left={697} top={63}>¿Cómo operamos?</NavLink>
      <NavLink href="/oportunidades" left={1039} top={64}>Oportunidades</NavLink>
      <NavLink href="/hub" left={1353} top={64}>HUB</NavLink>

      {/* Registro btn (426:1127) */}
      <a
        href="/login"
        className="ix-fill absolute left-[1591px] top-[39px] flex h-[84px] w-[209px] items-center justify-center rounded-[98px] border-4 border-solid border-sand"
      >
        <span className="whitespace-nowrap font-medium leading-[normal] not-italic text-sand text-[24px]">Iniciar sesión</span>
      </a>
    </nav>
  );
}
