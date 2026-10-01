"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import DiagnosticoModal from "@/components/DiagnosticoModal";

/** Un botón que abre el diagnóstico del inversionista (la única puerta de entrada: ver DiagnosticoModal). */
export default function DiagnosticoTrigger({
  children,
  className,
  style,
  origen,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** De dónde se abre (portada, solicitud de acceso, evento): viaja con la solicitud. */
  origen?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} style={style}>
        {children}
      </button>
      <DiagnosticoModal open={open} onClose={() => setOpen(false)} origen={origen} />
    </>
  );
}
