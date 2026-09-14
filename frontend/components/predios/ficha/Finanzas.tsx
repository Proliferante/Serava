"use client";

import type { CSSProperties } from "react";
import CanvasImage from "@/components/CanvasImage";
import Footer from "@/components/sections/Footer";
import { Band, BROWN, CREAM, HAIRLINE, HeroFicha, IcArrowRight, Reveal } from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA PREDIO · FINANZAS — frame 729:3168 de Figma (1920 × 3947).

   Es la pestaña que absorbió la antigua página de Análisis Add Value. Las
   cuatro bandas van a x = −1 y 1921 de ancho, como en el frame: sobresalen un
   píxel por cada lado para que el redondeo de las esquinas no deje ver el
   fondo de la página en el borde.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

/* ── Iconos propios de esta pestaña ───────────────────────────────────────
   Los ocho de los KPI y los tres de las palancas vienen a 40 y 50 px con el
   mismo trazo fino; se pintan con `currentColor`. */

function Ic40({ d, s = 40, className, style }: { d: string; s?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" className={className} style={style} aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth={1.125} />
    </svg>
  );
}

function Ic50({ d, className, style }: { d: string; className?: string; style?: CSSProperties }) {
  return (
    <svg width={50} height={50} viewBox="0 0 50 50" fill="none" className={className} style={style} aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth={1.25} />
    </svg>
  );
}

const D_BARS = "M6.66667 33.3333V16.6667M16.6667 33.3333V6.66667M26.6667 33.3333V21.6667M36.6667 33.3333H3.33333";
const D_STACK = "M20 15C27.3638 15 33.3333 12.7614 33.3333 10C33.3333 7.23858 27.3638 5 20 5C12.6362 5 6.66667 7.23858 6.66667 10C6.66667 12.7614 12.6362 15 20 15ZM6.66667 10V30C6.66667 32.8333 12.6667 35 20 35C27.3333 35 33.3333 32.8333 33.3333 30V10";
const D_STAR = "M20 3.33333L24.1667 11.6667L33.3333 13L26.6667 19.5L28.3333 28.6667L20 26.3333L11.6667 30.3333L13.3333 21.1667L6.66667 14.6667L15.8333 13.3333L20 3.33333Z";
const D_HOME = "M5 35V11.6667L20 5L35 11.6667V35M15 35V25H25V35";
const D_TREND = "M5 28.3333L15 18.3333L21.6667 25L35 11.6667V5H28.3333";
const D_PCT = "M31.6667 8.33333L8.33333 31.6667M13.3333 10C13.3333 10.8841 12.9821 11.7319 12.357 12.357C11.7319 12.9821 10.8841 13.3333 10 13.3333C9.11595 13.3333 8.2681 12.9821 7.64298 12.357C7.01786 11.7319 6.66667 10.8841 6.66667 10C6.66667 9.11595 7.01786 8.2681 7.64298 7.64298C8.2681 7.01786 9.11595 6.66667 10 6.66667C10.8841 6.66667 11.7319 7.01786 12.357 7.64298C12.9821 8.2681 13.3333 9.11595 13.3333 10ZM33.3333 30C33.3333 30.8841 32.9821 31.7319 32.357 32.357C31.7319 32.9821 30.8841 33.3333 30 33.3333C29.1159 33.3333 28.2681 32.9821 27.643 32.357C27.0179 31.7319 26.6667 30.8841 26.6667 30C26.6667 29.1159 27.0179 28.2681 27.643 27.643C28.2681 27.0179 29.1159 26.6667 30 26.6667C30.8841 26.6667 31.7319 27.0179 32.357 27.643C32.9821 28.2681 33.3333 29.1159 33.3333 30Z";

const D_STAR50 = "M25 4.16667L30.2083 14.5833L41.6667 16.25L33.3333 24.375L35.4167 35.8333L25 32.9167L14.5833 37.9167L16.6667 26.4583L8.33333 18.3333L19.7917 16.6667L25 4.16667Z";
const D_TREND50 = "M6.25 35.4167L18.75 22.9167L27.0833 31.25L43.75 14.5833V6.25H35.4167";
const D_STACK50 = "M25 18.75C34.2047 18.75 41.6667 15.9518 41.6667 12.5C41.6667 9.04822 34.2047 6.25 25 6.25C15.7953 6.25 8.33333 9.04822 8.33333 12.5C8.33333 15.9518 15.7953 18.75 25 18.75ZM8.33333 12.5V37.5C8.33333 41.0417 15.8333 43.75 25 43.75C34.1667 43.75 41.6667 41.0417 41.6667 37.5V12.5";

/* ── Datos ─────────────────────────────────────────────────────────────── */

type Kpi = {
  d: string; title: string[]; value: string; note: string; delta?: string;
  /** Centro vertical de cada línea dentro de la tarjeta, tal cual el frame. */
  c: [number, number, number]; dTop?: number; iconTop: number;
};

export const KPIS: Kpi[] = [
  { d: D_BARS, title: ["Precio base / m²"], value: "$8,1M", note: "vs. media usado $8,7M", delta: "−7% por debajo", c: [94.5, 126, 156], dTop: 168, iconTop: 14 },
  { d: D_STACK, title: ["All-in Cost / m²"], value: "$10,8M", note: "vs. media remodelado $11,8M", delta: "−8% por debajo", c: [91.3, 121, 150], dTop: 167, iconTop: 14 },
  { d: D_STAR, title: ["Spread de valor"], value: "+9%", note: "Distancia All-in vs. valor de mercado", c: [99.3, 131, 161], iconTop: 14 },
  { d: D_HOME, title: ["Valor estabilizado hoy"], value: "$3.776M", note: "Media remodelado en la microzona", c: [98.3, 130, 160], iconTop: 14 },
  { d: D_TREND, title: ["Valor creado hoy"], value: "+$326M", note: "(+9% vs. All-in)", c: [101.3, 132.8, 162.8], iconTop: 13.78 },
  { d: D_PCT, title: ["Yield neto on cost"], value: "4,6%", note: "vs. yield medio 4,1%", delta: "+0,5 pp sobre la media", c: [89.1, 120.8, 150.8], dTop: 167.78, iconTop: 13.78 },
  { d: D_BARS, title: ["Valor patrimonial 5 años"], value: "$5.341M", note: "Estimado del patrimonio en el año 5", c: [98.1, 129.8, 159.8], iconTop: 13.78 },
  { d: D_TREND, title: ["Retorno patrimonial 5", "años"], value: "54,4%", note: "Sobre el capital invertido (All-in)", c: [99.78, 143.8, 174.2], iconTop: 13.78 },
];

export const LEVERS = [
  { d: D_STAR50, left: 153, top: 298, tc: 66, tcx: 217, peso: "25%", pesoLeft: 397, pesoTop: 41, t: "Spread de valor", p: "La propiedad se adquiere por debajo del valor de mercado remodelado, generando un spread inicial de +9%." },
  { d: D_TREND50, left: 747, top: 299, tc: 67, tcx: 210.5, peso: "20%", pesoLeft: 395, pesoTop: 42, t: "Valorización a 5 años", p: "La microzona ha mostrado una apreciación sostenida que potencia el valor del activo en el mediano plazo." },
  { d: D_STACK50, left: 1341, top: 296, tc: 71, tcx: 232, peso: "10%", pesoLeft: 400, pesoTop: 41, t: "Carry / renta neta", p: "El arriendo genera una renta neta estable que actúa como carry durante el periodo de inversión." },
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

export const SAYS = [
  { t: "Funciona con el precio actual", p: "Incluso sin negociar, el retorno proyectado es atractivo.", pTop: 88 },
  { t: "Hay spread antes de negociar", p: "Se adquiere por debajo del valor remodelado, con +9% de margen.", pTop: 87 },
  { t: "El arriendo actúa como carry", p: "La renta neta aporta al retorno total durante todo el periodo.", pTop: 90 },
  { t: "El horizonte potencia el resultado", p: "Renta más valorización generan +54,4% en el patrimonio.", pTop: 90 },
];

/* ── Piezas ────────────────────────────────────────────────────────────── */

function KpiCard({ k }: { k: Kpi }) {
  return (
    <div className="relative" style={{ width: 353.5, height: 202, backgroundColor: BROWN, borderRadius: 20 }}>
      <div className="absolute flex items-center justify-center" style={{ left: 146.5, top: k.iconTop, width: 60, height: 60, borderRadius: 30, backgroundColor: "#efe9dc", color: "#a57a4e" }}>
        <Ic40 d={k.d} />
      </div>
      <p className="absolute text-center font-bold" style={{ left: 20, right: 20, top: k.c[0] - (k.title.length > 1 ? 24 : 9.12), fontSize: 23, lineHeight: k.title.length > 1 ? "24px" : "18.24px", color: "#7f8b57" }}>
        {k.title[0]}{k.title[1] && <><br />{k.title[1]}</>}
      </p>
      <p className="absolute text-center font-semibold" style={{ left: 20, right: 20, top: k.c[1] - 16, fontSize: 32, lineHeight: "32px", color: "#dfc59f" }}>{k.value}</p>
      <p className="absolute text-center" style={{ left: 20, right: 20, top: k.c[2] - 8.64, fontSize: 13, lineHeight: "17.28px", color: "#f7f1e5" }}>{k.note}</p>
      {k.delta && (
        <span
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-semibold"
          style={{ top: k.dTop, padding: "3px 9px", borderRadius: 7, backgroundColor: "#e4e8d5", fontSize: 12.5, lineHeight: "18.72px", color: "#5f6b3e" }}
        >
          {k.delta}
        </span>
      )}
    </div>
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

      {RENTA.map((b) => (
        <span key={b.label} className="absolute" style={{ left: b.x, top: 256 - b.h, width: b.w, height: b.h, borderRadius: 6, backgroundColor: "#7d8a54" }} />
      ))}
      {RENTA.map((b) => (
        <span key={`l${b.label}`} className="absolute text-center font-bold" style={{ left: b.lx, top: b.ly, width: b.lw, fontSize: 20, lineHeight: "24px", color: BROWN }}>{b.label}</span>
      ))}

      <svg className="pointer-events-none absolute inset-0" width={968} height={289} viewBox="0 0 968 289" fill="none" aria-hidden>
        <polyline points={puntos} stroke="#8f6740" strokeWidth={1.73} strokeLinejoin="round" fill="none" />
        {VALOR.map((p) => (
          <ellipse key={p.label} cx={p.x} cy={p.y} rx={5.53} ry={4.41} fill="#8f6740" />
        ))}
      </svg>

      {VALOR.map((p) => (
        <span key={`l${p.label}`} className="absolute text-center font-bold" style={{ left: p.lx, top: p.ly, width: p.lw, fontSize: 15, lineHeight: "18px", color: "#3d2c1e" }}>{p.label}</span>
      ))}

      {ANIOS.map((x, i) => (
        <span key={x} className="absolute text-center" style={{ left: x, top: 264.73, width: 43, fontSize: 15, lineHeight: "23px", color: "#94836b" }}>Año {i}</span>
      ))}
    </div>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

export default function Finanzas() {
  return (
    /* El fondo crema lo pone el shell; ver el comentario de Oportunidad. */
    <div className="relative size-full">
      {/* ── Hero ── */}
      <section className="absolute overflow-hidden" style={{ left: -1, top: 73, width: 1920, height: 542, backgroundColor: BROWN, borderBottomLeftRadius: 60, zIndex: 6 }}>
        <HeroFicha
          height={542}
          contentTop={-32}
          veil={{ top: 0, height: 558 }}
          sidebar={{ left: 1540, top: 22 }}
          sub={{ text: "Ubicación privilegiada. Metraje único. Una oportunidad excepcional en la microzona más sólida de Bogotá." }}
          cta={{ label: "Ver galería", href: "#galeria" }}
          priority
        />
      </section>

      {/* ── Indicadores de valor patrimonial ── */}
      <Band left={-1} width={1921} top={710} height={683} bg={CREAM} corner="bl" z={4}>
        <h2 className="absolute font-medium" style={{ left: 249, top: 67, fontSize: 60, lineHeight: "38px", letterSpacing: -0.352, color: "#3d2c1e" }}>Indicadores de valor patrimonial</h2>
        <p className="absolute font-light" style={{ left: 249, top: 135, width: 1483, fontSize: 25, lineHeight: "26px", color: "#6b5b47" }}>
          Métricas clave de la oportunidad, comparadas con los promedios de su microzona. Cifras en millones de pesos (COP).
        </p>
        <Reveal left={249} top={190} width={1424} height={426} delay={0.04}>
          <div className="grid size-full grid-cols-4 gap-[2px] overflow-hidden" style={{ paddingTop: 7, backgroundColor: HAIRLINE, borderRadius: 16 }}>
            {KPIS.map((k) => <KpiCard key={k.title[0]} k={k} />)}
          </div>
        </Reveal>
      </Band>

      {/* ── Las 3 palancas de valor ── */}
      <Band left={-1} width={1921} top={1301} height={657} bg={BROWN} corner="br" z={3}>
        <h2 className="absolute font-medium" style={{ left: 246, top: 148, fontSize: 60, lineHeight: "38px", letterSpacing: -0.352, color: CREAM }}>Las 3 palancas de valor</h2>
        <p className="absolute" style={{ left: 246, top: 217.14, width: 1245, fontSize: 25, lineHeight: "18.72px", color: CREAM }}>
          Nuestra tesis de inversión se apoya en tres motores de valor, con pesos definidos en el modelo.
        </p>

        {LEVERS.map((l, i) => (
          <Reveal key={l.t} left={l.left} top={l.top} width={500} height={250} delay={0.04 + i * 0.06}>
            <div className="relative size-full" style={{ backgroundColor: "#f7edd9", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
              {/* El icono cuelga por encima del borde superior de la tarjeta. */}
              <div className="absolute flex items-center justify-center" style={{ left: 209, top: -41, width: 80, height: 80, borderRadius: 11, backgroundColor: "#b9c69f", color: "#5f6b3e" }}>
                <Ic50 d={l.d} />
              </div>
              <p className="absolute -translate-x-1/2 whitespace-nowrap text-center font-semibold" style={{ left: l.tcx, top: l.tc - 10.8, fontSize: 30, lineHeight: "21.6px", letterSpacing: -0.2, color: "#2a241c" }}>{l.t}</p>
              <span
                className="absolute flex items-center justify-center font-semibold"
                style={{ left: l.pesoLeft, top: l.pesoTop, width: 90, height: 50, borderRadius: 6, backgroundColor: "#7f8b57", fontSize: 20, letterSpacing: -0.2, color: "#f7f1e5" }}
              >
                {l.peso}
              </span>
              <p className="absolute font-light" style={{ left: 24, right: 24, top: 106.79, fontSize: 25, lineHeight: "26px", color: "#6b5b47" }}>{l.p}</p>
            </div>
          </Reveal>
        ))}
      </Band>

      {/* ── Proyección patrimonial a 5 años ── */}
      <Band left={-1} width={1921} top={1923} height={721} bg={CREAM} corner="bl" z={2}>
        <h2 className="absolute font-medium" style={{ left: 247, top: 89, fontSize: 60, lineHeight: "38px", letterSpacing: -0.352, color: "#3d2c1e" }}>Proyección patrimonial a 5 años</h2>
        <p className="absolute" style={{ left: 247, top: 158.14, width: 1225, fontSize: 25, lineHeight: "18.72px", color: "#6b5b47" }}>
          Evolución estimada del valor del activo y la renta neta acumulada. Cifras en millones (COP).
        </p>

        <Reveal left={391} top={215} width={1018} height={375} delay={0.04}>
          <div className="relative size-full" style={{ backgroundColor: "#f7edd9", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
            <div className="absolute" style={{ left: 24, top: 24, height: 18.23 }}>
              <span className="absolute" style={{ left: 29, top: 3.1, width: 12, height: 12, borderRadius: 3, backgroundColor: "#8f6740" }} />
              <span className="absolute whitespace-nowrap" style={{ left: 46, top: 0, fontSize: 15, lineHeight: "18.24px", color: "#6b5b47" }}>Valor del activo</span>
              <span className="absolute" style={{ left: 204, top: 3.1, width: 12, height: 12, borderRadius: 3, backgroundColor: "#6d774a" }} />
              <span className="absolute whitespace-nowrap" style={{ left: 221.41, top: 0, fontSize: 15, lineHeight: "18.24px", color: "#6b5b47" }}>Renta neta acumulada</span>
            </div>
            <div className="absolute" style={{ left: 24, top: 51 }}><Proyeccion /></div>
          </div>
        </Reveal>

        <p className="absolute" style={{ left: 267, top: 607, width: 1255, fontSize: 25, lineHeight: "34px", color: "#6b5b47" }}>
          Metodología: esta evaluación utiliza los supuestos de la microzona (precios, valorización y rentas). Cifras estimadas de referencia; no constituyen garantía de retorno.
        </p>
      </Band>

      {/* ── Qué nos dice esta evaluación ── */}
      <Band left={-1} width={1921} top={2556} height={511} bg={BROWN} corner="br" z={1}>
        <h2 className="absolute font-medium" style={{ left: 295, top: 163, width: 1296, fontSize: 60, lineHeight: "38px", letterSpacing: -0.352, color: CREAM }}>Qué nos dice esta evaluación</h2>
        <div className="absolute flex gap-[16px]" style={{ left: 295, top: 253, width: 1353, height: 182 }}>
          {SAYS.map((s) => (
            <div key={s.t} className="relative" style={{ width: 326.25, height: 182, backgroundColor: "#f7edd9", border: `1px solid ${HAIRLINE}`, borderRadius: 14 }}>
              <p className="absolute text-center font-medium" style={{ left: 20, right: 20, top: 25, fontSize: 25, lineHeight: "25px", letterSpacing: -0.176, color: "#2a241c" }}>{s.t}</p>
              <p className="absolute text-center font-light" style={{ left: 20, right: 20, top: s.pTop + 29 - 19.2, fontSize: 20, lineHeight: "19.2px", color: "#6b5b47" }}>{s.p}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* ── Cierre ── */}
      <Reveal left={102} top={3114} width={1749} height={422} delay={0.04}>
        <div className="relative size-full overflow-hidden" style={{ backgroundColor: BROWN, borderRadius: 20 }}>
          <div className="absolute" style={{ left: 796, top: -114, width: 1116, height: 622 }}>
            <CanvasImage src={`${A}/ficha-cta.webp`} w={1116} />
          </div>
          <div
            className="pointer-events-none absolute"
            style={{ left: 676, top: 0, width: 336, height: 422, backgroundImage: "linear-gradient(90.155deg, rgb(73,33,0) 0.169%, rgb(73,33,0) 50%, rgba(73,33,0,0.85) 74.916%, rgba(73,33,0,0) 99.831%)" }}
          />

          <h2 className="absolute font-semibold" style={{ left: 52, top: 79.81, width: 872, fontSize: 60, lineHeight: "44.93px", letterSpacing: -0.416, color: "#efe6d5" }}>Las buenas oportunidades no esperan</h2>

          {/* Tres cifras separadas por filetes verticales. */}
          <img src={`${A}/ficha-ico-users.svg`} alt="" width={50} height={50} loading="lazy" decoding="async" className="absolute max-w-none" style={{ left: 27, top: 272 }} />
          <span className="absolute whitespace-nowrap font-semibold" style={{ left: 94, top: 281, fontSize: 60, lineHeight: "36px", color: "#efe6d5" }}>3</span>
          <span className="absolute" style={{ left: 92, top: 343.6, width: 185, fontSize: 18, lineHeight: "16.8px", color: "rgba(247,241,229,0.65)" }}>inversionistas evaluando</span>

          <span className="absolute" style={{ left: 251, top: 267, width: 3, height: 111, backgroundColor: "#7f8b57" }} />

          <img src={`${A}/ficha-ico-shield.svg`} alt="" width={50} height={50} loading="lazy" decoding="async" className="absolute max-w-none" style={{ left: 288, top: 273 }} />
          <span className="absolute whitespace-nowrap font-semibold" style={{ left: 343, top: 284, fontSize: 60, lineHeight: "36px", color: "#efe6d5" }}>
            96<span className="font-light" style={{ fontSize: 40 }}>/100</span>
          </span>
          <span className="absolute whitespace-nowrap" style={{ left: 348, top: 342.1, fontSize: 18, lineHeight: "16.8px", color: "rgba(247,241,229,0.65)" }}>Score ZEQUARA</span>

          <span className="absolute" style={{ left: 534, top: 267, width: 3, height: 111, backgroundColor: "#7f8b57" }} />

          <img src={`${A}/ficha-ico-chart.svg`} alt="" width={50} height={50} loading="lazy" decoding="async" className="absolute max-w-none" style={{ left: 555, top: 270 }} />
          <span className="absolute whitespace-nowrap font-semibold" style={{ left: 605, top: 284, fontSize: 60, lineHeight: "36px", color: "#efe6d5" }}>+$326M</span>
          <span className="absolute whitespace-nowrap" style={{ left: 605, top: 340.1, fontSize: 18, lineHeight: "16.8px", color: "rgba(247,241,229,0.65)" }}>valor creado hoy</span>

          <a
            href="/solicitud-acceso"
            className="ix-press absolute flex items-center justify-center gap-[9px] font-semibold text-white"
            style={{ left: 1033, top: 311, padding: "11px 20px 12px", borderRadius: 10, backgroundColor: "#7f8b57", fontSize: 20 }}
          >
            Quiero conocer esta oportunidad
            <IcArrowRight className="shrink-0" />
          </a>
        </div>
      </Reveal>

      {/* ── Footer ── */}
      <div className="absolute" style={{ left: 0, top: 3583, width: 1922, height: 364, zIndex: 6 }}><Footer /></div>
    </div>
  );
}
