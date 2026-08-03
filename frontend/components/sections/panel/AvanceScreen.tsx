"use client";

import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import {
  Bar, Card, DRIFT, Eyebrow, In, INK, LINE, LINEN, MUTED, Note, VERD, ViewTitle,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   AVANCE DE OBRA — Figma 472:2091 (vista de 1604 × 2045.2).

   Cumplimiento del cronograma, próxima actividad, las seis etapas con su
   estado y un bloque de notas por etapa.

   Las notas son el formulario del diseño: la caja de texto y el botón están
   pintados, pero no hay endpoint todavía, así que no persisten.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (75) + área de contenido (2094). */
export const AVANCE_H = 2169;

type StepState = "done" | "current" | "pending";

const STEPS: { title: string; sub: string; pct: string; state: StepState }[] = [
  { title: "Preliminares y permisos", sub: "Semana 1 · alcance, contratos y arranque", pct: "100%", state: "done" },
  { title: "Demolición y adecuaciones", sub: "Semanas 2–3", pct: "100%", state: "done" },
  { title: "Redes hidrosanitarias y eléctricas", sub: "Semanas 4–6", pct: "100%", state: "done" },
  { title: "Carpintería y cocina", sub: "Semanas 7–9 · en ejecución", pct: "70%", state: "current" },
  { title: "Acabados e iluminación", sub: "Semanas 10–11", pct: "—", state: "pending" },
  { title: "Entrega y verificación final", sub: "Semana 12", pct: "—", state: "pending" },
];

const NOTAS: { y: number; title: string; week: string }[] = [
  { y: 77, title: "Preliminares y permisos", week: "Semana 1" },
  { y: 264, title: "Demolición y adecuaciones", week: "Semanas 2–3" },
  { y: 454, title: "Redes hidrosanitarias y eléctricas", week: "Semanas 4–6" },
  { y: 647, title: "Carpintería y cocina", week: "Semanas 7–9" },
  { y: 832, title: "Acabados e iluminación", week: "Semanas 10–11" },
  { y: 1018, title: "Entrega y verificación final", week: "Semana 12" },
];

/** Marca de estado de una etapa: hecha, en curso o pendiente. */
function StepDot({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="absolute flex items-center justify-center" style={{ left: 0, top: 25.36, width: 24, height: 24, borderRadius: 999, background: "#6f7d4a", color: LINEN }}>
        <Ico name="check" size={12} sw={2.6} />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="absolute flex items-center justify-center" style={{ left: 0, top: 25.36, width: 24, height: 24, borderRadius: 999, background: "#9a6b34" }}>
        <span className="ix-live block" style={{ width: 8, height: 8, borderRadius: 999, background: LINEN }} />
      </span>
    );
  }
  return (
    <span className="absolute" style={{ left: 0, top: 25.36, width: 24, height: 24, borderRadius: 999, border: `1.5px solid ${LINE}` }} />
  );
}

/** Fila de etapa, con la línea que la cose con la siguiente. */
function Step({ step, i, last }: { step: (typeof STEPS)[number]; i: number; last: boolean }) {
  return (
    <In x={31} y={60.27 + i * 74.72} w={1550} h={74.72} delay={0.05 + i * 0.06} dy={10}>
      {!last && <span className="absolute" style={{ left: 11, top: 34, width: 2, height: 56.72, borderRadius: 1, background: LINE }} />}
      <StepDot state={step.state} />
      <p className="absolute m-0" style={{ left: 40, top: 16, fontSize: 16, lineHeight: "24px", fontWeight: 600, color: step.state === "pending" ? MUTED : INK }}>
        {step.title}
      </p>
      <p className="absolute m-0" style={{ left: 40, top: 39, fontSize: 13, lineHeight: "19.72px", fontWeight: 300, color: MUTED }}>
        {step.sub}
      </p>
      <p
        className="absolute m-0 text-right"
        style={{ right: 0, top: 26.54, fontSize: 14.5, lineHeight: "21.64px", fontWeight: 600, color: step.state === "pending" ? "rgba(91,67,50,0.45)" : VERD }}
      >
        {step.pct}
      </p>
    </In>
  );
}

/** Bloque de nota de una etapa: cabecera, caja de texto y botón. */
function NotaRow({ y, title, week, i }: (typeof NOTAS)[number] & { i: number }) {
  return (
    <In x={22} y={y} w={1560} h={166} delay={0.04 + i * 0.05} dy={12}>
      <div className="absolute inset-0" style={{ borderRadius: 12, background: "#fbf8f1", border: `1px solid ${LINE}` }} />
      <p className="absolute m-0" style={{ left: 16, top: 22, fontSize: 17, lineHeight: "27px", fontWeight: 600, color: INK }}>{title}</p>
      <p className="absolute m-0 text-right" style={{ right: 16, top: 27, fontSize: 12, lineHeight: "17px", fontWeight: 300, color: MUTED }}>{week}</p>
      <label className="absolute" style={{ left: 16, top: 64, width: 1528, height: 48 }}>
        <span className="sr-only">Nota para {title}</span>
        <input
          type="text"
          placeholder="Agregar nota..."
          className="pnl-input size-full"
          style={{
            padding: "0 13px", borderRadius: 8, background: "#fffdfa",
            border: `1px solid ${LINE}`, fontSize: 13.5, color: INK,
          }}
        />
      </label>
      <button
        type="button"
        className="pnl-btn pnl-btn-solid absolute inline-flex items-center justify-center"
        style={{ right: 16, top: 120, width: 129, height: 34, gap: 6, borderRadius: 8, background: "#8a6a3c", color: LINEN, border: 0, fontSize: 12.5, fontWeight: 600 }}
      >
        <Ico name="plus" size={12} sw={2.4} />
        <span>Agregar nota</span>
      </button>
    </In>
  );
}

export default function AvanceScreen() {
  return (
    <>
      <ViewTitle
        light="Avance de"
        strong="obra"
        sub="Semana 9 de 12 · el cronograma se cierra antes de empezar; aquí sigues su cumplimiento."
      />

      {/* ── Progreso del cronograma (472:2216) ── */}
      <Card x={0} y={95.61} w={815} h={170} delay={0.06}>
        <Eyebrow x={23} y={23}>Progreso del cronograma</Eyebrow>
        <p className="absolute m-0" style={{ left: 23, top: 50, fontSize: 36, lineHeight: "42px", fontWeight: 300, color: INK, letterSpacing: "-0.8px" }}>
          <CountUp value={78} suffix="%" />
        </p>
        <Bar x={23} y={110} w={769} pct={78} delay={0.25} />
        <Note x={23} y={127} size={13.5}>Cumplimiento de tiempos comprometidos: en línea</Note>
      </Card>

      {/* ── Próxima actividad (472:2228) ── */}
      <Card x={833} y={95.61} w={771} h={169.43} delay={0.12}>
        <Eyebrow x={23} y={22.44}>Próxima actividad</Eyebrow>
        <p className="absolute m-0" style={{ left: 23, top: 47.44, fontSize: 22, lineHeight: "32px", fontWeight: 600, color: INK, letterSpacing: "-0.3px" }}>
          Instalación de acabados
        </p>
        <Note x={23} y={82.44} size={14}>Inicia semana 10 · pisos, carpintería e iluminación</Note>
      </Card>

      {/* ── Etapas de la obra (472:2241) ── */}
      <Card x={0} y={283.61} w={1604} h={531.59} delay={0.06}>
        <Eyebrow x={23} y={29}>Etapas de la obra</Eyebrow>
        {STEPS.map((s, i) => <Step key={s.title} step={s} i={i} last={i === STEPS.length - 1} />)}
      </Card>

      {/* ── Notas por etapa (513:1692) ── */}
      <Card x={0} y={833.2} w={1604} h={1212} delay={0.06}>
        <p
          className="absolute m-0 uppercase"
          style={{ left: 22, top: 28, fontSize: 14, lineHeight: "30px", fontWeight: 600, letterSpacing: "1.2px", color: DRIFT }}
        >
          Notas por etapa
        </p>
        {NOTAS.map((n, i) => <NotaRow key={n.title} {...n} i={i} />)}
      </Card>
    </>
  );
}
