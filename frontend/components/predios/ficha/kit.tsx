"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import CanvasImage from "@/components/CanvasImage";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA DE PREDIO — piezas que comparten las tres pestañas.

   El rediseño de Figma parte la ficha en tres frames de 1920 px de ancho
   —Ficha_oportunidad, ficha_evaluacion y Ficha_transformacion— que repiten el
   nav, la barra de pestañas, el sidebar de reserva y el footer. Todo eso vive
   aquí para que las tres páginas no se desincronicen.

   Los iconos van con el `viewBox` y el `path` exactos que exporta Figma. Se
   pintan con `currentColor`, así que el color lo pone quien los usa; en el
   diseño cada copia venía con su tinta cableada dentro del SVG.
   ═══════════════════════════════════════════════════════════════════════════ */

export const BROWN = "#492100";
export const CREAM = "#e2cdae";
export const EASE = [0.22, 1, 0.36, 1] as const;
/** Borde hueso de las tarjetas claras (orange/18 al 8 %). */
export const HAIRLINE = "rgba(60,45,30,0.08)";
/**
 * Trama diagonal con la que Figma marca las fotos que aún no existen. En el
 * diseño el paso va en porcentaje del ancho de cada tarjeta —y sale distinto
 * en cada una—; aquí va en píxeles para que todas las cajas de foto pendiente
 * del sitio se vean iguales.
 */
export const STRIPES =
  "repeating-linear-gradient(32deg, rgba(247,241,229,0.05) 0 12px, rgba(247,241,229,0) 12px 24px)";

type IconProps = { s?: number; className?: string; style?: CSSProperties };

/** Icono de trazo. `vb` es el lado del `viewBox` original de Figma. */
function stroke(vb: number, d: string, w: number) {
  return function Icon({ s = vb, className, style }: IconProps) {
    return (
      <svg width={s} height={s} viewBox={`0 0 ${vb} ${vb}`} fill="none" className={className} style={style} aria-hidden>
        <path d={d} stroke="currentColor" strokeWidth={w} />
      </svg>
    );
  };
}

/* Hero — las cuatro fichas técnicas del inmueble. */
export const IcArea = stroke(24, "M14 3L21 10M21 3H17V7M3 3H10V10H3V3Z", 1.4);
export const IcBed = stroke(24, "M3 18V12C3 11.4696 3.21071 10.9609 3.58579 10.5858C3.96086 10.2107 4.46957 10 5 10H19C19.5304 10 20.0391 10.2107 20.4142 10.5858C20.7893 10.9609 21 11.4696 21 12V18M3 14H21M6 10V7C6 6.46957 6.21071 5.96086 6.58579 5.58579C6.96086 5.21071 7.46957 5 8 5H16C16.5304 5 17.0391 5.21071 17.4142 5.58579C17.7893 5.96086 18 6.46957 18 7V10", 1.4);
export const IcBath = stroke(24, "M4 12V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4C6.53043 4 7.03914 4.21071 7.41421 4.58579C7.78929 4.96086 8 5.46957 8 6M4 12H20V15C20 16.0609 19.5786 17.0783 18.8284 17.8284C18.0783 18.5786 17.0609 19 16 19H8C6.93913 19 5.92172 18.5786 5.17157 17.8284C4.42143 17.0783 4 16.0609 4 15V12Z", 1.4);
export const IcCar = stroke(24, "M19 13V18H5V13L6.5 8.5C6.60922 8.07668 6.85415 7.7008 7.19729 7.4299C7.54043 7.159 7.96288 7.008 8.4 7H15.6C16.0371 7.008 16.4596 7.159 16.8027 7.4299C17.1459 7.7008 17.3908 8.07668 17.5 8.5L19 13ZM5 13H19M7 18V20M17 18V20", 1.4);

/* Sidebar de reserva. */
export const IcBolt14 = stroke(14, "M7.58333 1.16667L1.75 8.16667H5.83333L5.25 12.8333L11.0833 5.83333H7L7.58333 1.16667Z", 1.4);
export const IcBolt17 = stroke(17, "M9.20833 1.41667L2.125 9.91667H7.08333L6.375 15.5833L13.4583 7.08333H8.5L9.20833 1.41667Z", 1.55833);
export const IcClock = stroke(18, "M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75ZM9 5.25V9L11.25 10.5", 1.425);

/* "Por qué ZEQUARA lo seleccionó". */
export const IcStar = stroke(22, "M11 1.83333L13.2917 6.41667L18.3333 7.15L14.6667 10.725L15.5833 15.7667L11 14.4833L6.41667 16.6833L7.33333 11.6417L3.66667 8.06667L8.70833 7.33333L11 1.83333Z", 1.375);
export const IcTrend = stroke(22, "M2.75 15.5833L8.25 10.0833L11.9167 13.75L19.25 6.41667V2.75H15.5833", 1.375);
export const IcHome22 = stroke(22, "M2.75 19.25V6.41667L9.16667 2.75L15.5833 6.41667V19.25M9.16667 19.25V14.6667H12.8333V19.25M5.5 9.16667H5.50917M5.5 12.8333H5.50917", 1.375);
export const IcUsers = stroke(22, "M8.25 10.0833C9.76878 10.0833 11 8.85212 11 7.33333C11 5.81455 9.76878 4.58333 8.25 4.58333C6.73122 4.58333 5.5 5.81455 5.5 7.33333C5.5 8.85212 6.73122 10.0833 8.25 10.0833ZM15.5833 11.4583C16.849 11.4583 17.875 10.4323 17.875 9.16667C17.875 7.90101 16.849 6.875 15.5833 6.875C14.3177 6.875 13.2917 7.90101 13.2917 9.16667C13.2917 10.4323 14.3177 11.4583 15.5833 11.4583ZM2.75 18.3333C2.75 15.5833 5.5 13.75 8.25 13.75C11 13.75 13.75 15.5833 13.75 18.3333C13.75 16.5 15.5833 15.125 17.4167 15.125", 1.375);

/* Resto de secciones. */
export const IcCheck13 = stroke(13, "M10.8333 3.25L4.875 9.20833L2.16667 6.5", 1.3);
export const IcCheck18 = stroke(18, "M15 4.5L6.75 12.75L3 9", 1.20417);
export const IcHome18 = stroke(18, "M3 15.75V6.75L9 2.25L15 6.75V15.75M6.75 15.75V11.25H11.25V15.75", 1.20417);
export const IcPhone = stroke(18, "M16.5 12.675V14.925C16.5011 15.1353 16.4579 15.3434 16.3733 15.5359C16.2887 15.7284 16.1646 15.901 16.009 16.0424C15.8534 16.1839 15.6699 16.291 15.4702 16.3569C15.2705 16.4228 15.0592 16.446 14.85 16.425C12.6272 16.174 10.4946 15.4032 8.625 14.175C6.90616 13.0777 5.44726 11.6188 4.35 9.9C3.11071 8.00829 2.33946 5.84879 2.1 3.6C2.00435 3.40044 1.95404 3.18218 1.95269 2.96089C1.95133 2.73959 1.99895 2.52073 2.09214 2.32001C2.18534 2.11929 2.32179 1.94168 2.49171 1.79991C2.66164 1.65813 2.86083 1.55572 3.075 1.5H5.325C5.68675 1.49591 6.03778 1.6227 6.31343 1.857C6.58908 2.09129 6.77076 2.41732 6.825 2.775C6.9 3.525 7.125 4.275 7.35 4.95C7.45411 5.21402 7.48119 5.50215 7.42809 5.78095C7.37499 6.05974 7.24388 6.31774 7.05 6.525L6.075 7.425C7.14267 9.30266 8.69734 10.8573 10.575 11.925L11.475 10.95C11.6823 10.7561 11.9403 10.625 12.2191 10.5719C12.4978 10.5188 12.786 10.5459 13.05 10.65C13.725 10.875 14.475 11.1 15.225 11.175C15.5827 11.2292 15.9087 11.4109 16.143 11.6866C16.3773 11.9622 16.5041 12.3133 16.5 12.675Z", 1.20417);
export const IcChat = stroke(18, "M15.75 11.25C15.75 11.6478 15.592 12.0294 15.3107 12.3107C15.0294 12.592 14.6478 12.75 14.25 12.75H5.25L2.25 15.75V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H14.25C14.6478 2.25 15.0294 2.40804 15.3107 2.68934C15.592 2.97064 15.75 3.35218 15.75 3.75V11.25Z", 1.20417);
export const IcDoc = stroke(18, "M10.5 1.5H4.5C4.10218 1.5 3.72064 1.65804 3.43934 1.93934C3.15804 2.22064 3 2.60218 3 3V15C3 15.3978 3.15804 15.7794 3.43934 16.0607C3.72064 16.342 4.10218 16.5 4.5 16.5H13.5C13.8978 16.5 14.2794 16.342 14.5607 16.0607C14.842 15.7794 15 15.3978 15 15V6L10.5 1.5ZM10.5 1.5V6H15M6.75 11.25L8.25 12.75L11.25 9.75", 1.20417);
export const IcPin = stroke(15, "M7.5 1.25C6.33968 1.25 5.22688 1.71094 4.40641 2.53141C3.58594 3.35188 3.125 4.46468 3.125 5.625C3.125 8.75 7.5 13.75 7.5 13.75C7.5 13.75 11.875 8.75 11.875 5.625C11.875 4.46468 11.4141 3.35188 10.5936 2.53141C9.77312 1.71094 8.66032 1.25 7.5 1.25ZM7.5 7.1875C8.36294 7.1875 9.0625 6.48794 9.0625 5.625C9.0625 4.76206 8.36294 4.0625 7.5 4.0625C6.63706 4.0625 5.9375 4.76206 5.9375 5.625C5.9375 6.48794 6.63706 7.1875 7.5 7.1875Z", 1.125);
export const IcArrowRight = stroke(15, "M3.125 7.5H11.875M8.125 11.25L11.875 7.5L8.125 3.75", 1.375);
export const IcCalendar = stroke(16, "M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V12.6667C2 13.403 2.59695 14 3.33333 14H12.6667C13.403 14 14 13.403 14 12.6667V4C14 3.26362 13.403 2.66667 12.6667 2.66667ZM2 6H14M5.33333 1.33333V4M10.6667 1.33333V4", 1.20417);

/**
 * Flecha gruesa de "La oportunidad en una mirada" (Arrow 5). Es un relleno,
 * no un trazo, y su caja real sobresale del ancho nominal: Figma la dibuja de
 * 60.83 px de ancho dentro de un lienzo de 63.83 × 44.18.
 */
export function Arrow({ color = "#7f8b57" }: { color?: string }) {
  return (
    <svg width={63.83} height={44.18} viewBox="0 0 63.8276 44.1838" fill="none" aria-hidden>
      <path d="M62.9489 24.2132C64.1205 23.0416 64.1205 21.1421 62.9489 19.9706L43.8571 0.878681C42.6855 -0.292892 40.786 -0.292892 39.6144 0.878681C38.4428 2.05025 38.4428 3.94975 39.6144 5.12132L56.585 22.0919L39.6144 39.0624C38.4428 40.234 38.4428 42.1335 39.6144 43.3051C40.786 44.4767 42.6855 44.4767 43.8571 43.3051L62.9489 24.2132ZM0 22.0919V25.0919H60.8276V22.0919V19.0919H0V22.0919Z" fill={color} />
    </svg>
  );
}

/**
 * Caja absoluta con entrada al hacer scroll. Misma mecánica que el resto del
 * repo: el lienzo es de posiciones fijas, así que la animación no puede tocar
 * el layout y se queda en opacidad + desplazamiento.
 */
export function Reveal({
  left, top, width, height, delay = 0, zIndex, children,
}: { left: number; top: number; width: number; height?: number; delay?: number; zIndex?: number; children: ReactNode }) {
  return (
    <motion.div
      style={{ position: "absolute", left, top, width, height, zIndex }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Barra de pestañas ─────────────────────────────────────────────────────
   1920 × 142, verde oliva con las esquinas de abajo redondeadas. La pestaña
   activa es una píldora clara con sombra dura; las otras dos van en texto.
   Las tres posiciones salen del frame, así que cada página sólo pasa `active`. */

const TABS = [
  { key: "oportunidad" as const, label: "Oportunidad", href: "/predios/ficha" },
  { key: "finanzas" as const, label: "Finanzas", href: "/predios/ficha/finanzas" },
  { key: "transformacion" as const, label: "Transformación", href: "/predios/ficha/transformacion" },
];

export type TabKey = (typeof TABS)[number]["key"];

/**
 * La barra no reparte las tres pestañas en sitios fijos: al ensancharse la
 * píldora activa, cada frame recoloca las otras dos. Por eso la geometría va
 * por pestaña activa y no por pestaña.
 */
const TAB_LAYOUT: Record<TabKey, { pill: { x: number; y: number; w: number; h: number }; labels: Partial<Record<TabKey, number>> }> = {
  oportunidad: { pill: { x: 627, y: 71, w: 208, h: 54 }, labels: { finanzas: 891, transformacion: 1040 } },
  finanzas: { pill: { x: 874, y: 69, w: 157, h: 53 }, labels: { oportunidad: 658, transformacion: 1099 } },
  transformacion: { pill: { x: 1040, y: 70, w: 240, h: 53 }, labels: { oportunidad: 658, finanzas: 874 } },
};

export function TabsFicha({ active }: { active: TabKey }) {
  const { pill, labels } = TAB_LAYOUT[active];
  return (
    <div
      className="absolute left-0 w-full overflow-hidden"
      style={{ height: 142, backgroundColor: "#7f8b57", borderBottom: "1px solid rgba(60,45,30,0.13)", borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}
    >
      {TABS.map((t) =>
        t.key === active ? (
          <span
            key={t.key}
            aria-current="page"
            className="absolute block"
            style={{ left: pill.x, top: pill.y, width: pill.w, height: pill.h, borderRadius: 20, backgroundColor: "#b2bf89", filter: "drop-shadow(5px 5px 2px rgba(61,44,30,0.32))" }}
          >
            <span className="absolute whitespace-nowrap font-medium" style={{ left: 23, top: 26 - 21.6 / 2, fontSize: 25, lineHeight: "21.6px", color: BROWN }}>{t.label}</span>
          </span>
        ) : (
          <a
            key={t.key}
            href={t.href}
            className="ix-nav absolute whitespace-nowrap font-medium"
            style={{ left: labels[t.key], top: 97 - 21.6 / 2, fontSize: 23, lineHeight: "21.6px", color: "#e5dccf" }}
          >
            {t.label}
          </a>
        ),
      )}
    </div>
  );
}

/**
 * Banda de sección con una esquina inferior mordida.
 *
 * Las secciones se solapan ~60 px a propósito: cada una lleva redondeada una
 * esquina de abajo que muerde a la de la sección siguiente, alternando
 * izquierda y derecha. El orden de pintado es lo que hace el efecto, así que
 * va en `z` explícito en vez de depender del orden del marcado — de ese modo
 * el HTML se lee de arriba abajo como la página.
 */
export function Band({
  top, height, bg, corner, z, left = 0, width = "100%", children,
}: {
  top: number; height: number; bg: string; corner: "bl" | "br"; z: number;
  left?: number; width?: number | string; children?: ReactNode;
}) {
  return (
    <section
      className="absolute overflow-hidden"
      style={{ left, top, width, height, backgroundColor: bg, zIndex: z, [corner === "bl" ? "borderBottomLeftRadius" : "borderBottomRightRadius"]: 60 }}
    >
      {children}
    </section>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────────
   La foto del inmueble a sangre por la derecha, un velo que la funde con el
   marrón, el titular a la izquierda y el sidebar de reserva encima.

   Entre pestañas cambia el alto y de dónde cuelga el contenido, así que la
   geometría se deriva de `contentTop`: el frame coloca todo respecto a la
   caja de contenido, que sobresale del hero por arriba y por abajo. */

const HERO_SPECS = [
  { Ic: IcArea, v: "320 m²", l: "Área total", w: 58.16 },
  { Ic: IcBed, v: "3", l: "Habitaciones", w: 71.84 },
  { Ic: IcBath, v: "3", l: "Baños", w: 33.63 },
  { Ic: IcCar, v: "4", l: "Parqueaderos", w: 76.91 },
];

/** Bajada del hero. Cada pestaña la trae con su propio cuerpo y encuadre. */
type HeroSub = {
  text: string;
  /** Desplazamiento desde la caja de contenido; 296 es donde la deja el frame. */
  top?: number;
  width?: number;
  fontSize?: number;
  lineHeight?: number;
  color?: string;
};

export function HeroFicha({
  height, contentTop, contentLeft = 57, veil, sidebar, title, sub, cta,
  photo = true, priority = false, children,
}: {
  height: number;
  contentTop: number;
  /** La pestaña de Transformación arranca la caja de contenido pegada al borde. */
  contentLeft?: number;
  /** Alto del degradado que funde la foto; el frame no siempre lo iguala al hero. */
  veil: { top: number; height: number };
  sidebar: { left: number; top: number };
  title?: ReactNode;
  sub?: HeroSub;
  cta?: { label: string; href: string };
  /** Transformación cambia la foto por el comparador antes/después. */
  photo?: boolean;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      {photo && (
        <div className="absolute" style={{ left: 657, top: 0, width: 1272, height: 552 }}>
          <CanvasImage src="/figma/ficha-hero.webp" w={1272} priority={priority} />
        </div>
      )}
      <div
        className="pointer-events-none absolute"
        style={{ left: 582, top: veil.top, width: 461, height: veil.height, backgroundImage: "linear-gradient(89.993deg, rgb(73,33,0) 0%, rgba(73,33,0,0.98) 42.789%, rgba(73,33,0,0.74) 78.361%, rgba(73,33,0,0) 99.993%)" }}
      />

      <p className="absolute whitespace-nowrap font-semibold uppercase" style={{ left: contentLeft + 100, top: contentTop + 106, fontSize: 11.5, lineHeight: "17.28px", letterSpacing: 2.074, color: "#c9a877" }}>La Cabrera, Bogotá</p>

      <h1 className="absolute whitespace-nowrap font-light" style={{ left: contentLeft + 96, top: contentTop + 141.33, fontSize: 60, lineHeight: "65.66px", letterSpacing: -0.608, color: "#efe6d5" }}>
        {title ?? <>Un clásico con gran<br />potencial de valor</>}
      </h1>

      {sub && (
        <p
          className="absolute font-light"
          style={{
            left: contentLeft + 100, top: contentTop + (sub.top ?? 296), width: sub.width ?? 433.67,
            fontSize: sub.fontSize ?? 20, lineHeight: `${sub.lineHeight ?? 24}px`, color: sub.color ?? "rgba(247,241,229,0.82)",
          }}
        >
          {sub.text}
        </p>
      )}

      <div className="absolute flex gap-[28px]" style={{ left: contentLeft + 104, top: contentTop + height / 2 + 121, height: 41.5 }}>
        {HERO_SPECS.map(({ Ic, v, l, w }) => (
          <div key={l} className="flex items-center gap-[11px]">
            <Ic className="shrink-0" style={{ color: "#c9a877" }} />
            <div className="relative" style={{ width: w, height: 41.5 }}>
              <span className="absolute whitespace-nowrap font-semibold" style={{ left: 0, top: -1, fontSize: 16.8, lineHeight: "25.2px", color: "#efe6d5" }}>{v}</span>
              <span className="absolute whitespace-nowrap" style={{ left: 0, top: 24.19, fontSize: 10.9, lineHeight: "16.32px", color: "rgba(247,241,229,0.6)" }}>{l}</span>
            </div>
          </div>
        ))}
      </div>

      {cta && (
        <a
          href={cta.href}
          className="ix-press absolute flex items-center"
          style={{ left: contentLeft + 100, top: contentTop + 468, width: 197, height: 55, borderRadius: 10, backgroundColor: "#7f8b57", border: "1px solid rgba(60,45,30,0.13)" }}
        >
          <span className="absolute font-semibold" style={{ left: 31, fontSize: 20, lineHeight: "20.4px", color: "rgba(247,241,229,0.95)" }}>{cta.label}</span>
          <IcArrowRight className="absolute text-white" style={{ left: 168 }} />
        </a>
      )}

      {children}

      <div className="absolute" style={{ left: sidebar.left, top: sidebar.top }}><SidebarReserva /></div>
    </>
  );
}

/* ── Sidebar de reserva ────────────────────────────────────────────────────
   334 × 485. Va dentro del hero, pegado a la derecha, en las tres pestañas. */

function useCountdown(startSeconds: number) {
  const [s, setS] = useState(startSeconds);
  useEffect(() => {
    const id = window.setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function SidebarReserva() {
  const time = useCountdown(2 * 3600 + 59 * 60 + 38);
  const BORDER = "rgba(90,67,50,0.16)";

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: 334, height: 485, backgroundColor: "#f7f1e5", border: `1px solid ${BORDER}`, borderRadius: 20, boxShadow: "0px 30px 60px -40px rgba(42,30,20,0.4)" }}
    >
      {/* Franja naranja */}
      <div className="flex items-center gap-[8px] px-[20px]" style={{ backgroundColor: "#b5542f", paddingTop: 10.5, paddingBottom: 10.84 }}>
        <IcBolt14 className="shrink-0 text-white" />
        <span className="whitespace-nowrap font-bold text-white" style={{ fontSize: 11.8, lineHeight: "18.35px", letterSpacing: 0.474 }}>No te pierdas esta oportunidad</span>
      </div>

      <div className="relative" style={{ height: 518 }}>
        {/* Score */}
        <div className="absolute flex items-center gap-[13px]" style={{ left: 22, right: 22, top: 22, paddingBottom: 18, borderBottom: `1px solid ${BORDER}` }}>
          <span className="whitespace-nowrap font-bold" style={{ fontSize: 24, lineHeight: "37.2px", color: "#5f6b3e" }}>96/100</span>
          <div className="relative" style={{ width: 101.63, height: 39.17 }}>
            <span className="absolute whitespace-nowrap uppercase" style={{ left: 0, top: -1, fontSize: 10.6, lineHeight: "16.37px", letterSpacing: 0.634, color: "#5b4332" }}>Score Zequara</span>
            <span className="absolute whitespace-nowrap font-semibold" style={{ left: 0, top: 16.36, fontSize: 14.7, lineHeight: "22.82px", color: "#2a1e14" }}>Prioridad alta</span>
          </div>
        </div>

        {/* Inversión total */}
        <div className="absolute" style={{ left: 22, right: 22, top: 68.65, paddingTop: 18 }}>
          <p style={{ fontSize: 11.8, lineHeight: "18.35px", color: "#5b4332" }}>Inversión total</p>
          <div className="relative" style={{ height: 49.59 }}>
            <span className="absolute font-light" style={{ left: 0, top: 24.5 - 49.6 / 2, fontSize: 32, lineHeight: "49.6px", letterSpacing: -0.64, color: "#3d2c1e" }}>$3.100M</span>
            <span className="absolute" style={{ left: 123.02, top: 19.85 - 19.84 / 2, fontSize: 12.8, lineHeight: "19.84px", color: "#5b4332" }}>COP</span>
          </div>
        </div>

        {/* ROI */}
        <div className="absolute" style={{ left: 22, right: 22, top: 141.65, height: 58.27, borderBottom: `1px solid ${BORDER}` }}>
          <span className="absolute whitespace-nowrap" style={{ left: 0, top: 26.5 - 20.34 / 2, fontSize: 13.1, lineHeight: "20.34px", color: "#5b4332" }}>ROI estimado</span>
          <span className="absolute whitespace-nowrap font-bold" style={{ left: 241, top: 27 - 27.28 / 2, fontSize: 17.6, lineHeight: "27.28px", color: "#5f6b3e" }}>~22%</span>
        </div>

        {/* Cuenta atrás */}
        <div className="absolute flex items-center gap-[10px]" style={{ left: 22, right: 22, top: 204.65, padding: "12px 14px", borderRadius: 12, backgroundColor: "rgba(181,84,47,0.08)", border: "1px solid rgba(181,84,47,0.25)" }}>
          <IcClock className="shrink-0" style={{ color: "#b5542f" }} />
          <div className="relative" style={{ width: 131.19, height: 45.11 }}>
            <span className="absolute whitespace-nowrap" style={{ left: 0, top: -1, fontSize: 11.5, lineHeight: "17.86px", color: "#5b4332" }}>Reserva disponible por</span>
            <span className="absolute whitespace-nowrap font-bold tabular-nums" style={{ left: 0, top: 16.85, fontSize: 17.6, lineHeight: "27.28px", color: "#b5542f" }}>{time}</span>
          </div>
        </div>

        {/* Reservar */}
        <button
          type="button"
          className="ix-press absolute flex items-center justify-center gap-[9px] font-semibold text-white"
          style={{ left: 22, right: 22, top: 283.65, padding: "16px 15px", borderRadius: 12, backgroundColor: "#b5542f", fontSize: 15.7, boxShadow: "0px 14px 28px -14px rgba(181,84,47,0.7)" }}
        >
          <IcBolt17 className="shrink-0" />
          Reservar ahora
        </button>

        {/* Viendo ahora */}
        <p className="absolute text-center font-medium" style={{ left: 22, right: 22, top: 358.65, fontSize: 12.2, lineHeight: "18.85px", color: "#b5542f" }}>
          <span className="motion-safe:animate-pulse">●</span> 5 inversionistas viendo este predio
        </p>

        {/* Aviso de bloqueo */}
        <p className="absolute text-center font-light" style={{ left: 22, right: 22, top: 387.62, fontSize: 11.5, lineHeight: "17.28px", color: "#5b4332" }}>
          Al reservar, <span className="font-semibold" style={{ color: "#3d2c1e" }}>el predio se bloquea</span> y deja de estar disponible para otros mientras tu reserva esté vigente.
        </p>
      </div>
    </div>
  );
}
