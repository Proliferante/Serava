"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import CountUp from "@/components/motion/CountUp";
import { EASE } from "@/components/motion/Kinetics";

/* ═══════════════════════════════════════════════════════════════════════════
   TARJETA DE PROPIEDAD — Component 4 de Figma (362.66 × ~610).

   Es la tarjeta de "Mis propiedades": marrón cerrado, con el estado del activo
   arriba a la izquierda y el sello de propiedad a la derecha. El bloque de
   métrica cambia según el activo: obra en curso muestra avance con barra,
   arrendado muestra el canon y el estado del inquilino.

   Se arma con flex y los paddings del diseño en vez de posiciones absolutas:
   las dos variantes tienen alturas distintas y así salen solas.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINEN = "#f7f1e5";
const LASER = "#c9a877";
const DRIFT = "#a57a4e";
const GREEN = "#9aa66f";
const AVOCADO = "#7f8b57";
const TUSSOCK = "#c8913f";
const HAIRLINE = "rgba(247,241,229,0.12)";

/** Gradientes del hueco de foto: velo dorado en diagonal. */
const MEDIA_BG =
  "linear-gradient(135deg, rgba(201,168,119,0.14) 0%, rgba(201,168,119,0) 100%), " +
  "linear-gradient(45deg, rgba(247,241,229,0.05) 0%, rgba(247,241,229,0.05) 2.413%, rgba(247,241,229,0) 2.413%, rgba(247,241,229,0) 4.8261%)";

export type Propiedad = {
  /** Estado del activo: en obra (tussock) o arrendado (avocado). */
  state: { label: string; tone: "obra" | "arrendado" };
  /** Pie del hueco de foto, sin el prefijo "Foto —". */
  photo: string;
  city: string;
  /** Titular, dos líneas en el diseño. */
  title: string;
  specs: string;
  metric:
    | { kind: "obra"; label: string; pct: number; aside: string; note: string }
    | { kind: "renta"; label: string; value: string; aside: string };
  invest: string;
  href: string;
};

/* ── Iconos ──────────────────────────────────────────────────────────────── */
const st = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Home = () => (
  <svg width={26} height={26} viewBox="0 0 24 24" strokeWidth={1.5} {...st} aria-hidden>
    <path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
  </svg>
);
const Pin = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" strokeWidth={1.9} {...st} aria-hidden>
    <path d="M19 10.4c0 5.3-7 10.4-7 10.4s-7-5.1-7-10.4a7 7 0 0 1 14 0z" /><circle cx="12" cy="10.2" r="2.4" />
  </svg>
);
const Arrow = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" strokeWidth={2} {...st} aria-hidden>
    <path d="M4.5 12h15M13.6 6.2 19.5 12l-5.9 5.8" />
  </svg>
);

/** Barra de avance: crece de 0 al entrar en pantalla. */
function AvBar({ pct, delay }: { pct: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className="h-[8px] w-full overflow-hidden rounded-full" style={{ background: "rgba(247,241,229,0.1)" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundImage: `linear-gradient(90deg, ${DRIFT} 0%, ${LASER} 100%)` }}
        initial={reduce ? undefined : { width: 0 }}
        animate={{ width: `${reduce || seen ? pct : 0}%` }}
        transition={{ duration: 1.05, delay, ease: EASE }}
      />
    </div>
  );
}

export default function PropiedadCard({
  x, y, w, h, data, delay = 0,
}: { x: number; y: number; w: number; h: number; data: Propiedad; delay?: number }) {
  const tono = data.state.tone === "obra" ? TUSSOCK : AVOCADO;
  return (
    <motion.article
      className="ix-prop absolute flex flex-col overflow-hidden"
      style={{ left: x, top: y, width: w, height: h, background: "#492100", border: `1px solid ${HAIRLINE}`, borderRadius: 20 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {/* ── Hueco de foto ── */}
      <div className="relative flex w-full items-center justify-center" style={{ paddingTop: 99.71, paddingBottom: 99.7, backgroundImage: MEDIA_BG }}>
        <span className="ix-prop-ico" style={{ color: "rgba(247,241,229,0.5)" }}><Home /></span>

        <span
          className="absolute uppercase"
          style={{
            left: 14, top: 14, padding: "6px 12px", borderRadius: 8, background: tono, color: "#ffffff",
            fontSize: 9.9, lineHeight: "14.88px", fontWeight: 700, letterSpacing: "0.595px",
            boxShadow: "0 8px 16px -8px rgba(0,0,0,0.5)",
          }}
        >
          {data.state.label}
        </span>

        <span
          className="absolute uppercase"
          style={{
            right: 14.39, top: 14, padding: "4px 10px 5.39px", borderRadius: 8,
            background: "rgba(34,24,18,0.6)", border: "1px solid rgba(201,168,119,0.3)", color: LASER,
            fontSize: 9.6, lineHeight: "14.4px", fontWeight: 700, letterSpacing: "0.576px",
          }}
        >
          En tu portafolio
        </span>

        <span
          className="absolute uppercase"
          style={{ left: 12, bottom: 10, fontSize: 9.6, lineHeight: "14.4px", fontWeight: 600, letterSpacing: "0.96px", color: "rgba(247,241,229,0.55)" }}
        >
          Foto — {data.photo}
        </span>
      </div>

      {/* ── Ficha. `flex-1` + el `mt-auto` del botón dejan los dos botones a la
             misma altura, aunque la tarjeta arrendada tenga menos contenido:
             es lo que en Figma se resuelve con un relleno de 46 px. ── */}
      <div className="flex w-full flex-1 flex-col" style={{ padding: "20px 22px 22px" }}>
        <div className="flex items-center" style={{ gap: 7, paddingBottom: 8, color: DRIFT }}>
          <Pin />
          <span className="uppercase whitespace-nowrap" style={{ fontSize: 11.2, lineHeight: "16.8px", fontWeight: 600, letterSpacing: "1.12px" }}>
            {data.city}
          </span>
        </div>

        <h3 className="m-0" style={{ paddingBottom: 12, fontSize: 17.3, lineHeight: "22.46px", fontWeight: 600, color: LINEN }}>
          {data.title}
        </h3>

        <div style={{ paddingBottom: 15 }}>
          <div className="flex items-center" style={{ height: 34.72, borderBottom: `1px solid ${HAIRLINE}` }}>
            <span style={{ fontSize: 12.5, lineHeight: "18.72px", fontWeight: 300, color: "rgba(247,241,229,0.62)" }}>{data.specs}</span>
          </div>
        </div>

        {/* Métrica: avance de obra con barra, o canon del arriendo */}
        <div style={{ paddingBottom: 16 }}>
          <p className="m-0 uppercase" style={{ fontSize: 10.2, lineHeight: "15.36px", fontWeight: 600, letterSpacing: "0.614px", color: "rgba(247,241,229,0.5)" }}>
            {data.metric.label}
          </p>
          {data.metric.kind === "obra" ? (
            <>
              <div className="flex items-baseline justify-between" style={{ paddingTop: 7, paddingBottom: 2.6 }}>
                <span style={{ fontSize: 22.4, lineHeight: "33.6px", fontWeight: 600, color: LINEN }}>
                  <CountUp value={data.metric.pct} suffix="%" duration={1.2} />
                </span>
                <span style={{ fontSize: 12.5, lineHeight: "18.72px", fontWeight: 300, color: "rgba(247,241,229,0.6)" }}>{data.metric.aside}</span>
              </div>
              <AvBar pct={data.metric.pct} delay={delay + 0.25} />
              <p className="m-0" style={{ paddingTop: 7.7, fontSize: 12.5, lineHeight: "18.72px", fontWeight: 500, color: GREEN }}>
                ● {data.metric.note}
              </p>
            </>
          ) : (
            <div className="flex items-baseline justify-between" style={{ paddingTop: 7.01, paddingBottom: 1.61 }}>
              <span style={{ fontSize: 22.4, lineHeight: "33.6px", fontWeight: 300, color: LINEN }}>{data.metric.value}</span>
              <span style={{ fontSize: 12.5, lineHeight: "18.72px", fontWeight: 500, color: GREEN }}>● {data.metric.aside}</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between" style={{ paddingBottom: 18 }}>
          <span className="uppercase" style={{ fontSize: 11.2, lineHeight: "16.8px", letterSpacing: "0.56px", color: "rgba(247,241,229,0.5)" }}>
            Inversión total
          </span>
          <span style={{ fontSize: 15.7, lineHeight: "23.52px", fontWeight: 600, color: LASER }}>{data.invest}</span>
        </div>

        {/* Empuja el botón al pie para que las dos tarjetas lo alineen */}
        <a
          href={data.href}
          className="ix-prop-cta mt-auto flex w-full items-center justify-center"
          style={{ gap: 9, padding: "13.5px 14px 13.58px", borderRadius: 12, background: AVOCADO, color: LINEN, fontSize: 14.7, lineHeight: "22px", fontWeight: 600 }}
        >
          Entrar a la propiedad
          <span className="ix-prop-arrow inline-flex"><Arrow /></span>
        </a>
      </div>
    </motion.article>
  );
}
