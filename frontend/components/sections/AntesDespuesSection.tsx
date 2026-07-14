"use client";

import { motion, useInView, useMotionTemplate, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

const IMG = "/antes-despues";
const PROPS = [
  { city: "Bogotá", name: "Cabrera 1502", full: "Cabrera 1502 · Bogotá", title: "Remodelación integral ultra lujo", area: 320, interv: "Integral", renta: 54, antes: `${IMG}/1502-sala-antes.webp`, despues: `${IMG}/1502-sala-despues.webp` },
  { city: "Bogotá", name: "Cabrera 1601", full: "Cabrera 1601 · Bogotá", title: "Cocina integral en madera", area: 280, interv: "Integral", renta: 48, antes: `${IMG}/1601-cocina-antes.webp`, despues: `${IMG}/1601-cocina-despues.webp` },
  { city: "Bogotá", name: "Cabrera 1502", full: "Cabrera 1502 · Bogotá", title: "Baño principal en mármol", area: 350, interv: "Integral", renta: 51, antes: `${IMG}/1502-bano-antes.webp`, despues: `${IMG}/1502-bano-despues.webp` },
  { city: "Bogotá", name: "Cabrera 1602", full: "Cabrera 1602 · Bogotá", title: "Sala social renovada", area: 300, interv: "Integral", renta: 60, antes: `${IMG}/1602-sala-antes.webp`, despues: `${IMG}/1602-sala-despues.webp` },
];

const sIco = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Pin = () => (<svg width={13} height={13} viewBox="0 0 24 24" {...sIco} aria-hidden><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.4" /></svg>);
const ChevL = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...sIco} strokeWidth={2.2} aria-hidden><path d="M15 6l-6 6 6 6" /></svg>);
const ChevR = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...sIco} strokeWidth={2.2} aria-hidden><path d="M9 6l6 6-6 6" /></svg>);
const Drag = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...sIco} aria-hidden><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M12 4v16" /></svg>);

/** Home · Seccion Antes / Después — comparador interactivo (1939 × 1499) */
export default function AntesDespuesSection() {
  const [active, setActive] = useState(0);
  const p = PROPS[active];

  const compRef = useRef<HTMLDivElement>(null);
  const inView = useInView(compRef, { once: true, amount: 0.5 });
  const pos = useMotionValue(50);
  const beforeClip = useMotionTemplate`inset(0 ${useTransform(pos, (v) => 100 - v)}% 0 0)`;
  const leftPct = useMotionTemplate`${pos}%`;
  const dragging = useRef(false);

  // One-time "hint" sweep when it scrolls into view.
  useEffect(() => {
    if (!inView) return;
    const controls = animate(pos, [50, 70, 32, 50], { duration: 2.4, ease: EASE, delay: 0.3 });
    return () => controls.stop();
  }, [inView, pos]);

  const setFromClientX = (clientX: number) => {
    const el = compRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pos.set(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    const move = (e: PointerEvent) => dragging.current && setFromClientX(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div className="relative size-full overflow-hidden" style={{ background: "radial-gradient(60% 55% at 50% 46%, rgba(201,168,119,0.16) 0%, rgba(101,84,60,0.08) 27%, rgba(0,0,0,0) 55%), #e2cdae" }} data-name="Antes / Despues">
      {/* Fondo topográfico — node 217:1227 */}
      <img
        aria-hidden
        loading="lazy"
        decoding="async"
        alt=""
        src="/figma/Fondo_Modelo_Antes_des.webp"
        className="absolute inset-0 size-full max-w-none object-cover opacity-[0.08] pointer-events-none"
      />

      <div className="absolute left-1/2 -translate-x-1/2 top-[249px] w-[1080px]">
        {/* Header */}
        <p className="font-semibold leading-[17px] not-italic text-[#a57a4e] text-[11px]">Antes / Después</p>
        <p className="[word-break:break-word] mt-[18px] font-light leading-[53px] not-italic text-[#3d2c1e] text-[48px]">
          El mismo inmueble. <span className="font-bold">Un valor completamente distinto.</span>
        </p>
        <p className="[word-break:break-word] mt-[18px] font-light leading-[27px] not-italic text-[#5b4332] text-[17px] w-[560px]">
          Cada intervención parte de un activo con potencial y lo convierte en uno que vale —y renta— más. Desliza para ver la transformación en proyectos reales.
        </p>

        {/* Comparison */}
        <div
          ref={compRef}
          onPointerDown={(e) => { dragging.current = true; setFromClientX(e.clientX); }}
          className="relative mt-[34px] h-[607.5px] w-[1080px] overflow-hidden rounded-[20px] shadow-[0px_34px_70px_-38px_rgba(42,30,20,0.5)] cursor-ew-resize select-none touch-none"
          style={{ background: "#3d2c1e" }}
        >
          {/* After (base) */}
          <img
            loading="lazy"
            decoding="async"
            key={`despues-${active}`}
            src={p.despues}
            alt={`Después — ${p.full}, ${p.title}`}
            draggable={false}
            className="absolute inset-0 size-full max-w-none object-cover pointer-events-none"
          />
          {/* Before (clipped to left) */}
          <motion.div className="absolute inset-0" style={{ clipPath: beforeClip }}>
            <img
              loading="lazy"
              decoding="async"
              key={`antes-${active}`}
              src={p.antes}
              alt={`Antes — ${p.full}, estado original`}
              draggable={false}
              className="absolute inset-0 size-full max-w-none object-cover pointer-events-none"
            />
          </motion.div>

          {/* Badges */}
          <div className="absolute left-[16px] top-[16px] rounded-[8px] border border-solid border-[rgba(247,241,229,0.18)] px-[14px] py-[7px] backdrop-blur-[2px]" style={{ background: "rgba(42,30,20,0.6)" }}>
            <span className="font-bold text-[10px]" style={{ color: "rgba(247,241,229,0.9)" }}>Antes</span>
          </div>
          <div className="absolute right-[16px] top-[16px] rounded-[8px] px-[14px] py-[7px] backdrop-blur-[2px]" style={{ background: "rgba(127,139,87,0.85)" }}>
            <span className="font-bold text-[10px] text-cream-93">Después</span>
          </div>

          {/* Divider */}
          <motion.div className="absolute top-0 h-full w-[2px] bg-cream-93 shadow-[0px_0px_20px_0px_rgba(0,0,0,0.4)]" style={{ left: leftPct, x: -1 }} />
          {/* Handle */}
          <motion.div
            className="absolute top-1/2 flex size-[52px] -translate-y-1/2 items-center justify-center gap-[3px] rounded-full bg-cream-93 text-[#3d2c1e]"
            style={{ left: leftPct, x: -26, filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.5))" }}
          >
            <ChevL /><ChevR />
          </motion.div>
        </div>

        {/* Info bar */}
        <div className="mt-[22px] flex h-[94.34px] items-center rounded-[16px] border border-solid border-[rgba(165,122,78,0.28)] bg-cream-93 px-[24px]">
          <div>
            <div className="flex items-center gap-[8px] text-[#a57a4e]">
              <Pin />
              <span className="font-semibold text-[12px] text-[#a57a4e]">{p.full}</span>
            </div>
            <p className="mt-[4px] font-semibold text-[18px] text-[#2a1e14]">{p.title}</p>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="mt-[20px] flex gap-[12px]">
          {PROPS.map((t, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-[163px] w-[261px] overflow-hidden rounded-[12px] border-2 border-solid"
              style={{ borderColor: active === i ? "#7f8b57" : "transparent" }}
            >
              <img loading="lazy" decoding="async" src={t.despues} alt={t.full} draggable={false} className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-[60px] w-full" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(42,30,20,0.85) 100%)" }} />
              <div className="absolute bottom-[12px] left-[12px] text-left">
                <p className="font-medium leading-[14px] text-[9px] text-tan-63">{t.city}</p>
                <p className="font-semibold leading-[14px] text-[11px] text-cream-93">{t.name}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Note */}
        <div className="mt-[20px] flex items-center gap-[8px] text-[#5b4332]">
          <Drag />
          <p className="font-light leading-[19px] text-[12px] text-[#5b4332]">Arrastra el círculo (o toca la imagen) para revelar el antes y el después.</p>
        </div>
      </div>
    </div>
  );
}
