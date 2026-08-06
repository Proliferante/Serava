"use client";

import { Ico } from "@/components/panel/icons";
import {
  Btn, Card, Eyebrow, In, INK, MUTED, Note, Pill, Sep, ViewTitle,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   MI GESTOR — Figma 472:4740 (vista de 1604 × 582.14).

   La ficha del interlocutor único, la próxima reunión y el hilo de mensajes.
   Los botones quedan pintados: escribir, agendar y añadir al calendario piden
   backend, que todavía no existe.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: el alto del frame; el contenido llega a 1185.92. */
export const GESTOR_H = 1200;

const MENSAJES = [
  { y: 60.27, h: 63, from: "JP", body: "Pablo, subí las fotos de la cocina de hoy. La instalación de la isla quedó lista, quedamos atentos a tu aprobación del cambio de diseño.", time: "Hoy, 9:10" },
  { y: 123.27, h: 63, from: "NR", body: "Perfecto, Juan. Reviso hoy mismo y te confirmo.", time: "Hoy, 9:24" },
  { y: 186.27, h: 62, from: "JP", body: "La interventoría aprobó las redes eléctricas sin observaciones. Informe cargado en Documentos.", time: "08 jun" },
];

export default function GestorScreen() {
  return (
    <>
      <ViewTitle
        light="Mi"
        strong="gestor"
        sub="Un solo equipo conecta análisis, diseño, obra y operación. Un único interlocutor para todo."
      />

      {/* ── Ficha del gestor (472:4865) ── */}
      <Card x={0} y={95.61} w={793} h={197.03} delay={0.06}>
        <span
          className="absolute flex items-center justify-center"
          style={{ left: 23, top: 28.4, width: 72, height: 72, borderRadius: 999, background: "rgba(165,122,78,0.16)", color: "#7a5c3c" }}
        >
          <Ico name="user" size={26} />
        </span>
        <p className="absolute m-0" style={{ left: 113, top: 22, fontSize: 20, lineHeight: "29.8px", fontWeight: 600, color: INK, letterSpacing: "-0.2px" }}>
          Juan P. Restrepo
        </p>
        <Note x={113} y={50.8} size={14}>Gestor de proyecto · Zequara</Note>
        <Pill x={113} y={79.96} label="Tu único interlocutor" tone="green" size={11} />

        <Btn x={23} y={123.8} w={179} label="Escribir mensaje" icon="message" tone="primary" />
        <Btn x={214} y={123.8} w={189} label="Agendar llamada" icon="phone" tone="outline" />
      </Card>

      {/* ── Próxima reunión (472:4891) ── */}
      <Card x={811} y={95.61} w={793} h={197.26} delay={0.12}>
        <Eyebrow x={23} y={28}>Próxima reunión de seguimiento</Eyebrow>
        <p className="absolute m-0" style={{ left: 23, top: 60.27, fontSize: 20, lineHeight: "28px", fontWeight: 600, color: INK, letterSpacing: "-0.2px" }}>
          Jueves 19 jun · 10:00 a.m.
        </p>
        <Note x={23} y={91.27} w={747} size={14}>
          Videollamada · revisión de avance de acabados y aprobación de cambios pendientes.
        </Note>
        <Btn x={23} y={128.26} w={226} label="Añadir a mi calendario" icon="calendar" tone="outline" />
      </Card>

      {/* ── Mensajes recientes (472:4903) ── */}
      <Card x={0} y={310.87} w={1604} h={271.27} delay={0.06}>
        <Eyebrow x={23} y={28}>Mensajes recientes</Eyebrow>
        {MENSAJES.map((m, i) => (
          <div key={m.time}>
            {i > 0 && <Sep x={23} y={m.y} w={1558} />}
            <In x={23} y={m.y} w={1558} h={m.h} delay={0.08 + i * 0.06} dy={10} className="pnl-row" style={{ borderRadius: 8 }}>
              <span
                className="absolute flex items-center justify-center"
                style={{ left: 0, top: 14, width: 34, height: 34, borderRadius: 999, background: "rgba(165,122,78,0.14)", color: "#7a5c3c", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px" }}
              >
                {m.from}
              </span>
              <p className="absolute m-0" style={{ left: 46, top: 13, fontSize: 14, lineHeight: "21.64px", fontWeight: 400, color: INK }}>{m.body}</p>
              <p className="absolute m-0" style={{ left: 46, top: 36.64, fontSize: 11.5, lineHeight: "17px", fontWeight: 300, color: MUTED }}>{m.time}</p>
            </In>
          </div>
        ))}
      </Card>
    </>
  );
}
