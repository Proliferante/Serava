"use client";

import { motion } from "framer-motion";
import { CHIP_TIP, SCORE_TIP, type Predio } from "@/components/predios/PredioCard";
import { EASE } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   TARJETA DE PREDIO fluida.

   `PredioCard` va en absoluto con un tamaño fijo de lienzo, así que no sirve
   aquí. Ésta pinta los mismos datos ocupando el ancho de su columna: una en
   móvil, dos desde 640.

   El hueco de la foto es una banda de proporción 16:10 en vez de un alto fijo,
   para que la tarjeta escale con la columna sin dejar la foto desproporcionada.
   ═══════════════════════════════════════════════════════════════════════════ */

const CREAM = "#f7f1e5";
const INK = "#2a1e14";
const MUTED = "#5b4332";
const DRIFT = "#a57a4e";
const VERD = "#5f6b3e";
const LINE = "rgba(165,122,78,0.28)";
const PHOTO_BG = "linear-gradient(160deg, #4b3729 0%, #2b1f16 100%)";

const BADGE: Record<string, { bg: string; fg: string }> = {
  green: { bg: "#77854e", fg: CREAM },
  gold: { bg: "#c8913f", fg: "#ffffff" },
  brown: { bg: "rgba(34,24,18,0.72)", fg: "#c9a877" },
};

function Home() {
  return (<svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(247,241,229,0.5)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /></svg>);
}
function Pin() {
  return (<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 10.4c0 5.3-7 10.4-7 10.4s-7-5.1-7-10.4a7 7 0 0 1 14 0z" /><circle cx="12" cy="10.2" r="2.4" /></svg>);
}
function Arrow() {
  return (<svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4.5 12h15M13.6 6.2 19.5 12l-5.9 5.8" /></svg>);
}

export default function PredioCardCompact({ data, delay = 0, href = "/predios/ficha" }: { data: Predio; delay?: number; href?: string }) {
  const b = BADGE[data.badge.tone] ?? BADGE.green;
  return (
    <motion.a
      href={href}
      className="ix-prop flex flex-col overflow-hidden rounded-[18px] border border-solid"
      whileTap={{ scale: 0.985 }}
      style={{ borderColor: LINE, background: CREAM }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {/* Hueco de foto */}
      <div className="relative flex items-center justify-center" style={{ aspectRatio: "16 / 10", backgroundImage: PHOTO_BG }}>
        <span className="ix-prop-ico"><Home /></span>
        <span className="absolute left-[12px] top-[12px] rounded-[8px] px-[10px] py-[5px] text-[9.9px] font-bold uppercase tracking-[0.6px]" style={{ background: b.bg, color: b.fg }}>
          {data.badge.label}
        </span>
        <span className="absolute right-[12px] top-[12px] flex items-center gap-[5px] rounded-[8px] border border-solid px-[9px] py-[4px] text-[10px] font-bold" style={{ background: "rgba(34,24,18,0.6)", borderColor: "rgba(201,168,119,0.3)", color: "#c9a877" }} title={SCORE_TIP}>
          Score Zequara {data.score}
        </span>
        <span className="absolute bottom-[10px] left-[12px] text-[9.6px] font-semibold uppercase tracking-[0.96px]" style={{ color: "rgba(247,241,229,0.55)" }}>
          Foto — {data.photo}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-[18px]">
        <span className="flex items-center gap-[6px] text-[11px] font-semibold uppercase tracking-[1.1px]" style={{ color: DRIFT }}>
          <Pin />{data.city}
        </span>
        <h3 className="m-0 mt-[8px] text-[16.5px] font-semibold leading-[1.28]" style={{ color: INK }}>{data.title}</h3>
        <span className="mt-[10px] inline-block w-fit rounded-full px-[11px] py-[5px] text-[11px] font-medium" style={{ background: "rgba(127,139,87,0.14)", color: VERD }}>{data.chip}</span>
        {/* En escritorio estas dos explicaciones salen al pasar el ratón. En
            táctil no hay ratón, así que van visibles: la información tiene que
            estar igual, y aquí hay sitio en vertical. */}
        {CHIP_TIP[data.chip] && (
          <p className="m-0 mt-[7px] text-[12px] font-light leading-[1.45]" style={{ color: MUTED }}>{CHIP_TIP[data.chip]}</p>
        )}
        <p className="m-0 mt-[10px] text-[12.5px] font-light" style={{ color: MUTED }}>{data.specs}</p>

        <div className="mt-[14px] flex items-end justify-between gap-[10px] border-t border-solid pt-[12px]" style={{ borderColor: LINE }}>
          <span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.8px]" style={{ color: MUTED }}>Inversión total estimada</span>
            <span className="block text-[15.5px] font-semibold" style={{ color: INK }}>{data.price}</span>
            <span className="block text-[11.5px] font-light" style={{ color: MUTED }}>{data.priceNote}</span>
          </span>
          <span className="text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.8px]" style={{ color: MUTED }}>TIR estimada</span>
            <span className="block text-[15.5px] font-semibold" style={{ color: VERD }}>{data.tir}% anual</span>
            <span className="block text-[11.5px] font-light" style={{ color: MUTED }}>{data.horizon}</span>
          </span>
        </div>

        <span className="mt-[14px] flex h-[46px] items-center justify-center gap-[8px] rounded-full text-[14.5px] font-semibold" style={{ background: "#7f8b57", color: CREAM }}>
          Ver oportunidad <span className="ix-prop-arrow"><Arrow /></span>
        </span>
        <span className="mt-[10px] text-center text-[11.5px] font-light" style={{ color: MUTED }}>{data.status}</span>
      </div>
    </motion.a>
  );
}
