"use client";

import BeforeAfter from "@/components/panel/BeforeAfter";
import { Card, Eyebrow, Photo, ViewTitle } from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   FOTOS Y AVANCE VISUAL — Figma 492:1829 (vista de 1604 × 1738.52).

   El comparador antes/después a tamaño completo y la galería por fecha en dos
   filas de cuatro.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + área de contenido (1806.52). */
export const FOTOS_H = 1881;

const GALERIA = [
  { x: 0, y: 0, label: "Sala", date: "12 Jun" },
  { x: 394, y: 0, label: "Cocina", date: "10 Jun" },
  { x: 788, y: 0, label: "Baño", date: "08 Jun" },
  { x: 1182, y: 0, label: "Alcoba principal", date: "06 Jun" },
  { x: 0, y: 300, label: "Carpintería", date: "04 Jun" },
  { x: 394, y: 300, label: "Redes", date: "28 May" },
  { x: 788, y: 300, label: "Demolición", date: "18 May" },
  { x: 1182, y: 300, label: "Estado inicial", date: "05 May" },
];

export default function FotosScreen() {
  return (
    <>
      <ViewTitle
        light="Fotos y"
        strong="avance visual"
        sub="Registro fotográfico por etapa y el comparativo antes / después de tu inmueble."
      />

      {/* ── Antes / Después (492:1955) ── */}
      <Card x={0} y={91.61} w={1604} h={963.64} delay={0.06}>
        <Eyebrow x={23} y={32}>Antes / Después</Eyebrow>
        <BeforeAfter x={23} y={64.27} w={1558} h={876.38} />
      </Card>

      {/* ── Galería por fecha (492:1981) ── */}
      <Card x={0} y={1073.25} w={1604} h={665.27} delay={0.06}>
        <Eyebrow x={23} y={28}>Galería por fecha</Eyebrow>
        {GALERIA.map((g, i) => (
          <Photo
            key={g.label}
            x={23 + g.x}
            y={60.27 + g.y}
            w={376}
            h={282.08}
            label={g.label}
            date={g.date}
            delay={0.04 + (i % 4) * 0.06}
          />
        ))}
      </Card>
    </>
  );
}
