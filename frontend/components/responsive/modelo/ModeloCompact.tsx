"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import CountUp from "@/components/motion/CountUp";
import MobileNav from "@/components/responsive/MobileNav";
import MobileFooter from "@/components/responsive/MobileFooter";
import { EASE, In, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   CÓMO OPERAMOS — vista fluida para móvil y tablet (por debajo de 1280).

   Reescrita para que lleve EXACTAMENTE el mismo contenido que el lienzo de
   1920 × 9717: las doce secciones, con su texto literal y su fondo. La versión
   anterior resumía los siete pasos en una línea de tiempo y perdía 43 frases
   por el camino.

   La alternancia marrón / crema de las secciones se conserva, porque es lo que
   marca el ritmo del método: cada paso cambia de fondo respecto al anterior.
   Los colores de antetítulo, pregunta, titular y cuerpo son los del lienzo
   según el fondo sea oscuro o claro.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

const CREAM = "#e2cdae";
const LINEN = "#f7f1e5";
const LINEN80 = "rgba(247,241,229,0.8)";
const BROWN = "#492100";
const BROWN5 = "#3d2104";
const DRIFT = "#a57a4e";
const BISTRE = "#3d2c1e";
const MILLBROOK = "#5b4332";
const LASER = "#c9a877";
const GREEN_SMOKE = "#9aa66f";
const VERDIGRIS = "#5f6b3e";

/* ── Piezas de sección, con los dos juegos de color del lienzo ───────────── */

function Sec({ dark, bg, children, className }: { dark?: boolean; bg: string; children: ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden ${className ?? ""}`} style={{ background: bg }}>
      <div className={`${WRAP} relative py-[56px]`}>{children}</div>
    </section>
  );
}

/** Antetítulo del paso: laser sobre oscuro, driftwood sobre crema. */
function Paso({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="m-0 text-[11px] font-semibold uppercase leading-[1.5] tracking-[2.4px]" style={{ color: dark ? LASER : DRIFT }}>{children}</p>
  );
}

/** La pregunta que abre cada paso: green smoke sobre oscuro, verdigris sobre crema. */
function Pregunta({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="m-0 mt-[10px] text-[14.5px] font-medium leading-[1.4]" style={{ color: dark ? GREEN_SMOKE : VERDIGRIS }}>{children}</p>
  );
}

function H3({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <h2 className="mt-[10px] text-[clamp(1.5rem,6.2vw,2.1rem)] font-light leading-[1.16] tracking-[-0.02em]" style={{ color: dark ? CREAM : BROWN }}>{children}</h2>
  );
}

function P({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="mt-[13px] text-[clamp(0.93rem,3.5vw,1.02rem)] font-light leading-[1.6]" style={{ color: dark ? LINEN80 : MILLBROOK }}>{children}</p>
  );
}

/** Recuadro de remate de cada paso (los `Callout` del lienzo). */
function Callout({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <In delay={0.1} className="mt-[20px] flex items-start gap-[11px] rounded-[16px] border border-solid p-[16px]"
      style={dark
        ? { borderColor: "rgba(226,205,174,0.28)", background: "rgba(226,205,174,0.06)" }
        : { borderColor: "rgba(165,122,78,0.3)", background: "rgba(255,255,255,0.4)" }}>
      <span className="mt-[2px] flex size-[20px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(127,139,87,0.22)" }}>
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={GREEN_SMOKE} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
      </span>
      <span className="text-[13.5px] font-medium leading-[1.5]" style={{ color: dark ? LINEN : BISTRE }}>{children}</span>
    </In>
  );
}

function Foto({ src, alt }: { src: string; alt: string }) {
  return (
    <In delay={0.08} className="mt-[20px] overflow-hidden rounded-[18px]">
      <img src={`${A}/${src}`} alt={alt} loading="lazy" decoding="async" className="block h-[190px] w-full object-cover" />
    </In>
  );
}

/** Tarjeta de las tres capacidades / los tres servicios. */
function Card({ title, children, dark, delay = 0 }: { title: string; children: ReactNode; dark?: boolean; delay?: number }) {
  return (
    <In delay={delay} className="rounded-[16px] border border-solid p-[18px]"
      style={dark
        ? { borderColor: "rgba(226,205,174,0.22)", background: "rgba(73,33,0,0.06)" }
        : { borderColor: "rgba(165,122,78,0.28)", background: "rgba(255,255,255,0.45)" }}>
      <h3 className="m-0 text-[16.5px] font-semibold" style={{ color: BISTRE }}>{title}</h3>
      <p className="m-0 mt-[7px] text-[14px] font-light leading-[1.55]" style={{ color: MILLBROOK }}>{children}</p>
    </In>
  );
}

const ANTES_ITEMS = ["Materiales", "Mano de obra", "Cronograma", "Fechas de pago", "Proceso de aprobación de cambios"];

const INDICADORES = ["Microzona", "Oferta disponible", "Velocidad de venta", "Nuevos proyectos"];

const CAPACIDAD = [
  { value: 20, prefix: "+", suffix: "", label: "Proyectos estructurados" },
  { value: 7000, prefix: "+", suffix: " m²", label: "Intervenidos" },
  { value: 2, prefix: "", suffix: " países", label: "Experiencia operativa" },
];

export default function ModeloCompact() {
  return (
    <MotionConfig reducedMotion="user">
      <div style={{ background: CREAM }}>
        <MobileNav />

        {/* ══════════ 1 · HERO ══════════ */}
        <section className="relative overflow-hidden" style={{ background: BROWN }}>
          <img src={`${A}/como-hero.webp`} alt="" loading="eager" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover opacity-40" />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(73,33,0,0.72) 0%, rgba(73,33,0,0.92) 100%)" }} />
          <div className={`${WRAP} relative pb-[60px] pt-[52px]`}>
            <In y={16}><Paso dark>Cómo operamos</Paso></In>
            <In y={20} delay={0.08}>
              <h1 className="mt-[14px] text-[clamp(2rem,8.2vw,3.1rem)] font-light leading-[1.1] tracking-[-0.02em]" style={{ color: LINEN }}>
                Una inversión bien operada empieza con <span className="font-semibold">mejores decisiones.</span>
              </h1>
              <P dark>Zequara integra selección, remodelación y operación en un sistema diseñado para aumentar el valor del activo y simplificar la experiencia del inversionista.</P>
            </In>
          </div>
        </section>

        {/* ══════════ 2 · NUESTRO MÉTODO ══════════ */}
        <Sec bg={CREAM} className="rounded-tl-[64px]">
          <In><Paso>Nuestro método</Paso></In>
          <In delay={0.06}>
            <H3>Un sistema construido durante <span className="font-semibold">veinte años.</span></H3>
            <P>Cada decisión de Zequara combina tres capacidades:</P>
            <p className="mt-[10px] text-[15px] font-semibold" style={{ color: BISTRE }}>
              Datos verificables <span style={{ color: DRIFT }}>·</span> Criterio técnico <span style={{ color: DRIFT }}>·</span> Experiencia operativa
            </p>
          </In>
          <div className="mt-[22px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
            <Card title="Datos verificables" delay={0}>Modelos y métricas de zona que sustentan cada decisión, no intuiciones.</Card>
            <Card title="Criterio técnico" delay={0.12}>Arquitectura, distribución y estado real del inmueble evaluados por expertos.</Card>
            <Card title="Experiencia operativa" delay={0.24}>Veinte años ejecutando obra traducidos en procesos y controles.</Card>
          </div>
          <In delay={0.1}><P>Seleccionamos activos con condiciones reales para generar renta, aumentar su valor y conservar alternativas de salida en el tiempo.</P></In>
        </Sec>

        {/* ══════════ 3 · PASO 01 · SELECCIÓN DE LA ZONA ══════════ */}
        <Sec bg={BROWN} dark className="rounded-tr-[64px]">
          <In><Paso dark>Paso 01 · Selección de la zona</Paso></In>
          <In delay={0.05}>
            <Pregunta dark>¿Cómo identificamos dónde operar?</Pregunta>
            <H3 dark><span style={{ color: LINEN }}>Encontramos mercados donde </span>el valor todavía puede construirse.</H3>
          </In>
          <Foto src="como-zona.webp" alt="Selección de la zona" />
          <In delay={0.1}>
            <P dark><span className="font-semibold" style={{ color: LINEN }}>El Score Zequara</span> es un modelo especializado que identifica zonas consolidadas de alta demanda, oferta limitada y activos con potencial de transformación.</P>
            <P dark>Buscamos mercados donde el diseño, la remodelación y una mejor operación pueden ampliar la diferencia entre el valor de entrada y el valor que el mercado reconoce después de la intervención.</P>
          </In>
          <Callout dark>Solo las zonas que cumplen los criterios del modelo avanzan a selección de inmuebles.</Callout>
        </Sec>

        {/* ══════════ 4 · PASO 02 · SELECCIÓN DEL INMUEBLE ══════════ */}
        <Sec bg={CREAM} className="rounded-tl-[64px]">
          <In><Paso>Paso 02 · Selección del inmueble</Paso></In>
          <In delay={0.05}>
            <Pregunta>¿Cómo validamos cada oportunidad?</Pregunta>
            <H3>Dos filtros antes de recomendar una compra.</H3>
          </In>
          <Foto src="como-inmueble.webp" alt="Selección del inmueble" />
          <In delay={0.1}>
            <P>Primero analizamos la microzona, el precio por metro cuadrado, la inversión estimada y el potencial de valorización.</P>
            <P>Después, nuestro equipo inspecciona el inmueble y evalúa su arquitectura, distribución, luz natural, estado del edificio, entorno y posibilidades reales de remodelación.</P>
            <P>Cada activo debe cumplir los criterios comerciales y técnicos de Zequara para avanzar.</P>
          </In>
          <Callout>De cada 100 oportunidades evaluadas, menos de 3 llegan a recomendación de compra.</Callout>
        </Sec>

        {/* ══════════ 5 · PASO 03 · PREACUERDO ══════════ */}
        <Sec bg={BROWN5} dark className="rounded-tr-[64px]">
          <In><Paso dark>Paso 03 · Preacuerdo</Paso></In>
          <In delay={0.05}>
            <Pregunta dark>¿Qué establece la relación desde el comienzo?</Pregunta>
            <H3 dark>Un acuerdo claro antes de acceder al portafolio.</H3>
          </In>
          <Foto src="como-preacuerdo.webp" alt="Preacuerdo" />
          <In delay={0.1}>
            <P dark>El preacuerdo protege la confidencialidad de las oportunidades y define cómo se ejecuta el modelo Zequara.</P>
            <P dark>Cuando adquieres un inmueble presentado en la plataforma, la remodelación se desarrolla con nuestro equipo, bajo un alcance, presupuesto y contrato previamente aprobados.</P>
            <P dark>La administración posterior del activo permanece como una decisión del inversionista.</P>
          </In>
          <Callout dark>Acceso sin membresía. Compra sin comisión para el inversionista.</Callout>
        </Sec>

        {/* ══════════ 6 · PASO 04 · MODELO DE COBRO ══════════ */}
        <Sec bg={CREAM} className="rounded-tl-[64px]">
          <img src={`${A}/como-ciudad.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-25" />
          <In><Paso>Paso 04 · Modelo de cobro</Paso></In>
          <In delay={0.05}>
            <Pregunta>¿Cómo cobra Zequara?</Pregunta>
            <H3>Honorarios vinculados a la ejecución sobre el activo.</H3>
            <P>
              El acceso aprobado a la plataforma y la curaduría de oportunidades hacen parte del proceso de vinculación.{" "}
              <span className="font-semibold" style={{ color: BISTRE }}>Zequara cobra cuando ejecuta servicios sobre la propiedad.</span>{" "}
              Cada servicio tiene su propio alcance, contrato y estructura de honorarios.
            </P>
          </In>
          <div className="mt-[22px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
            <Card title="Diseño y remodelación" delay={0}>Intervención del activo a alcance y costo cerrado.</Card>
            <Card title="Administración del arriendo" delay={0.12}>Comercialización, arrendatario y operación del activo.</Card>
            <Card title="Gestión de venta" delay={0.24}>Salida acompañada cuando decides vender.</Card>
          </div>
          <Callout>Conoces los honorarios y las condiciones antes de aprobar cada servicio.</Callout>
        </Sec>

        {/* ══════════ 7 · PASO 05 · CONTROL DE OBRA ══════════ */}
        <Sec bg={BROWN} dark className="rounded-tr-[64px]">
          <In><Paso dark>Paso 05 · Control de obra</Paso></In>
          <In delay={0.05}>
            <Pregunta dark>¿Cómo protegemos el presupuesto?</Pregunta>
            <H3 dark>Alcance, costos y cronograma definidos antes de comenzar.</H3>
          </In>

          <In delay={0.1} className="mt-[22px] rounded-[20px] border border-solid p-[18px]" style={{ borderColor: CREAM }}>
            <span className="inline-block rounded-full px-[16px] py-[7px] text-[14px] font-semibold" style={{ background: "#687540", color: CREAM }}>ANTES DE EMPEZAR</span>
            <p className="m-0 mt-[14px] text-[14.5px] font-light" style={{ color: LINEN80 }}>Antes de iniciar la remodelación se establecen :</p>
            <ul className="mt-[12px] flex list-none flex-wrap gap-[8px] p-0">
              {ANTES_ITEMS.map((t) => (
                <li key={t} className="rounded-full border border-solid px-[13px] py-[7px] text-[13px]" style={{ borderColor: "rgba(226,205,174,0.3)", color: LINEN80 }}>{t}</li>
              ))}
            </ul>
          </In>

          <In delay={0.16} className="mt-[12px] rounded-[20px] border border-solid p-[18px]" style={{ borderColor: CREAM }}>
            <span className="inline-block rounded-full px-[16px] py-[7px] text-[14px] font-semibold" style={{ background: "#687540", color: CREAM }}>DURANTE LA EJECUCIÓN</span>
            <p className="m-0 mt-[14px] text-[13.5px] font-light leading-[1.5]" style={{ color: LINEN80 }}>Los hallazgos técnicos identificados durante la evaluación se incorporan al presupuesto inicial.</p>
            <p className="m-0 mt-[10px] text-[13.5px] font-light leading-[1.5]" style={{ color: LINEN80 }}>Las modificaciones posteriores se documentan, cotizan y aprueban antes de ejecutarse.</p>
            <p className="m-0 mt-[10px] text-[13.5px] font-light leading-[1.5]" style={{ color: LINEN80 }}>Durante la obra puedes consultar digitalmente el avance del proyecto.</p>
          </In>

          <In delay={0.2} className="mt-[20px] overflow-hidden rounded-[18px]">
            <img src={`${A}/panel-zequara.webp`} alt="Plataforma de control de obra" loading="lazy" decoding="async" className="block w-full" />
          </In>

          <Callout dark>Seguimiento de progreso, cronograma, documentación y aprobaciones desde tu plataforma personal.</Callout>
        </Sec>

        {/* ══════════ 8 · PASO 06 · ESTRATEGIA DE RENTA ══════════ */}
        <Sec bg={CREAM}>
          <In><Paso>Paso 06 · Estrategia de renta</Paso></In>
          <In delay={0.05}>
            <Pregunta>¿Cómo se diseña un inmueble para atraer demanda?</Pregunta>
            <H3>El perfil del arrendatario se define primero.</H3>
          </In>
          <Foto src="como-renta.webp" alt="Estrategia de renta" />
          <div className="mt-[16px] flex flex-col gap-[14px]">
            {([
              ["Primero", "Antes de remodelar, identificamos quién debe querer vivir en el inmueble y qué características valora."],
              ["Después", "La distribución, los materiales, el mobiliario y el canon se proyectan según la demanda de cada microzona y el perfil del arrendatario objetivo."],
              ["Finalmente", "Una vez disponible, Zequara gestiona la comercialización, las visitas, la selección del arrendatario y la operación del activo."],
            ] as const).map(([t, d], i) => (
              <In key={t} delay={0.06 * i} y={16}>
                <p className="m-0 text-[15px] font-bold" style={{ color: BROWN }}>{t}</p>
                <p className="m-0 mt-[5px] text-[14.5px] font-light leading-[1.6]" style={{ color: MILLBROOK }}>{d}</p>
              </In>
            ))}
          </div>
          <Callout>Cada oportunidad incluye una hipótesis de demanda, canon y ocupación.</Callout>
        </Sec>

        {/* ══════════ 9 · PASO 07 · ESTRATEGIA DE SALIDA ══════════ */}
        <Sec bg={BROWN} dark className="rounded-tr-[64px]">
          <In><Paso dark>Paso 07 · Estrategia de salida</Paso></In>
          <In delay={0.05}>
            <Pregunta dark>¿Cómo identificamos el momento de vender?</Pregunta>
            <H3 dark>Los datos orientan. Tú decides.</H3>
          </In>
          <Foto src="como-salida.webp" alt="Estrategia de salida" />
          <In delay={0.1}>
            <P dark>Zequara monitorea el comportamiento de la microzona, la oferta disponible, la velocidad de venta y los nuevos proyectos en construcción.</P>
          </In>
          <div className="mt-[16px] flex flex-wrap gap-[8px]">
            {INDICADORES.map((t, i) => (
              <In key={t} delay={0.05 * i}>
                <span className="ix-chip flex items-center gap-[9px] rounded-full border border-solid px-[15px] py-[10px] text-[14px]" style={{ background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)", color: LINEN }}>
                  <span className="block size-[8px] rounded-full" style={{ background: GREEN_SMOKE }} />
                  {t}
                </span>
              </In>
            ))}
          </div>
          <In delay={0.16}>
            <P dark>Cuando los indicadores muestran una oportunidad de salida, presentamos un escenario con valor estimado de mercado, plusvalía potencial, costos de venta y comparación frente a mantener el activo en renta. La propiedad y la decisión final siempre permanecen en manos del inversionista.</P>
          </In>
          <Callout dark>Una misma inversión puede conservar alternativas de renta, venta o permanencia.</Callout>
        </Sec>

        {/* ══════════ 10 · CAPACIDAD OPERATIVA ══════════ */}
        <Sec bg={CREAM}>
          <img src={`${A}/como-ciudad.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-25" />
          <In><Paso>Capacidad operativa</Paso></In>
          <In delay={0.05}>
            <Pregunta>¿Qué experiencia respalda la operación?</Pregunta>
            <H3>Veinte años de <span className="font-semibold">ejecución verificable.</span></H3>
          </In>
          <div className="mt-[24px] grid grid-cols-1 gap-[2px] sm:grid-cols-3 sm:gap-[18px]">
            {CAPACIDAD.map((s, i) => (
              <In key={s.label} delay={0.06 * i} y={18} className="border-t border-solid py-[15px] sm:border-t-0 sm:py-0" style={{ borderColor: "rgba(165,122,78,0.3)" }}>
                <p className="m-0 whitespace-nowrap text-[clamp(2rem,9vw,2.8rem)] font-extrabold leading-[1] sm:text-[clamp(1.4rem,3.4vw,2rem)]" style={{ color: BROWN }}>
                  <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </p>
                <p className="m-0 mt-[4px] text-[14.5px] font-medium leading-[1.3] sm:text-[13px]" style={{ color: MILLBROOK }}>{s.label}</p>
              </In>
            ))}
          </div>
          <In delay={0.18}>
            <P>El equipo Zequara reúne experiencia en diseño, estructuración y ejecución de proyectos residenciales, comerciales, institucionales e industriales. Ese recorrido se traduce en procesos, presupuestos y controles aplicados a cada nueva operación.</P>
          </In>
          <Callout>Track record disponible durante la entrevista de acceso.</Callout>
        </Sec>

        {/* ══════════ 11 · RESPALDO HUMANO ══════════ */}
        <Sec bg={BROWN} dark className="rounded-tr-[64px]">
          <In><Paso dark>Respaldo humano</Paso></In>
          <In delay={0.05}>
            <Pregunta dark>El criterio detrás de cada inmueble.</Pregunta>
            <H3 dark><span style={{ color: LINEN }}>Christian Mejía, </span><span className="font-semibold">director de diseño y operación técnica.</span></H3>
          </In>
          <In delay={0.1} className="mt-[20px] overflow-hidden rounded-[18px]">
            <img src={`${A}/como-christian-full.webp`} alt="Christian Mejía, director de diseño y operación técnica" loading="lazy" decoding="async" className="block w-full" />
          </In>
          <In delay={0.14}>
            <P dark>Christian cuenta con veinte años de experiencia ejecutando proyectos de alta exigencia técnica: plantas industriales, laboratorios, espacios comerciales y reconversiones inmobiliarias.</P>
            <P dark>Ese mismo rigor se aplica para evaluar cada inmueble, definir su intervención y supervisar la ejecución de la obra.</P>
            <blockquote className="m-0 mt-[20px] border-l-2 border-solid pl-[16px]" style={{ borderColor: "#7f8b57" }}>
              <p className="m-0 text-[clamp(1.15rem,5vw,1.5rem)] font-light italic leading-[1.3]" style={{ color: LINEN }}>
                “Una inversión inmobiliaria se hace bien o no se hace.”
              </p>
            </blockquote>
          </In>
          <Callout dark>Christian revisa cada operación que ingresa al portafolio Zequara.</Callout>
        </Sec>

        {/* ══════════ 12 · CIERRE ══════════ */}
        <Sec bg={CREAM}>
          <img src={`${A}/como-cierre.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover" style={{ opacity: 0.25 }} />
          <In><Paso>El acceso es selectivo</Paso></In>
          <In delay={0.05}>
            <H3>Tu capital trabaja. <span className="font-semibold">Zequara se ocupa de la operación.</span></H3>
            <P>Tú mantienes la propiedad y apruebas las decisiones clave. Zequara conecta selección, remodelación y operación mediante un solo equipo, un proceso trazable y un único interlocutor.</P>
          </In>
          <In delay={0.12}>
            <a href="/solicitud-acceso" className="ix-press mt-[24px] flex h-[56px] w-full max-w-[340px] items-center justify-center rounded-full text-[16px] font-semibold" style={{ background: BROWN, color: CREAM }}>
              Solicitar acceso
            </a>
            <p className="mt-[16px] text-[13px] font-light leading-[1.5]" style={{ color: "rgba(91,67,50,0.85)" }}>
              Portafolio reservado para un grupo limitado de inversionistas. Acceso sujeto a evaluación.
            </p>
          </In>
        </Sec>

        <MobileFooter />
      </div>
    </MotionConfig>
  );
}
