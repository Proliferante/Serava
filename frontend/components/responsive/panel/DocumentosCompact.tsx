"use client";

import { PCard, PDocRow, PTitle } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   DOCUMENTOS — vista fluida.

   El expediente completo en una tarjeta, igual que el lienzo: las filas ya son
   una lista, así que sólo cambia el ancho.
   ═══════════════════════════════════════════════════════════════════════════ */

const DOCS = [
  { name: "Contrato de obra a costo cerrado.pdf", sub: "Firmado · vigente" },
  { name: "Presupuesto cerrado v3.pdf", sub: "Actualizado hoy" },
  { name: "Cronograma actualizado.xlsx", sub: "Actualizado ayer" },
  { name: "Planos eléctricos.pdf", sub: "Actualizado hace 3 días" },
  { name: "Estudio de títulos.pdf", sub: "Validado antes del ingreso" },
  { name: "Plan de remodelación.pdf", sub: "Alcance aprobado" },
];

export default function DocumentosCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        strong="Documentos"
        sub="Todo formalizado: cada etapa se respalda en contratos claros, sin letra chica."
      />
      <PCard delay={0.04}>
        {DOCS.map((d, i) => <PDocRow key={d.name} {...d} first={i === 0} delay={0.05 + i * 0.05} />)}
      </PCard>
    </div>
  );
}
