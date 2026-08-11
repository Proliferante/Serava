"use client";

import { Ico } from "@/components/panel/icons";
import { INK, LINE, MUTED } from "@/components/panel/ui";
import { PBtn, PCard, PEyebrow, PIn, PNote, PTag, PTitle } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   MI GESTOR — vista fluida.

   La ficha del interlocutor único, la próxima reunión y el hilo de mensajes.
   Los botones siguen pintados: escribir, agendar y añadir al calendario piden
   backend, que todavía no existe.
   ═══════════════════════════════════════════════════════════════════════════ */

const MENSAJES = [
  { from: "JP", body: "Pablo, subí las fotos de la cocina de hoy. La instalación de la isla quedó lista, quedamos atentos a tu aprobación del cambio de diseño.", time: "Hoy, 9:10" },
  { from: "NR", body: "Perfecto, Juan. Reviso hoy mismo y te confirmo.", time: "Hoy, 9:24" },
  { from: "JP", body: "La interventoría aprobó las redes eléctricas sin observaciones. Informe cargado en Documentos.", time: "08 jun" },
];

export default function GestorCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Mi" strong="gestor"
        sub="Un solo equipo conecta análisis, diseño, obra y operación. Un único interlocutor para todo."
      />

      {/* ── Ficha del gestor ── */}
      <PCard delay={0.04}>
        <div className="flex items-center gap-[14px]">
          <span className="flex size-[64px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(165,122,78,0.16)", color: "#7a5c3c" }}>
            <Ico name="user" size={24} />
          </span>
          <span className="min-w-0">
            <span className="block text-[19px] font-semibold leading-[1.35]" style={{ color: INK, letterSpacing: "-0.2px" }}>Juan P. Restrepo</span>
            <PNote className="mt-[2px]" size={13.5}>Gestor de proyecto · Zequara</PNote>
            <span className="mt-[8px] block"><PTag label="Tu único interlocutor" tone="green" /></span>
          </span>
        </div>
        <div className="mt-[16px] flex flex-col gap-[9px] sm:flex-row">
          <PBtn label="Escribir mensaje" icon="message" tone="primary" />
          <PBtn label="Agendar llamada" icon="phone" tone="outline" />
        </div>
      </PCard>

      {/* ── Próxima reunión ── */}
      <PCard delay={0.08}>
        <PEyebrow>Próxima reunión de seguimiento</PEyebrow>
        <p className="m-0 mt-[8px] text-[19px] font-semibold leading-[1.35]" style={{ color: INK, letterSpacing: "-0.2px" }}>
          Jueves 19 jun · 10:00 a.m.
        </p>
        <PNote className="mt-[6px]" size={14}>
          Videollamada · revisión de avance de acabados y aprobación de cambios pendientes.
        </PNote>
        <div className="mt-[14px]"><PBtn label="Añadir a mi calendario" icon="calendar" tone="outline" /></div>
      </PCard>

      {/* ── Mensajes recientes ── */}
      <PCard delay={0.04}>
        <PEyebrow>Mensajes recientes</PEyebrow>
        <div className="mt-[6px]">
          {MENSAJES.map((m, i) => (
            <PIn
              key={m.time} delay={0.08 + i * 0.05} y={10}
              className="pnl-row flex items-start gap-[12px] py-[13px]"
              style={i === 0 ? undefined : { borderTop: `1px solid ${LINE}` }}
            >
              <span
                className="flex size-[34px] shrink-0 items-center justify-center rounded-full"
                style={{ background: "rgba(165,122,78,0.14)", color: "#7a5c3c", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px" }}
              >
                {m.from}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] leading-[1.55]" style={{ color: INK }}>{m.body}</span>
                <span className="mt-[4px] block text-[11.5px] font-light" style={{ color: MUTED }}>{m.time}</span>
              </span>
            </PIn>
          ))}
        </div>
      </PCard>
    </div>
  );
}
