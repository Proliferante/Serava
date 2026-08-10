"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { DATOS, DOCS, PHOTOS, RIESGOS, SPECS } from "@/components/predios/FichaPredio";
import { PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { EASE, In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA DEL PREDIO — vista fluida para móvil y tablet.

   El lienzo pone las tres fotos en mosaico y los datos en dos columnas. Aquí
   las fotos son un carrusel que se pasa con el dedo —`scroll-snap`, no un
   componente: el navegador ya lo hace bien y sin JavaScript— y los datos se
   apilan en filas de etiqueta y valor.

   Los datos se leen de FichaPredio, el componente del lienzo, para que no haya
   dos copias que se desincronicen.
   ═══════════════════════════════════════════════════════════════════════════ */

const CREAM = "#f7f1e5";
const BORDER = "rgba(165,122,78,0.28)";
const VERD = "#9aa66f";

const TONO = {
  green: { punto: "#9aa66f", fondo: "rgba(127,139,87,0.14)" },
  orange: { punto: "#c8913f", fondo: "rgba(200,145,63,0.14)" },
  neutral: { punto: "rgba(247,241,229,0.4)", fondo: "rgba(247,241,229,0.06)" },
} as const;

export default function FichaCompact() {
  const [foto, setFoto] = useState(0);

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ background: "#2a1e14" }}>
        <PrediosNavCompact />

        {/* ══════════ FOTOS ══════════ */}
        <section className="pt-[16px]">
          <div
            className="flex snap-x snap-mandatory gap-[10px] overflow-x-auto px-[24px] pb-[10px] [scrollbar-width:none] sm:px-[40px] [&::-webkit-scrollbar]:hidden"
            onScroll={(e) => {
              const el = e.currentTarget;
              setFoto(Math.round(el.scrollLeft / (el.clientWidth * 0.86)));
            }}
          >
            {PHOTOS.map((p) => (
              <div
                key={p.caption}
                className="relative flex shrink-0 snap-center items-end overflow-hidden rounded-[18px]"
                style={{ width: "86%", aspectRatio: "4 / 3", backgroundImage: p.grad }}
              >
                <span className="p-[14px] text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: "rgba(247,241,229,0.55)" }}>{p.caption}</span>
              </div>
            ))}
          </div>
          {/* Puntos de posición del carrusel. */}
          <div className="mt-[4px] flex justify-center gap-[6px]">
            {PHOTOS.map((p, i) => (
              <motion.span
                key={p.caption}
                className="block h-[6px] rounded-full"
                animate={{ width: i === foto ? 20 : 6, opacity: i === foto ? 1 : 0.4 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ background: "#c9a877" }}
              />
            ))}
          </div>
        </section>

        {/* ══════════ TITULAR ══════════ */}
        <section className={`${WRAP} pt-[24px]`}>
          <In y={16}>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#a57a4e" }}>La Cabrera · Bogotá</p>
            <h1 className="mt-[10px] text-[clamp(1.6rem,6.6vw,2.2rem)] font-semibold leading-[1.18] text-cream-93">
              Apartamento de gran formato con potencial de reconversión
            </h1>
            <div className="mt-[14px] flex flex-wrap items-center gap-[8px]">
              <span className="rounded-full px-[12px] py-[6px] text-[12px] font-medium" style={{ background: "rgba(127,139,87,0.16)", color: VERD }}>Score Zequara 96</span>
              <span className="rounded-full border border-solid px-[12px] py-[6px] text-[12px]" style={{ borderColor: BORDER, color: "rgba(247,241,229,0.75)" }}>Reposicionamiento premium</span>
            </div>
          </In>
        </section>

        {/* ══════════ ESPECIFICACIONES ══════════ */}
        <section className={`${WRAP} pt-[26px]`}>
          <div className="grid grid-cols-3 gap-[10px]">
            {SPECS.map((s, i) => (
              <In key={s.l} delay={0.04 * i} y={14} className="rounded-[14px] border border-solid p-[12px]" style={{ borderColor: BORDER, background: "rgba(247,241,229,0.04)" }}>
                <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.7px]" style={{ color: "rgba(247,241,229,0.5)" }}>{s.l}</p>
                <p className="m-0 mt-[4px] text-[15px] font-semibold text-cream-93">{s.v}</p>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ DATOS ══════════ */}
        <section className={`${WRAP} pt-[30px]`}>
          <In><p className="m-0 text-[11px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#c9a877" }}>Datos del predio</p></In>
          <div className="mt-[12px] overflow-hidden rounded-[16px] border border-solid" style={{ borderColor: BORDER }}>
            {DATOS.map(([l, v], i) => (
              <In key={l} delay={0.03 * i} y={10} className="flex items-center justify-between gap-[12px] border-b border-solid px-[16px] py-[13px] last:border-b-0" style={{ borderColor: "rgba(165,122,78,0.18)", background: i % 2 ? "rgba(247,241,229,0.03)" : "transparent" }}>
                <span className="text-[13.5px] font-light" style={{ color: "rgba(247,241,229,0.65)" }}>{l}</span>
                <span className="text-[13.5px] font-semibold text-cream-93">{v}</span>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ RIESGOS ══════════ */}
        <section className={`${WRAP} pt-[30px]`}>
          <In><p className="m-0 text-[11px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#c9a877" }}>Qué está cubierto y qué no</p></In>
          <div className="mt-[12px] flex flex-col gap-[10px]">
            {RIESGOS.map((r, i) => (
              <In key={r.title} delay={0.05 * i} className="rounded-[16px] border border-solid p-[16px]" style={{ borderColor: BORDER, background: TONO[r.tone].fondo }}>
                <span className="flex items-center gap-[8px]">
                  <span className="block size-[9px] shrink-0 rounded-full" style={{ background: TONO[r.tone].punto }} />
                  <span className="text-[15px] font-semibold text-cream-93">{r.title}</span>
                </span>
                <p className="m-0 mt-[7px] text-[13.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.72)" }}>{r.desc}</p>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ DOCUMENTOS ══════════ */}
        <section className={`${WRAP} pt-[30px]`}>
          <In><p className="m-0 text-[11px] font-semibold uppercase tracking-[2.4px]" style={{ color: "#c9a877" }}>Documentos</p></In>
          <div className="mt-[12px] flex flex-col gap-[8px]">
            {DOCS.map((d, i) => (
              <In key={d.t} delay={0.04 * i} y={12} className="flex items-center justify-between gap-[12px] rounded-[14px] border border-solid px-[16px] py-[13px]" style={{ borderColor: BORDER }}>
                <span className="text-[14px] font-light text-[rgba(247,241,229,0.85)]">{d.t}</span>
                <span className="shrink-0 rounded-full px-[10px] py-[4px] text-[11px] font-semibold" style={{ background: TONO[d.tone].fondo, color: d.tone === "green" ? VERD : "rgba(247,241,229,0.6)" }}>{d.status}</span>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ ACCIÓN ══════════
            Fija al pie: en una ficha larga, la acción no puede quedar a diez
            pantallas de scroll de donde se toma la decisión. */}
        <div className="h-[112px]" />
        <div className="sticky bottom-0 z-30 border-t border-solid px-[24px] pb-[18px] pt-[14px] sm:px-[40px]" style={{ background: "rgba(42,30,20,0.96)", borderColor: BORDER, backdropFilter: "blur(6px)" }}>
          <div className="mx-auto flex max-w-[720px] items-center gap-[12px]">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-semibold text-cream-93">COP $3.100M</span>
              <span className="block text-[11.5px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>Compra + remodelación</span>
            </span>
            <a href="/solicitud-acceso" className="ix-press flex h-[50px] shrink-0 items-center justify-center rounded-full px-[22px] text-[15px] font-semibold" style={{ background: "#7f8b57", color: CREAM }}>
              Reservar evaluación
            </a>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
