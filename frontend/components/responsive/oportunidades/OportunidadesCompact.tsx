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

const PROYECTOS = [
  { slug: "1502-sala", titulo: "Cabrera 1502 · Sala", zona: "La Cabrera · Bogotá" },
  { slug: "1502-bano", titulo: "Cabrera 1502 · Baño", zona: "La Cabrera · Bogotá" },
  { slug: "1601-cocina", titulo: "Cabrera 1601 · Cocina", zona: "La Cabrera · Bogotá" },
  { slug: "1602-sala", titulo: "Cabrera 1602 · Sala", zona: "La Cabrera · Bogotá" },
];

const FICHA = [
  { t: "Datos del activo", d: "Ubicación, área, valor de entrada y características principales." },
  { t: "Propuesta de transformación", d: "Alcance preliminar de diseño, remodelación e inversión." },
  { t: "Lectura de la oportunidad", d: "Potencial de renta, valorización y alternativas de salida." },
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
              <CTA href="/solicitud-acceso">Solicitar acceso</CTA>
              <Note>Las oportunidades activas están disponibles únicamente para inversionistas aprobados.</Note>
            </In>
          </div>
        </section>

        {/* ══════════ 2 · PROYECTOS DE REFERENCIA ══════════ */}
        <section className={`${WRAP} py-[62px]`}>
          <In><Eyebrow tone="brown">El tipo de activos que buscamos</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Espacios donde el valor <span className="font-semibold">puede construirse.</span></H2>
            <P dark>Conoce transformaciones realizadas por nuestro equipo y el tipo de propiedades que orientan la selección Zequara: inmuebles bien ubicados, con atributos difíciles de replicar y capacidad de mejorar su posicionamiento.</P>
          </In>

          <div className="mt-[26px] flex flex-col gap-[22px]">
            {PROYECTOS.map((p, i) => (
              <In key={p.slug} delay={0.06 * i}>
                <BeforeAfterTouch slug={p.slug} alt={p.titulo} />
                <div className="mt-[10px] flex items-baseline justify-between gap-[12px]">
                  <p className="m-0 text-[15px] font-semibold" style={{ color: BROWN }}>{p.titulo}</p>
                  <p className="m-0 text-[12px] font-light uppercase tracking-[0.8px]" style={{ color: "rgba(91,67,50,0.75)" }}>{p.zona}</p>
                </div>
              </In>
            ))}
          </div>

          <Note dark>Los proyectos mostrados son casos de referencia. El portafolio activo es confidencial.</Note>
        </section>

        {/* ══════════ 3 · QUÉ MUESTRA CADA OPORTUNIDAD ══════════ */}
        <section className="rounded-tr-[64px] bg-brown-dark py-[62px]">
          <div className={WRAP}>
            <In><Eyebrow>Información para decidir</Eyebrow></In>
            <In delay={0.06}>
              <H2>Cada oportunidad muestra <span className="font-semibold">lo mismo.</span></H2>
              <P>Los inversionistas aprobados reciben una ficha que conecta los datos del activo con la propuesta de transformación desarrollada por Zequara: valor de entrada, inversión requerida, potencial de renta y proyección de valorización.</P>
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
        <section className={`${WRAP} py-[62px]`}>
          <In><Eyebrow tone="brown">Una operación acompañada</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Información para decidir. <span className="font-semibold">Un equipo para ejecutar.</span></H2>
            <P dark>Zequara acompaña cada operación desde la selección del activo hasta su remodelación y gestión posterior. El inversionista <span className="font-semibold" style={{ color: BROWN }}>conserva la propiedad</span>, aprueba las decisiones clave y consulta el avance desde un solo lugar.</P>
          </In>
          <CheckList dark items={ACOMPANAMIENTO} />
          <In delay={0.2}>
            <p className="mt-[18px] text-[13.5px] font-medium" style={{ color: "#5f6b3e" }}>Un solo equipo conecta análisis, diseño, obra y operación.</p>
          </In>
        </section>

        {/* ══════════ 5 · ACCESO ══════════ */}
        <section className="relative overflow-hidden rounded-tr-[64px] py-[68px]" style={{ background: "rgba(73,33,0,0.96)" }}>
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
              <CTA href="/solicitud-acceso">Solicitar acceso</CTA>
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
