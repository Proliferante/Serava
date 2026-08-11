"use client";

import CountUp from "@/components/motion/CountUp";
import { MUTED, VERD } from "@/components/panel/ui";
import { PCard, PCheckRow, PEyebrow, PIn, PStat, PTitle } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   PROYECCIÓN DE VALOR — vista fluida.

   Los cuatro indicadores del activo —con la TIR en verde—, el score de zona,
   las tres salidas posibles y el descargo, que en el lienzo va fuera de las
   tarjetas y aquí también.
   ═══════════════════════════════════════════════════════════════════════════ */

const ALTERNATIVAS = [
  { title: "Rentar", sub: "Canon proyectado $17M/mes; Zequara administra" },
  { title: "Vender", sub: "Te acompañamos cuando decidas la salida" },
  { title: "Conservar", sub: "El activo es tuyo; tú decides el horizonte" },
];

export default function ValorCompact() {
  return (
    <div className="flex flex-col gap-[14px]">
      <PTitle
        light="Proyección de" strong="valor"
        sub="No solo ves tu obra: entiendes cómo se traduce en renta y valorización de tu activo."
      />

      {/* ── Indicadores del activo ── */}
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2">
        <PStat delay={0.04} weight={300} label="Inversión total" note="Compra + remodelación"
          value={<CountUp value={3.1} prefix="$" decimals={3} suffix="M" />} />
        <PStat delay={0.08} weight={300} label="Valor de mercado estimado" note="~22% sobre lo invertido"
          value={<CountUp value={3.776} prefix="$" decimals={3} suffix="M" />} />
        <PStat delay={0.12} weight={300} label="Canon proyectado" note="+54% tras la obra"
          value={<CountUp value={17} prefix="$" suffix="M" />} />
        <PStat delay={0.16} weight={300} label="TIR estimada" note="Horizonte 5 años" green value="~16%" />
      </div>

      {/* ── Score Zequara ── */}
      <PCard delay={0.04}>
        <PEyebrow>Score Zequara de tu activo</PEyebrow>
        <div className="mt-[12px] flex items-start gap-[16px]">
          <span className="shrink-0 text-center">
            <span className="block text-[22px] font-bold leading-[1.35]" style={{ color: VERD }}><CountUp value={96} /></span>
            <span className="block uppercase" style={{ fontSize: 9.5, lineHeight: "13px", fontWeight: 500, letterSpacing: "0.7px", color: MUTED }}>Score</span>
          </span>
          <p className="m-0 text-[14px] font-light leading-[1.55]" style={{ color: MUTED }}>
            Evaluación especializada de la zona y su afinidad con la estrategia Zequara. La Cabrera: alta demanda,
            oferta limitada, valorización sostenida.
          </p>
        </div>
      </PCard>

      {/* ── Alternativas a futuro ── */}
      <PCard delay={0.08}>
        <PEyebrow>Alternativas a futuro</PEyebrow>
        <div className="mt-[6px]">
          {ALTERNATIVAS.map((a, i) => (
            <PCheckRow key={a.title} title={a.title} sub={a.sub} first={i === 0} delay={0.08 + i * 0.05} />
          ))}
        </div>
      </PCard>

      {/* ── Descargo ── */}
      <PIn delay={0.06}>
        <p className="m-0 text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(91,67,50,0.7)" }}>
          Cifras ilustrativas de referencia, no constituyen garantía de retorno ni asesoría de inversión. La
          valorización es sobre valor de mercado de referencia de la zona; el inmueble no se ha vendido.
        </p>
      </PIn>
    </div>
  );
}
