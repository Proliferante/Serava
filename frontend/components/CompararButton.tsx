"use client";

import { useState } from "react";
import ComparativaModal from "@/components/ComparativaModal";

/** Section 3 CTA — opens the "por tu cuenta vs. con Serava" popup. */
export default function CompararButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ix-press absolute bg-cream h-[104px] left-[1324px] overflow-clip rounded-[98px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] top-[988px] w-[404px] text-left"
      >
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-semibold h-[68px] leading-[0] left-[202px] not-italic text-brown-dark text-[0px] text-center top-[18px] w-[295px]">
          <span className="leading-[1.36] text-[25px]">Compara:</span>
          <span className="leading-[90.645%] text-[24px]"> </span>
          <span className="font-light leading-[90.645%] text-[24px]">por tu cuenta vs. con Serava&quot;</span>
        </p>
      </button>
      <ComparativaModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
