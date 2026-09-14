"use client";

import { motion, useReducedMotion } from "framer-motion";
import AccountMenu, { type CuentaKey } from "@/components/AccountMenu";
import { EASE } from "@/components/motion/Kinetics";
import { MARK, tinted, WORDMARK, wordmarkH } from "@/components/brand";

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

export type NavKey = "predios" | "propiedades";

/**
 * Eran tres. "Análisis de valor" salió del grupo cuando el rediseño de la
 * ficha se llevó ese contenido a su pestaña de Finanzas: la página suelta ya
 * no existe y su ruta redirige allí. Las posiciones de abajo son las del
 * frame nuevo, que reparte las dos píldoras que quedan.
 */
const LABELS: { key: NavKey; label: string; href: string }[] = [
  { key: "predios", label: "Predios disponibles", href: "/predios" },
  { key: "propiedades", label: "Mis propiedades", href: "/predios/mis-propiedades" },
];

type Geo = {
  h: number;
  logo: { x: number; y: number; w: number; h: number };
  menu: { x: number; y: number; w: number; h: number };
  pill: { y: number; h: number; fs: number; lh: string; xs: number[]; ws: number[] };
  avatar: { x: number; y: number; bg: string; border: string; fs: number; color: string };
  /** El área de cuenta trae el wordmark completo, no el monograma. */
  wordmark?: boolean;
};

/**
 * Geometría por frame. `predios` es 100:2349; `propiedades`, 600:3028;
 * `cuenta`, las dos pantallas del área de cuenta (688:4032 y 688:4280), que
 * corren la barra entera 60 px a la derecha y cambian el monograma por el
 * wordmark; `ficha`, las tres pestañas de la ficha de predio (729:4084), que
 * comparten la barra de Predios pero con el wordmark y el cuerpo a 14.1 px.
 *
 * Al quedarse en dos píldoras, la barra encoge lo que medía la tercera más su
 * separación. El `x` no se mueve: el frame nuevo deja la barra donde estaba.
 */
const GEO: Record<"predios" | "propiedades" | "cuenta" | "ficha", Geo> = {
  predios: {
    h: 81.81,
    logo: { x: 101, y: 22.9, w: 39.46, h: 36 },
    menu: { x: 726.7, y: 16, w: 345, h: 49.81 },
    pill: { y: 5, h: 39.81, fs: 13, lh: "20px", xs: [5, 185], ws: [174, 155] },
    avatar: { x: 1492.4, y: 21.9, bg: "rgba(247,241,229,0.06)", border: "rgba(247,241,229,0.2)", fs: 12, color: "#f7f1e5" },
  },
  propiedades: {
    h: 94.39,
    logo: { x: 394, y: 31, w: 35.5, h: 32.39 },
    menu: { x: 738.64, y: 22, w: 337, h: 50.39 },
    pill: { y: 6, h: 38.39, fs: 13.6, lh: "20.4px", xs: [6, 181], ws: [169, 150] },
    avatar: { x: 1488, y: 28.195, bg: "rgba(201,168,119,0.28)", border: "rgba(247,241,229,0.12)", fs: 13.1, color: "#c9a877" },
  },
  cuenta: {
    h: 94.39,
    /* El wordmark va centrado en el hueco de 32.39 px que reserva el frame
       para el logotipo: 118 de ancho son 19.3 de alto con su proporción. */
    logo: { x: 454, y: 37.55, w: 118, h: wordmarkH(118) },
    menu: { x: 746.52, y: 22, w: 337, h: 50.39 },
    pill: { y: 6, h: 38.39, fs: 13.6, lh: "20.4px", xs: [6, 181], ws: [169, 150] },
    avatar: { x: 1429.12, y: 28.195, bg: "rgba(201,168,119,0.3)", border: "rgba(247,241,229,0.12)", fs: 13.1, color: "#c9a877" },
    wordmark: true,
  },
  ficha: {
    h: 81.81,
    logo: { x: 175, y: 40.9 - wordmarkH(150) / 2, w: 150, h: wordmarkH(150) },
    menu: { x: 726.7, y: 16, w: 345, h: 49.81 },
    pill: { y: 5, h: 39.81, fs: 14.1, lh: "21.82px", xs: [5, 185], ws: [174, 155] },
    avatar: { x: 1492.4, y: 21.9, bg: "rgba(201,168,119,0.25)", border: "rgba(247,241,229,0.18)", fs: 13.6, color: "#c9a877" },
    wordmark: true,
  },
};

/**
 * Marrón de la marca. Es el mismo `#492100` que llevan el saludo, la cabecera
 * de lista y la nota al pie de Mis propiedades, así que el logotipo entra en la
 * misma tinta que el resto del texto de la página.
 */
const BROWN = "#492100";

/**
 * `onLight` para las páginas de fondo claro.
 *
 * Cambia dos cosas. El logotipo se pinta en marrón con `mask-image` en vez de
 * ir como `<img>`: los SVG de marca llevan el crema dentro del archivo y
 * cargados con `<img>` el color no se puede tocar desde CSS (ver el comentario
 * de components/brand.ts). Y la barra de las píldoras pasa al marrón sólido que
 * pide el frame (656:2804); el crema al 6 % que usan las páginas oscuras
 * desaparecía sobre el beige.
 */
export default function PrediosNav({
  active, geo = "propiedades", onLight = false, cuenta,
}: {
  /** `none` es para el área de cuenta, que no marca ninguna de las tres. */
  active: NavKey | "none";
  geo?: keyof typeof GEO;
  onLight?: boolean;
  /** En qué pantalla de cuenta estamos, para marcarla en el menú del avatar. */
  cuenta?: CuentaKey;
}) {
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
        {onLight
          ? <span aria-hidden className="absolute inset-0 block size-full" style={tinted(g.wordmark ? WORDMARK : MARK, BROWN)} />
          : <img src={g.wordmark ? WORDMARK : MARK} alt="" decoding="async" className="absolute inset-0 block size-full max-w-none" />}
      </motion.a>

      <motion.div
        className="absolute"
        style={{
          left: g.menu.x, top: g.menu.y, width: g.menu.w, height: g.menu.h, borderRadius: 999,
          background: onLight ? BROWN : "rgba(247,241,229,0.06)",
          border: "1px solid rgba(247,241,229,0.12)",
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

      {/* El avatar es el `button#meBtn` del diseño: la única entrada al área de
          cuenta. Cuelga de él el menú con "Mi perfil" y "Configuración". */}
      <motion.div className="absolute" style={{ left: g.avatar.x, top: g.avatar.y }} {...anim(0.34)}>
        <AccountMenu
          size={38} fontSize={g.avatar.fs} activo={cuenta}
          bg={g.avatar.bg}
          borderColor={onLight ? "rgba(73,33,0,0.18)" : g.avatar.border}
          color={onLight ? BROWN : g.avatar.color}
        />
      </motion.div>
    </nav>
  );
}
