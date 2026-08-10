"use client";

import { MotionConfig } from "framer-motion";
import { useMemo, useState } from "react";
import { PREDIOS } from "@/components/predios/data";
import PredioCardCompact from "@/components/responsive/predios/PredioCardCompact";
import { PrediosHead, PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   PREDIOS DISPONIBLES — vista fluida para móvil y tablet.

   El lienzo son 1920 × 2850: encabezado, una barra de seis desplegables y la
   rejilla de ocho oportunidades a tres columnas.

   Los seis desplegables no se trasladan: en una barra de 390 px no caben, y
   cinco de ellos ("Todos", "Todas"...) no filtran nada mientras no haya más
   inventario. Se quedan los dos que hacen trabajo real con ocho fichas —la
   ciudad y el orden— y el resto vuelve cuando el portafolio lo pida.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const CREAM = "#f7f1e5";
const BROWN = "#492100";

type Orden = "score" | "tir" | "precio";

const ORDENES: { v: Orden; label: string }[] = [
  { v: "score", label: "Mayor Score Zequara" },
  { v: "tir", label: "Mayor TIR estimada" },
  { v: "precio", label: "Menor inversión" },
];

/** El precio viene como "COP $3.100M": se saca el número para poder ordenar. */
const montoDe = (s: string) => Number(s.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

export default function PrediosCompact() {
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("score");

  const ciudades = useMemo(() => [...new Set(PREDIOS.map((p) => p.city.split(" · ")[1]))], []);

  const visibles = useMemo(() => {
    const l = PREDIOS.filter((p) => !ciudad || p.city.endsWith(ciudad));
    return [...l].sort((a, b) =>
      orden === "score" ? b.score - a.score
        : orden === "tir" ? b.tir - a.tir
          : montoDe(a.price) - montoDe(b.price));
  }, [ciudad, orden]);

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ background: "#2a1e14" }}>
        <PrediosNavCompact />

        {/* ══════════ ENCABEZADO ══════════ */}
        <section className="relative overflow-hidden">
          <img src={`${A}/acceso-torres.webp`} alt="" loading="eager" decoding="async" className="pointer-events-none absolute inset-x-0 bottom-0 w-full object-cover opacity-15" />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(42,30,20,0.2) 0%, rgba(42,30,20,0.9) 100%)" }} />
          <div className={`${WRAP} relative pb-[34px] pt-[30px]`}>
            <PrediosHead eyebrow="Portafolio privado" title={<>Oportunidades <span className="font-semibold">disponibles.</span></>}>
              Cada predio pasó los filtros del modelo. Entra a la ficha para ver el análisis completo.
            </PrediosHead>
          </div>
        </section>

        {/* ══════════ FILTROS ══════════ */}
        <section className="sticky top-[96px] z-30 border-y border-solid" style={{ background: "#2a1e14", borderColor: "rgba(165,122,78,0.24)" }}>
          <div className={`${WRAP} py-[12px]`}>
            <div className="-mx-[24px] overflow-x-auto px-[24px] [scrollbar-width:none] sm:-mx-[40px] sm:px-[40px] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-[8px]">
                {[null, ...ciudades].map((c) => {
                  const on = ciudad === c;
                  return (
                    <button
                      key={c ?? "todas"} type="button" onClick={() => setCiudad(c)} aria-pressed={on}
                      className="flex h-[38px] items-center whitespace-nowrap rounded-full border border-solid px-[15px] text-[13px] transition-colors"
                      style={on
                        ? { background: CREAM, borderColor: CREAM, color: BROWN }
                        : { background: "transparent", borderColor: "rgba(247,241,229,0.22)", color: "rgba(247,241,229,0.78)" }}
                    >
                      {c ?? "Todas las ciudades"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-[10px] flex items-center gap-[10px]">
              <label htmlFor="orden" className="shrink-0 text-[12px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>Ordenar por</label>
              <select
                id="orden" value={orden} onChange={(e) => setOrden(e.target.value as Orden)}
                className="ix-field h-[38px] flex-1 cursor-pointer rounded-full border border-solid px-[14px] text-[13px] outline-none"
                style={{ background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.22)", color: CREAM }}
              >
                {ORDENES.map((o) => <option key={o.v} value={o.v} style={{ color: "#2a1e14" }}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* ══════════ REJILLA ══════════ */}
        <section className={`${WRAP} pb-[56px] pt-[22px]`}>
          <p className="m-0 text-[13px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>
            {visibles.length} {visibles.length === 1 ? "oportunidad" : "oportunidades"}
            {ciudad ? ` en ${ciudad}` : ""}
          </p>
          <div className="mt-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            {visibles.map((p, i) => (
              <PredioCardCompact key={p.title} data={p} delay={Math.min(i, 5) * 0.05} />
            ))}
          </div>

          <In delay={0.1}>
            <p className="mt-[26px] text-[13px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>
              El portafolio activo es confidencial y cambia según disponibilidad. La información detallada se habilita dentro de la plataforma.
            </p>
          </In>
        </section>
      </div>
    </MotionConfig>
  );
}
