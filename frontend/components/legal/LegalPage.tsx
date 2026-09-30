import { Fragment } from "react";

import { MARK, WORDMARK, tinted } from "@/components/brand";
import IndiceVivo from "@/components/legal/IndiceVivo";
import MobileFooter from "@/components/responsive/MobileFooter";

/* ═══════════════════════════════════════════════════════════════════════════
   PÁGINA LEGAL — Términos, y la Política de Privacidad cuando llegue.

   No va en el lienzo de 1920 como el resto del sitio, y es a propósito: el
   lienzo escala un diseño de Figma de medidas fijas, y aquí no hay diseño
   que escalar sino texto largo que leer. En el lienzo, un párrafo de cinco
   renglones en un portátil de 1366 queda a 11 px efectivos; en flujo normal
   el texto se queda a su tamaño y es el ancho de la columna lo que se ajusta.
   Por lo mismo el pie es el de móvil, que es fluido; el del escritorio es
   una pieza del lienzo y fuera de él no se sostiene.

   Lo que la hace Zequara es el mismo lenguaje del resto del sitio: la franja
   marrón de arriba con el titular en Poppins light y una palabra en
   extrabold, el antetítulo espaciado en mayúsculas, la esquina grande
   redondeada (la del pie, en espejo), el plano de ciudad y la órbita de
   `circulos.png` como textura, y los números en Cormorant de los pasos de la
   ficha de predio. El texto largo, en cambio, va sobre el crema y en una
   columna de lectura: la marca está en el marco, no en el párrafo.

   El documento es un dato (`components/legal/terminos.ts`), y esta página
   sólo lo pinta: la de privacidad será otro archivo de datos con esta misma
   página.
   ═══════════════════════════════════════════════════════════════════════════ */

export type SeccionLegal = {
  titulo: string;
  parrafos?: string[];
  lista?: string[];
  contacto?: { k: string; v: string; href?: string }[];
};

export type DocumentoLegal = {
  titulo: string;
  /** Parte del título que va en extrabold, como en los titulares del sitio. */
  destacado?: string;
  bajada: string;
  empresa: string;
  actualizado: string;
  /** El PDF firmado, para descargar. */
  pdf?: string;
  aviso?: { titulo: string; texto: string };
  secciones: SeccionLegal[];
};

const A = "/figma";

/* Sobre el crema. El café de los acentos es más oscuro que `brown-48`: ése
   sobre el crema no llega al contraste que necesita un texto de 12 px. */
const ACENTO = "#8b5e34";
const TEXTO = "#5b4332";
const DRIFT = "#a57a4e";
const VERDIGRIS = "#5f6b3e";

/* Sobre el marrón. */
const LINEN = "#f7f1e5";
const LINEN80 = "rgba(247,241,229,0.8)";
const LASER = "#c9a877";

const ancla = (i: number) => `seccion-${i + 1}`;
const num = (i: number) => String(i + 1).padStart(2, "0");
const SERIF = "var(--font-cormorant), Georgia, serif";
/** El plano de ciudad es un rectángulo: se funde por los bordes para que no se
    vea el recorte sobre el marrón. */
const FUNDIDO = "radial-gradient(ellipse 50% 50% at 50% 50%, #000 30%, transparent 100%)";

function IcoDescarga() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

function IcoVolver() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

function IcoArriba() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

function IcoAviso() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6l7-3z" />
      <path d="M12 8v4.5M12 15.6v.1" />
    </svg>
  );
}

/** El título con su parte destacada en extrabold; el resto, light. */
function Titulo({ texto, destacado }: { texto: string; destacado?: string }) {
  const i = destacado ? texto.indexOf(destacado) : -1;
  if (!destacado || i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <span className="font-extrabold">{destacado}</span>
      {texto.slice(i + destacado.length)}
    </>
  );
}

/** Las entradas del índice. `oscuro` es el fijo de escritorio, sobre marrón. */
function Indice({ secciones, oscuro }: { secciones: SeccionLegal[]; oscuro?: boolean }) {
  return (
    <ol className="m-0 list-none p-0">
      {secciones.map((s, i) => (
        <li key={i}>
          <a
            href={`#${ancla(i)}`}
            className={`legal-enlace legal-item flex gap-[12px] rounded-[10px] px-[12px] py-[7px] text-[14px] leading-[1.45] transition-colors ${oscuro ? "legal-item-oscuro legal-enlace-claro" : ""}`}
          >
            <span className="legal-item-num w-[20px] shrink-0 tabular-nums font-medium">{num(i)}</span>
            <span>{s.titulo}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function LegalPage({ doc }: { doc: DocumentoLegal }) {
  return (
    <main id="top" className="min-h-screen overflow-x-clip bg-cream-93 text-brown-dark">
      {/* ── Franja de marca ────────────────────────────────────────────────
          La cabecera va dentro: la marca y la salida, sin el menú entero. En
          una página que se abre para leer una cláusula, lo que se busca es
          volver. */}
      <div className="relative isolate overflow-hidden rounded-bl-[clamp(56px,9vw,150px)] bg-brown-dark" style={{ backgroundImage: "linear-gradient(160deg,#492100 0%,#3d2104 62%,#2a1e14 100%)" }}>
        {/* Textura: el plano de ciudad de «Cómo operamos», muy tenue. */}
        <img
          src={`${A}/como-ciudad.webp`}
          alt=""
          aria-hidden
          decoding="async"
          className="pointer-events-none absolute bottom-[-28%] right-[-12%] -z-10 w-[min(900px,110%)] max-w-none opacity-[0.12] sm:bottom-[-40%] sm:w-[min(900px,75%)]"
          style={{ maskImage: FUNDIDO, WebkitMaskImage: FUNDIDO }}
        />
        {/* La órbita de Oportunidades, como un sello con el monograma dentro. */}
        <div aria-hidden className="pointer-events-none absolute right-[max(-80px,calc((100vw-1180px)/2-120px))] top-[100px] -z-10 hidden aspect-[655/607] w-[400px] opacity-60 xl:block">
          <img src={`${A}/circulos.png`} alt="" decoding="async" className="absolute inset-0 block size-full max-w-none" />
          <span className="absolute left-1/2 top-1/2 block h-[112px] w-[123px] -translate-x-1/2 -translate-y-1/2 opacity-80" style={tinted(MARK, "#c59f72")} />
        </div>

        <header className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-[16px] sm:h-[88px] sm:px-[32px]">
          <a href="/" aria-label="Zequara — Inicio" className="legal-enlace legal-enlace-claro ix-nav block rounded-[4px]">
            <span role="img" aria-label="Zequara" className="block h-[22px] w-[135px] sm:h-[26px] sm:w-[159px]" style={tinted(WORDMARK, "#e2cdae")} />
          </a>
          <a
            href="/"
            className="legal-enlace legal-enlace-claro inline-flex h-[40px] items-center gap-[8px] rounded-full border border-solid border-[rgba(223,197,159,0.4)] px-[16px] text-[14px] font-medium text-sand transition-colors hover:border-sand hover:bg-[rgba(223,197,159,0.1)]"
          >
            <IcoVolver />
            <span>Volver<span className="hidden sm:inline"> al inicio</span></span>
          </a>
        </header>

        <div className="mx-auto max-w-[1180px] px-[16px] pb-[clamp(96px,11vw,136px)] pt-[clamp(36px,6vw,80px)] sm:px-[32px]">
          <div className="max-w-[780px]">
            <p className="m-0 flex items-center gap-[14px] text-[12px] font-light uppercase tracking-[6px] text-[#cd9a64] sm:text-[13px] sm:tracking-[7px]">
              <span aria-hidden className="h-px w-[36px] bg-[#cd9a64] opacity-70" />
              Documento legal
            </p>
            <h1 className="m-0 mt-[20px] text-[clamp(2.35rem,6.6vw,4.9rem)] font-extralight leading-[1.04] tracking-[-0.025em] text-cream [text-wrap:balance]">
              <Titulo texto={doc.titulo} destacado={doc.destacado} />
            </h1>
            <p className="m-0 mt-[22px] max-w-[620px] text-[clamp(1rem,2.1vw,1.2rem)] font-light leading-[1.6]" style={{ color: LINEN80 }}>
              {doc.bajada}
            </p>

            <div className="mt-[34px] flex flex-col gap-[22px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[32px]">
              {doc.pdf && (
                <a
                  href={doc.pdf}
                  download
                  className="ix-press legal-enlace legal-enlace-claro inline-flex h-[52px] shrink-0 items-center justify-center gap-[10px] self-start rounded-full bg-cream px-[26px] text-[15px] font-semibold text-brown-dark shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]"
                >
                  <IcoDescarga />
                  Descargar PDF
                </a>
              )}
              <p className="m-0 border-solid border-[rgba(226,205,174,0.25)] text-[13.5px] font-light leading-[1.65] sm:border-l sm:pl-[24px]" style={{ color: LINEN80 }}>
                <span className="font-medium" style={{ color: LINEN }}>{doc.empresa}</span>
                <br />
                Última actualización: {doc.actualizado}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-[16px] pb-[96px] sm:px-[32px]">
        {/* ── El aviso, montado sobre el borde de la franja ─────────────── */}
        {doc.aviso && (
          <aside className="relative z-[1] -mt-[clamp(52px,6vw,72px)] flex max-w-[860px] gap-[16px] rounded-[20px] border border-solid border-[rgba(165,122,78,0.22)] bg-[#fffaf1] p-[20px] shadow-[0_24px_48px_-28px_rgba(42,30,20,0.45)] sm:gap-[20px] sm:p-[28px]">
            {/* En escritorio el icono lleva su columna; en móvil sube junto al
                antetítulo, para no quitarle 56 px de ancho al párrafo. */}
            <span aria-hidden className="hidden size-[46px] shrink-0 items-center justify-center rounded-full sm:flex" style={{ background: "rgba(127,139,87,0.16)", color: VERDIGRIS }}>
              <IcoAviso />
            </span>
            <div className="min-w-0">
              <p className="m-0 flex items-center gap-[10px] text-[12px] font-semibold uppercase tracking-[3px]" style={{ color: VERDIGRIS }}>
                <span aria-hidden className="flex size-[32px] shrink-0 items-center justify-center rounded-full sm:hidden" style={{ background: "rgba(127,139,87,0.16)" }}>
                  <IcoAviso />
                </span>
                {doc.aviso.titulo}
              </p>
              <p className="m-0 mt-[8px] text-[15.5px] leading-[1.7] text-brown-dark sm:text-[16px]">{doc.aviso.texto}</p>
            </div>
          </aside>
        )}

        {/* Índice arriba en móvil, plegable: 25 entradas seguidas antes del
            texto serían una pantalla y media de lista. */}
        <details data-legal-indice className="legal-indice mt-[32px] rounded-[20px] border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(255,255,255,0.4)] lg:hidden">
          <summary className="legal-enlace flex cursor-pointer list-none items-center justify-between gap-[12px] rounded-[20px] px-[20px] py-[16px]">
            <span className="flex items-baseline gap-[12px]">
              <span className="text-[12px] font-semibold uppercase tracking-[3px]" style={{ color: ACENTO }}>Contenido</span>
              <span className="text-[14px] font-light" style={{ color: TEXTO }}>{doc.secciones.length} secciones</span>
            </span>
            <span className="flex size-[32px] items-center justify-center rounded-full bg-brown-dark text-cream">
              <svg className="legal-flecha" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </summary>
          <nav aria-label="Contenido del documento" className="px-[8px] pb-[12px]">
            <Indice secciones={doc.secciones} />
          </nav>
        </details>

        <div className="mt-[48px] lg:mt-[72px] lg:grid lg:grid-cols-[292px_minmax(0,1fr)] lg:gap-[64px] xl:gap-[88px]">
          {/* Índice fijo a un lado en escritorio: una pieza marrón, como las
              tarjetas oscuras del sitio, para que se lea como navegación y
              no como parte del texto. */}
          <nav aria-label="Contenido del documento" data-legal-indice className="hidden lg:block">
            <div data-legal-caja className="legal-caja sticky top-[24px] max-h-[calc(100vh-48px)] overflow-y-auto rounded-[20px] bg-[#2a1e14] px-[10px] pb-[14px] pt-[22px]">
              <p className="m-0 mb-[10px] flex items-center justify-between px-[12px] text-[12px] font-light uppercase tracking-[5px] text-[#cd9a64]">
                Contenido
                <span className="tracking-normal" style={{ color: "rgba(247,241,229,0.55)" }}>{doc.secciones.length}</span>
              </p>
              <Indice secciones={doc.secciones} oscuro />
            </div>
          </nav>

          <article className="min-w-0 max-w-[760px]">
            {doc.secciones.map((s, i) => (
              <section
                key={i}
                id={ancla(i)}
                className="scroll-mt-[28px] border-t border-solid border-[rgba(165,122,78,0.2)] py-[36px] first:border-t-0 first:pt-0 sm:grid sm:grid-cols-[76px_minmax(0,1fr)] sm:py-[44px]"
              >
                <span aria-hidden className="block text-[40px] font-bold leading-none sm:mt-[-4px] sm:text-[48px]" style={{ fontFamily: SERIF, color: DRIFT, fontVariantNumeric: "lining-nums" }}>
                  {num(i)}
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 mt-[10px] text-[clamp(1.25rem,2.4vw,1.5rem)] font-semibold leading-[1.3] tracking-[-0.01em] sm:mt-0">
                    <span className="sr-only">{num(i)}. </span>
                    {s.titulo}
                  </h2>

                  {s.parrafos?.map((p, j) => (
                    <p key={j} className="m-0 mt-[14px] max-w-[68ch] text-[16px] leading-[1.8] sm:text-[16.5px]" style={{ color: TEXTO }}>{p}</p>
                  ))}

                  {s.lista && (
                    <ul className="m-0 mt-[16px] flex max-w-[68ch] list-none flex-col gap-[12px] p-0">
                      {s.lista.map((item, j) => (
                        <li key={j} className="flex gap-[14px] text-[16px] leading-[1.75] sm:text-[16.5px]" style={{ color: TEXTO }}>
                          <span aria-hidden className="mt-[11px] size-[7px] shrink-0 rounded-full bg-olive" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {s.contacto && (
                    <dl className="m-0 mt-[24px] grid gap-x-[24px] gap-y-[4px] rounded-[20px] bg-[#2a1e14] p-[22px] text-[15px] sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-y-[12px] sm:p-[28px]">
                      {s.contacto.map((c) => (
                        <Fragment key={c.k}>
                          <dt className="mt-[10px] text-[12px] font-light uppercase tracking-[2.5px] text-[#cd9a64] first:mt-0 sm:mt-[2px]">{c.k}</dt>
                          <dd className="m-0 break-words" style={{ color: LINEN }}>
                            {c.href ? (
                              <a href={c.href} className="legal-enlace legal-enlace-claro rounded-[4px] text-sand underline decoration-[rgba(223,197,159,0.4)] underline-offset-[4px] transition-colors hover:decoration-sand">
                                {c.v}
                              </a>
                            ) : c.v}
                          </dd>
                        </Fragment>
                      ))}
                    </dl>
                  )}
                </div>
              </section>
            ))}

            {/* Remate: el sello, y las dos salidas que se buscan al terminar. */}
            <div className="mt-[20px] flex flex-col items-start gap-[22px] rounded-[20px] border border-solid border-[rgba(165,122,78,0.25)] bg-[rgba(255,255,255,0.4)] p-[22px] sm:flex-row sm:items-center sm:justify-between sm:p-[28px]">
              <div className="flex items-center gap-[16px]">
                <span role="img" aria-label="Zequara" className="block h-[40px] w-[44px] shrink-0" style={tinted(MARK, "#492100")} />
                <p className="m-0 text-[14px] leading-[1.5]" style={{ color: TEXTO }}>
                  <span className="font-semibold text-brown-dark">{doc.titulo}</span>
                  <br />
                  {doc.actualizado}
                </p>
              </div>
              <div className="flex flex-wrap gap-[10px]">
                {doc.pdf && (
                  <a href={doc.pdf} download className="ix-press legal-enlace inline-flex h-[44px] items-center gap-[9px] rounded-full bg-brown-dark px-[20px] text-[14px] font-medium text-cream">
                    <IcoDescarga />
                    Descargar PDF
                  </a>
                )}
                <a href="#top" className="legal-enlace inline-flex h-[44px] items-center gap-[8px] rounded-full border border-solid border-brown-dark px-[18px] text-[14px] font-medium text-brown-dark transition-colors hover:bg-brown-dark hover:text-cream">
                  <IcoArriba />
                  Volver arriba
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>

      <IndiceVivo ids={doc.secciones.map((_, i) => ancla(i))} />
      <MobileFooter />
    </main>
  );
}
