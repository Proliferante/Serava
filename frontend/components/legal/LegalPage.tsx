import { WORDMARK, tinted } from "@/components/brand";
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
  bajada: string;
  empresa: string;
  actualizado: string;
  /** El PDF firmado, para descargar. */
  pdf?: string;
  aviso?: { titulo: string; texto: string };
  secciones: SeccionLegal[];
};

/* El café de los acentos, más oscuro que `brown-48`: ese sobre el crema no
   llega al contraste que necesita un texto de 12 px. */
const ACENTO = "#8b5e34";
const TEXTO = "#5b4332";

const ancla = (i: number) => `seccion-${i + 1}`;
const num = (i: number) => String(i + 1).padStart(2, "0");

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

function Indice({ secciones }: { secciones: SeccionLegal[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {secciones.map((s, i) => (
        <li key={i}>
          <a
            href={`#${ancla(i)}`}
            className="legal-enlace flex gap-[12px] rounded-[8px] py-[7px] text-[14px] leading-[1.45] transition-colors hover:text-brown-dark"
            style={{ color: TEXTO }}
          >
            <span className="w-[20px] shrink-0 tabular-nums font-medium" style={{ color: ACENTO }}>{num(i)}</span>
            <span>{s.titulo}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function LegalPage({ doc }: { doc: DocumentoLegal }) {
  return (
    <main className="min-h-screen bg-cream-93 text-brown-dark">
      {/* Cabecera: la marca y la salida. Sin el menú entero: en una página que
          se abre para leer una cláusula, lo que se busca es volver. */}
      <header className="border-b border-solid border-[rgba(165,122,78,0.22)]">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-[16px] sm:px-[32px]">
          <a href="/" aria-label="Zequara — Inicio" className="legal-enlace block rounded-[4px]">
            <span role="img" aria-label="Zequara" className="block h-[24px] w-[147px]" style={tinted(WORDMARK, "#492100")} />
          </a>
          <a href="/" className="legal-enlace inline-flex items-center gap-[8px] rounded-[6px] text-[14.5px] font-medium" style={{ color: TEXTO }}>
            <IcoVolver />
            <span>Volver al inicio</span>
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-[16px] pb-[96px] pt-[48px] sm:px-[32px] sm:pt-[72px]">
        {/* Encabezado del documento */}
        <div className="max-w-[760px]">
          <p className="m-0 text-[12px] font-semibold uppercase tracking-[3.5px]" style={{ color: ACENTO }}>
            Documento legal
          </p>
          <h1 className="mt-[14px] text-[clamp(2rem,5.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.5px]">
            {doc.titulo}
          </h1>
          <p className="mt-[18px] text-[clamp(1rem,2.2vw,1.18rem)] font-light leading-[1.6]" style={{ color: TEXTO }}>
            {doc.bajada}
          </p>

          <div className="mt-[26px] flex flex-col gap-[18px] sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-[13.5px] leading-[1.6]" style={{ color: TEXTO }}>
              <span className="font-medium text-brown-dark">{doc.empresa}</span>
              <br />
              Última actualización: {doc.actualizado}
            </p>
            {doc.pdf && (
              <a
                href={doc.pdf}
                download
                className="ix-press legal-enlace inline-flex h-[46px] shrink-0 items-center justify-center gap-[9px] self-start rounded-full border border-solid border-brown-dark px-[22px] text-[14.5px] font-medium text-brown-dark transition-colors hover:bg-brown-dark hover:text-cream-93 sm:self-auto"
              >
                <IcoDescarga />
                Descargar PDF
              </a>
            )}
          </div>

          {doc.aviso && (
            <aside
              className="mt-[36px] rounded-[16px] border-l-[3px] border-solid px-[22px] py-[20px]"
              style={{ borderColor: "#c59f72", background: "rgba(197,159,114,0.14)" }}
            >
              <p className="m-0 text-[13px] font-semibold uppercase tracking-[2px]" style={{ color: ACENTO }}>
                {doc.aviso.titulo}
              </p>
              <p className="mt-[8px] text-[15.5px] leading-[1.65] text-brown-dark">{doc.aviso.texto}</p>
            </aside>
          )}
        </div>

        {/* Índice arriba en móvil, plegable: 25 entradas seguidas antes del
            texto serían una pantalla y media de lista. */}
        <details className="legal-indice mt-[40px] rounded-[16px] border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(255,255,255,0.35)] lg:hidden">
          <summary className="legal-enlace flex cursor-pointer list-none items-center justify-between rounded-[16px] px-[20px] py-[16px] text-[15px] font-medium">
            Contenido · {doc.secciones.length} secciones
            <svg className="legal-flecha" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <nav aria-label="Contenido del documento" className="px-[20px] pb-[14px]">
            <Indice secciones={doc.secciones} />
          </nav>
        </details>

        <div className="mt-[40px] lg:mt-[64px] lg:grid lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-[72px]">
          {/* Índice fijo a un lado en escritorio */}
          <nav aria-label="Contenido del documento" className="hidden lg:block">
            <div className="sticky top-[32px] max-h-[calc(100vh-64px)] overflow-y-auto pr-[8px]">
              <p className="m-0 mb-[10px] text-[12px] font-semibold uppercase tracking-[3px]" style={{ color: ACENTO }}>
                Contenido
              </p>
              <Indice secciones={doc.secciones} />
            </div>
          </nav>

          <article className="max-w-[720px]">
            {doc.secciones.map((s, i) => (
              <section
                key={i}
                id={ancla(i)}
                className="scroll-mt-[28px] border-t border-solid border-[rgba(165,122,78,0.2)] py-[34px] first:border-t-0 first:pt-0"
              >
                <h2 className="m-0 flex items-baseline gap-[14px] text-[clamp(1.25rem,2.6vw,1.55rem)] font-semibold leading-[1.25]">
                  <span className="font-[family-name:var(--font-cormorant)] text-[1.35em] leading-none" style={{ color: "#a57a4e" }}>
                    {num(i)}
                  </span>
                  <span>{s.titulo}</span>
                </h2>

                {s.parrafos?.map((p, j) => (
                  <p key={j} className="mt-[14px] text-[16px] leading-[1.75]" style={{ color: TEXTO }}>{p}</p>
                ))}

                {s.lista && (
                  <ul className="mt-[16px] flex list-none flex-col gap-[12px] p-0">
                    {s.lista.map((item, j) => (
                      <li key={j} className="flex gap-[14px] text-[16px] leading-[1.7]" style={{ color: TEXTO }}>
                        <span aria-hidden className="mt-[11px] size-[6px] shrink-0 rounded-full" style={{ background: "#c59f72" }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {s.contacto && (
                  <dl className="mt-[20px] grid gap-x-[24px] gap-y-[10px] rounded-[16px] bg-[rgba(255,255,255,0.45)] p-[20px] text-[15px] sm:grid-cols-[140px_1fr]">
                    {s.contacto.map((c) => (
                      <div key={c.k} className="contents">
                        <dt className="font-medium" style={{ color: ACENTO }}>{c.k}</dt>
                        <dd className="m-0 break-words text-brown-dark">
                          {c.href ? (
                            <a href={c.href} className="legal-enlace rounded-[4px] underline decoration-[rgba(73,33,0,0.3)] underline-offset-[3px] hover:decoration-brown-dark">
                              {c.v}
                            </a>
                          ) : c.v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            ))}
          </article>
        </div>
      </div>

      <MobileFooter />
    </main>
  );
}
