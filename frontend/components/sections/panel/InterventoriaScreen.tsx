"use client";

import CountUp from "@/components/motion/CountUp";
import {
  Card, CheckRow, Eyebrow, SecLink, StatCard, TUSCANY, ViewTitle,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERVENTORÍA — Figma 472:3438 (vista de 1604 × 620.89).

   Los tres conteos de inspección y el registro completo. La observación
   abierta se marca en tuscany y apunta a Aprobaciones, que es donde el
   inversionista la resuelve.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + área de contenido (1122.85). */
export const INTERVENTORIA_H = 1200;

const INSPECCIONES: { y: number; h: number; title: string; sub: string; badge: string; obs?: boolean }[] = [
  { y: 60.27, h: 71, title: "Acabados · fase 1", sub: "Verificación de pisos y enchapes", badge: "Aprobada · hoy" },
  { y: 131.27, h: 71, title: "Redes eléctricas", sub: "Puntos, tablero y protecciones", badge: "Aprobada · 08 jun" },
  { y: 202.27, h: 71, title: "Impermeabilización baño principal", sub: "Humedad detectada · pendiente de aprobación (ver Aprobaciones)", badge: "Observación", obs: true },
  { y: 273.27, h: 70, title: "Redes hidrosanitarias", sub: "Presión y desagües", badge: "Aprobada · 30 may" },
];

export default function InterventoriaScreen() {
  return (
    <>
      <ViewTitle
        light="Interventoría e"
        strong="inspecciones"
        sub="Control real, no juez y parte: la interventoría es un equipo independiente del que ejecuta la obra."
      />

      {/* ── Conteos (472:3562) ── */}
      <StatCard x={0} w={522.66} label="Inspecciones realizadas" note="a lo largo de la obra" weight={300} delay={0.06}
        value={<CountUp value={15} />} />
      <StatCard x={540.66} w={522.67} label="Aprobadas" note="sin observaciones" weight={300} delay={0.12}
        value={<CountUp value={14} />} />
      <StatCard x={1081.33} w={522.67} label="Con observación" note="menor · en gestión" weight={300} delay={0.18}
        value={<CountUp value={1} />} />

      {/* ── Registro de inspecciones (472:3584) ── */}
      <Card x={0} y={254.61} w={1604} h={366.28} delay={0.06}>
        <Eyebrow x={23} y={28.27}>Registro de inspecciones</Eyebrow>
        <SecLink right={23} y={28} label="Descargar último informe" href="/panel/documentos" />
        {INSPECCIONES.map((insp, i) => (
          <CheckRow
            key={insp.title}
            y={insp.y} h={insp.h} w={1558}
            title={insp.title} sub={insp.sub}
            badge={insp.badge} badgeColor={insp.obs ? TUSCANY : undefined}
            tone={insp.obs ? "warn" : "ok"}
            first={i === 0}
            delay={0.06 + i * 0.06}
          />
        ))}
      </Card>
    </>
  );
}
