"use client";

import { motion, MotionConfig } from "framer-motion";
import CountUp from "@/components/motion/CountUp";
import { COMPARABLES, STATS, WATERFALL } from "@/components/predios/AddValue";
import { PrediosHead, PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { EASE, In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   ANÁLISIS DE VALOR — vista fluida para móvil y tablet.

   El lienzo reparte las cifras, la cascada y los comparables en columnas. Aquí
   se apilan, y lo que en escritorio se lee por posición pasa a leerse por
   tamaño de barra: la cascada y los comparables se dibujan con barras que
   crecen al entrar en pantalla, que en pequeño explican la proporción mejor
   que cuatro números sueltos.

   Los datos se leen de AddValue, el componente del lienzo, para que no haya
   dos copias que se desincronicen.
   ═══════════════════════════════════════════════════════════════════════════ */

const CREAM = "#f7f1e5";
const BORDER = "rgba(165,122,78,0.28)";
const VERD = "#9aa66f";

/** Barra que crece al entrar. `scaleX` y no `width`: no toca layout. */
function Barra({ pct, grad, delay }: { pct: number; grad: string; delay: number }) {
  return (
    <div className="mt-[8px] h-[10px] w-full overflow-hidden rounded-full" style={{ background: "rgba(247,241,229,0.09)" }}>
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

export default function AddValueCompact() {
  /** Escala común de la cascada, para que las cuatro barras se comparen. */
  const max = Math.max(...WATERFALL.map((w) => w.num));

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ background: "#2a1e14" }}>
        <PrediosNavCompact />

        <section className={`${WRAP} pb-[30px] pt-[30px]`}>
          <PrediosHead eyebrow="La Cabrera · Bogotá" title={<>Análisis de <span className="font-semibold">valor.</span></>}>
            Cómo se compone la inversión y con qué se compara en la zona. Cifras estimadas de referencia.
          </PrediosHead>
        </section>

        {/* ══════════ LAS CUATRO CIFRAS ══════════ */}
        <section className={`${WRAP} pb-[36px]`}>
          <div className="grid grid-cols-2 gap-[10px]">
            {STATS.map((s, i) => (
              <In key={s.l} delay={0.05 * i} y={18} className="rounded-[16px] border border-solid p-[16px]" style={{ borderColor: BORDER, background: "rgba(247,241,229,0.04)" }}>
                <p className="m-0 text-[10.5px] font-semibold uppercase tracking-[0.8px]" style={{ color: "rgba(247,241,229,0.55)" }}>{s.l}</p>
                <p className="m-0 mt-[6px] text-[clamp(1.5rem,7vw,2rem)] font-light leading-[1.1]" style={{ color: s.green ? VERD : CREAM }}>
                  <span style={{ color: "#c9a877" }}>{s.pfx}</span>
                  <CountUp value={s.num} decimals={s.dec} suffix={s.sfx} duration={1.4} />
                </p>
                <p className="m-0 mt-[5px] text-[11.5px] font-light leading-[1.35]" style={{ color: "rgba(247,241,229,0.55)" }}>{s.s}</p>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ CASCADA ══════════ */}
        <section className="border-y border-solid py-[36px]" style={{ borderColor: "rgba(165,122,78,0.2)", background: "rgba(73,33,0,0.35)" }}>
          <div className={WRAP}>
            <In><p className="m-0 text-[11px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#c9a877" }}>Cómo se compone</p></In>
            <In delay={0.05}><h2 className="mt-[10px] text-[clamp(1.4rem,6vw,1.9rem)] font-light leading-[1.15] text-cream-93">De la compra al <span className="font-semibold">valor esperado.</span></h2></In>

            <div className="mt-[22px] flex flex-col gap-[16px]">
              {WATERFALL.map((w, i) => (
                <In key={w.title} delay={0.05 * i} y={18}>
                  <div className="flex items-baseline justify-between gap-[10px]">
                    <span className="flex items-baseline gap-[9px]">
                      <span className="text-[11px] font-bold" style={{ color: "#c9a877" }}>{w.n}</span>
                      <span className="text-[14.5px] font-medium text-cream-93">{w.title}</span>
                    </span>
                    <span className="shrink-0 text-[15.5px] font-semibold" style={{ color: w.kind === "green" ? VERD : CREAM }}>
                      ${w.num.toFixed(1).replace(".", ",")}M
                    </span>
                  </div>
                  <Barra
                    pct={(w.num / max) * 100}
                    grad={w.kind === "green" ? "linear-gradient(90deg,#7f8b57 0%,#9aa66f 100%)" : "linear-gradient(90deg,#a57a4e 0%,#c9a877 100%)"}
                    delay={0.1 + i * 0.08}
                  />
                  <p className="m-0 mt-[6px] text-[12px] font-light leading-[1.4]" style={{ color: "rgba(247,241,229,0.55)" }}>{w.sub}</p>
                </In>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ COMPARABLES ══════════ */}
        <section className={`${WRAP} py-[36px]`}>
          <In><p className="m-0 text-[11px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#c9a877" }}>Contra el mercado</p></In>
          <In delay={0.05}><h2 className="mt-[10px] text-[clamp(1.4rem,6vw,1.9rem)] font-light leading-[1.15] text-cream-93">Entramos <span className="font-semibold">por debajo.</span></h2></In>

          <div className="mt-[22px] flex flex-col gap-[16px]">
            {COMPARABLES.map((c, i) => (
              <In key={c.label} delay={0.05 * i} y={18}>
                <div className="flex items-baseline justify-between gap-[10px]">
                  <span className="text-[13.5px] font-light text-[rgba(247,241,229,0.85)]">{c.label}</span>
                  <span className="shrink-0 text-[15px] font-semibold text-cream-93">${c.num.toFixed(1).replace(".", ",")}M</span>
                </div>
                <Barra pct={c.pct} grad={c.grad} delay={0.1 + i * 0.08} />
                {c.caption && <p className="m-0 mt-[6px] text-[12px] font-medium" style={{ color: VERD }}>{c.caption}</p>}
              </In>
            ))}
          </div>

          <In delay={0.16}>
            <a href="/predios/ficha" className="ix-press mt-[26px] flex h-[54px] w-full items-center justify-center gap-[9px] rounded-full text-[15.5px] font-semibold" style={{ background: "#7f8b57", color: CREAM }}>
              Ver la ficha del predio
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <p className="mt-[16px] text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>
              Cifras estimadas de referencia. No constituyen una oferta de compra ni garantía de retorno.
            </p>
          </In>
        </section>
      </div>
    </MotionConfig>
  );
}
