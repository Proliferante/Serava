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
        className="ix-press absolute bg-cream h-[104px] left-[1324px] overflow-clip rounded-[98px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] top-[988px] w-[404px] flex items-center justify-center"
      >
        <p className="[word-break:break-word] font-semibold not-italic text-brown-dark text-center leading-[1.25] px-[26px]">
          <span className="text-[25px]">Compara:</span>{" "}
          <span className="font-light text-[24px]">por tu cuenta vs. con Serava&quot;</span>
        </p>
      </button>
      <ComparativaModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
