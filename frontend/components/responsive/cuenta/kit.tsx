"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useId, type CSSProperties, type ReactNode } from "react";
import { CUENTA_LINKS } from "@/components/sections/cuenta/data";
import { EASE, In } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   ÁREA DE CUENTA — piezas de la vista fluida (móvil y tablet).

   El lienzo pone los campos a dos columnas de 301 px con todo en absoluto. A
   390 no cabe: aquí la retícula es de una columna y pasa a dos desde 640, que
   es donde dos campos de formulario vuelven a leerse sin apretarse.

   Lo que cambia de forma respecto al escritorio, y por qué:

   · La ficha del perfil deja de estar centrada en una columna de 320 y se pone
     en fila —avatar, nombre, correo—: apilada gastaba media pantalla antes de
     llegar al primer dato.
   · Las cajas suben de 49 a 52 px y los interruptores llevan toda su fila como
     zona de toque; con el dedo, 24 px de pista no se aciertan.
   · Los botones de guardar ocupan el ancho. En el lienzo van alineados a la
     derecha porque hay sitio; aquí el ancho completo es el objetivo grande.
   · Se añade el par de pestañas "Mi perfil / Configuración". En el lienzo las
     dos pantallas sólo se alcanzan por el menú del avatar, y esconder la
     navegación de una sección de dos pantallas en un desplegable, en móvil,
     es una pulsación de más en el sitio equivocado.

   Los colores y los pesos son los mismos que en `sections/cuenta/ui.tsx`, que
   es donde está documentado de dónde sale cada uno.
   ═══════════════════════════════════════════════════════════════════════════ */

export const BROWN = "#492100";
export const VERD = "#5f6b3e";
export const LINEN = "#f7f1e5";
export const LASER = "#c9a877";
export const OLIVE = "#9aa66f";
export const AVOCADO = "#7f8b57";
export const L60 = "rgba(247,241,229,0.6)";
export const L40 = "rgba(247,241,229,0.4)";
export const L12 = "rgba(247,241,229,0.12)";
export const L10 = "rgba(247,241,229,0.1)";
export const L06 = "rgba(247,241,229,0.06)";
export const L05 = "rgba(247,241,229,0.05)";
export const L04 = "rgba(247,241,229,0.04)";
export const TAG_BG = "#573916";
export const DANGER_LINE = "#7e3a17";
export const DANGER_FG = "#e39c82";
export const AVATAR_BG = "linear-gradient(135deg, #916c46 0%, #513c27 100%)";

const CAJA: CSSProperties = {
  height: 52, borderRadius: 12, background: L05, border: `1px solid ${L12}`,
  padding: "0 15px", color: LINEN, fontSize: 15.5, fontWeight: 400,
};

const ETIQUETA = "m-0 block text-[10.5px] font-medium uppercase leading-[16px] tracking-[1.2px]";

/** Las dos pestañas de la sección. Marcan cuál estás viendo. */
export function CuentaTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Tu cuenta" className="mt-[18px]">
      <div className="flex gap-[4px] rounded-full p-[5px]" style={{ background: L04, border: `1px solid ${L12}` }}>
        {CUENTA_LINKS.map((l, i) => {
          const aqui = pathname === l.href;
          return (
            <a
              key={l.href}
              href={l.href}
              aria-current={aqui ? "page" : undefined}
              className="ix-pill ix-pill-fluid relative flex h-[38px] flex-1 items-center justify-center whitespace-nowrap rounded-full px-[12px] text-[13px] font-medium sm:text-[13.6px]"
            >
              {aqui && (
                <motion.span
                  aria-hidden className="absolute inset-0 rounded-full" style={{ background: AVOCADO }}
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.06 + i * 0.03, ease: EASE }}
                />
              )}
              <span className="relative">{l.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/** Tarjeta verde con su título de sección y, si hace falta, su bajada. */
export function AcctCard({
  titulo, sub, delay = 0, children,
}: { titulo: string; sub?: string; delay?: number; children: ReactNode }) {
  return (
    <In delay={delay} y={18} className="mt-[14px] rounded-[18px] p-[20px] sm:p-[22px]" style={{ background: VERD, border: `1px solid ${L12}` }}>
      <p className="m-0 text-[11px] font-semibold uppercase leading-[18px] tracking-[1.6px]" style={{ color: LASER }}>{titulo}</p>
      {sub && <p className="m-0 mt-[6px] text-[13.5px] font-light leading-[19px]" style={{ color: L40 }}>{sub}</p>}
      <div className="mt-[16px]">{children}</div>
    </In>
  );
}

/**
 * Retícula de campos: una columna, dos desde 640. `Full` es el campo que
 * ocupa las dos, como la dirección o la contraseña actual del diseño.
 */
export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">{children}</div>;
}

export function Full({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

/** Campo de texto. `readOnly` deja el valor apagado, como el gestor asignado. */
export function FField({
  label, value, onChange, type = "text", readOnly, autoComplete, placeholder,
}: {
  label: string; value: string; onChange?: (v: string) => void; type?: string;
  readOnly?: boolean; autoComplete?: string; placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={ETIQUETA} style={{ color: L60 }}>{label}</label>
      <input
        id={id} type={type} value={value} readOnly={readOnly} autoComplete={autoComplete} placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="ix-field mt-[6px] block w-full appearance-none outline-none"
        style={{ ...CAJA, color: readOnly ? L60 : LINEN, colorScheme: "dark", cursor: readOnly ? "default" : "text" }}
      />
    </div>
  );
}

/** Desplegable, con el chevron dibujado encima del `select` nativo. */
export function FSelect({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={ETIQUETA} style={{ color: L60 }}>{label}</label>
      <div className="relative mt-[6px]">
        <select
          id={id} value={value} onChange={(e) => onChange(e.target.value)}
          className="ix-field block w-full appearance-none outline-none"
          style={{ ...CAJA, paddingRight: 40, cursor: "pointer" }}
        >
          {options.map((o) => <option key={o} value={o} style={{ background: VERD, color: LINEN }}>{o}</option>)}
        </select>
        <svg
          aria-hidden className="pointer-events-none absolute right-[15px] top-1/2 -translate-y-1/2"
          width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={L60} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Fila de aviso. La fila entera es el botón: en táctil la pista de 44 × 24 es
 * un objetivo demasiado fino, y así el toque cae donde se está leyendo.
 */
export function FToggleRow({
  titulo, detalle, on, onToggle, ultima,
}: { titulo: string; detalle: string; on: boolean; onToggle: () => void; ultima?: boolean }) {
  const quieto = useReducedMotion();
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={onToggle}
      className="flex w-full cursor-pointer items-center gap-[14px] py-[14px] text-left"
      style={{ borderBottom: ultima ? undefined : `1px solid ${L10}`, background: "none", border: ultima ? "none" : undefined }}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[15.5px] font-normal leading-[22px]" style={{ color: LINEN }}>{titulo}</span>
        <span className="mt-[2px] block text-[13px] font-light leading-[18px]" style={{ color: L40 }}>{detalle}</span>
      </span>
      <span
        aria-hidden className="relative block shrink-0"
        style={{ width: 44, height: 24, borderRadius: 999, background: on ? AVOCADO : "rgba(247,241,229,0.15)", transition: "background-color 0.25s ease" }}
      >
        <motion.span
          className="absolute block"
          style={{ top: 2, width: 20, height: 20, borderRadius: 999, background: "#ffffff" }}
          initial={false} animate={{ left: on ? 22 : 2 }}
          transition={quieto ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 32 }}
        />
      </span>
    </button>
  );
}

/** Fila de botones al pie de una tarjeta. */
export function Acciones({ children }: { children: ReactNode }) {
  return <div className="mt-[18px] flex flex-col gap-[10px] sm:flex-row sm:justify-end">{children}</div>;
}

export type ABtnTono = "solid" | "ghost" | "danger";

const TONO: Record<ABtnTono, CSSProperties> = {
  solid: { background: AVOCADO, color: LINEN, border: "1px solid transparent" },
  ghost: { background: "transparent", color: LINEN, border: `1px solid ${L12}` },
  danger: { background: BROWN, color: DANGER_FG, border: `1px solid ${DANGER_LINE}` },
};

/** Botón de 52 px: el mínimo cómodo para el pulgar. */
export function ABtn({
  tono = "solid", icon, onClick, href, children,
}: { tono?: ABtnTono; icon?: ReactNode; onClick?: () => void; href?: string; children: ReactNode }) {
  const clase = "ix-press flex h-[52px] w-full items-center justify-center gap-[9px] rounded-[12px] text-[15px] font-medium no-underline sm:w-auto sm:px-[22px]";
  const estilo: CSSProperties = TONO[tono];
  const dentro = <>{icon}<span className="whitespace-nowrap">{children}</span></>;
  if (href) return <a href={href} className={clase} style={estilo}>{dentro}</a>;
  return <button type="button" onClick={onClick} className={clase} style={estilo}>{dentro}</button>;
}

/**
 * Acuse de guardado. Es el `div#toast` del diseño, que allí va centrado al pie
 * del lienzo; aquí queda fijo sobre el borde inferior de la pantalla, por
 * encima del hueco del pulgar.
 */
export function AcctToast({ visible }: { visible: boolean }) {
  return (
    <motion.div
      role="status" aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[24px] z-50 flex justify-center"
      initial={false} animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ duration: 0.28, ease: EASE }}
    >
      <span
        className="flex items-center gap-[9px] rounded-full px-[18px] py-[11px] text-[14px] font-medium"
        style={{ background: AVOCADO, color: LINEN, boxShadow: "0 18px 34px -18px rgba(0,0,0,0.6)" }}
      >
        <svg aria-hidden width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Cambios guardados
      </span>
    </motion.div>
  );
}
