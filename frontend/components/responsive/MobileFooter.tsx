import { WORDMARK, wordmarkH } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   PIE DE MÓVIL Y TABLET.

   El del escritorio son 1922 × 364 con cuatro columnas en absoluto. Aquí el
   wordmark va arriba, el lema debajo y las dos columnas de enlaces se apilan
   en móvil y se ponen en fila a partir de 640.
   ═══════════════════════════════════════════════════════════════════════════ */

const NAVEGA = [
  { href: "/", label: "Inicio" },
  { href: "/modelo", label: "¿Cómo operamos?" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/hub", label: "HUB" },
];

const CUENTA = [
  { href: "/login", label: "Iniciar sesión" },
  { href: "/solicitud-acceso", label: "Solicita acceso" },
];

function Col({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="m-0 text-[13px] font-extralight uppercase tracking-[6px] text-[#cd9a64]">{title}</p>
      <ul className="mt-[14px] flex list-none flex-col gap-[10px] p-0">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="ix-navlink text-[16px] font-light text-sand">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MobileFooter() {
  const w = 190;
  return (
    <footer className="rounded-tr-[64px] bg-brown-dark px-[24px] pb-[44px] pt-[48px] sm:px-[40px]">
      <div className="mx-auto max-w-[880px]">
        <a href="/" aria-label="Zequara — Inicio" className="block" style={{ width: w, height: wordmarkH(w) }}>
          <img src={WORDMARK} alt="Zequara" loading="lazy" decoding="async" className="block size-full max-w-none" />
        </a>

        <p className="mt-[22px] max-w-[420px] text-[19px] leading-[1.55] text-white">
          <span className="font-extrabold">Tú sumas un inmueble a tu patrimonio. </span>
          <span className="font-normal italic text-[#c1986c]">Nosotros hacemos el resto.</span>
        </p>

        <div className="mt-[36px] grid grid-cols-1 gap-[30px] sm:grid-cols-2">
          <Col title="Navega" links={NAVEGA} />
          <Col title="Cuenta" links={CUENTA} />
        </div>
      </div>
    </footer>
  );
}
