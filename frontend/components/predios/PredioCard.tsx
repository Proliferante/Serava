"use client";

import { motion } from "framer-motion";
import CountUp from "@/components/motion/CountUp";

/* ═══════════════════════════════════════════════════════════════════════════
   TARJETA DE PREDIO — Component 6 de Figma (368 × 644.03).

   Foto arriba con la etiqueta de estado y el Score Zequara, y debajo la ficha:
   zona, titular, tipo de transformación, metros, cifras y el estado de la
   oportunidad. Cierra con "Ver oportunidad" y el botón de guardar.

   La geometría va en absoluto porque la página es un lienzo fijo de 1920 px
   que ScaledCanvas escala, igual que el resto del sitio.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;

export const CARD_W = 368;
export const CARD_H = 644.03;

/* ── Paleta ──────────────────────────────────────────────────────────────── */
const CREAM = "#f7f1e5";
const INK = "#2a1e14";
const MUTED = "#5b4332";
const DRIFT = "#a57a4e";
const VERD = "#5f6b3e";
const AVOCADO = "#77854e";
const LINE = "rgba(165,122,78,0.28)";
/** Relleno del hueco de foto: madera oscura, de arriba a la izquierda. */
const PHOTO_BG = "linear-gradient(160deg, #4b3729 0%, #2b1f16 100%)";

/** Tonos de la etiqueta de estado. Cada uno dice algo distinto del predio. */
const BADGE = {
  green: { bg: AVOCADO, fg: CREAM },   // disponible / reserva liberada
  gold: { bg: "#a97c3c", fg: CREAM },  // recién incorporado
  amber: { bg: "#b3872e", fg: INK },   // alta actividad
  steel: { bg: "#52697a", fg: CREAM }, // reserva en curso
  dark: { bg: "#2e2118", fg: CREAM },  // ya reservada
} as const;

export type BadgeTone = keyof typeof BADGE;

/** Explicación del Score, igual en las ocho variantes de Figma (311:2402). */
const SCORE_TIP = "Evaluación especializada de la zona y su afinidad con la estrategia Zequara.";

/**
 * Qué significa cada tipo de transformación (Component 3, una por variante).
 * Se busca por la etiqueta del chip, así que los datos del predio siguen
 * llevando sólo el nombre del tipo.
 */
const CHIP_TIP: Record<string, string> = {
  "Reposicionamiento premium": "La propiedad se transforma para competir en una categoría superior: mejor diseño, materiales, funcionalidad y percepción de valor.",
  "División en dos unidades": "Un inmueble se adapta para funcionar como dos unidades independientes, cuando la normativa lo permite.",
  "Remodelación completa": "Se renueva todo el interior: cocina, baños, pisos, iluminación, carpintería, redes y acabados.",
  "Cambio de distribución": "Se reorganizan los espacios para aprovechar mejor el área: ampliar la zona social, integrar la cocina o ajustar habitaciones y baños.",
};

export type Predio = {
  /** Etiqueta de estado, arriba a la izquierda de la foto. */
  badge: { label: string; tone: BadgeTone };
  score: number;
  /** Pie del hueco de foto, sin el prefijo "Foto —". */
  photo: string;
  city: string;
  title: string;
  /** Tipo de transformación previsto. */
  chip: string;
  specs: string;
  price: string;
  priceNote: string;
  /** TIR estimada en porcentaje. */
  tir: number;
  horizon: string;
  status: string;
};

/* ── Iconos ──────────────────────────────────────────────────────────────── */
const st = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const Home = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" strokeWidth={1.5} {...st} aria-hidden>
    <path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
  </svg>
);
const Pin = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" strokeWidth={1.8} {...st} aria-hidden>
    <path d="M19 10.4c0 5.3-7 10.4-7 10.4s-7-5.1-7-10.4a7 7 0 0 1 14 0z" /><circle cx="12" cy="10.2" r="2.4" />
  </svg>
);
const Spark = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" strokeWidth={1.7} {...st} aria-hidden>
    <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M18 6l-2.6 2.6M8.6 15.4 6 18" />
  </svg>
);
const Arrow = () => (
  <svg width={15} height={15} viewBox="0 0 24 24" strokeWidth={2} {...st} aria-hidden>
    <path d="M4.5 12h15M13.6 6.2 19.5 12l-5.9 5.8" />
  </svg>
);
const Bookmark = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" strokeWidth={1.7} {...st} aria-hidden>
    <path d="M6.5 3.8h11a1 1 0 0 1 1 1v15.4l-6.5-4.4-6.5 4.4V4.8a1 1 0 0 1 1-1z" />
  </svg>
);

export default function PredioCard({
  x, y, data, delay = 0, href = "/predios/ficha",
}: { x: number; y: number; data: Predio; delay?: number; href?: string }) {
  const b = BADGE[data.badge.tone];
  return (
    <motion.article
      className="group absolute overflow-hidden"
      style={{
        left: x, top: y, width: CARD_W, height: CARD_H,
        borderRadius: 18, border: `1px solid ${LINE}`, background: CREAM,
      }}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE } }}
    >
      {/* ── Foto (520:361) ── */}
      <div className="absolute overflow-hidden" style={{ left: 0, top: 0, width: 366, height: 251.63 }}>
        <div className="ix-zoom absolute inset-0" style={{ background: PHOTO_BG }} />
        <span className="absolute" style={{ left: 170, top: 94.43, color: "rgba(247,241,229,0.42)" }}><Home /></span>
        <p
          className="absolute m-0 text-center uppercase"
          style={{
            left: 122.08, top: 128.62, width: 123.84,
            fontSize: 9.5, lineHeight: "14.5px", fontWeight: 600, letterSpacing: "1.1px",
            color: "rgba(247,241,229,0.5)",
          }}
        >
          Foto — {data.photo}
        </p>

        {/* Etiqueta de estado */}
        <span
          className="absolute inline-flex items-center uppercase"
          style={{
            left: 14, top: 14, height: 27.34, padding: "0 11px", borderRadius: 8,
            background: b.bg, color: b.fg,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.9px",
            boxShadow: "0 6px 14px -8px rgba(0,0,0,0.5)",
          }}
        >
          {data.badge.label}
        </span>

        {/* Score Zequara, con su explicación al pasar el ratón (311:2392) */}
        <span
          className="ix-tip absolute inline-flex items-center uppercase"
          style={{
            right: 14, top: 14, padding: "6px 11px", gap: 4, borderRadius: 8,
            background: "rgba(247,241,229,0.95)", letterSpacing: "0.448px", fontWeight: 700,
            boxShadow: "0 6px 14px -6px rgba(0,0,0,0.4)",
          }}
        >
          <span style={{ fontSize: 11.2, lineHeight: "16.8px", color: "#3d2c1e" }}>Score Zequara</span>
          <span style={{ fontSize: 13.1, lineHeight: "19.68px", color: VERD }}><CountUp value={data.score} duration={1.1} /></span>
          <span className="ix-tip-box" style={{ right: 0, top: 39.69 }}>{SCORE_TIP}</span>
        </span>
      </div>

      {/* ── Ficha (520:379) ── */}
      <div className="absolute" style={{ left: 22, top: 272.62, width: 322 }}>
        <span className="absolute" style={{ left: 0, top: 2.13, color: DRIFT }}><Pin /></span>
        <p className="absolute m-0 uppercase" style={{ left: 20, top: -1, fontSize: 11.5, lineHeight: "18px", fontWeight: 600, letterSpacing: "1.2px", color: DRIFT }}>
          {data.city}
        </p>
      </div>

      <h3
        className="absolute m-0"
        style={{ left: 22, top: 298.89, width: 322, fontSize: 19, lineHeight: "23.5px", fontWeight: 600, letterSpacing: "-0.3px", color: INK }}
      >
        {data.title}
      </h3>

      {/* Tipo de transformación, con su explicación al pasar el ratón (311:2483) */}
      <span
        className="ix-tip absolute inline-flex items-center"
        style={{
          left: 22, top: 359.48, height: 33.27, padding: "0 16px 0 14px", gap: 7, borderRadius: 999,
          background: "rgba(127,139,87,0.13)", border: "1px solid rgba(127,139,87,0.32)", color: VERD,
          fontSize: 11.5, lineHeight: "17.28px", fontWeight: 600,
        }}
      >
        <Spark />
        <span className="whitespace-nowrap">{data.chip}</span>
        {CHIP_TIP[data.chip] && (
          <span className="ix-tip-box" style={{ left: 0, top: 39.27 }}>{CHIP_TIP[data.chip]}</span>
        )}
      </span>

      <p className="absolute m-0" style={{ left: 22, top: 408.75, fontSize: 13.5, lineHeight: "20px", fontWeight: 300, color: MUTED }}>
        {data.specs}
      </p>
      <span className="absolute" style={{ left: 22, top: 445.75, width: 322, height: 1, background: "rgba(165,122,78,0.22)" }} />

      {/* Cifras */}
      {/* Las etiquetas y el horizonte van en una línea, como en el diseño: si
          se parten, la columna crece y el pie choca con el estado de abajo. */}
      <div className="absolute" style={{ left: 22, top: 460.94, width: 157 }}>
        <p className="m-0 whitespace-nowrap uppercase" style={{ fontSize: 10, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.8px", color: MUTED }}>Inversión total estimada</p>
        <p className="m-0" style={{ fontSize: 19.5, lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.3px", color: INK }}>{data.price}</p>
        <p className="m-0" style={{ marginTop: 2, fontSize: 11.5, lineHeight: "16px", fontWeight: 300, color: MUTED }}>{data.priceNote}</p>
      </div>
      <div className="absolute text-right" style={{ right: 24, top: 460.94, width: 120 }}>
        <p className="m-0 whitespace-nowrap uppercase" style={{ fontSize: 10, lineHeight: "16px", fontWeight: 600, letterSpacing: "0.8px", color: MUTED }}>TIR estimada</p>
        <p className="m-0 whitespace-nowrap" style={{ fontSize: 19.5, lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.3px", color: VERD }}>
          <CountUp value={data.tir} suffix="% anual" duration={1.2} />
        </p>
        <p className="m-0 whitespace-nowrap" style={{ marginTop: 2, fontSize: 11.5, lineHeight: "16px", fontWeight: 300, color: MUTED }}>{data.horizon}</p>
      </div>

      {/* Estado de la oportunidad */}
      <span className="absolute" style={{ left: 22, top: 542.09, width: 7, height: 7, borderRadius: 999, background: VERD }} />
      <p className="absolute m-0" style={{ left: 37, top: 535.23, fontSize: 12.5, lineHeight: "19px", fontWeight: 500, color: MUTED }}>
        {data.status}
      </p>

      {/* Acciones */}
      <a
        href={href}
        className="ix-press absolute inline-flex items-center justify-center"
        style={{
          left: 22, top: 570.95, width: 264, height: 48.08, gap: 9, borderRadius: 999,
          background: AVOCADO, color: CREAM, fontSize: 14.5, fontWeight: 600,
          boxShadow: "0 14px 28px -16px rgba(47,55,30,0.75)",
        }}
      >
        Ver oportunidad <Arrow />
      </a>
      <button
        type="button"
        aria-label={`Guardar ${data.title}`}
        className="ix-press absolute inline-flex items-center justify-center"
        style={{
          left: 296, top: 570.95, width: 48, height: 48.08, borderRadius: 999,
          border: `1px solid ${LINE}`, background: "transparent", color: MUTED,
        }}
      >
        <Bookmark />
      </button>
    </motion.article>
  );
}
