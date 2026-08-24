"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId, type CSSProperties, type ReactNode } from "react";
import { EASE } from "@/components/motion/Kinetics";

/* ═══════════════════════════════════════════════════════════════════════════
   ÁREA DE CUENTA — tokens y primitivas del lienzo de 1920.

   Sirven a las dos pantallas del diseño: "Mi perfil" (688:4032) y
   "Configuración" (688:4280). Comparten fondo, tarjeta, campo, desplegable,
   botón e interruptor, y sólo cambian de contenido.

   `get_design_context` se cuelga en este archivo de Figma, así que la
   geometría viene de `get_metadata` —literal, hasta los decimales— y el color
   de muestrear los píxeles de los pantallazos, como se hizo con el panel. Lo
   que salió con cuentas redondas:

   · tarjeta verde   #5f6b3e con filete de lino al 12 %
   · campo           lino al 5 % con filete de lino al 12 %
   · tarjeta oscura  lino al 4 % sobre el marrón de la página
   · etiquetas       lino al 60 %; bajadas de sección, al 40 %
   · antetítulo y título de sección, dorado #c9a877
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Paleta ──────────────────────────────────────────────────────────────── */
export const BROWN = "#492100";     // fondo de la página
export const VERD = "#5f6b3e";      // tarjeta
export const LINEN = "#f7f1e5";     // texto fuerte
export const LASER = "#c9a877";     // antetítulo y títulos de sección
export const OLIVE = "#9aa66f";     // texto de la píldora "Inversionista desde"
export const AVOCADO = "#7f8b57";   // botón sólido e interruptor encendido

export const L60 = "rgba(247,241,229,0.6)";
export const L40 = "rgba(247,241,229,0.4)";
export const L12 = "rgba(247,241,229,0.12)";
export const L10 = "rgba(247,241,229,0.1)";
export const L06 = "rgba(247,241,229,0.06)";
export const L05 = "rgba(247,241,229,0.05)";
export const L04 = "rgba(247,241,229,0.04)";

/** Píldora "Inversionista desde 2024": verde apagado sobre la tarjeta oscura. */
export const TAG_BG = "#573916";
/** Botón de cerrar sesión: marrón con filete y letra de terracota. */
export const DANGER_BG = BROWN;
export const DANGER_LINE = "#7e3a17";
export const DANGER_FG = "#e39c82";
/** Degradado del avatar de 96 px, de la esquina clara a la oscura. */
export const AVATAR_BG = "linear-gradient(135deg, #916c46 0%, #513c27 100%)";

export const CARD_R = 16;
export const FIELD_R = 10;
export const BTN_R = 12;

/* ── Retícula del diseño ─────────────────────────────────────────────────── */
/** Los dos frames miden 1920 de ancho, con la columna útil de 1012 en x=454. */
export const COL_X = 454;
export const COL_W = 1012;
/** El velo decorativo del borde derecho arranca aquí. */
export const MOTIF_X = 1190;

/* ── Escala tipográfica ──────────────────────────────────────────────────── */
export const T = {
  eyebrow: { fontSize: 11.2, lineHeight: "17px", fontWeight: 600, letterSpacing: 2.4, textTransform: "uppercase", color: LASER } as CSSProperties,
  lead: { fontSize: 15.4, lineHeight: "24px", fontWeight: 300, color: L60 } as CSSProperties,
  sectitle: { fontSize: 11.5, lineHeight: "18px", fontWeight: 600, letterSpacing: 1.6, textTransform: "uppercase", color: LASER } as CSSProperties,
  secsub: { fontSize: 14.2, lineHeight: "20px", fontWeight: 300, color: L40 } as CSSProperties,
  label: { fontSize: 10.8, lineHeight: "16px", fontWeight: 500, letterSpacing: 1.1, textTransform: "uppercase", color: L60 } as CSSProperties,
  value: { fontSize: 15, lineHeight: "22px", fontWeight: 400, color: LINEN } as CSSProperties,
  option: { fontSize: 13.8, lineHeight: "15px", fontWeight: 400, color: LINEN } as CSSProperties,
  btn: { fontSize: 15, lineHeight: "22px", fontWeight: 500 } as CSSProperties,
};

/* ── Posición ────────────────────────────────────────────────────────────── */

/** Capa absoluta con la geometría literal de Figma. */
export function L({ x, y, w, h, className, style, children }: {
  x: number; y: number; w?: number; h?: number; className?: string; style?: CSSProperties; children?: ReactNode;
}) {
  return (
    <div className={`absolute ${className ?? ""}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

/**
 * Velo del borde derecho (688:4033). En el diseño es un rectángulo recortado
 * por una máscara de 730 px; muestreado resulta ser un degradado horizontal
 * que va de nada a lino al 3 %: apenas seis puntos de luz sobre el marrón, lo
 * justo para que el lado del formulario no quede plano.
 */
export function Motif({ h }: { h: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        left: MOTIF_X, top: 0, width: 1920 - MOTIF_X, height: h,
        background: "linear-gradient(90deg, rgba(247,241,229,0) 0%, rgba(247,241,229,0.03) 100%)",
      }}
    />
  );
}

/** Encabezado de página: antetítulo, titular y bajada (688:4052 / 688:4299). */
export function Head({ y, title, lead }: { y: number; title: ReactNode; lead: string }) {
  const quieto = useReducedMotion();
  const entra = (delay: number) =>
    quieto ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: EASE } };
  return (
    <>
      <motion.p className="absolute m-0 whitespace-nowrap" style={{ left: COL_X, top: y + 14, ...T.eyebrow }} {...entra(0)}>
        Tu cuenta
      </motion.p>
      <motion.h1
        className="absolute m-0"
        style={{ left: COL_X, top: y + 43, width: COL_W, fontSize: 46, lineHeight: "60px", letterSpacing: -0.6, color: LINEN }}
        {...entra(0.08)}
      >
        {title}
      </motion.h1>
      <motion.p className="absolute m-0" style={{ left: COL_X, top: y + 111, width: COL_W, ...T.lead }} {...entra(0.16)}>
        {lead}
      </motion.p>
    </>
  );
}

/** Tarjeta verde. Es el contenedor de todas las secciones del formulario. */
export function Card({ x, y, w, h, delay = 0, children }: {
  x: number; y: number; w: number; h: number; delay?: number; children?: ReactNode;
}) {
  const quieto = useReducedMotion();
  const base: CSSProperties = {
    left: x, top: y, width: w, height: h,
    borderRadius: CARD_R, background: VERD, border: `1px solid ${L12}`,
  };
  if (quieto) return <div className="absolute" style={base}>{children}</div>;
  return (
    <motion.div
      className="absolute" style={base}
      initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Título de sección dentro de una tarjeta. */
export function SecTitle({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  return <p className="absolute m-0 whitespace-nowrap" style={{ left: x, top: y, width: w, ...T.sectitle }}>{children}</p>;
}

/** Bajada del título de sección. */
export function SecSub({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  return <p className="absolute m-0" style={{ left: x, top: y, width: w, ...T.secsub }}>{children}</p>;
}

/* ── Campos ──────────────────────────────────────────────────────────────── */

const CAJA: CSSProperties = { borderRadius: FIELD_R, background: L05, border: `1px solid ${L12}` };

/**
 * Campo de texto: etiqueta arriba y caja debajo, con la geometría del diseño
 * (etiqueta de 16 px de alto, caja de 49 a 22 px de la etiqueta).
 *
 * `readOnly` es para "Gestor asignado", que en el diseño se ve apagado: no es
 * un dato que el inversionista cambie, lo asigna Zequara.
 */
export function Field({
  x, y, w, label, value, onChange, type = "text", h = 49, readOnly, autoComplete, placeholder,
}: {
  x: number; y: number; w: number; label: string; value: string;
  onChange?: (v: string) => void; type?: string; h?: number; readOnly?: boolean;
  autoComplete?: string; placeholder?: string;
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="absolute m-0 block whitespace-nowrap" style={{ left: x, top: y, width: w, ...T.label }}>{label}</label>
      <input
        id={id} type={type} value={value} readOnly={readOnly} autoComplete={autoComplete} placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="ix-field absolute block appearance-none outline-none"
        style={{
          left: x, top: y + 22, width: w, height: h, ...CAJA,
          padding: "0 15px", color: readOnly ? L60 : LINEN,
          fontSize: T.value.fontSize, fontWeight: T.value.fontWeight,
          colorScheme: "dark", cursor: readOnly ? "default" : "text",
        }}
      />
    </>
  );
}

/** Chevron de los desplegables (Component 2 del diseño, 14 × 14). */
function Chevron({ x, y }: { x: number; y: number }) {
  return (
    <svg
      aria-hidden className="pointer-events-none absolute" style={{ left: x, top: y }}
      width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={L60} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * Desplegable. La caja mide 41 px y no 49 como los campos de texto: es lo que
 * pide el diseño, porque un `select` nativo no lleva el mismo aire dentro.
 */
export function Select({
  x, y, w, label, value, onChange, options,
}: {
  x: number; y: number; w: number; label: string; value: string; onChange: (v: string) => void; options: readonly string[];
}) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="absolute m-0 block whitespace-nowrap" style={{ left: x, top: y, width: w, ...T.label }}>{label}</label>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="ix-field absolute block appearance-none outline-none"
        style={{
          left: x, top: y + 22, width: w, height: 41, ...CAJA,
          padding: "0 36px 0 15px", color: LINEN,
          fontSize: T.option.fontSize, fontWeight: T.option.fontWeight, cursor: "pointer",
        }}
      >
        {options.map((o) => <option key={o} value={o} style={{ background: VERD, color: LINEN }}>{o}</option>)}
      </select>
      <Chevron x={x + w - 27} y={y + 35.5} />
    </>
  );
}

/* ── Botones ─────────────────────────────────────────────────────────────── */

export type BtnTono = "solid" | "ghost" | "danger";

const TONO: Record<BtnTono, CSSProperties> = {
  solid: { background: AVOCADO, color: LINEN, border: "1px solid transparent" },
  ghost: { background: "transparent", color: LINEN, border: `1px solid ${L12}` },
  danger: { background: DANGER_BG, color: DANGER_FG, border: `1px solid ${DANGER_LINE}` },
};

/**
 * Botón del formulario. El icono va a la izquierda, como en el diseño. Con
 * `href` sale un enlace en lugar de un botón: es lo que necesita "Cerrar
 * sesión", que lleva de vuelta al acceso.
 */
export function Btn({
  x, y, w, h, tono = "solid", icon, onClick, href, children,
}: {
  x: number; y: number; w: number; h: number; tono?: BtnTono;
  icon?: ReactNode; onClick?: () => void; href?: string; children: ReactNode;
}) {
  const clase = `pnl-btn ${tono === "ghost" ? "pnl-ghost" : "pnl-btn-solid"} absolute flex cursor-pointer items-center justify-center gap-[9px] no-underline`;
  const estilo: CSSProperties = { left: x, top: y, width: w, height: h, borderRadius: BTN_R, ...TONO[tono], ...T.btn };
  const dentro = (
    <>
      {icon}
      <span className="whitespace-nowrap">{children}</span>
    </>
  );
  if (href) return <a href={href} className={clase} style={estilo}>{dentro}</a>;
  return <button type="button" onClick={onClick} className={clase} style={estilo}>{dentro}</button>;
}

/* ── Iconos ──────────────────────────────────────────────────────────────── */

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function IcoCheck({ size = 16 }: { size?: number }) {
  return <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" {...trazo}><path d="M20 6 9 17l-5-5" /></svg>;
}

export function IcoLock({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" {...trazo}>
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IcoSalir({ size = 16 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" {...trazo}>
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M15 8l4 4-4 4M19 12H9" />
    </svg>
  );
}

/* ── Interruptor ─────────────────────────────────────────────────────────── */

/**
 * Interruptor de los avisos (688:4375). Pista de 44 × 24 y perilla de 20, que
 * recorre 22 px: encendido queda a la derecha, apagado a la izquierda. La
 * pista apagada es lino al 15 %, la encendida el aguacate del botón sólido.
 */
export function Toggle({
  x, y, on, onToggle, label,
}: { x: number; y: number; on: boolean; onToggle: () => void; label: string }) {
  const quieto = useReducedMotion();
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle}
      className="absolute cursor-pointer p-0"
      style={{
        left: x, top: y, width: 44, height: 24, borderRadius: 999, border: "none",
        background: on ? AVOCADO : "rgba(247,241,229,0.15)",
        transition: "background-color 0.25s ease",
      }}
    >
      <motion.span
        aria-hidden className="absolute block"
        style={{ top: 2, width: 20, height: 20, borderRadius: 999, background: "#ffffff" }}
        initial={false}
        animate={{ left: on ? 22 : 2 }}
        transition={quieto ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 32 }}
      />
    </button>
  );
}

/**
 * Aviso de guardado (div#toast). En el diseño es una pastilla de 71 × 43
 * centrada al pie del lienzo con sólo un visto dentro; aparece al guardar y se
 * va sola. Se anuncia por `role="status"` para que también se oiga.
 */
export function Toast({ y, visible }: { y: number; visible: boolean }) {
  return (
    <motion.div
      role="status" aria-live="polite"
      className="absolute flex items-center justify-center"
      style={{
        left: 924.5, top: y, width: 71, height: 43, borderRadius: 14,
        background: AVOCADO, color: LINEN, boxShadow: "0 18px 34px -18px rgba(0,0,0,0.55)",
      }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <span className="sr-only">Cambios guardados</span>
      <IcoCheck size={17} />
    </motion.div>
  );
}
