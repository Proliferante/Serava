"use client";

import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import { INK, MUTED, OLIVE, VERD } from "@/components/panel/ui";
import {
  PBar, PCard, PEyebrow, PIn, PStat, PTabla, PTag, PTitle,
} from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   PRESUPUESTO — vista fluida.

   Los tres totales, la ejecución partida por partida y los hitos de pago.

   La tabla de hitos pasa a fichas: tres columnas a 390 px no se leen ni con
   desplazamiento horizontal, y el estado es lo primero que se busca.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Verde de las barras de partida: más claro que el de los anillos. */
const PARTIDA_FILL = `linear-gradient(90deg, #93a165 0%, ${OLIVE} 100%)`;

const PARTIDAS: { label: string; pct: number }[] = [
  { label: "Obra gris y adecuaciones", pct: 100 },
  { label: "Hidrosanitario", pct: 100 },
  { label: "Eléctrico e iluminación", pct: 95 },
  { label: "Carpintería y cocina", pct: 80 },
  { label: "Acabados", pct: 55 },
  { label: "Interventoría independiente", pct: 75 },
];

const HITOS: { hito: string; monto: string; estado: string; tone: "green" | "gold" }[] = [
  { hito: "Anticipo", monto: "$405M", estado: "Pagado", tone: "green" },
  { hito: "Hito 1 · Redes", monto: "$405M", estado: "Pagado", tone: "green" },
  { hito: "Hito 2 · Carpintería", monto: "$405M", estado: "Pagado", tone: "green" },
  { hito: "Hito final · Entrega", monto: "$135M", estado: "Al entregar", tone: "gold" },
];

export default function PresupuestoCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Presupuesto" strong="cerrado"
        sub="El presupuesto se cierra antes de empezar. Aquí ves su ejecución, partida por partida."
      />

      {/* ── Totales ── */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        <PStat delay={0.04} label="Presupuesto cerrado" note="Compra + remodelación"
          value={<CountUp value={1.35} prefix="$" decimals={3} suffix="M" />} />
        <PStat delay={0.08} label="Ejecutado" note="92% del total"
          value={<CountUp value={1.24} prefix="$" decimals={3} suffix="M" />} />
        <PStat delay={0.12} label="Sobrecosto a tu cargo" note="El sobrecosto no estructural lo asume Zequara" green
          value="$0" />
      </div>

      {/* ── Ejecución por partida ── */}
      <PCard delay={0.04}>
        <PEyebrow>Ejecución por partida</PEyebrow>
        <div className="mt-[14px] flex flex-col gap-[15px]">
          {PARTIDAS.map((p, i) => (
            <div key={p.label}>
              <div className="flex items-baseline justify-between gap-[10px]">
                <span className="text-[14px]" style={{ color: INK }}>{p.label}</span>
                <span className="shrink-0 text-[14px] font-semibold" style={{ color: VERD }}>{p.pct}%</span>
              </div>
              <div className="mt-[7px]"><PBar pct={p.pct} h={11} fill={PARTIDA_FILL} delay={0.1 + i * 0.06} /></div>
            </div>
          ))}
        </div>
      </PCard>

      {/* ── Hitos de pago ── */}
      <PCard delay={0.08}>
        <PEyebrow>Hitos de pago</PEyebrow>
        <div className="mt-[14px]">
          <PTabla
            filas={HITOS.map((h) => ({
              titulo: h.hito,
              derecha: <PTag label={h.estado} tone={h.tone} />,
              datos: [["Monto", h.monto]],
            }))}
          />
        </div>

        {/* Nota de garantía */}
        <PIn delay={0.2} y={10} className="mt-[14px] flex items-start gap-[11px] p-[14px]" style={{ borderRadius: 10, background: "rgba(95,107,62,0.07)", border: "1px solid rgba(95,107,62,0.14)" }}>
          <span className="shrink-0" style={{ color: VERD }}><Ico name="approvals" size={18} /></span>
          <p className="m-0 text-[13px] font-light leading-[1.55]" style={{ color: MUTED }}>
            Cada hito se libera solo tras verificación de avance. Ninguna modificación se ejecuta sin cotización y tu aprobación previa.
          </p>
        </PIn>
      </PCard>
    </div>
  );
}
