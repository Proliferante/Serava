"use client";

import CountUp from "@/components/motion/CountUp";
import { Ico } from "@/components/panel/icons";
import { INK, MUTED, PHOTO_BG, VERD } from "@/components/panel/ui";
import {
  PBar, PCard, PCardHead, PDocRow, PEyebrow, PFoto, PIconBox, PIn, PNote,
  PSecLink, PSeeLink,
} from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   RESUMEN — vista fluida.

   Mismo contenido que el lienzo de 1604 px: avance general, foto del día,
   galería reciente, los cuatro indicadores y las dos listas de cierre.

   Lo único que cambia de forma es la galería: en el escritorio son cinco
   cuadrados en fila, aquí una tira que se pasa con el dedo (`scroll-snap`, que
   el navegador ya hace bien sin JavaScript). Y los cuatro indicadores pasan de
   una fila de cuatro a una rejilla de dos.
   ═══════════════════════════════════════════════════════════════════════════ */

const FOTOS = [
  { label: "Sala", date: "12 Jun" },
  { label: "Cocina", date: "10 Jun" },
  { label: "Baño", date: "08 Jun" },
  { label: "Alcoba", date: "06 Jun" },
  { label: "Detalle", date: "04 Jun" },
];

const ACTIVIDAD = [
  { tone: "ok" as const, title: "Inspección de acabados", sub: "Aprobada por interventoría independiente", time: "Hoy, 8:30" },
  { tone: "warn" as const, title: "Cambio en diseño de cocina", sub: "Enviado para tu aprobación", time: "Ayer, 16:15" },
  { tone: "ok" as const, title: "Hito de pago 2 liberado", sub: "Tras verificación de avance", time: "10 jun" },
];

const DOCS = [
  { name: "Presupuesto cerrado v3.pdf", sub: "Actualizado hoy" },
  { name: "Cronograma actualizado.xlsx", sub: "Actualizado ayer" },
  { name: "Planos eléctricos.pdf", sub: "Actualizado hace 3 días" },
];

/** Fila de actividad, con el mismo rectángulo teñido según el estado. */
function ActRow({ tone, title, sub, time, i }: (typeof ACTIVIDAD)[number] & { i: number }) {
  const t = tone === "ok"
    ? { bg: "#cbd5b6", chip: "rgba(95,107,62,0.16)", fg: VERD, icon: "check" as const }
    : { bg: "#dcbf94", chip: "rgba(247,241,229,0.45)", fg: "#8a6a3c", icon: "clock" as const };
  return (
    <PIn delay={0.06 + i * 0.06} y={10} className="flex items-start gap-[11px] p-[12px]" style={{ borderRadius: 10, background: t.bg }}>
      <span className="flex size-[24px] shrink-0 items-center justify-center rounded-full" style={{ background: t.chip, color: t.fg }}>
        <Ico name={t.icon} size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold leading-[1.4]" style={{ color: INK }}>{title}</span>
        <span className="mt-[2px] block text-[12.5px] font-light leading-[1.5]" style={{ color: MUTED }}>{sub}</span>
      </span>
      <span className="shrink-0 text-[11.5px]" style={{ color: MUTED }}>{time}</span>
    </PIn>
  );
}

/** Uno de los cuatro indicadores. */
function Ind({
  label, valor, unidad, nota, enlace, href, dato, icono, delay,
}: {
  label: string; valor: React.ReactNode; unidad?: string; nota: string;
  enlace: string; href: string; dato?: { v: React.ReactNode; l: string };
  icono?: { name: "calendar" | "clock"; tone: "green" | "gold" }; delay: number;
}) {
  return (
    <PCard delay={delay} className="pnl-card flex flex-col">
      <div className="flex items-start justify-between gap-[10px]">
        <PEyebrow>{label}</PEyebrow>
        {icono && <PIconBox icon={icono.name} tone={icono.tone} />}
        {dato && (
          <span className="shrink-0 text-right">
            <span className="block text-[18px] font-semibold leading-[1.2]" style={{ color: VERD }}>{dato.v}</span>
            <span className="block uppercase" style={{ fontSize: 9.5, lineHeight: "13px", fontWeight: 500, letterSpacing: "0.6px", color: MUTED }}>{dato.l}</span>
          </span>
        )}
      </div>
      <p className="m-0 mt-[12px] flex items-baseline gap-[5px]">
        <span className="text-[clamp(1.4rem,6vw,1.8rem)] font-bold leading-[1.2]" style={{ color: INK, letterSpacing: "-0.3px" }}>{valor}</span>
        {unidad && <span className="text-[14px] font-normal" style={{ color: MUTED }}>{unidad}</span>}
      </p>
      <PNote className="mt-[4px]">{nota}</PNote>
      <PSeeLink label={enlace} href={href} />
    </PCard>
  );
}

export default function ResumenCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      {/* ── Avance general ── */}
      <PCard delay={0.04}>
        <PEyebrow>Avance general</PEyebrow>
        <p className="m-0 mt-[6px] text-[clamp(2.2rem,11vw,2.9rem)] leading-[1.1]" style={{ fontWeight: 300, color: INK, letterSpacing: "-1px" }}>
          <CountUp value={78} suffix="%" />
        </p>
        <div className="mt-[14px]"><PBar pct={78} delay={0.2} /></div>
        <PNote className="mt-[10px]" size={13.5}>Semana 9 de 12 · dentro del cronograma</PNote>
      </PCard>

      {/* ── Foto del estado actual ── */}
      <PIn delay={0.08} className="relative flex items-center justify-center overflow-hidden" style={{ borderRadius: 16, background: PHOTO_BG, aspectRatio: "16 / 9" }}>
        <span className="flex flex-col items-center gap-[8px]" style={{ color: "rgba(91,67,50,0.38)" }}>
          <Ico name="image" size={26} />
          <span className="uppercase" style={{ fontSize: 10.5, lineHeight: "14px", fontWeight: 500, letterSpacing: "1.1px", color: "rgba(91,67,50,0.42)" }}>
            Foto — estado actual de la obra
          </span>
        </span>
      </PIn>

      {/* ── Fotos recientes ── */}
      <PCard delay={0.04} pad={0}>
        <div className="px-[18px] pt-[16px]">
          <PCardHead label="Fotos recientes" right={<PSecLink label="Ver todas" href="/panel/fotos" />} />
        </div>
        {/* Tira que se pasa con el dedo: cinco cuadrados en fila no caben. */}
        <div className="mt-[12px] flex snap-x snap-mandatory gap-[10px] overflow-x-auto px-[18px] pb-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FOTOS.map((f, i) => (
            <div key={f.label} className="w-[62%] shrink-0 snap-center sm:w-[38%]">
              <PFoto label={f.label} date={f.date} delay={0.04 + i * 0.05} ratio="1 / 1" />
            </div>
          ))}
        </div>
      </PCard>

      {/* ── Cuatro indicadores ── */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        <Ind
          label="Presupuesto" delay={0.04}
          valor={<CountUp value={1.24} prefix="$" decimals={3} suffix="M" />} unidad="/ $1.350M"
          nota="del presupuesto cerrado" enlace="Detalles" href="/panel/presupuesto"
          dato={{ v: <CountUp value={92} suffix="%" />, l: "Ejec." }}
        />
        <Ind
          label="Cronograma" delay={0.08}
          valor={<CountUp value={9} />} unidad="/ 12 semanas"
          nota="Próxima: instalación de acabados" enlace="Ver cronograma" href="/panel/avance"
          icono={{ name: "calendar", tone: "green" }}
        />
        <Ind
          label="Aprobaciones" delay={0.12}
          valor={<CountUp value={2} />} unidad="pendientes"
          nota="esperan tu decisión" enlace="Revisar" href="/panel/aprobaciones"
          icono={{ name: "clock", tone: "gold" }}
        />
        <Ind
          label="Interventoría" delay={0.16}
          valor={<CountUp value={15} />} unidad="inspecciones"
          nota="1 con observación menor" enlace="Ver informes" href="/panel/interventoria"
          dato={{ v: "14/15", l: "OK" }}
        />
      </div>

      {/* ── Actividad reciente ── */}
      <PCard delay={0.04}>
        <PEyebrow>Actividad reciente</PEyebrow>
        <div className="mt-[12px] flex flex-col gap-[8px]">
          {ACTIVIDAD.map((a, i) => <ActRow key={a.title} {...a} i={i} />)}
        </div>
      </PCard>

      {/* ── Documentos recientes ── */}
      <PCard delay={0.08}>
        <PCardHead label="Documentos recientes" right={<PSecLink label="Ver todos" href="/panel/documentos" />} />
        <div className="mt-[6px]">
          {DOCS.map((d, i) => <PDocRow key={d.name} {...d} first={i === 0} delay={0.05 + i * 0.05} />)}
        </div>
      </PCard>
    </div>
  );
}
