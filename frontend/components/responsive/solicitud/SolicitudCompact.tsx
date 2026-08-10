"use client";

import { MotionConfig } from "framer-motion";
import { useState } from "react";
import MobileNav from "@/components/responsive/MobileNav";
import ConfirmacionModal from "@/components/sections/solicitud/ConfirmacionModal";
import { BROWN, Card, CheckList, CTA, Eyebrow, H2, In, LASER, MILLBROOK, Note, P, Step, Timeline, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   SOLICITUD DE ACCESO — vista fluida para móvil y tablet (por debajo de 1280).

   El lienzo son 1920 × 4470 con el formulario en una tarjeta de 540 al lado de
   su columna de texto. Aquí la tarjeta ocupa el ancho y los campos, que allí
   van en dos columnas de 217, pasan a una sola: rellenar un formulario largo
   con el pulgar exige una columna y objetivos grandes, así que todos los
   campos miden 56 px de alto.

   Los desplegables sí vuelven a ser `<select>` nativos, sin la caja falsa que
   necesita el escritorio: en móvil el selector del sistema es mejor que
   cualquier cosa que se monte, y como el texto no tiene que caber en 157 px
   tampoco hace falta partirlo en dos líneas.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const ATHS = "#efe6d5";
const DRIFT28 = "rgba(165,122,78,0.28)";

const CAMPO = "h-[56px] w-full rounded-[12px] border border-solid px-[16px] text-[16px] outline-none";
const CAMPO_ST = { background: ATHS, borderColor: DRIFT28, color: "#2a1e14" } as const;
const ETIQUETA = "mb-[8px] block text-[13px] font-medium";

const PASOS = [
  { n: "01", t: "Comparte tu perfil", d: "Completa un formulario breve con tus datos, capital disponible, objetivo y mercados de interés." },
  { n: "02", t: "Conversemos", d: "Después de revisar tu información, coordinamos una sesión virtual para conocer tu estrategia, resolver preguntas y alinear expectativas." },
  { n: "03", t: "Confirmamos el acceso", d: "Al finalizar la sesión, ambas partes validan si existe afinidad para avanzar. Cuando el perfil es aprobado, habilitamos el acceso a la plataforma." },
];

const ENCUENTRAS = [
  { t: "Datos del activo", d: "Ubicación, área, valor de entrada y características principales." },
  { t: "Propuesta de transformación", d: "Alcance preliminar de diseño, remodelación e inversión." },
  { t: "Lectura de la oportunidad", d: "Potencial de renta, valorización y alternativas de salida." },
];

const MERCADOS = ["Bogotá", "Medellín", "Cartagena", "Ciudad de Panamá", "Otros mercados", "Abierto a recomendaciones"];

const PAISES = ["Colombia", "Panamá", "México", "Estados Unidos", "España", "Otro"];
const CAPITAL = ["Menos de USD 100.000", "USD 100.000 – 250.000", "USD 250.000 – 500.000", "Más de USD 500.000"];
const OBJETIVO = ["Renta", "Valorización", "Ambos", "Diversificar patrimonio"];
const CUANDO = ["En los próximos 3 meses", "En 3 – 6 meses", "En 6 – 12 meses", "Solo estoy explorando"];

function Campo({ label, placeholder, type = "text", autoComplete }: { label: string; placeholder: string; type?: string; autoComplete?: string }) {
  return (
    <div>
      <label className={ETIQUETA} style={{ color: BROWN }}>{label}</label>
      <input type={type} placeholder={placeholder} autoComplete={autoComplete} className={`ix-field ${CAMPO}`} style={CAMPO_ST} />
    </div>
  );
}

function Selector({ label, placeholder, options }: { label: string; placeholder: string; options: string[] }) {
  return (
    <div>
      <label className={ETIQUETA} style={{ color: BROWN }}>{label}</label>
      <div className="ix-field-box relative" style={{ borderRadius: 12 }}>
        <select defaultValue="" aria-label={label} className={`ix-field ${CAMPO} cursor-pointer appearance-none pr-[44px]`} style={CAMPO_ST}>
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#5b4332" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  );
}

export default function SolicitudCompact() {
  const [mercados, setMercados] = useState<string[]>([]);
  const [enviado, setEnviado] = useState(false);
  const toggle = (m: string) => setMercados((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-cream">
        <MobileNav />

        {/* ══════════ 1 · HERO ══════════ */}
        <section className="relative overflow-hidden bg-brown-dark">
          <img src={`${A}/acceso.webp`} alt="" loading="eager" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover opacity-45" />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(45,22,4,0.72) 0%, rgba(45,22,4,0.94) 100%)" }} />
          <div className={`${WRAP} relative pb-[60px] pt-[52px]`}>
            <In y={16}><Eyebrow>Portafolio privado Zequara</Eyebrow></In>
            <In y={20} delay={0.08}>
              <h1 className="mt-[14px] text-[clamp(2rem,8.4vw,3.1rem)] font-light leading-[1.1] tracking-[-0.02em] text-cream-93">
                Conozcamos tu <span className="font-semibold">estrategia de inversión.</span>
              </h1>
              <P>Completa tu perfil para iniciar el proceso de acceso a oportunidades seleccionadas según tu capital, objetivo y mercados de interés.</P>
            </In>
            <In delay={0.16}>
              <a href="#formulario" className="ix-press mt-[26px] flex h-[56px] w-full max-w-[340px] items-center justify-center rounded-full text-[16px] font-semibold" style={{ background: "#7f8b57", color: "#f7f1e5" }}>
                Completar mi perfil
              </a>
              <p className="mt-[16px] text-[15px] font-medium" style={{ color: "#e2cdae" }}>El formulario toma aproximadamente 2 minutos.</p>
            </In>
          </div>
        </section>

        {/* ══════════ 2 · TRES PASOS ══════════ */}
        <section className={`${WRAP} py-[58px]`}>
          <In><Eyebrow tone="brown">Un proceso de conocimiento mutuo</Eyebrow></In>
          <In delay={0.06}><H2 dark>Tres pasos para entrar al <span className="font-semibold">portafolio privado.</span></H2></In>
          <div className="mt-[26px] flex flex-col gap-[12px]">
            {PASOS.map((p, i) => (
              <In key={p.n} delay={0.06 * i} className="rounded-[16px] border border-solid p-[20px]" style={{ borderColor: "rgba(247,241,229,0.18)", background: "rgba(73,33,0,0.86)" }}>
                <span className="flex size-[38px] items-center justify-center rounded-full text-[14px] font-semibold" style={{ background: "rgba(201,168,119,0.14)", border: "1px solid rgba(247,241,229,0.18)", color: LASER }}>{p.n}</span>
                <h3 className="m-0 mt-[14px] text-[18px] font-semibold text-cream-93">{p.t}</h3>
                <p className="m-0 mt-[7px] text-[14.5px] font-light leading-[1.55] text-[rgba(247,241,229,0.75)]">{p.d}</p>
              </In>
            ))}
          </div>
          <Note dark>El acceso se confirma después de la sesión virtual con el equipo Zequara.</Note>
        </section>

        {/* ══════════ 3 · FORMULARIO ══════════ */}
        <section id="formulario" className="relative overflow-hidden rounded-tr-[64px] bg-brown-dark py-[58px]">
          <img src={`${A}/acceso-cuadros.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-x-0 top-0 w-full object-cover" style={{ height: 900, opacity: 0.18 }} />
          <div className={`${WRAP} relative`}>
            <In><Eyebrow>Tu perfil de inversión</Eyebrow></In>
            <In delay={0.06}>
              <H2>Cuéntanos cómo <span className="font-semibold">quieres invertir.</span></H2>
              <P>Tus respuestas nos ayudan a preparar una conversación más útil desde el primer contacto.</P>
            </In>
            <CheckList items={["Toma unos 2 minutos.", "Sin membresía ni comisión para el inversionista.", "Tus datos se tratan de forma confidencial."]} />

            <In delay={0.14} className="mt-[28px] rounded-[20px] p-[20px]" style={{ background: "#f7f1e5" }}>
              <form className="flex flex-col gap-[16px]" onSubmit={(e) => { e.preventDefault(); setEnviado(true); }}>
                <div className="flex items-center gap-[12px]">
                  <p className="m-0 whitespace-nowrap text-[11.5px] font-semibold uppercase tracking-[2px]" style={{ color: "#a57a4e" }}>Tus datos</p>
                  <span className="h-px flex-1" style={{ background: DRIFT28 }} />
                </div>
                <Campo label="Nombre completo" placeholder="Nombre y apellido" autoComplete="name" />
                <Campo label="Correo electrónico" placeholder="nombre@correo.com" type="email" autoComplete="email" />
                <Campo label="Teléfono / WhatsApp" placeholder="+57 300 000 0000" type="tel" autoComplete="tel" />
                <Selector label="País de residencia" placeholder="Selecciona un país" options={PAISES} />

                <div className="mt-[6px] flex items-center gap-[12px]">
                  <p className="m-0 whitespace-nowrap text-[11.5px] font-semibold uppercase tracking-[2px]" style={{ color: "#a57a4e" }}>Tu perfil de inversión</p>
                  <span className="h-px flex-1" style={{ background: DRIFT28 }} />
                </div>
                <Selector label="Capital disponible para invertir" placeholder="Selecciona un rango" options={CAPITAL} />
                <Selector label="Objetivo principal" placeholder="Selecciona una opción" options={OBJETIVO} />

                <div>
                  <p className={ETIQUETA} style={{ color: BROWN }}>Mercados de interés</p>
                  <div className="flex flex-wrap gap-[8px]">
                    {MERCADOS.map((m) => {
                      const on = mercados.includes(m);
                      return (
                        <button
                          key={m} type="button" onClick={() => toggle(m)} aria-pressed={on}
                          className="ix-chip flex min-h-[44px] items-center gap-[8px] rounded-full border border-solid px-[16px] text-[14px]"
                          style={{ background: on ? "rgba(127,139,87,0.16)" : ATHS, borderColor: on ? "#7f8b57" : DRIFT28, color: MILLBROOK }}
                        >
                          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#7f8b57" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ opacity: on ? 1 : 0 }}><path d="M20 6 9 17l-5-5" /></svg>
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Selector label="¿Cuándo te gustaría invertir?" placeholder="Selecciona una opción" options={CUANDO} />

                <label className="flex cursor-pointer items-start gap-[11px]">
                  <input type="checkbox" required className="mt-[3px] size-[20px] shrink-0" style={{ accentColor: "#7f8b57" }} />
                  <span className="text-[13.5px] font-light leading-[1.5]" style={{ color: MILLBROOK }}>
                    Autorizo el tratamiento de mis datos personales y el contacto por parte de Zequara para continuar el proceso de evaluación.
                  </span>
                </label>

                <button type="submit" className="ix-press flex h-[58px] w-full items-center justify-center gap-[10px] rounded-full text-[16px] font-semibold" style={{ background: "#7f8b57", color: "#f7f1e5" }}>
                  Enviar mi perfil
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>

                <p className="m-0 text-center text-[13px] font-light leading-[1.5]" style={{ color: MILLBROOK }}>
                  Revisaremos tu información y te contactaremos para coordinar una sesión virtual de conocimiento mutuo.
                </p>
              </form>
            </In>
          </div>
        </section>

        {/* ══════════ 4 · QUÉ ENCUENTRAS ══════════ */}
        <section className={`${WRAP} py-[58px]`}>
          <In><Eyebrow tone="brown">Tu espacio privado</Eyebrow></In>
          <In delay={0.06}>
            <H2 dark>Información estructurada para <span className="font-semibold">evaluar cada oportunidad.</span></H2>
            <P dark>Dentro de la plataforma accedes a oportunidades activas y a la información necesaria para comprender cada operación.</P>
          </In>
          <div className="mt-[26px] grid grid-cols-1 gap-[12px] sm:grid-cols-3">
            {ENCUENTRAS.map((c, i) => <Card key={c.t} title={c.t} delay={0.06 * i}>{c.d}</Card>)}
          </div>
          <Note dark>La información detallada del portafolio permanece dentro del entorno privado Zequara.</Note>
        </section>

        {/* ══════════ 5 · CIERRE ══════════ */}
        <section className="relative overflow-hidden rounded-tr-[64px] bg-brown-dark py-[62px]">
          <img src={`${A}/acceso-torres.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover" style={{ opacity: 0.12 }} />
          <div className={`${WRAP} relative text-center`}>
            <In className="flex justify-center"><span className="block h-px w-[34px]" style={{ background: LASER, opacity: 0.8 }} /></In>
            <In delay={0.06}>
              <p className="mt-[14px] text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: LASER }}>Alineación primero</p>
              <h2 className="mt-[12px] text-[clamp(1.8rem,7.4vw,2.6rem)] font-light leading-[1.12] tracking-[-0.02em] text-cream-93">
                Una buena inversión empieza por <span className="font-semibold">una buena alineación.</span>
              </h2>
              <p className="mx-auto mt-[14px] max-w-[440px] text-[clamp(0.95rem,3.6vw,1.05rem)] font-light leading-[1.6] text-[rgba(247,241,229,0.84)]">
                Comparte tu perfil para iniciar el proceso y conocer si Zequara se ajusta a la forma en que quieres invertir.
              </p>
            </In>
            <In delay={0.14} className="flex flex-col items-center">
              <CTA href="#formulario">Completar mi perfil</CTA>
              <p className="mt-[18px] text-[13px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>
                Portafolio privado. Acceso sujeto a evaluación, sesión virtual y disponibilidad de oportunidades.
              </p>
            </In>
          </div>
        </section>

        {/* Sin pie, como el lienzo: es una página de conversión y el pie sólo
            ofrece salidas justo donde se quiere que el usuario envíe. */}
        <ConfirmacionModal open={enviado} onClose={() => setEnviado(false)} />
      </div>
    </MotionConfig>
  );
}
