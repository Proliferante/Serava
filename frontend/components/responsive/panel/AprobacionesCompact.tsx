"use client";

import { Ico } from "@/components/panel/icons";
import { DRIFT, INK, LINE, MUTED, VERD } from "@/components/panel/ui";
import { PBtn, PCard, PIn, PTag } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   APROBACIONES — vista fluida.

   El escritorio son dos columnas: pendientes a la izquierda, historial a la
   derecha. Apiladas, primero lo que espera decisión —que es el motivo de
   entrar— y después el historial.

   Es la única vista sin el `h1` de las demás: sus dos títulos van en
   mayúsculas y tabaco, y así se mantienen.
   ═══════════════════════════════════════════════════════════════════════════ */

type Impacto = { label: string; value: string };

const PENDIENTES: {
  title: string; meta: string; body: string;
  impacto: Impacto[]; acciones: string[];
}[] = [
  {
    title: "Cambio en diseño de cocina",
    meta: "Enviado por Juan P. · Ayer, 16:15 · dentro del alcance",
    body: "Propuesta de reubicar la isla para ganar circulación y mejorar el aprovechamiento de la luz natural. No afecta el presupuesto cerrado ni el cronograma.",
    impacto: [
      { label: "Impacto en costo", value: "$0" },
      { label: "Impacto en cronograma", value: "Sin cambio" },
      { label: "Interventoría", value: "Revisado" },
    ],
    acciones: ["Ver detalle y planos", "Pedir ajuste"],
  },
  {
    title: "Sustitución de acabado en baño principal",
    meta: "Enviado por Interventoría · 11 jun · hallazgo técnico",
    body: "Durante la evaluación se identificó humedad en un muro. Se propone impermeabilización adicional y cambio de enchape. El costo se cubre dentro del presupuesto cerrado.",
    impacto: [
      { label: "Impacto en costo", value: "$0 (a cargo Zequara)" },
      { label: "Impacto en cronograma", value: "+2 días" },
      { label: "Interventoría", value: "Recomendado" },
    ],
    acciones: ["Ver detalle"],
  },
];

const HISTORIAL = [
  { title: "Selección de carpintería en roble", time: "02 jun" },
  { title: "Paleta de acabados y pisos", time: "24 may" },
];

/** Título de columna: mayúsculas en tabaco, el encabezado propio de la vista. */
function ColTitle({ children }: { children: string }) {
  return (
    <p className="m-0 uppercase" style={{ fontSize: 18, lineHeight: "26px", fontWeight: 600, letterSpacing: "1.2px", color: DRIFT }}>
      {children}
    </p>
  );
}

export default function AprobacionesCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      {/* ── Pendientes ── */}
      <div>
        <ColTitle>Aprobaciones pendientes</ColTitle>
        <p className="m-0 mt-[8px] text-[14.5px] font-light leading-[1.5]" style={{ color: MUTED }}>
          El trabajo es nuestro; la última palabra es tuya. Nada se ejecuta sin tu visto bueno.
        </p>
      </div>

      {PENDIENTES.map((p, i) => (
        <PCard key={p.title} delay={0.05 + i * 0.07}>
          <div className="flex items-start justify-between gap-[10px]">
            <span className="min-w-0">
              <span className="block text-[16.5px] font-semibold leading-[1.35]" style={{ color: INK }}>{p.title}</span>
              <span className="mt-[4px] block text-[12.5px] font-light leading-[1.5]" style={{ color: MUTED }}>{p.meta}</span>
            </span>
            <PTag label="Pendiente" tone="gold" />
          </div>

          <p className="m-0 mt-[12px] text-[14px] font-light leading-[1.55]" style={{ color: MUTED }}>{p.body}</p>

          <dl className="m-0 mt-[14px] grid grid-cols-1 gap-[10px] border-t border-solid pt-[14px] sm:grid-cols-3" style={{ borderColor: LINE }}>
            {p.impacto.map((im) => (
              <div key={im.label}>
                <dt className="m-0 uppercase" style={{ fontSize: 10.5, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.8px", color: DRIFT }}>{im.label}</dt>
                <dd className="m-0 mt-[2px] text-[15px] font-semibold leading-[1.35]" style={{ color: INK }}>{im.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-[16px] flex flex-col gap-[9px]">
            <PBtn label="Aprobar" icon="check" tone="primary" />
            {p.acciones.map((a) => <PBtn key={a} label={a} tone="outline" />)}
          </div>
        </PCard>
      ))}

      {/* ── Historial ── */}
      <div className="mt-[6px]">
        <ColTitle>Historial de decisiones</ColTitle>
      </div>
      <PCard delay={0.1}>
        {HISTORIAL.map((d, i) => (
          <PIn
            key={d.title} delay={0.12 + i * 0.06} y={10}
            className="pnl-row flex items-start gap-[12px] py-[13px]"
            style={i === 0 ? undefined : { borderTop: `1px solid ${LINE}` }}
          >
            <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(95,107,62,0.12)", color: VERD }}>
              <Ico name="check" size={13} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold leading-[1.4]" style={{ color: INK }}>{d.title}</span>
              <span className="mt-[2px] block text-[12.5px] font-light" style={{ color: MUTED }}>Aprobado por ti</span>
            </span>
            <span className="shrink-0 text-[11.5px]" style={{ color: MUTED }}>{d.time}</span>
          </PIn>
        ))}
      </PCard>
    </div>
  );
}
