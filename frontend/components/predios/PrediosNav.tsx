"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion/Kinetics";
import { MARK } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   NAV DEL ÁREA DE PREDIOS — el grupo de tres píldoras que comparten
   "Predios disponibles", "Análisis de valor" y "Mis propiedades".

   Vive aquí y no en cada página para que la animación de entrada y el hover
   sean los mismos en todas. La geometría sí cambia entre frames de Figma —la
   barra de Predios mide 81.81 px y la de Mis propiedades 94.39—, así que va en
   presets en lugar de estar cableada.

   El hover de las píldoras vive en CSS (`.ix-pill`), no en línea: un estilo en
   línea gana a cualquier clase y la regla de hover no podría pisarlo.
   ═══════════════════════════════════════════════════════════════════════════ */

export type NavKey = "predios" | "valor" | "propiedades";

const LABELS: { key: NavKey; label: string; href: string }[] = [
  { key: "predios", label: "Predios disponibles", href: "/predios" },
  { key: "valor", label: "Análisis de valor", href: "/predios/add-value" },
  { key: "propiedades", label: "Mis propiedades", href: "/predios/mis-propiedades" },
];

type Geo = {
  h: number;
  logo: { x: number; y: number; w: number; h: number };
  menu: { x: number; y: number; w: number; h: number };
  pill: { y: number; h: number; fs: number; lh: string; xs: number[]; ws: number[] };
  avatar: { x: number; y: number; bg: string; border: string; fs: number; color: string };
};

/** Geometría por frame. `predios` es 100:2349; `propiedades`, 600:3028. */
const GEO: Record<"predios" | "propiedades", Geo> = {
  predios: {
    h: 81.81,
    logo: { x: 101, y: 22.9, w: 39.46, h: 36 },
    menu: { x: 726.7, y: 16, w: 504, h: 49.81 },
    pill: { y: 5, h: 39.81, fs: 13, lh: "20px", xs: [5, 185, 344], ws: [174, 153, 155] },
    avatar: { x: 1492.4, y: 21.9, bg: "rgba(247,241,229,0.06)", border: "rgba(247,241,229,0.2)", fs: 12, color: "#f7f1e5" },
  },
  propiedades: {
    h: 94.39,
    logo: { x: 394, y: 31, w: 35.5, h: 32.39 },
    menu: { x: 738.64, y: 22, w: 492, h: 50.39 },
    pill: { y: 6, h: 38.39, fs: 13.6, lh: "20.4px", xs: [6, 181, 336], ws: [169, 149, 150] },
    avatar: { x: 1488, y: 28.195, bg: "rgba(201,168,119,0.28)", border: "rgba(247,241,229,0.12)", fs: 13.1, color: "#c9a877" },
  },
};

export default function PrediosNav({ active, geo = "propiedades" }: { active: NavKey; geo?: keyof typeof GEO }) {
  const g = GEO[geo];
  const reduce = useReducedMotion();
  const anim = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: EASE } };

  return (
    <nav className="absolute left-0 top-0 w-full" style={{ height: g.h }} aria-label="Área de predios">
      <motion.a
        href="/"
        aria-label="Zequara — Inicio"
        className="ix-nav absolute"
        style={{ left: g.logo.x, top: g.logo.y, width: g.logo.w, height: g.logo.h }}
        {...anim(0)}
      >
        <img src={MARK} alt="Zequara" decoding="async" className="absolute inset-0 block size-full max-w-none" />
      </motion.a>

      <motion.div
        className="absolute"
        style={{
          left: g.menu.x, top: g.menu.y, width: g.menu.w, height: g.menu.h, borderRadius: 999,
          background: "rgba(247,241,229,0.06)", border: "1px solid rgba(247,241,229,0.12)",
        }}
        {...anim(0.06)}
      >
        {LABELS.map((p, i) => {
          const pill = (
            <a
              href={p.href}
              aria-current={p.key === active ? "page" : undefined}
              className="ix-pill absolute flex items-center justify-center whitespace-nowrap"
              style={{
                left: g.pill.xs[i], top: g.pill.y, width: g.pill.ws[i], height: g.pill.h,
                borderRadius: 999, fontSize: g.pill.fs, lineHeight: g.pill.lh, fontWeight: 500,
              }}
            >
              {p.label}
            </a>
          );
          if (reduce) return <div key={p.key}>{pill}</div>;
          return (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 + i * 0.07, ease: EASE }}
            >
              {pill}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        className="absolute flex items-center justify-center rounded-full border border-solid"
        style={{
          left: g.avatar.x, top: g.avatar.y, width: 38, height: 38,
          background: g.avatar.bg, borderColor: g.avatar.border,
          color: g.avatar.color, fontSize: g.avatar.fs, fontWeight: 600,
        }}
        {...anim(0.34)}
      >
        NR
      </motion.div>
    </nav>
  );
}
