"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/motion/CountUp";

const EASE = [0.22, 1, 0.36, 1] as const;
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Photo = () => (<svg width={26} height={26} viewBox="0 0 24 24" {...s} aria-hidden><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M4 17l5-4 4 3 3-2 4 3" /></svg>);
const Pin = () => (<svg width={13} height={13} viewBox="0 0 24 24" {...s} aria-hidden><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.3" /></svg>);
const Ruler = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...s} aria-hidden><rect x="3" y="8" width="18" height="8" rx="1" /><path d="M7 8v3M11 8v4M15 8v3M19 8v4" /></svg>);
const Bed = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...s} aria-hidden><path d="M3 18V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9M3 14h18M7 10h4" /></svg>);
const Bath = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...s} aria-hidden><path d="M4 12V6a2 2 0 0 1 4 0M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" /></svg>);
const Car = () => (<svg width={15} height={15} viewBox="0 0 24 24" {...s} aria-hidden><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13M4 13h16v5H4zM7 18v2M17 18v2" /></svg>);
const Clock = () => (<svg width={13} height={13} viewBox="0 0 24 24" {...s} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const Eye = () => (<svg width={14} height={14} viewBox="0 0 24 24" {...s} aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>);
const Bolt = () => (<svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" /></svg>);
const Bell = () => (<svg width={16} height={16} viewBox="0 0 24 24" {...s} aria-hidden><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" /></svg>);

export type Predio = {
  city: string;
  title: [string, string?];
  score?: number;
  pill?: { label: string; tone: "green" | "orange" | "neutral" };
  urgency?: { label: string; value: string };
  specs?: [string, string, string, string]; // area, hab, baños, parq
  price?: string;
  roi?: number;
  note?: { text: string; tone: "red" | "green" | "muted" };
  variant: "available" | "reserved" | "coming";
  description?: string;
};

const PILL_TONE = {
  green: { bg: "#7f8b57", color: "#f7f1e5" },
  orange: { bg: "#b5542f", color: "#f7f1e5" },
  neutral: { bg: "rgba(42,30,20,0.65)", color: "rgba(247,241,229,0.9)" },
};
const NOTE_COLOR = { red: "#b5542f", green: "#5f6b3e", muted: "#5b4332" };

export default function PredioCard({ data, delay = 0 }: { data: Predio; delay?: number }) {
  const { city, title, score, pill, urgency, specs, price, roi, note, variant, description } = data;
  return (
    <motion.div
      initial={{ y: 26 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-clip rounded-[20px] border border-solid border-[rgba(165,122,78,0.28)] bg-cream-93 transition-shadow duration-300 hover:shadow-[0px_24px_48px_-24px_rgba(42,30,20,0.5)]"
    >
      {/* Image placeholder */}
      <div className="relative w-full aspect-[360/248] overflow-hidden" style={{ backgroundImage: "linear-gradient(155deg, #5b4332 0%, #3d2c1e 100%)" }}>
        <div className="ix-zoom absolute inset-0 flex flex-col items-center justify-center gap-[7px]">
          <span style={{ color: "rgba(247,241,229,0.6)" }}><Photo /></span>
          <p className="font-semibold text-[9.6px] uppercase tracking-[0.1em] text-center" style={{ color: "rgba(247,241,229,0.6)" }}>Foto — {city}</p>
        </div>
        {/* Top badges */}
        <div className="absolute left-[14px] right-[14px] top-[14px] flex items-start justify-between">
          {pill ? (
            <span className="rounded-[8px] px-[10px] py-[5px] font-bold text-[9.5px] uppercase tracking-[0.06em] backdrop-blur-[2px]" style={{ background: PILL_TONE[pill.tone].bg, color: PILL_TONE[pill.tone].color }}>{pill.label}</span>
          ) : score != null ? (
            <span className="flex items-end gap-[6px] rounded-[8px] bg-[rgba(247,241,229,0.95)] px-[11px] pt-[5px] pb-[6px] shadow-[0px_6px_14px_-6px_rgba(0,0,0,0.4)]">
              <span className="font-bold text-[10.6px] uppercase tracking-[0.08em] text-[#3d2c1e]">Score</span>
              <span className="font-bold text-[10.6px] text-[#5f6b3e]">{score}</span>
            </span>
          ) : <span />}
          {pill && score != null && (
            <span className="flex items-end gap-[6px] rounded-[8px] bg-[rgba(247,241,229,0.95)] px-[11px] pt-[5px] pb-[6px] shadow-[0px_6px_14px_-6px_rgba(0,0,0,0.4)]">
              <span className="font-bold text-[10.6px] uppercase tracking-[0.08em] text-[#3d2c1e]">Score</span>
              <span className="font-bold text-[10.6px] text-[#5f6b3e]">{score}</span>
            </span>
          )}
        </div>
        {/* Urgency bar */}
        {urgency && (
          <div className="absolute bottom-[14px] left-[14px] flex h-[33px] items-center gap-[9px] rounded-[9px] px-[12px] backdrop-blur-[2px]" style={{ background: "rgba(42,30,20,0.82)" }}>
            <span className="text-tan-63"><Clock /></span>
            <span className="font-medium text-[12.2px] text-cream-93">{urgency.label}</span>
            <span className="font-bold text-[12.2px] text-tan-63">{urgency.value}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex grow flex-col px-[22px] pt-[20px] pb-[24px]">
        <div className="flex items-center gap-[7px] text-[#a57a4e]">
          <Pin />
          <span className="font-semibold text-[11.8px] uppercase tracking-[0.1em] text-[#a57a4e]">{city}</span>
        </div>
        <div className="mt-[8px] font-semibold text-[18.4px] leading-[20.98px] tracking-[-0.02em] text-[#2a1e14]">
          <p className="mb-0">{title[0]}</p>
          {title[1] && <p>{title[1]}</p>}
        </div>

        {variant === "coming" ? (
          <>
            <p className="mt-[12px] font-light text-[13.1px] leading-[20px] text-[#5b4332]">{description}</p>
            <button type="button" className="ix-press mt-auto flex items-center justify-center gap-[9px] rounded-[999px] border border-solid border-[rgba(165,122,78,0.28)] py-[15px] text-[14.7px] font-semibold text-[#3d2c1e]">
              Avísame cuando abra <Bell />
            </button>
          </>
        ) : (
          <>
            {/* Specs */}
            <div className="mt-[16px] flex flex-wrap gap-x-[16px] gap-y-[6px] text-[#5b4332]">
              <span className="flex items-center gap-[7px] font-light text-[13.1px]"><Ruler /> {specs![0]}</span>
              <span className="flex items-center gap-[7px] font-light text-[13.1px]"><Bed /> {specs![1]}</span>
              <span className="flex items-center gap-[7px] font-light text-[13.1px]"><Bath /> {specs![2]}</span>
              <span className="flex items-center gap-[7px] font-light text-[13.1px]"><Car /> {specs![3]}</span>
            </div>
            {/* Price / ROI */}
            <div className="mt-[16px] flex items-end justify-between">
              <div>
                <p className="font-light text-[11.2px] uppercase tracking-[0.08em] text-[#5b4332]">Inversión total</p>
                <p className="mt-[2px] font-semibold text-[24px] leading-none tracking-[-0.02em] text-[#3d2c1e]">{price}</p>
              </div>
              <div className="text-right">
                <p className="font-light text-[11.2px] uppercase tracking-[0.08em] text-[#5b4332]">ROI estimado</p>
                <p className="mt-[2px] font-bold text-[19.2px] leading-none text-[#5f6b3e]"><CountUp value={roi!} suffix="%" duration={1.2} /></p>
              </div>
            </div>
            {/* Note */}
            {note && (
              <div className="mt-[14px] flex items-center gap-[8px]" style={{ color: NOTE_COLOR[note.tone] }}>
                <Eye />
                <span className="font-medium text-[12.5px]">{note.text}</span>
              </div>
            )}
            {/* Buttons */}
            <div className="mt-[16px] flex gap-[10px]">
              {variant === "reserved" ? (
                <div className="flex flex-1 items-center justify-center rounded-[999px] py-[15px] text-[14.7px] font-semibold" style={{ background: "rgba(165,122,78,0.18)", color: "#a57a4e" }}>Reservada</div>
              ) : (
                <a href="/predios/ficha" className="ix-reserve flex flex-1 items-center justify-center gap-[9px] rounded-[999px] bg-[#f5d741] py-[15px] text-[14.7px] font-semibold text-white shadow-[0px_12px_26px_-14px_rgba(181,84,47,0.7)]">
                  Reservar ahora <Bolt />
                </a>
              )}
              <a href="/predios/ficha" className="ix-press flex items-center justify-center rounded-[999px] border border-solid border-[rgba(165,122,78,0.28)] px-[19px] py-[13.5px] text-[14.7px] font-semibold text-[#3d2c1e]">Ver ficha</a>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
