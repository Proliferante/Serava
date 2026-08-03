"use client";

import { Card, DocRow, ViewTitle } from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   DOCUMENTOS — Figma 472:4293 (vista de 1604 × 532.89).

   El expediente completo del proyecto en una sola tarjeta: contrato, cifras,
   cronograma, planos y estudios, cada uno con su estado y su descarga.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + área de contenido (1125.08). */
export const DOCUMENTOS_H = 1200;

const DOCS = [
  { y: 23, name: "Contrato de obra a costo cerrado.pdf", sub: "Firmado · vigente" },
  { y: 88.38, name: "Presupuesto cerrado v3.pdf", sub: "Actualizado hoy" },
  { y: 153.76, name: "Cronograma actualizado.xlsx", sub: "Actualizado ayer" },
  { y: 219.14, name: "Planos eléctricos.pdf", sub: "Actualizado hace 3 días" },
  { y: 284.52, name: "Estudio de títulos.pdf", sub: "Validado antes del ingreso" },
  { y: 349.9, name: "Plan de remodelación.pdf", sub: "Alcance aprobado" },
];

export default function DocumentosScreen() {
  return (
    <>
      <ViewTitle
        strong="Documentos"
        sub="Todo formalizado: cada etapa se respalda en contratos claros, sin letra chica."
      />

      <Card x={0} y={95.61} w={1604} h={437.28} delay={0.06}>
        {DOCS.map((d, i) => (
          <DocRow key={d.name} {...d} w={1558} first={i === 0} delay={0.05 + i * 0.05} />
        ))}
      </Card>
    </>
  );
}
