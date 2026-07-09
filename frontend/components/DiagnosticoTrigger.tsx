"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import DiagnosticoModal from "@/components/DiagnosticoModal";

/** Wraps a trigger element that opens the Diagnóstico Patrimonial modal. */
export default function DiagnosticoTrigger({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>
      <DiagnosticoModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
