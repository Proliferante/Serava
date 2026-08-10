"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";
import CountUp from "@/components/motion/CountUp";
import ComparativaModal from "@/components/ComparativaModal";
import { TABLE_ROWS } from "@/components/sections/Section4Caso";
import { tinted, WORDMARK, WORDMARK_RATIO, wordmarkH } from "@/components/brand";
import MobileNav from "@/components/responsive/MobileNav";
import MobileFooter from "@/components/responsive/MobileFooter";
import DiagnosticoTrigger from "@/components/DiagnosticoTrigger";

/* ═══════════════════════════════════════════════════════════════════════════
   HOME — vista fluida para móvil y tablet (por debajo de 1280).

   Mismo relato y mismo contenido que el lienzo de 1920, en una columna. Las
   diez secciones del escritorio se conservan; lo que cambia es que dejan de
   estar posicionadas al píxel y pasan a apilarse, con los tamaños de letra en
   `clamp()` para que escalen entre 320 y 1280 sin saltos.

   El movimiento es el mismo vocabulario del resto del sitio: cada bloque entra
   al aparecer en pantalla y sólo se anima `transform` y `opacity`. Los bucles
   perpetuos se quedan fuera aquí: en móvil cuestan batería y no aportan.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const EASE = [0.22, 1, 0.36, 1] as const;

/** Ancho de la columna de lectura. En tablet crece pero no se desparrama. */
const WRAP = "mx-auto w-full max-w-[720px] px-[24px] sm:px-[40px]";

/** Bloque que entra al entrar en pantalla. La base de todo lo de abajo. */
function In({ children, className, delay = 0, y = 26 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.62, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Antetítulo con su filete, como el `Rule` + eyebrow del escritorio. */
function Eyebrow({ children, tone = "laser" }: { children: ReactNode; tone?: "laser" | "brown" }) {
  const color = tone === "laser" ? "#c9a877" : "#492100";
  return (
    <div className="flex items-center gap-[12px]">
      <span className="block h-px w-[28px] shrink-0 opacity-80" style={{ background: color }} />
      <span className="text-[11px] font-semibold uppercase tracking-[2.6px]" style={{ color }}>{children}</span>
    </div>
  );
}

/** Titular de sección. `clamp` para que respire de 320 a 1280. */
function H2({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <h2
      className="mt-[14px] text-[clamp(1.75rem,6.4vw,2.6rem)] font-light leading-[1.12] tracking-[-0.02em]"
      style={{ color: dark ? "#492100" : "#f7f1e5" }}
    >
      {children}
    </h2>
  );
}

function P({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="mt-[14px] text-[clamp(0.95rem,3.6vw,1.1rem)] font-light leading-[1.6]" style={{ color: dark ? "#5b4332" : "rgba(247,241,229,0.78)" }}>
      {children}
    </p>
  );
}

/**
 * El wordmark cerrando una frase, como en el lienzo: donde el diseño pone el
 * logotipo dentro del texto no se escribe "Zequara", se pinta la marca.
 *
 * En crema va como `<img>`, que es el color que el SVG lleva dentro; en marrón
 * hay que pintarlo con máscara, porque cargado con `<img>` ese color no se
 * puede tocar desde CSS (ver components/brand.ts).
 */
function Wordmark({ w, tone = "cream" }: { w: string; tone?: "cream" | "brown" }) {
  const base = { width: w, aspectRatio: String(WORDMARK_RATIO), verticalAlign: "-0.06em" } as const;
  if (tone === "brown") {
    return <span role="img" aria-label="Zequara" className="inline-block" style={{ ...base, ...tinted(WORDMARK, "#492100") }} />;
  }
  return <img src={WORDMARK} alt="Zequara" loading="lazy" decoding="async" className="inline-block max-w-none" style={base} />;
}

/** Botón principal. 54 px de alto: el mínimo cómodo para el pulgar. */
function CTA({ href, children, tone = "cream" }: { href: string; children: ReactNode; tone?: "cream" | "olive" }) {
  const cream = tone === "cream";
  return (
    <a
      href={href}
      className="ix-press mt-[26px] flex h-[56px] w-full max-w-[340px] items-center justify-center rounded-full text-[16px] font-semibold"
      style={cream ? { background: "#e2cdae", color: "#492100" } : { background: "#7f8b57", color: "#f7f1e5" }}
    >
      {children}
    </a>
  );
}

/* ── Contenido ───────────────────────────────────────────────────────────── */

const STATS = [
  { value: 20, prefix: "+", suffix: "", label: "Proyectos estructurados" },
  { value: 7000, prefix: "+", suffix: "m²", label: "Intervenidos" },
  { value: 20, prefix: "+", suffix: "", label: "Años de experiencia" },
];

const PASOS = [
  { n: "01", t: "Accedes a oportunidades con potencial real", d: "Zonas consolidadas, con alta demanda y baja oferta, seleccionadas por el Score Zequara." },
  { n: "02", t: "Aumentas el valor de tu propiedad", d: "Diseño y obra con presupuesto cerrado. Si se pasa del presupuesto, lo asumimos nosotros." },
  { n: "03", t: "Generas retorno sin operarla", d: "Zequara administra la renta y te acompaña en la venta, para que la propiedad produzca sin convertirse en otra operación para ti." },
];

const REMODELACION = [
  { t: "Diseño atemporal", d: "Materiales naturales, líneas limpias. No seguimos tendencias porque lo que está de moda hoy desvaloriza en cinco años." },
  { t: "Materiales de calidad", d: "Mejores materiales: menos mantenimiento y un activo que conserva su valor en el tiempo." },
  { t: "Sin sobrecostos", d: "Seguimiento en cada etapa. Si la obra se pasa del presupuesto, lo asumimos nosotros." },
  { t: "Todo formalizado", d: "Cada etapa se respalda con contratos claros, desde el ingreso hasta cada servicio." },
];

const CONTROL = [
  { t: "Cómo va la remodelación", d: "En qué etapa está la obra y qué se ha hecho, cuando quieras verlo." },
  { t: "Cómo van los números", d: "Cuánto se ha invertido, cuánto te renta y cuánto vale tu inmueble hoy." },
  { t: "Cómo va tu zona", d: "Si la demanda sigue firme y cómo se mueve el valor de tu predio, mes a mes." },
];

const DIAGNOSTICO = ["Tu perfil de riesgo", "Mercados compatibles", "Ruta patrimonial sugerida"];

/** Las tres plazas activas, con las mismas fotos que las tarjetas del lienzo. */
const CIUDADES = [
  { label: "Bogotá", img: "5ff4aca097d9134d9e43d10cf9529ab553333003.webp" },
  { label: "Medellín", img: "9ce42d8da5619ae5f7fc7aa4f180a3a3e5fbd140.webp" },
  { label: "Cartagena", img: "bb6bb0436c009c10db21f42f9aeb588af022a9d0.webp" },
];

export default function HomeCompact() {
  const [comparar, setComparar] = useState(false);
  const wm = 230;
  return (
    <div className="bg-cream">
      <MobileNav />

      {/* ══════════ 1 · HERO ══════════ */}
      <section className="relative overflow-hidden" style={{ background: "#2a1e14" }}>
        <video
          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
          autoPlay muted loop playsInline preload="metadata"
          poster={`${A}/hero-home-poster.webp`}
        >
          <source src={`${A}/hero-home.webm`} type="video/webm" />
          <source src={`${A}/hero-home.mp4`} type="video/mp4" />
        </video>
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(73,33,0,0.68)" }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[160px]" style={{ backgroundImage: "linear-gradient(180deg, rgba(226,205,174,0) 0%, #e2cdae 92%)" }} />

        <div className={`${WRAP} relative pb-[112px] pt-[52px]`}>
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ width: wm, height: wordmarkH(wm) }}
          >
            <img src={WORDMARK} alt="Zequara" decoding="async" className="block size-full max-w-none" />
          </motion.div>

          <motion.h1
            className="mt-[30px] text-[clamp(2.1rem,9.2vw,3.5rem)] font-semibold leading-[1.05] text-cream"
            initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          >
            <span className="block">Invierte tu capital,</span>
            <span className="block text-tan">no tu tiempo.</span>
          </motion.h1>

          <motion.p
            className="mt-[16px] text-[clamp(1.05rem,4.4vw,1.5rem)] font-medium leading-[1.3] text-cream"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            Inversión inmobiliaria gestionada de principio a fin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            <CTA href="/solicitud-acceso">Solicitar entrevista</CTA>
          </motion.div>

          {/* Las tres cifras. En móvil una debajo de otra con su filete; a
              partir de 640 caben en fila. */}
          <div className="mt-[42px] grid grid-cols-1 gap-[2px] sm:grid-cols-3 sm:gap-[18px]">
            {STATS.map((s, i) => (
              <In key={s.label} delay={0.08 * i} y={18} className="border-t border-solid border-[rgba(226,205,174,0.24)] py-[16px] sm:border-t-0 sm:py-0">
                {/* En fila de tres el `vw` se dispara —a 820 px cada columna
                    mide 240 y el número se salía sobre el de al lado—, así que
                    a partir de `sm` la escala pasa a mirar la columna. */}
                <p className="m-0 whitespace-nowrap text-[clamp(2.2rem,10vw,3.2rem)] font-extrabold leading-[1] text-cream sm:text-[clamp(1.5rem,3.6vw,2.3rem)]">
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="m-0 mt-[4px] text-[15px] font-medium leading-[1.3] text-cream/85 sm:text-[13.5px]">{s.label}</p>
              </In>
            ))}
          </div>

          <In delay={0.1} className="mt-[38px]">
            <p className="text-[clamp(1rem,4vw,1.25rem)] font-medium leading-[1.45] text-cream">
              Zequara encuentra el activo, lo remodela sin sobrecostos y lo administra.
            </p>
            <p className="mt-[8px] text-[clamp(1rem,4vw,1.25rem)] font-black leading-[1.45] text-cream">
              Tú sumas un inmueble a tu patrimonio, rentando y valorizándose.
            </p>
          </In>
        </div>
      </section>

      {/* ══════════ 2 · CRITERIO ══════════ */}
      <section className="relative overflow-hidden">
        <img src={`${A}/2cddbd3323c70d04c23ee3ff2c94699c7988af39.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover opacity-20" />
        <div className={`${WRAP} relative py-[68px]`}>
        <In><Eyebrow tone="brown">Pocas oportunidades. Para pocos.</Eyebrow></In>
        <In delay={0.06}>
          <H2 dark>No todo inmueble entra a <Wordmark w="clamp(130px,33vw,190px)" tone="brown" /></H2>
          <P dark>Zonas consolidadas, con alta demanda, baja oferta y bajo riesgo de pérdida de valor, seleccionadas por el Score Zequara.</P>
          <P dark>Pocas propiedades superan los filtros. Cuando una aparece, quienes tienen el capital disponible son los primeros en adquirirla.</P>
          <p className="mt-[18px] text-[clamp(1.15rem,5vw,1.6rem)] font-semibold leading-[1.2] text-brown-dark">Así se construye patrimonio.</p>
        </In>
        </div>
      </section>

      {/* ══════════ 3 · PROCESO ══════════ */}
      <section className="relative overflow-hidden rounded-tr-[64px] bg-brown-dark py-[68px]">
        {/* La foto del diseño va a sangre; aquí se vela para que el texto de la
            línea de tiempo siga legible sobre ella. */}
        <img src={`${A}/c711c71d04448a3a0e845fd9b958b2015dfbf6aa.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover opacity-30" />
        <div className="pointer-events-none absolute inset-0" style={{ background: "rgba(73,33,0,0.72)" }} />
        <div className={`${WRAP} relative`}>
          <In><Eyebrow>Así funciona tu inversión</Eyebrow></In>
          <In delay={0.06}><H2>De principio a fin.</H2></In>

          {/* Línea de tiempo: el filete vertical se dibuja al entrar y los tres
              pasos van colgados de él. */}
          <div className="relative mt-[34px] pl-[38px]">
            <motion.span
              className="absolute left-[13px] top-[6px] w-px origin-top bg-[rgba(201,168,119,0.45)]"
              style={{ bottom: 6 }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, ease: EASE }}
            />
            {PASOS.map((p, i) => (
              <In key={p.n} delay={0.1 + i * 0.1} className="relative pb-[30px] last:pb-0">
                <span className="absolute -left-[38px] top-[2px] flex size-[27px] items-center justify-center rounded-full border border-solid border-[rgba(201,168,119,0.5)] bg-brown-dark text-[11px] font-semibold text-tan-63">
                  {p.n}
                </span>
                <h3 className="m-0 text-[clamp(1.05rem,4.4vw,1.35rem)] font-semibold leading-[1.25] text-cream-93">{p.t}</h3>
                <p className="m-0 mt-[7px] text-[15px] font-light leading-[1.55] text-[rgba(247,241,229,0.72)]">{p.d}</p>
              </In>
            ))}
          </div>

          {/* El mismo comparador "por tu cuenta vs. con Zequara" del lienzo. En
              escritorio la pastilla mide 454 × 104 y va en absoluto; aquí ocupa
              el ancho y el círculo de la flecha se encoge. */}
          <In delay={0.4}>
            <button
              type="button"
              onClick={() => setComparar(true)}
              aria-label="Compara tu inversión: por tu cuenta vs. con Zequara"
              className="ix-cta relative mt-[6px] flex w-full items-center justify-between gap-[14px] overflow-hidden rounded-full bg-cream py-[14px] pl-[22px] pr-[14px] text-left"
            >
              <span className="text-brown-dark">
                <span className="block text-[16px] font-semibold leading-[1.25]">Compara tu inversión:</span>
                <span className="block text-[13.5px] font-light leading-[1.3]">por tu cuenta vs. con Zequara</span>
              </span>
              <span className="ix-cta-circle flex size-[46px] shrink-0 items-center justify-center rounded-full bg-brown-dark">
                <svg className="ix-cta-arrow" width={20} height={20} viewBox="0 0 28 28" fill="none" aria-hidden>
                  <path d="M5 14h17M14.5 6.5 22 14l-7.5 7.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="ix-cta-shine" aria-hidden />
            </button>
          </In>
        </div>
      </section>

      {/* ══════════ 4 · UN CASO REAL ══════════ */}
      <section className={`${WRAP} py-[68px]`}>
        <In><Eyebrow tone="brown">Un caso real · La Cabrera, Bogotá</Eyebrow></In>
        <In delay={0.06}><H2 dark>Los números <span className="font-semibold">del proyecto.</span></H2></In>

        <div className="mt-[26px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
          {([
            ["Inversión total", "compra + remodelación"],
            ["Valor de mercado", "9 meses después · +54% tras la obra"],
            ["Renta neta", "~22% sobre lo invertido"],
          ] as const).map(([t, d], i) => (
            <In key={t} delay={0.06 * i} className="rounded-[16px] border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(255,255,255,0.4)] p-[18px]">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[1px] text-[#a57a4e]">{t}</p>
              <p className="m-0 mt-[6px] text-[14px] font-light leading-[1.45] text-[#5b4332]">{d}</p>
            </In>
          ))}
        </div>

        {/* Año a año. En el lienzo es una tabla de cuatro columnas; aquí la
            columna del múltiplo se dibuja como barra —que es lo que se entiende
            de un vistazo en pequeño— y la renta y el valor van debajo de cada
            año. La barra arranca en 1× para que la diferencia entre 1,32 y 1,79
            se vea; contra cero, las cinco parecerían iguales. */}
        <In delay={0.16} className="mt-[18px] rounded-[16px] bg-brown-dark p-[20px]">
          <div className="flex items-baseline justify-between gap-[10px]">
            <p className="m-0 text-[12.5px] font-semibold uppercase tracking-[1.4px] text-tan-63">Escenario base · año a año</p>
            <p className="m-0 text-[12px] font-light text-[rgba(247,241,229,0.6)]">TIR neta 16,5%</p>
          </div>

          <div className="mt-[16px] flex flex-col gap-[13px]">
            {TABLE_ROWS.map((r, i) => (
              <div key={r.year}>
                <div className="flex items-baseline justify-between gap-[10px]">
                  <span className="text-[13px] font-medium text-cream-93">{r.year}</span>
                  <span className="text-[15px] font-semibold text-tan-63">{r.mult.toFixed(2).replace(".", ",")}×</span>
                </div>
                <div className="mt-[5px] h-[8px] w-full overflow-hidden rounded-full" style={{ background: "rgba(247,241,229,0.1)" }}>
                  {/* El ancho es fijo y lo que se anima es `scaleX`: animando
                      `width` entre porcentajes, framer resolvía las cinco al
                      100 % y todas salían iguales. Además así no toca layout. */}
                  <motion.div
                    className="h-full origin-left rounded-full"
                    style={{ width: `${((r.mult - 1) / 0.85) * 100}%`, backgroundImage: "linear-gradient(90deg, #a57a4e 0%, #c9a877 100%)" }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease: EASE }}
                  />
                </div>
                <p className="m-0 mt-[4px] text-[12px] font-light text-[rgba(247,241,229,0.6)]">
                  Renta ${r.renta}M · valor ${r.valor.toFixed(2).replace(".", ",")}.000M
                </p>
              </div>
            ))}
          </div>

          <p className="m-0 mt-[16px] border-t border-solid pt-[14px] text-[15px] font-light leading-[1.5] text-[rgba(247,241,229,0.72)]" style={{ borderColor: "rgba(247,241,229,0.12)" }}>
            <span className="font-extrabold text-cream-93">1,75× tu patrimonio en 5 años</span>, cobrando renta cada año.
          </p>
        </In>
      </section>

      {/* ══════════ 5 · NO ES CROWDFUNDING ══════════ */}
      <section className="bg-brown-dark py-[62px]">
        <div className={WRAP}>
          <In>
            <Wordmark w="clamp(180px,50vw,260px)" />
            <H2><span style={{ color: "#cd9a63" }}>no es</span> <span className="font-semibold">crowdfunding.</span></H2>
          </In>
          <In delay={0.06}>
            <P>Es inversión patrimonial en activos reales. No compras una fracción colectiva.</P>
            <P>Inviertes en un inmueble tangible, seleccionado por su ubicación, potencial de valorización y capacidad de transformación.</P>
          </In>
        </div>
      </section>

      {/* ══════════ 7 · REMODELAMOS ══════════ */}
      <section className={`${WRAP} py-[68px]`}>
        <In><Eyebrow tone="brown">La obra</Eyebrow></In>
        <In delay={0.06}>
          {/* En el lienzo la marca preside esta sección en grande, encima del
              titular. Aquí va en marrón porque el fondo es crema. */}
          <div className="mt-[14px]"><Wordmark w="clamp(190px,54vw,290px)" tone="brown" /></div>
          <H2 dark>Remodelamos para que el <span className="font-semibold">activo valga más</span>, no para impresionar.</H2>
        </In>
        <div className="mt-[26px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
          {REMODELACION.map((c, i) => (
            <In key={c.t} delay={0.06 * i} className="rounded-[16px] border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(255,255,255,0.4)] p-[20px]">
              <h3 className="m-0 text-[17px] font-semibold text-brown-dark">{c.t}</h3>
              <p className="m-0 mt-[7px] text-[14.5px] font-light leading-[1.55] text-[#5b4332]">{c.d}</p>
            </In>
          ))}
        </div>
      </section>

      {/* ══════════ 8 · CONTROL ══════════ */}
      <section className="rounded-tr-[64px] bg-brown-dark py-[68px]">
        <div className={WRAP}>
          <In><Eyebrow>Control de obra + indicadores financieros</Eyebrow></In>
          <In delay={0.06}>
            <H2>No solo ves tu inversión. <span className="font-semibold">La entiendes.</span></H2>
          </In>
          <div className="mt-[28px] flex flex-col gap-[2px]">
            {CONTROL.map((c, i) => (
              <In key={c.t} delay={0.06 * i} className="border-t border-solid border-[rgba(247,241,229,0.14)] py-[18px]">
                <h3 className="m-0 text-[17px] font-semibold text-cream-93">{c.t}</h3>
                <p className="m-0 mt-[6px] text-[15px] font-light leading-[1.55] text-[rgba(247,241,229,0.72)]">{c.d}</p>
              </In>
            ))}
          </div>
          <In delay={0.24} className="mt-[26px] overflow-hidden rounded-[16px] border border-solid border-[rgba(247,241,229,0.14)]">
            <img src={`${A}/panel-zequara.webp`} alt="Panel de seguimiento de Zequara" loading="lazy" decoding="async" className="block w-full" />
          </In>
          <In delay={0.3}>
            <p className="mt-[16px] text-[15px] font-light leading-[1.55] text-[rgba(247,241,229,0.72)]">
              El mismo modelo que eligió tu inmueble, ahora lo cuida.
            </p>
          </In>
        </div>
      </section>

      {/* ══════════ 9 · MERCADOS ══════════ */}
      <section className="relative overflow-hidden">
        {/* El plano de ciudad del diseño, al mismo 20 %, pero a lo ancho y
            anclado arriba en vez de `object-cover`: recortando, a 390 px el
            plano se amplía tanto que su rótulo "BOGOTÁ" sale del tamaño del
            titular y compite con él. Así el detalle conserva la escala que
            tiene en el lienzo. */}
        <img src={`${A}/63f0d4b26acea5bd4269d62fe7c1683462dc68c9.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-x-0 top-0 w-full opacity-20" />
        <div className={`${WRAP} relative py-[68px]`}>
          <In><Eyebrow tone="brown">El criterio de entrada</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>¿Dónde te gustaría <span className="font-semibold">invertir?</span></H2>
            <P dark>Los datos, el diseño, la curaduría y el seguimiento son Zequara, estés donde estés.</P>
          </In>

          <In delay={0.12}>
            <p className="mt-[24px] text-[13px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#7f8b57" }}>Operación activa hoy</p>
          </In>
          {/* Las tres plazas con su foto, como las tarjetas del lienzo. */}
          <div className="mt-[14px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
            {CIUDADES.map((c, i) => (
              <In key={c.label} delay={0.06 * i} className="relative h-[150px] overflow-hidden rounded-[16px]">
                <img src={`${A}/${c.img}`} alt={c.label} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(42,30,20,0) 35%, rgba(42,30,20,0.8) 100%)" }} />
                <span className="absolute bottom-[12px] left-[14px] text-[13px] font-semibold uppercase tracking-[2px] text-cream">{c.label}</span>
              </In>
            ))}
          </div>

          <In delay={0.26}>
            <P dark>Replicamos el modelo completo a nuevos mercados según el interés de nuestros inversionistas. Cuéntanos a qué mercado mirarías.</P>
          </In>
        </div>
      </section>

      {/* ══════════ 10 · DIAGNÓSTICO ══════════ */}
      <section className="bg-brown-dark py-[68px]">
        <div className={WRAP}>
          <In><Eyebrow>Toma 5 minutos</Eyebrow></In>
          <In delay={0.06}>
            <H2>En menos de <span className="font-semibold">5 minutos.</span></H2>
            <P>Obtén una lectura inicial sobre tu perfil de riesgo, estrategia de inversión, mercados compatibles y potencial ruta patrimonial.</P>
          </In>
          {/* La foto que en el lienzo va enmascarada a la derecha. */}
          <In delay={0.12} className="mt-[24px] overflow-hidden rounded-[18px]">
            <img src={`${A}/1d104ea194ca7ae5b0f84b1328433a3a584b589f.webp`} alt="" loading="lazy" decoding="async" className="block h-[190px] w-full object-cover" />
          </In>
          <ul className="mt-[22px] flex list-none flex-col gap-[10px] p-0">
            {DIAGNOSTICO.map((d, i) => (
              <In key={d} delay={0.06 * i}>
                <li className="flex items-center gap-[11px] text-[15.5px] font-light text-[rgba(247,241,229,0.85)]">
                  <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(127,139,87,0.22)" }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#9aa66f" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  {d}
                </li>
              </In>
            ))}
          </ul>
          {/* Abre el mismo cuestionario que el lienzo, no un enlace: el
              diagnóstico ES esta sección. El modal ya venía con sus propias
              medidas para pantalla pequeña. */}
          <In delay={0.24}>
            <DiagnosticoTrigger className="ix-press mt-[26px] flex h-[56px] w-full max-w-[340px] items-center justify-center gap-[10px] rounded-full text-[16px] font-semibold" style={{ background: "#7f8b57", color: "#f7f1e5" }}>
              Hacer diagnóstico
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </DiagnosticoTrigger>
          </In>
        </div>
      </section>

      <MobileFooter />
      <ComparativaModal open={comparar} onClose={() => setComparar(false)} />
    </div>
  );
}
