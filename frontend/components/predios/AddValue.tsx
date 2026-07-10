"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import CountUp from "@/components/motion/CountUp";

const A = "/figma";
const EASE = [0.22, 1, 0.36, 1] as const;
const BORDER = "rgba(165,122,78,0.28)";
const GRAD_GREEN = "linear-gradient(90deg,#7f8b57 0%,#9aa66f 100%)";
const GRAD_TAN = "linear-gradient(90deg,#a57a4e 0%,#c9a877 100%)";

const st = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ChevL = () => (<svg width={16} height={16} viewBox="0 0 24 24" {...st} strokeWidth={2} aria-hidden><path d="M15 6l-6 6 6 6" /></svg>);
const Bolt = () => (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" /></svg>);
const Warn = () => (<svg width={20} height={20} viewBox="0 0 24 24" {...st} aria-hidden><path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4M12 17.5v.01" /></svg>);

/* ── Data ──────────────────────────────────────────────────────────── */
const STATS = [
  { l: "Inversión total", pfx: "$", num: 9.7, dec: 1, sfx: "M", s: "Compra + remodelación", green: false },
  { l: "Arriendo mensual", pfx: "$", num: 17, dec: 0, sfx: "M", s: "+54% tras intervención", green: false },
  { l: "Valor esperado", pfx: "$", num: 11.8, dec: 1, sfx: "M", s: "Mediana de venta en la zona", green: false },
  { l: "ROI estimado", pfx: "~", num: 22, dec: 0, sfx: "%", s: "Sobre lo invertido, según mercado", green: true },
];
const WATERFALL = [
  { n: "01", title: "Precio de compra", sub: "Entramos por debajo del mercado de la zona", num: 7.2, kind: "light" as const },
  { n: "02", title: "Remodelación (costo cerrado)", sub: "Sobrecosto no estructural lo asume Serava", num: 2.5, kind: "light" as const },
  { n: "=", title: "Inversión total", sub: "Compra + obra", num: 9.7, kind: "dark" as const },
  { n: "▲", title: "Valor esperado (mediana de venta)", sub: "70% de la oferta pide más por m² que nuestro costo", num: 11.8, kind: "green" as const },
];
const COMPARABLES = [
  { label: "Costo total Serava (ya remodelado)", num: 9.7, pct: 78, grad: GRAD_GREEN, caption: "Entramos por debajo del mercado" },
  { label: "Mediana de venta en La Cabrera", num: 11.8, pct: 95, grad: GRAD_TAN, caption: "" },
  { label: "Oferta premium comparable", num: 12.4, pct: 100, grad: GRAD_TAN, caption: "" },
];
const SUPUESTOS: [string, string][] = [
  ["Arriendo antes de intervención", "$11M / mes"],
  ["Arriendo tras intervención", "$17M / mes"],
  ["Incremento de arriendo", "+54%"],
  ["Área intervenida", "320 m²"],
  ["Horizonte de referencia", "2025"],
  ["Modalidad de obra", "Costo cerrado"],
];
const RIESGOS: [string, string][] = [
  ["Liquidez de venta", "La salida depende del mercado. El activo es tuyo: decides cuándo vender."],
  ["Sobrecosto de obra", "Mitigado: el sobrecosto no estructural lo asume Serava (costo cerrado)."],
  ["Vacancia de arriendo", "Zona de alta demanda; administración y colocación coordinadas por Serava."],
  ["Variación del mercado", "Cifras de referencia 2025; el retorno real puede variar según condiciones."],
];
const STEPS: [string, string][] = [
  ["01 · ENTRAR", "Análisis de demanda y oferta de la zona con tecnología."],
  ["02 · COMPRAR", "Predio curado, por debajo del mercado."],
  ["03 · TRANSFORMAR", "Remodelación a costo cerrado, materiales con criterio."],
  ["04 · SOSTENER", "Arriendo y administración coordinados."],
];

/* ── Helpers ───────────────────────────────────────────────────────── */
function Reveal({ left, top, width, delay = 0, children }: { left: number; top: number; width: number; delay?: number; children: ReactNode }) {
  return (
    <motion.div
      style={{ position: "absolute", left, top, width }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
const SectionHead = ({ title, sub, color = "#f7f1e5" }: { title: string; sub: string; color?: string }) => (
  <>
    <p className="font-medium text-[24px] leading-[27px] tracking-[-0.48px]" style={{ color }}>{title}</p>
    <p className="mt-[10px] max-w-[560px] font-light text-[16px] leading-[24px]" style={{ color }}>{sub}</p>
  </>
);
function Bar({ pct, grad, delay = 0 }: { pct: number; grad: string; delay?: number }) {
  return (
    <div className="h-[12px] w-full overflow-hidden rounded-full" style={{ backgroundImage: "linear-gradient(to bottom, #492100 16.827%, #e2cdae 100%)" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundImage: grad }}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      />
    </div>
  );
}

const WF_STYLE = {
  light: { bg: "#f7f1e5", badgeBg: "rgba(165,122,78,0.15)", badge: "#a57a4e", title: "#2a1e14", sub: "#5b4332", val: "#3d2c1e" },
  dark: { bg: "#3d2c1e", badgeBg: "rgba(247,241,229,0.15)", badge: "#c9a877", title: "#f7f1e5", sub: "rgba(247,241,229,0.7)", val: "#c9a877" },
  green: { bg: "#f7f1e5", badgeBg: "rgba(127,139,87,0.2)", badge: "#5f6b3e", title: "#2a1e14", sub: "#5b4332", val: "#5f6b3e" },
};

export default function AddValue() {
  return (
    <div className="relative size-full" style={{ backgroundColor: "#efe6d5" }}>
      {/* ── Faint building illustration ── */}
      <div className="pointer-events-none absolute left-0 top-[-11px] h-[2880px] w-full">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover opacity-10" src={`${A}/3f6a1939e05d36a16bf711be1b59ff07950dc9bf.webp`} />
      </div>
      {/* ── Difuminado (Rectangle 30) — valor exacto del Figma: dark → cream al 65% ── */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(73,33,0,0.65) 10.29%, rgba(226,205,174,0.65) 100%)" }} />

      {/* ── Nav ── */}
      <div className="absolute left-0 top-0 h-[65px] w-full">
        <a href="/predios/ficha" className="ix-nav absolute left-[444px] top-[21.56px] flex items-center gap-[9px] text-[14.4px] font-medium" style={{ color: "#f7f1e5" }}>
          <ChevL /> Volver a la ficha
        </a>
        <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute left-[1331px] top-[18px] h-[29.8px] w-[175.28px]">
          <img loading="lazy" decoding="async" alt="Serava" className="block size-full max-w-none" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
        </a>
      </div>

      {/* ── Header text ── */}
      <Reveal left={444} top={130} width={1032} delay={0.04}>
        <div className="relative h-[195px]">
          <div className="absolute left-0 top-[7.58px] flex items-center gap-[12px]">
            <span className="inline-block h-px w-[32px]" style={{ backgroundColor: "#c9a877", opacity: 0.8 }} />
            <span className="font-bold text-[11.52px] uppercase leading-[17px] tracking-[3.456px] text-white">Análisis Add Value</span>
          </div>
          <p className="absolute left-0 top-[43.42px] font-light text-[48px] leading-[54.72px] tracking-[-0.96px] text-[#f7f1e5]">El caso de inversión, con números.</p>
          <p className="absolute left-0 top-[110.14px] w-[560px] font-light text-[16px] leading-[24px]" style={{ color: "rgba(247,241,229,0.78)" }}>No solo ves la oportunidad: la entiendes. Compra, obra, retorno y riesgos, con la metodología a la vista.</p>
          <p className="absolute left-0 top-[173.73px] font-medium text-[13.76px] leading-[21px] text-white">La Cabrera · Bogotá · Colombia — Apartamento ultra lujo 320 m²</p>
        </div>
      </Reveal>

      {/* ── Stat cards ── */}
      <Reveal left={444} top={356.53} width={1032} delay={0.1}>
        <div className="relative h-[156px]">
          {STATS.map((c, i) => (
            <motion.div
              key={c.l}
              className="absolute top-0 h-[156px] w-[246px] rounded-[16px] border border-solid"
              style={{
                left: i * 262,
                borderColor: c.green ? "transparent" : BORDER,
                boxShadow: "0px 24px 24px -18px rgba(42,30,20,0.4)",
                ...(c.green ? { backgroundImage: "linear-gradient(167deg,#7f8b57 0%,#5f6b3e 100%)" } : { backgroundColor: "#f7f1e5" }),
              }}
              whileHover={{ y: -8, transition: { duration: 0.25, ease: EASE } }}
            >
              <p className="absolute left-[22px] top-[22px] font-normal text-[11.84px] uppercase leading-[18px] tracking-[0.71px]" style={{ color: c.green ? "rgba(247,241,229,0.85)" : "#5b4332" }}>{c.l}</p>
              <p className="absolute left-[22px] top-[48.35px] font-bold text-[27.2px] leading-[42px] tracking-[-0.544px]" style={{ color: c.green ? "#f7f1e5" : "#3d2c1e" }}>
                <CountUp value={c.num} prefix={c.pfx} suffix={c.sfx} decimals={c.dec} comma={c.dec > 0} duration={1.4} />
              </p>
              <p className="absolute left-[22px] top-[94.5px] w-[200px] font-light text-[12.16px] leading-[18px]" style={{ color: c.green ? "rgba(247,241,229,0.8)" : "#5b4332" }}>{c.s}</p>
            </motion.div>
          ))}
        </div>
      </Reveal>

      {/* ── Sección: Cómo se compone tu inversión ── */}
      <Reveal left={444} top={580.69} width={1032} delay={0.04}>
        <SectionHead title="Cómo se compone tu inversión" sub="De la compra al valor esperado, paso a paso. Los montos son de referencia por m² y se cierran antes de empezar la obra." color="#e2cdae" />
      </Reveal>
      <Reveal left={444} top={689.64} width={1032} delay={0.06}>
        <div className="flex flex-col gap-[2px] overflow-hidden rounded-[16px] border border-solid" style={{ backgroundColor: BORDER, borderColor: BORDER }}>
          {WATERFALL.map((r, i) => {
            const c = WF_STYLE[r.kind];
            return (
              <motion.div
                key={r.title}
                className="relative flex h-[80px] items-center px-[22px]"
                style={{ backgroundColor: c.bg }}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                whileHover={{ x: 5, transition: { duration: 0.2, ease: EASE } }}
              >
                <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] font-bold text-[12.8px]" style={{ backgroundColor: c.badgeBg, color: c.badge }}>{r.n}</span>
                <div className="ml-[12px]">
                  <p className="font-bold text-[16px] leading-[24px]" style={{ color: c.title }}>{r.title}</p>
                  <p className="font-light text-[12.48px] leading-[19px]" style={{ color: c.sub }}>{r.sub}</p>
                </div>
                <span className="ml-auto font-bold text-[17.6px] leading-[27px]" style={{ color: c.val }}>
                  <CountUp value={r.num} prefix="$" suffix="M / m²" decimals={1} comma duration={1.4} />
                </span>
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      {/* ── Sección: Comparables + Supuestos ── */}
      <Reveal left={444} top={1114.2} width={1032} delay={0.04}>
        <div className="flex gap-[24px]">
          {/* Comparables */}
          <div className="h-[395px] w-[504px] rounded-[16px] border border-solid px-[26px] py-[26px]" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER }}>
            <p className="font-bold text-[16.4px] leading-[21px] tracking-[-0.37px] text-[#3d2c1e]">Comparables de la zona ($/m²)</p>
            <div className="mt-[18px] flex flex-col gap-[16px]">
              {COMPARABLES.map((b, i) => (
                <div key={b.label}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-light text-[13.76px] text-[#5b4332]">{b.label}</span>
                    <span className="font-bold text-[13.76px] text-[#3d2c1e]"><CountUp value={b.num} prefix="$" suffix="M" decimals={1} comma duration={1.3} /></span>
                  </div>
                  <div className="mt-[7px]"><Bar pct={b.pct} grad={b.grad} delay={0.15 * i} /></div>
                  {b.caption && <p className="mt-[6px] font-medium text-[11.84px] leading-[18px] text-[#5f6b3e]">{b.caption}</p>}
                </div>
              ))}
            </div>
          </div>
          {/* Supuestos */}
          <div className="h-[395px] w-[504px] rounded-[16px] border border-solid px-[26px] py-[26px]" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER }}>
            <p className="font-bold text-[18.25px] leading-[21px] tracking-[-0.37px] text-[#3d2c1e]">Supuestos del análisis</p>
            <div className="mt-[18px] flex flex-col gap-[1px] overflow-hidden rounded-[12px] border border-solid" style={{ backgroundColor: BORDER, borderColor: BORDER }}>
              {SUPUESTOS.map(([l, v]) => (
                <div key={l} className="flex h-[48px] items-center justify-between px-[16px] transition-[filter] duration-200 hover:brightness-[0.96]" style={{ backgroundColor: "#f7f1e5" }}>
                  <span className="font-light text-[13.76px] text-[#5b4332]">{l}</span>
                  <span className="font-bold text-[14.4px] text-[#3d2c1e]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Sección: Riesgos considerados ── */}
      <Reveal left={444} top={1605.14} width={1032} delay={0.04}>
        <SectionHead title="Riesgos considerados" sub="Ninguna inversión está libre de riesgo. Estos son los que evaluamos y cómo los mitiga el modelo." />
      </Reveal>
      <Reveal left={444} top={1714.09} width={1032} delay={0.06}>
        <div className="grid grid-cols-2 gap-[12px]">
          {RIESGOS.map(([t, d]) => (
            <div key={t} className="ix-lift flex items-start gap-[13px] rounded-[12px] border border-solid px-[17px] py-[17px]" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER }}>
              <span className="mt-[1px] shrink-0 text-[#a57a4e]"><Warn /></span>
              <div>
                <p className="font-semibold text-[15.7px] leading-[23.5px] text-[#2a1e14]">{t}</p>
                <p className="mt-[3px] font-light text-[13.44px] leading-[20.8px] text-[#5b4332]">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Sección: Metodología ── */}
      <Reveal left={444} top={2026.53} width={1032} delay={0.04}>
        <div className="relative h-[365px] rounded-[20px]" style={{ backgroundImage: "linear-gradient(172.67deg,#3d2c1e 0%,#2a1e14 100%)" }}>
          <p className="absolute left-[44px] top-[44px] font-medium text-[20.8px] leading-[23.7px] tracking-[-0.416px] text-[#f7f1e5]">Metodología, a la vista</p>
          <p className="absolute left-[44px] top-[79.7px] w-[600px] font-light text-[16px] leading-[24px]" style={{ color: "rgba(247,241,229,0.8)" }}>El análisis Add Value se construye con el mismo criterio que gobierna cada remodelación Serava: datos de zona, costos cerrados y comparables reales. Estas son cifras de referencia; los rangos finales se confirman en el proceso.</p>
          <div className="absolute left-[44px] top-[198.89px] flex gap-[13.5px]">
            {STEPS.map(([e, t], i) => (
              <motion.div
                key={e}
                className="h-[122px] w-[226px] rounded-[12px] border border-solid border-[rgba(247,241,229,0.18)] p-[16px] transition-colors duration-200 hover:border-[rgba(201,168,119,0.55)] hover:bg-[rgba(247,241,229,0.04)]"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.09, ease: EASE }}
                whileHover={{ y: -5, transition: { duration: 0.2, ease: EASE } }}
              >
                <p className="font-bold text-[11.52px] leading-[17px] tracking-[1.843px] text-[#c9a877]">{e}</p>
                <p className="mt-[8px] font-light text-[13.44px] leading-[20px]" style={{ color: "rgba(247,241,229,0.82)" }}>{t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── CTA ── */}
      <Reveal left={444} top={2449.75} width={1032} delay={0.04}>
        <div className="relative h-[146px] rounded-[20px] border border-solid" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER }}>
          <div className="absolute left-[41px] top-[41px] w-[680px]">
            <p className="text-[28.8px] leading-[32.83px] tracking-[-0.576px]"><span className="font-light text-[#3d2c1e]">Los números cuadran.</span><span className="font-light text-[#2a1e14]"> La oportunidad no espera.</span></p>
            <p className="mt-[6px] font-light text-[16px] leading-[24px] text-[#5b4332]">Reserva este predio antes de que otro inversionista lo haga.</p>
          </div>
          <a href="/predios/ficha" className="ix-press ix-pulse-tuscany absolute right-[41px] top-[43.41px] flex h-[59px] w-[220px] items-center justify-center gap-[10px] rounded-[999px] font-bold text-[16px] text-white" style={{ backgroundColor: "#b5542f" }}>
            Reservar ahora <Bolt />
          </a>
        </div>
      </Reveal>

      {/* ── Disclaimer ── */}
      <Reveal left={720} top={2685.38} width={480} delay={0.04}>
        <p className="text-center font-light text-[12px] leading-[19.8px]" style={{ color: "rgba(91,67,50,0.7)" }}>Las cifras presentadas son de referencia y no constituyen una promesa de rentabilidad ni asesoría financiera. El retorno real depende de las condiciones del mercado al momento de la venta o el arriendo.</p>
      </Reveal>
    </div>
  );
}
