import { WORDMARK, wordmarkH } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   PIE DE MÓVIL Y TABLET.

   El del escritorio son 1922 × 364 con cuatro bloques en absoluto: wordmark,
   lema y las columnas NAVEGA y CUENTA. Aquí se apila, pero no es un volcado:
   en un pie de móvil lo que se toca son los enlaces, así que cada uno ocupa
   una fila completa de 52 px con su filete —objetivo cómodo para el pulgar en
   vez de una lista de texto pegado— y las dos acciones de CUENTA suben a
   botones, que es lo que se busca al llegar al final de la página.

   Las columnas se ponen en fila a partir de 640, donde ya hay ancho.
   ═══════════════════════════════════════════════════════════════════════════ */

const NAVEGA = [
  { href: "/", label: "Inicio" },
  { href: "/modelo", label: "¿Cómo operamos?" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/hub", label: "HUB" },
];

/** Flecha de los enlaces: señala que la fila entera es tocable. */
function Arrow() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export default function MobileFooter() {
  const w = 200;
  return (
    <footer className="rounded-tr-[64px] bg-brown-dark px-[24px] pb-[32px] pt-[48px] sm:px-[40px]">
      <div className="mx-auto max-w-[720px]">
        <a href="/" aria-label="Zequara — Inicio" className="block" style={{ width: w, height: wordmarkH(w) }}>
          <img src={WORDMARK} alt="Zequara" loading="lazy" decoding="async" className="block size-full max-w-none" />
        </a>

        <p className="mt-[22px] max-w-[420px] text-[clamp(1.05rem,4.6vw,1.35rem)] leading-[1.5] text-white">
          <span className="font-extrabold">Tú sumas un inmueble a tu patrimonio. </span>
          <span className="font-normal italic text-[#c1986c]">Nosotros hacemos el resto.</span>
        </p>

        {/* Navega: una fila por enlace, tocable de borde a borde. */}
        <p className="mt-[34px] text-[12px] font-extralight uppercase tracking-[6px] text-[#cd9a64]">Navega</p>
        <ul className="mt-[6px] flex list-none flex-col p-0 sm:grid sm:grid-cols-2 sm:gap-x-[24px]">
          {NAVEGA.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="ix-navlink flex h-[52px] items-center justify-between border-b border-solid border-[rgba(226,205,174,0.14)] text-[16px] font-light text-sand"
              >
                {l.label}
                <span className="opacity-50"><Arrow /></span>
              </a>
            </li>
          ))}
        </ul>

        {/* Cuenta. En el escritorio es la segunda columna con dos enlaces;
            aquí suben a botones, que es lo que se busca al llegar al final. */}
        <p className="mt-[30px] text-[12px] font-extralight uppercase tracking-[6px] text-[#cd9a64]">Cuenta</p>
        <div className="mt-[14px] flex flex-col gap-[10px] sm:flex-row">
          <a href="/login" className="ix-press flex h-[54px] shrink-0 items-center justify-center rounded-full sm:flex-1 border-2 border-solid border-sand text-[15.5px] font-medium text-sand">
            Iniciar sesión
          </a>
          <a href="/solicitud-acceso" className="ix-press flex h-[54px] shrink-0 items-center justify-center rounded-full sm:flex-1 bg-cream text-[15.5px] font-semibold text-brown-dark">
            Solicita acceso
          </a>
        </div>

        <p className="mt-[26px] text-[12.5px] font-light leading-[1.5] text-[rgba(226,205,174,0.5)]">
          © {new Date().getFullYear()} Zequara. Portafolio reservado para un grupo limitado de inversionistas. Acceso sujeto a evaluación.
        </p>
      </div>
    </footer>
  );
}
