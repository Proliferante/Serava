"use client";

import { motion } from "framer-motion";
import PrediosNav from "@/components/predios/PrediosNav";
import Footer from "@/components/sections/Footer";
import { Band, BROWN, Cifra, Crece, CREAM, EASE, Entra, HAIRLINE, HeroFicha, Reveal, StrokeIcon, TabsFicha, Termo, Traza } from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA PREDIO · FINANZAS — frames 729:3168 y 766:3638 de Figma.

   El rediseño parte la pestaña en dos. Arriba, «Lo esencial, en segundos»:
   una cifra grande, cuatro tarjetas y el termómetro de precio, que es todo lo
   que hace falta para decidir si la oportunidad interesa (1920 × 1847).
   Debajo, tras el botón, la ficha técnica completa: rentabilidad detallada,
   contexto de mercado, composición del costo, escenarios de TIR, comparación
   con alternativas, la proyección año a año y los costos de salida
   (1920 × 4165).

   El despliegue cambia el alto del lienzo, así que el estado vive fuera, en
   `FinanzasCanvas`: es quien puede pasarle la altura nueva a `ScaledCanvas`.

   Las bandas van a x = −1 y 1921 de ancho, como en el frame: sobresalen un
   píxel por cada lado para que el redondeo de las esquinas no deje ver el
   fondo de la página en el borde.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo con la ficha técnica plegada y desplegada. */
export const ALTO_CERRADA = 1847;
export const ALTO_ABIERTA = 4165;

/* Tintas que sólo se usan aquí. El resto viene del kit. */
const HUESO = "#faf5ea";
const ARENA = "#e7dbc2";
const TOPO = "#9d8b70";
const SOMBRA = "#7a6a52";
const TINTA = "#3a2c1c";
const VERDE = "#5f6b3e";
const HOJA = "#4a5730";
/** Relleno y filete de las tarjetas sobre banda marrón. */
const VELO = "rgba(247,241,229,0.05)";
const VELO_BORDE = "1px solid rgba(247,241,229,0.12)";

/* ── Iconos ────────────────────────────────────────────────────────────── */

const IcClock14 = () => <StrokeIcon vb={14} w={1.17} d="M7 12.25C9.8995 12.25 12.25 9.8995 12.25 7C12.25 4.10051 9.8995 1.75 7 1.75C4.10051 1.75 1.75 4.10051 1.75 7C1.75 9.8995 4.10051 12.25 7 12.25ZM7 4.08333V7L8.75 8.16667" />;
const IcInfo15 = () => <StrokeIcon vb={15} w={1.25} d="M7.5 13.75C10.9518 13.75 13.75 10.9518 13.75 7.5C13.75 4.04822 10.9518 1.25 7.5 1.25C4.04822 1.25 1.25 4.04822 1.25 7.5C1.25 10.9518 4.04822 13.75 7.5 13.75ZM7.5 10.625V7.5M7.5 4.6875H7.50625" />;
const IcChevron16 = () => <StrokeIcon vb={16} w={1.6} d="M4 6L8 10.5L12 6" />;

/* ── Datos ─────────────────────────────────────────────────────────────── */

/** Las cuatro tarjetas que acompañan a la cifra grande del resumen. */
export const ESENCIAL = [
  { left: 405.9, top: 20, h: 112.4, t: "Renta mensual estimada", v: "$18,6M", vSize: 30.4, vLh: 31.92, vTop: 40.49, note: "arriendo remodelado de referencia", nTop: 75.41 },
  { left: 760.95, top: 20, h: 112.4, t: "Rentabilidad anual neta", v: "4,6%", vSize: 30.4, vLh: 31.92, vTop: 40.49, note: "yield neto sobre el All-in", nTop: 75.41 },
  { left: 405.9, top: 148.98, h: 113.22, t: "Rango de inversión", v: "$3.100M–$3.450M", vSize: 24, vLh: 25.2, vTop: 41.5, note: "monto de entrada", nTop: 69.5 },
  { left: 760.95, top: 148.98, h: 112.41, t: "Colocación en arriendo", v: "~30 días", vSize: 30.4, vLh: 31.92, vTop: 40.5, note: "tiempo promedio en la zona", nTop: 75.42, reloj: true },
];

/** Renta neta acumulada: barras verdes. `x`/`w` y alto salen del frame. */
export const RENTA = [
  { x: 211, w: 70, h: 27, label: "$158M", lx: 204, ly: 202, lw: 68 },
  { x: 378, w: 70, h: 53, label: "$316M", lx: 378, ly: 176, lw: 68 },
  { x: 545, w: 70, h: 80, label: "$474M", lx: 544, ly: 149, lw: 70 },
  { x: 712, w: 70, h: 106, label: "$632M", lx: 712, ly: 123, lw: 71 },
  { x: 857, w: 80, h: 133, label: "$790M", lx: 861, ly: 99, lw: 71 },
];

/** Valor del activo: la línea y sus puntos, en coordenadas del área del gráfico. */
export const VALOR = [
  { x: 66.4, y: 123.43, label: "$3,776 M", lx: 32.53, ly: 96.41, lw: 69 },
  { x: 233.44, y: 106.55, label: "$3,919 M", lx: 199.57, ly: 79.53, lw: 69 },
  { x: 400.48, y: 89.02, label: "$4,068 M", lx: 364.54, ly: 61.99, lw: 72 },
  { x: 567.52, y: 70.82, label: "$4,223 M", lx: 532.27, ly: 43.79, lw: 71 },
  { x: 734.56, y: 51.95, label: "$4,383 M", lx: 700.31, ly: 24.93, lw: 71 },
  { x: 901.6, y: 32.21, label: "$4,551 M", lx: 867.74, ly: 5.18, lw: 69 },
];

const ANIOS = [45.35, 212.46, 378.12, 546.47, 713.51, 880.55];

/**
 * Cascada de la composición del costo. Todo en % del área del gráfico, como
 * lo entrega el frame: cinco columnas, la última partida en dos para que se
 * vea de dónde sale el valor creado.
 */
const COSTO = [
  { x: 6.97, w: 11.82, top: 35.61, bottom: 14.5, c: "#5b4633", v: "$2.600M", vTop: 27.6, vx: 8.51, vw: 8.68, t: "Precio", tx: 10.53, tw: 4.79 },
  { x: 25.15, w: 11.82, top: 20.27, bottom: 64.39, c: "#8f6740", v: "$800M", vTop: 12.25, vx: 27.43, vw: 7.08, t: "Remod.", tx: 28.18, tw: 5.85 },
  { x: 43.33, w: 11.82, top: 19.31, bottom: 79.73, c: "#c9a877", v: "$50M", vTop: 11.3, vx: 46.36, vw: 5.85, t: "Otros", tx: 47.2, tw: 4.07 },
  { x: 65.15, w: 11.82, top: 19.31, bottom: 14.5, c: "#3d2c1e", v: "$3.450M", vTop: 11.3, vx: 66.49, vw: 8.86, t: "All-in", tx: 69.01, tw: 4.08 },
  { x: 84.85, w: 11.81, top: 13.05, bottom: 14.5, c: "#7d8a54", v: "", vTop: 0, vx: 0, vw: 0, t: "Mercado", tx: 87.35, tw: 6.91 },
];

/** Enlaces punteados entre el techo de una columna y el suelo de la siguiente. */
const COSTO_LINKS = [
  { x: 18.79, w: 6.36, top: 35.61 },
  { x: 36.97, w: 6.36, top: 20.27 },
  { x: 55.15, w: 10, top: 19.31 },
];

export const ESCENARIOS = [
  { v: "9,0%", t: "Conservador", h: 106.39, from: "#c2b49b", to: "#a8967a" },
  { v: "12,5%", t: "Base", h: 121.77, from: "#7d97a6", to: "#5e7a8a" },
  { v: "16,0%", t: "Óptimo", h: 121.77, from: "#8a9a5f", to: VERDE },
];

export const ALTERNATIVAS: { t: string; v: string; verde?: boolean }[] = [
  { t: "ZEQUARA · TIR base", v: "~12,5%", verde: true },
  { t: "ZEQUARA · TIR óptimo", v: "~16,0%", verde: true },
  { t: "CDT / renta fija vigente", v: "~10,5%" },
];

/** Proyección año a año. La última fila va resaltada, como en el frame. */
export const TABLA = [
  ["0", "$3.776M", "$0", "$3.776M", "—"],
  ["1", "$3.919M", "$158M", "$4.077M", "4,6%"],
  ["2", "$4.068M", "$316M", "$4.384M", "4,7%"],
  ["3", "$4.223M", "$474M", "$4.697M", "4,8%"],
  ["4", "$4.383M", "$632M", "$5.015M", "4,9%"],
  ["5", "$4.551M", "$790M", "$5.341M", "5,0%"],
];

const TABLA_COLS = [49.25, 112.2, 104.81, 98.91, 58.39];
export const TABLA_HEAD = ["Año", "Valor activo", "Renta acum.", "Patrimonio", "Yield"];

export const LIQUIDEZ = [
  { t: "Payback (solo renta)", v: "~22 años" },
  { t: "Payback con valorización", v: "~5 años" },
];

export const SALIDA = [
  { t: "Comisión de venta (~3%)", v: "~$113M", pie: "" },
  { t: "Impuesto de venta", v: "Según ganancia", pie: "ganancia ocasional u otros aplicables" },
];

/* ── Piezas ────────────────────────────────────────────────────────────── */

/** Tarjeta clara de dato suelto: rótulo, cifra y pie. La del resumen. */
function CardClara({ c, i }: { c: (typeof ESENCIAL)[number]; i: number }) {
  return (
    <Reveal left={c.left} top={c.top} width={339.05} height={c.h} delay={0.1 + i * 0.07}>
      <div className="relative size-full" style={{ backgroundColor: HUESO, border: `1px solid ${HAIRLINE}`, borderRadius: 14 }}>
        <div className="absolute flex items-center gap-[6px]" style={{ left: 18, top: 18.5 }}>
          {c.reloj && <span className="shrink-0" style={{ color: BROWN }}><IcClock14 /></span>}
          <span className="whitespace-nowrap font-semibold" style={{ fontSize: 15, lineHeight: "16.8px", color: BROWN }}>{c.t}</span>
        </div>
        <Cifra v={c.v} dur={1} className="absolute whitespace-nowrap font-semibold" style={{ left: 18, top: c.vTop, fontSize: c.vSize, lineHeight: `${c.vLh}px`, color: "#3d2c1e" }} />
        <span className="absolute whitespace-nowrap" style={{ left: 18, top: c.nTop, fontSize: 15, lineHeight: "17.28px", color: TOPO }}>{c.note}</span>
      </div>
    </Reveal>
  );
}

/** Tarjeta de dato sobre banda marrón. Se repite en media ficha técnica. */
function Mini({
  left, top, width, height, t, v, pie, vc = ARENA, bg, delay = 0,
}: {
  left: number; top: number; width: number; height: number;
  t: string; v: string; pie?: string; vc?: string; bg?: string; delay?: number;
}) {
  return (
    <Reveal left={left} top={top} width={width} height={height} delay={delay}>
      <div
        className="relative size-full"
        style={{ backgroundColor: bg ? undefined : VELO, backgroundImage: bg, border: VELO_BORDE, borderRadius: 12 }}
      >
        <span className="absolute" style={{ left: 20, right: 20, top: 17, fontSize: 15, lineHeight: "17.28px", color: "rgba(247,241,229,0.7)" }}>{t}</span>
        <Cifra v={v} dur={1} className="absolute whitespace-nowrap font-semibold" style={{ left: 20, top: 34, fontSize: 30, lineHeight: "43.2px", color: vc }} />
        {pie && <span className="absolute" style={{ left: 20, right: 20, top: 80, fontSize: 11.5, lineHeight: "17.28px", color: "rgba(247,241,229,0.7)" }}>{pie}</span>}
      </div>
    </Reveal>
  );
}

/** Título de bloque dentro de la ficha técnica. */
function FtTitle({ left, top, dark = false, children }: { left: number; top: number; dark?: boolean; children: React.ReactNode }) {
  return (
    <motion.h3
      className="absolute whitespace-nowrap font-semibold"
      style={{ left, top, fontSize: 40, lineHeight: "41.47px", letterSpacing: -0.384, color: dark ? BROWN : ARENA }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {children}
    </motion.h3>
  );
}

/**
 * Gráfico de la proyección a 5 años: barras de renta acumulada y, encima, la
 * línea del valor del activo. Está rehecho con elementos en vez de con el SVG
 * exportado porque Figma lo parte en veintitantas imágenes sueltas; las
 * coordenadas son las mismas del frame, sobre un área de 968 × 289.
 */
export function Proyeccion() {
  const puntos = VALOR.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <div className="relative overflow-hidden" style={{ width: 968, height: 289 }}>
      {/* Eje */}
      <span className="absolute" style={{ left: 55.33, top: 255.91, width: 868.39, height: 1, backgroundColor: "rgba(60,45,30,0.15)" }} />

      {RENTA.map((b, i) => (
        <Crece key={b.label} delay={0.1 + i * 0.08} dur={0.7} className="absolute" style={{ left: b.x, top: 256 - b.h, width: b.w, height: b.h, borderRadius: 6, backgroundColor: "#7d8a54" }} />
      ))}
      {RENTA.map((b) => (
        <Cifra key={`l${b.label}`} v={b.label} dur={0.8} className="absolute block text-center font-bold" style={{ left: b.lx, top: b.ly, width: b.lw, fontSize: 20, lineHeight: "24px", color: BROWN }} />
      ))}

      <svg className="pointer-events-none absolute inset-0" width={968} height={289} viewBox="0 0 968 289" fill="none" aria-hidden>
        {/* La linea se traza de izquierda a derecha, y cada punto asoma cuando
            el trazo acaba de pasar por el. 900 es holgura sobre la longitud
            real del camino (~840); lo que sobra sólo alarga el guion oculto. */}
        <Traza d={`M${puntos.replace(/ /g, " L")}`} largo={900} dur={1.3} delay={0.25} stroke="#8f6740" strokeWidth={1.73} />
        {VALOR.map((p, i) => (
          <motion.ellipse
            key={p.label}
            cx={p.x} cy={p.y} rx={5.53} ry={4.41} fill="#8f6740"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.3, delay: 0.35 + i * 0.2, ease: EASE }}
            style={{ transformOrigin: `${p.x}px ${p.y}px` }}
          />
        ))}
      </svg>

      {VALOR.map((p, i) => (
        <motion.span
          key={`l${p.label}`}
          className="absolute text-center font-bold"
          style={{ left: p.lx, top: p.ly, width: p.lw, fontSize: 15, lineHeight: "18px", color: "#3d2c1e" }}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, delay: 0.45 + i * 0.2, ease: EASE }}
        >
          {p.label}
        </motion.span>
      ))}

      {ANIOS.map((x, i) => (
        <span key={x} className="absolute text-center" style={{ left: x, top: 264.73, width: 43, fontSize: 15, lineHeight: "23px", color: "#94836b" }}>Año {i}</span>
      ))}
    </div>
  );
}

/**
 * Cascada de la composición del costo, sobre un área de 566,43 × 224,05.
 * Cada columna crece desde el suelo y el enlace punteado con la siguiente se
 * dibuja después: así se lee como una suma y no como cinco barras sueltas.
 */
export function Cascada({ w, h }: { w: number | string; h: number }) {
  return (
    <div className="relative" style={{ width: w, height: h }}>
      <span className="absolute" style={{ left: "4.55%", right: "1.52%", top: "85.5%", height: 1, backgroundColor: "rgba(60,45,30,0.15)" }} />

      {COSTO.map((c, i) => (
        <Crece
          key={c.t}
          delay={0.08 + i * 0.12}
          dur={0.6}
          className="absolute"
          style={{ left: `${c.x}%`, width: `${c.w}%`, top: `${c.top}%`, bottom: `${c.bottom}%`, backgroundColor: c.c, borderRadius: 3 }}
        />
      ))}
      {/* El tramo de valor creado, encima de la columna de mercado. */}
      <Crece
        delay={0.08 + 4 * 0.12}
        dur={0.6}
        className="absolute"
        style={{ left: "84.85%", width: "11.81%", top: "13.05%", bottom: "80.69%", backgroundColor: VERDE, borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
      />

      {COSTO_LINKS.map((l, i) => (
        <motion.span
          key={l.x}
          className="absolute"
          style={{ left: `${l.x}%`, width: `${l.w}%`, top: `${l.top}%`, height: 1, borderTop: "1px dashed rgba(60,45,30,0.35)", transformOrigin: "left center" }}
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.24 + i * 0.12, ease: EASE }}
        />
      ))}

      {COSTO.filter((c) => c.v).map((c, i) => (
        <Cifra
          key={c.v}
          v={c.v}
          dur={0.8}
          className="absolute block text-center font-bold"
          style={{ left: `${c.vx}%`, width: `${c.vw + 8}%`, top: `${c.vTop}%`, fontSize: 11.12, lineHeight: "14px", color: TINTA }}
        />
      ))}
      <Cifra v="+$326M" dur={0.8} className="absolute block text-center font-bold" style={{ left: "82.89%", width: "17%", top: "5.23%", fontSize: 10.69, lineHeight: "14px", color: HOJA }} />

      {COSTO.map((c) => (
        <span key={`t${c.t}`} className="absolute block text-center" style={{ left: `${c.tx - 3}%`, width: `${c.tw + 6}%`, top: "90.84%", fontSize: 8.55, lineHeight: "11px", color: SOMBRA }}>{c.t}</span>
      ))}
    </div>
  );
}

/** Fila de tabla. `cols` da los anchos; la última fila puede ir resaltada. */
function Fila({
  cells, cols, top, alto, cabecera = false, resalte = false, dark = false, delay = 0,
}: {
  cells: string[]; cols: number[]; top: number; alto: number;
  cabecera?: boolean; resalte?: boolean; dark?: boolean; delay?: number;
}) {
  const filete = dark ? "rgba(247,241,229,0.12)" : "rgba(60,45,30,0.08)";
  const tinta = resalte ? VERDE : dark ? "rgba(247,241,229,0.85)" : TINTA;
  let x = 0;
  return (
    <motion.div
      className="absolute left-0 right-0"
      style={{ top, height: alto, borderBottom: `1px solid ${filete}`, backgroundColor: resalte ? "#e2e7d1" : undefined }}
      initial={{ opacity: 0, x: 14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
    >
      {cells.map((c, i) => {
        const left = x;
        x += cols[i];
        return (
          <span
            key={`${c}-${i}`}
            className="absolute whitespace-nowrap"
            style={{
              left: left + 10, width: cols[i] - 20, top: cabecera ? 9.5 : 9.5,
              textAlign: i === 0 ? "left" : "right",
              fontSize: cabecera ? 10.2 : 13.6,
              lineHeight: cabecera ? "15.36px" : "20.4px",
              letterSpacing: cabecera ? 0.41 : undefined,
              textTransform: cabecera ? "uppercase" : undefined,
              fontWeight: cabecera || resalte ? 600 : 400,
              color: cabecera ? (dark ? "rgba(247,241,229,0.85)" : TOPO) : tinta,
            }}
          >
            {c}
          </span>
        );
      })}
    </motion.div>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

export default function Finanzas({ abierta, onToggle }: { abierta: boolean; onToggle: () => void }) {
  /* La columna de contenido de la ficha: 1100 px centrados en el lienzo. */
  const COL = 411;

  return (
    <div className="relative size-full" style={{ backgroundColor: CREAM }}>
      {/* ── Nav ── */}
      <div className="absolute left-0 top-0 w-full" style={{ height: 74.81, backgroundColor: BROWN, zIndex: 30 }}>
        {/* El frame sube la barra 7 px respecto al borde de la página. */}
        <div className="absolute left-0 w-full" style={{ top: -7 }}><PrediosNav active="predios" geo="ficha" /></div>
      </div>

      {/* ── Hero ── */}
      <section className="absolute overflow-hidden" style={{ left: -1, top: 75, width: 1920, height: 540, backgroundColor: BROWN, borderBottomLeftRadius: 60, zIndex: 20 }}>
        <HeroFicha
          contentTop={-40}
          veil={{ top: 1, height: 540 }}
          sidebar={{ left: 1523, top: 28 }}
          specs={{ left: 161, top: 351 }}
          termo={{ left: 161, top: 292 }}
          priority
        />
      </section>

      {/* ── Pestañas ── */}
      <div className="absolute left-0 w-full" style={{ top: 568, zIndex: 19 }}><TabsFicha active="finanzas" /></div>

      {/* ── Lo esencial, en segundos ── */}
      <Band left={-1} width={1921} top={710} height={773} bg={CREAM} corner="bl" z={18}>
        <h2 className="absolute font-semibold" style={{ left: COL, top: 74, fontSize: 60, lineHeight: "41.47px", letterSpacing: -0.384, color: BROWN }}>Lo esencial, en segundos</h2>
        <p className="absolute whitespace-nowrap font-light" style={{ left: COL, top: 150, fontSize: 20, lineHeight: "22px", color: SOMBRA }}>
          Las cifras que definen la oportunidad. Para el análisis completo, abre la ficha técnica.
        </p>

        {/* Todo lo de abajo cuelga de la columna, en coordenadas del frame. */}
        <div className="absolute" style={{ left: COL, top: 179, width: 1100, height: 535 }}>
          {/* La cifra que manda */}
          <Reveal left={0} top={20} width={389.9} height={263.52} delay={0.04}>
            <div className="relative size-full" style={{ backgroundColor: "#7f8b57", borderRadius: 16 }}>
              <span className="absolute" style={{ left: 26, right: 26, top: 38.64, fontSize: 20, lineHeight: "19.2px", color: "rgba(247,241,229,0.8)" }}>Retorno total acumulado</span>
              <Cifra v="54,4%" dur={1.5} className="absolute whitespace-nowrap font-bold" style={{ left: 26, top: 66.64, fontSize: 64, lineHeight: "64px", color: ARENA }} />
              <span className="absolute" style={{ left: 26, right: 26, top: 138.64, fontSize: 20, lineHeight: "19.2px", color: "rgba(247,241,229,0.85)" }}>a 5 años · sobre el capital invertido</span>
              <motion.span
                className="absolute flex items-center whitespace-nowrap font-semibold"
                style={{ left: 26, top: 191.64, height: 32.23, padding: "0 13px", borderRadius: 999, backgroundColor: "rgba(247,241,229,0.14)", fontSize: 20, lineHeight: "18.24px", color: ARENA }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
              >
                TIR ~12,5% E.A. · vs. 10,5% CDT
              </motion.span>
            </div>
          </Reveal>

          {ESENCIAL.map((c, i) => <CardClara key={c.t} c={c} i={i} />)}

          {/* Posición en el rango de precios de mercado */}
          <Reveal left={0} top={300.01} width={1100} height={150} delay={0.32}>
            <div className="relative size-full" style={{ backgroundColor: HUESO, border: `1px solid ${HAIRLINE}`, borderRadius: 14 }}>
              <span className="absolute" style={{ left: 18, top: 18, fontSize: 20, lineHeight: "16.8px", color: SOMBRA }}>Posición en el rango de precios de mercado ($/m²)</span>
              <div className="absolute" style={{ left: 18, top: 67 }}>
                <Termo width={1061.95} pos={15.86} label="Este activo · $8,1M" min="$7,5M" max="Mercado remodelado $12M" delay={0.1} />
              </div>
              <span className="absolute" style={{ left: 11, top: 115, fontSize: 11.5, lineHeight: "17.28px", color: TOPO }}>Entramos por debajo del mercado: margen de valorización desde la compra.</span>
            </div>
          </Reveal>

          {/* El botón que despliega la ficha técnica */}
          <Entra delay={0.4} className="absolute" style={{ left: -7, top: 486, width: 1100 }}>
            <div className="flex w-full justify-center">
              <button
                type="button"
                onClick={onToggle}
                aria-expanded={abierta}
                className="ix-press flex items-center gap-[9px] font-semibold"
                style={{ height: 49, padding: "0 24px", borderRadius: 999, backgroundColor: "#3d2c1e", fontSize: 14.4, color: ARENA }}
              >
                {abierta ? "Ocultar la ficha técnica" : "Ver ficha técnica completa"}
                <motion.span className="flex shrink-0" animate={{ rotate: abierta ? 180 : 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  <IcChevron16 />
                </motion.span>
              </button>
            </div>
          </Entra>
        </div>
      </Band>

      {/* ── Ficha técnica completa ──────────────────────────────────────────
          La caja envolvente no ocupa: sólo agrupa para que todo entre junto y
          quede por debajo de la banda del resumen y por encima de nada. */}
      {abierta && (
        <motion.div
          style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, zIndex: 13 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        >
          {/* ── Rentabilidad detallada + Contexto de mercado ── */}
          <Band left={-1} width={1921} top={1405} height={510} bg={BROWN} corner="br" z={17}>
            <FtTitle left={COL} top={128}>Rentabilidad detallada</FtTitle>
            <Mini left={COL} top={173} width={262} height={140} t="Gastos estimados anuales" v="$14M" pie="admin., predial, seguros" delay={0.06} />
            <Mini
              left={COL + 278} top={173} width={262} height={140}
              t="TIR a 5 años" v="~12,5%" pie="efectivo anual" delay={0.12}
              bg="linear-gradient(151.696deg, rgba(127,139,87,0.4) 0%, rgba(95,107,62,0.3) 100%)"
            />

            <FtTitle left={COL + 560} top={128}>Contexto de mercado</FtTitle>
            <Reveal left={COL + 560} top={173} width={540} height={254} delay={0.1}>
              <div className="relative size-full" style={{ backgroundColor: VELO, border: VELO_BORDE, borderRadius: 16 }}>
                <span className="absolute" style={{ left: 22, right: 22, top: 24, fontSize: 15, lineHeight: "17.28px", color: "rgba(247,241,229,0.7)" }}>Rango de arriendo mensual (320 m²)</span>
                {/* 70 y no 55: la marca del termómetro cuelga 26 px por encima
                    del carril y a 55 se comía el rótulo. */}
                <div className="absolute" style={{ left: 22, top: 70 }}>
                  <Termo
                    width={496} pos={51.8} label="Mediana $18,6M" min="Mín $16M" max="Máx $21M"
                    grad="linear-gradient(90deg, #8a9a5f 0%, #c9a877 100%)"
                    mark={ARENA} labelColor={ARENA} endsColor="rgba(247,241,229,0.6)" delay={0.14}
                  />
                </div>
                <div className="absolute" style={{ left: 22, top: 122, width: 496, height: 118, backgroundColor: VELO, border: VELO_BORDE, borderRadius: 12 }}>
                  <span className="absolute" style={{ left: 20, right: 20, top: 17, fontSize: 15, lineHeight: "17.28px", color: "rgba(247,241,229,0.7)" }}>Tasa de vacancia estimada</span>
                  <Cifra v="~4%" dur={1} className="absolute whitespace-nowrap font-semibold" style={{ left: 20, top: 34, fontSize: 30, lineHeight: "43.2px", color: ARENA }} />
                  <span className="absolute" style={{ left: 20, top: 80, fontSize: 11.5, lineHeight: "17.28px", color: "rgba(247,241,229,0.7)" }}>de la zona</span>
                </div>
              </div>
            </Reveal>
          </Band>

          {/* ── Composición del costo ── */}
          <Band left={-1} width={1921} top={1715} height={719} bg={CREAM} corner="bl" z={16}>
            <FtTitle left={COL} top={265} dark>Composición del costo</FtTitle>

            <Reveal left={COL} top={347} width={610.43} height={287.61} delay={0.04}>
              <div className="relative size-full" style={{ backgroundColor: HUESO, border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
                <div className="absolute overflow-hidden" style={{ left: 22, top: 20 }}>
                  <Cascada w={566.43} h={224.05} />
                </div>
              </div>
            </Reveal>

            <div className="absolute" style={{ left: COL + 638, top: 347, width: 469.57, height: 288.69 }}>
              {[
                { t: "Costo total (All-in)", v: "$3.450M", badge: "$10,8M / m²", vc: "#3d2c1e" },
                { t: "Media mercado remodelado", v: "$3.776M", badge: "$11,8M / m²", vc: "#3d2c1e" },
              ].map((c, i) => (
                <Reveal key={c.t} left={i * 242.8} top={0} width={226.8} height={124.26} delay={0.08 + i * 0.07}>
                  <div className="relative size-full" style={{ backgroundColor: HUESO, border: `1px solid ${HAIRLINE}`, borderRadius: 12 }}>
                    <span className="absolute" style={{ left: 20, right: 20, top: 17, fontSize: 15, lineHeight: "17.28px", color: SOMBRA }}>{c.t}</span>
                    <Cifra v={c.v} dur={1} className="absolute whitespace-nowrap font-semibold" style={{ left: 20, top: 34, fontSize: 28.8, lineHeight: "43.2px", color: c.vc }} />
                    <span className="absolute flex items-center whitespace-nowrap font-semibold" style={{ left: 20, top: 82, height: 25, padding: "0 9px", borderRadius: 6, backgroundColor: "#e2e7d1", fontSize: 11.5, lineHeight: "17.28px", color: VERDE }}>{c.badge}</span>
                  </div>
                </Reveal>
              ))}

              {[
                { t: "Spread de valor", v: "+9%", bg: undefined as string | undefined },
                { t: "Valor creado hoy", v: "+$326M", bg: "linear-gradient(154.622deg, rgb(226,231,209) 0%, rgb(215,221,196) 100%)" },
              ].map((c, i) => (
                <Reveal key={c.t} left={i * 242.8} top={138.26} width={226.8} height={98.99} delay={0.2 + i * 0.07}>
                  <div className="relative size-full" style={{ backgroundColor: c.bg ? undefined : HUESO, backgroundImage: c.bg, border: `1px solid ${HAIRLINE}`, borderRadius: 12 }}>
                    <span className="absolute" style={{ left: 20, right: 20, top: 17, fontSize: 15, lineHeight: "17.28px", color: SOMBRA }}>{c.t}</span>
                    <Cifra v={c.v} dur={1} className="absolute whitespace-nowrap font-semibold" style={{ left: 20, top: 34, fontSize: 28.8, lineHeight: "43.2px", color: VERDE }} />
                  </div>
                </Reveal>
              ))}

              <div className="absolute flex gap-[10px]" style={{ left: 0, top: 251.25, width: 469.57 }}>
                <span className="shrink-0" style={{ marginTop: 2, color: "#a57a4e" }}><IcInfo15 /></span>
                <p className="font-light" style={{ fontSize: 12.5, lineHeight: "18.72px", color: SOMBRA }}>
                  Precio de compra $2.600M · Remodelación $800M · Otros (notariales, transacción) $50M. Cifras de referencia.
                </p>
              </div>
            </div>
          </Band>

          {/* ── Escenarios de TIR + Comparación vs. alternativas ── */}
          <Band left={-1} width={1921} top={2375} height={511} bg={BROWN} corner="br" z={15}>
            <FtTitle left={COL} top={132}>Escenarios de TIR</FtTitle>
            <Reveal left={COL} top={177} width={540} height={238.99} delay={0.04}>
              <div className="relative size-full" style={{ backgroundColor: VELO, border: VELO_BORDE, borderRadius: 16 }}>
                <div className="absolute flex items-end gap-[22px]" style={{ left: 33, top: 25.99, height: 190 }}>
                  {ESCENARIOS.map((e, i) => (
                    <div key={e.t} className="flex flex-col items-center justify-end" style={{ width: 143.33, height: 190 }}>
                      <Cifra v={e.v} dur={1} className="whitespace-nowrap font-bold" style={{ paddingBottom: 8, fontSize: 25, lineHeight: "31.2px", color: CREAM }} />
                      <Crece
                        delay={0.1 + i * 0.1}
                        dur={0.75}
                        className="w-full"
                        style={{ height: e.h, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundImage: `linear-gradient(180deg, ${e.from} 0%, ${e.to} 100%)` }}
                      />
                      <span className="whitespace-nowrap font-medium" style={{ paddingTop: 9, fontSize: 15, lineHeight: "18.24px", color: CREAM }}>{e.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <FtTitle left={COL + 560} top={132}>Comparación vs. alternativas</FtTitle>
            <Reveal left={COL + 560} top={177} width={540} height={241.73} delay={0.1}>
              <div className="relative size-full" style={{ backgroundColor: VELO, border: VELO_BORDE, borderRadius: 16 }}>
                <div className="absolute" style={{ left: 23, top: 25.99, width: 494, height: 160 }}>
                  <Fila cells={["Alternativa", "Retorno anual"]} cols={[304.05, 189.95]} top={0} alto={35.84} cabecera dark />
                  {ALTERNATIVAS.map((a, i) => (
                    <Fila key={a.t} cells={[a.t, a.v]} cols={[304.05, 189.95]} top={35.84 + i * 41.39} alto={41.39} dark delay={0.1 + i * 0.07} />
                  ))}
                </div>
                <div className="absolute flex gap-[10px]" style={{ left: 23, right: 23, top: 200 }}>
                  <span className="shrink-0" style={{ marginTop: 2, color: "#a57a4e" }}><IcInfo15 /></span>
                  <p className="font-light" style={{ fontSize: 12.5, lineHeight: "18.72px", color: "rgba(247,241,229,0.6)" }}>
                    La TIR incluye renta y valorización; el CDT es renta fija sin activo subyacente.
                  </p>
                </div>
              </div>
            </Reveal>
          </Band>

          {/* ── Proyección patrimonial detallada ── */}
          <Band left={-1} width={1921} top={2886} height={516} bg={CREAM} corner="bl" z={14}>
            <FtTitle left={COL} top={69} dark>Proyección patrimonial detallada</FtTitle>

            <Reveal left={COL} top={144} width={610.43} height={330.69} delay={0.04}>
              <div className="relative size-full" style={{ backgroundColor: HUESO, border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
                <div className="absolute flex gap-[18px]" style={{ left: 22, top: 22, height: 17.77 }}>
                  <span className="flex items-center gap-[7px]">
                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "#8f6740" }} />
                    <span style={{ fontSize: 11.8, lineHeight: "17.76px", color: SOMBRA }}>Valor del activo</span>
                  </span>
                  <span className="flex items-center gap-[7px]">
                    <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: "#7d8a54" }} />
                    <span style={{ fontSize: 11.8, lineHeight: "17.76px", color: SOMBRA }}>Renta neta acumulada</span>
                  </span>
                </div>
                {/* El gráfico es el mismo de siempre, a escala: el frame lo
                    repite tal cual dentro de una tarjeta más estrecha. */}
                <div className="absolute overflow-hidden" style={{ left: 22, top: 46, width: 566.43, height: 224.05 }}>
                  <div style={{ width: 968, height: 289, transform: "scale(0.5851)", transformOrigin: "top left" }}>
                    <Proyeccion />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal left={COL + 630.43} top={144} width={469.57} height={330.18} delay={0.1}>
              <div className="relative size-full" style={{ backgroundColor: HUESO, border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
                <div className="absolute" style={{ left: 22, top: 22, width: 425.57 }}>
                  <Fila cells={TABLA_HEAD} cols={TABLA_COLS} top={0} alto={35.84} cabecera />
                  {TABLA.map((r, i) => (
                    <Fila key={r[0]} cells={r} cols={TABLA_COLS} top={35.84 + i * 39.78} alto={39.78} resalte={i === TABLA.length - 1} delay={0.08 + i * 0.05} />
                  ))}
                </div>
              </div>
            </Reveal>
          </Band>

          {/* ── Liquidez + Costos de salida ── */}
          <Band left={-1} width={1921} top={3402} height={528} bg={BROWN} corner="br" z={13}>
            <FtTitle left={COL} top={80}>Liquidez</FtTitle>
            {LIQUIDEZ.map((m, i) => (
              <Mini key={m.t} left={COL + i * 277} top={173} width={263} height={98.77} t={m.t} v={m.v} delay={0.06 + i * 0.07} />
            ))}

            <FtTitle left={COL + 560} top={80}>Costos de salida</FtTitle>
            {SALIDA.map((m, i) => (
              <Mini key={m.t} left={COL + 560 + i * 277} top={173} width={263} height={138.3} t={m.t} v={m.v} pie={m.pie} delay={0.12 + i * 0.07} />
            ))}

            <p className="absolute font-light" style={{ left: COL, top: 339, width: 1100, fontSize: 12.5, lineHeight: "18.72px", color: "rgba(247,241,229,0.6)" }}>
              Cifras estimadas de referencia sobre supuestos de la microzona; no constituyen garantía de retorno.
            </p>
          </Band>
        </motion.div>
      )}

      {/* ── Footer ── */}
      <div className="absolute" style={{ left: 0, top: abierta ? 3801 : 1483, width: 1922, height: 364, zIndex: 21 }}><Footer /></div>
    </div>
  );
}
