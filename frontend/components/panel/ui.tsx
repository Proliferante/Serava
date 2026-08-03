"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { EASE } from "@/components/motion/Kinetics";
import { Ico, type IconName } from "@/components/panel/icons";

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL — tokens y primitivas del área privada (post-login).

   Los colores salen de muestrear los píxeles de los frames de Figma
   (472:1510 y hermanos): en este archivo `get_design_context` se cuelga, así
   que la geometría viene de `get_metadata` y el color de los pantallazos.

   Las vistas se dibujan sobre un lienzo fijo de 1920 px que ScaledCanvas
   escala al viewport, igual que el resto del sitio.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Paleta ──────────────────────────────────────────────────────────────── */
export const SHELL = "#281d14";   // fondo del sidebar
export const OIL = "#2a1e14";     // fondo de la topbar
export const HELPBG = "#32281e";  // caja "¿Necesitas ayuda?"
export const PAPER = "#f3ede1";   // fondo del área de contenido
export const CARD = "#f7f1e5";    // fondo de tarjeta
export const LINE = "#ddd5c8";    // borde de tarjeta
export const INK = "#3d2c1e";     // texto fuerte sobre claro
export const MUTED = "#5b4332";   // texto secundario sobre claro
export const DRIFT = "#a57a4e";   // acento tabaco (eyebrows, botón sólido)
export const LASER = "#c9a877";   // dorado
export const VERD = "#5f6b3e";    // verde de enlaces, anillos y badges
export const AVOCADO = "#7f8b57"; // verde de botones primarios
export const OLIVE = "#9aa66f";   // punto de estado "en obra"
export const TUSCANY = "#b5542f"; // badge de pendientes
export const TRACK = "#efe6d5";   // canal de las barras de progreso
export const LINEN = "#f7f1e5";

export const LINEN40 = "rgba(247,241,229,0.4)";
export const LINEN72 = "rgba(247,241,229,0.72)";
export const LINEN80 = "rgba(247,241,229,0.8)";

/** Degradado de las barras de avance: tabaco → dorado. */
export const BAR_FILL = `linear-gradient(90deg, ${DRIFT} 0%, ${LASER} 100%)`;
/** Tarjeta verde sólida (sobrecosto, TIR): diagonal aguacate → verdigris. */
export const GREEN_CARD = `linear-gradient(135deg, ${AVOCADO} 0%, ${VERD} 100%)`;
/** Relleno de las fotos mientras cargan / cuando no hay imagen. */
export const PHOTO_BG = "linear-gradient(150deg, #f4eddf 0%, #ece3d1 60%, #e0d5bd 100%)";

export const CARD_R = 16;

/* ── Primitivas de posición ──────────────────────────────────────────────── */

/** Capa absoluta con la geometría literal de Figma. */
export function L({
  x, y, w, h, className, style, children,
}: { x: number; y: number; w?: number; h?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`absolute ${className ?? ""}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

/**
 * Tarjeta del panel. Entra subiendo al hacer scroll y se eleva un poco al pasar
 * el ratón cuando es interactiva (`hover`).
 */
export function Card({
  x, y, w, h, delay = 0, hover, green, pad, className, style, children,
}: {
  x: number; y: number; w: number; h: number; delay?: number; hover?: boolean;
  green?: boolean; pad?: number; className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const base: CSSProperties = {
    left: x, top: y, width: w, height: h,
    borderRadius: CARD_R,
    padding: pad,
    background: green ? GREEN_CARD : CARD,
    border: green ? "none" : `1px solid ${LINE}`,
    ...style,
  };
  if (!green) base.boxShadow = "0 12px 30px -22px rgba(61,44,30,0.5)";
  const cls = `absolute ${hover ? "pnl-card" : ""} ${className ?? ""}`;
  if (reduce) return <div className={cls} style={base}>{children}</div>;
  return (
    <motion.div
      className={cls}
      style={base}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Entrada genérica: sube y aparece. Para filas y bloques dentro de tarjetas. */
export function In({
  x, y, w, h, delay = 0, dy = 14, className, style, children,
}: {
  x: number; y: number; w?: number; h?: number; delay?: number; dy?: number;
  className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const base: CSSProperties = { left: x, top: y, width: w, height: h, ...style };
  if (reduce) return <div className={`absolute ${className ?? ""}`} style={base}>{children}</div>;
  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      style={base}
      initial={{ opacity: 0, y: dy }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Tipografía ──────────────────────────────────────────────────────────── */

/** Etiqueta micro en mayúsculas: eyebrows de tarjeta y títulos de sección. */
export function Eyebrow({
  x, y, w, size = 11.5, color = DRIFT, ls = 0.7, weight = 600, className, children,
}: {
  x: number; y: number; w?: number; size?: number; color?: string; ls?: number;
  weight?: number; className?: string; children: ReactNode;
}) {
  return (
    <p
      className={`absolute uppercase ${className ?? ""}`}
      style={{
        left: x, top: y, width: w, margin: 0,
        fontSize: size, lineHeight: `${Math.round(size * 1.48)}px`,
        letterSpacing: `${ls}px`, fontWeight: weight, color,
      }}
    >
      {children}
    </p>
  );
}

/**
 * Título de vista: primera parte en peso ligero y segunda en semibold, como
 * los `h1` del resto del sitio.
 */
export function ViewTitle({ light, strong, sub }: { light: string; strong: string; sub: string }) {
  const reduce = useReducedMotion();
  const head = (
    <h1 className="m-0" style={{ fontSize: 36, lineHeight: "48px", color: INK, fontWeight: 300, letterSpacing: "-0.4px" }}>
      {light}{" "}<span style={{ fontWeight: 600 }}>{strong}</span>
    </h1>
  );
  return (
    <>
      <div className="absolute" style={{ left: 0, top: 0, width: 1604 }}>
        {reduce ? head : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: EASE }}>
            {head}
          </motion.div>
        )}
      </div>
      <div className="absolute" style={{ left: 0, top: 51, width: 1604 }}>
        {reduce ? (
          <p className="m-0" style={{ fontSize: 15.5, lineHeight: "22.6px", color: MUTED, fontWeight: 300 }}>{sub}</p>
        ) : (
          <motion.p
            className="m-0" style={{ fontSize: 15.5, lineHeight: "22.6px", color: MUTED, fontWeight: 300 }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
          >
            {sub}
          </motion.p>
        )}
      </div>
    </>
  );
}

/* ── Piezas reutilizables ────────────────────────────────────────────────── */

/** Barra de progreso: el relleno crece de 0 al entrar en viewport. */
export function Bar({
  x, y, w, pct, h = 9, fill = BAR_FILL, track = TRACK, delay = 0,
}: { x: number; y: number; w: number; pct: number; h?: number; fill?: string; track?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="absolute overflow-hidden" style={{ left: x, top: y, width: w, height: h, borderRadius: h / 2, background: track }}>
      <motion.div
        style={{ height: "100%", borderRadius: h / 2, background: fill }}
        initial={reduce ? undefined : { width: 0 }}
        animate={{ width: `${reduce || seen ? Math.min(100, Math.max(0, pct)) : 0}%` }}
        transition={{ duration: 1.05, delay, ease: EASE }}
      />
    </div>
  );
}

/** Anillo de progreso con dos líneas de texto al centro (92% / Ejec.). */
export function Ring({
  x, y, size = 66, pct, top, bottom, delay = 0,
}: { x: number; y: number; size?: number; pct: number; top: string; bottom: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="absolute" style={{ left: x, top: y, width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={3} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={VERD} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? undefined : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - (reduce || seen ? pct / 100 : 0)) }}
          transition={{ duration: 1.15, delay, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 1 }}>
        <span style={{ fontSize: 16, lineHeight: "24px", fontWeight: 600, color: INK }}>{top}</span>
        <span style={{ fontSize: 9.5, lineHeight: "13px", fontWeight: 500, color: MUTED, letterSpacing: "0.3px" }}>{bottom}</span>
      </div>
    </div>
  );
}

/** Enlace "Ver todas →" / "Detalles →": la flecha empuja al pasar el ratón. */
export function SeeLink({
  x, y, label, href, size = 13.5, color = VERD, icon = 14, onClick,
}: { x: number; y: number; label: string; href?: string; size?: number; color?: string; icon?: number; onClick?: () => void }) {
  const inner = (
    <>
      <span style={{ fontSize: size, lineHeight: `${Math.round(size * 1.41)}px`, fontWeight: 500 }}>{label}</span>
      <span className="pnl-link-arrow" style={{ display: "inline-flex" }}><Ico name="arrow" size={icon} /></span>
    </>
  );
  const style: CSSProperties = { left: x, top: y, color, gap: 6 };
  if (href) return <a href={href} className="pnl-link absolute inline-flex items-center" style={style}>{inner}</a>;
  return <button type="button" onClick={onClick} className="pnl-link absolute inline-flex items-center" style={style}>{inner}</button>;
}

/** Píldora de estado (Pagado, Pendiente, Observación…). */
export function Pill({
  x, y, label, tone = "green", size = 10.5,
}: { x: number; y: number; label: string; tone?: "green" | "gold" | "tuscany" | "plain"; size?: number }) {
  const tones = {
    green: { bg: "rgba(95,107,62,0.12)", fg: VERD },
    gold: { bg: "rgba(201,168,119,0.2)", fg: "#8a6a3c" },
    tuscany: { bg: "rgba(181,84,47,0.12)", fg: TUSCANY },
    plain: { bg: "rgba(91,67,50,0.1)", fg: MUTED },
  }[tone];
  return (
    <span
      className="absolute inline-flex items-center uppercase"
      style={{
        left: x, top: y, padding: "3.5px 9px", borderRadius: 999,
        background: tones.bg, color: tones.fg,
        fontSize: size, lineHeight: `${Math.round(size * 1.45)}px`, fontWeight: 600, letterSpacing: "0.8px",
      }}
    >
      {label}
    </span>
  );
}

/** Marca de verificación / aviso en círculo, para listas de estado. */
export function StatusDot({
  x, y, size = 24, tone = "ok",
}: { x: number; y: number; size?: number; tone?: "ok" | "warn" | "idle" }) {
  const t = {
    ok: { bg: "rgba(95,107,62,0.14)", fg: VERD, icon: "check" as IconName },
    warn: { bg: "rgba(201,168,119,0.22)", fg: "#8a6a3c", icon: "alert" as IconName },
    idle: { bg: "rgba(91,67,50,0.08)", fg: "rgba(91,67,50,0.45)", icon: "dot" as IconName },
  }[tone];
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: x, top: y, width: size, height: size, borderRadius: size / 2, background: t.bg, color: t.fg }}
    >
      <Ico name={t.icon} size={Math.round(size * 0.58)} />
    </div>
  );
}

/** Botón del panel en sus tres pesos: verde sólido, tabaco sólido y contorno. */
export function Btn({
  x, y, w, h = 46, label, icon, tone = "primary", onClick, disabled, r = 999, fs = 14.5,
}: {
  x: number; y: number; w?: number; h?: number; label: string; icon?: IconName;
  tone?: "primary" | "tan" | "outline"; onClick?: () => void; disabled?: boolean; r?: number; fs?: number;
}) {
  const t = {
    primary: { bg: AVOCADO, fg: LINEN, bd: "none", cls: "pnl-btn pnl-btn-solid" },
    tan: { bg: DRIFT, fg: LINEN, bd: "none", cls: "pnl-btn pnl-btn-solid" },
    outline: { bg: "transparent", fg: INK, bd: `1px solid ${LINE}`, cls: "pnl-btn pnl-btn-outline" },
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${t.cls} absolute inline-flex items-center justify-center`}
      style={{
        left: x, top: y, width: w, height: h, gap: 8, padding: w ? undefined : "0 18px",
        background: t.bg, color: t.fg, border: t.bd, borderRadius: r,
        fontSize: fs, fontWeight: 600, opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {icon && <Ico name={icon} size={Math.round(fs * 1.15)} />}
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
    </button>
  );
}

/** Separador horizontal de 1 px entre filas de una lista. */
export function Sep({ x, y, w }: { x: number; y: number; w: number }) {
  return <div className="absolute" style={{ left: x, top: y, width: w, height: 1, background: LINE }} />;
}

/**
 * Enlace de cabecera de sección ("VER TODAS →"): mayúsculas en tabaco, con la
 * flecha como carácter porque así viene en el diseño. Se ancla por la derecha
 * para que el texto crezca hacia dentro de la tarjeta.
 */
export function SecLink({
  right, y, label, href, onClick,
}: { right: number; y: number; label: string; href?: string; onClick?: () => void }) {
  const inner = (
    <>
      <span style={{ fontSize: 11, lineHeight: "17px", fontWeight: 600, letterSpacing: "0.9px" }}>{label}</span>
      <span className="pnl-link-arrow" style={{ display: "inline-flex" }}><Ico name="arrow" size={12} /></span>
    </>
  );
  const style: CSSProperties = { right, top: y, color: DRIFT, gap: 6 };
  if (href) return <a href={href} className="pnl-link absolute inline-flex items-center uppercase" style={style}>{inner}</a>;
  return <button type="button" onClick={onClick} className="pnl-link absolute inline-flex items-center uppercase" style={style}>{inner}</button>;
}

/**
 * Dato destacado en la esquina de una tarjeta (92% / Ejec.). En Figma la capa
 * se llama `span.ring` pero el círculo no se pinta: son solo las dos líneas.
 */
export function Stat({
  right, y, value, label,
}: { right: number; y: number; value: ReactNode; label: string }) {
  return (
    <div className="absolute text-right" style={{ right, top: y }}>
      <p className="m-0" style={{ fontSize: 19.5, lineHeight: "24px", fontWeight: 600, color: VERD }}>{value}</p>
      <p className="m-0 uppercase" style={{ fontSize: 9.5, lineHeight: "13px", fontWeight: 500, letterSpacing: "0.6px", color: MUTED }}>{label}</p>
    </div>
  );
}

/** Caja de icono de 34 px en la esquina de una tarjeta. */
export function IconBox({
  x, y, icon, tone = "green", size = 34,
}: { x: number; y: number; icon: IconName; tone?: "green" | "gold" | "tan"; size?: number }) {
  const t = {
    green: { bg: "rgba(95,107,62,0.1)", fg: VERD, bd: "rgba(95,107,62,0.18)" },
    gold: { bg: "rgba(201,168,119,0.22)", fg: "#8a6a3c", bd: "rgba(201,168,119,0.4)" },
    tan: { bg: "rgba(165,122,78,0.14)", fg: DRIFT, bd: "rgba(165,122,78,0.26)" },
  }[tone];
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{ left: x, top: y, width: size, height: size, borderRadius: 10, background: t.bg, border: `1px solid ${t.bd}`, color: t.fg }}
    >
      <Ico name={icon} size={Math.round(size * 0.53)} />
    </div>
  );
}

/**
 * Cifra grande con su unidad al lado ("$1.240M / $1.350M"). Se alinean por la
 * línea base, así que la unidad queda pegada al pie del número.
 */
export function Big({
  x, y, children, suffix, fs = 28.8,
}: { x: number; y: number; children: ReactNode; suffix?: string; fs?: number }) {
  return (
    <div className="absolute inline-flex items-baseline" style={{ left: x, top: y, gap: 5 }}>
      <span style={{ fontSize: fs, lineHeight: `${Math.round(fs * 1.25)}px`, fontWeight: 700, color: INK, letterSpacing: "-0.3px" }}>
        {children}
      </span>
      {suffix && <span style={{ fontSize: 15, lineHeight: "20px", fontWeight: 400, color: MUTED }}>{suffix}</span>}
    </div>
  );
}

/** Línea de texto secundario dentro de una tarjeta. */
export function Note({
  x, y, w, size = 13, color = MUTED, weight = 300, className, children,
}: {
  x: number; y: number; w?: number; size?: number; color?: string; weight?: number;
  className?: string; children: ReactNode;
}) {
  return (
    <p
      className={`absolute m-0 ${className ?? ""}`}
      style={{ left: x, top: y, width: w, fontSize: size, lineHeight: `${Math.round(size * 1.44)}px`, fontWeight: weight, color }}
    >
      {children}
    </p>
  );
}

/**
 * Hueco de foto de obra: relleno beige mientras no hay imagen, etiqueta de
 * fecha abajo a la izquierda y el nombre del ambiente al centro.
 */
export function Photo({
  x, y, w, h, label, date, r = 10, delay = 0,
}: { x: number; y: number; w: number; h: number; label: string; date?: string; r?: number; delay?: number }) {
  const reduce = useReducedMotion();
  const body = (
    <>
      <div className="pnl-photo-img absolute inset-0" style={{ background: PHOTO_BG, borderRadius: r }} />
      <span
        className="absolute uppercase text-center"
        style={{
          left: 0, right: 0, top: h / 2 - 7, fontSize: 10.5, lineHeight: "14px",
          fontWeight: 500, letterSpacing: "1.1px", color: "rgba(91,67,50,0.42)",
        }}
      >
        {label}
      </span>
      {date && (
        <span
          className="absolute uppercase"
          style={{
            left: 8, top: h - 28.4, padding: "2px 7px", borderRadius: 6,
            background: "rgba(40,29,20,0.78)", color: LINEN80,
            fontSize: 10, lineHeight: "15px", fontWeight: 600, letterSpacing: "0.6px",
          }}
        >
          {date}
        </span>
      )}
    </>
  );
  const box: CSSProperties = { left: x, top: y, width: w, height: h, borderRadius: r };
  if (reduce) return <div className="pnl-photo absolute" style={box}>{body}</div>;
  return (
    <motion.div
      className="pnl-photo absolute"
      style={box}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {body}
    </motion.div>
  );
}
