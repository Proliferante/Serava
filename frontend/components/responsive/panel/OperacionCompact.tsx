"use client";

import { useMemo, useState } from "react";
import CountUp from "@/components/motion/CountUp";
import { Ico, type IconName } from "@/components/panel/icons";
import { INK, LINEN, MUTED, TUSCANY, VERD } from "@/components/panel/ui";
import {
  PBtn, PCard, PCardHead, PDocRow, PEyebrow, PIconBox, PIn, PNote, PTabla,
  PTag, PTitle,
} from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   OPERACIÓN DEL ACTIVO — vista fluida.

   La vista más larga del panel: estado del arriendo, cuatro indicadores, la
   bitácora con sus filtros, asamblea, mantenimiento, gestor, estado de cuenta
   y documentos. Todo está, apilado en una columna.

   Dos cosas cambian de forma. Los filtros de la bitácora aquí sí filtran: en
   una lista de siete eventos en columna, tocar una categoría es más rápido que
   recorrerla entera, y el dato ya está a mano. Y el estado de cuenta pasa de
   tabla de cinco columnas a fichas: a 390 px esa tabla no se lee.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Color por categoría de evento, el mismo de los puntos de los filtros. */
const CAT: Record<string, string> = {
  Mantenimiento: "#c8913f",
  Asamblea: "#5e7a8a",
  Pago: "#7f8b57",
  Contrato: "#a57a4e",
  Inspección: "#5b4332",
};

/** Etiqueta del filtro → categoría del evento. "Todo" no filtra. */
const FILTROS: { label: string; cat: string | null }[] = [
  { label: "Todo", cat: null },
  { label: "Mantenimiento", cat: "Mantenimiento" },
  { label: "Asambleas", cat: "Asamblea" },
  { label: "Pagos", cat: "Pago" },
  { label: "Contrato", cat: "Contrato" },
  { label: "Inspecciones", cat: "Inspección" },
];

type Evento = {
  icon: IconName; title: string; desc: string; cat: string; date: string;
  estado?: { label: string; tone: "green" | "gold" };
};

const LOG: Evento[] = [
  { icon: "manager", title: "Asamblea ordinaria de copropiedad", desc: "Zequara asistió en tu representación. Se aprobó el presupuesto anual. Acta cargada en documentos.", cat: "Asamblea", date: "03 jul" },
  { icon: "alert", title: "Fuga menor en grifería de cocina", desc: "Reportada por el arrendatario. Atendida por nuestro equipo en menos de 24 h. Costo $180.000, cubierto por póliza de mantenimiento.", cat: "Mantenimiento", date: "28 jun", estado: { label: "Resuelto", tone: "green" } },
  { icon: "budget", title: "Canon de junio recaudado", desc: "Recaudo al día. Consignación neta a tu cuenta programada para el 30 de junio.", cat: "Pago", date: "25 jun", estado: { label: "Resuelto", tone: "green" } },
  { icon: "alert", title: "Ruido en ducto de ventilación", desc: "Reportado por el arrendatario. En revisión con la administración del edificio; no afecta habitabilidad.", cat: "Mantenimiento", date: "20 jun", estado: { label: "En proceso", tone: "gold" } },
  { icon: "approvals", title: "Inspección semestral del inmueble", desc: "Estado óptimo, sin novedades estructurales ni de acabados. Registro fotográfico disponible.", cat: "Inspección", date: "15 jun" },
  { icon: "docs", title: "Inicio del contrato de arriendo", desc: "Contrato a 24 meses. Arrendatario seleccionado tras verificación de perfil y 3 visitas gestionadas por Zequara.", cat: "Contrato", date: "01 may" },
  { icon: "manager", title: "Asamblea extraordinaria · fachada", desc: "Zequara votó según el lineamiento acordado contigo. Cuota extraordinaria prorrateada e informada.", cat: "Asamblea", date: "10 abr" },
];

const CUENTA: { mes: string; canon: string; hon: string; neto: string; tag: string; tone: "green" | "gold" }[] = [
  { mes: "Julio 2025", canon: "$17,00M", hon: "-$1,36M", neto: "$15,64M", tag: "Programado 30 jul", tone: "gold" },
  { mes: "Junio 2025", canon: "$17,00M", hon: "-$1,36M", neto: "$15,64M", tag: "Consignado", tone: "green" },
  { mes: "Mayo 2025", canon: "$17,00M", hon: "-$1,36M", neto: "$15,64M", tag: "Consignado", tone: "green" },
];

const DOCS = [
  { name: "Contrato de arriendo.pdf", sub: "Vigente · may 2025 – may 2027" },
  { name: "Póliza de arrendamiento.pdf", sub: "Cubre canon y daños" },
  { name: "Acta asamblea ordinaria · jul 2025.pdf", sub: "Cargada hace 3 semanas" },
];

const ASAMBLEA = [
  "Aprobación del presupuesto de mantenimiento",
  "Reparación de ascensores",
  "Actualización del reglamento",
];

/** Celda del cuadro de arriendo: etiqueta, dato fuerte y matiz al lado. */
function Dato({ label, value, aside, green }: { label: string; value: string; aside?: string; green?: boolean }) {
  return (
    <div>
      <p className="m-0 uppercase" style={{ fontSize: 10.5, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.7px", color: MUTED }}>{label}</p>
      <p className="m-0 mt-[2px] text-[15px] font-semibold leading-[1.4]" style={{ color: green ? VERD : INK }}>
        {value}
        {aside && <span style={{ marginLeft: 6, fontSize: 12.5, fontWeight: 300, color: MUTED }}>{aside}</span>}
      </p>
    </div>
  );
}

/** Uno de los cuatro indicadores del activo. */
function Ind({
  label, valor, nota, verde, dato, icono, delay,
}: {
  label: string; valor: React.ReactNode; nota: string; verde?: boolean;
  dato?: { v: React.ReactNode; l: string };
  icono?: { name: IconName; tone: "green" | "gold" }; delay: number;
}) {
  return (
    <PCard delay={delay} className="pnl-card">
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
      <p className="m-0 mt-[12px] text-[22px] font-semibold leading-[1.3]" style={{ color: verde ? VERD : INK, letterSpacing: "-0.3px" }}>{valor}</p>
      <PNote className="mt-[4px]">{nota}</PNote>
    </PCard>
  );
}

export default function OperacionCompact() {
  const [filtro, setFiltro] = useState<string | null>(null);
  const visibles = useMemo(() => (filtro ? LOG.filter((l) => l.cat === filtro) : LOG), [filtro]);

  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Operación del" strong="activo"
        sub="Todo lo que pasa con tu inmueble en un solo lugar: arriendo, mantenimiento, asambleas y bitácora."
      />

      {/* ── Estado del arriendo ── */}
      <PCard delay={0.04}>
        <span
          className="inline-flex items-center gap-[9px] rounded-full px-[14px] py-[7px]"
          style={{ background: "rgba(95,107,62,0.12)", color: VERD, fontSize: 12, fontWeight: 600, letterSpacing: "0.6px" }}
        >
          <span className="ix-live block size-[9px] rounded-full" style={{ background: VERD }} />
          <span className="uppercase">Arrendado</span>
        </span>

        <p className="m-0 mt-[14px] text-[clamp(1.25rem,5.6vw,1.5rem)] leading-[1.3]" style={{ fontWeight: 300, color: INK, letterSpacing: "-0.4px" }}>
          Tu activo está <span style={{ fontWeight: 600 }}>generando renta.</span>
        </p>
        <PNote className="mt-[8px]" size={14}>Ocupado sin interrupciones desde el 1 de mayo de 2025.</PNote>

        <div className="mt-[16px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
          <Dato label="Arrendatario" value="Perfil verificado" aside="· seleccionado por Zequara" />
          <Dato label="Canon mensual" value="$17.000.000" aside="COP" />
          <Dato label="Contrato" value="May 2025 – May 2027" aside="· 24 meses" />
          <Dato label="Estado de pago" value="Al día" green />
        </div>
      </PCard>

      {/* ── Indicadores ── */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        <Ind label="Ocupación" delay={0.04} valor="Ocupado" nota="sin vacancia desde may 2025"
          dato={{ v: <CountUp value={100} suffix="%" />, l: "Ocup." }} />
        <Ind label="Canon mensual" delay={0.08} valor={<CountUp value={17} prefix="$" suffix="M" />} nota="+54% frente al canon previo"
          icono={{ name: "budget", tone: "green" }} />
        <Ind label="Recaudo de julio" delay={0.12} valor="Al día" verde nota="recaudado el 25 jul"
          icono={{ name: "check", tone: "green" }} />
        <Ind label="Próxima consignación" delay={0.16} valor="30 jul" nota="$15,64M netos a tu cuenta"
          icono={{ name: "calendar", tone: "gold" }} />
      </div>

      {/* ── Bitácora ── */}
      <PCard delay={0.04} pad={0}>
        <div className="px-[18px] pt-[16px]">
          <PEyebrow>Bitácora del activo</PEyebrow>
        </div>
        {/* Los filtros aquí sí filtran: en una lista en columna es más rápido
            que recorrerla entera, y el dato ya estaba a mano. */}
        <div className="mt-[12px] overflow-x-auto px-[18px] pb-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-[7px]">
            {FILTROS.map((f) => {
              const on = filtro === f.cat;
              const punto = f.cat ? CAT[f.cat] : undefined;
              return (
                <button
                  key={f.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFiltro(f.cat)}
                  className="pnl-fchip inline-flex h-[36px] shrink-0 items-center justify-center gap-[7px] whitespace-nowrap rounded-full px-[13px]"
                  style={{
                    background: on ? "#2a1e14" : LINEN,
                    border: `1px solid ${on ? "#2a1e14" : "rgba(90,67,50,0.16)"}`,
                    color: on ? LINEN : MUTED, fontSize: 12.8, fontWeight: 500,
                  }}
                >
                  {punto && <span className="block size-[8px] rounded-full" style={{ background: punto }} />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-[18px] pb-[18px]">
          {visibles.map((l, i) => {
            const color = CAT[l.cat] ?? MUTED;
            return (
              <PIn key={l.title} delay={0.05 + i * 0.04} y={10} className="pnl-row flex gap-[12px] py-[14px]" style={i === 0 ? undefined : { borderTop: "1px solid #ddd5c8" }}>
                <span
                  className="flex size-[38px] shrink-0 items-center justify-center"
                  style={{ borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, color }}
                >
                  <Ico name={l.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-[10px]">
                    <span className="text-[15px] font-semibold leading-[1.4]" style={{ color: INK }}>{l.title}</span>
                    <span className="shrink-0 text-[12.5px]" style={{ color: MUTED }}>{l.date}</span>
                  </span>
                  <span className="mt-[4px] block text-[13px] font-light leading-[1.55]" style={{ color: MUTED }}>{l.desc}</span>
                  <span className="mt-[8px] flex flex-wrap items-center gap-[7px]">
                    <span
                      className="inline-flex items-center uppercase"
                      style={{ height: 21, padding: "0 9px", borderRadius: 999, background: `${color}1f`, color, fontSize: 9.6, fontWeight: 700, letterSpacing: "0.7px" }}
                    >
                      {l.cat}
                    </span>
                    {l.estado && <PTag label={l.estado.label} tone={l.estado.tone} size={10.5} />}
                  </span>
                </span>
              </PIn>
            );
          })}
          {visibles.length === 0 && (
            <p className="m-0 py-[24px] text-center text-[13.5px] font-light" style={{ color: MUTED }}>
              Sin eventos de esta categoría.
            </p>
          )}
        </div>
      </PCard>

      {/* ── Próxima asamblea: la única tarjeta oscura de la vista ── */}
      <PCard delay={0.08} dark pad={20} style={{ borderRadius: 18 }}>
        <p className="m-0 uppercase" style={{ fontSize: 11.5, lineHeight: "17px", fontWeight: 600, letterSpacing: "1.6px", color: "#c9a877" }}>
          Próxima asamblea
        </p>
        <p className="m-0 mt-[8px] text-[18px] font-semibold leading-[1.4]" style={{ color: LINEN }}>Martes 5 ago · 6:00 p.m.</p>
        <span
          className="mt-[12px] inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px]"
          style={{ background: "rgba(127,139,87,0.2)", color: "#9aa66f", fontSize: 11.5, fontWeight: 600 }}
        >
          <Ico name="check" size={13} />
          Zequara asiste en tu representación
        </span>
        <ul className="m-0 mt-[14px] flex list-none flex-col gap-[8px] p-0">
          {ASAMBLEA.map((li) => (
            <li key={li} className="flex items-start gap-[11px]">
              <span className="mt-[7px] block size-[5px] shrink-0 rounded-full" style={{ background: "#c9a877" }} />
              <span className="text-[13px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.82)" }}>{li}</span>
            </li>
          ))}
        </ul>
        <div className="mt-[16px]"><PBtn label="Ver convocatoria" tone="ghost" /></div>
      </PCard>

      {/* ── Mantenimiento abierto ── */}
      <PCard delay={0.12}>
        <PCardHead
          label="Mantenimiento abierto"
          right={<span className="shrink-0 text-[11.5px] font-semibold uppercase" style={{ letterSpacing: "0.6px", color: TUSCANY }}>1 activo</span>}
        />
        <PIn delay={0.16} y={10} className="pnl-row mt-[10px] flex items-start gap-[12px]">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(200,145,63,0.16)", color: "#8a6a3c" }}>
            <Ico name="alert" size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold leading-[1.4]" style={{ color: INK }}>Ruido en ducto de ventilación</span>
            <span className="mt-[2px] block text-[12.5px] font-light leading-[1.5]" style={{ color: MUTED }}>En revisión con administración · reportado 20 jun</span>
          </span>
        </PIn>
      </PCard>

      {/* ── Tu gestor ── */}
      <PCard delay={0.16}>
        <PEyebrow>Tu gestor</PEyebrow>
        <div className="mt-[12px] flex items-center gap-[12px]">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(165,122,78,0.16)", color: "#7a5c3c" }}>
            <Ico name="user" size={16} />
          </span>
          <span className="min-w-0">
            <span className="block text-[14.5px] font-semibold leading-[1.4]" style={{ color: INK }}>Juan P. Restrepo</span>
            <PNote size={12.5}>Único interlocutor · Zequara</PNote>
          </span>
        </div>
        <div className="mt-[14px]"><PBtn label="Escribir mensaje" icon="message" tone="outline" /></div>
      </PCard>

      {/* ── Estado de cuenta ── */}
      <PCard delay={0.04}>
        <PEyebrow>Estado de cuenta del arriendo</PEyebrow>
        <div className="mt-[14px]">
          <PTabla
            filas={CUENTA.map((r) => ({
              titulo: r.mes,
              derecha: <PTag label={r.tag} tone={r.tone} />,
              datos: [
                ["Canon", r.canon],
                ["Honorario admin. (8%)", <span key="h" style={{ color: MUTED }}>{r.hon}</span>],
                ["Neto a ti", <span key="n" style={{ fontWeight: 600 }}>{r.neto}</span>],
              ],
            }))}
          />
        </div>
        <PIn delay={0.2} y={10} className="mt-[14px] flex items-start gap-[11px] p-[14px]" style={{ borderRadius: 10, background: "rgba(95,107,62,0.07)", border: "1px solid rgba(95,107,62,0.14)" }}>
          <span className="shrink-0" style={{ color: VERD }}><Ico name="approvals" size={18} /></span>
          <p className="m-0 text-[13px] font-light leading-[1.55]" style={{ color: MUTED }}>
            Conoces el honorario de administración antes de cada periodo. El neto se consigna a tu cuenta dentro de
            los primeros 5 días de cada mes.
          </p>
        </PIn>
      </PCard>

      {/* ── Documentos de la operación ── */}
      <PCard delay={0.04}>
        <PEyebrow>Documentos de la operación</PEyebrow>
        <div className="mt-[6px]">
          {DOCS.map((d, i) => <PDocRow key={d.name} {...d} first={i === 0} delay={0.05 + i * 0.05} />)}
        </div>
      </PCard>
    </div>
  );
}
