"use client";

import { motion, MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
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

/** La misma cuenta atrás de la reserva que el lienzo. */
function useCuentaAtras(inicio: number) {
  const [s, setS] = useState(inicio);
  useEffect(() => {
    const id = window.setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export default function FichaCompact() {
  const [foto, setFoto] = useState(0);
  const tiempo = useCuentaAtras(2 * 3600 + 59 * 60 + 41);

  return (
    <MotionConfig reducedMotion="user">
      <div style={{ background: "#2a1e14" }}>
        <PrediosNavCompact />

        <div className={`${WRAP} pt-[16px]`}>
          <a href="/predios" className="ix-nav flex w-fit items-center gap-[8px] text-[14px] font-medium" style={{ color: "rgba(247,241,229,0.82)" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
            Volver a predios
          </a>
        </div>

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
            <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[6px]" style={{ background: "#b5542f" }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="#ffffff" stroke="none" aria-hidden><path d="M12 2c1 3-1.5 4.5-2.5 6C8 10 8 12 8 12a4 4 0 1 0 8 0c0-2-1-3.5-2-5 2 1 4 3.5 4 7a6 6 0 1 1-12 0c0-4 3-6 6-12z" /></svg>
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-white">Última oferta en la zona</span>
            </span>
            <p className="m-0 mt-[14px] text-[11.8px] font-semibold uppercase leading-[1.55] tracking-[1.4px]" style={{ color: "#a57a4e" }}>La Cabrera · Bogotá · Colombia</p>
            <h1 className="mt-[8px] text-[clamp(1.6rem,6.6vw,2.2rem)] leading-[1.18] text-cream-93">
              <span className="font-light">Apartamento ultra lujo</span>{" "}
              <span className="font-semibold">remodelado a costo cerrado</span>
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

        {/* ══════════ LA OPORTUNIDAD ══════════ */}
        <section className={`${WRAP} pt-[30px]`}>
          <In>
            <h2 className="m-0 text-[21.6px] font-medium leading-[1.14] tracking-[-0.43px]" style={{ color: "#e2cdae" }}>La oportunidad</h2>
            <p className="m-0 mt-[14px] text-[15.5px] font-light leading-[1.55]" style={{ color: "#e2cdae" }}>
              Predio en una de las zonas más consolidadas de Bogotá, donde la demanda es alta y la oferta limitada.
              Entramos por debajo del mercado y lo remodelamos a ultra lujo con criterio técnico: materiales naturales,
              líneas limpias y obra trazable a costo cerrado. El 70% de la oferta de la zona pide más por m² que nuestro costo total.
            </p>
          </In>
        </section>

        {/* ══════════ DATOS ══════════ */}
        <section className={`${WRAP} pt-[30px]`}>
          <In><h2 className="m-0 text-[21.6px] font-medium leading-[1.14] tracking-[-0.43px]" style={{ color: "#e2cdae" }}>Datos generales</h2></In>
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
          <In><h2 className="m-0 text-[21.6px] font-medium leading-[1.14] tracking-[-0.43px]" style={{ color: "#e2cdae" }}>Riesgos y respaldos</h2></In>
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
          <In><h2 className="m-0 text-[21.6px] font-medium leading-[1.14] tracking-[-0.43px]" style={{ color: "#e2cdae" }}>Documentos</h2></In>
          <div className="mt-[12px] flex flex-col gap-[8px]">
            {DOCS.map((d, i) => (
              <In key={d.t} delay={0.04 * i} y={12} className="flex items-center justify-between gap-[12px] rounded-[14px] border border-solid px-[16px] py-[13px]" style={{ borderColor: BORDER }}>
                <span className="text-[14px] font-light text-[rgba(247,241,229,0.85)]">{d.t}</span>
                <span className="shrink-0 rounded-full px-[10px] py-[4px] text-[11px] font-semibold" style={{ background: TONO[d.tone].fondo, color: d.tone === "green" ? VERD : "rgba(247,241,229,0.6)" }}>{d.status}</span>
              </In>
            ))}
          </div>
        </section>

        {/* ══════════ RESERVA ══════════
            El lateral del escritorio, entero. En columna cae aquí, después de
            los documentos, que es donde se toma la decisión. */}
        <section className={`${WRAP} pt-[30px]`}>
          <In className="overflow-hidden rounded-[20px] border border-solid" style={{ background: CREAM, borderColor: BORDER, boxShadow: "0px 30px 60px -38px rgba(42,30,20,0.4)" }}>
            <div className="flex h-[42px] items-center justify-center gap-[7px]" style={{ background: "#b5542f" }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="#ffffff" stroke="none" aria-hidden><path d="M12 2c1 3-1.5 4.5-2.5 6C8 10 8 12 8 12a4 4 0 1 0 8 0c0-2-1-3.5-2-5 2 1 4 3.5 4 7a6 6 0 1 1-12 0c0-4 3-6 6-12z" /></svg>
              <span className="text-[13px] font-semibold text-white">No te pierdas esta oportunidad</span>
            </div>

            <div className="p-[22px]">
              <div className="flex items-center gap-[14px] border-b border-solid pb-[20px]" style={{ borderColor: BORDER }}>
                <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(127,139,87,0.14)" }}>
                  <span className="flex size-[46px] items-center justify-center rounded-full text-[17.6px] font-bold" style={{ background: CREAM, color: "#5f6b3e" }}>96</span>
                </span>
                <span>
                  <span className="block text-[12.5px] font-light" style={{ color: "#5b4332" }}>Score Zequara</span>
                  <span className="block text-[16px] font-semibold" style={{ color: "#3d2c1e" }}>Prioridad alta</span>
                </span>
              </div>

              <p className="m-0 mt-[20px] text-[13px] font-light" style={{ color: "#5b4332" }}>Inversión total</p>
              <div className="mt-[4px] flex items-baseline justify-between gap-[10px]">
                <span className="text-[27px] font-semibold leading-[1.25]" style={{ color: "#3d2c1e" }}>$3.100M</span>
                <span className="text-[13px] font-light" style={{ color: "#5b4332" }}>COP</span>
              </div>
              <div className="mt-[10px] flex items-baseline justify-between gap-[10px]">
                <span className="text-[13px] font-light" style={{ color: "#5b4332" }}>ROI estimado</span>
                <span className="text-[19px] font-semibold" style={{ color: "#5f6b3e" }}>~22%</span>
              </div>

              <div className="mt-[18px] flex items-center gap-[11px] rounded-[13px] border border-solid px-[16px] py-[14px]" style={{ background: "rgba(181,84,47,0.08)", borderColor: "rgba(181,84,47,0.3)" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#b5542f" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                <span>
                  <span className="block text-[12.5px] font-light" style={{ color: "#5b4332" }}>Reserva disponible por</span>
                  <span className="block text-[18.4px] font-bold tabular-nums" style={{ color: "#b5542f" }}>{tiempo}</span>
                </span>
              </div>

              <button type="button" className="ix-press ix-pulse-tuscany mt-[18px] flex h-[56px] w-full items-center justify-center gap-[10px] rounded-full text-[16px] font-semibold text-white" style={{ background: "#b5542f" }}>
                Reservar ahora
                <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13H11l-1 9 8.5-11H12l1-9z" /></svg>
              </button>
              <a href="/predios/add-value" className="ix-press mt-[10px] flex h-[56px] w-full items-center justify-center gap-[9px] rounded-full border border-solid text-[16px] font-semibold" style={{ borderColor: BORDER, color: "#3d2c1e" }}>
                Ver Análisis Add Value
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>

              <p className="m-0 mt-[16px] flex items-center justify-center gap-[8px] text-[12.8px] font-medium" style={{ color: "#b5542f" }}>
                <svg className="motion-safe:animate-pulse" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                5 inversionistas viendo este predio
              </p>
              <p className="m-0 mt-[10px] text-center text-[12.5px] font-light leading-[1.6]" style={{ color: "#5b4332" }}>
                Al reservar, <span className="font-semibold" style={{ color: "#b5542f" }}>el predio se bloquea</span> y deja de estar disponible para otros mientras tu reserva esté vigente.
              </p>
            </div>
          </In>
        </section>

        {/* Barra fija: en una ficha larga la acción no puede quedar a diez
            pantallas de scroll de donde se toma la decisión. */}
        <div className="h-[112px]" />
        <div className="sticky bottom-0 z-30 border-t border-solid px-[24px] pb-[18px] pt-[14px] sm:px-[40px]" style={{ background: "rgba(42,30,20,0.96)", borderColor: BORDER, backdropFilter: "blur(6px)" }}>
          <div className="mx-auto flex max-w-[720px] items-center gap-[12px]">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[16px] font-semibold text-cream-93">COP $3.100M</span>
              <span className="block text-[11.5px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>Compra + remodelación</span>
            </span>
            <button type="button" className="ix-press flex h-[50px] shrink-0 items-center justify-center rounded-full px-[22px] text-[15px] font-semibold text-white" style={{ background: "#b5542f" }}>
              Reservar ahora
            </button>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
