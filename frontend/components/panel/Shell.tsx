"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "@/components/motion/Kinetics";
import { MARK } from "@/components/brand";
import { Ico, type IconName } from "@/components/panel/icons";
import {
  HELPBG, LASER, LINEN, LINEN40, LINEN72, OIL, PAPER, SHELL, TUSCANY,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   SHELL DEL PANEL — sidebar (472:1519) + topbar (472:1611).

   Es el marco que comparten las nueve vistas del área privada: el sidebar de
   248 px a la izquierda y la barra de proyecto de 74.95 px sobre el contenido.
   Las nueve vistas se dibujan dentro de `div.content`, con un margen de 34 px.

   El alto lo pone cada vista, porque los frames de Figma van de 1200 px
   (Presupuesto) a 2168 px (Avance de obra).
   ═══════════════════════════════════════════════════════════════════════════ */

/** Ancho del sidebar. El contenido arranca justo después. */
export const SIDEBAR_W = 248;
/** Alto de la barra de proyecto. */
export const TOPBAR_H = 74.95;
/** Margen del área de contenido respecto al marco. */
export const PAD = 34;
/** Ancho útil de una vista: 1920 − 248 − 34 × 2. */
export const VIEW_W = 1604;

export type PanelKey =
  | "resumen" | "avance" | "presupuesto" | "aprobaciones" | "interventoria"
  | "operacion" | "fotos" | "valor" | "documentos" | "gestor";

type NavItem = { key: PanelKey; label: string; icon: IconName; href: string; badge?: number };

/**
 * Los dos grupos del sidebar, con los `top` literales de Figma. Se toman del
 * frame de Operación del activo (600:2073), que es el más reciente y el único
 * con los diez items: los frames anteriores traían pasos de 47 px y sólo
 * nueve, sin "Operación del activo".
 */
const GROUPS: { label: string; top: number; items: NavItem[]; tops: number[] }[] = [
  {
    label: "Tu obra",
    top: 94,
    tops: [117, 162.61, 208.22, 253.83, 299.44],
    items: [
      { key: "resumen", label: "Resumen", icon: "home", href: "/panel" },
      { key: "avance", label: "Avance de obra", icon: "progress", href: "/panel/avance" },
      { key: "presupuesto", label: "Presupuesto", icon: "budget", href: "/panel/presupuesto" },
      { key: "aprobaciones", label: "Aprobaciones", icon: "approvals", href: "/panel/aprobaciones", badge: 2 },
      { key: "interventoria", label: "Interventoría", icon: "audit", href: "/panel/interventoria" },
    ],
  },
  {
    label: "Tu activo",
    top: 359.05,
    tops: [382.05, 427.66, 473.27, 518.88, 564.49],
    items: [
      { key: "operacion", label: "Operación del activo", icon: "key", href: "/panel/operacion" },
      { key: "fotos", label: "Fotos y avance visual", icon: "photos", href: "/panel/fotos" },
      { key: "valor", label: "Proyección de valor", icon: "value", href: "/panel/valor" },
      { key: "documentos", label: "Documentos", icon: "docs", href: "/panel/documentos" },
      { key: "gestor", label: "Mi gestor", icon: "manager", href: "/panel/gestor" },
    ],
  },
];

/** Fila de navegación. La activa se rellena en un marrón más claro. */
function NavRow({ item, active, delay }: { item: NavItem; active: boolean; delay: number }) {
  const reduce = useReducedMotion();
  const row = (
    <a
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="pnl-navitem absolute flex items-center"
      style={{ left: 0, top: 0, width: 216, height: 45, borderRadius: 11 }}
    >
      <span className="pnl-navitem-ico absolute" style={{ left: 12, top: 13 }}>
        <Ico name={item.icon} size={18} />
      </span>
      <span
        className="pnl-navitem-label absolute whitespace-nowrap"
        style={{ left: 43, top: 11, fontSize: 14.4, lineHeight: "22px" }}
      >
        {item.label}
      </span>
      {item.badge != null && (
        <span
          className="absolute inline-flex items-center justify-center"
          style={{
            left: 182, top: 13, minWidth: 19, height: 19, padding: "0 6px",
            borderRadius: 999, background: TUSCANY, color: LINEN,
            fontSize: 10.5, lineHeight: "19px", fontWeight: 700,
          }}
        >
          {item.badge}
        </span>
      )}
    </a>
  );
  if (reduce) return row;
  return (
    <motion.div
      className="absolute"
      style={{ left: 0, top: 0, width: 216, height: 45 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {row}
    </motion.div>
  );
}

/** Sidebar completo. La caja de ayuda queda anclada al fondo del lienzo. */
function Sidebar({ active, h }: { active: PanelKey; h: number }) {
  let i = 0;
  return (
    <div className="absolute overflow-hidden" style={{ left: 0, top: 0, width: SIDEBAR_W, height: h, background: SHELL }}>
      {/* Marca (472:1521). El diseño tenía dos ranuras —un icono y el wordmark—
          porque el logotipo aún no existía. Con Zequara el monograma cumple las
          dos: es la marca y ocupa la ranura del icono. */}
      <a href="/" aria-label="Zequara — Inicio" className="ix-nav absolute" style={{ left: 26, top: 26, width: 37.26, height: 34 }}>
        <img
          src={MARK}
          alt="Zequara"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 block size-full max-w-none"
        />
      </a>

      {GROUPS.map((g) => (
        <div key={g.label}>
          <p
            className="absolute uppercase m-0"
            style={{
              left: 28, top: g.top, width: 192,
              fontSize: 10, lineHeight: "15px", letterSpacing: "1.3px",
              fontWeight: 600, color: LINEN40,
            }}
          >
            {g.label}
          </p>
          {g.items.map((it, k) => (
            <div key={it.key} className="absolute" style={{ left: 16, top: g.tops[k], width: 216, height: 45 }}>
              <NavRow item={it} active={it.key === active} delay={0.05 + (i++) * 0.035} />
            </div>
          ))}
        </div>
      ))}

      {/* ¿Necesitas ayuda? (472:1594) — pegada al fondo del lienzo. */}
      <a
        href="/panel/gestor"
        className="pnl-nav absolute block"
        style={{ left: 16, bottom: 22, width: 216, height: 89.31, borderRadius: 12, background: HELPBG }}
      >
        <span className="absolute flex items-center justify-center" style={{ left: 17, top: 17, width: 34, height: 34, borderRadius: 999, background: "rgba(201,168,119,0.16)", color: LASER }}>
          <Ico name="help" size={18} />
        </span>
        <span className="absolute m-0" style={{ left: 63, top: 16, fontSize: 13.5, lineHeight: "19px", fontWeight: 600, color: LINEN }}>
          ¿Necesitas ayuda?
        </span>
        <span className="absolute m-0 block" style={{ left: 63, top: 38.1, width: 118, fontSize: 11.5, lineHeight: "17px", fontWeight: 300, color: LINEN40 }}>
          Comunícate con tu gestor de proyecto.
        </span>
      </a>
    </div>
  );
}

/** Barra superior con el proyecto activo, el estado de obra y la cuenta. */
function Topbar({ project, meta, state }: { project: string; meta: string; state: string }) {
  const reduce = useReducedMotion();
  const inner = (
    <>
      {/* div.proj (472:1613) */}
      <p className="absolute m-0 whitespace-nowrap" style={{ left: 36, top: 15, fontSize: 17.5, lineHeight: "26px", fontWeight: 600, color: LINEN }}>
        {project}
      </p>
      <p className="absolute m-0 whitespace-nowrap" style={{ left: 36, top: 40.2, fontSize: 12.5, lineHeight: "18.77px", fontWeight: 300, color: LINEN40 }}>
        {meta}
      </p>

      {/* span.chip-state (472:1621) */}
      <div
        className="absolute inline-flex items-center"
        style={{
          left: 1365.08, top: 21.84, height: 31.27, padding: "0 14px", gap: 7,
          borderRadius: 999, border: "1px solid rgba(201,168,119,0.28)", background: "rgba(247,241,229,0.05)",
        }}
      >
        <span className="ix-live block" style={{ width: 6, height: 6, borderRadius: 999, background: "#7f8b57" }} />
        <span className="whitespace-nowrap" style={{ fontSize: 11.5, lineHeight: "18px", fontWeight: 500, color: LINEN72 }}>{state}</span>
      </div>

      {/* div.bell (472:1625) */}
      <button type="button" aria-label="Notificaciones" className="pnl-nav absolute" style={{ left: 1566.08, top: 23.97, width: 20, height: 20, borderRadius: 6, color: LINEN72, background: "none", border: 0 }}>
        <Ico name="bell" size={20} />
        <span className="absolute" style={{ left: 14, top: -2, width: 8, height: 8, borderRadius: 999, background: TUSCANY, boxShadow: `0 0 0 2px ${OIL}` }} />
      </button>

      {/* Avatar (472:1629) */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: 1602.08, top: 18.47, width: 38, height: 38, borderRadius: 999, background: "#7a5c3c", color: LINEN, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.4px" }}
      >
        NR
      </div>
    </>
  );
  return (
    <div className="absolute" style={{ left: 0, top: 0, width: 1920 - SIDEBAR_W, height: TOPBAR_H, background: OIL }}>
      {reduce ? inner : (
        <motion.div className="absolute inset-0" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
          {inner}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Marco del panel. `children` se dibuja dentro del área de contenido, con el
 * origen ya desplazado al inicio de la vista (1604 px de ancho útil).
 */
export default function Shell({
  active, h, project = "La Cabrera · Bogotá",
  meta = "Apartamento 320 m² · Proyecto en ejecución",
  state = "En obra · Semana 9 de 12",
  children,
}: {
  active: PanelKey; h: number; project?: string; meta?: string; state?: string; children: ReactNode;
}) {
  return (
    <div className="absolute" style={{ left: 0, top: 0, width: 1920, height: h, background: PAPER }}>
      <Sidebar active={active} h={h} />
      <div className="absolute" style={{ left: SIDEBAR_W, top: 0, width: 1920 - SIDEBAR_W, height: h }}>
        <Topbar project={project} meta={meta} state={state} />
        <div className="absolute overflow-hidden" style={{ left: 0, top: TOPBAR_H, width: 1920 - SIDEBAR_W, height: h - TOPBAR_H, background: PAPER }}>
          {/* Silueta de ciudad de fondo (548:1686): va al 60 % y sólo asoma en
              los huecos entre tarjetas. El rectángulo arranca 11.95 px por
              encima del área para que el recorte quede como en el diseño. */}
          <img
            src="/figma/Fondo_Panel.webp"
            alt=""
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute max-w-none object-cover"
            style={{ left: 0, top: -11.95, width: 1920 - SIDEBAR_W, height: h - TOPBAR_H + 11.95, opacity: 0.6 }}
          />
          <div className="absolute" style={{ left: PAD, top: PAD, width: VIEW_W }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
