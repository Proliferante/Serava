"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { Ico, type IconName } from "@/components/panel/icons";
import {
  BAR_FILL, CARD, DRIFT, GREEN_CARD, INK, LINE, LINEN, LINEN72, LINEN80,
  MUTED, PHOTO_BG, TRACK, TUSCANY, VERD,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL — primitivas de la vista fluida (por debajo de 1280).

   Las de `components/panel/ui.tsx` van posicionadas al píxel sobre un lienzo
   de 1920: aquí no sirven. Éstas son las mismas piezas —tarjeta, indicador,
   barra, anillo, píldora, fila de documento, fila de estado, botón— pero
   apiladas y con el ancho de su columna.

   Los colores, radios y pesos son los mismos tokens del escritorio, así que
   una tarjeta de aquí y una de allí se ven iguales; lo único que cambia es que
   dejan de estar colocadas a mano.

   Todo el movimiento es `transform` y `opacity`, y respeta
   `prefers-reduced-motion`.
   ═══════════════════════════════════════════════════════════════════════════ */

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Columna de lectura del panel en pantalla pequeña. */
export const PWRAP = "mx-auto w-full max-w-[760px] px-[16px] sm:px-[24px]";

/* ── Bloques ─────────────────────────────────────────────────────────────── */

/** Bloque que entra al aparecer. La base de todo lo de abajo. */
export function PIn({
  children, className, style, delay = 0, y = 16,
}: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Tarjeta del panel. Mismo lino, mismo borde y mismo radio que la de
 * escritorio; `green` la vuelve verde sólida y `dark` marrón, que son las dos
 * variantes que usan las vistas.
 */
export function PCard({
  children, className, style, delay = 0, green, dark, pad = 18,
}: {
  children: ReactNode; className?: string; style?: CSSProperties; delay?: number;
  green?: boolean; dark?: boolean; pad?: number;
}) {
  const base: CSSProperties = {
    borderRadius: 16,
    padding: pad,
    background: green ? GREEN_CARD : dark ? "linear-gradient(159.8deg, #3d2c1e 0%, #2a1e14 100%)" : CARD,
    border: green || dark ? "none" : `1px solid ${LINE}`,
    boxShadow: green || dark ? undefined : "0 12px 30px -22px rgba(61,44,30,0.5)",
    ...style,
  };
  return (
    <PIn delay={delay} className={className} style={base}>
      {children}
    </PIn>
  );
}

/* ── Tipografía ──────────────────────────────────────────────────────────── */

/** Antetítulo micro en mayúsculas, el de las tarjetas del escritorio. */
export function PEyebrow({ children, color = DRIFT }: { children: ReactNode; color?: string }) {
  return (
    <p className="m-0 uppercase" style={{ fontSize: 11.5, lineHeight: "17px", letterSpacing: "0.7px", fontWeight: 600, color }}>
      {children}
    </p>
  );
}

/** Título de vista: ligero + semibold y su bajada, como el `h1` del lienzo. */
export function PTitle({ light, strong, sub }: { light?: string; strong: string; sub: string }) {
  return (
    <div>
      <motion.h1
        className="m-0 text-[clamp(1.65rem,7vw,2.25rem)] leading-[1.2]"
        style={{ color: INK, fontWeight: 300, letterSpacing: "-0.4px" }}
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {light ? `${light} ` : null}<span style={{ fontWeight: 600 }}>{strong}</span>
      </motion.h1>
      <motion.p
        className="m-0 mt-[8px] text-[14.5px] leading-[1.5]"
        style={{ color: MUTED, fontWeight: 300 }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
      >
        {sub}
      </motion.p>
    </div>
  );
}

/** Línea de texto secundario dentro de una tarjeta. */
export function PNote({ children, size = 13, color = MUTED, className }: { children: ReactNode; size?: number; color?: string; className?: string }) {
  return (
    <p className={`m-0 ${className ?? ""}`} style={{ fontSize: size, lineHeight: `${Math.round(size * 1.44)}px`, fontWeight: 300, color }}>
      {children}
    </p>
  );
}

/** Cabecera de tarjeta: antetítulo a la izquierda y enlace o dato a la derecha. */
export function PCardHead({ label, right, color }: { label: ReactNode; right?: ReactNode; color?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[10px]">
      <PEyebrow color={color}>{label}</PEyebrow>
      {right}
    </div>
  );
}

/** Enlace "Ver todas →": la flecha empuja, como en el escritorio. */
export function PSecLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="pnl-link inline-flex shrink-0 items-center gap-[6px] uppercase" style={{ color: DRIFT }}>
      <span style={{ fontSize: 11, lineHeight: "17px", fontWeight: 600, letterSpacing: "0.9px" }}>{label}</span>
      <span className="pnl-link-arrow inline-flex"><Ico name="arrow" size={12} /></span>
    </a>
  );
}

/** Enlace "Detalles →" en verde, el de los cuatro indicadores del resumen. */
export function PSeeLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="pnl-link mt-[12px] inline-flex items-center gap-[6px]" style={{ color: VERD }}>
      <span style={{ fontSize: 13.5, lineHeight: "19px", fontWeight: 500 }}>{label}</span>
      <span className="pnl-link-arrow inline-flex"><Ico name="arrow" size={14} /></span>
    </a>
  );
}

/* ── Datos ───────────────────────────────────────────────────────────────── */

/** Barra de progreso: el relleno crece al entrar en pantalla. */
export function PBar({ pct, h = 9, fill = BAR_FILL, track = TRACK, delay = 0 }: { pct: number; h?: number; fill?: string; track?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.6 });
  const quieto = useReducedMotion();
  return (
    <div ref={ref} className="w-full overflow-hidden" style={{ height: h, borderRadius: h / 2, background: track }}>
      <motion.div
        style={{ height: "100%", borderRadius: h / 2, background: fill }}
        initial={quieto ? undefined : { width: 0 }}
        animate={{ width: `${quieto || visto ? Math.min(100, Math.max(0, pct)) : 0}%` }}
        transition={{ duration: 1.05, delay, ease: EASE }}
      />
    </div>
  );
}

/** Anillo de progreso con dos líneas al centro. */
export function PRing({ pct, top, bottom, size = 62, delay = 0 }: { pct: number; top: string; bottom: string; size?: number; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { once: true, amount: 0.6 });
  const quieto = useReducedMotion();
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: "block", transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TRACK} strokeWidth={3} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={VERD} strokeWidth={3} strokeLinecap="round"
          strokeDasharray={c}
          initial={quieto ? undefined : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - (quieto || visto ? pct / 100 : 0)) }}
          transition={{ duration: 1.15, delay, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span style={{ fontSize: 15, lineHeight: "22px", fontWeight: 600, color: INK }}>{top}</span>
        <span style={{ fontSize: 9, lineHeight: "12px", fontWeight: 500, color: MUTED, letterSpacing: "0.3px" }}>{bottom}</span>
      </div>
    </div>
  );
}

/** Tarjeta de indicador: etiqueta, cifra y pie. La fila de tres del lienzo. */
export function PStat({
  label, value, note, green, weight = 700, delay = 0,
}: { label: string; value: ReactNode; note: string; green?: boolean; weight?: number; delay?: number }) {
  return (
    <PCard delay={delay} green={green}>
      <PEyebrow color={green ? LINEN72 : undefined}>{label}</PEyebrow>
      <p
        className="m-0 mt-[6px] text-[clamp(1.5rem,7vw,2rem)] leading-[1.2]"
        style={{ fontWeight: weight, color: green ? LINEN : INK, letterSpacing: weight >= 600 ? "-0.5px" : "-1px" }}
      >
        {value}
      </p>
      <PNote className="mt-[5px]" color={green ? LINEN80 : MUTED}>{note}</PNote>
    </PCard>
  );
}

/* ── Etiquetas ───────────────────────────────────────────────────────────── */

const TONOS = {
  green: { bg: "rgba(95,107,62,0.12)", fg: VERD },
  gold: { bg: "rgba(201,168,119,0.2)", fg: "#8a6a3c" },
  tuscany: { bg: "rgba(181,84,47,0.12)", fg: TUSCANY },
  plain: { bg: "rgba(91,67,50,0.1)", fg: MUTED },
} as const;

export type PTone = keyof typeof TONOS;

/** Píldora en línea, para filas de lista y celdas. */
export function PTag({ label, tone = "green", size = 11 }: { label: string; tone?: PTone; size?: number }) {
  const t = TONOS[tone];
  return (
    <span
      className="inline-flex shrink-0 items-center whitespace-nowrap"
      style={{ padding: "3.5px 10px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: size, lineHeight: `${Math.round(size * 1.45)}px`, fontWeight: 600 }}
    >
      {label}
    </span>
  );
}

/** Caja de icono de 34 px, la de la esquina de las tarjetas. */
export function PIconBox({ icon, tone = "green", size = 34 }: { icon: IconName; tone?: "green" | "gold" | "tan"; size?: number }) {
  const t = {
    green: { bg: "rgba(95,107,62,0.1)", fg: VERD, bd: "rgba(95,107,62,0.18)" },
    gold: { bg: "rgba(201,168,119,0.22)", fg: "#8a6a3c", bd: "rgba(201,168,119,0.4)" },
    tan: { bg: "rgba(165,122,78,0.14)", fg: DRIFT, bd: "rgba(165,122,78,0.26)" },
  }[tone];
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, borderRadius: 10, background: t.bg, border: `1px solid ${t.bd}`, color: t.fg }}
    >
      <Ico name={icon} size={Math.round(size * 0.53)} />
    </span>
  );
}

/** Botón del panel en sus tres pesos, a lo ancho de la columna. */
export function PBtn({
  label, icon, tone = "primary", href, onClick, full = true,
}: {
  label: string; icon?: IconName; tone?: "primary" | "tan" | "outline" | "ghost";
  href?: string; onClick?: () => void; full?: boolean;
}) {
  const t = {
    primary: { bg: "#7f8b57", fg: LINEN, bd: "none" },
    tan: { bg: DRIFT, fg: LINEN, bd: "none" },
    outline: { bg: "transparent", fg: INK, bd: `1px solid ${LINE}` },
    ghost: { bg: "transparent", fg: LINEN, bd: "1px solid rgba(247,241,229,0.16)" },
  }[tone];
  const cls = `pnl-btn ${tone === "outline" ? "pnl-btn-outline" : "pnl-btn-solid"} inline-flex h-[48px] items-center justify-center gap-[8px] rounded-full px-[20px] text-[14.5px] font-semibold ${full ? "w-full" : ""}`;
  const style: CSSProperties = { background: t.bg, color: t.fg, border: t.bd };
  const inner = (
    <>
      {icon && <Ico name={icon} size={17} />}
      <span className="whitespace-nowrap">{label}</span>
    </>
  );
  if (href) return <a href={href} className={cls} style={style}>{inner}</a>;
  return <button type="button" onClick={onClick} className={cls} style={style}>{inner}</button>;
}

/* ── Filas ───────────────────────────────────────────────────────────────── */

/** Fila de documento: icono, nombre, pie y descarga. */
export function PDocRow({ name, sub, first, delay = 0 }: { name: string; sub: string; first?: boolean; delay?: number }) {
  return (
    <PIn delay={delay} y={10} className="pnl-row flex items-center gap-[12px] py-[13px]" style={first ? undefined : { borderTop: `1px solid ${LINE}` }}>
      <PIconBox icon="docs" tone="tan" />
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium leading-[1.4]" style={{ color: INK }}>{name}</span>
        <span className="block text-[12px] font-light leading-[1.5]" style={{ color: MUTED }}>{sub}</span>
      </span>
      <button type="button" aria-label={`Descargar ${name}`} className="pnl-link shrink-0" style={{ color: MUTED }}>
        <span className="pnl-link-arrow block"><Ico name="download" size={18} /></span>
      </button>
    </PIn>
  );
}

/** Fila de lista con marca de estado y veredicto opcional a la derecha. */
export function PCheckRow({
  title, sub, badge, badgeColor, tone = "ok", first, delay = 0,
}: {
  title: string; sub: string; badge?: string; badgeColor?: string;
  tone?: "ok" | "warn"; first?: boolean; delay?: number;
}) {
  const t = tone === "warn"
    ? { bg: "rgba(201,168,119,0.22)", fg: "#8a6a3c", icon: "alert" as IconName }
    : { bg: "rgba(95,107,62,0.12)", fg: VERD, icon: "check" as IconName };
  return (
    <PIn delay={delay} y={10} className="pnl-row flex items-start gap-[12px] py-[14px]" style={first ? undefined : { borderTop: `1px solid ${LINE}` }}>
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full" style={{ background: t.bg, color: t.fg }}>
        <Ico name={t.icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold leading-[1.4]" style={{ color: INK }}>{title}</span>
        <span className="mt-[2px] block text-[12.5px] font-light leading-[1.5]" style={{ color: MUTED }}>{sub}</span>
        {badge && (
          <span className="mt-[6px] block text-[12px] font-semibold" style={{ color: badgeColor ?? VERD }}>{badge}</span>
        )}
      </span>
    </PIn>
  );
}

/**
 * Hueco de foto de obra. En el lienzo son cuadrados de 302 px; aquí ocupan la
 * columna con la proporción del diseño, y la etiqueta y la fecha se quedan.
 */
export function PFoto({ label, date, delay = 0, ratio = "4 / 3" }: { label: string; date?: string; delay?: number; ratio?: string }) {
  return (
    <PIn delay={delay} y={14} className="pnl-photo relative overflow-hidden" style={{ borderRadius: 10, aspectRatio: ratio }}>
      <span className="pnl-photo-img absolute inset-0" style={{ background: PHOTO_BG }} />
      <span
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center uppercase"
        style={{ fontSize: 10.5, lineHeight: "14px", fontWeight: 500, letterSpacing: "1.1px", color: "rgba(91,67,50,0.42)" }}
      >
        {label}
      </span>
      {date && (
        <span
          className="absolute bottom-[8px] left-[8px] uppercase"
          style={{ padding: "2px 7px", borderRadius: 6, background: "rgba(40,29,20,0.78)", color: LINEN80, fontSize: 10, lineHeight: "15px", fontWeight: 600, letterSpacing: "0.6px" }}
        >
          {date}
        </span>
      )}
    </PIn>
  );
}

/**
 * Tabla apilada: cada fila del escritorio se convierte en una ficha de
 * etiqueta y valor. Una tabla de cinco columnas a 390 px no se puede leer ni
 * con desplazamiento horizontal; en fichas sí.
 */
export function PTabla({
  filas,
}: {
  filas: { titulo: string; derecha?: ReactNode; datos: [string, ReactNode][] }[];
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      {filas.map((f, i) => (
        <PIn key={f.titulo} delay={0.05 + i * 0.05} y={10} className="rounded-[12px] p-[14px]" style={{ background: "#fbf8f1", border: `1px solid ${LINE}` }}>
          <div className="flex items-center justify-between gap-[10px]">
            <span className="text-[14.5px] font-semibold" style={{ color: INK }}>{f.titulo}</span>
            {f.derecha}
          </div>
          <dl className="m-0 mt-[10px] grid grid-cols-2 gap-x-[12px] gap-y-[8px]">
            {f.datos.map(([k, v]) => (
              <div key={k}>
                <dt className="m-0 uppercase" style={{ fontSize: 10, lineHeight: "15px", fontWeight: 600, letterSpacing: "0.7px", color: MUTED }}>{k}</dt>
                <dd className="m-0 mt-[2px] text-[14px] font-medium" style={{ color: INK }}>{v}</dd>
              </div>
            ))}
          </dl>
        </PIn>
      ))}
    </div>
  );
}
