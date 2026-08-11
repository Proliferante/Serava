"use client";

import CountUp from "@/components/motion/CountUp";
import { TUSCANY } from "@/components/panel/ui";
import {
  PCard, PCardHead, PCheckRow, PSecLink, PStat, PTitle,
} from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   INTERVENTORÍA — vista fluida.

   Los tres conteos y el registro completo. La observación abierta se marca en
   tuscany y apunta a Aprobaciones, igual que en el escritorio.
   ═══════════════════════════════════════════════════════════════════════════ */

const INSPECCIONES: { title: string; sub: string; badge: string; obs?: boolean }[] = [
  { title: "Acabados · fase 1", sub: "Verificación de pisos y enchapes", badge: "Aprobada · hoy" },
  { title: "Redes eléctricas", sub: "Puntos, tablero y protecciones", badge: "Aprobada · 08 jun" },
  { title: "Impermeabilización baño principal", sub: "Humedad detectada · pendiente de aprobación (ver Aprobaciones)", badge: "Observación", obs: true },
  { title: "Redes hidrosanitarias", sub: "Presión y desagües", badge: "Aprobada · 30 may" },
];

export default function InterventoriaCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Interventoría e" strong="inspecciones"
        sub="Control real, no juez y parte: la interventoría es un equipo independiente del que ejecuta la obra."
      />

      {/* ── Conteos ── */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
        <PStat delay={0.04} weight={300} label="Inspecciones realizadas" note="a lo largo de la obra" value={<CountUp value={15} />} />
        <PStat delay={0.08} weight={300} label="Aprobadas" note="sin observaciones" value={<CountUp value={14} />} />
        <PStat delay={0.12} weight={300} label="Con observación" note="menor · en gestión" value={<CountUp value={1} />} />
      </div>

      {/* ── Registro de inspecciones ── */}
      <PCard delay={0.04}>
        <PCardHead label="Registro de inspecciones" right={<PSecLink label="Descargar informe" href="/panel/documentos" />} />
        <div className="mt-[6px]">
          {INSPECCIONES.map((insp, i) => (
            <PCheckRow
              key={insp.title}
              title={insp.title} sub={insp.sub}
              badge={insp.badge} badgeColor={insp.obs ? TUSCANY : undefined}
              tone={insp.obs ? "warn" : "ok"}
              first={i === 0}
              delay={0.06 + i * 0.05}
            />
          ))}
        </div>
      </PCard>
    </div>
  );
}
