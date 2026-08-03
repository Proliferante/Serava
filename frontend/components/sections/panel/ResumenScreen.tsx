"use client";

import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import {
  Bar, Big, Card, Eyebrow, IconBox, In, INK, MUTED, Note, PHOTO_BG,
  Photo, SecLink, SeeLink, Sep, Stat, ViewTitle, VERD,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   RESUMEN — Figma 472:1510 / 472:1633 (vista de 1604 × 1238.54).

   Es la portada del panel: avance general, foto del día, galería reciente,
   cuatro indicadores y las dos listas de cierre (actividad y documentos).

   Corrección respecto al diseño: en Figma la caja de icono de "Cronograma"
   está 11 px a la izquierda de la de "Aprobaciones" (su `div.top` arranca en
   x=11.5 en vez de 23). Aquí las dos se alinean al canal de 23 px.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + 34 + vista (1238.54) + 34. */
export const RESUMEN_H = 1382;

const FOTOS = [
  { x: 22.8, label: "Sala", date: "12 Jun" },
  { x: 336.88, label: "Cocina", date: "10 Jun" },
  { x: 650.96, label: "Baño", date: "08 Jun" },
  { x: 965.04, label: "Alcoba", date: "06 Jun" },
  { x: 1279.12, label: "Detalle", date: "04 Jun" },
];

const ACTIVIDAD = [
  { y: 60.27, tone: "ok" as const, title: "Inspección de acabados", sub: "Aprobada por interventoría independiente", time: "Hoy, 8:30" },
  { y: 129.11, tone: "warn" as const, title: "Cambio en diseño de cocina", sub: "Enviado para tu aprobación", time: "Ayer, 16:15" },
  { y: 197.95, tone: "ok" as const, title: "Hito de pago 2 liberado", sub: "Tras verificación de avance", time: "10 jun" },
];

const DOCS = [
  { y: 60.27, name: "Presupuesto cerrado v3.pdf", sub: "Actualizado hoy" },
  { y: 125.65, name: "Cronograma actualizado.xlsx", sub: "Actualizado ayer" },
  { y: 191.03, name: "Planos eléctricos.pdf", sub: "Actualizado hace 3 días" },
];

/** Fila de actividad: rectángulo teñido según el estado del hecho. */
function ActRow({ y, tone, title, sub, time }: (typeof ACTIVIDAD)[number]) {
  const t = tone === "ok"
    ? { bg: "#cbd5b6", chip: "rgba(95,107,62,0.16)", fg: VERD, icon: "check" as const }
    : { bg: "#dcbf94", chip: "rgba(247,241,229,0.45)", fg: "#8a6a3c", icon: "clock" as const };
  return (
    <In x={23} y={y} w={747} h={59} delay={0.05 + y / 900} dy={10}>
      <div className="absolute inset-0" style={{ borderRadius: 10, background: t.bg }} />
      <span
        className="absolute flex items-center justify-center"
        style={{ left: 0, top: 17.5, width: 24, height: 24, borderRadius: 999, background: t.chip, color: t.fg }}
      >
        <Ico name={t.icon} size={14} />
      </span>
      <p className="absolute m-0" style={{ left: 37, top: 9, fontSize: 15, lineHeight: "22.61px", fontWeight: 600, color: INK }}>{title}</p>
      <p className="absolute m-0" style={{ left: 37, top: 31, fontSize: 12.5, lineHeight: "19px", fontWeight: 300, color: MUTED }}>{sub}</p>
      <p className="absolute m-0 text-right" style={{ right: 0, top: 9, fontSize: 11.5, lineHeight: "18px", fontWeight: 400, color: MUTED }}>{time}</p>
    </In>
  );
}

/** Fila de documento con su botón de descarga. */
function DocRow({ y, name, sub, first }: (typeof DOCS)[number] & { first: boolean }) {
  return (
    <>
      {!first && <Sep x={23} y={y} w={747} />}
      <In x={23} y={y} w={747} h={65.38} delay={0.05 + y / 900} dy={10} className="pnl-row" style={{ borderRadius: 10 }}>
        <IconBox x={0} y={15.19} icon="docs" tone="tan" />
        <p className="absolute m-0" style={{ left: 46, top: 12, fontSize: 15, lineHeight: "22px", fontWeight: 500, color: INK }}>{name}</p>
        <p className="absolute m-0" style={{ left: 46, top: 33.11, fontSize: 12, lineHeight: "18px", fontWeight: 300, color: MUTED }}>{sub}</p>
        <button
          type="button"
          aria-label={`Descargar ${name}`}
          className="pnl-link absolute"
          style={{ left: 730, top: 23, color: MUTED }}
        >
          <span className="pnl-link-arrow block"><Ico name="download" size={18} /></span>
        </button>
      </In>
    </>
  );
}

export default function ResumenScreen() {
  return (
    <>
      <ViewTitle
        light="Hola, Pablo."
        strong="Tu obra avanza según lo previsto."
        sub="Un resumen de tu inversión en La Cabrera, actualizado hoy."
      />

      {/* ── Avance general (472:1644) ── */}
      <Card x={0} y={95.61} w={848.33} h={201.6} delay={0.06}>
        <Eyebrow x={23} y={23}>Avance general</Eyebrow>
        <p className="absolute m-0" style={{ left: 23, top: 50, fontSize: 46, lineHeight: "55px", fontWeight: 300, color: INK, letterSpacing: "-1px" }}>
          <CountUp value={78} suffix="%" />
        </p>
        <Bar x={23} y={123} w={802.33} pct={78} delay={0.25} />
        <Note x={23} y={140} size={13.5}>Semana 9 de 12 · dentro del cronograma</Note>
      </Card>

      {/* ── Foto del estado actual (472:1659) ── */}
      <Card x={866.33} y={95.61} w={737.67} h={200.08} delay={0.12} style={{ background: PHOTO_BG }}>
        <span className="absolute" style={{ left: 355.84, top: 76.53, color: "rgba(91,67,50,0.38)" }}>
          <Ico name="image" size={26} />
        </span>
        <p
          className="absolute m-0 uppercase text-center whitespace-nowrap"
          style={{ left: 0, right: 0, top: 109.53, fontSize: 10.5, lineHeight: "14px", fontWeight: 500, letterSpacing: "1.1px", color: "rgba(91,67,50,0.42)" }}
        >
          Foto — estado actual de la obra
        </p>
      </Card>

      {/* ── Fotos recientes (472:1670) ── */}
      <Card x={0} y={313.61} w={1604} h={385.35} delay={0.06}>
        <Eyebrow x={23} y={29}>Fotos recientes</Eyebrow>
        <SecLink right={23} y={29} label="Ver todas" href="/panel/fotos" />
        {FOTOS.map((f, i) => (
          <Photo key={f.label} x={f.x} y={60.27} w={302.08} h={302.08} label={f.label} date={f.date} delay={0.06 + i * 0.07} />
        ))}
      </Card>

      {/* ── Cuatro indicadores (472:1707) ── */}
      <Card x={0} y={716.96} w={387.5} h={214.77} delay={0.04} hover>
        <Eyebrow x={23} y={25.93}>Presupuesto</Eyebrow>
        <Stat right={23} y={16.59} value={<CountUp value={92} suffix="%" />} label="Ejec." />
        <Big x={23} y={100.5} suffix="/ $1.350M"><CountUp value={1.24} prefix="$" decimals={3} suffix="M" /></Big>
        <Note x={23} y={139}>del presupuesto cerrado</Note>
        <SeeLink x={23} y={170.76} label="Detalles" href="/panel/presupuesto" />
      </Card>

      <Card x={405.5} y={716.96} w={387.5} h={214.77} delay={0.1} hover>
        <Eyebrow x={23} y={20.93}>Cronograma</Eyebrow>
        <IconBox x={330.5} y={13.09} icon="calendar" tone="green" />
        <Big x={23} y={68.5} suffix="/ 12 semanas"><CountUp value={9} /></Big>
        <Note x={23} y={107}>Próxima: instalación de acabados</Note>
        <SeeLink x={23} y={138.76} label="Ver cronograma" href="/panel/avance" />
      </Card>

      <Card x={811} y={716.96} w={387.5} h={214.77} delay={0.16} hover>
        <Eyebrow x={23} y={20.93}>Aprobaciones</Eyebrow>
        <IconBox x={330.5} y={13.09} icon="clock" tone="gold" />
        <Big x={23} y={68.5} suffix="pendientes"><CountUp value={2} /></Big>
        <Note x={23} y={107}>esperan tu decisión</Note>
        <SeeLink x={23} y={138.76} label="Revisar" href="/panel/aprobaciones" />
      </Card>

      <Card x={1216.5} y={716.96} w={387.5} h={214.77} delay={0.22} hover>
        <Eyebrow x={23} y={25.93}>Interventoría</Eyebrow>
        <Stat right={23} y={16.59} value="14/15" label="OK" />
        <Big x={23} y={100.5} suffix="inspecciones"><CountUp value={15} /></Big>
        <Note x={23} y={139}>1 con observación menor</Note>
        <SeeLink x={23} y={170.76} label="Ver informes" href="/panel/interventoria" />
      </Card>

      {/* ── Actividad reciente (472:1796) ── */}
      <Card x={0} y={949.73} w={793} h={288.79} delay={0.06}>
        <Eyebrow x={23} y={29}>Actividad reciente</Eyebrow>
        {ACTIVIDAD.map((a) => <ActRow key={a.title} {...a} />)}
      </Card>

      {/* ── Documentos recientes (472:1837) ── */}
      <Card x={811} y={949.73} w={793} h={288.81} delay={0.12}>
        <Eyebrow x={23} y={29}>Documentos recientes</Eyebrow>
        <SecLink right={23} y={29} label="Ver todos" href="/panel/documentos" />
        {DOCS.map((d, i) => <DocRow key={d.name} {...d} first={i === 0} />)}
      </Card>
    </>
  );
}
