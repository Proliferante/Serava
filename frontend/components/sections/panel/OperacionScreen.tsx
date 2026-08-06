"use client";

import type { CSSProperties } from "react";
import CountUp from "@/components/motion/CountUp";
import { Ico, type IconName } from "@/components/panel/icons";
import {
  Btn, Card, DocRow, Eyebrow, IconBox, In, INK, LINE, LINEN, MUTED,
  Note, Stat, Tag, TUSCANY, VERD, ViewTitle,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   OPERACIÓN DEL ACTIVO — Figma 600:2073 (vista de 1604 × 2155.79).

   La vista del inmueble ya entregado y rentando: estado del arriendo, cuatro
   indicadores, la bitácora con sus filtros, la columna de asamblea /
   mantenimiento / gestor, el estado de cuenta y los documentos.

   Los filtros de la bitácora están pintados pero no filtran: el catálogo de
   eventos todavía no viene de ningún sitio.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + área de contenido (2223.79). */
export const OPERACION_H = 2299;

/** Color por categoría de evento. Sale de los puntos de los filtros. */
const CAT: Record<string, string> = {
  Mantenimiento: "#c8913f",
  Asamblea: "#5e7a8a",
  Asambleas: "#5e7a8a",
  Pago: "#7f8b57",
  Pagos: "#7f8b57",
  Contrato: "#a57a4e",
  Inspección: "#5b4332",
  Inspecciones: "#5b4332",
};

const FILTROS: { label: string; x: number; w: number }[] = [
  { label: "Todo", x: 0, w: 65 },
  { label: "Mantenimiento", x: 73, w: 146 },
  { label: "Asambleas", x: 227, w: 121 },
  { label: "Pagos", x: 356, w: 87 },
  { label: "Contrato", x: 451, w: 105 },
  { label: "Inspecciones", x: 564, w: 133 },
];

type LogItem = {
  y: number; icon: IconName; title: string; desc: string; cat: string; date: string;
  estado?: { label: string; tone: "green" | "gold" };
};

const LOG: LogItem[] = [
  { y: 4, icon: "manager", title: "Asamblea ordinaria de copropiedad", desc: "Zequara asistió en tu representación. Se aprobó el presupuesto anual. Acta cargada en documentos.", cat: "Asamblea", date: "03 jul" },
  { y: 110.13, icon: "alert", title: "Fuga menor en grifería de cocina", desc: "Reportada por el arrendatario. Atendida por nuestro equipo en menos de 24 h. Costo $180.000, cubierto por póliza de mantenimiento.", cat: "Mantenimiento", date: "28 jun", estado: { label: "Resuelto", tone: "green" } },
  { y: 235.94, icon: "budget", title: "Canon de junio recaudado", desc: "Recaudo al día. Consignación neta a tu cuenta programada para el 30 de junio.", cat: "Pago", date: "25 jun", estado: { label: "Resuelto", tone: "green" } },
  { y: 342.07, icon: "alert", title: "Ruido en ducto de ventilación", desc: "Reportado por el arrendatario. En revisión con la administración del edificio; no afecta habitabilidad.", cat: "Mantenimiento", date: "20 jun", estado: { label: "En proceso", tone: "gold" } },
  { y: 448.2, icon: "approvals", title: "Inspección semestral del inmueble", desc: "Estado óptimo, sin novedades estructurales ni de acabados. Registro fotográfico disponible.", cat: "Inspección", date: "15 jun" },
  { y: 554.33, icon: "docs", title: "Inicio del contrato de arriendo", desc: "Contrato a 24 meses. Arrendatario seleccionado tras verificación de perfil y 3 visitas gestionadas por Zequara.", cat: "Contrato", date: "01 may" },
  { y: 660.46, icon: "manager", title: "Asamblea extraordinaria · fachada", desc: "Zequara votó según el lineamiento acordado contigo. Cuota extraordinaria prorrateada e informada.", cat: "Asamblea", date: "10 abr" },
];

const CUENTA: { mes: string; canon: string; hon: string; neto: string; tag: string; tone: "green" | "gold" }[] = [
  { mes: "Julio 2025", canon: "$17,00M", hon: "-$1,36M", neto: "$15,64M", tag: "Programado 30 jul", tone: "gold" },
  { mes: "Junio 2025", canon: "$17,00M", hon: "-$1,36M", neto: "$15,64M", tag: "Consignado", tone: "green" },
  { mes: "Mayo 2025", canon: "$17,00M", hon: "-$1,36M", neto: "$15,64M", tag: "Consignado", tone: "green" },
];

const DOCS = [
  { y: 60.26, name: "Contrato de arriendo.pdf", sub: "Vigente · may 2025 – may 2027" },
  { y: 125.64, name: "Póliza de arrendamiento.pdf", sub: "Cubre canon y daños" },
  { y: 191.02, name: "Acta asamblea ordinaria · jul 2025.pdf", sub: "Cargada hace 3 semanas" },
];

/** Celda del cuadro de arriendo: etiqueta, dato fuerte y matiz al lado. */
function Dato({ x, y, label, value, aside, green }: { x: number; y: number; label: string; value: string; aside?: string; green?: boolean }) {
  return (
    <>
      <p className="absolute m-0 uppercase" style={{ left: x, top: y, fontSize: 10.5, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.7px", color: MUTED }}>{label}</p>
      <p className="absolute m-0 whitespace-nowrap" style={{ left: x, top: y + 18.5, fontSize: 15.5, lineHeight: "24px", fontWeight: 600, color: green ? VERD : INK }}>
        {value}
        {aside && <span style={{ marginLeft: 6, fontSize: 12.5, fontWeight: 300, color: MUTED }}>{aside}</span>}
      </p>
    </>
  );
}

/** Fila de la bitácora. */
function Log({ item, i }: { item: LogItem; i: number }) {
  const color = CAT[item.cat] ?? MUTED;
  return (
    <In x={23} y={112.27 + item.y} w={930} h={90} delay={0.05 + i * 0.05} dy={10} className="pnl-row" style={{ borderRadius: 10 }}>
      <span
        className="absolute flex items-center justify-center"
        style={{ left: 0, top: 16, width: 38, height: 38, borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, color }}
      >
        <Ico name={item.icon} size={18} />
      </span>
      <p className="absolute m-0" style={{ left: 53, top: 15, fontSize: 15.5, lineHeight: "23.56px", fontWeight: 600, color: INK }}>{item.title}</p>
      <p className="absolute m-0" style={{ left: 53, top: 40.56, width: 800, fontSize: 13, lineHeight: "20px", fontWeight: 300, color: MUTED }}>{item.desc}</p>
      <span
        className="absolute inline-flex items-center uppercase"
        style={{ left: 53, top: 68.55, height: 21, padding: "0 9px", borderRadius: 999, background: `${color}1f`, color, fontSize: 9.6, fontWeight: 700, letterSpacing: "0.7px" }}
      >
        {item.cat}
      </span>
      <p className="absolute m-0 text-right" style={{ right: 0, top: 15, fontSize: 12.5, lineHeight: "19px", fontWeight: 400, color: MUTED }}>{item.date}</p>
      {item.estado && (
        <span className="absolute" style={{ right: 0, top: 40 }}>
          <Tag label={item.estado.label} tone={item.estado.tone} size={10.5} />
        </span>
      )}
    </In>
  );
}

const TH: CSSProperties = {
  padding: "0 10px", fontSize: 11, fontWeight: 600, letterSpacing: "0.9px",
  color: MUTED, textTransform: "uppercase", borderBottom: `1px solid ${LINE}`,
};
const TD: CSSProperties = { padding: "0 10px", fontSize: 14, borderBottom: `1px solid ${LINE}` };

export default function OperacionScreen() {
  return (
    <>
      <ViewTitle
        light="Operación del"
        strong="activo"
        sub="Todo lo que pasa con tu inmueble en un solo lugar: arriendo, mantenimiento, asambleas y bitácora."
      />

      {/* ── Estado del arriendo (600:2208) ── */}
      <Card x={0} y={91.61} w={1604} h={304} delay={0.06}>
        <span
          className="absolute inline-flex items-center"
          style={{ left: 26, top: 26, height: 33.27, padding: "0 15px", gap: 9, borderRadius: 999, background: "rgba(95,107,62,0.12)", color: VERD, fontSize: 12, fontWeight: 600, letterSpacing: "0.6px" }}
        >
          <span className="ix-live block" style={{ width: 9, height: 9, borderRadius: 999, background: VERD }} />
          <span className="uppercase">Arrendado</span>
        </span>

        <p className="absolute m-0" style={{ left: 26, top: 75.27, fontSize: 24, lineHeight: "36px", fontWeight: 300, color: INK, letterSpacing: "-0.4px" }}>
          Tu activo está <span style={{ fontWeight: 600 }}>generando renta.</span>
        </p>
        <Note x={26} y={116.27} size={14}>Ocupado sin interrupciones desde el 1 de mayo de 2025.</Note>

        <Dato x={26} y={157.91} label="Arrendatario" value="Perfil verificado" aside="· seleccionado por Zequara" />
        <Dato x={479.25} y={157.91} label="Canon mensual" value="$17.000.000" aside="COP" />
        <Dato x={26} y={215.79} label="Contrato" value="May 2025 – May 2027" aside="· 24 meses" />
        <Dato x={479.25} y={215.79} label="Estado de pago" value="Al día" green />
      </Card>

      {/* ── Indicadores (600:2251) ── */}
      <Card x={0} y={413.61} w={387.5} h={180.77} delay={0.04} hover>
        <Eyebrow x={23} y={46.85}>Ocupación</Eyebrow>
        <Stat right={23} y={37.5} value={<CountUp value={100} suffix="%" />} label="Ocup." />
        <p className="absolute m-0" style={{ left: 23, top: 101, fontSize: 24, lineHeight: "36px", fontWeight: 600, color: INK, letterSpacing: "-0.3px" }}>Ocupado</p>
        <Note x={23} y={139}>sin vacancia desde may 2025</Note>
      </Card>

      <Card x={405.5} y={413.61} w={387.5} h={180.77} delay={0.1} hover>
        <Eyebrow x={23} y={30.85}>Canon mensual</Eyebrow>
        <IconBox x={330.5} y={23} icon="budget" tone="green" />
        <p className="absolute m-0" style={{ left: 23, top: 69, fontSize: 24, lineHeight: "36px", fontWeight: 600, color: INK, letterSpacing: "-0.3px" }}>
          <CountUp value={17} prefix="$" suffix="M" />
        </p>
        <Note x={23} y={107}>+54% frente al canon previo</Note>
      </Card>

      <Card x={811} y={413.61} w={387.5} h={180.77} delay={0.16} hover>
        <Eyebrow x={23} y={30.85}>Recaudo de julio</Eyebrow>
        <IconBox x={330.5} y={23} icon="check" tone="green" />
        <p className="absolute m-0" style={{ left: 23, top: 69, fontSize: 24, lineHeight: "36px", fontWeight: 600, color: VERD, letterSpacing: "-0.3px" }}>Al día</p>
        <Note x={23} y={107}>recaudado el 25 jul</Note>
      </Card>

      <Card x={1216.5} y={413.61} w={387.5} h={180.77} delay={0.22} hover>
        <Eyebrow x={23} y={30.85}>Próxima consignación</Eyebrow>
        <IconBox x={330.5} y={23} icon="calendar" tone="gold" />
        <p className="absolute m-0" style={{ left: 23, top: 69, fontSize: 24, lineHeight: "36px", fontWeight: 600, color: INK, letterSpacing: "-0.3px" }}>30 jul</p>
        <Note x={23} y={107}>$15,64M netos a tu cuenta</Note>
      </Card>

      {/* ── Bitácora (600:2305) ── */}
      <Card x={0} y={612.38} w={976} h={900.87} delay={0.06}>
        <Eyebrow x={23} y={28}>Bitácora del activo</Eyebrow>
        {FILTROS.map((f, i) => {
          const on = i === 0;
          const dot = CAT[f.label];
          return (
            <button
              key={f.label}
              type="button"
              aria-pressed={on}
              className="pnl-fchip absolute inline-flex items-center justify-center"
              style={{
                left: 23 + f.x, top: 60.27, width: f.w, height: 38, gap: 7, borderRadius: 999,
                background: on ? "#2a1e14" : LINEN,
                border: `1px solid ${on ? "#2a1e14" : "rgba(90,67,50,0.16)"}`,
                color: on ? LINEN : MUTED, fontSize: 12.8, fontWeight: 500,
              }}
            >
              {dot && <span className="block" style={{ width: 8, height: 8, borderRadius: 4, background: dot }} />}
              {f.label}
            </button>
          );
        })}
        {LOG.map((l, i) => <Log key={l.title} item={l} i={i} />)}
      </Card>

      {/* ── Próxima asamblea (600:2435) — la única tarjeta oscura de la vista ── */}
      <In x={994} y={612.38} w={610} h={312.53} delay={0.1} dy={16}>
        <div
          className="absolute inset-0"
          style={{
            borderRadius: 18,
            backgroundImage: "linear-gradient(159.8deg, #3d2c1e 0%, #2a1e14 100%)",
            filter: "drop-shadow(0 4px 2px rgba(73,33,0,0.55))",
          }}
        />
        <p className="absolute m-0 uppercase" style={{ left: 22, top: 28, fontSize: 11.5, lineHeight: "17.28px", fontWeight: 600, letterSpacing: "1.613px", color: "#c9a877" }}>
          Próxima asamblea
        </p>
        <p className="absolute m-0" style={{ left: 22, top: 59.26, fontSize: 18.4, lineHeight: "27.6px", fontWeight: 600, color: LINEN }}>
          Martes 5 ago · 6:00 p.m.
        </p>
        <span
          className="absolute inline-flex items-center"
          style={{ left: 22, top: 97.26, height: 27.27, padding: "0 11px", gap: 7, borderRadius: 999, background: "rgba(127,139,87,0.2)", color: "#9aa66f", fontSize: 11.5, fontWeight: 600 }}
        >
          <Ico name="check" size={13} />
          Zequara asiste en tu representación
        </span>
        {["Aprobación del presupuesto de mantenimiento", "Reparación de ascensores", "Actualización del reglamento"].map((li, i) => (
          <div key={li} className="absolute" style={{ left: 22, top: 138.53 + i * 30, width: 566 }}>
            <span className="absolute" style={{ left: 0, top: 7.5, width: 5, height: 5, borderRadius: 2.5, background: "#c9a877" }} />
            <p className="m-0" style={{ marginLeft: 16, fontSize: 13.1, lineHeight: "19.68px", fontWeight: 300, color: "rgba(247,241,229,0.82)" }}>{li}</p>
          </div>
        ))}
        <button
          type="button"
          className="pnl-btn pnl-ghost absolute inline-flex items-center justify-center"
          style={{ left: 22, top: 244.53, width: 566, height: 46, borderRadius: 999, border: "1px solid rgba(247,241,229,0.1)", background: "transparent", color: LINEN, fontSize: 13.8, fontWeight: 600 }}
        >
          Ver convocatoria
        </button>
      </In>

      {/* ── Mantenimiento abierto (600:2456) ── */}
      <Card x={994} y={942.91} w={610} h={145.67} delay={0.16}>
        <Eyebrow x={23} y={28.27}>Mantenimiento abierto</Eyebrow>
        <p className="absolute m-0 text-right" style={{ right: 23, top: 28, fontSize: 11.5, lineHeight: "17.28px", fontWeight: 600, letterSpacing: "0.6px", color: TUSCANY }}>1 activo</p>
        <In x={23} y={60.27} w={564} h={62.41} delay={0.2} dy={10} className="pnl-row" style={{ borderRadius: 10 }}>
          <span className="absolute flex items-center justify-center" style={{ left: 0, top: 12, width: 30, height: 30, borderRadius: 999, background: "rgba(200,145,63,0.16)", color: "#8a6a3c" }}>
            <Ico name="alert" size={16} />
          </span>
          <p className="absolute m-0" style={{ left: 42, top: 11, fontSize: 14.5, lineHeight: "21.64px", fontWeight: 600, color: INK }}>Ruido en ducto de ventilación</p>
          <p className="absolute m-0" style={{ left: 42, top: 31.64, fontSize: 12.5, lineHeight: "18.77px", fontWeight: 300, color: MUTED }}>En revisión con administración · reportado 20 jun</p>
        </In>
      </Card>

      {/* ── Tu gestor (600:2471) ── */}
      <Card x={994} y={1106.58} w={610} h={187.67} delay={0.22}>
        <Eyebrow x={23} y={28}>Tu gestor</Eyebrow>
        <span className="absolute flex items-center justify-center" style={{ left: 23, top: 60.27, width: 30, height: 30, borderRadius: 999, background: "rgba(165,122,78,0.16)", color: "#7a5c3c" }}>
          <Ico name="user" size={16} />
        </span>
        <p className="absolute m-0" style={{ left: 65, top: 59.27, fontSize: 14.5, lineHeight: "21.64px", fontWeight: 600, color: INK }}>Juan P. Restrepo</p>
        <Note x={65} y={79.91} size={12.5}>Único interlocutor · Zequara</Note>
        <Btn x={23} y={118.68} w={564} label="Escribir mensaje" icon="message" tone="outline" />
      </Card>

      {/* ── Estado de cuenta (600:2488) ── */}
      <Card x={0} y={1529.21} w={1604} h={330.18} delay={0.06}>
        <Eyebrow x={23} y={28}>Estado de cuenta del arriendo</Eyebrow>
        <table className="absolute" style={{ left: 23, top: 60.27, width: 1558, borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 268.36 }} />
            <col style={{ width: 205.59 }} />
            <col style={{ width: 470.39 }} />
            <col style={{ width: 212.41 }} />
            <col style={{ width: 401.25 }} />
          </colgroup>
          <thead>
            <tr style={{ height: 40.34 }}>
              <th style={{ ...TH, textAlign: "left" }}>Mes</th>
              <th style={{ ...TH, textAlign: "right" }}>Canon</th>
              <th style={{ ...TH, textAlign: "right" }}>Honorario admin. (8%)</th>
              <th style={{ ...TH, textAlign: "right" }}>Neto a ti</th>
              <th style={{ ...TH, textAlign: "right" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {CUENTA.map((r) => (
              <tr key={r.mes} className="pnl-row" style={{ height: 45.39 }}>
                <td style={{ ...TD, color: INK }}>{r.mes}</td>
                <td style={{ ...TD, textAlign: "right", color: INK, fontWeight: 500 }}>{r.canon}</td>
                <td style={{ ...TD, textAlign: "right", color: MUTED }}>{r.hon}</td>
                <td style={{ ...TD, textAlign: "right", color: INK, fontWeight: 600 }}>{r.neto}</td>
                <td style={{ ...TD, textAlign: "right" }}><Tag label={r.tag} tone={r.tone} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <In x={23} y={250.79} w={1558} h={56.39} delay={0.2} dy={10}>
          <div className="absolute inset-0" style={{ borderRadius: 10, background: "rgba(95,107,62,0.07)", border: "1px solid rgba(95,107,62,0.14)" }} />
          <span className="absolute" style={{ left: 18, top: 20, color: VERD }}><Ico name="approvals" size={18} /></span>
          <p className="absolute m-0" style={{ left: 47, top: 18, width: 1000, fontSize: 13, lineHeight: "20.4px", fontWeight: 300, color: MUTED }}>
            Conoces el honorario de administración antes de cada periodo. El neto se consigna a tu cuenta dentro de los primeros 5 días de cada mes.
          </p>
        </In>
      </Card>

      {/* ── Documentos de la operación (600:2546) ── */}
      <Card x={0} y={1877.39} w={1604} h={278.4} delay={0.06}>
        <Eyebrow x={23} y={28}>Documentos de la operación</Eyebrow>
        {DOCS.map((d, i) => <DocRow key={d.name} {...d} w={1558} first={i === 0} delay={0.05 + i * 0.05} />)}
      </Card>
    </>
  );
}
