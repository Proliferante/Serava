"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import CountUp from "@/components/motion/CountUp";

const COLS = "grid grid-cols-[153px_258px_321px_322px]";

const TABLE_ROWS = [
  { year: "Año 1", renta: 143, valor: 4.08, mult: null as number | null },
  { year: "Año 2", renta: 152, valor: 4.4, mult: 1.41 },
  { year: "Año 3", renta: 161, valor: 4.76, mult: 1.56 },
  { year: "Año 4", renta: 170, valor: 5.14, mult: 1.71 },
  { year: "Año 5", renta: 180, valor: 5.55, mult: 1.88, highlight: true },
];

/* ── Año a año table ── */
function ScenarioTable() {
  const muted = "rgba(247,241,229,0.6)";
  const border = "rgba(247,241,229,0.12)";
  return (
    <div className="w-[1054px] overflow-clip rounded-[14px] border border-solid bg-brown-dark" style={{ borderColor: border }}>
      <div className="border-b border-solid px-[18px] py-[14px]" style={{ borderColor: border }}>
        <p className="font-semibold text-[10px] text-tan-63">Año a año · escenario base</p>
      </div>
      <div className={`${COLS} border-b border-solid`} style={{ borderColor: border }}>
        <div className="px-[14px] py-[11px] font-semibold text-[9px]" style={{ color: muted }}>Año</div>
        <div className="px-[14px] py-[11px] text-right font-semibold text-[9px]" style={{ color: muted }}>Renta del año</div>
        <div className="px-[14px] py-[11px] text-right font-semibold text-[9px]" style={{ color: muted }}>Valor de mercado</div>
        <div className="px-[14px] py-[11px] text-right font-semibold text-[9px]" style={{ color: muted }}>Múltiplo si vendes</div>
      </div>
      {TABLE_ROWS.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * i, duration: 0.35, ease: EASE }}
          className={`${COLS} ${i < TABLE_ROWS.length - 1 ? "border-b border-solid" : ""}`}
          style={{ borderColor: border, background: r.highlight ? "rgba(127,139,87,0.1)" : undefined }}
        >
          <div className="px-[14px] py-[11px] font-medium text-[13px]" style={{ color: muted }}>{r.year}</div>
          <div className="px-[14px] py-[11px] text-right font-normal text-[13px] text-cream-93"><CountUp value={r.renta} prefix="$" suffix="M" /></div>
          <div className="px-[14px] py-[11px] text-right font-normal text-[13px] text-cream-93"><CountUp value={r.valor} prefix="$" suffix="MM" decimals={2} comma /></div>
          <div className="px-[14px] py-[11px] text-right font-normal text-[13px] text-cream-93">{r.mult === null ? "—" : <CountUp value={r.mult} suffix="×" decimals={2} comma />}</div>
        </motion.div>
      ))}
    </div>
  );
}

const A = "/figma";
const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Metric cell (top stats bar) ── */
function Metric({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="relative h-[94.42px] w-[263.75px] bg-[rgba(247,241,229,0.04)]">
      <p className="absolute left-[16px] top-[15px] w-[231.75px] font-normal leading-[15px] text-[10px]" style={{ color: "rgba(247,241,229,0.6)" }}>{label}</p>
      <p className="absolute left-[16px] top-[31.34px] w-[231.75px] font-light leading-[23px] text-cream-93 text-[23px]">{children}</p>
      <p className="absolute left-[16px] top-[64.55px] w-[231.75px] font-light leading-[14px] text-[9px]" style={{ color: "rgba(247,241,229,0.6)" }}>{sub}</p>
    </div>
  );
}

/* ── Scenario card ── */
type ScenProps = { title: string; rate: string; sub: string; value: number; multiplo: number; ganancia: number; accent?: boolean; delay?: number };
function ScenarioCard({ title, rate, sub, value, multiplo, ganancia, accent, delay = 0 }: ScenProps) {
  const cream = "#f7f1e5";
  const green = "#9aa66f";
  return (
    <motion.div
      initial={{ y: 26 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={{ y: -6 }}
      className="grow rounded-[18px] bg-brown-dark px-[26px] py-[24px] border border-solid"
      style={{ borderColor: accent ? "#7f8b57" : "rgba(247,241,229,0.08)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-[18px] leading-none" style={{ color: accent ? green : cream }}>{title}</p>
          <p className="mt-[5px] font-light text-[10px]" style={{ color: "rgba(247,241,229,0.55)" }}>{sub}</p>
        </div>
        <p className="font-normal text-[11px]" style={{ color: "rgba(247,241,229,0.55)" }}>{rate}</p>
      </div>
      <p className="mt-[16px] font-light text-[40px] leading-none" style={{ color: accent ? green : cream }}>
        <CountUp value={value} prefix="$" suffix="MM" decimals={2} comma />
      </p>
      <p className="mt-[12px] font-light text-[11px]" style={{ color: "rgba(247,241,229,0.55)" }}>tu patrimonio en 5 años</p>

      <div className="mt-[20px] h-px w-full" style={{ background: "rgba(247,241,229,0.1)" }} />
      <div className="flex items-center justify-between py-[13px]">
        <span className="font-light text-[13px]" style={{ color: "rgba(247,241,229,0.6)" }}>Múltiplo</span>
        <span className="font-bold text-[15px]" style={{ color: accent ? green : cream }}><CountUp value={multiplo} suffix="×" decimals={2} comma /></span>
      </div>
      <div className="h-px w-full" style={{ background: "rgba(247,241,229,0.1)" }} />
      <div className="flex items-center justify-between pt-[13px]">
        <span className="font-light text-[13px]" style={{ color: "rgba(247,241,229,0.6)" }}>Ganancia neta</span>
        <span className="font-bold text-[15px] text-cream-93"><CountUp value={ganancia} prefix="+$" suffix="MM" decimals={2} comma /></span>
      </div>
    </motion.div>
  );
}

/** Seccion 4 — Caso real La Cabrera, rediseñado (1920 × 972) */
export default function Section4Caso() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const sliderInView = useInView(sliderRef, { once: true, amount: 0.6 });
  const [tab, setTab] = useState<"escenarios" | "tabla">("escenarios");

  return (
    <div className="overflow-clip relative rounded-tl-[150px] size-full" data-name="Seccion 4">
      {/* Background image */}
      <div className="absolute h-[1249px] left-[-624px] top-[-123px] w-[2238px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${A}/166ec568ae1676f084cc41728776b7aedc389e86.webp`} />
      </div>

      {/* Panel */}
      <div className="absolute bg-cream h-[972px] left-[766px] overflow-clip rounded-bl-[130px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 w-[1154px]">
        <p className="[word-break:break-word] absolute font-normal leading-[1.137] left-[73px] not-italic text-brown-dark text-[25px] top-[34px] w-[479px]">Un caso real</p>
        <p className="[word-break:break-word] absolute font-black leading-[normal] left-[73px] not-italic text-brown-dark text-[55px] top-[62px] w-[619px]">La Cabrera, Bogotá</p>
        <p className="[word-break:break-word] absolute font-normal leading-[1.137] left-[73px] not-italic text-brown-dark text-[25px] top-[144px] w-[854px]">
          Un inmueble que compramos, remodelamos y hoy renta. Cifras <span className="font-extrabold">medidas</span> del proyecto, proyectadas en tres escenarios <span className="font-extrabold">estimados</span> de valorización.
        </p>

        {/* Stats bar */}
        <div className="absolute bg-brown-dark flex h-[96.42px] left-[56px] overflow-clip rounded-[12px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[274px] w-[1060px]">
          <Metric label="Inversión total" sub="compra + remodelación"><CountUp value={3100} prefix="$" suffix="M" grouping /></Metric>
          <div className="w-px shrink-0" />
          <Metric label="Valor de mercado hoy" sub="~22% sobre lo invertido"><CountUp value={3776} prefix="$" suffix="M" grouping /></Metric>
          <div className="w-px shrink-0" />
          <Metric label="Canon mensual" sub="+54% tras la obra"><CountUp value={17} prefix="$" suffix="M" /></Metric>
          <div className="w-px shrink-0" />
          <Metric label="Yield bruto" sub="renta anual / inversión"><CountUp value={6.6} suffix="%" decimals={1} comma /></Metric>
        </div>

        {/* Horizonte slider */}
        <div ref={sliderRef} className="absolute bg-brown-dark border border-solid border-[rgba(247,241,229,0.12)] h-[55.19px] left-[57px] rounded-[12px] top-[388px] w-[1060px]">
          <p className="[word-break:break-word] absolute font-semibold leading-[17px] left-[18px] not-italic text-cream-93 text-[11px] top-[17.7px]">Horizonte</p>
          <p className="[word-break:break-word] absolute font-semibold leading-[25px] left-[448px] not-italic text-tan-63 text-[16px] top-[13.5px]">5 años</p>
          {/* track */}
          <div className="absolute left-[93px] top-[23px] h-[7px] w-[319px] overflow-hidden rounded-[40px]" style={{ background: "rgba(201,168,119,0.25)" }}>
            <motion.div className="h-full rounded-[40px] bg-tan-63" initial={{ width: 0 }} animate={sliderInView ? { width: "100%" } : { width: 0 }} transition={{ duration: 1, ease: EASE }} />
          </div>
          {/* handle */}
          <motion.div className="absolute top-[17px] size-[18px]" initial={{ left: 94, scale: 0 }} animate={sliderInView ? { left: 403, scale: 1 } : { left: 94, scale: 0 }} transition={{ duration: 1, ease: EASE }}>
            <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/6424a9316b574386588cbe3469edd4b83c7f57c0.svg`} />
          </motion.div>
        </div>

        {/* Controls */}
        <div className="absolute h-[46px] left-[57px] top-[476px] w-[1060px]">
          <div className="absolute flex h-[46px] items-center left-0 rounded-[999px] top-0 w-[258px] p-[5px] bg-[rgba(247,241,229,0.72)]">
            <button type="button" onClick={() => setTab("escenarios")} className="relative z-10 flex h-[36px] w-[102px] items-center justify-center rounded-[999px]">
              {tab === "escenarios" && <motion.span layoutId="s4tab" className="absolute inset-0 rounded-[999px] bg-[#7f8b57]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={`relative z-10 font-medium text-[12px] transition-colors ${tab === "escenarios" ? "text-cream-93" : "text-[#8a6a3f]"}`}>Escenarios</span>
            </button>
            <button type="button" onClick={() => setTab("tabla")} className="relative z-10 flex h-[36px] flex-1 items-center justify-center rounded-[999px]">
              {tab === "tabla" && <motion.span layoutId="s4tab" className="absolute inset-0 rounded-[999px] bg-[#7f8b57]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className={`relative z-10 font-medium text-[12px] transition-colors ${tab === "tabla" ? "text-cream-93" : "text-[#8a6a3f]"}`}>Año a año · base</span>
            </button>
          </div>
          <div className="absolute left-[972px] top-[3px] flex w-[88px] gap-[8px]">
            <button type="button" className="ix-press flex size-[40px] items-center justify-center rounded-[20px] border border-solid border-[rgba(73,33,0,0.12)] bg-white opacity-30">
              <img loading="lazy" decoding="async" alt="" className="size-[18px]" src={`${A}/85a59880c3aaef0d26f3e0ba73e5bde80f43e02c.svg`} />
            </button>
            <button type="button" className="ix-press flex size-[40px] items-center justify-center rounded-[20px] border border-solid border-[rgba(73,33,0,0.12)] bg-white">
              <img loading="lazy" decoding="async" alt="" className="size-[18px]" src={`${A}/1c7a3cf5f5c4660d1f1f1bedbff0248036ba58af.svg`} />
            </button>
          </div>
        </div>

        {/* Swappable content: Escenarios (cards) ↔ Año a año (table) */}
        <div className="absolute left-[56px] top-[560px] w-[1060px]">
          <AnimatePresence mode="wait">
            {tab === "escenarios" ? (
              <motion.div key="esc" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35, ease: EASE }}>
                <p className="[word-break:break-word] font-normal leading-[1.25] not-italic text-brown-dark text-[25px] w-[980px]">
                  Aun en el escenario más conservador, tu capital se multiplica <span className="font-bold">1,75× — cobrando renta cada año.</span>
                </p>
                <div className="mt-[26px] flex gap-[16px]">
                  <ScenarioCard title="Conservador" rate="6% / año" sub="piso realista" value={5.41} multiplo={1.75} ganancia={2.31} delay={0} />
                  <ScenarioCard title="Base" rate="8% / año" sub="premium" value={5.82} multiplo={1.88} ganancia={2.72} accent delay={0.12} />
                  <ScenarioCard title="Optimista" rate="10% / año" sub="techo premium" value={6.26} multiplo={2.02} ganancia={3.16} delay={0.24} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="tab" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35, ease: EASE }}>
                <ScenarioTable />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
