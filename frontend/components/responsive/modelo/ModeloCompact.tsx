"use client";

import { MotionConfig } from "framer-motion";
import CountUp from "@/components/motion/CountUp";
import MobileNav from "@/components/responsive/MobileNav";
import MobileFooter from "@/components/responsive/MobileFooter";
import { BROWN, Card, CheckList, CTA, Eyebrow, H2, In, Note, P, Step, Timeline, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   CÓMO OPERAMOS — vista fluida para móvil y tablet (por debajo de 1280).

   El lienzo de escritorio son 1920 × 9717 con doce secciones a pantalla
   completa, siete de ellas un paso del método. Aquí los siete pasos se
   recogen en una sola línea de tiempo: en columna, cada uno ocupando una
   pantalla, el usuario perdía el hilo de que son partes de un mismo proceso.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

const CAPACIDADES = [
  { t: "Datos verificables", d: "Cifras de mercado y de zona que se pueden contrastar, no impresiones." },
  { t: "Criterio técnico", d: "Veinte años evaluando qué se puede intervenir y a qué costo real." },
  { t: "Experiencia operativa", d: "Obra, arriendo y administración ejecutados por el mismo equipo." },
];

const PASOS = [
  {
    n: "01", q: "¿Cómo identificamos dónde operar?", t: "Encontramos mercados donde el valor puede crecer.",
    p: ["Seleccionamos activos con condiciones reales para generar renta, aumentar su valor y conservar alternativas de salida en el tiempo."],
    nota: "Solo las zonas que cumplen los criterios del modelo avanzan a selección de inmuebles.",
  },
  {
    n: "02", q: "¿Cómo validamos cada oportunidad?", t: "Dos filtros antes de recomendar una compra.",
    p: [
      "Primero analizamos la microzona, el precio por metro cuadrado, la inversión estimada y el potencial de valorización.",
      "Cada activo debe cumplir los criterios comerciales y técnicos de Zequara para avanzar.",
    ],
    nota: "De cada 100 oportunidades evaluadas, menos de 3 llegan a recomendación de compra.",
  },
  {
    n: "03", q: "¿Qué establece la relación desde el comienzo?", t: "Un acuerdo claro antes de acceder al portafolio.",
    p: [
      "El preacuerdo protege la confidencialidad de las oportunidades y define cómo se ejecuta el modelo Zequara.",
      "Cuando adquieres un inmueble presentado en la plataforma, la remodelación se desarrolla con nuestro equipo, bajo un alcance, presupuesto y contrato previamente aprobados.",
    ],
    nota: "La administración posterior del activo permanece como una decisión del inversionista.",
  },
  {
    n: "04", q: "¿Cómo cobra Zequara?", t: "Honorarios vinculados a la ejecución sobre el activo.",
    p: ["Conoces los honorarios y las condiciones antes de aprobar cada alcance, contrato y estructura."],
    nota: "Acceso sin membresía. Compra sin comisión para el inversionista.",
  },
  {
    n: "05", q: "¿Cómo protegemos el presupuesto?", t: "Alcance, costos y cronograma definidos antes de comenzar.",
    p: [
      "Los hallazgos técnicos identificados durante la evaluación se incorporan al presupuesto inicial.",
      "Las modificaciones posteriores se documentan, cotizan y aprueban antes de ejecutarse.",
    ],
    nota: "Durante la obra puedes consultar el avance, el cronograma, la documentación y las aprobaciones desde tu plataforma.",
  },
  {
    n: "06", q: "¿Cómo se diseña un inmueble para atraer demanda?", t: "El perfil del arrendatario se define primero.",
    p: [
      "Antes de remodelar, identificamos quién debe querer vivir en el inmueble y qué características valora.",
      "La distribución, los materiales, el mobiliario y el canon se proyectan según la demanda de cada microzona.",
    ],
    nota: "Cada oportunidad incluye una hipótesis de demanda, canon y ocupación.",
  },
  {
    n: "07", q: "¿Cómo identificamos el momento de vender?", t: "Los datos orientan. Tú decides.",
    p: [
      "Zequara monitorea el comportamiento de la microzona, la oferta disponible, la velocidad de venta y los nuevos proyectos en construcción.",
      "Cuando los indicadores muestran una oportunidad de salida, presentamos un escenario con valor estimado de mercado.",
    ],
    nota: "La decisión de vender es siempre del inversionista.",
  },
];

const CAPACIDAD = [
  { value: 20, prefix: "+", suffix: "", label: "Proyectos estructurados" },
  { value: 7000, prefix: "+", suffix: " m²", label: "Intervenidos" },
  { value: 2, prefix: "", suffix: " países", label: "Experiencia operativa" },
];

export default function ModeloCompact() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-cream">
        <MobileNav />

        {/* ══════════ 1 · HERO ══════════ */}
        <section className="relative overflow-hidden bg-brown-dark">
          <img
            src={`${A}/como-hero.webp`} alt="" loading="eager" decoding="async"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(73,33,0,0.72) 0%, rgba(73,33,0,0.92) 100%)" }} />
          <div className={`${WRAP} relative pb-[64px] pt-[52px]`}>
            <In y={16}><Eyebrow>Nuestro método</Eyebrow></In>
            <In y={20} delay={0.08}>
              <h1 className="mt-[14px] text-[clamp(2rem,8.2vw,3.1rem)] font-light leading-[1.1] tracking-[-0.02em] text-cream-93">
                Una inversión bien <span className="font-semibold">estructurada.</span>
              </h1>
              <P>Zequara integra selección, remodelación y operación en un sistema diseñado para aumentar el valor del activo y simplificar la experiencia del inversionista.</P>
            </In>
            <In delay={0.16}><CTA href="/solicitud-acceso">Solicitar acceso</CTA></In>
          </div>
        </section>

        {/* ══════════ 2 · LAS TRES CAPACIDADES ══════════ */}
        <section className={`${WRAP} py-[62px]`}>
          <In><Eyebrow tone="brown">Un sistema construido durante 20 años</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Cada decisión combina <span className="font-semibold">tres capacidades.</span></H2>
          </In>
          <div className="mt-[26px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
            {CAPACIDADES.map((c, i) => <Card key={c.t} title={c.t} delay={0.06 * i}>{c.d}</Card>)}
          </div>
        </section>

        {/* ══════════ 3–9 · LOS SIETE PASOS ══════════ */}
        <section className="rounded-tr-[64px] bg-brown-dark py-[64px]">
          <div className={WRAP}>
            <In><Eyebrow>El método, paso a paso</Eyebrow></In>
            <In delay={0.06}><H2>De la zona a la <span className="font-semibold">salida.</span></H2></In>
            <Timeline>
              {PASOS.map((p, i) => (
                <Step key={p.n} n={p.n} title={p.t} delay={0.06 + i * 0.05}>
                  <p className="m-0 text-[12.5px] font-semibold uppercase leading-[1.4] tracking-[1.1px] text-tan-63">{p.q}</p>
                  {p.p.map((t) => <p key={t} className="m-0 mt-[8px]">{t}</p>)}
                  <p className="m-0 mt-[10px] text-[13px] leading-[1.5] text-[rgba(247,241,229,0.5)]">{p.nota}</p>
                </Step>
              ))}
            </Timeline>
          </div>
        </section>

        {/* ══════════ 10 · CAPACIDAD OPERATIVA ══════════ */}
        <section className="relative overflow-hidden bg-cream py-[62px]">
          <img
            src={`${A}/como-ciudad.webp`} alt="" loading="lazy" decoding="async"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full object-cover opacity-15"
          />
          <div className={`${WRAP} relative`}>
            <In><Eyebrow tone="brown">Capacidad operativa</Eyebrow></In>
            <In delay={0.06}><H2 dark>Veinte años de <span className="font-semibold">ejecución verificable.</span></H2></In>
            <div className="mt-[28px] grid grid-cols-1 gap-[2px] sm:grid-cols-3 sm:gap-[18px]">
              {CAPACIDAD.map((s, i) => (
                <In key={s.label} delay={0.06 * i} y={18} className="border-t border-solid border-[rgba(165,122,78,0.3)] py-[16px] sm:border-t-0 sm:py-0">
                  <p className="m-0 whitespace-nowrap text-[clamp(2rem,9vw,2.8rem)] font-extrabold leading-[1] sm:text-[clamp(1.4rem,3.4vw,2rem)]" style={{ color: BROWN }}>
                    <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </p>
                  <p className="m-0 mt-[4px] text-[15px] font-medium leading-[1.3] sm:text-[13.5px]" style={{ color: "rgba(91,67,50,0.9)" }}>{s.label}</p>
                </In>
              ))}
            </div>
            <In delay={0.2}>
              <P dark>El equipo reúne experiencia en diseño, estructuración y ejecución de proyectos residenciales, comerciales, institucionales e industriales. Ese recorrido se traduce en procesos, presupuestos y controles aplicados a cada nueva operación.</P>
              <Note dark>Track record disponible durante la entrevista de acceso.</Note>
            </In>
          </div>
        </section>

        {/* ══════════ 11 · RESPALDO HUMANO ══════════ */}
        <section className="bg-brown-dark py-[62px]">
          <div className={WRAP}>
            <In><Eyebrow>Respaldo humano</Eyebrow></In>
            <In delay={0.06}>
              <p className="mt-[12px] text-[14px] font-light" style={{ color: "#9aa66f" }}>El criterio detrás de cada inmueble.</p>
              <H2>Christian Mejía, <span className="font-semibold">director de diseño y operación técnica.</span></H2>
            </In>
            <In delay={0.12} className="mt-[24px] overflow-hidden rounded-[18px]">
              <img src={`${A}/como-christian-full.webp`} alt="Christian Mejía, director de diseño y operación técnica" loading="lazy" decoding="async" className="block w-full" />
            </In>
            <In delay={0.16}>
              <P>Christian cuenta con veinte años de experiencia ejecutando proyectos de alta exigencia técnica: plantas industriales, laboratorios, espacios comerciales y reconversiones inmobiliarias.</P>
              <P>Ese mismo rigor se aplica para evaluar cada inmueble, definir su intervención y supervisar la ejecución de la obra.</P>
              <blockquote className="m-0 mt-[20px] border-l-2 border-solid pl-[16px]" style={{ borderColor: "#7f8b57" }}>
                <p className="m-0 text-[clamp(1.15rem,5vw,1.5rem)] font-light italic leading-[1.3] text-cream-93">
                  “Una inversión inmobiliaria se hace bien o no se hace.”
                </p>
              </blockquote>
              <Note>Christian revisa cada operación que ingresa al portafolio Zequara.</Note>
            </In>
          </div>
        </section>

        {/* ══════════ 12 · CIERRE ══════════ */}
        <section className={`${WRAP} py-[62px]`}>
          <In><Eyebrow tone="brown">Tu capital trabaja</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Zequara se ocupa de la <span className="font-semibold">operación.</span></H2>
            <P dark>Tú mantienes la propiedad y apruebas las decisiones clave. Zequara conecta selección, remodelación y operación mediante un solo equipo, un proceso trazable y un único interlocutor.</P>
          </In>
          <In delay={0.14}>
            <CheckList dark items={["Un solo equipo de principio a fin", "Un proceso trazable desde tu plataforma", "Un único interlocutor"]} />
            <CTA href="/solicitud-acceso">Solicitar acceso</CTA>
            <Note dark>Portafolio reservado para un grupo limitado de inversionistas. Acceso sujeto a evaluación.</Note>
          </In>
        </section>

        <MobileFooter />
      </div>
    </MotionConfig>
  );
}
