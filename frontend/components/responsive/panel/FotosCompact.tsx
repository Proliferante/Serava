"use client";

import BeforeAfter from "@/components/panel/BeforeAfter";
import { MUTED } from "@/components/panel/ui";
import { PCard, PEyebrow, PFoto, PIn, PTitle } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FOTOS Y AVANCE VISUAL — vista fluida.

   El mismo comparador antes/después —arrastrable con el dedo, que ya lo era— y
   la galería completa: en el escritorio son dos filas de cuatro, aquí dos
   columnas que caben en 390 px sin encoger la etiqueta.
   ═══════════════════════════════════════════════════════════════════════════ */

const GALERIA = [
  { label: "Sala", date: "12 Jun" },
  { label: "Cocina", date: "10 Jun" },
  { label: "Baño", date: "08 Jun" },
  { label: "Alcoba principal", date: "06 Jun" },
  { label: "Carpintería", date: "04 Jun" },
  { label: "Redes", date: "28 May" },
  { label: "Demolición", date: "18 May" },
  { label: "Estado inicial", date: "05 May" },
];

export default function FotosCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Fotos y" strong="avance visual"
        sub="Registro fotográfico por etapa y el comparativo antes / después de tu inmueble."
      />

      {/* ── Antes / Después ── */}
      <PCard delay={0.04}>
        <PEyebrow>Antes / Después</PEyebrow>
        <PIn delay={0.08} className="relative mt-[12px]" style={{ aspectRatio: "4 / 3" }}>
          <BeforeAfter />
        </PIn>
        <p className="m-0 mt-[10px] text-[12.5px] font-light leading-[1.5]" style={{ color: MUTED }}>
          Arrastra el círculo para ver el estado original y el actual.
        </p>
      </PCard>

      {/* ── Galería por fecha ── */}
      <PCard delay={0.04}>
        <PEyebrow>Galería por fecha</PEyebrow>
        <div className="mt-[12px] grid grid-cols-2 gap-[10px] sm:grid-cols-3">
          {GALERIA.map((g, i) => (
            <PFoto key={g.label} label={g.label} date={g.date} delay={0.04 + (i % 3) * 0.05} ratio="4 / 3" />
          ))}
        </div>
      </PCard>
    </div>
  );
}
