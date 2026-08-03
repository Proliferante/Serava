"use client";

import { Ico } from "@/components/panel/icons";
import {
  Btn, Card, DRIFT, In, INK, MUTED, Pill, Sep, VERD,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   APROBACIONES — Figma 472:3002 (vista de 1604 × 625.01).

   Dos columnas: a la izquierda lo que espera tu decisión, con su impacto en
   costo, cronograma e interventoría y los botones de acción; a la derecha el
   historial de lo ya decidido.

   Es la única vista cuyo encabezado no es el `h1` de las demás: los dos
   títulos de columna van en mayúsculas y tabaco.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: el alto del frame, que aquí manda sobre el del contenido. */
export const APROBACIONES_H = 1110;

type Impacto = { label: string; value: string; x: number };

const PENDIENTES: {
  y: number; h: number; pad: number; title: string; meta: string; body: string;
  impacto: Impacto[]; acciones: { label: string; w: number; x: number }[];
}[] = [
  {
    y: 87.61, h: 265.69, pad: 29,
    title: "Cambio en diseño de cocina",
    meta: "Enviado por Juan P. · Ayer, 16:15 · dentro del alcance",
    body: "Propuesta de reubicar la isla para ganar circulación y mejorar el aprovechamiento de la luz natural. No afecta el presupuesto cerrado ni el cronograma.",
    impacto: [
      { label: "Impacto en costo", value: "$0", x: 0 },
      { label: "Impacto en cronograma", value: "Sin cambio", x: 133 },
      { label: "Interventoría", value: "Revisado", x: 309 },
    ],
    acciones: [
      { label: "Ver detalle y planos", w: 181, x: 131 },
      { label: "Pedir ajuste", w: 125, x: 322 },
    ],
  },
  {
    y: 367.3, h: 248, pad: 21,
    title: "Sustitución de acabado en baño principal",
    meta: "Enviado por Interventoría · 11 jun · hallazgo técnico",
    body: "Durante la evaluación se identificó humedad en un muro. Se propone impermeabilización adicional y cambio de enchape. El costo se cubre dentro del presupuesto cerrado.",
    impacto: [
      { label: "Impacto en costo", value: "$0 (a cargo Serava)", x: 0 },
      { label: "Impacto en cronograma", value: "+2 días", x: 181 },
      { label: "Interventoría", value: "Recomendado", x: 357 },
    ],
    acciones: [{ label: "Ver detalle", w: 118, x: 131 }],
  },
];

const HISTORIAL = [
  { y: 23, title: "Selección de carpintería en roble", time: "02 jun" },
  { y: 91.85, title: "Paleta de acabados y pisos", time: "24 may" },
];

/**
 * Título de columna: mayúsculas en tabaco, el encabezado propio de esta vista.
 * En Figma el de la derecha queda 2 px más alto que el de la izquierda; aquí
 * los dos comparten línea base.
 */
function ColTitle({ x, children }: { x: number; children: string }) {
  return (
    <p
      className="absolute m-0 uppercase"
      style={{ left: x, top: 9, fontSize: 21, lineHeight: "30px", fontWeight: 600, letterSpacing: "1.2px", color: DRIFT }}
    >
      {children}
    </p>
  );
}

/** Tarjeta de una aprobación pendiente. */
function Pendiente({ p, i }: { p: (typeof PENDIENTES)[number]; i: number }) {
  const { pad } = p;
  return (
    <Card x={0} y={p.y} w={790} h={p.h} delay={0.06 + i * 0.08}>
      <p className="absolute m-0" style={{ left: 21, top: pad - 1, fontSize: 17, lineHeight: "25px", fontWeight: 600, color: INK }}>{p.title}</p>
      <p className="absolute m-0" style={{ left: 21, top: pad + 26.47, fontSize: 12.5, lineHeight: "19px", fontWeight: 300, color: MUTED }}>{p.meta}</p>
      <Pill x={685} y={pad} label="Pendiente" tone="gold" size={11} />

      <p className="absolute m-0" style={{ left: 21, top: pad + 54.7, width: 748, fontSize: 14, lineHeight: "21.5px", fontWeight: 300, color: MUTED }}>{p.body}</p>

      {p.impacto.map((im) => (
        <div key={im.label} className="absolute" style={{ left: 21 + im.x, top: pad + 113.7 }}>
          <p className="m-0 uppercase" style={{ fontSize: 10.5, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.8px", color: DRIFT }}>{im.label}</p>
          <p className="m-0" style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600, color: INK, whiteSpace: "nowrap" }}>{im.value}</p>
        </div>
      ))}

      <Btn x={21} y={pad + 169.7} w={121} label="Aprobar" icon="check" tone="primary" />
      {p.acciones.map((a) => (
        <Btn key={a.label} x={21 + a.x} y={pad + 169.7} w={a.w} label={a.label} tone="outline" />
      ))}
    </Card>
  );
}

export default function AprobacionesScreen() {
  return (
    <>
      {/* ── Columna izquierda: pendientes (512:1690) ── */}
      <ColTitle x={0}>Aprobaciones pendientes</ColTitle>
      <p className="absolute m-0" style={{ left: 0, top: 51, width: 790, fontSize: 15.5, lineHeight: "22.6px", fontWeight: 300, color: MUTED }}>
        El trabajo es nuestro; la última palabra es tuya. Nada se ejecuta sin tu visto bueno.
      </p>
      {PENDIENTES.map((p, i) => <Pendiente key={p.title} p={p} i={i} />)}

      {/* ── Columna derecha: historial (512:1691) ── */}
      <ColTitle x={814}>Historial de decisiones</ColTitle>
      <Card x={814} y={85.32} w={790} h={182.69} delay={0.12}>
        {HISTORIAL.map((d, i) => (
          <div key={d.title}>
            {i > 0 && <Sep x={23} y={d.y} w={744} />}
            <In x={23} y={d.y} w={744} h={68.84} delay={0.14 + i * 0.06} dy={10} className="pnl-row" style={{ borderRadius: 8 }}>
              <span className="absolute flex items-center justify-center" style={{ left: 0, top: 14, width: 24, height: 24, borderRadius: 999, background: "rgba(95,107,62,0.12)", color: VERD }}>
                <Ico name="check" size={13} />
              </span>
              <p className="absolute m-0" style={{ left: 37, top: 13, fontSize: 15, lineHeight: "22.61px", fontWeight: 600, color: INK }}>{d.title}</p>
              <p className="absolute m-0" style={{ left: 37, top: 34.61, fontSize: 12.5, lineHeight: "19px", fontWeight: 300, color: MUTED }}>Aprobado por ti</p>
              <p className="absolute m-0 text-right" style={{ right: 0, top: 13, fontSize: 11.5, lineHeight: "18px", fontWeight: 400, color: MUTED }}>{d.time}</p>
            </In>
          </div>
        ))}
      </Card>
    </>
  );
}
