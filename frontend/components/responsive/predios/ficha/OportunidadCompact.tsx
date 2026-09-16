"use client";

import { MotionConfig } from "framer-motion";
import { In, WRAP } from "@/components/responsive/kit";
import {
  Barre, Cifra, IcArrowRight, IcCalendar, IcCheck13, IcPin,
} from "@/components/predios/ficha/kit";
import { LEGEND, MIRADA, PASOS, POIS, STACK, TCARDS, WHY } from "@/components/predios/ficha/Oportunidad";
import {
  Band, BROWN, Card, CREAM, FichaShellCompact, FotoPendiente, H2, HAIRLINE, HeroCompact,
  HeroFoto, MILL, OLIVE, ReservaCompact, Sub, VERD,
} from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA · OPORTUNIDAD — vista fluida (móvil y tablet).

   Mismo contenido que el frame 729:2379, reorganizado en una columna. Los dos
   sitios donde no basta con apilar:

   · La barra apilada de la inversión pierde sus rótulos internos: a 320 px no
     caben cuatro cifras dentro de 44 px de alto. La barra se queda como lo que
     es —la proporción de un vistazo— y los números bajan a la leyenda, que
     aquí va a dos columnas en vez de en fila.
   · La fila de tres cifras del cierre se apila a una columna en móvil y el
     enlace al análisis pasa a ocupar todo el ancho, que es donde se pulsa.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function OportunidadCompact() {
  return (
    <MotionConfig reducedMotion="user">
      <FichaShellCompact
        tab="oportunidad"
        hero={
          <HeroCompact media={<HeroFoto />} title={<>Un clásico con gran potencial de valor</>}>
            <ReservaCompact />
          </HeroCompact>
        }
      >
        {/* ══════════ POR QUÉ ZEQUARA LO SELECCIONÓ ══════════ */}
        <Band tone="cream" corner="br" className="pb-[40px] pt-[42px]">
          <div className={WRAP}>
            <In><H2>Por qué ZEQUARA lo seleccionó</H2></In>

            <div className="mt-[22px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
              {WHY.map(({ Ic, t, d }, i) => (
                <In key={t} delay={0.05 * i} className="rounded-[16px] p-[20px]" style={{ backgroundColor: "#eedbc0" }}>
                  <span className="flex size-[42px] items-center justify-center rounded-[11px]" style={{ backgroundColor: "#ccd5af", color: "#463527" }}>
                    <Ic />
                  </span>
                  <h3 className="m-0 mt-[16px] text-[19px] font-semibold leading-[1.2] tracking-[-0.01em]" style={{ color: "#4b542e" }}>{t}</h3>
                  <p className="m-0 mt-[8px] text-[15px] font-light leading-[1.5]" style={{ color: BROWN }}>{d}</p>
                </In>
              ))}
            </div>

            <In delay={0.1} className="mt-[16px] overflow-hidden rounded-[16px]">
              <img src="/figma/ficha-interior.webp" alt="Interior del inmueble" loading="lazy" decoding="async" className="block w-full max-w-none object-cover" style={{ aspectRatio: "16 / 11" }} />
            </In>
          </div>
        </Band>

        {/* ══════════ LA OPORTUNIDAD EN UNA MIRADA ══════════ */}
        <Band tone="brown" corner="bl" className="pb-[42px] pt-[42px]">
          <div className={WRAP}>
            <In><H2 dark>La oportunidad en una mirada</H2></In>

            {/* Del precio de compra al valor de mercado remodelado */}
            <Card className="mt-[22px]" style={{ backgroundColor: "rgba(248,239,220,0.95)" }}>
              <div className="flex items-end justify-between gap-[12px]">
                <span>
                  <span className="block text-[10.6px] font-semibold uppercase tracking-[0.95px]" style={{ color: "#94836b" }}>Tu All-in Cost</span>
                  <span className="mt-[3px] block text-[clamp(1.5rem,7vw,2.1rem)] font-semibold leading-[1.05]" style={{ color: OLIVE }}>$3.450M</span>
                  <span className="block text-[11.5px]" style={{ color: "#94836b" }}>$10,8M / m²</span>
                </span>
                <span className="mb-[16px] shrink-0 text-[26px] leading-none" style={{ color: "#a57a4e" }}>→</span>
                <span className="text-right">
                  <span className="block text-[10.6px] font-semibold uppercase tracking-[0.95px]" style={{ color: "#94836b" }}>Valor de mercado</span>
                  <span className="mt-[3px] block text-[clamp(1.5rem,7vw,2.1rem)] font-semibold leading-[1.05]" style={{ color: OLIVE }}>$3.776M</span>
                  <span className="block text-[11.5px]" style={{ color: "#94836b" }}>$11,8M / m²</span>
                </span>
              </div>

              {/* Sin rótulos dentro: los cuatro números viven en la leyenda. */}
              <Barre className="mt-[18px] flex h-[44px] overflow-hidden rounded-[12px]" delay={0.12}>
                {STACK.map((s, i) => (
                  <span
                    key={s.from}
                    className="block h-full shrink-0"
                    style={{
                      width: `${s.w}%`,
                      backgroundImage: `linear-gradient(180deg, ${s.from} 0%, ${s.to} 100%)`,
                      borderRight: i === STACK.length - 1 ? undefined : "2px solid #faf5ea",
                    }}
                  />
                ))}
              </Barre>

              <div className="mt-[16px] grid grid-cols-2 gap-x-[14px] gap-y-[12px] border-t border-solid pt-[16px]" style={{ borderColor: HAIRLINE }}>
                {LEGEND.map((g) => (
                  <span key={g.v} className="flex items-center gap-[9px]">
                    <span className="block size-[12px] shrink-0 rounded-[4px]" style={{ backgroundColor: g.c }} />
                    <span className="min-w-0">
                      <span className="block truncate text-[11.5px]" style={{ color: MILL }}>{g.l}</span>
                      <Cifra v={g.v} className="block text-[17px] font-semibold leading-[1.25]" style={{ color: g.vc }} />
                    </span>
                  </span>
                ))}
              </div>

              <p className="m-0 mt-[16px] text-[14px] leading-[1.45]" style={{ color: MILL }}>
                Tu inversión llega a <span style={{ color: "#3d2c1e" }}>$3.450M</span>; el mercado remodelado paga <span style={{ color: "#3d2c1e" }}>$3.776M</span>. Ese <span style={{ color: VERD }}>+$326M (+9%)</span> es valor patrimonial que no pagas.
              </p>
            </Card>

            {/* Valor creado hoy */}
            <Card className="mt-[12px]" delay={0.06} style={{ backgroundColor: "#f6ecd9" }}>
              <span className="block text-[10.9px] font-semibold uppercase tracking-[1.3px]" style={{ color: VERD }}>Valor creado hoy</span>
              <Cifra v="+$326M" className="mt-[6px] block text-[clamp(2.6rem,13vw,3.6rem)] font-bold leading-[1]" style={{ color: "#4a5730" }} />
              <Cifra v="+9%" className="mt-[2px] block text-[clamp(1.2rem,5vw,1.7rem)] font-semibold" style={{ color: VERD }} />
              <p className="m-0 mt-[10px] text-[clamp(0.95rem,3.9vw,1.15rem)] font-light leading-[1.35]" style={{ color: "#4a5730" }}>
                Compras por debajo de lo que el mercado remodelado comparable ya paga en la microzona. Ese diferencial es tu margen patrimonial desde el día uno.
              </p>
              <span className="mt-[14px] inline-flex items-center gap-[8px] rounded-full px-[12px] py-[6px]" style={{ background: "rgba(255,255,255,0.55)" }}>
                <IcCheck13 className="shrink-0" style={{ color: VERD }} />
                <span className="text-[11.5px] font-semibold" style={{ color: VERD }}>~8% por debajo de la media remodelada</span>
              </span>
            </Card>

            {/* Tres cifras que enganchan y el enlace al análisis completo */}
            <div className="mt-[12px] grid grid-cols-1 gap-[10px] sm:grid-cols-3">
              {MIRADA.map((k, i) => (
                <In
                  key={k.t}
                  delay={0.05 * i}
                  className="rounded-[14px] border border-solid px-[18px] py-[16px]"
                  style={{
                    background: i === 0 ? "linear-gradient(154.392deg, rgb(95,107,62) 0%, rgb(71,83,31) 100%)" : "rgba(247,241,229,0.06)",
                    borderColor: i === 0 ? "transparent" : "rgba(247,241,229,0.12)",
                  }}
                >
                  <span className="block text-[10.9px] font-semibold uppercase tracking-[0.65px]" style={{ color: "rgba(247,241,229,0.65)" }}>{k.t}</span>
                  <span className="mt-[4px] block text-[clamp(1.6rem,7vw,2rem)] font-semibold leading-[1.05]" style={{ color: "#e7dbc2" }}>
                    <Cifra v={k.v} />
                    {k.cop && <span className="ml-[6px] text-[11.5px] font-normal" style={{ color: "rgba(247,241,229,0.65)" }}>COP</span>}
                  </span>
                </In>
              ))}
            </div>

            <In delay={0.16}>
              <a
                href="/predios/ficha/finanzas"
                className="ix-press mt-[14px] flex h-[52px] w-full items-center justify-center gap-[9px] rounded-[12px] text-[16px] font-semibold"
                style={{ backgroundColor: "#e2cdae", color: "#3d2c1e" }}
              >
                Ver análisis completo
                <IcArrowRight className="shrink-0" />
              </a>
            </In>
          </div>
        </Band>

        {/* ══════════ EL POTENCIAL DE TRANSFORMACIÓN ══════════ */}
        <Band tone="cream" corner="br" className="pb-[40px] pt-[42px]">
          <div className={WRAP}>
            <In>
              <H2>El potencial de transformación</H2>
              <Sub>Espacios con gran capacidad de cambio. La propuesta arquitectónica se desarrolla durante el proceso de negociación.</Sub>
            </In>

            <div className="mt-[22px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
              {TCARDS.map((c, i) => (
                <In key={c.t} delay={0.05 * i}>
                  <FotoPendiente caption={c.t} ratio="5 / 4" />
                  <h3 className="m-0 mt-[10px] text-[17px] font-semibold" style={{ color: "#3d2c1e" }}>{c.t}</h3>
                  <p className="m-0 mt-[4px] text-[14.5px] font-light leading-[1.45]" style={{ color: MILL }}>{c.d.join(" ")}</p>
                </In>
              ))}
            </div>

            <In delay={0.1}>
              <a href="#galeria" className="ix-nav mt-[20px] inline-block text-[14px] font-semibold" style={{ color: "#a57a4e" }}>Ver más fotos →</a>
            </In>
          </div>
        </Band>

        {/* ══════════ NUESTRO PROCESO ══════════ */}
        <Band tone="brown" corner="bl" className="pb-[42px] pt-[42px]">
          <div className={WRAP}>
            <In>
              <H2 dark>Nuestro proceso</H2>
              <Sub dark>De la oportunidad a un activo transformado.</Sub>
            </In>

            <div className="mt-[22px] grid grid-cols-1 gap-[12px] sm:grid-cols-2">
              {PASOS.map((p, i) => (
                <In key={p.n} delay={0.05 * i} className="rounded-[14px] border border-solid p-[18px]" style={{ backgroundColor: CREAM, borderColor: HAIRLINE }}>
                  <span className="flex items-center gap-[12px]">
                    <span className="text-[26px] font-bold leading-none" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", color: "#a57a4e" }}>{p.n}</span>
                    <span className="flex size-[40px] items-center justify-center rounded-full border border-solid" style={{ borderColor: "rgba(60,45,30,0.13)", color: VERD }}>
                      <p.Ic />
                    </span>
                  </span>
                  <h3 className="m-0 mt-[12px] text-[19px] font-semibold" style={{ color: BROWN }}>{p.t}</h3>
                  <p className="m-0 mt-[4px] text-[15px] leading-[1.45]" style={{ color: BROWN }}>{p.d.join(" ")}</p>
                </In>
              ))}
            </div>

            <In delay={0.1}>
              <a href="/modelo" className="ix-nav mt-[20px] inline-block text-[15px] font-semibold" style={{ color: "#a57a4e" }}>Conoce cómo funciona →</a>
            </In>
          </div>
        </Band>

        {/* ══════════ UBICACIÓN Y ENTORNO + CIERRE ══════════ */}
        <Band tone="cream" className="pb-[46px] pt-[42px]">
          <div className={WRAP}>
            <In className="overflow-hidden rounded-[16px] border border-solid p-[20px]" style={{ backgroundColor: "#fbf8f1", borderColor: HAIRLINE }}>
              <h2 className="m-0 text-[clamp(1.4rem,5.6vw,1.9rem)] font-semibold tracking-[-0.01em]" style={{ color: "#3d2c1e" }}>Ubicación y entorno</h2>
              <p className="m-0 mt-[6px] text-[15px] font-light" style={{ color: MILL }}>Conectividad, exclusividad y alta demanda.</p>

              <img src="/figma/ficha-mapa.webp" alt="Mapa de La Cabrera, Bogotá" loading="lazy" decoding="async" className="mt-[16px] block w-full max-w-none rounded-[12px] object-cover" style={{ aspectRatio: "329 / 230" }} />

              <ul className="m-0 mt-[10px] list-none p-0">
                {POIS.map(([name, min], i) => (
                  <li key={name} className="flex items-center justify-between gap-[12px] py-[11px]" style={{ borderBottom: i < POIS.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}>
                    <span className="flex items-center gap-[9px]">
                      <IcPin className="shrink-0" style={{ color: "#a57a4e" }} />
                      <span className="text-[14px]" style={{ color: MILL }}>{name}</span>
                    </span>
                    <span className="text-[14px] font-semibold" style={{ color: "#2a241c" }}>{min}</span>
                  </li>
                ))}
              </ul>
            </In>

            <In delay={0.08} className="mt-[12px] overflow-hidden rounded-[16px] p-[22px]" style={{ backgroundColor: BROWN }}>
              <h2 className="m-0 text-[clamp(1.4rem,5.6vw,1.9rem)] font-semibold leading-[1.1] tracking-[-0.01em]" style={{ color: "#efe6d5" }}>Las buenas oportunidades no esperan</h2>
              <p className="m-0 mt-[10px] text-[14px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.8)" }}>
                Este inmueble está disponible hoy, pero puede entrar en negociación con otro comprador en cualquier momento.
              </p>
              <a href="/solicitud-acceso" className="ix-press mt-[18px] flex h-[52px] w-full max-w-[340px] items-center justify-center gap-[9px] rounded-[10px] text-[15px] font-semibold text-white" style={{ backgroundColor: "#a57a4e" }}>
                Quiero conocer esta oportunidad
                <IcArrowRight className="shrink-0" />
              </a>
              <span className="mt-[16px] flex items-center gap-[9px]">
                <IcCalendar className="shrink-0" style={{ color: "#c9a877" }} />
                <span className="text-[13.5px]" style={{ color: "rgba(247,241,229,0.85)" }}>Agenda una llamada con ZEQUARA</span>
              </span>
            </In>
          </div>
        </Band>
      </FichaShellCompact>
    </MotionConfig>
  );
}
