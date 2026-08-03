"use client";

import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import {
  Card, Eyebrow, In, INK, MUTED, SecLink, Sep, StatCard, TUSCANY, VERD, ViewTitle,
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

/** Fila del registro: marca de estado, descripción y veredicto a la derecha. */
function Inspeccion({ insp, i }: { insp: (typeof INSPECCIONES)[number]; i: number }) {
  const tone = insp.obs
    ? { bg: "rgba(201,168,119,0.22)", fg: "#8a6a3c", icon: "alert" as const, badge: TUSCANY }
    : { bg: "rgba(95,107,62,0.12)", fg: VERD, icon: "check" as const, badge: VERD };
  return (
    <>
      {i > 0 && <Sep x={23} y={insp.y} w={1558} />}
      <In x={23} y={insp.y} w={1558} h={insp.h} delay={0.06 + i * 0.06} dy={10} className="pnl-row" style={{ borderRadius: 8 }}>
        <span className="absolute flex items-center justify-center" style={{ left: 0, top: 20, width: 30, height: 30, borderRadius: 999, background: tone.bg, color: tone.fg }}>
          <Ico name={tone.icon} size={16} />
        </span>
        <p className="absolute m-0" style={{ left: 44, top: 15, fontSize: 15, lineHeight: "22px", fontWeight: 600, color: INK }}>{insp.title}</p>
        <p className="absolute m-0" style={{ left: 44, top: 36, fontSize: 12.5, lineHeight: "19px", fontWeight: 300, color: MUTED }}>{insp.sub}</p>
        <p className="absolute m-0 text-right" style={{ right: 0, top: 25.85, fontSize: 12, lineHeight: "17px", fontWeight: 600, color: tone.badge }}>{insp.badge}</p>
      </In>
    </>
  );
}

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
        {INSPECCIONES.map((insp, i) => <Inspeccion key={insp.title} insp={insp} i={i} />)}
      </Card>
    </>
  );
}
