"use client";

import CountUp from "@/components/motion/CountUp";
import {
  Card, CheckRow, Eyebrow, MUTED, StatCard, VERD, ViewTitle,
} from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   PROYECCIÓN DE VALOR — Figma 472:3843 (vista de 1604 × 584.58).

   Los cuatro indicadores del activo —con la TIR en verde—, el score de zona y
   las tres salidas posibles. Cierra con el descargo de responsabilidad, que en
   el diseño va fuera de las tarjetas.

   Corrección respecto al diseño: la tarjeta de TIR tenía sus textos 1 px a la
   izquierda y arriba del resto; aquí las cuatro comparten el canal de 23 px.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del lienzo: topbar (74.95) + área de contenido (1124.08). */
export const VALOR_H = 1200;

const ALTERNATIVAS = [
  { y: 60.27, h: 71, title: "Rentar", sub: "Canon proyectado $17M/mes; Serava administra" },
  { y: 131.27, h: 71, title: "Vender", sub: "Te acompañamos cuando decidas la salida" },
  { y: 202.27, h: 70, title: "Conservar", sub: "El activo es tuyo; tú decides el horizonte" },
];

export default function ValorScreen() {
  return (
    <>
      <ViewTitle
        light="Proyección de"
        strong="valor"
        sub="No solo ves tu obra: entiendes cómo se traduce en renta y valorización de tu activo."
      />

      {/* ── Indicadores del activo (472:3967) ── */}
      <StatCard x={0} w={388} label="Inversión total" note="Compra + remodelación" weight={300} delay={0.06}
        value={<CountUp value={3.1} prefix="$" decimals={3} suffix="M" />} />
      <StatCard x={406} w={388} label="Valor de mercado estimado" note="~22% sobre lo invertido" weight={300} delay={0.12}
        value={<CountUp value={3.776} prefix="$" decimals={3} suffix="M" />} />
      <StatCard x={812} w={388} label="Canon proyectado" note="+54% tras la obra" weight={300} delay={0.18}
        value={<CountUp value={17} prefix="$" suffix="M" />} />
      <StatCard x={1218} w={386} h={139} label="TIR estimada" note="Horizonte 5 años" weight={300} green delay={0.24}
        value="~16%" />

      {/* ── Score Serava (472:3997) ── */}
      <Card x={0} y={254.61} w={793} h={296.2} delay={0.06}>
        <Eyebrow x={23} y={28}>Score Serava de tu activo</Eyebrow>
        <div className="absolute text-center" style={{ left: 23, top: 71.27, width: 66 }}>
          <p className="m-0" style={{ fontSize: 22, lineHeight: "32px", fontWeight: 700, color: VERD }}>
            <CountUp value={96} />
          </p>
          <p className="m-0 uppercase" style={{ fontSize: 9.5, lineHeight: "13px", fontWeight: 500, letterSpacing: "0.7px", color: MUTED }}>
            Score
          </p>
        </div>
        <p className="absolute m-0" style={{ left: 109, top: 81.47, width: 661, fontSize: 14, lineHeight: "21.6px", fontWeight: 300, color: MUTED }}>
          Evaluación especializada de la zona y su afinidad con la estrategia Serava. La Cabrera: alta demanda, oferta limitada, valorización sostenida.
        </p>
      </Card>

      {/* ── Alternativas a futuro (472:4011) ── */}
      <Card x={811} y={254.61} w={793} h={295.27} delay={0.12}>
        <Eyebrow x={23} y={28}>Alternativas a futuro</Eyebrow>
        {ALTERNATIVAS.map((a, i) => (
          <CheckRow key={a.title} y={a.y} h={a.h} w={747} title={a.title} sub={a.sub} first={i === 0} delay={0.08 + i * 0.06} />
        ))}
      </Card>

      {/* ── Descargo (472:4041) ── */}
      <p
        className="absolute m-0"
        style={{ left: 0, top: 565.81, width: 1604, fontSize: 12.5, lineHeight: "18.77px", fontWeight: 300, color: "rgba(91,67,50,0.7)" }}
      >
        Cifras ilustrativas de referencia, no constituyen garantía de retorno ni asesoría de inversión. La valorización es sobre valor de mercado de referencia de la zona; el inmueble no se ha vendido.
      </p>
    </>
  );
}
