"use client";

import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import { DRIFT, INK, LINE, LINEN, MUTED, VERD } from "@/components/panel/ui";
import { PBar, PCard, PEyebrow, PIn, PNote, PTitle } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   AVANCE DE OBRA — vista fluida.

   Cumplimiento del cronograma, próxima actividad, las seis etapas con su
   estado y las notas por etapa. Todo igual que el lienzo; las etapas mantienen
   la línea que las cose porque es lo que se lee como progreso.
   ═══════════════════════════════════════════════════════════════════════════ */

type Estado = "done" | "current" | "pending";

const ETAPAS: { title: string; sub: string; pct: string; state: Estado }[] = [
  { title: "Preliminares y permisos", sub: "Semana 1 · alcance, contratos y arranque", pct: "100%", state: "done" },
  { title: "Demolición y adecuaciones", sub: "Semanas 2–3", pct: "100%", state: "done" },
  { title: "Redes hidrosanitarias y eléctricas", sub: "Semanas 4–6", pct: "100%", state: "done" },
  { title: "Carpintería y cocina", sub: "Semanas 7–9 · en ejecución", pct: "70%", state: "current" },
  { title: "Acabados e iluminación", sub: "Semanas 10–11", pct: "—", state: "pending" },
  { title: "Entrega y verificación final", sub: "Semana 12", pct: "—", state: "pending" },
];

const NOTAS: { title: string; week: string }[] = [
  { title: "Preliminares y permisos", week: "Semana 1" },
  { title: "Demolición y adecuaciones", week: "Semanas 2–3" },
  { title: "Redes hidrosanitarias y eléctricas", week: "Semanas 4–6" },
  { title: "Carpintería y cocina", week: "Semanas 7–9" },
  { title: "Acabados e iluminación", week: "Semanas 10–11" },
  { title: "Entrega y verificación final", week: "Semana 12" },
];

/** Marca de estado de una etapa: hecha, en curso o pendiente. */
function Punto({ state }: { state: Estado }) {
  if (state === "done") {
    return (
      <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full" style={{ background: "#6f7d4a", color: LINEN }}>
        <Ico name="check" size={12} sw={2.6} />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full" style={{ background: "#9a6b34" }}>
        <span className="ix-live block size-[8px] rounded-full" style={{ background: LINEN }} />
      </span>
    );
  }
  return <span className="block size-[24px] shrink-0 rounded-full" style={{ border: `1.5px solid ${LINE}` }} />;
}

export default function AvanceCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Avance de" strong="obra"
        sub="Semana 9 de 12 · el cronograma se cierra antes de empezar; aquí sigues su cumplimiento."
      />

      {/* ── Progreso del cronograma ── */}
      <PCard delay={0.04}>
        <PEyebrow>Progreso del cronograma</PEyebrow>
        <p className="m-0 mt-[6px] text-[clamp(1.9rem,9vw,2.4rem)] leading-[1.15]" style={{ fontWeight: 300, color: INK, letterSpacing: "-0.8px" }}>
          <CountUp value={78} suffix="%" />
        </p>
        <div className="mt-[14px]"><PBar pct={78} delay={0.2} /></div>
        <PNote className="mt-[10px]" size={13.5}>Cumplimiento de tiempos comprometidos: en línea</PNote>
      </PCard>

      {/* ── Próxima actividad ── */}
      <PCard delay={0.08}>
        <PEyebrow>Próxima actividad</PEyebrow>
        <p className="m-0 mt-[6px] text-[19px] font-semibold leading-[1.35]" style={{ color: INK, letterSpacing: "-0.3px" }}>
          Instalación de acabados
        </p>
        <PNote className="mt-[6px]" size={14}>Inicia semana 10 · pisos, carpintería e iluminación</PNote>
      </PCard>

      {/* ── Etapas de la obra ── */}
      <PCard delay={0.04}>
        <PEyebrow>Etapas de la obra</PEyebrow>
        <div className="mt-[14px]">
          {ETAPAS.map((e, i) => (
            <PIn key={e.title} delay={0.05 + i * 0.05} y={10} className="relative flex gap-[14px] pb-[18px] last:pb-0">
              {/* La línea que cose una etapa con la siguiente. */}
              {i < ETAPAS.length - 1 && (
                <span className="absolute left-[11px] top-[26px] w-[2px] rounded-full" style={{ bottom: 0, background: LINE }} />
              )}
              <Punto state={e.state} />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-[10px]">
                  <span className="text-[15px] font-semibold leading-[1.35]" style={{ color: e.state === "pending" ? MUTED : INK }}>{e.title}</span>
                  <span className="shrink-0 text-[14px] font-semibold" style={{ color: e.state === "pending" ? "rgba(91,67,50,0.45)" : VERD }}>{e.pct}</span>
                </span>
                <span className="mt-[3px] block text-[12.5px] font-light leading-[1.5]" style={{ color: MUTED }}>{e.sub}</span>
              </span>
            </PIn>
          ))}
        </div>
      </PCard>

      {/* ── Notas por etapa ── */}
      <PCard delay={0.04}>
        <p className="m-0 uppercase" style={{ fontSize: 13, lineHeight: "20px", fontWeight: 600, letterSpacing: "1.2px", color: DRIFT }}>
          Notas por etapa
        </p>
        <div className="mt-[12px] flex flex-col gap-[10px]">
          {NOTAS.map((n, i) => (
            <PIn key={n.title} delay={0.04 + i * 0.04} y={10} className="p-[14px]" style={{ borderRadius: 12, background: "#fbf8f1", border: `1px solid ${LINE}` }}>
              <div className="flex items-baseline justify-between gap-[10px]">
                <p className="m-0 text-[15.5px] font-semibold leading-[1.35]" style={{ color: INK }}>{n.title}</p>
                <p className="m-0 shrink-0 text-[12px] font-light" style={{ color: MUTED }}>{n.week}</p>
              </div>
              <label className="mt-[10px] block">
                <span className="sr-only">Nota para {n.title}</span>
                <input
                  type="text"
                  placeholder="Agregar nota..."
                  className="pnl-input h-[44px] w-full"
                  style={{ padding: "0 13px", borderRadius: 8, background: "#fffdfa", border: `1px solid ${LINE}`, fontSize: 13.5, color: INK }}
                />
              </label>
              <button
                type="button"
                className="pnl-btn pnl-btn-solid mt-[10px] inline-flex h-[36px] items-center justify-center gap-[6px] px-[14px]"
                style={{ borderRadius: 8, background: "#8a6a3c", color: LINEN, border: 0, fontSize: 12.5, fontWeight: 600 }}
              >
                <Ico name="plus" size={12} sw={2.4} />
                <span>Agregar nota</span>
              </button>
            </PIn>
          ))}
        </div>
      </PCard>
    </div>
  );
}
