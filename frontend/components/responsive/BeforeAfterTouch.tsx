"use client";

import { useState } from "react";
import { EASE, LASER, LINEN } from "@/components/responsive/kit";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   COMPARADOR ANTES / DESPUÉS PARA TÁCTIL.

   El del escritorio se arrastra con el ratón sobre un `mousemove`, que en un
   móvil no existe. Aquí el mando es un `<input type="range">` transparente
   estirado sobre la foto: el navegador ya le da arrastre con el dedo, teclado
   con las flechas y lectura por voz, que es lo que costaría replicar a mano.

   El rango sólo mueve un número; lo que se ve es el recorte de la foto de
   "después" y la posición de la guía. Así no hay reflow al arrastrar.
   ═══════════════════════════════════════════════════════════════════════════ */

const ADP = "/antes-despues";

export default function BeforeAfterTouch({ slug, alt }: { slug: string; alt: string }) {
  const [pos, setPos] = useState(52);

  return (
    <div className="relative select-none overflow-hidden rounded-[16px]" style={{ aspectRatio: "4 / 3" }}>
      <img
        src={`${ADP}/${slug}-antes.webp`} alt={`${alt} — antes`}
        loading="lazy" decoding="async"
        className="pointer-events-none absolute inset-0 size-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <img
          src={`${ADP}/${slug}-despues.webp`} alt={`${alt} — después`}
          loading="lazy" decoding="async"
          className="size-full object-cover"
        />
      </div>

      {/* Guía y tirador. Van pegados al valor del rango, no al puntero. */}
      <div className="pointer-events-none absolute inset-y-0 w-px" style={{ left: `${pos}%`, background: "rgba(247,241,229,0.9)" }} />
      <div
        className="pointer-events-none absolute flex size-[42px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{ left: `${pos}%`, top: "50%", background: "rgba(42,30,20,0.55)", border: `1px solid ${LASER}`, backdropFilter: "blur(2px)" }}
      >
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={LINEN} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6 4 12l5 6M15 6l5 6-5 6" />
        </svg>
      </div>

      <span className="pointer-events-none absolute left-[12px] top-[12px] rounded-[8px] px-[10px] py-[5px] text-[10px] font-bold uppercase tracking-[0.6px]" style={{ background: "rgba(42,30,20,0.6)", color: LINEN }}>Antes</span>
      <span className="pointer-events-none absolute right-[12px] top-[12px] rounded-[8px] px-[10px] py-[5px] text-[10px] font-bold uppercase tracking-[0.6px]" style={{ background: "rgba(127,139,87,0.85)", color: LINEN }}>Después</span>

      <motion.span
        className="pointer-events-none absolute inset-x-0 bottom-[12px] text-center text-[12px]"
        style={{ color: "rgba(247,241,229,0.85)" }}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: [0.9, 0.45, 0.9] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        Desliza para comparar
      </motion.span>

      <input
        type="range" min={0} max={100} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Comparar antes y después — ${alt}`}
        className="ba-range absolute inset-0 size-full cursor-ew-resize appearance-none bg-transparent"
      />
    </div>
  );
}
