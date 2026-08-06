"use client";

import type { ReactNode } from "react";
import CountUp from "@/components/motion/CountUp";
import { MLine, Rise, Rule } from "@/components/motion/Kinetics";
import PrediosNav from "@/components/predios/PrediosNav";
import PropiedadCard, { type Propiedad } from "@/components/predios/PropiedadCard";

/* ═══════════════════════════════════════════════════════════════════════════
   MIS PROPIEDADES — Figma 600:3028 (1920 × 1379.08).

   El portafolio del inversionista: resumen de las cuatro cifras y una tarjeta
   por activo, cada una con enlace a su plataforma.

   La columna de contenido son los 1132 px centrados que define `div.wrap`
   (x 340, padding 54): de 394 a 1526.
   ═══════════════════════════════════════════════════════════════════════════ */

export const MIS_PROPIEDADES_H = 1379;

const X = 394;
const W = 1132;
const RIGHT = X + W; // 1526

const LINEN = "#f7f1e5";
const LASER = "#c9a877";
const DRIFT = "#a57a4e";
const HAIRLINE = "rgba(247,241,229,0.12)";

/** Degradado de la página: marrón cerrado arriba, crema al pie. */
const PAGE_BG =
  "linear-gradient(180deg, #241710 0%, #2c1d12 26%, #3f2713 50%, #6b4526 72%, #b08f60 88%, #ddc9a6 97%, #e2cdae 100%)";

/** Las cuatro cifras del resumen. `$` va en dorado y el número en linen. */
const SUMMARY: { x: number; label: string; money: boolean; value: number; suffix: string; note: string }[] = [
  { x: 0, label: "Propiedades", money: false, value: 3, suffix: "", note: "1 en obra · 2 en operación" },
  { x: 286.5, label: "Inversión total", money: true, value: 6.83, suffix: "M", note: "Compra + remodelación" },
  { x: 573, label: "Valor estimado", money: true, value: 8.1, suffix: "M", note: "~19% sobre lo invertido" },
  { x: 859.5, label: "Renta mensual", money: true, value: 21, suffix: "M", note: "de tus activos arrendados" },
];

const PROPIEDADES: Propiedad[] = [
  {
    state: { label: "En obra", tone: "obra" },
    photo: "La Cabrera, Bogotá",
    city: "La Cabrera · Bogotá",
    title: "Apartamento ultra lujo remodelado a costo cerrado",
    specs: "320 m² · 3 hab · 3 baños · 2 parq",
    metric: { kind: "obra", label: "Avance de obra", pct: 78, aside: "Semana 9 de 12", note: "Dentro del cronograma" },
    invest: "COP $3.100M",
    href: "/panel",
  },
  {
    state: { label: "Arrendado", tone: "arrendado" },
    photo: "Chicó, Bogotá",
    city: "Chicó · Bogotá",
    title: "Piso alto con vista, zona social ampliada",
    specs: "210 m² · 2 hab · 2 baños · 2 parq",
    metric: { kind: "renta", label: "Canon mensual", value: "$12M", aside: "Ocupado · al día" },
    invest: "COP $2.050M",
    href: "/panel/operacion",
  },
];

/** Cifra del resumen: etiqueta, número que cuenta y pie. */
function Cifra({ item, i }: { item: (typeof SUMMARY)[number]; i: number }) {
  const num: ReactNode = item.money
    ? <><span style={{ fontWeight: 400, color: LASER }}>$</span><CountUp value={item.value} decimals={item.value % 1 ? 3 : 0} suffix={item.suffix} duration={1.5} /></>
    : <CountUp value={item.value} duration={1.2} />;
  return (
    <Rise className="absolute" style={{ left: X + item.x, top: 376.06, width: 272.5 }} delay={0.1 + i * 0.08} y={16} dur={0.6}>
      <p className="m-0 uppercase" style={{ fontSize: 10.9, lineHeight: "16.32px", fontWeight: 600, letterSpacing: "0.653px", color: "rgba(247,241,229,0.55)" }}>
        {item.label}
      </p>
      <p className="m-0" style={{ marginTop: 7, fontSize: 30.4, lineHeight: "45.6px", fontWeight: 200, letterSpacing: "-0.608px", color: LINEN }}>
        {num}
      </p>
      <p className="m-0" style={{ marginTop: 2, fontSize: 11.5, lineHeight: "17.28px", fontWeight: 300, color: "rgba(247,241,229,0.5)" }}>
        {item.note}
      </p>
    </Rise>
  );
}

export default function MisPropiedadesScreen() {
  return (
    <div className="relative size-full overflow-hidden" style={{ backgroundImage: PAGE_BG }} data-name="MIS PROPIEDADES">
      <PrediosNav active="propiedades" />

      {/* ── Hero ── */}
      <Rule x={X} y={154.52} w={34} color={DRIFT} opacity={1} delay={0.2} />
      <Rise className="absolute" style={{ left: X + 46, top: 146.39 }} delay={0.28} y={10} dur={0.55}>
        <p className="m-0 uppercase whitespace-nowrap" style={{ fontSize: 11.5, lineHeight: "17.28px", fontWeight: 600, letterSpacing: "3.226px", color: LASER }}>
          Tu portafolio
        </p>
      </Rise>

      <h1
        className="absolute m-0"
        style={{ left: X, top: 179.66, width: 532.22, fontSize: 48, lineHeight: "53.76px", letterSpacing: "-0.96px", fontWeight: 300, color: LINEN }}
      >
        <MLine delay={0.34}>
          Mis <span style={{ fontWeight: 600 }}>propiedades.</span>
        </MLine>
      </h1>

      <Rise className="absolute" style={{ left: X, top: 247.06, width: 606.91 }} delay={0.46} y={14} dur={0.65}>
        <p className="m-0" style={{ fontSize: 17.6, lineHeight: "26.4px", fontWeight: 300, color: "rgba(247,241,229,0.75)" }}>
          Cada activo que has sumado a tu patrimonio con Zequara, en un solo lugar. Elige una propiedad para entrar a su plataforma y ver todo su detalle.
        </p>
      </Rise>

      {/* ── Resumen del portafolio ── */}
      <Rule x={X} y={355.06} w={W} color={HAIRLINE} opacity={1} delay={0.5} dur={0.9} />
      {SUMMARY.map((s, i) => <Cifra key={s.label} item={s} i={i} />)}
      <Rule x={X} y={490.06} w={W} color={HAIRLINE} opacity={1} delay={0.6} dur={0.9} />

      {/* ── Cabecera de la lista ── */}
      <Rise className="absolute" style={{ left: X, top: 559.06 }} delay={0.5} y={12} dur={0.55}>
        <p className="m-0 whitespace-nowrap" style={{ fontSize: 16.8, lineHeight: "25.2px", fontWeight: 600, color: LINEN }}>
          2 propiedades en tu portafolio
        </p>
      </Rise>
      <Rise className="absolute text-right" style={{ left: RIGHT - 200, top: 563.06, width: 200 }} delay={0.56} y={12} dur={0.55}>
        <p className="m-0 whitespace-nowrap" style={{ fontSize: 12.8, lineHeight: "19.2px", fontWeight: 300, color: "rgba(247,241,229,0.5)" }}>
          Actualizado hoy
        </p>
      </Rise>

      {/* ── Rejilla de propiedades (dos tarjetas centradas, hueco de 22) ── */}
      {PROPIEDADES.map((p, i) => (
        <PropiedadCard
          key={p.city}
          x={X + (i === 0 ? 192.335 : 576.995)}
          y={607.25}
          w={362.66}
          h={610.16}
          data={p}
          delay={0.12 + i * 0.12}
        />
      ))}

      {/* ── Descargo ── */}
      <Rise className="absolute" style={{ left: X, top: 1299.08, width: W }} delay={0.1} y={12} dur={0.6}>
        <p className="m-0" style={{ fontSize: 12.8, lineHeight: "19.2px", fontWeight: 600, color: "#492100" }}>
          Cifras estimadas de referencia. El valor del portafolio se calcula sobre comparables de zona y no constituye una oferta de compra ni garantía de retorno.
        </p>
      </Rise>
    </div>
  );
}
