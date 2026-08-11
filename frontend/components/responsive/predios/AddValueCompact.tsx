"use client";

import { motion, MotionConfig } from "framer-motion";
import CountUp from "@/components/motion/CountUp";
import { COMPARABLES, RIESGOS, STATS, STEPS, SUPUESTOS, WATERFALL } from "@/components/predios/AddValue";
import { PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { EASE, In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   ANÁLISIS DE VALOR — vista fluida para móvil y tablet.

   El lienzo reparte las cifras, la cascada, los comparables, los supuestos,
   los riesgos y la metodología en columnas sobre un fondo oscuro, con las
   tarjetas en lino. Aquí se apila todo en una columna y se conservan los
   mismos colores: tarjetas de lino sobre el fondo oscuro, la del ROI en
   verde y el panel de metodología en su degradado marrón.

   Lo único que cambia de forma es la cascada y los comparables: en pequeño se
   dibujan con barras que crecen al entrar, porque la proporción se entiende
   mejor de un vistazo que con cuatro números sueltos.

   Los datos se leen de AddValue, el componente del lienzo, para que no haya
   dos copias que se desincronicen.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINEN = "#f7f1e5";
const BISTRE = "#3d2c1e";
const MILLBROOK = "#5b4332";
const LASER = "#c9a877";
const VERDIGRIS = "#5f6b3e";
const BORDER = "rgba(165,122,78,0.28)";

/** Barra que crece al entrar. `scaleX` y no `width`: no toca layout. */
function Barra({ pct, grad, delay }: { pct: number; grad: string; delay: number }) {
  return (
    <div className="mt-[7px] h-[10px] w-full overflow-hidden rounded-full" style={{ background: "rgba(165,122,78,0.18)" }}>
      <motion.div
        className="h-full origin-left rounded-full"
        style={{ width: `${pct}%`, backgroundImage: grad }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.95, delay, ease: EASE }}
      />
    </div>
  );
}

/** Encabezado de sección: el mismo antetítulo con filete y su bajada. */
function Head({ title, sub, tan }: { title: string; sub: string; tan?: boolean }) {
  return (
    <In>
      <h2 className="m-0 text-[clamp(1.4rem,6vw,1.9rem)] font-medium leading-[1.15] tracking-[-0.02em]" style={{ color: tan ? "#e2cdae" : LINEN }}>{title}</h2>
      <p className="m-0 mt-[8px] text-[14.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>{sub}</p>
    </In>
  );
}

/** Tarjeta de lino, como las del lienzo. */
function Panel({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <In delay={delay} className={`rounded-[16px] border border-solid p-[20px] ${className ?? ""}`} style={{ background: LINEN, borderColor: BORDER }}>
      {children}
    </In>
  );
}

const Warn = () => (
  <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#a57a4e" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4M12 17.5v.01" />
  </svg>
);
const Bolt = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" /></svg>
);

/** Colores de cada fila de la cascada, los mismos que WF_STYLE del lienzo. */
const FILA = {
  light: { bg: LINEN, title: BISTRE, sub: MILLBROOK, val: BISTRE, badgeBg: "rgba(165,122,78,0.16)", badge: "#a57a4e", grad: "linear-gradient(90deg,#a57a4e 0%,#c9a877 100%)" },
  dark: { bg: "#2a1e14", title: LINEN, sub: "rgba(247,241,229,0.7)", val: LASER, badgeBg: "rgba(201,168,119,0.18)", badge: LASER, grad: "linear-gradient(90deg,#a57a4e 0%,#c9a877 100%)" },
  green: { bg: "#5f6b3e", title: LINEN, sub: "rgba(247,241,229,0.8)", val: LINEN, badgeBg: "rgba(247,241,229,0.18)", badge: LINEN, grad: "linear-gradient(90deg,#7f8b57 0%,#9aa66f 100%)" },
} as const;

export default function AddValueCompact() {
  /** Escala común de la cascada, para que las cuatro barras se comparen. */
  const max = Math.max(...WATERFALL.map((w) => w.num));

  return (
    <MotionConfig reducedMotion="user">
      {/* Base, ilustración y difuminado del lienzo, en el mismo orden. */}
      <div className="relative" style={{ backgroundImage: "linear-gradient(180deg, #492100 17%, #e2cdae 100%)" }}>
        <img src="/figma/Fondo_Add_Value.webp" alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-x-0 top-0 w-full opacity-10" />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(73,33,0,0.65) 10%, rgba(226,205,174,0.65) 100%)" }} />
        <div className="relative">
        <PrediosNavCompact />

        {/* ══════════ ENCABEZADO ══════════ */}
        <section className={`${WRAP} pb-[30px] pt-[22px]`}>
          <a href="/predios/ficha" className="ix-nav mb-[18px] flex w-fit items-center gap-[8px] text-[14.4px] font-medium" style={{ color: LINEN }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
            Volver a la ficha
          </a>
          <In>
            <span className="flex items-center gap-[12px]">
              <span className="block h-px w-[32px] shrink-0 opacity-80" style={{ background: LASER }} />
              <span className="text-[11.5px] font-bold uppercase leading-[1.5] tracking-[3.4px] text-white">Análisis Add Value</span>
            </span>
          </In>
          <In delay={0.06}>
            <h1 className="m-0 mt-[14px] text-[clamp(1.9rem,8vw,2.9rem)] font-light leading-[1.14] tracking-[-0.02em]" style={{ color: LINEN }}>
              El caso de inversión, con números.
            </h1>
            <p className="m-0 mt-[12px] text-[15px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.78)" }}>
              No solo ves la oportunidad: la entiendes. Compra, obra, retorno y riesgos, con la metodología a la vista.
            </p>
            <p className="m-0 mt-[14px] text-[13.5px] font-medium leading-[1.55] text-white">
              La Cabrera · Bogotá · Colombia — Apartamento ultra lujo 320 m²
            </p>
          </In>
        </section>

        {/* ══════════ LAS CUATRO CIFRAS ══════════ */}
        <section className={`${WRAP} pb-[36px]`}>
          <div className="grid grid-cols-2 gap-[10px]">
            {STATS.map((s, i) => (
              <In
                key={s.l} delay={0.05 * i} y={18}
                className="rounded-[16px] border border-solid p-[16px]"
                style={s.green
                  ? { border: "1px solid transparent", backgroundImage: "linear-gradient(167deg,#7f8b57 0%,#5f6b3e 100%)" }
                  : { background: LINEN, borderColor: BORDER }}
              >
                <p className="m-0 text-[11.5px] font-normal uppercase tracking-[0.7px]" style={{ color: s.green ? "rgba(247,241,229,0.85)" : MILLBROOK }}>{s.l}</p>
                <p className="m-0 mt-[6px] text-[clamp(1.4rem,6.6vw,1.75rem)] font-bold leading-[1.15]" style={{ color: s.green ? LINEN : BISTRE }}>
                  <CountUp value={s.num} prefix={s.pfx} suffix={s.sfx} decimals={s.dec} comma={s.dec > 0} duration={1.4} />
                </p>
                <p className="m-0 mt-[5px] text-[12px] font-light leading-[1.4]" style={{ color: s.green ? "rgba(247,241,229,0.8)" : MILLBROOK }}>{s.s}</p>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ CÓMO SE COMPONE ══════════ */}
        <section className={`${WRAP} pb-[36px]`}>
          <Head
            tan
            title="Cómo se compone tu inversión"
            sub="De la compra al valor esperado, paso a paso. Los montos son de referencia por m² y se cierran antes de empezar la obra."
          />

          <div className="mt-[20px] flex flex-col gap-[2px] overflow-hidden rounded-[16px] border border-solid" style={{ background: BORDER, borderColor: BORDER }}>
            {WATERFALL.map((w, i) => {
              const c = FILA[w.kind];
              return (
                <In key={w.title} delay={0.05 * i} y={14} className="px-[18px] py-[16px]" style={{ background: c.bg }}>
                  <div className="flex items-start gap-[12px]">
                    <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] text-[12.8px] font-bold" style={{ background: c.badgeBg, color: c.badge }}>{w.n}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-[10px]">
                        <p className="m-0 text-[15px] font-bold leading-[1.35]" style={{ color: c.title }}>{w.title}</p>
                        <span className="shrink-0 text-[15.5px] font-bold" style={{ color: c.val }}>
                          <CountUp value={w.num} prefix="$" suffix="M / m²" decimals={1} comma duration={1.4} />
                        </span>
                      </div>
                      <Barra pct={(w.num / max) * 100} grad={c.grad} delay={0.1 + i * 0.08} />
                      <p className="m-0 mt-[6px] text-[12.5px] font-light leading-[1.45]" style={{ color: c.sub }}>{w.sub}</p>
                    </div>
                  </div>
                </In>
              );
            })}
          </div>
        </section>

        {/* ══════════ COMPARABLES Y SUPUESTOS ══════════ */}
        <section className={`${WRAP} pb-[36px]`}>
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <Panel>
              <p className="m-0 text-[16.4px] font-bold leading-[1.28] tracking-[-0.37px]" style={{ color: BISTRE }}>Comparables de la zona ($/m²)</p>
              <div className="mt-[16px] flex flex-col gap-[15px]">
                {COMPARABLES.map((c, i) => (
                  <div key={c.label}>
                    <div className="flex items-baseline justify-between gap-[10px]">
                      <span className="text-[13.5px] font-light" style={{ color: MILLBROOK }}>{c.label}</span>
                      <span className="shrink-0 text-[13.8px] font-bold" style={{ color: BISTRE }}>
                        <CountUp value={c.num} prefix="$" suffix="M" decimals={1} comma duration={1.3} />
                      </span>
                    </div>
                    <Barra pct={c.pct} grad={c.grad} delay={0.15 * i} />
                    {c.caption && <p className="m-0 mt-[6px] text-[11.8px] font-medium leading-[1.5]" style={{ color: VERDIGRIS }}>{c.caption}</p>}
                  </div>
                ))}
              </div>
            </Panel>

            <Panel delay={0.06}>
              <p className="m-0 text-[18px] font-bold leading-[1.2] tracking-[-0.37px]" style={{ color: BISTRE }}>Supuestos del análisis</p>
              <div className="mt-[16px] flex flex-col gap-px overflow-hidden rounded-[12px] border border-solid" style={{ background: BORDER, borderColor: BORDER }}>
                {SUPUESTOS.map(([l, v]) => (
                  <div key={l} className="flex min-h-[46px] items-center justify-between gap-[10px] px-[14px] py-[10px]" style={{ background: LINEN }}>
                    <span className="text-[13.5px] font-light" style={{ color: MILLBROOK }}>{l}</span>
                    <span className="shrink-0 text-[14px] font-bold" style={{ color: BISTRE }}>{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>

        {/* ══════════ RIESGOS ══════════ */}
        <section className={`${WRAP} pb-[36px]`}>
          <Head
            title="Riesgos considerados"
            sub="Ninguna inversión está libre de riesgo. Estos son los que evaluamos y cómo los mitiga el modelo."
          />
          <div className="mt-[20px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
            {RIESGOS.map(([t, d], i) => (
              <In key={t} delay={0.05 * i} y={16} className="flex items-start gap-[12px] rounded-[12px] border border-solid px-[16px] py-[16px]" style={{ background: LINEN, borderColor: BORDER }}>
                <span className="mt-[1px] shrink-0"><Warn /></span>
                <div>
                  <p className="m-0 text-[15.5px] font-semibold leading-[1.45]" style={{ color: "#2a1e14" }}>{t}</p>
                  <p className="m-0 mt-[3px] text-[13.4px] font-light leading-[1.55]" style={{ color: MILLBROOK }}>{d}</p>
                </div>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ METODOLOGÍA ══════════ */}
        <section className={`${WRAP} pb-[36px]`}>
          <In className="rounded-[20px] p-[22px]" style={{ backgroundImage: "linear-gradient(172.67deg,#3d2c1e 0%,#2a1e14 100%)" }}>
            <p className="m-0 text-[20px] font-medium leading-[1.2] tracking-[-0.4px]" style={{ color: LINEN }}>Metodología, a la vista</p>
            <p className="m-0 mt-[10px] text-[14.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.8)" }}>
              El análisis Add Value se construye con el mismo criterio que gobierna cada remodelación Zequara: datos de zona,
              costos cerrados y comparables reales. Estas son cifras de referencia; los rangos finales se confirman en el proceso.
            </p>
            <div className="mt-[18px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
              {STEPS.map(([e, t], i) => (
                <motion.div
                  key={e}
                  className="rounded-[12px] border border-solid p-[15px]"
                  style={{ borderColor: "rgba(247,241,229,0.18)" }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.09, ease: EASE }}
                >
                  <p className="m-0 text-[11.5px] font-bold leading-[1.45] tracking-[1.8px]" style={{ color: LASER }}>{e}</p>
                  <p className="m-0 mt-[7px] text-[13.4px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.82)" }}>{t}</p>
                </motion.div>
              ))}
            </div>
          </In>
        </section>

        {/* ══════════ RESERVAR ══════════ */}
        <section className={`${WRAP} pb-[44px]`}>
          <Panel>
            <p className="m-0 text-[clamp(1.35rem,5.8vw,1.8rem)] font-light leading-[1.14] tracking-[-0.02em]">
              <span style={{ color: BISTRE }}>Los números cuadran.</span>{" "}
              <span style={{ color: "#2a1e14" }}>La oportunidad no espera.</span>
            </p>
            <p className="m-0 mt-[8px] text-[15px] font-light leading-[1.5]" style={{ color: MILLBROOK }}>
              Reserva este predio antes de que otro inversionista lo haga.
            </p>
            <a
              href="/panel"
              className="ix-press ix-pulse-tuscany mt-[18px] flex h-[56px] w-full items-center justify-center gap-[10px] rounded-full text-[16px] font-bold text-white"
              style={{ background: "#b5542f" }}
            >
              Reservar ahora <Bolt />
            </a>
          </Panel>

          <In delay={0.08}>
            <p className="mx-auto mt-[20px] max-w-[480px] text-center text-[12px] font-light leading-[1.65]" style={{ color: "rgba(247,241,229,0.6)" }}>
              Las cifras presentadas son de referencia y no constituyen una promesa de rentabilidad ni asesoría financiera.
              El retorno real depende de las condiciones del mercado al momento de la venta o el arriendo.
            </p>
          </In>
        </section>
        </div>
      </div>
    </MotionConfig>
  );
}
