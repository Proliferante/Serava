"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { EASE, In, WRAP } from "@/components/responsive/kit";
import { Cifra, posicionTermo, StrokeIcon, Termo } from "@/components/predios/ficha/kit";
import { useFicha } from "@/components/predios/ficha/datos";
import {
  ALTERNATIVAS, Cascada, ESCENARIOS, ESENCIAL, LIQUIDEZ, Proyeccion, SALIDA, TABLA, TABLA_HEAD,
} from "@/components/predios/ficha/Finanzas";
import {
  Band, BROWN, Card, FichaShellCompact, H2, HAIRLINE, HeroCompact, HeroFoto,
  MILL, OLIVE, ReservaCompact, Sub, VERD,
} from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA · FINANZAS — vista fluida (móvil y tablet).

   El rediseño parte la pestaña en un resumen corto y una ficha técnica que se
   despliega, y aquí eso viene de perlas: en vertical el análisis completo son
   más de dos mil píxeles de scroll, y plegado deja la decisión —una cifra,
   cuatro datos y el termómetro— en una pantalla y media.

   Los dos gráficos no se pueden apilar ni encoger: la proyección lleva seis
   puntos con su cifra encima y cinco barras con la suya, y la cascada del
   costo, cinco columnas con dos rótulos cada una. Los dos van a su tamaño
   dentro de un carril que se desplaza con el dedo. En tablet entran enteros.
   ═══════════════════════════════════════════════════════════════════════════ */

const ARENA = "#e7dbc2";
const HUESO = "#faf5ea";
const TOPO = "#9d8b70";
const SOMBRA = "#7a6a52";
const VELO = "rgba(247,241,229,0.05)";
const VELO_BORDE = "rgba(247,241,229,0.12)";

const IcInfo15 = () => <StrokeIcon vb={15} w={1.25} d="M7.5 13.75C10.9518 13.75 13.75 10.9518 13.75 7.5C13.75 4.04822 10.9518 1.25 7.5 1.25C4.04822 1.25 1.25 4.04822 1.25 7.5C1.25 10.9518 4.04822 13.75 7.5 13.75ZM7.5 10.625V7.5M7.5 4.6875H7.50625" />;
const IcChevron16 = () => <StrokeIcon vb={16} w={1.6} d="M4 6L8 10.5L12 6" />;

/** Tarjeta de dato sobre banda marrón: rótulo, cifra y pie. */
function Mini({ t, v, pie, bg, delay = 0 }: { t: string; v: string; pie?: string; bg?: string; delay?: number }) {
  return (
    <In
      delay={delay}
      className="rounded-[12px] border border-solid px-[20px] py-[17px]"
      style={{ background: bg ?? VELO, borderColor: VELO_BORDE }}
    >
      <span className="block text-[14px] leading-[1.35]" style={{ color: "rgba(247,241,229,0.7)" }}>{t}</span>
      <Cifra v={v} className="mt-[4px] block text-[clamp(1.5rem,6.4vw,1.9rem)] font-semibold leading-[1.15]" style={{ color: ARENA }} />
      {pie && <span className="mt-[4px] block text-[11.5px] leading-[1.4]" style={{ color: "rgba(247,241,229,0.7)" }}>{pie}</span>}
    </In>
  );
}

/** Tarjeta de dato sobre banda clara. */
function MiniClara({ t, v, badge, vc = "#3d2c1e", bg, delay = 0 }: { t: string; v: string; badge?: string; vc?: string; bg?: string; delay?: number }) {
  return (
    <In
      delay={delay}
      className="rounded-[12px] border border-solid px-[20px] py-[17px]"
      style={{ background: bg ?? HUESO, borderColor: HAIRLINE }}
    >
      <span className="block text-[14px] leading-[1.35]" style={{ color: SOMBRA }}>{t}</span>
      <Cifra v={v} className="mt-[4px] block text-[clamp(1.5rem,6.4vw,1.8rem)] font-semibold leading-[1.15]" style={{ color: vc }} />
      {badge && (
        <span className="mt-[8px] inline-block rounded-[6px] px-[9px] py-[3px] text-[11.5px] font-semibold" style={{ backgroundColor: "#e2e7d1", color: VERD }}>{badge}</span>
      )}
    </In>
  );
}

/** Nota al pie con el icono de información. */
function Nota({ dark = false, children }: { dark?: boolean; children: React.ReactNode }) {
  return (
    <p className="m-0 mt-[14px] flex gap-[10px] text-[12.5px] font-light leading-[1.5]" style={{ color: dark ? "rgba(247,241,229,0.6)" : SOMBRA }}>
      <span className="shrink-0" style={{ marginTop: 2, color: "#a57a4e" }}><IcInfo15 /></span>
      <span>{children}</span>
    </p>
  );
}

export default function FinanzasCompact() {
  const d = useFicha();
  const [abierta, setAbierta] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <FichaShellCompact
        tab="finanzas"
        hero={
          <HeroCompact media={<HeroFoto />} title={<>Un clásico con gran potencial de valor</>}>
            <ReservaCompact />
          </HeroCompact>
        }
      >
        {/* ══════════ LO ESENCIAL, EN SEGUNDOS ══════════ */}
        <Band tone="cream" corner="bl" className="pb-[40px] pt-[42px]">
          <div className={WRAP}>
            <In>
              <H2>Lo esencial, en segundos</H2>
              <Sub>Las cifras que definen la oportunidad. Para el análisis completo, abre la ficha técnica.</Sub>
            </In>

            {/* La cifra que manda */}
            <In delay={0.04} className="mt-[22px] rounded-[16px] px-[22px] py-[26px]" style={{ backgroundColor: OLIVE }}>
              <span className="block text-[15px] leading-[1.3]" style={{ color: "rgba(247,241,229,0.8)" }}>Retorno total acumulado</span>
              <Cifra v={d.t("fin_retorno", "54,4%")} dur={1.5} className="mt-[8px] block text-[clamp(3rem,15vw,4rem)] font-bold leading-[1]" style={{ color: ARENA }} />
              <span className="mt-[8px] block text-[15px] leading-[1.35]" style={{ color: "rgba(247,241,229,0.85)" }}>{d.t("fin_retorno_nota", "a 5 años · sobre el capital invertido")}</span>
              <span className="mt-[14px] inline-block rounded-full px-[13px] py-[6px] text-[13.5px] font-semibold" style={{ backgroundColor: "rgba(247,241,229,0.14)", color: ARENA }}>
                TIR {d.t("fin_tir", "~12,5%")} E.A. · vs. {d.t("fin_cdt", "10,5%")} CDT
              </span>
            </In>

            <div className="mt-[12px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
              {ESENCIAL.map((c, i) => (
                <In key={c.t} delay={0.04 * i} className="rounded-[14px] border border-solid px-[18px] py-[17px]" style={{ backgroundColor: HUESO, borderColor: HAIRLINE }}>
                  <span className="block text-[15px] font-semibold leading-[1.2]" style={{ color: BROWN }}>{c.t}</span>
                  <Cifra v={d.t(c.k, c.v)} className="mt-[4px] block text-[clamp(1.4rem,6vw,1.9rem)] font-semibold leading-[1.15]" style={{ color: "#3d2c1e" }} />
                  <span className="mt-[4px] block text-[13px] leading-[1.35]" style={{ color: TOPO }}>{c.kn ? d.t(c.kn, c.note) : c.note}</span>
                </In>
              ))}
            </div>

            {/* Posición en el rango de precios de mercado */}
            <In delay={0.12} className="mt-[12px] rounded-[14px] border border-solid px-[18px] pb-[16px] pt-[18px]" style={{ backgroundColor: HUESO, borderColor: HAIRLINE }}>
              <span className="block text-[14.5px] leading-[1.3]" style={{ color: SOMBRA }}>Posición en el rango de precios de mercado ($/m²)</span>
              <div className="mt-[26px]">
                <Termo
                  width="100%"
                  pos={posicionTermo(d.n("termo_actual", 8.1), d.n("termo_min", 7.5), d.n("termo_max", 12), 15.86)}
                  label={`Este activo · $${d.n("termo_actual", 8.1).toLocaleString("es-CO", { maximumFractionDigits: 1 })}M`}
                  min={`$${d.n("termo_min", 7.5).toLocaleString("es-CO", { maximumFractionDigits: 1 })}M`}
                  max={d.t("termo_max_rotulo", "Mercado remodelado $12M")}
                  delay={0.1}
                />
              </div>
              <p className="m-0 mt-[14px] text-[12px] leading-[1.45]" style={{ color: TOPO }}>{d.t("termo_nota", "Entramos por debajo del mercado: margen de valorización desde la compra.")}</p>
            </In>

            <In delay={0.16}>
              <button
                type="button"
                onClick={() => setAbierta((v) => !v)}
                aria-expanded={abierta}
                className="ix-press mt-[18px] flex h-[52px] w-full items-center justify-center gap-[9px] rounded-full text-[15px] font-semibold"
                style={{ backgroundColor: "#3d2c1e", color: ARENA }}
              >
                {abierta ? "Ocultar la ficha técnica" : "Ver ficha técnica completa"}
                <motion.span className="flex shrink-0" animate={{ rotate: abierta ? 180 : 0 }} transition={{ duration: 0.4, ease: EASE }}>
                  <IcChevron16 />
                </motion.span>
              </button>
            </In>
          </div>
        </Band>

        {/* ══════════ FICHA TÉCNICA COMPLETA ══════════ */}
        <AnimatePresence initial={false}>
          {abierta && (
            <motion.div
              key="ft"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ overflow: "hidden" }}
            >
              {/* ── Rentabilidad detallada + contexto de mercado ── */}
              <Band tone="brown" corner="br" className="pb-[42px] pt-[42px]">
                <div className={WRAP}>
                  <In><H2 dark>Rentabilidad detallada</H2></In>
                  <div className="mt-[20px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                    <Mini t="Gastos estimados anuales" v={d.t("ft_gastos_anuales", "$14M")} pie={d.t("ft_gastos_nota", "admin., predial, seguros")} />
                    <Mini t="TIR a 5 años" v={d.t("ft_tir_5", "~12,5%")} pie="efectivo anual" delay={0.06} bg="linear-gradient(151.696deg, rgba(127,139,87,0.4) 0%, rgba(95,107,62,0.3) 100%)" />
                  </div>

                  <In className="mt-[34px]"><H2 dark>Contexto de mercado</H2></In>
                  <In delay={0.06} className="mt-[20px] rounded-[16px] border border-solid px-[22px] pb-[22px] pt-[24px]" style={{ background: VELO, borderColor: VELO_BORDE }}>
                    <span className="block text-[14.5px] leading-[1.3]" style={{ color: "rgba(247,241,229,0.7)" }}>Rango de arriendo mensual (320 m²)</span>
                    <div className="mt-[26px]">
                      <Termo
                        width="100%"
                        pos={posicionTermo(d.n("ft_arriendo_mediana", 18.6), d.n("ft_arriendo_min", 16), d.n("ft_arriendo_max", 21), 51.8)}
                        label={`Mediana ${d.t("ft_arriendo_mediana", "$18,6M")}`}
                        min={`Mín ${d.t("ft_arriendo_min", "$16M")}`}
                        max={`Máx ${d.t("ft_arriendo_max", "$21M")}`}
                        grad="linear-gradient(90deg, #8a9a5f 0%, #c9a877 100%)"
                        mark={ARENA} labelColor={ARENA} endsColor="rgba(247,241,229,0.6)" delay={0.12}
                      />
                    </div>
                    <div className="mt-[22px]">
                      <Mini t="Tasa de vacancia estimada" v={d.t("ft_vacancia", "~4%")} pie="de la zona" delay={0.12} />
                    </div>
                  </In>
                </div>
              </Band>

              {/* ── Composición del costo ── */}
              <Band tone="cream" corner="bl" className="pb-[40px] pt-[42px]">
                <div className={WRAP}>
                  <In><H2>Composición del costo</H2></In>
                </div>

                <In delay={0.06} className="mt-[22px]">
                  <div className="mx-auto max-w-[720px] px-[24px] sm:px-[40px]">
                    <div className="rounded-[16px] border border-solid p-[18px]" style={{ backgroundColor: HUESO, borderColor: HAIRLINE }}>
                      <div className="overflow-x-auto [scrollbar-width:thin]">
                        <div style={{ minWidth: 520 }}>
                          <Cascada w="100%" h={224} />
                        </div>
                      </div>
                      <p className="m-0 mt-[8px] text-[12px] font-light lg:hidden" style={{ color: "rgba(107,91,71,0.75)" }}>Desliza el gráfico si no entra entero.</p>
                    </div>
                  </div>
                </In>

                <div className={`${WRAP} mt-[14px]`}>
                  <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                    <MiniClara t="Costo total (All-in)" v={d.t("puente_allin", "$3.450M")} badge={d.t("puente_allin_m2", "$10,8M / m²")} />
                    <MiniClara t="Media mercado remodelado" v={d.t("ft_mercado_total", "$3.776M")} badge={d.t("puente_mercado_m2", "$11,8M / m²")} delay={0.06} />
                    <MiniClara t="Spread de valor" v={d.t("ft_spread", "+9%")} vc={VERD} delay={0.1} />
                    <MiniClara t="Valor creado hoy" v={d.t("valor_creado", "+$326M")} vc={VERD} delay={0.14} bg="linear-gradient(154.622deg, rgb(226,231,209) 0%, rgb(215,221,196) 100%)" />
                  </div>
                  <Nota>{d.t("ft_composicion_nota", "Precio de compra $2.600M · Remodelación $800M · Otros (notariales, transacción) $50M. Cifras de referencia.")}</Nota>
                </div>
              </Band>

              {/* ── Escenarios de TIR + comparación ── */}
              <Band tone="brown" corner="br" className="pb-[42px] pt-[42px]">
                <div className={WRAP}>
                  <In><H2 dark>Escenarios de TIR</H2></In>

                  <In delay={0.06} className="mt-[20px] rounded-[16px] border border-solid px-[22px] pb-[22px] pt-[24px]" style={{ background: VELO, borderColor: VELO_BORDE }}>
                    <div className="flex items-end justify-center gap-[12px]" style={{ height: 190 }}>
                      {ESCENARIOS.map((e) => (
                        <span key={e.t} className="flex h-full flex-1 flex-col items-center justify-end">
                          <Cifra v={d.t(e.k, e.v)} className="pb-[8px] text-[clamp(1.1rem,5vw,1.55rem)] font-bold leading-[1.2]" style={{ color: "#e2cdae" }} />
                          <motion.span
                            className="block w-full rounded-t-[8px]"
                            style={{ height: e.h, backgroundImage: `linear-gradient(180deg, ${e.from} 0%, ${e.to} 100%)`, transformOrigin: "center bottom" }}
                            initial={{ scaleY: 0, opacity: 0 }}
                            whileInView={{ scaleY: 1, opacity: 1 }}
                            viewport={{ once: true, amount: 0.4 }}
                            transition={{ duration: 0.75, ease: EASE }}
                          />
                          <span className="pt-[9px] text-[13px] font-medium" style={{ color: "#e2cdae" }}>{e.t}</span>
                        </span>
                      ))}
                    </div>
                  </In>

                  <In className="mt-[34px]"><H2 dark>Comparación vs. alternativas</H2></In>
                  <In delay={0.06} className="mt-[20px] rounded-[16px] border border-solid px-[22px] pb-[22px] pt-[20px]" style={{ background: VELO, borderColor: VELO_BORDE }}>
                    <div className="flex items-baseline justify-between border-b border-solid pb-[9px] text-[10.2px] font-semibold uppercase tracking-[0.41px]" style={{ borderColor: VELO_BORDE, color: "rgba(247,241,229,0.85)" }}>
                      <span>Alternativa</span><span>Retorno anual</span>
                    </div>
                    {ALTERNATIVAS.map((a) => (
                      <div key={a.t} className="flex items-baseline justify-between gap-[12px] border-b border-solid py-[10px] last:border-b-0" style={{ borderColor: VELO_BORDE }}>
                        <span className="text-[13.6px]" style={{ color: "rgba(247,241,229,0.85)" }}>{a.t}</span>
                        <span className="shrink-0 text-[13.6px] font-semibold" style={{ color: a.verde ? VERD : "rgba(247,241,229,0.85)" }}>{d.t(a.k, a.v)}</span>
                      </div>
                    ))}
                    <Nota dark>{d.t("ft_alternativas_nota", "La TIR incluye renta y valorización; el CDT es renta fija sin activo subyacente.")}</Nota>
                  </In>
                </div>
              </Band>

              {/* ── Proyección patrimonial detallada ── */}
              <Band tone="cream" corner="bl" className="pb-[40px] pt-[42px]">
                <div className={WRAP}>
                  <In><H2>Proyección patrimonial detallada</H2></In>
                </div>

                <In delay={0.06} className="mt-[22px]">
                  <div className="mx-auto max-w-[720px] px-[24px] sm:px-[40px]">
                    <div className="rounded-[16px] border border-solid pb-[16px] pt-[18px]" style={{ backgroundColor: HUESO, borderColor: HAIRLINE }}>
                      <div className="flex flex-wrap gap-x-[18px] gap-y-[6px] px-[18px]">
                        <span className="flex items-center gap-[8px] text-[14px]" style={{ color: MILL }}>
                          <span className="block size-[12px] rounded-[3px]" style={{ backgroundColor: "#8f6740" }} />Valor del activo
                        </span>
                        <span className="flex items-center gap-[8px] text-[14px]" style={{ color: MILL }}>
                          <span className="block size-[12px] rounded-[3px]" style={{ backgroundColor: "#7d8a54" }} />Renta neta acumulada
                        </span>
                      </div>

                      <div className="mt-[10px] overflow-x-auto px-[18px] [scrollbar-width:thin]">
                        <Proyeccion />
                      </div>

                      <p className="m-0 mt-[6px] px-[18px] text-[12px] font-light lg:hidden" style={{ color: "rgba(107,91,71,0.75)" }}>Desliza el gráfico para ver los cinco años.</p>
                    </div>
                  </div>
                </In>

                {/* La tabla año a año: en vertical se lee mejor por filas que
                    por columnas, así que cada año es una tarjeta. */}
                <div className={`${WRAP} mt-[14px]`}>
                  <Card>
                    {d.tabla("ft_proyeccion", TABLA).map((r, i, todas) => (
                      <In
                        key={`${r[0]}-${i}`}
                        delay={0.04 * i}
                        className="border-b border-solid py-[12px] first:pt-0 last:border-b-0 last:pb-0"
                        style={{ borderColor: HAIRLINE, backgroundColor: i === todas.length - 1 ? "#e2e7d1" : undefined }}
                      >
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.4px]" style={{ color: TOPO }}>Año {r[0]}</span>
                        <div className="mt-[6px] grid grid-cols-2 gap-x-[12px] gap-y-[4px] sm:grid-cols-4">
                          {r.slice(1).map((c, j) => (
                            <span key={TABLA_HEAD[j + 1]} className="min-w-0">
                              <span className="block truncate text-[11.5px]" style={{ color: SOMBRA }}>{TABLA_HEAD[j + 1]}</span>
                              <span className="block text-[14.5px] font-semibold" style={{ color: i === todas.length - 1 ? VERD : "#3a2c1c" }}>{c}</span>
                            </span>
                          ))}
                        </div>
                      </In>
                    ))}
                  </Card>
                </div>
              </Band>

              {/* ── Liquidez + costos de salida ── */}
              <Band tone="brown" corner="br" className="pb-[46px] pt-[42px]">
                <div className={WRAP}>
                  <In><H2 dark>Liquidez</H2></In>
                  <div className="mt-[20px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                    {LIQUIDEZ.map((m, i) => <Mini key={m.t} t={m.t} v={d.t(m.k, m.v)} delay={0.05 * i} />)}
                  </div>

                  <In className="mt-[34px]"><H2 dark>Costos de salida</H2></In>
                  <div className="mt-[20px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
                    {SALIDA.map((m, i) => <Mini key={m.t} t={m.t} v={d.t(m.k, m.v)} pie={m.kp ? d.t(m.kp, m.pie) : m.pie || undefined} delay={0.05 * i} />)}
                  </div>

                  <p className="m-0 mt-[22px] text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.6)" }}>
                    Cifras estimadas de referencia sobre supuestos de la microzona; no constituyen garantía de retorno.
                  </p>
                </div>
              </Band>
            </motion.div>
          )}
        </AnimatePresence>
      </FichaShellCompact>
    </MotionConfig>
  );
}
