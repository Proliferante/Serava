"use client";

import { motion, MotionConfig } from "framer-motion";
import CountUp from "@/components/motion/CountUp";
import { PROPIEDADES, RECIENTES } from "@/components/sections/predios/MisPropiedadesScreen";
import { PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { EASE, In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   MIS PROPIEDADES — vista fluida para móvil y tablet.

   El lienzo son 1920 × 1813 con el resumen en tres tarjetas y los activos a
   tres columnas sobre el fondo claro con la silueta de ciudad. Aquí todo se
   apila; la silueta se conserva anclada al pie, que es donde tiene sentido a
   este ancho, y las tres tarjetas del resumen se quedan en tres porque cada
   una lleva su propia lectura —el valor con su barra de composición, la renta
   con su sparkline—.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const LINEN = "#f7f1e5";
const CREAM = "#e2cdae";
const BROWN = "#492100";
const LASER = "#c9a877";
const DRIFT = "#a57a4e";
const GREEN = "#9aa66f";
const AVOCADO = "#7f8b57";
const VERDIGRIS = "#5f6b3e";
const TUSSOCK = "#c8913f";
const L55 = "rgba(247,241,229,0.55)";

const SPARK = [13.59, 17.67, 16.31, 22.44, 20.39, 27.19];

export default function MisPropiedadesCompact() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative overflow-hidden" style={{ background: CREAM }}>
        {/* Silueta de ciudad del frame, anclada al pie. */}
        <img
          src={`${A}/mis-propiedades-ciudad.webp`} alt="" loading="lazy" decoding="async"
          className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-60"
        />

        <div className="relative">
          <PrediosNavCompact onLight />

          {/* ══════════ SALUDO ══════════ */}
          <section className={`${WRAP} pb-[26px] pt-[26px]`}>
            <motion.div
              className="flex items-center gap-[14px]"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
            >
              <span
                className="flex size-[52px] shrink-0 items-center justify-center rounded-full border border-solid text-[17px] font-semibold"
                style={{ borderColor: "rgba(201,168,119,0.4)", backgroundImage: `linear-gradient(150deg, ${DRIFT} 0%, #3d2c1e 100%)`, color: LINEN }}
              >
                NR
              </span>
              <span>
                <span className="block text-[10.5px] font-semibold uppercase tracking-[2.2px]" style={{ color: BROWN }}>Tu portafolio</span>
                <span className="block text-[clamp(1.3rem,5.8vw,1.8rem)] font-light leading-[1.15]" style={{ color: BROWN }}>
                  <span className="font-light">Hola, Pablo. </span>
                  <span className="font-extralight">Bienvenido a tus propiedades.</span>
                </span>
              </span>
            </motion.div>
            <p className="m-0 mt-[12px] text-[14.5px] font-light leading-[1.5]" style={{ color: "rgba(73,33,0,0.85)" }}>
              Esto es lo que has construido con Zequara. Elige una propiedad para ver su detalle.
            </p>
          </section>

          {/* ══════════ RESUMEN ══════════ */}
          <section className={`${WRAP} pb-[30px]`}>
            <div className="flex flex-col gap-[12px] sm:flex-row">
              {/* Valor estimado */}
              <In className="flex-1 rounded-[18px] p-[20px]" style={{ background: AVOCADO, border: "1px solid rgba(127,139,87,0.3)" }} y={18}>
                <p className="m-0 text-[10.9px] font-semibold uppercase tracking-[0.65px]" style={{ color: L55 }}>Valor estimado del portafolio</p>
                <div className="mt-[6px] flex items-center gap-[10px]">
                  <p className="m-0 text-[clamp(1.9rem,8.4vw,2.4rem)] leading-[1.1]">
                    <span style={{ fontWeight: 400, color: LASER }}>$</span>
                    <span style={{ fontWeight: 200, color: LINEN }}><CountUp value={8.1} decimals={3} suffix="M" /></span>
                  </p>
                  <span className="flex items-center gap-[4px] rounded-full px-[9px] py-[4px] text-[11.8px] font-semibold" style={{ background: "rgba(127,139,87,0.18)", color: GREEN }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 17 10 11l4 4 6-6" /><path d="M14 7h6v6" /></svg>
                    +19%
                  </span>
                </div>
                <p className="m-0 mt-[4px] text-[13.5px] font-medium leading-[1.35]" style={{ color: L55 }}>sobre $6.830M invertidos · estimado por comparables de zona</p>
                <div className="mt-[14px] flex h-[10px] w-full overflow-hidden rounded-full" style={{ background: "rgba(247,241,229,0.08)" }}>
                  {[[33, `linear-gradient(90deg, ${TUSSOCK} 0%, #d9a656 100%)`], [67, `linear-gradient(90deg, ${AVOCADO} 0%, ${GREEN} 100%)`]].map(([pct, grad], i) => (
                    <motion.span
                      key={i} className="h-full origin-left" style={{ width: `${pct}%`, backgroundImage: grad as string }}
                      initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease: EASE }}
                    />
                  ))}
                </div>
                <div className="mt-[10px] flex gap-[16px] text-[11.8px] font-light" style={{ color: "rgba(247,241,229,0.72)" }}>
                  <span className="flex items-center gap-[7px]"><span className="block size-[9px] rounded-[3px]" style={{ background: TUSSOCK }} />1 en obra</span>
                  <span className="flex items-center gap-[7px]"><span className="block size-[9px] rounded-[3px]" style={{ background: AVOCADO }} />2 arrendadas</span>
                </div>
              </In>

              <div className="flex flex-col gap-[12px] sm:w-[38%]">
                {/* Inversión total */}
                <In delay={0.08} className="rounded-[18px] p-[18px]" style={{ background: BROWN, border: "1px solid rgba(247,241,229,0.12)" }} y={18}>
                  <p className="m-0 text-[10.9px] font-semibold uppercase tracking-[0.65px]" style={{ color: L55 }}>Inversión total</p>
                  <p className="m-0 mt-[6px] text-[clamp(1.7rem,7.4vw,2.1rem)] leading-[1.1]">
                    <span style={{ fontWeight: 400, color: LASER }}>$</span>
                    <span style={{ fontWeight: 200, color: LINEN }}><CountUp value={6.83} decimals={3} suffix="M" /></span>
                  </p>
                  <p className="m-0 mt-[4px] text-[13px] font-medium" style={{ color: L55 }}>Compra + remodelación · 3 activos</p>
                </In>

                {/* Renta mensual con sparkline */}
                <In delay={0.16} className="rounded-[18px] p-[18px]" style={{ background: BROWN, border: "1px solid rgba(247,241,229,0.12)" }} y={18}>
                  <p className="m-0 text-[10.9px] font-semibold uppercase tracking-[0.65px]" style={{ color: L55 }}>Renta mensual</p>
                  <p className="m-0 mt-[6px] text-[clamp(1.7rem,7.4vw,2.1rem)] leading-[1.1]">
                    <span style={{ fontWeight: 400, color: LASER }}>$</span>
                    <span style={{ fontWeight: 200, color: LINEN }}><CountUp value={21} decimals={0} suffix="M" duration={1.2} /></span>
                  </p>
                  <p className="m-0 mt-[4px] text-[13px] font-light" style={{ color: L55 }}>≈ $252M al año · ocupación 100%</p>
                  <div className="mt-[12px] flex h-[34px] items-end justify-center gap-[5px]">
                    {SPARK.map((h, i) => (
                      <motion.span
                        key={h} className="min-w-px flex-1 origin-bottom"
                        style={{
                          height: h, borderTopLeftRadius: 3, borderTopRightRadius: 3,
                          ...(i === 5 ? { backgroundImage: `linear-gradient(180deg, ${LASER} 0%, ${DRIFT} 100%)` } : { background: "rgba(201,168,119,0.4)" }),
                        }}
                        initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: EASE }}
                      />
                    ))}
                  </div>
                </In>
              </div>
            </div>
          </section>

          {/* ══════════ TUS PROPIEDADES ══════════ */}
          <section className={`${WRAP} pb-[34px]`}>
            <div className="flex items-baseline justify-between gap-[10px]">
              <p className="m-0 text-[clamp(1.25rem,5.4vw,1.55rem)] font-semibold" style={{ color: VERDIGRIS }}>
                Tus propiedades <span style={{ color: BROWN }}>· {PROPIEDADES.length} activos</span>
              </p>
              <p className="m-0 shrink-0 text-[12.5px] font-light" style={{ color: BROWN }}>Actualizado hoy</p>
            </div>

            <div className="mt-[16px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
              {PROPIEDADES.map((p, i) => (
                <In key={p.title} delay={0.06 * i} className="overflow-hidden rounded-[18px] border border-solid" style={{ borderColor: "rgba(247,241,229,0.12)", background: BROWN }}>
                  <div className="relative flex items-center justify-center" style={{ aspectRatio: "16 / 9", backgroundImage: "linear-gradient(135deg, rgba(201,168,119,0.14) 0%, rgba(201,168,119,0) 100%)" }}>
                    <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="rgba(247,241,229,0.5)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /></svg>
                    <span className="absolute left-[12px] top-[12px] rounded-[8px] px-[10px] py-[5px] text-[9.9px] font-bold uppercase tracking-[0.6px]" style={{ background: p.state.tone === "obra" ? TUSSOCK : AVOCADO, color: "#fff" }}>{p.state.label}</span>
                    <span className="absolute bottom-[8px] left-[12px] text-[9.6px] font-semibold uppercase tracking-[0.96px]" style={{ color: L55 }}>Foto — {p.photo}</span>
                  </div>
                  <div className="p-[18px]">
                    <p className="m-0 text-[11.2px] font-semibold uppercase tracking-[1.12px]" style={{ color: DRIFT }}>{p.city}</p>
                    <h3 className="m-0 mt-[7px] text-[16px] font-semibold leading-[1.3]" style={{ color: LINEN }}>{p.title}</h3>
                    <p className="m-0 mt-[7px] text-[12.5px] font-light" style={{ color: "rgba(247,241,229,0.62)" }}>{p.specs}</p>

                    <div className="mt-[13px] border-t border-solid pt-[13px]" style={{ borderColor: "rgba(247,241,229,0.12)" }}>
                      <p className="m-0 text-[10.2px] font-semibold uppercase tracking-[0.6px]" style={{ color: "rgba(247,241,229,0.5)" }}>{p.metric.label}</p>
                      {p.metric.kind === "obra" ? (
                        <>
                          <div className="mt-[4px] flex items-baseline justify-between">
                            <span className="text-[21px] font-semibold" style={{ color: LINEN }}>{p.metric.pct}%</span>
                            <span className="text-[12.5px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>{p.metric.aside}</span>
                          </div>
                          <div className="mt-[8px] h-[8px] w-full overflow-hidden rounded-full" style={{ background: "rgba(247,241,229,0.1)" }}>
                            <motion.div
                              className="h-full origin-left rounded-full"
                              style={{ width: `${p.metric.pct}%`, backgroundImage: `linear-gradient(90deg, ${DRIFT} 0%, ${LASER} 100%)` }}
                              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.6 }}
                              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
                            />
                          </div>
                          <p className="m-0 mt-[7px] text-[12.5px] font-medium" style={{ color: GREEN }}>● {p.metric.note}</p>
                        </>
                      ) : (
                        <div className="mt-[4px] flex items-baseline justify-between gap-[10px]">
                          <span className="text-[21px] font-semibold" style={{ color: LINEN }}>{p.metric.value}</span>
                          <span className="text-[12.5px] font-medium" style={{ color: GREEN }}>● {p.metric.aside}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-[13px] flex items-baseline justify-between border-t border-solid pt-[13px]" style={{ borderColor: "rgba(247,241,229,0.12)" }}>
                      <span className="text-[11.2px] font-normal uppercase tracking-[0.56px]" style={{ color: "rgba(247,241,229,0.5)" }}>Inversión total</span>
                      <span className="text-[15px] font-semibold" style={{ color: LASER }}>{p.invest}</span>
                    </div>

                    <a href={p.href} className="ix-press mt-[14px] flex h-[48px] items-center justify-center gap-[8px] rounded-[12px] text-[14.5px] font-semibold" style={{ background: AVOCADO, color: LINEN }}>
                      Entrar a la propiedad
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </a>
                  </div>
                </In>
              ))}
            </div>
          </section>

          {/* ══════════ LO ÚLTIMO QUE REVISASTE ══════════ */}
          <section className={`${WRAP} pb-[40px]`}>
            <In className="overflow-hidden rounded-[20px] p-[20px]" style={{ background: BROWN, borderTop: "1px solid rgba(247,241,229,0.12)" }}>
              <div className="flex items-baseline justify-between gap-[10px]">
                <p className="m-0 text-[clamp(1.25rem,5.4vw,1.6rem)] font-light" style={{ color: LINEN }}>
                  Lo último que <span className="font-semibold">revisaste</span>
                </p>
                <a href="/predios" className="shrink-0 text-[12.5px] font-semibold" style={{ color: LASER }}>Ver todos los predios →</a>
              </div>
              <p className="m-0 mt-[8px] text-[13.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.6)" }}>
                Retoma donde quedaste. Estas oportunidades siguen disponibles para sumar tu próxima propiedad.
              </p>

              <div className="mt-[16px] flex flex-col gap-[10px]">
                {RECIENTES.map((r, i) => (
                  <In key={r.loc} delay={0.05 * i} y={14}>
                    <a href="/predios/ficha" className="ix-prop flex overflow-hidden rounded-[14px] border border-solid" style={{ borderColor: "rgba(247,241,229,0.12)", background: "rgba(247,241,229,0.04)" }}>
                      <span className="flex w-[84px] shrink-0 items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg, rgba(201,168,119,0.14) 0%, rgba(201,168,119,0) 100%)" }}>
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(247,241,229,0.5)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /></svg>
                      </span>
                      <span className="flex-1 p-[13px]">
                        <span className="block text-[9.9px] font-semibold uppercase tracking-[0.4px]" style={{ color: "rgba(247,241,229,0.45)" }}>{r.seen}</span>
                        <span className="mt-[3px] block text-[10.6px] font-semibold uppercase tracking-[0.85px]" style={{ color: DRIFT }}>{r.loc}</span>
                        <span className="mt-[4px] block text-[14px] font-medium leading-[1.28]" style={{ color: LINEN }}>{r.name.join(" ")}</span>
                        <span className="mt-[7px] flex items-center justify-between">
                          <span className="text-[12.8px] font-semibold" style={{ color: GREEN }}>{r.tir}</span>
                          <span className="text-[11.8px] font-semibold" style={{ color: LASER }}>Ver →</span>
                        </span>
                      </span>
                    </a>
                  </In>
                ))}
              </div>

              <In delay={0.2} className="mt-[16px] rounded-[16px] border border-solid p-[18px]" style={{ borderColor: "rgba(201,168,119,0.28)", backgroundImage: "linear-gradient(118deg, rgba(165,122,78,0.22) 0%, rgba(127,139,87,0.16) 100%)" }}>
                <p className="m-0 text-[16.5px] font-semibold" style={{ color: LINEN }}>¿Listo para sumar otra propiedad?</p>
                <p className="m-0 mt-[5px] text-[13px] font-light leading[1.45]" style={{ color: "rgba(247,241,229,0.72)" }}>
                  Explora el portafolio curado de Zequara y elige tu próxima inversión.
                </p>
                <a href="/predios" className="ix-press mt-[14px] flex h-[48px] items-center justify-center gap-[8px] rounded-full text-[14.5px] font-semibold" style={{ background: LINEN, color: "#2a1e14" }}>
                  Explorar predios disponibles
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
              </In>
            </In>

            <p className="m-0 mt-[22px] text-[12.5px] font-medium leading-[1.5]" style={{ color: BROWN }}>
              Cifras estimadas de referencia. El valor del portafolio se calcula sobre comparables de zona y no constituye una oferta de compra ni garantía de retorno.
            </p>
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}
