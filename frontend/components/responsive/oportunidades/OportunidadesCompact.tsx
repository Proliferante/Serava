"use client";

import { MotionConfig } from "framer-motion";
import MobileNav from "@/components/responsive/MobileNav";
import MobileFooter from "@/components/responsive/MobileFooter";
import BeforeAfterTouch from "@/components/responsive/BeforeAfterTouch";
import { BROWN, Card, CheckList, CTA, Eyebrow, H2, In, LASER, Note, P, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   OPORTUNIDADES — vista fluida para móvil y tablet (por debajo de 1280).

   El lienzo son 1920 × 5701. Lo que más cambia aquí es el comparador
   antes/después: en escritorio es un arrastre con `mousemove`, que en táctil
   no existe. Se sustituye por <BeforeAfterTouch>, y en vez de un solo
   proyecto se muestran los cuatro pares que hay, que en columna caben.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

/** Los mismos cuatro pares del lienzo, con sus rótulos literales. */
const PROYECTOS = [
  { slug: "1502-sala", ciudad: "Bogotá", predio: "Cabrera 1502" },
  { slug: "1502-bano", ciudad: "Bogotá", predio: "Cabrera 1601" },
  { slug: "1601-cocina", ciudad: "Bogotá", predio: "Cabrera 1502" },
  { slug: "1602-sala", ciudad: "Bogotá", predio: "Cabrera 1602" },
];

/** Las cuatro columnas de la ficha, con el texto del lienzo. */
const FICHA = [
  { t: "Valor de entrada", d: "Precio, área y lectura del valor por metro cuadrado." },
  { t: "Transformación propuesta", d: "Alcance de diseño, remodelación e inversión estimada." },
  { t: "Potencial de renta", d: "Canon proyectado y perfil de demanda de la microzona." },
  { t: "Proyección de valor", d: "Valorización estimada y alternativas de permanencia o salida." },
];

/** Las cifras de la ficha de ejemplo, tal cual salen en escritorio. */
const CIFRAS = [
  { t: "Valor de entrada", v: "$7,2M / m²" },
  { t: "Área", v: "320 m²" },
  { t: "Inversión estimada", v: "$2,5M / m²" },
  { t: "Canon proyectado", v: "$17M / mes" },
  { t: "Valorización estimada", v: "~22%" },
];

const ACOMPANAMIENTO = [
  "Ficha completa de la oportunidad",
  "Lectura comercial y técnica",
  "Propuesta de diseño y remodelación",
  "Presupuesto y cronograma",
  "Proyección de renta y valorización",
  "Seguimiento digital de la ejecución",
  "Gestión posterior del activo",
];

export default function OportunidadesCompact() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-cream">
        <MobileNav />

        {/* ══════════ 1 · HERO ══════════ */}
        <section className="relative overflow-hidden bg-brown-dark">
          <img
            src={`${A}/opp-hero.webp`} alt="" loading="eager" decoding="async"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-45"
          />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(73,33,0,0.7) 0%, rgba(73,33,0,0.93) 100%)" }} />
          <div className={`${WRAP} relative pb-[64px] pt-[52px]`}>
            <In y={16}><Eyebrow>Oportunidades</Eyebrow></In>
            <In y={20} delay={0.08}>
              <h1 className="mt-[14px] text-[clamp(2rem,8.2vw,3.1rem)] font-light leading-[1.1] tracking-[-0.02em] text-cream-93">
                Propiedades con potencial real de <span className="font-semibold">transformación.</span>
              </h1>
              <P>Zequara selecciona activos en zonas consolidadas, con condiciones para aumentar su valor mediante diseño, remodelación y mejor operación.</P>
            </In>
            <In delay={0.16}>
              <CTA href="/solicitud-acceso" tone="olive">Solicitar acceso</CTA>
              <Note>Las oportunidades activas están disponibles únicamente para inversionistas aprobados.</Note>
            </In>
          </div>
        </section>

        {/* ══════════ 2 · PROYECTOS DE REFERENCIA ══════════ */}
        <section className={`${WRAP} py-[62px]`}>
          <In><Eyebrow tone="brown">El tipo de activos que buscamos</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Espacios donde el valor <span className="font-semibold">puede construirse.</span></H2>
            <P dark>Conoce transformaciones realizadas por nuestro equipo y el tipo de propiedades que orientan la selección Zequara. Buscamos inmuebles bien ubicados, con atributos difíciles de replicar y capacidad de mejorar su posicionamiento a través de una intervención estratégica.</P>
          </In>

          {/* La ficha del proyecto destacado, con las mismas dos filas de datos
              que el lienzo pone al pie del comparador grande. */}
          <In delay={0.12} className="mt-[24px] rounded-[16px] border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(255,255,255,0.45)] p-[18px]">
            <p className="m-0 text-[17px] font-semibold" style={{ color: BROWN }}>Cabrera 1502 · Bogotá</p>
            <p className="m-0 mt-[3px] text-[13.5px] font-light" style={{ color: "#5b4332" }}>Remodelación integral ultra lujo</p>
            <div className="mt-[14px] grid grid-cols-2 gap-[12px]">
              <div>
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[1px]" style={{ color: "#a57a4e" }}>Ciudad / Zona</p>
                <p className="m-0 mt-[3px] text-[14px] font-medium" style={{ color: BROWN }}>Bogotá · Cabrera 1502</p>
              </div>
              <div>
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[1px]" style={{ color: "#a57a4e" }}>Intervención</p>
                <p className="m-0 mt-[3px] text-[14px] font-medium" style={{ color: BROWN }}>Integral</p>
              </div>
            </div>
          </In>

          <div className="mt-[22px] flex flex-col gap-[22px]">
            {PROYECTOS.map((p, i) => (
              <In key={`${p.slug}-${i}`} delay={0.06 * i}>
                <BeforeAfterTouch slug={p.slug} alt={`${p.predio} · ${p.ciudad}`} />
                <div className="mt-[10px] flex items-baseline justify-between gap-[12px]">
                  <p className="m-0 text-[12px] font-semibold uppercase tracking-[1.4px]" style={{ color: "#a57a4e" }}>Antes / Después</p>
                  <p className="m-0 text-[13.5px] font-medium" style={{ color: BROWN }}>{p.ciudad} · {p.predio}</p>
                </div>
              </In>
            ))}
          </div>

          <In delay={0.24}>
            <p className="mt-[18px] text-[13.5px] font-light leading-[1.5]" style={{ color: "#5b4332" }}>
              Arrastra el círculo (o toca la imagen) para ver el antes y el después de cada proyecto.
            </p>
          </In>
          <Note dark>Los proyectos mostrados son casos de referencia. El portafolio activo es confidencial.</Note>
        </section>

        {/* ══════════ 3 · QUÉ MUESTRA CADA OPORTUNIDAD ══════════ */}
        <section className="relative overflow-hidden rounded-tl-[64px] bg-brown-dark py-[62px]">
          {/* La trama topográfica del lienzo, al mismo 5 %. */}
          <img src={`${A}/opp-topo.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover" style={{ opacity: 0.05 }} />
          <div className={`${WRAP} relative`}>
            <In><Eyebrow>Información para decidir</Eyebrow></In>
            <In delay={0.06}>
              <H2>Cada oportunidad muestra dónde está el potencial y <span className="font-semibold">cómo puede convertirse en valor.</span></H2>
              <P>Los inversionistas aprobados reciben una ficha que conecta los datos del activo con la propuesta de transformación desarrollada por Zequara. La información permite entender el valor de entrada, la inversión requerida, el potencial de renta y la proyección de valorización.</P>
            </In>

            {/* Las cifras que en el lienzo van sobre la maqueta de la ficha. */}
            <In delay={0.12} className="mt-[24px] overflow-hidden rounded-[16px] border border-solid" style={{ borderColor: "rgba(201,168,119,0.28)", background: "rgba(247,241,229,0.05)" }}>
              {CIFRAS.map((c) => (
                <div key={c.t} className="flex items-baseline justify-between gap-[12px] border-b border-solid px-[16px] py-[13px] last:border-b-0" style={{ borderColor: "rgba(247,241,229,0.1)" }}>
                  <span className="text-[13.5px] font-light text-[rgba(247,241,229,0.72)]">{c.t}</span>
                  <span className="whitespace-nowrap text-[15px] font-semibold text-tan-63">{c.v}</span>
                </div>
              ))}
            </In>

            <div className="mt-[26px] flex flex-col gap-[2px]">
              {FICHA.map((c, i) => (
                <In key={c.t} delay={0.06 * i} className="border-t border-solid border-[rgba(247,241,229,0.14)] py-[18px]">
                  <h3 className="m-0 text-[17px] font-semibold text-cream-93">{c.t}</h3>
                  <p className="m-0 mt-[6px] text-[15px] font-light leading-[1.55] text-[rgba(247,241,229,0.72)]">{c.d}</p>
                </In>
              ))}
            </div>

            <In delay={0.22} className="mt-[24px] overflow-hidden rounded-[18px] border border-solid" style={{ borderColor: "rgba(201,168,119,0.28)" }}>
              <img src={`${A}/opp-ficha.webp`} alt="Ficha de una oportunidad en la plataforma Zequara" loading="lazy" decoding="async" className="block w-full" />
            </In>
            <In delay={0.26}>
              <Note>La información detallada se habilita dentro de la plataforma después de la aprobación de acceso.</Note>
            </In>
          </div>
        </section>

        {/* ══════════ 4 · EXPERIENCIA DEL INVERSIONISTA ══════════ */}
        <section className="rounded-tr-[64px] bg-cream">
          <div className={`${WRAP} py-[62px]`}>
          <In><Eyebrow tone="brown">Una operación acompañada</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Información para decidir. <span className="font-semibold">Un equipo para ejecutar.</span></H2>
            <P dark>Zequara acompaña cada operación desde la selección del activo hasta su remodelación y gestión posterior. El inversionista <span className="font-semibold" style={{ color: BROWN }}>conserva la propiedad</span>, aprueba las decisiones clave y consulta el avance desde un solo lugar.</P>
          </In>
          <CheckList dark items={ACOMPANAMIENTO} />
          <In delay={0.2}>
            <p className="mt-[18px] text-[13.5px] font-medium" style={{ color: "#5f6b3e" }}>Un solo equipo conecta análisis, diseño, obra y operación.</p>
          </In>
          </div>
        </section>

        {/* ══════════ 5 · ACCESO ══════════ */}
        <section className="relative overflow-hidden rounded-tl-[64px] py-[68px]" style={{ background: "rgba(73,33,0,0.96)" }}>
          <img
            src={`${A}/opp-dusk.webp`} alt="" loading="lazy" decoding="async"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-25"
          />
          {/* El aro del diseño no cabe a este ancho; queda su filete superior
              como remate, que es lo que aporta en pequeño. */}
          <div className={`${WRAP} relative text-center`}>
            <In className="flex justify-center">
              <span className="block h-px w-[34px]" style={{ background: LASER, opacity: 0.8 }} />
            </In>
            <In delay={0.06}>
              <p className="mt-[14px] text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: LASER }}>Portafolio privado</p>
              <h2 className="mt-[12px] text-[clamp(1.8rem,7.4vw,2.6rem)] font-light leading-[1.12] tracking-[-0.02em] text-cream-93">
                Accede al portafolio <span className="font-semibold">privado de Zequara.</span>
              </h2>
              <p className="mx-auto mt-[14px] max-w-[440px] text-[clamp(0.95rem,3.6vw,1.05rem)] font-light leading-[1.6] text-[rgba(247,241,229,0.84)]">
                Solicita tu evaluación para conocer oportunidades seleccionadas según tu capital, perfil y estrategia de inversión.
              </p>
            </In>
            <In delay={0.14} className="flex flex-col items-center">
              <CTA href="/solicitud-acceso" tone="linen">Solicitar acceso</CTA>
              <p className="mt-[18px] text-[13px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>
                Portafolio confidencial. Acceso sujeto a evaluación y disponibilidad.
              </p>
            </In>
          </div>
        </section>

        <MobileFooter />
      </div>
    </MotionConfig>
  );
}
