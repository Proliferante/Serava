"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CountUp from "@/components/motion/CountUp";

const A = "/figma";
const EASE = [0.22, 1, 0.36, 1] as const;
const BORDER = "rgba(165,122,78,0.28)";

/* ── Icons ─────────────────────────────────────────────────────────── */
const st = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ChevL = () => (<svg width={16} height={16} viewBox="0 0 24 24" {...st} strokeWidth={2} aria-hidden><path d="M15 6l-6 6 6 6" /></svg>);
const Pin = () => (<svg width={14} height={14} viewBox="0 0 24 24" {...st} aria-hidden><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.3" /></svg>);
const Camera = ({ s = 26 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...st} aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M4 17l5-4 4 3 3-2 4 3" /></svg>);
const Flame = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M12 2c1 3-1.5 4.5-2.5 6C8 10 8 12 8 12a4 4 0 1 0 8 0c0-2-1-3.5-2-5 2 1 4 3.5 4 7a6 6 0 1 1-12 0c0-4 3-6 6-12z" /></svg>);
const Clock = ({ s = 20 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...st} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const Bolt = () => (<svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" /></svg>);
const ArrowR = () => (<svg width={18} height={18} viewBox="0 0 24 24" {...st} strokeWidth={2} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const Check = ({ s = 17 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...st} strokeWidth={2.2} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>);
const Warn = ({ s = 17 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...st} aria-hidden><path d="M12 3l9 16H3l9-16z" /><path d="M12 10v4M12 17.5v.01" /></svg>);
const Eye = ({ s = 14 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...st} aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>);
const FileT = ({ s = 19 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...st} aria-hidden><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>);

/* ── Data ──────────────────────────────────────────────────────────── */
const PHOTOS = [
  { caption: "Foto principal — fachada / sala", grad: "linear-gradient(155deg,#5b4332 0%,#3d2c1e 100%)" },
  { caption: "Cocina", grad: "linear-gradient(155deg,#6b4f38 0%,#2a1e14 100%)" },
  { caption: "Habitación / baño", grad: "linear-gradient(155deg,#4d3a2a 0%,#2a1e14 100%)" },
];
const SPECS = [
  { l: "Área", v: "320 m²", x: 0 },
  { l: "Habitaciones", v: "3", x: 93.73 },
  { l: "Baños", v: "3", x: 211.23 },
  { l: "Parqueaderos", v: "2", x: 282.64 },
  { l: "Antigüedad", v: "18 años", x: 408.05 },
  { l: "Estado", v: "Publicado", x: 515.18 },
];
const DATOS: [string, string][] = [
  ["Barrio", "La Cabrera"],
  ["Estrato", "6"],
  ["Piso", "4 de 6"],
  ["Administración", "Incluida en análisis"],
  ["Ubicación exacta", "Visible al reservar"],
  ["Score Serava", "96 / 100"],
];
const RIESGOS = [
  { tone: "green" as const, title: "Costo de obra cerrado", desc: "El sobrecosto no estructural lo asume Serava. Sin sorpresas de presupuesto." },
  { tone: "green" as const, title: "Estudio jurídico completo", desc: "Títulos y validaciones legales realizados antes de habilitar el predio." },
  { tone: "orange" as const, title: "Liquidez de venta", desc: "La salida depende del mercado. Serava acompaña pero el activo es tuyo: vendes cuando decidas." },
];
const DOCS = [
  { t: "Ficha técnica del predio", status: "Disponible", tone: "green" as const },
  { t: "Estudio de títulos", status: "Al reservar", tone: "neutral" as const },
  { t: "Plan de remodelación", status: "Al reservar", tone: "neutral" as const },
];

/* ── Reveal wrapper (absolute-positioned, scroll reveal) ───────────── */
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

const H2 = ({ children }: { children: ReactNode }) => (
  <p className="font-medium text-[21.6px] leading-[24.62px] tracking-[-0.432px] text-[#e2cdae]">{children}</p>
);

/* ── Countdown ─────────────────────────────────────────────────────── */
function useCountdown(startSeconds: number) {
  const [s, setS] = useState(startSeconds);
  useEffect(() => {
    const id = window.setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function FichaPredio() {
  const [mainIdx, setMainIdx] = useState(0);
  const others = [0, 1, 2].filter((i) => i !== mainIdx);
  const time = useCountdown(2 * 3600 + 59 * 60 + 41);

  return (
    <div className="relative size-full" style={{ backgroundColor: "#e2cdae" }}>
      {/* ── Background gradient (Rectangle 31): dark #492100 → cream, 70% over cream ── */}
      <div className="pointer-events-none absolute left-0 top-[64px] h-[2588px] w-full" style={{ background: "linear-gradient(180deg, rgba(73,33,0,0.7) 36.285%, rgba(226,205,174,0.7) 99.699%)" }} />

      {/* ── Nav ── */}
      <div className="absolute left-0 top-0 h-[66px] w-full" style={{ backgroundColor: "#2a1e14" }}>
        <a href="/predios" className="ix-nav absolute left-[424px] top-1/2 flex -translate-y-1/2 items-center gap-[8px] text-[14px] font-medium" style={{ color: "rgba(247,241,229,0.82)" }}>
          <ChevL /> Volver a predios
        </a>
        <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute left-[1321px] top-[18px] h-[29.8px] w-[175.28px]">
          <img alt="Serava" className="block size-full max-w-none" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
        </a>
      </div>

      {/* ── Gallery ── */}
      <Reveal left={424} top={65.47} width={1072} delay={0.04}>
        <div className="relative h-[520px] w-[1072px]">
          {/* Main photo */}
          <div className="absolute left-0 top-[22px] h-[498px] w-[706.67px] overflow-hidden rounded-[18px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainIdx}
                className="absolute inset-0 flex flex-col items-center justify-center gap-[10px]"
                style={{ backgroundImage: PHOTOS[mainIdx].grad }}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <span style={{ color: "rgba(247,241,229,0.55)" }}><Camera s={26} /></span>
                <p className="font-medium text-[11px] uppercase tracking-[0.14em]" style={{ color: "rgba(247,241,229,0.55)" }}>{PHOTOS[mainIdx].caption}</p>
              </motion.div>
            </AnimatePresence>
            {/* Badge */}
            <div className="absolute left-[16px] top-[16px] flex items-center gap-[7px] rounded-[8px] px-[13px] py-[7px]" style={{ backgroundColor: "#b5542f" }}>
              <span className="text-white"><Flame s={12} /></span>
              <span className="font-semibold text-[10.5px] uppercase tracking-[0.06em] text-white">Última oferta en la zona</span>
            </div>
          </div>
          {/* Right column — selectable thumbnails */}
          {others.map((idx, i) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMainIdx(idx)}
              className="ix-lift group absolute h-[243px] w-[353.33px] overflow-hidden rounded-[18px] outline-none"
              style={{ left: 718.67, top: i === 0 ? 22 : 277, boxShadow: "0 0 0 2px rgba(181,84,47,0)" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-[7px] transition-transform duration-500 group-hover:scale-[1.05]" style={{ backgroundImage: PHOTOS[idx].grad }}>
                <span style={{ color: "rgba(247,241,229,0.5)" }}><Camera s={22} /></span>
                <p className="font-medium text-[9.5px] uppercase tracking-[0.14em]" style={{ color: "rgba(247,241,229,0.5)" }}>{PHOTOS[idx].caption}</p>
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-[18px] ring-0 ring-[#b5542f] transition-all duration-200 group-hover:ring-2" />
            </button>
          ))}
        </div>
      </Reveal>

      {/* ── Location eyebrow ── */}
      <Reveal left={424} top={621.47} width={652} delay={0.06}>
        <div className="flex items-center gap-[8px] text-[#c9a877]">
          <Pin />
          <span className="font-semibold text-[11.8px] uppercase leading-[18.35px] tracking-[1.421px]">La Cabrera · Bogotá · Colombia</span>
        </div>
      </Reveal>

      {/* ── Heading ── */}
      <Reveal left={424} top={652} width={652} delay={0.08}>
        <div className="text-[41.6px] leading-[47.42px] tracking-[-0.832px] text-[#e2cdae]">
          <p className="mb-0 font-light">Apartamento ultra lujo</p>
          <p className="font-semibold">remodelado a costo cerrado</p>
        </div>
      </Reveal>

      {/* ── Spec row ── */}
      <Reveal left={424} top={759.07} width={652} delay={0.1}>
        <div className="relative h-[99.57px] w-[652px] rounded-[20px]" style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, backgroundColor: "rgba(73,33,0,0.2)" }}>
          {SPECS.map((s) => (
            <div key={s.l} className="absolute top-[28.21px] flex flex-col" style={{ left: s.x + 22 }}>
              <span className="whitespace-nowrap font-light text-[11.5px] uppercase leading-[17.86px] tracking-[0.691px] text-[#e2cdae]">{s.l}</span>
              <span className="mt-[2px] whitespace-nowrap font-semibold text-[18.4px] leading-[28.52px] text-[#e2cdae]">{s.v}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── La oportunidad ── */}
      <Reveal left={424} top={889.63} width={652} delay={0.04}>
        <H2>La oportunidad</H2>
        <p className="mt-[16px] max-w-[591px] font-light text-[16px] leading-[24.8px] text-[#e2cdae]">
          Predio en una de las zonas más consolidadas de Bogotá, donde la demanda es alta y la oferta limitada. Entramos por debajo del mercado y lo remodelamos a ultra lujo con criterio técnico: materiales naturales, líneas limpias y obra trazable a costo cerrado. El 70% de la oferta de la zona pide más por m² que nuestro costo total.
        </p>
      </Reveal>

      {/* ── Datos generales ── */}
      <Reveal left={424} top={1088.23} width={652} delay={0.04}>
        <H2>Datos generales</H2>
        <div className="mt-[17px] grid grid-cols-2 gap-[1px] overflow-hidden rounded-[14px]" style={{ backgroundColor: BORDER, border: `1px solid ${BORDER}` }}>
          {DATOS.map(([l, v]) => (
            <div key={l} className="h-[135.66px] px-[18px] pt-[29px] transition-[filter] duration-200 hover:brightness-[0.96]" style={{ backgroundColor: "#f7f1e5" }}>
              <p className="font-light text-[12.5px] leading-[19.34px] text-[#5b4332]">{l}</p>
              <p className="mt-[16px] font-medium text-[15.7px] leading-[24.3px] text-[#3d2c1e]">{v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Riesgos y respaldos ── */}
      <Reveal left={424} top={1575.81} width={652} delay={0.04}>
        <H2>Riesgos y respaldos</H2>
        <div className="mt-[17px] flex flex-col gap-[10px]">
          {RIESGOS.map((r) => (
            <div key={r.title} className="ix-lift flex items-start gap-[13px] rounded-[13px] border border-solid px-[18px] py-[16px]" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER }}>
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px]" style={r.tone === "green" ? { backgroundColor: "rgba(127,139,87,0.15)", color: "#5f6b3e" } : { backgroundColor: "rgba(181,84,47,0.12)", color: "#b5542f" }}>
                {r.tone === "green" ? <Check /> : <Warn />}
              </span>
              <div>
                <p className="font-semibold text-[15.7px] leading-[24.3px] text-[#2a1e14]">{r.title}</p>
                <p className="mt-[2px] font-light text-[13.8px] leading-[21.33px] text-[#5b4332]">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Documentos ── */}
      <Reveal left={424} top={1930.67} width={652} delay={0.04}>
        <H2>Documentos</H2>
        <div className="mt-[17px] flex flex-col gap-[8px]">
          {DOCS.map((d) => (
            <div key={d.t} className="ix-lift flex items-center gap-[12px] rounded-[12px] border border-solid px-[17px] py-[15px]" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER }}>
              <span className="text-[#5b4332]"><FileT /></span>
              <p className="flex-1 font-medium text-[14.7px] leading-[22.82px] text-[#3d2c1e]">{d.t}</p>
              <span className="rounded-full px-[11px] py-[4.5px] font-semibold text-[11.8px] leading-[18.35px]" style={d.tone === "green" ? { backgroundColor: "rgba(127,139,87,0.14)", color: "#5f6b3e" } : { backgroundColor: "#efe6d5", color: "#5b4332" }}>{d.status}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── Sidebar (reserva) ── */}
      <Reveal left={1116} top={621.47} width={380} delay={0.12}>
        <div className="relative h-[662.98px] w-[380px] overflow-hidden rounded-[20px] border border-solid" style={{ backgroundColor: "#f7f1e5", borderColor: BORDER, boxShadow: "0px 30px 60px -38px rgba(42,30,20,0.4)" }}>
          {/* Banner */}
          <div className="flex h-[42.34px] items-center justify-center gap-[7px]" style={{ backgroundColor: "#b5542f" }}>
            <span className="text-white"><Flame s={14} /></span>
            <span className="font-semibold text-[13.1px] leading-[20.34px] text-white">No te pierdas esta oportunidad</span>
          </div>

          {/* Body */}
          <div className="absolute left-0 right-0 top-[43.34px] h-[618.64px]">
            {/* Score row */}
            <div className="absolute left-[24px] right-[24px] top-[26px] flex items-center gap-[14px] pb-[23px]" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <div className="flex size-[60px] items-center justify-center rounded-full" style={{ backgroundColor: "rgba(127,139,87,0.14)" }}>
                <div className="flex size-[46px] items-center justify-center rounded-full" style={{ backgroundColor: "#f7f1e5" }}>
                  <span className="font-bold text-[17.6px] leading-[27.28px] text-[#5f6b3e]"><CountUp value={96} duration={1.5} /></span>
                </div>
              </div>
              <div>
                <p className="font-light text-[12.5px] leading-[19.34px] text-[#5b4332]">Score Serava</p>
                <p className="font-semibold text-[16px] leading-[24.8px] text-[#3d2c1e]">Prioridad alta</p>
              </div>
            </div>

            {/* Inversión total */}
            <p className="absolute left-[24px] top-[130.67px] font-light text-[13.1px] leading-[20.34px] text-[#5b4332]">Inversión total</p>
            <div className="absolute left-[24px] right-[24px] top-[158.93px] flex items-baseline justify-between">
              <span className="font-semibold text-[27.2px] leading-[42.16px] text-[#3d2c1e]"><CountUp value={3100} prefix="$" suffix="M" grouping duration={1.6} /></span>
              <span className="font-light text-[13.1px] leading-[20.34px] text-[#5b4332]">COP</span>
            </div>
            {/* ROI */}
            <div className="absolute left-[24px] right-[24px] top-[213px] flex items-baseline justify-between">
              <span className="font-light text-[13.1px] leading-[20.34px] text-[#5b4332]">ROI estimado</span>
              <span className="font-semibold text-[19.2px] leading-[29.76px] text-[#5f6b3e]"><CountUp value={22} prefix="~" suffix="%" duration={1.5} /></span>
            </div>

            {/* Timer */}
            <div className="absolute left-[24px] right-[24px] top-[263.25px] flex items-center gap-[11px] rounded-[13px] border border-solid px-[17px] py-[15px]" style={{ backgroundColor: "rgba(181,84,47,0.08)", borderColor: "rgba(181,84,47,0.3)" }}>
              <span className="text-[#b5542f]"><Clock s={20} /></span>
              <div>
                <p className="font-light text-[12.5px] leading-[19.34px] text-[#5b4332]">Reserva disponible por</p>
                <p className="font-bold text-[18.4px] leading-[28.52px] tabular-nums text-[#b5542f]">{time}</p>
              </div>
            </div>

            {/* Reservar ahora */}
            <button type="button" className="ix-press ix-pulse-tuscany absolute left-[24px] right-[24px] top-[361.11px] flex items-center justify-center gap-[10px] rounded-[999px] py-[18px] font-semibold text-[16px] text-white" style={{ backgroundColor: "#b5542f" }}>
              Reservar ahora <Bolt />
            </button>
            {/* Ver Análisis Add Value */}
            <a href="/predios/add-value" className="ix-press absolute left-[24px] right-[24px] top-[430.11px] flex h-[60.8px] items-center justify-center gap-[9px] rounded-[999px] border border-solid font-semibold text-[16px] leading-[24.8px] text-[#3d2c1e]" style={{ borderColor: BORDER }}>
              Ver Análisis Add Value <ArrowR />
            </a>

            {/* Viewers */}
            <div className="absolute left-[24px] right-[24px] top-[498.41px] flex items-center justify-center gap-[8px] text-[#b5542f]">
              <span className="inline-flex motion-safe:animate-pulse"><Eye s={14} /></span>
              <span className="font-medium text-[12.8px] leading-[19.84px]">5 inversionistas viendo este predio</span>
            </div>
            {/* Note */}
            <p className="absolute left-[24px] right-[24px] top-[532.21px] text-center font-light text-[12.5px] leading-[19.97px] text-[#5b4332]">
              Al reservar, <span className="font-semibold text-[#b5542f]">el predio se bloquea</span> y deja de estar disponible para otros mientras tu reserva esté vigente.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
