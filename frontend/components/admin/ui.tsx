"use client";

import type { CSSProperties, ReactNode } from "react";
import { AREAS, EST, type AreaKey } from "@/components/admin/data";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSOLA INTERNA — primitivas.

   Las clases (`card`, `kpi`, `est`, `area-chip`, `task`, `frow`…) son las del
   archivo original y viven en `styles/admin.css`, acotadas bajo `.adm`. Aquí
   solo se les pone una firma de TypeScript para que las diez vistas no
   repitan cadenas de clases a mano y para que el compilador avise cuando una
   etiqueta de estado o un área no existen.

   Los SVG sueltos se dejaron dentro de cada vista, como estaban. Solo subieron
   aquí los que se repetían de verdad: el visto, la descarga, el más, el ojo y
   el lápiz.
   ═══════════════════════════════════════════════════════════════════════════ */

const trazo = {
  fill: "none", stroke: "currentColor", strokeWidth: 2,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

export const IcoCheck = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M20 6L9 17l-5-5" /></svg>;
export const IcoDown = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M12 3v12M8 11l4 4 4-4" /><path d="M4 17v3h16v-3" /></svg>;
export const IcoPlus = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M12 5v14M5 12h14" /></svg>;
export const IcoEye = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>;
export const IcoEdit = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>;
export const IcoTrash = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>;
export const IcoBack = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
export const IcoExt = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14L21 3" /></svg>;

/* ── Contenedores ────────────────────────────────────────────────────────── */

export function Card({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return <div className={`card${className ? " " + className : ""}`} style={style}>{children}</div>;
}

export function SecTitle({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return <div className="sectitle" style={style}>{children}</div>;
}

export function Hint({ style, children }: { style?: CSSProperties; children: ReactNode }) {
  return <div className="hint" style={style}>{children}</div>;
}

/** Cabecera de vista: título con la última palabra en negrita y su bajada. */
export function VHead({ titulo, fuerte, children, acciones }: {
  titulo?: string; fuerte: string; children?: ReactNode; acciones?: ReactNode;
}) {
  return (
    <div className="vhead">
      <div>
        <h1>{titulo ? <>{titulo} <b>{fuerte}</b></> : <b>{fuerte}</b>}</h1>
        {children && <p>{children}</p>}
      </div>
      {acciones}
    </div>
  );
}

/** Rejilla del original: `g2`…`g5` son el número de columnas en escritorio. */
export function Grid({ cols, className, style, children }: {
  cols: 2 | 3 | 4 | 5; className?: string; style?: CSSProperties; children: ReactNode;
}) {
  return <div className={`grid g${cols}${className ? " " + className : ""}`} style={style}>{children}</div>;
}

/**
 * Envoltura de tabla. Es lo único que se añadió al maquetado original: las
 * siete tablas de la consola no tenían dónde desplazarse y a 390 px empujaban
 * la página entera en horizontal. `ancho` fija el mínimo legible mientras se
 * arrastra — una tabla de siete columnas comprimida no se lee, se adivina.
 */
export function Tabla({ ancho = "lg", children }: { ancho?: "lg" | "md" | "auto"; children: ReactNode }) {
  const c = ancho === "auto" ? "tsc" : `tsc tsc-${ancho}`;
  return <div className={c}><table>{children}</table></div>;
}

/* ── Piezas ──────────────────────────────────────────────────────────────── */

export function Kpi({ lbl, v, h, alert, ico, vSize }: {
  lbl: string; v: ReactNode; h?: ReactNode; alert?: boolean; ico?: ReactNode; vSize?: number;
}) {
  return (
    <div className={`card kpi${alert ? " alert" : ""}`}>
      <div className="top">
        <span className="lbl">{lbl}</span>
        {ico && <div className="ic">{ico}</div>}
      </div>
      <div className="v" style={vSize ? { fontSize: `${vSize}rem` } : undefined}>{v}</div>
      {h != null && <div className="h">{h}</div>}
    </div>
  );
}

/** Píldora de estado del predio. */
export function Est({ k, style }: { k: string; style?: CSSProperties }) {
  const e = EST[k];
  if (!e) return <span className="est" style={style}>{k}</span>;
  return <span className={`est ${e.c}`} style={style}>{e.t}</span>;
}

/** Píldora libre de estado, para etapas del embudo comercial y el Admin. */
export function EstLibre({ c, style, children }: { c: string; style?: CSSProperties; children: ReactNode }) {
  return <span className={`est ${c}`} style={style}>{children}</span>;
}

export function AreaChip({ a, style }: { a: AreaKey; style?: CSSProperties }) {
  return <span className={`area-chip a-${a}`} style={style}>{AREAS[a]}</span>;
}

/** Fila de "requiere atención": punto de color, texto, subtexto y acción. */
export function Task({ color, children, small, accion }: {
  color: string; children: ReactNode; small?: ReactNode; accion?: ReactNode;
}) {
  return (
    <div className="task">
      <span className="dot" style={{ background: color }} />
      <div className="tx">{children}{small && <small>{small}</small>}</div>
      {accion}
    </div>
  );
}

/** Fila clave/valor de los dossiers. */
export function Frow({ k, v, vColor }: { k: ReactNode; v: ReactNode; vColor?: string }) {
  return (
    <div className="frow">
      <span className="k">{k}</span>
      <span className="v" style={vColor ? { color: vColor } : undefined}>{v}</span>
    </div>
  );
}

/** Etapa del embudo. */
export function FStage({ n, l, pct, color }: { n: ReactNode; l: string; pct: number; color?: string }) {
  return (
    <div className="fstage">
      <div className="n">{n}</div>
      <div className="l">{l}</div>
      <div className="bar" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }} />
    </div>
  );
}

/** Anillo del score. El valor entra por la variable CSS `--v`, de 0 a 100. */
export function Ring({ v, children }: { v: number; children?: ReactNode }) {
  return <span className="ring" style={{ "--v": v } as CSSProperties}>{children}</span>;
}

/** Interruptor de "publicado" de la tabla de predios. */
export function Tgl({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label}
      className={`tgl${on ? " on" : ""}`} onClick={onToggle}
    />
  );
}

/** Botón con icono. `tono` mapea a las clases `btn-primary` / `btn-ghost`. */
export function Btn({ tono = "ghost", onClick, disabled, title, style, className, children }: {
  tono?: "primary" | "ghost"; onClick?: () => void; disabled?: boolean;
  title?: string; style?: CSSProperties; className?: string; children: ReactNode;
}) {
  return (
    <button
      type="button" onClick={onClick} disabled={disabled} title={title} style={style}
      className={`btn btn-${tono}${className ? " " + className : ""}`}
    >
      {children}
    </button>
  );
}

/** Enlace con pinta de botón. */
export function BtnLink({ href, target, tono = "ghost", children }: {
  href: string; target?: string; tono?: "primary" | "ghost"; children: ReactNode;
}) {
  return (
    <a href={href} target={target} rel={target === "_blank" ? "noopener" : undefined} className={`btn btn-${tono}`}>
      {children}
    </a>
  );
}

/** Marca de dato: `in` real, `na` estimado, `atip` atípico, `desc` descartado. */
export function MkChip({ t, title, children }: { t: "in" | "na" | "atip" | "desc"; title?: string; children: ReactNode }) {
  return <span className={`mk-chip mk-${t}`} title={title}>{children}</span>;
}
