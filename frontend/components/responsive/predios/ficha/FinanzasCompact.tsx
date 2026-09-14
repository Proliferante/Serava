"use client";

import { In, WRAP } from "@/components/responsive/kit";
import { Cifra, IcArrowRight, StrokeIcon } from "@/components/predios/ficha/kit";
import { KPIS, LEVERS, Proyeccion, SAYS } from "@/components/predios/ficha/Finanzas";
import {
  Band, BROWN, Card, H2, HAIRLINE, HeroCompact, HeroFoto,
  LINEN, MILL, OLIVE, ReservaCompact, Sub, VERD, ZEUS,
} from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA · FINANZAS — vista fluida (móvil y tablet).

   El único sitio donde no se puede apilar es la proyección a cinco años: el
   gráfico lleva seis puntos con su cifra encima y cinco barras con la suya, y
   comprimir eso a 360 px los solapa hasta volverlos ilegibles. Se deja a su
   tamaño dentro de un carril que se desplaza con el dedo, que es lo único que
   conserva a la vez el dibujo y los números. En tablet ya entra casi entero.
   ═══════════════════════════════════════════════════════════════════════════ */

/** El hero de la pestaña. */
export function FinanzasHeroCompact() {
  return (
    <HeroCompact
      media={<HeroFoto />}
      title={<>Un clásico con gran potencial de valor</>}
      sub="Ubicación privilegiada. Metraje único. Una oportunidad excepcional en la microzona más sólida de Bogotá."
      cta={{ label: "Ver galería", href: "#galeria" }}
    >
      <ReservaCompact />
    </HeroCompact>
  );
}

/**
 * El cuerpo de la pestaña. Nav, pestañas, barra de reserva y footer los monta
 * `FichaCompact`, que es quien se queda fijo mientras esto entra y sale.
 */
export default function FinanzasCompact() {
  return (
    <>
      {/* ══════════ INDICADORES DE VALOR PATRIMONIAL ══════════ */}
      <Band tone="cream" corner="bl" className="pb-[40px] pt-[42px]">
        <div className={WRAP}>
          <In>
            <H2>Indicadores de valor patrimonial</H2>
            <Sub>Métricas clave de la oportunidad, comparadas con los promedios de su microzona. Cifras en millones de pesos (COP).</Sub>
          </In>

          <div className="mt-[22px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
            {KPIS.map((k, i) => (
              <In key={k.title.join(" ")} delay={0.04 * i} className="flex flex-col items-center rounded-[20px] px-[18px] py-[20px] text-center" style={{ backgroundColor: BROWN }}>
                <span className="flex size-[56px] items-center justify-center rounded-full" style={{ backgroundColor: "#efe9dc", color: "#a57a4e" }}>
                  <StrokeIcon vb={40} d={k.d} w={1.125} s={36} />
                </span>
                <span className="mt-[12px] text-[17px] font-bold leading-[1.2]" style={{ color: OLIVE }}>{k.title.join(" ")}</span>
                <Cifra v={k.value} className="mt-[6px] text-[clamp(1.7rem,7vw,2.1rem)] font-semibold leading-[1.1]" style={{ color: "#dfc59f" }} />
                <span className="mt-[4px] text-[13px] leading-[1.35]" style={{ color: LINEN }}>{k.note}</span>
                {k.delta && (
                  <span className="mt-[10px] rounded-[7px] px-[9px] py-[3px] text-[12.5px] font-semibold" style={{ backgroundColor: "#e4e8d5", color: VERD }}>{k.delta}</span>
                )}
              </In>
            ))}
          </div>
        </div>
      </Band>

      {/* ══════════ LAS 3 PALANCAS DE VALOR ══════════ */}
      <Band tone="brown" corner="br" className="pb-[42px] pt-[42px]">
        <div className={WRAP}>
          <In>
            <H2 dark>Las 3 palancas de valor</H2>
            <Sub dark>Nuestra tesis de inversión se apoya en tres motores de valor, con pesos definidos en el modelo.</Sub>
          </In>

          {/* El icono cuelga por encima del borde, como en el lienzo: por eso
              las tarjetas llevan separación de sobra entre ellas. */}
          <div className="mt-[52px] flex flex-col gap-[52px] sm:mt-[56px] sm:gap-[56px]">
            {LEVERS.map((l, i) => (
              <In key={l.t} delay={0.05 * i} className="relative rounded-[16px] border border-solid px-[20px] pb-[20px] pt-[52px]" style={{ backgroundColor: "#f7edd9", borderColor: HAIRLINE }}>
                <span className="absolute left-1/2 top-0 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[11px]" style={{ backgroundColor: "#b9c69f", color: VERD }}>
                  <StrokeIcon vb={50} d={l.d} w={1.25} s={44} />
                </span>
                <div className="flex items-center justify-center gap-[12px]">
                  <h3 className="m-0 text-[clamp(1.25rem,5.4vw,1.6rem)] font-semibold leading-[1.15] tracking-[-0.01em]" style={{ color: ZEUS }}>{l.t}</h3>
                  <span className="flex h-[34px] shrink-0 items-center rounded-[6px] px-[12px] text-[16px] font-semibold" style={{ backgroundColor: OLIVE, color: LINEN }}>{l.peso}</span>
                </div>
                <p className="m-0 mt-[10px] text-[clamp(0.95rem,3.9vw,1.15rem)] font-light leading-[1.4]" style={{ color: MILL }}>{l.p}</p>
              </In>
            ))}
          </div>
        </div>
      </Band>

      {/* ══════════ PROYECCIÓN PATRIMONIAL A 5 AÑOS ══════════ */}
      <Band tone="cream" corner="bl" className="pb-[40px] pt-[42px]">
        <div className={WRAP}>
          <In>
            <H2>Proyección patrimonial a 5 años</H2>
            <Sub>Evolución estimada del valor del activo y la renta neta acumulada. Cifras en millones (COP).</Sub>
          </In>
        </div>

        <In delay={0.06} className="mt-[22px]">
          <div className="mx-auto max-w-[720px] px-[24px] sm:px-[40px]">
            <div className="rounded-[16px] border border-solid pb-[16px] pt-[18px]" style={{ backgroundColor: "#f7edd9", borderColor: HAIRLINE }}>
              <div className="flex flex-wrap gap-x-[18px] gap-y-[6px] px-[18px]">
                <span className="flex items-center gap-[8px] text-[14px]" style={{ color: MILL }}>
                  <span className="block size-[12px] rounded-[3px]" style={{ backgroundColor: "#8f6740" }} />Valor del activo
                </span>
                <span className="flex items-center gap-[8px] text-[14px]" style={{ color: MILL }}>
                  <span className="block size-[12px] rounded-[3px]" style={{ backgroundColor: "#6d774a" }} />Renta neta acumulada
                </span>
              </div>

              <div className="mt-[10px] overflow-x-auto px-[18px] [scrollbar-width:thin]">
                <Proyeccion />
              </div>

              <p className="m-0 mt-[6px] px-[18px] text-[12px] font-light lg:hidden" style={{ color: "rgba(107,91,71,0.75)" }}>Desliza el gráfico para ver los cinco años.</p>
            </div>
          </div>
        </In>

        <div className={`${WRAP} mt-[18px]`}>
          <p className="m-0 text-[14.5px] font-light leading-[1.5]" style={{ color: MILL }}>
            Metodología: esta evaluación utiliza los supuestos de la microzona (precios, valorización y rentas). Cifras estimadas de referencia; no constituyen garantía de retorno.
          </p>
        </div>
      </Band>

      {/* ══════════ QUÉ NOS DICE ESTA EVALUACIÓN ══════════ */}
      <Band tone="brown" corner="br" className="pb-[42px] pt-[42px]">
        <div className={WRAP}>
          <In><H2 dark>Qué nos dice esta evaluación</H2></In>

          <div className="mt-[22px] grid grid-cols-1 gap-[10px] sm:grid-cols-2">
            {SAYS.map((s, i) => (
              <Card key={s.t} delay={0.04 * i} className="text-center">
                <h3 className="m-0 text-[18px] font-medium leading-[1.2] tracking-[-0.01em]" style={{ color: ZEUS }}>{s.t}</h3>
                <p className="m-0 mt-[8px] text-[15px] font-light leading-[1.35]" style={{ color: MILL }}>{s.p}</p>
              </Card>
            ))}
          </div>
        </div>
      </Band>

      {/* ══════════ CIERRE ══════════ */}
      <Band tone="cream" className="pb-[46px] pt-[42px]">
        <div className={WRAP}>
          <In className="relative overflow-hidden rounded-[20px]" style={{ backgroundColor: BROWN }}>
            <img src="/figma/ficha-cta.webp" alt="" loading="lazy" decoding="async" className="block w-full max-w-none object-cover" style={{ aspectRatio: "16 / 9" }} />
            <span className="pointer-events-none absolute inset-x-0 top-0 block h-[62%]" style={{ background: "linear-gradient(180deg, rgba(73,33,0,0.2) 0%, rgba(73,33,0,0.9) 78%, #492100 100%)" }} />

            <div className="relative p-[22px] pt-0">
              <h2 className="m-0 text-[clamp(1.6rem,6.6vw,2.2rem)] font-semibold leading-[1.05] tracking-[-0.01em]" style={{ color: "#efe6d5" }}>Las buenas oportunidades no esperan</h2>

              <div className="mt-[20px] grid grid-cols-3 gap-[10px]">
                {[
                  { v: "3", l: "inversionistas evaluando" },
                  { v: "96", suf: "/100", l: "Score ZEQUARA" },
                  { v: "+$326M", l: "valor creado hoy" },
                ].map((s) => (
                  <span key={s.l} className="min-w-0">
                    <span className="block text-[clamp(1.3rem,5.6vw,1.9rem)] font-semibold leading-[1.1]" style={{ color: "#efe6d5" }}>
                      <Cifra v={s.v} />{s.suf && <span className="font-light" style={{ fontSize: "0.66em" }}>{s.suf}</span>}
                    </span>
                    <span className="mt-[4px] block text-[12px] leading-[1.3]" style={{ color: "rgba(247,241,229,0.65)" }}>{s.l}</span>
                  </span>
                ))}
              </div>

              <a href="/solicitud-acceso" className="ix-press mt-[22px] flex h-[54px] w-full max-w-[360px] items-center justify-center gap-[9px] rounded-[10px] text-[16px] font-semibold text-white" style={{ backgroundColor: OLIVE }}>
                Quiero conocer esta oportunidad
                <IcArrowRight className="shrink-0" />
              </a>
            </div>
          </In>
        </div>
      </Band>
    </>
  );
}
