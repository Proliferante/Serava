"use client";

import { MotionConfig, animate, motion, useInView, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BloomSpin, EASE, Float, MLine, POP, Pop, Rise, Rule, useParallaxY } from "@/components/motion/Kinetics";

/* ═══════════════════════════════════════════════════════════════════════════
   OPORTUNIDADES — reproducción 1:1 del frame de Figma 311:1996 (1920 × 5701).
   Medidas, colores, degradados y assets tomados del design context de Figma;
   las coordenadas de cada sección son locales a la sección.

   El movimiento vive en components/motion/Kinetics: entradas encadenadas por
   elemento, parallax de fondos ligado al scroll y pistas de interacción en el
   comparador (halo que respira, icono que se balancea). Respeta
   prefers-reduced-motion vía <MotionConfig reducedMotion="user">.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const I = "/figma/opp";
const ADP = "/antes-despues";

/* ── Tokens ──────────────────────────────────────────────────────────────── */
const CREAM = "#e2cdae";
const LINEN = "#f7f1e5";
const BROWN = "#492100";
const BISTRE = "#3d2c1e";
const MILLBROOK = "#5b4332";
const DRIFT = "#a57a4e";
const LASER = "#c9a877";
const VERDIGRIS = "#5f6b3e";
const AVOCADO = "#7f8b57";
const OIL = "#2a1e14";

const LINEN5 = "rgba(247,241,229,0.05)";
const LINEN18 = "rgba(247,241,229,0.18)";
const LINEN72 = "rgba(247,241,229,0.72)";
const LINEN80 = "rgba(247,241,229,0.8)";
const DRIFT28 = "rgba(165,122,78,0.28)";

/* ── Primitivas ──────────────────────────────────────────────────────────── */

/** Capa absoluta con geometría explícita de Figma. */
function L({ x, y, w, h, className, style, children }: { x: number; y: number; w?: number; h?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`absolute ${className ?? ""}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

/**
 * Nodo de texto de Figma: centrado verticalmente sobre `cy`. `d` añade la
 * entrada sin tocar el `translateY(-50%)` que fija la posición.
 */
function T({
  x, cy, w, className, style, d, ry = 24, amount = 0.4, children,
}: { x: number; cy: number; w?: number; className?: string; style?: CSSProperties; d?: number; ry?: number; amount?: number; children: ReactNode }) {
  return (
    <div
      className={`absolute flex flex-col justify-center ${className ?? ""}`}
      style={{ left: x, top: cy, width: w, transform: "translateY(-50%)", ...style }}
    >
      {d === undefined ? children : (
        <motion.div
          initial={{ opacity: 0, y: ry }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount }}
          transition={{ duration: 0.72, delay: d, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

/** Icono de Figma: vectores SVG posicionados por `inset` dentro de la caja. */
function Ico({ size, layers, className, style }: { size: number; layers: [string, string, string][]; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative shrink-0 overflow-hidden ${className ?? ""}`} style={{ width: size, height: size, ...style }}>
      {layers.map(([outer, inner, src], i) => (
        <div key={i} className="absolute" style={{ inset: outer }}>
          <div className="absolute" style={{ inset: inner }}>
            <img alt="" src={`${I}/${src}`} className="block size-full max-w-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** `<img>` con el encuadre exacto de Figma + parallax vertical opcional. */
function ParImg({ src, style, par = 0, over, alt = "", eager }: { src: string; style: CSSProperties; par?: number; over?: number; alt?: string; eager?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const py = useParallaxY(ref, par);
  return (
    <motion.img
      ref={ref}
      alt={alt}
      src={`${A}/${src}`}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className="absolute max-w-none object-cover"
      style={{ ...style, scale: over, y: par ? py ?? 0 : 0 }}
    />
  );
}

/** Nodo de imagen de Figma: caja recortada + `<img>` con el encuadre exacto. */
function Pic({
  x, y, w, h, radius, src, alt, crop, delay = 0, par = 0, over, fade = true,
}: { x: number; y: number; w: number; h: number; radius?: string; src: string; alt: string; crop?: CSSProperties; delay?: number; par?: number; over?: number; fade?: boolean }) {
  const img = <ParImg src={src} alt={alt} par={par} over={over} style={crop ?? { inset: 0, width: "100%", height: "100%" }} />;
  const box: CSSProperties = { left: x, top: y, width: w, height: h, borderRadius: radius };
  if (!fade) return <div className="pointer-events-none absolute overflow-hidden" style={box}>{img}</div>;
  return (
    <motion.div
      className="pointer-events-none absolute overflow-hidden"
      style={box}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {img}
    </motion.div>
  );
}

/* ── Iconos (capas exactas de Figma) ─────────────────────────────────────── */
const IC_ARROW_CREAM: [string, string, string][] = [
  ["50% 20.83% 50% 20.83%", "-0.75px 0", "arrow-cream1.svg"],
  ["25% 20.83% 25% 54.17%", "-5.89% -23.57% -5.89% -11.79%", "arrow-cream2.svg"],
];
const IC_ARROW_DARK: [string, string, string][] = [
  ["50% 20.83% 50% 20.83%", "-0.75px 0", "arrow-dark1.svg"],
  ["25% 20.83% 25% 54.17%", "-5.89% -23.57% -5.89% -11.79%", "arrow-dark2.svg"],
];
const IC_IMG_AFTER: [string, string, string][] = [
  ["12.5% 12.5% 16.67% 12.5%", "-4.6% -3.61% -3.82% -3.61%", "img32a-1.svg"],
  ["50% 37.5% 12.5% 37.5%", "-7.22% -10.83% 0 -10.83%", "img32a-2.svg"],
];
const IC_IMG_BEFORE: [string, string, string][] = [
  ["12.5% 12.5% 16.67% 12.5%", "-4.6% -3.61% -3.82% -3.61%", "img32b-1.svg"],
  ["50% 37.5% 12.5% 37.5%", "-7.22% -10.83% 0 -10.83%", "img32b-2.svg"],
];
const IC_CHEV_L: [string, string, string][] = [["25% 37.5% 25% 37.5%", "-7.07% -14.14% -7.07% -28.28%", "chev-l.svg"]];
const IC_CHEV_R: [string, string, string][] = [["25% 37.5% 25% 37.5%", "-7.07% -28.28% -7.07% -14.14%", "chev-r.svg"]];
const IC_PIN: [string, string, string][] = [
  ["4.17% 12.5% 8.33% 12.5%", "-4.76% -5.56% -5.72% -5.56%", "pin1.svg"],
  ["29.17% 37.5% 45.83% 37.5%", "-16.67%", "pin2.svg"],
];
const IC_DRAG: [string, string, string][] = [["37.5% 16.67%", "-12% -9.38%", "drag.svg"]];
const IC_LOCK: [string, string, string][] = [
  ["41.67% 16.67% 16.67% 16.67%", "-9% -5.63%", "lock1.svg"],
  ["12.5% 33.33% 58.33% 33.33%", "-12.86% -11.25% 0 -11.25%", "lock2.svg"],
];
const IC_CHECK: [string, string, string][] = [["25% 16.67% 29.17% 16.67%", "-8.36% -5.75% -16.71% -5.75%", "check13.svg"]];
const IC_CARD: [string, string, string][][] = [
  [["8.33% 25% 8.33% 25%", "0 -7.08%", "c1.svg"]],
  [["33.33% 20.83% 12.5% 12.5%", "-9.25% -7.51% -6.54% 0", "c2.svg"]],
  [["29.17% 12.5% 25% 12.5%", "-7.73% -4.72% 0 -4.72%", "c3.svg"]],
  [["12.5%", "0 0 -4.72% -4.72%", "c4.svg"]],
];

/* ── Botón "Solicitar acceso" (Component 2 / Component 4) ────────────────── */
function CTA({ x, y, tone, d = 0 }: { x: number; y: number; tone: "olive" | "cream"; d?: number }) {
  const olive = tone === "olive";
  return (
    <Pop className="absolute" style={{ left: x, top: y }} delay={d} from={0.86} dur={0.6}>
      <a
        href="/solicitud-acceso"
        className={`ix-cta relative block overflow-hidden ${olive ? "ix-pulse-green" : "ix-pulse"}`}
        style={{
          width: 222.17, height: 58.8,
          background: olive ? AVOCADO : LINEN,
          borderRadius: 999,
          boxShadow: olive ? "0px 16px 32px -16px rgba(47,55,30,0.6)" : "0px 16px 32px -16px rgba(0,0,0,0.4)",
        }}
      >
        <T
          x={32} cy={28.5} w={130.195}
          className={`font-semibold ${olive ? "" : "text-center"}`}
          style={{ fontSize: 16, lineHeight: "24.8px", color: olive ? LINEN : OIL }}
        >
          <p>Solicitar acceso</p>
        </T>
        <Ico size={18} layers={olive ? IC_ARROW_CREAM : IC_ARROW_DARK} className="ix-cta-arrow absolute" style={{ left: 172.17, top: 20.39 }} />
        <span className="ix-cta-shine" aria-hidden />
      </a>
    </Pop>
  );
}

/* ═══════════════ Comparador antes / después (Section 2) ═══════════════════
   Estilo tomado del placeholder de Figma (311:2050); las fotos reales de
   cada proyecto reemplazan los marcadores "Foto ANTES / Foto DESPUÉS".      */

const PROY = [
  { city: "Bogotá", zone: "La Cabrera", full: "La Cabrera · Bogotá", title: "Remodelación integral ultra lujo", interv: "Integral", antes: `${ADP}/1502-sala-antes.webp`, despues: `${ADP}/1502-sala-despues.webp` },
  { city: "Medellín", zone: "El Poblado", full: "El Poblado · Medellín", title: "Cocina integral en madera", interv: "Integral", antes: `${ADP}/1601-cocina-antes.webp`, despues: `${ADP}/1601-cocina-despues.webp` },
  { city: "Bogotá", zone: "Chicó", full: "Chicó · Bogotá", title: "Baño principal en mármol", interv: "Integral", antes: `${ADP}/1502-bano-antes.webp`, despues: `${ADP}/1502-bano-despues.webp` },
  { city: "Panamá", zone: "Costa del Este", full: "Costa del Este · Panamá", title: "Sala social renovada", interv: "Integral", antes: `${ADP}/1602-sala-antes.webp`, despues: `${ADP}/1602-sala-despues.webp` },
];

/** Degradados placeholder de Figma detrás de cada foto. */
const AFTER_BG =
  "radial-gradient(936px 702px at 728px 117px, rgba(201,168,119,0.32) 0%, rgba(201,168,119,0) 60%), linear-gradient(150deg, rgb(165,122,78) 0%, rgb(61,44,30) 100%)";
const BEFORE_BG = "linear-gradient(150deg, rgb(90,87,80) 0%, rgb(47,45,41) 100%)";
const THUMB_BG = "linear-gradient(149.757deg, rgb(165,122,78) 0%, rgb(61,44,30) 100%)";
const THUMB_STRIPES =
  "linear-gradient(45deg, rgba(247,241,229,0.05) 0%, rgba(247,241,229,0.05) 2.8293%, rgba(247,241,229,0) 2.8293%, rgba(247,241,229,0) 5.6586%)";

function Comparador({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  const p = PROY[active];
  const compRef = useRef<HTMLDivElement>(null);
  const inView = useInView(compRef, { once: true, amount: 0.4 });
  const pos = useMotionValue(50);
  const beforeClip = useMotionTemplate`inset(0 ${useTransform(pos, (v) => 100 - v)}% 0 0)`;
  const leftPct = useMotionTemplate`${pos}%`;
  const dragging = useRef(false);

  /* Barrido de presentación: enseña que el divisor se mueve. */
  useEffect(() => {
    if (!inView) return;
    const c = animate(pos, [50, 74, 28, 50], { duration: 2.8, ease: EASE, delay: 0.5 });
    return () => c.stop();
  }, [inView, pos]);

  useEffect(() => {
    const setFrom = (clientX: number) => {
      const el = compRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      pos.set(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
    };
    const move = (e: PointerEvent) => dragging.current && setFrom(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [pos]);

  const setFromClientX = (clientX: number) => {
    const el = compRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    pos.set(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <>
      {/* Background+Shadow (311:2050) */}
      <motion.div
        ref={compRef}
        onPointerDown={(e) => { dragging.current = true; setFromClientX(e.clientX); }}
        className="ix-grab absolute cursor-ew-resize select-none touch-none overflow-hidden"
        style={{
          left: 440, top: 509.15, width: 1040, height: 585,
          background: BISTRE, borderRadius: 20,
          boxShadow: "0px 34px 70px -38px rgba(42,30,20,0.5)",
        }}
        initial={{ opacity: 0, y: 46, scale: 0.975 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.95, ease: EASE }}
      >
        {/* Panel DESPUÉS */}
        <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-[8.935px] p-[20px]" style={{ background: AFTER_BG }}>
          <Ico size={32} layers={IC_IMG_AFTER} />
          <p className="max-w-[166.386px] text-center font-semibold uppercase" style={{ fontSize: 9.9, lineHeight: "14.88px", letterSpacing: "1.389px", color: LINEN72 }}>
            Foto DESPUÉS — {p.full}
          </p>
        </div>
        <motion.img
          key={`d-${active}`} loading="lazy" decoding="async" draggable={false}
          alt={`Después — ${p.full}, ${p.title}`} src={p.despues}
          className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
          initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, ease: EASE }}
        />

        {/* Panel ANTES (recortado por el divisor) */}
        <motion.div className="absolute inset-0" style={{ clipPath: beforeClip }}>
          <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center gap-[8.875px] p-[20px]" style={{ background: BEFORE_BG }}>
            <Ico size={32} layers={IC_IMG_BEFORE} />
            <p className="max-w-[166.386px] text-center font-semibold uppercase" style={{ fontSize: 9.9, lineHeight: "14.88px", letterSpacing: "1.389px", color: LINEN72 }}>
              Foto ANTES — {p.full}, estado original
            </p>
          </div>
          <motion.img
            key={`a-${active}`} loading="lazy" decoding="async" draggable={false}
            alt={`Antes — ${p.full}, estado original`} src={p.antes}
            className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.65, ease: EASE }}
          />
        </motion.div>

        {/* Badge ANTES (311:2075) */}
        <Pop className="absolute backdrop-blur-[2px]" style={{ left: 16, top: 16, padding: "7px 15px 8.36px", background: "rgba(42,30,20,0.6)", border: `1px solid ${LINEN18}`, borderRadius: 8 }} delay={0.5} from={0.7}>
          <p className="font-bold uppercase" style={{ fontSize: 10.6, lineHeight: "16.37px", letterSpacing: "1.478px", color: "rgba(247,241,229,0.9)" }}>Antes</p>
        </Pop>
        {/* Badge DESPUÉS (311:2083) */}
        <Pop className="absolute backdrop-blur-[2px]" style={{ right: 16.42, top: 16, padding: "6px 14px 7.36px", background: "rgba(127,139,87,0.85)", borderRadius: 8 }} delay={0.6} from={0.7}>
          <p className="font-bold uppercase" style={{ fontSize: 10.6, lineHeight: "16.37px", letterSpacing: "1.478px", color: LINEN }}>Después</p>
        </Pop>

        {/* Divisor vertical (311:2087) */}
        <motion.div className="absolute top-0 h-full" style={{ left: leftPct, x: -1, width: 2, background: LINEN, boxShadow: "0px 0px 20px 0px rgba(0,0,0,0.4)" }} />
        {/* Handle (311:2088) — halo que respira para invitar a arrastrarlo */}
        <motion.div
          className="ix-breathe absolute top-1/2 flex items-center justify-center gap-[3px]"
          style={{ left: leftPct, x: -26, y: -26, width: 52, height: 52, background: LINEN, borderRadius: 26, boxShadow: "0px 8px 24px -6px rgba(0,0,0,0.5)" }}
        >
          <Ico size={15} layers={IC_CHEV_L} />
          <Ico size={15} layers={IC_CHEV_R} />
        </motion.div>
      </motion.div>

      {/* Background+Border — barra de datos (311:2096) */}
      <Rise
        className="absolute" delay={0.18} y={22} amount={0.3}
        style={{ left: 440, top: 1109.65, width: 1040, height: 99.02, background: LINEN, border: `1px solid ${DRIFT28}`, borderRadius: 16 }}
      >
        <L x={25} y={25.5} w={301}>
          <div className="flex items-center gap-[7px]">
            <Ico size={13} layers={IC_PIN} />
            <p className="font-semibold uppercase" style={{ fontSize: 12.8, lineHeight: "19.84px", letterSpacing: "1.28px", color: DRIFT }}>{p.full}</p>
          </div>
          <p className="font-semibold" style={{ marginTop: 3, fontSize: 18.4, lineHeight: "28.52px", color: OIL }}>{p.title}</p>
        </L>
        <L x={748} y={26.965} h={49.59} className="flex gap-[22px]">
          {([["Ciudad / Zona", `${p.city} · ${p.zone}`], ["Intervención", p.interv]] as const).map(([k, v]) => (
            <div key={k} style={{ paddingTop: 5 }}>
              <p className="font-normal uppercase" style={{ fontSize: 10.9, lineHeight: "16.86px", letterSpacing: "0.653px", color: MILLBROOK }}>{k}</p>
              <p className="font-semibold" style={{ marginTop: 1.79, fontSize: 16, lineHeight: "24.8px", color: BISTRE }}>{v}</p>
            </div>
          ))}
        </L>
      </Rise>

      {/* Selectores de proyecto (311:2118) */}
      {PROY.map((t, i) => (
        <motion.button
          key={t.full}
          type="button"
          onClick={() => setActive(i)}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.28 + i * 0.09, ease: EASE }}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.985 }}
          className="ix-thumb absolute overflow-hidden"
          style={{
            left: 440 + i * 263, top: 1226.67, width: 251, height: 156.88,
            borderRadius: 12,
            border: `2px solid ${active === i ? AVOCADO : "rgba(0,0,0,0)"}`,
            backgroundImage: THUMB_BG,
            boxShadow: active === i ? "0 14px 30px -18px rgba(42,30,20,0.75)" : undefined,
          }}
          aria-label={`Ver antes y después de ${t.zone}, ${t.city}`}
          aria-pressed={active === i}
        >
          <div aria-hidden className="absolute inset-0 flex items-center justify-center" style={{ backgroundImage: THUMB_STRIPES }}>
            <p className="text-center font-semibold uppercase" style={{ fontSize: 9, lineHeight: "12.54px", letterSpacing: "0.896px", color: "rgba(247,241,229,0.7)" }}>
              Antes / Después
            </p>
          </div>
          <img loading="lazy" decoding="async" draggable={false} alt="" src={t.despues} className="pointer-events-none absolute inset-0 size-full max-w-none object-cover" />
          <div className="absolute bottom-0 left-0 right-0" style={{ padding: "16px 12px 9.84px", backgroundImage: "linear-gradient(to bottom, rgba(42,30,20,0) 0%, rgba(42,30,20,0.85) 100%)" }}>
            <p className="text-left font-medium uppercase" style={{ fontSize: 9.6, lineHeight: "14.88px", letterSpacing: "0.768px", color: LASER }}>{t.city}</p>
            <p className="text-left font-semibold" style={{ marginTop: 0.85, fontSize: 11.8, lineHeight: "18.35px", color: LINEN }}>{t.zone}</p>
          </div>
        </motion.button>
      ))}

      {/* Nota (311:2151) — el icono se balancea como pista de arrastre */}
      <Pop className="absolute" style={{ left: 440, top: 1401.55 }} delay={0.6}>
        <Ico size={15} layers={IC_DRAG} className="ix-sway" />
      </Pop>
      <T x={463} cy={1409.05} d={0.66} ry={14} className="whitespace-nowrap font-light" style={{ fontSize: 12.8, lineHeight: "19.84px", color: MILLBROOK }}>
        <p>Arrastra el círculo (o toca la imagen) para ver el antes y el después de cada proyecto.</p>
      </T>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Página
   ═══════════════════════════════════════════════════════════════════════════ */

const FICHA_ROWS: [string, string, boolean][] = [
  ["Valor de entrada", "$7,2M / m²", false],
  ["Área", "320 m²", false],
  ["Inversión estimada", "$2,5M / m²", true],
  ["Canon proyectado", "$17M / mes", true],
  ["Valorización estimada", "~22%", true],
];

const FICHA_CARDS: { t: ReactNode; d: string; box: { x: number; y: number; w: number; h: number; pb: number } }[] = [
  { t: "Valor de entrada", d: "Precio, área y lectura del valor por metro cuadrado.", box: { x: 0, y: 0, w: 256.52, h: 223.61, pb: 69.61 } },
  { t: <>Transformación<br />propuesta</>, d: "Alcance de diseño, remodelación e inversión estimada.", box: { x: 270.52, y: 0, w: 256.52, h: 223, pb: 23 } },
  { t: "Potencial de renta", d: "Canon proyectado y perfil de demanda de la microzona.", box: { x: 0, y: 236.55, w: 256.52, h: 198.33, pb: 44.33 } },
  { t: "Proyección de valor", d: "Valorización estimada y alternativas de permanencia o salida.", box: { x: 270.52, y: 236.55, w: 256.52, h: 198, pb: 23 } },
];

const CHECKLIST = [
  "Ficha completa de la oportunidad",
  "Lectura comercial y técnica",
  "Propuesta de diseño y remodelación",
  "Presupuesto y cronograma",
  "Proyección de renta y valorización",
  "Seguimiento digital de la ejecución",
  "Gestión posterior del activo",
];

export default function OportunidadesScreen() {
  const [active, setActive] = useState(0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative size-full overflow-hidden" style={{ background: CREAM }} data-name="OPORTUNIDADES">
        {/* ══════════ imagen de fondo del hero (326:1187) ══════════ */}
        <L x={0} y={0} w={1920} h={1174} className="overflow-hidden">
          <ParImg
            src="opp-hero.webp" par={52} over={1.1} eager
            style={{ height: "123.36%", left: "-0.57%", top: "-11.68%", width: "100.57%" }}
          />
        </L>

        {/* ══════════ 1 · HERO (311:1997) ══════════ */}
        <L x={0} y={0} w={1920} h={1178} className="overflow-hidden" style={{ background: "rgba(73,33,0,0.65)" }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(131.22deg, rgba(201,168,119,0.12) 0%, rgba(201,168,119,0) 100%), linear-gradient(48.78deg, rgba(247,241,229,0.05) 0%, rgba(247,241,229,0.05) 0.47907%, rgba(247,241,229,0) 0.47907%, rgba(247,241,229,0) 0.95814%)",
            }}
          />
          <Rule x={601} y={279} w={34} color={LASER} delay={0.15} />
          <T x={647} cy={278.57} w={136.119} d={0.29} ry={14} className="font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.226px", color: LASER }}>
            <p>Oportunidades</p>
          </T>
          <T x={601} cy={419.3} className="whitespace-nowrap" style={{ fontSize: 67.2, lineHeight: "75.26px", letterSpacing: "-1.68px", color: LINEN }}>
            <MLine delay={0.3}><span className="font-light">Propiedades con</span></MLine>
            <MLine delay={0.42}><span className="font-light">potencial real de</span></MLine>
            <MLine delay={0.54}><span className="font-semibold">transformación.</span></MLine>
          </T>
          <T x={601} cy={602} d={0.78} className="whitespace-nowrap font-light" style={{ fontSize: 20.8, lineHeight: "32.24px", color: "rgba(247,241,229,0.86)" }}>
            <p>Serava selecciona activos en zonas consolidadas, con condiciones</p>
            <p>para aumentar su valor mediante diseño, remodelación y mejor</p>
            <p>operación.</p>
          </T>
          <CTA x={601} y={686.64} tone="olive" d={0.94} />
          <T x={601} cy={796.8} d={1.06} className="whitespace-nowrap font-light" style={{ fontSize: 20.8, lineHeight: "32.24px", color: "rgba(247,241,229,0.6)" }}>
            <p>Las oportunidades activas están disponibles únicamente para</p>
            <p>inversionistas aprobados.</p>
          </T>
        </L>

        {/* ══════════ 2 · PROYECTOS DE REFERENCIA (311:2033) ══════════ */}
        <L
          x={0} y={1032} w={1920} h={1726} className="overflow-hidden"
          style={{ backgroundImage: "linear-gradient(180deg, rgba(226,205,174,0) 0%, rgb(226,205,174) 7.689%, rgb(226,205,174) 17.325%, rgb(226,205,174) 26.838%, rgb(226,205,174) 100%)" }}
        >
          {/* Textura topográfica rotada, al 5 % (217:1227) */}
          <L x={-4} y={119} w={2094.88} h={1398.858} className="flex items-center justify-center">
            <div style={{ transform: "rotate(90.11deg)", flex: "none" }}>
              <div className="relative overflow-hidden" style={{ width: 1394.773, height: 2092.159 }}>
                <ParImg src="opp-topo.webp" par={90} over={1.12} style={{ inset: 0, width: "100%", height: "100%", opacity: 0.05 }} />
              </div>
            </div>
          </L>

          <T x={440} cy={211.16} w={760} d={0} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color: VERDIGRIS }}>
            <p>El tipo de activos que buscamos</p>
          </T>
          <T x={440} cy={283.38} w={638.48} className="whitespace-nowrap" style={{ fontSize: 43.2, lineHeight: "48.38px", letterSpacing: "-1.08px", color: BISTRE }}>
            <MLine delay={0.12}>
              <span className="font-light">Espacios donde el valor </span>
              <span className="font-semibold">puede</span>
            </MLine>
            <MLine delay={0.24}><span className="font-semibold">construirse.</span></MLine>
          </T>
          <T x={440} cy={406.71} w={639.75} d={0.4} className="whitespace-nowrap font-light" style={{ fontSize: 17.9, lineHeight: "27.78px", color: MILLBROOK }}>
            <p>Conoce transformaciones realizadas por nuestro equipo y el tipo de</p>
            <p>propiedades que orientan la selección Serava. Buscamos inmuebles</p>
            <p>bien ubicados, con atributos difíciles de replicar y capacidad de</p>
            <p>mejorar su posicionamiento a través de una intervención estratégica.</p>
          </T>

          <Comparador active={active} setActive={setActive} />

          <T x={440} cy={1450.47} w={1040} d={0.1} className="font-light" style={{ fontSize: 13.4, lineHeight: "20.83px", color: MILLBROOK }}>
            <p>Los proyectos mostrados son casos de referencia. El portafolio activo es confidencial.</p>
          </T>
        </L>

        {/* ══════════ 3 · CÓMO SE PRESENTA CADA OPORTUNIDAD (311:2157) ══════════ */}
        <L x={0} y={2554} w={1920} h={1512} className="overflow-hidden" style={{ background: BROWN, borderRadius: "150px 0 0 0" }}>
          <L x={-4} y={0} w={1928} h={1404} className="overflow-hidden" style={{ opacity: 0.65 }}>
            <ParImg src="opp-sketch.webp" par={64} over={1.12} style={{ height: "100%", left: "-28.5%", top: 0, width: "128.5%" }} />
          </L>
          <L
            x={0} y={2} w={1528} h={1303}
            style={{ backgroundImage: "linear-gradient(89.6216deg, rgb(73,33,0) 0.278%, rgb(73,33,0) 29.649%, rgb(73,33,0) 48.532%, rgb(73,33,0) 74.48%, rgba(73,33,0,0) 99.722%)" }}
          />

          <T x={238} cy={141.16} w={820} d={0} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color: LASER }}>
            <p>Información para decidir</p>
          </T>
          <T x={238} cy={262} w={638.48} className="whitespace-nowrap" style={{ fontSize: 43.2, lineHeight: "48.38px", letterSpacing: "-1.08px", color: LINEN }}>
            <MLine delay={0.12}><span className="font-light">Cada oportunidad muestra</span></MLine>
            <MLine delay={0.22}><span className="font-light">dónde está el potencial y</span></MLine>
            <MLine delay={0.32}><span className="font-semibold">cómo puede convertirse en</span></MLine>
            <MLine delay={0.42}><span className="font-semibold">valor.</span></MLine>
          </T>
          <T x={238} cy={434.15} w={639.75} d={0.56} className="whitespace-nowrap font-light" style={{ fontSize: 17.9, lineHeight: "27.78px", color: LINEN80 }}>
            <p>Los inversionistas aprobados reciben una ficha que conecta los datos</p>
            <p>del activo con la propuesta de transformación desarrollada por Serava.</p>
            <p>La información permite entender el valor de entrada, la inversión</p>
            <p>requerida, el potencial de renta y la proyección de valorización.</p>
          </T>

          {/* mock ficha (311:2167) */}
          <motion.div
            className="absolute overflow-hidden"
            style={{ left: 238, top: 540.15, width: 448.96, height: 637.64, background: LINEN5, border: `1px solid ${LINEN18}`, borderRadius: 20 }}
            initial={{ opacity: 0, y: 44, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <L x={-10} y={-62.15} w={457} h={326} className="overflow-hidden">
              <ParImg src="opp-ficha.webp" par={26} alt="Oportunidad de referencia" style={{ height: "249.24%", left: 0, top: "-67.59%", width: "100%" }} />
            </L>

            <L x={0} y={279.34} w={448.95} style={{ padding: "22px 24px" }}>
              {FICHA_ROWS.map(([k, v, blur], i) => (
                <motion.div
                  key={k}
                  className="flex items-center justify-between"
                  style={{
                    padding: i === FICHA_ROWS.length - 1 ? "13px 0" : "13px 0 14px",
                    borderBottom: i === FICHA_ROWS.length - 1 ? undefined : `1px solid ${LINEN18}`,
                  }}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.55, delay: 0.34 + i * 0.08, ease: EASE }}
                >
                  <span className="font-light" style={{ fontSize: 13.8, lineHeight: "21.33px", color: LINEN72 }}>{k}</span>
                  <span className="font-semibold" style={{ fontSize: 14.4, lineHeight: "22.32px", color: LASER, filter: blur ? "blur(2.5px)" : undefined }}>{v}</span>
                </motion.div>
              ))}
            </L>

            <L x={0} y={568.98} w={448.95} h={66.66} style={{ background: "rgba(201,168,119,0.1)", borderTop: `1px solid ${LINEN18}` }}>
              <Pop className="absolute" style={{ left: 24, top: 25.83 }} delay={0.86} from={0.3}>
                <Ico size={15} layers={IC_LOCK} />
              </Pop>
              <T x={48} cy={32.41} d={0.9} ry={12} className="whitespace-nowrap font-normal" style={{ fontSize: 12.2, lineHeight: "18.85px", color: LINEN80 }}>
                <p>La información detallada se habilita dentro de la plataforma</p>
                <p>después de la aprobación de acceso.</p>
              </T>
            </L>
          </motion.div>

          {/* 4 elementos (311:2215) */}
          {FICHA_CARDS.map(({ t, d, box }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.65, delay: 0.2 + i * 0.1, ease: EASE }}
              whileHover={{ y: -6 }}
              className="ix-card absolute overflow-hidden"
              style={{
                left: 750.96 + box.x, top: 642.07 + box.y, width: box.w, height: box.h,
                background: LINEN5, border: `1px solid ${LINEN18}`, borderRadius: 15,
                padding: `23px 21px ${box.pb}px`,
              }}
            >
              <motion.div
                className="ix-card-ico flex items-center justify-center"
                style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(201,168,119,0.16)" }}
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.55, delay: 0.34 + i * 0.1, ease: POP }}
              >
                <Ico size={21} layers={IC_CARD[i]} />
              </motion.div>
              <p className="font-semibold" style={{ marginTop: 14, fontSize: 16.3, lineHeight: "25.3px", color: LINEN }}>{t}</p>
              <p className="font-light" style={{ marginTop: 6, fontSize: 13.8, lineHeight: "21.33px", color: LINEN72 }}>{d}</p>
            </motion.div>
          ))}
        </L>

        {/* ══════════ imagen de fondo sección 4 (326:1193) ══════════ */}
        <Pic
          x={0} y={3862} w={1920} h={969} radius="0 150px 0 0" src="opp-aerial.webp" alt="" fade={false} par={58} over={1.1}
          crop={{ height: "132.09%", left: 0, top: "-32.11%", width: "100%" }}
        />

        {/* ══════════ 4 · EXPERIENCIA DEL INVERSIONISTA (311:2253) ══════════ */}
        <L
          x={0} y={3862} w={1920} h={1064} className="overflow-hidden"
          style={{ borderRadius: "0 150px 0 0", backgroundImage: "linear-gradient(90.449deg, rgb(226,205,174) 27.749%, rgba(226,205,174,0.98) 43.017%, rgba(226,205,174,0.94) 56.872%, rgba(226,205,174,0.68) 72.872%)" }}
        >
          <T x={417} cy={193.16} w={820} d={0} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color: VERDIGRIS }}>
            <p>Una operación acompañada</p>
          </T>
          <T x={417} cy={265.38} w={638.48} className="whitespace-nowrap" style={{ fontSize: 43.2, lineHeight: "48.38px", letterSpacing: "-1.08px", color: BISTRE }}>
            <MLine delay={0.12}>
              <span className="font-light">Información para decidir. </span>
              <span className="font-semibold">Un</span>
            </MLine>
            <MLine delay={0.24}><span className="font-semibold">equipo para ejecutar.</span></MLine>
          </T>

          <T x={417} cy={387.16} w={488} d={0.4} className="font-light" style={{ fontSize: 17.9, lineHeight: "27.78px", color: MILLBROOK }}>
            <p>Serava acompaña cada operación desde la selección del activo hasta su remodelación y gestión posterior.</p>
          </T>
          <T x={417} cy={470.35} w={488} d={0.52} className="font-light" style={{ fontSize: 17.9, lineHeight: "27.78px", color: MILLBROOK }}>
            <p>
              <span>El inversionista </span>
              <span className="font-semibold" style={{ color: BISTRE }}>conserva la propiedad</span>
              <span>, aprueba las decisiones clave y consulta el avance desde un solo lugar.</span>
            </p>
          </T>
          <T x={417} cy={544.09} w={488} d={0.64} className="font-medium" style={{ fontSize: 13.4, lineHeight: "20.83px", color: VERDIGRIS }}>
            <p>Un solo equipo conecta análisis, diseño, obra y operación.</p>
          </T>

          {/* Checklist (311:2270) — el fondo driftwood asoma como separador de 2 px */}
          <motion.div
            className="absolute overflow-hidden"
            style={{ left: 1066, top: 194, width: 488, height: 406, background: DRIFT28, border: `1px solid ${DRIFT28}`, borderRadius: 16, boxSizing: "border-box" }}
            initial={{ opacity: 0, y: 38 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, delay: 0.1, ease: EASE }}
          >
            {CHECKLIST.map((t, i) => (
              <motion.div
                key={t}
                className="ix-row absolute left-0 right-0 flex items-center gap-[14px]"
                style={{ top: i * 58, height: 56, padding: "16px 20px", background: LINEN }}
                initial={{ opacity: 0, x: -26 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.55, delay: 0.3 + i * 0.07, ease: EASE }}
              >
                <motion.div
                  className="flex shrink-0 items-center justify-center"
                  style={{ width: 24, height: 24, borderRadius: 12, background: "rgba(127,139,87,0.16)" }}
                  initial={{ scale: 0.3, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.45, delay: 0.42 + i * 0.07, ease: POP }}
                >
                  <Ico size={13} layers={IC_CHECK} />
                </motion.div>
                <p className="font-medium" style={{ fontSize: 15.2, lineHeight: "23.56px", color: BISTRE }}>{t}</p>
              </motion.div>
            ))}
          </motion.div>
        </L>

        {/* ══════════ imagen de fondo sección 5 (334:1207) ══════════ */}
        <Pic
          x={0} y={4706} w={1920} h={772} radius="150px 0 0 0" src="opp-dusk.webp" alt="" fade={false} par={54} over={1.1}
          crop={{ height: "180.54%", left: "-0.01%", top: "-0.03%", width: "100%" }}
        />

        {/* ══════════ 5 · ACCESO (311:2313) ══════════ */}
        <L x={0} y={4706} w={1920} h={844} className="overflow-hidden" style={{ background: "rgba(73,33,0,0.85)", borderRadius: "150px 0 0 0" }}>
          <Rule x={845.445} y={146} w={34} color={LASER} delay={0.1} />
          <T x={891.447} cy={145.58} w={180.155} d={0.24} ry={14} className="text-center font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.226px", color: LASER }}>
            <p>Portafolio privado</p>
          </T>
          <T x={650} cy={229.95} w={620} className="whitespace-nowrap text-center" style={{ fontSize: 51.2, lineHeight: "57.34px", letterSpacing: "-1.28px", color: LINEN }}>
            <MLine delay={0.26}><span className="font-light">Accede al portafolio</span></MLine>
            <MLine delay={0.38}><span className="font-semibold">privado de Serava.</span></MLine>
          </T>
          <T x={650} cy={335.29} w={620} d={0.56} className="whitespace-nowrap text-center font-light" style={{ fontSize: 17.9, lineHeight: "27.78px", color: "rgba(247,241,229,0.84)" }}>
            <p>Solicita tu evaluación para conocer oportunidades seleccionadas</p>
            <p>según tu capital, perfil y estrategia de inversión.</p>
          </T>
          <CTA x={848.915} y={397.515} tone="cream" d={0.7} />
          <T x={650} cy={489.72} w={620} d={0.86} className="whitespace-nowrap text-center font-light" style={{ fontSize: 13.4, lineHeight: "20.83px", color: "rgba(247,241,229,0.6)" }}>
            <p>Portafolio confidencial. Acceso sujeto a evaluación y disponibilidad.</p>
          </T>

          {/* Elipse trazada, duplicada tal cual en Figma (326:1194 + 326:1201).
              Las dos giran muy lento en sentidos opuestos. */}
          <BloomSpin className="pointer-events-none" style={{ left: 635, top: 18, width: 650, height: 607 }} delay={0.15} dur={1.7} spin={140}>
            <img alt="" src={`${I}/ell15.svg`} className="absolute inset-0 block size-full max-w-none" />
          </BloomSpin>
          <BloomSpin className="pointer-events-none" style={{ left: 635, top: 18, width: 650, height: 607 }} delay={0.3} dur={1.9} spin={200} reverse>
            <img alt="" src={`${I}/ell15.svg`} className="absolute inset-0 block size-full max-w-none" />
          </BloomSpin>
          <Float className="pointer-events-none" style={{ left: 630, top: 248, width: 20, height: 21 }} amp={7} dur={5}>
            <Pop delay={0.6}><img alt="" src={`${I}/ell16.svg`} className="block size-full max-w-none" /></Pop>
          </Float>
          <Float className="pointer-events-none" style={{ left: 1205, top: 500, width: 20, height: 21 }} amp={7} dur={6} delay={0.5}>
            <Pop delay={0.72}><img alt="" src={`${I}/ell17.svg`} className="block size-full max-w-none" /></Pop>
          </Float>
        </L>

      </div>
    </MotionConfig>
  );
}
