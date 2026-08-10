"use client";

import { MotionConfig } from "framer-motion";
import { useMemo, useState } from "react";
import { PREDIOS } from "@/components/predios/data";
import { SCORE_TIP } from "@/components/predios/PredioCard";
import PredioCardCompact from "@/components/responsive/predios/PredioCardCompact";
import { PrediosHead, PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   PREDIOS DISPONIBLES — vista fluida para móvil y tablet.

   El lienzo son 1920 × 2850: encabezado, una barra de seis desplegables y la
   rejilla de ocho oportunidades a tres columnas.

   Los seis desplegables están todos, con sus mismas etiquetas y valores: en
   una barra de 390 px no caben en fila, así que se apilan de dos en dos. Tres
   filtran de verdad —ciudad, tipo de transformación y orden—; los otros tres
   van inertes, igual que en escritorio, porque aún no hay catálogo detrás.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const CREAM = "#f7f1e5";

type Orden = "score" | "tir" | "precio";

const ORDENES: { v: Orden; label: string }[] = [
  { v: "score", label: "Mayor Score Zequara" },
  { v: "tir", label: "Mayor TIR estimada" },
  { v: "precio", label: "Menor inversión" },
];

/** Las mismas tres cifras del portafolio que van bajo el encabezado. */
const CIFRAS = [
  { pre: "", n: "5", txt: "oportunidades disponibles" },
  { pre: "", n: "3", txt: "en proceso de reserva" },
  { pre: "Portafolio actualizado el", n: "14 de julio", txt: "" },
];

/** El precio viene como "COP $3.100M": se saca el número para poder ordenar. */
const montoDe = (s: string) => Number(s.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

/**
 * Un desplegable de la barra, con el mismo aspecto que el del lienzo.
 *
 * Sin `onChange` queda inerte pero visible, que es lo que hace el escritorio
 * con los filtros que todavía no tienen catálogo detrás.
 */
function Campo({ label, value, opciones, onChange }: { label: string; value: string; opciones?: string[]; onChange?: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block uppercase" style={{ fontSize: 10.5, lineHeight: "16px", fontWeight: 600, letterSpacing: "1.3px", color: "#fde8d3" }}>
        {label}
      </span>
      <span className="relative mt-[6px] block">
        <span
          className="flex h-[40px] w-full items-center justify-between gap-[6px] rounded-[11px] border border-solid px-[13px]"
          style={{ borderColor: "rgba(165,122,78,0.28)", background: "#efe6d5" }}
        >
          <span className="truncate" style={{ fontSize: 13.5, color: "#2a1e14" }}>{value}</span>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#5b4332" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9.5l6 6 6-6" /></svg>
        </span>
        {opciones && onChange && (
          <select
            aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          >
            {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
      </span>
    </label>
  );
}

export default function PrediosCompact() {
  const [ciudad, setCiudad] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [orden, setOrden] = useState<Orden>("score");

  const ciudades = useMemo(() => [...new Set(PREDIOS.map((p) => p.city.split(" · ")[1]))], []);
  const tipos = useMemo(() => [...new Set(PREDIOS.map((p) => p.chip))], []);

  const visibles = useMemo(() => {
    const l = PREDIOS.filter((p) => (!ciudad || p.city.endsWith(ciudad)) && (!tipo || p.chip === tipo));
    return [...l].sort((a, b) =>
      orden === "score" ? b.score - a.score
        : orden === "tir" ? b.tir - a.tir
          : montoDe(a.price) - montoDe(b.price));
  }, [ciudad, tipo, orden]);

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ background: "#2a1e14" }}>
        <PrediosNavCompact />

        {/* ══════════ ENCABEZADO ══════════ */}
        <section className="relative overflow-hidden">
          <img src={`${A}/acceso-torres.webp`} alt="" loading="eager" decoding="async" className="pointer-events-none absolute inset-x-0 bottom-0 w-full object-cover opacity-15" />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(42,30,20,0.2) 0%, rgba(42,30,20,0.9) 100%)" }} />
          <div className={`${WRAP} relative pb-[34px] pt-[30px]`}>
            <PrediosHead eyebrow="Oportunidades disponibles" title={<>Activos seleccionados para <span className="font-semibold">crear valor.</span></>}>
              Predios curados por Zequara en zonas consolidadas, con demanda activa, oferta limitada y potencial de transformación.
            </PrediosHead>

            {/* Las tres cifras del portafolio que el lienzo pone bajo el filete. */}
            <In delay={0.1} className="mt-[20px] flex flex-col gap-[7px] border-t border-solid pt-[16px]" style={{ borderColor: "rgba(247,241,229,0.14)" }}>
              {CIFRAS.map((c) => (
                <p key={c.txt} className="m-0 flex items-center gap-[9px] text-[13.5px]" style={{ color: "rgba(247,241,229,0.82)" }}>
                  <span className="size-[9px] shrink-0 rounded-full" style={{ background: "#7f8b57" }} />
                  {c.pre}
                  <b className="font-semibold" style={{ color: "#c9a877" }}>{c.n}</b>
                  {c.txt}
                </p>
              ))}
            </In>
          </div>
        </section>

        {/* ══════════ FILTROS ══════════ */}
        {/* Los seis del lienzo, con sus mismas etiquetas y valores. Ciudad,
            tipo de transformación y orden filtran de verdad; País, Zona y
            Capital van sin lógica, igual que en escritorio, porque todavía no
            hay catálogo detrás. En pantalla pequeña se apilan de dos en dos y
            la barra se pliega para no comerse el alto de la pantalla. */}
        <section className="border-y border-solid" style={{ background: "#3b2410", borderColor: "rgba(165,122,78,0.24)" }}>
          <div className={`${WRAP} py-[16px]`}>
            <div className="grid grid-cols-2 gap-x-[12px] gap-y-[12px]">
              <Campo label="País" value="Todos" />
              <Campo
                label="Ciudad" value={ciudad ?? "Todas"}
                onChange={(v) => setCiudad(v === "Todas" ? null : v)}
                opciones={["Todas", ...ciudades]}
              />
              <Campo label="Zona" value="Todas" />
              <Campo label="Capital requerido" value="Cualquiera" />
              <Campo
                label="Tipo de transformación" value={tipo ?? "Todas"}
                onChange={(v) => setTipo(v === "Todas" ? null : v)}
                opciones={["Todas", ...tipos]}
              />
              <Campo
                label="Ordenar por" value={ORDENES.find((o) => o.v === orden)!.label}
                onChange={(v) => setOrden(ORDENES.find((o) => o.label === v)!.v)}
                opciones={ORDENES.map((o) => o.label)}
              />
            </div>
            <button
              type="button"
              onClick={() => { setCiudad(null); setTipo(null); setOrden("score"); }}
              className="ix-press mt-[14px] text-[13.6px] underline"
              style={{ color: "#ffffff" }}
            >
              Limpiar filtros
            </button>
          </div>
        </section>

        {/* ══════════ REJILLA ══════════ */}
        <section className={`${WRAP} pb-[56px] pt-[22px]`}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-[12px] gap-y-[4px]">
            <p className="m-0 text-[16.5px] font-semibold" style={{ color: CREAM }}>
              {visibles.length} {visibles.length === 1 ? "oportunidad disponible" : "oportunidades disponibles"}
            </p>
            <p className="m-0 text-[13.5px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>Portafolio limitado · actualización mensual</p>
          </div>
          {/* En escritorio esto sale al pasar el ratón sobre el Score de cada
              ficha; en táctil no hay ratón, así que se explica una vez aquí. */}
          <p className="m-0 mt-[8px] text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.55)" }}>
            Score Zequara: {SCORE_TIP}
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
