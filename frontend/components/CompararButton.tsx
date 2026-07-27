"use client";

import { useState } from "react";
import ComparativaModal from "@/components/ComparativaModal";

/**
 * Section 3 CTA — opens the "por tu cuenta vs. con Serava" popup.
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
        aria-label="Compara: por tu cuenta vs. con Serava"
        className="ix-cta absolute bg-cream h-[104px] left-[1324px] overflow-hidden rounded-[98px] shadow-[0px_16px_32px_-16px_rgba(0,0,0,0.45)] top-[1000px] w-[404px] flex items-center justify-between pl-[38px] pr-[23px]"
      >
        <span className="[word-break:break-word] not-italic text-brown-dark text-left">
          <span className="block font-semibold text-[25px] leading-[1.2]">Compara:</span>
          <span className="block font-light text-[19px] leading-[1.25]">por tu cuenta vs. con Serava</span>
        </span>

        {/* Círculo con flecha — crece al hover, la flecha dispara dentro del círculo */}
        <span className="ix-cta-circle flex h-[58px] w-[58px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-brown-dark">
          <svg className="ix-cta-arrow" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M4 11h13M11.5 5.5 17 11l-5.5 5.5" stroke="#e2cdae" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <span className="ix-cta-shine" aria-hidden />
      </button>
      <ComparativaModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
