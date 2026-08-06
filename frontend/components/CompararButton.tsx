"use client";

import { useState } from "react";
import ComparativaModal from "@/components/ComparativaModal";

/**
 * Section 3 CTA — opens the "por tu cuenta vs. con Zequara" popup.
 *
 * Usa el sistema `ix-cta` de globals.css (mismo que Oportunidades, Cómo
 * operamos y Solicitud): pulso de atención + barrido de luz en reposo, y al
 * pasar el ratón la pastilla se eleva, el círculo crece y la flecha dispara.
 */
export default function CompararButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Compara tu inversión: por tu cuenta vs. con Zequara"
        className="ix-cta absolute bg-cream h-[104px] left-[1324px] overflow-hidden rounded-[98px] shadow-[0px_16px_32px_-16px_rgba(0,0,0,0.45)] top-[988px] w-[454px] flex items-center justify-between pl-[54.5px] pr-[16px]"
      >
        <span className="[word-break:break-word] w-[295px] not-italic text-brown-dark text-left">
          <span className="block font-semibold text-[25px] leading-[34px]">Compara tu inversión:</span>
          <span className="block font-light text-[19px] leading-[34px]">por tu cuenta vs. con Zequara</span>
        </span>

        {/* Círculo con flecha — crece al hover, la flecha dispara dentro del círculo */}
        <span className="ix-cta-circle flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-brown-dark">
          <svg className="ix-cta-arrow" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M5 14h17M14.5 6.5 22 14l-7.5 7.5" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <span className="ix-cta-shine" aria-hidden />
      </button>
      <ComparativaModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
