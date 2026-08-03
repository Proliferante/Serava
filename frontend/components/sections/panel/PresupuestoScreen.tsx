"use client";

import type { CSSProperties } from "react";
import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import {
  Bar, Card, Eyebrow, In, INK, LINE, MUTED, OLIVE, StatCard, Tag, VERD, ViewTitle,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   PRESUPUESTO — Figma 472:2519 (vista de 1604 × 651.06).

   Los tres totales arriba (cerrado, ejecutado y sobrecosto, esta última en
   verde sólido), la ejecución partida por partida y la tabla de hitos de pago.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + área de contenido (1124.08). */
export const PRESUPUESTO_H = 1200;

/** Verde de las barras de partida: más claro que el de los anillos. */
const PARTIDA_FILL = `linear-gradient(90deg, #93a165 0%, ${OLIVE} 100%)`;

/** `pad` reproduce los 2 px que la primera fila tiene de menos en Figma. */
const PARTIDAS: { y: number; pad: number; label: string; pct: number }[] = [
  { y: 60.27, pad: 0, label: "Obra gris y adecuaciones", pct: 100 },
  { y: 112.66, pad: 2, label: "Hidrosanitario", pct: 100 },
  { y: 167.05, pad: 2, label: "Eléctrico e iluminación", pct: 95 },
  { y: 221.44, pad: 2, label: "Carpintería y cocina", pct: 80 },
  { y: 275.83, pad: 2, label: "Acabados", pct: 55 },
  { y: 330.22, pad: 2, label: "Interventoría independiente", pct: 75 },
];

const HITOS: { hito: string; monto: string; estado: string; tone: "green" | "gold" }[] = [
  { hito: "Anticipo", monto: "$405M", estado: "Pagado", tone: "green" },
  { hito: "Hito 1 · Redes", monto: "$405M", estado: "Pagado", tone: "green" },
  { hito: "Hito 2 · Carpintería", monto: "$405M", estado: "Pagado", tone: "green" },
  { hito: "Hito final · Entrega", monto: "$135M", estado: "Al entregar", tone: "gold" },
];

const TH: CSSProperties = {
  padding: "0 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.9px",
  color: MUTED, textTransform: "uppercase", borderBottom: `1px solid ${LINE}`,
};
const TD: CSSProperties = { padding: "0 10px", fontSize: 14, borderBottom: `1px solid ${LINE}` };

/** Fila de partida: etiqueta, porcentaje y barra de 11 px. */
function Partida({ y, pad, label, pct, i }: (typeof PARTIDAS)[number] & { i: number }) {
  return (
    <>
      <p className="absolute m-0" style={{ left: 23, top: y + pad - 1, fontSize: 14, lineHeight: "21px", fontWeight: 400, color: INK }}>{label}</p>
      <p className="absolute m-0 text-right" style={{ right: 23, top: y + pad - 1, fontSize: 14, lineHeight: "21px", fontWeight: 600, color: VERD }}>{pct}%</p>
      <Bar x={23} y={y + pad + 27.39} w={747} pct={pct} h={11} fill={PARTIDA_FILL} delay={0.1 + i * 0.07} />
    </>
  );
}

export default function PresupuestoScreen() {
  return (
    <>
      <ViewTitle
        light="Presupuesto"
        strong="cerrado"
        sub="El presupuesto se cierra antes de empezar. Aquí ves su ejecución, partida por partida."
      />

      {/* ── Totales (472:2643) ── */}
      <StatCard x={0} w={522.66} label="Presupuesto cerrado" note="Compra + remodelación" delay={0.06}
        value={<CountUp value={1.35} prefix="$" decimals={3} suffix="M" />} />
      <StatCard x={540.66} w={522.67} label="Ejecutado" note="92% del total" delay={0.12}
        value={<CountUp value={1.24} prefix="$" decimals={3} suffix="M" />} />
      <StatCard x={1081.33} w={522.67} label="Sobrecosto a tu cargo" note="El sobrecosto no estructural lo asume Serava" delay={0.18} green
        value="$0" />

      {/* ── Ejecución por partida (472:2671) ── */}
      <Card x={0} y={254.61} w={793} h={396.45} delay={0.06}>
        <Eyebrow x={23} y={29}>Ejecución por partida</Eyebrow>
        {PARTIDAS.map((p, i) => <Partida key={p.label} {...p} i={i} />)}
      </Card>

      {/* ── Hitos de pago (472:2729) ── */}
      <Card x={811} y={254.61} w={793} h={396.45} delay={0.12}>
        <Eyebrow x={23} y={29}>Hitos de pago</Eyebrow>
        <table
          className="absolute"
          style={{ left: 23, top: 60.27, width: 747, borderCollapse: "collapse", tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: 347.48 }} />
            <col style={{ width: 157.72 }} />
            <col style={{ width: 241.8 }} />
          </colgroup>
          <thead>
            <tr style={{ height: 40.34 }}>
              <th style={{ ...TH, textAlign: "left" }}>Hito</th>
              <th style={{ ...TH, textAlign: "right" }}>Monto</th>
              <th style={{ ...TH, textAlign: "right" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {HITOS.map((h) => (
              <tr key={h.hito} className="pnl-row" style={{ height: 45.39 }}>
                <td style={{ ...TD, color: INK }}>{h.hito}</td>
                <td style={{ ...TD, textAlign: "right", color: INK, fontWeight: 500 }}>{h.monto}</td>
                <td style={{ ...TD, textAlign: "right" }}><Tag label={h.estado} tone={h.tone} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Nota de garantía (472:2778) */}
        <In x={23} y={296.68} w={747} h={76.77} delay={0.2} dy={10}>
          <div className="absolute inset-0" style={{ borderRadius: 10, background: "rgba(95,107,62,0.07)", border: "1px solid rgba(95,107,62,0.14)" }} />
          <span className="absolute" style={{ left: 18, top: 20.99, color: VERD }}>
            <Ico name="approvals" size={18} />
          </span>
          <p className="absolute m-0" style={{ left: 47, top: 19.19, width: 682, fontSize: 13, lineHeight: "20.4px", fontWeight: 300, color: MUTED }}>
            Cada hito se libera solo tras verificación de avance. Ninguna modificación se ejecuta sin cotización y tu aprobación previa.
          </p>
        </In>
      </Card>
    </>
  );
}
