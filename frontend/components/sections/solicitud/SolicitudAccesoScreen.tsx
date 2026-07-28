"use client";

import { MotionConfig, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import { EASE, MLine, POP, Pop, Rise, Rule } from "@/components/motion/Kinetics";

/* ═══════════════════════════════════════════════════════════════════════════
   SOLICITUD DE ACCESO — reproducción 1:1 del frame de Figma 311:4483
   (ACCESO, 1920 × 4470): hero, los tres pasos, el formulario, qué encuentras
   al ingresar y el cierre.

   Orden de pintado del diseño: hero → sección 2 → sección 4 → sección 3 →
   sección 5 → nav. La sección 3 (formulario) va después de la 4 y se solapa
   con ella: por eso su esquina redondeada cae sobre las tarjetas olivo.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const I = "/figma/acc";

/* ── Tokens ──────────────────────────────────────────────────────────────── */
const CREAM = "#e2cdae";
const LINEN = "#f7f1e5";
const BROWN = "#492100";
const BISTRE = "#3d2c1e";
const MILLBROOK = "#5b4332";
const DRIFT = "#a57a4e";
const LASER = "#c9a877";
const AVOCADO = "#7f8b57";
const OIL = "#2a1e14";
const ATHS = "#efe6d5"; // fondo de los campos
const DRIFT28 = "rgba(165,122,78,0.28)";
const LINEN18 = "rgba(247,241,229,0.18)";

/* ── Primitivas (las mismas de las otras páginas de canvas fijo) ─────────── */

function L({ x, y, w, h, className, style, children }: { x: number; y: number; w?: number; h?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`absolute ${className ?? ""}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

/** Nodo de texto de Figma: centrado verticalmente sobre `cy`. */
function T({
  x, cy, w, className, style, d, ry = 22, amount = 0.4, children,
}: { x: number; cy: number; w?: number; className?: string; style?: CSSProperties; d?: number; ry?: number; amount?: number; children: ReactNode }) {
  return (
    <div
      className={`absolute flex flex-col justify-center ${className ?? ""}`}
      style={{ left: x, top: cy, width: w, transform: "translateY(-50%)", ...style }}
    >
      {d === undefined ? children : (
        <motion.div
          initial={{ opacity: 0, y: ry }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount }}
          transition={{ duration: 0.7, delay: d, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

/** Icono de Figma: vectores SVG posicionados por `inset`. */
function Ico({ size, layers, className, style }: { size: number; layers: [string, string, string][]; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative shrink-0 overflow-hidden ${className ?? ""}`} style={{ width: size, height: size, ...style }}>
      {layers.map(([outer, inner, src], i) => (
        <div key={i} className="absolute" style={{ inset: outer }}>
          <div className="absolute" style={{ inset: inner }}>
            <img alt="" src={`${I}/${src}`} className="block size-full max-w-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

const IC_ARROW_CREAM: [string, string, string][] = [
  ["50% 20.83% 50% 20.83%", "-0.75px 0", "arrow-cream1.svg"],
  ["25% 20.83% 25% 54.17%", "-5.89% -23.57% -5.89% -11.79%", "arrow-cream2.svg"],
];
const IC_ARROW_DARK: [string, string, string][] = [
  ["50% 20.83% 50% 20.83%", "-0.75px 0", "arrow-dark1.svg"],
  ["25% 20.83% 25% 54.17%", "-5.89% -23.57% -5.89% -11.79%", "arrow-dark2.svg"],
];
const IC_TICK: [string, string, string][] = [["25% 16.67% 29.17% 16.67%", "-6.11% -4.2% -12.21% -4.2%", "tick.svg"]];
const IC_LOCK: [string, string, string][] = [
  ["41.67% 16.67% 16.67% 16.67%", "-9.5% -5.94%", "lock1.svg"],
  ["12.5% 33.33% 58.33% 33.33%", "-13.57% -11.88% 0 -11.87%", "lock2.svg"],
];
const IC_CHEVRON: [string, string, string][] = [["37.5% 25% 37.5% 25%", "-11.79% -5.89% -23.57% -5.89%", "chevron.svg"]];
const IC_CHIP_TICK: [string, string, string][] = [["29.17% 20.83%", "-10.61% -7.58% -21.21% -7.58%", "chip-tick.svg"]];
const IC_CARD: [string, string, string][][] = [
  [["12.5%", "-5.8% 0 -4.72% 0", "c1a.svg"], ["62.5% 37.5% 12.5% 37.5%", "-14.17% -14.17% 0 -14.17%", "c1b.svg"]],
  [["33.33% 20.83% 12.5% 12.5%", "-9.25% -7.51% -6.54% 0", "c2.svg"]],
  [["12.5%", "0 0 -4.72% -4.72%", "c3.svg"]],
];

/** Botón pill de CTA (Component 2 / Component 4 de Figma). */
function CTA({ x, y, tone, label, d = 0, centered }: { x: number; y: number; tone: "olive" | "cream"; label: string; d?: number; centered?: boolean }) {
  const olive = tone === "olive";
  return (
    <Pop className="absolute" style={{ left: x, top: y }} delay={d} from={0.88} dur={0.6}>
      <a
        href="#formulario"
        className={`ix-cta relative block overflow-hidden ${olive ? "ix-pulse-green" : "ix-pulse"}`}
        style={{
          width: 251.39, height: 58.8,
          background: olive ? AVOCADO : LINEN,
          borderRadius: 999,
          boxShadow: olive ? "0px 16px 32px -16px rgba(47,55,30,0.6)" : "0px 16px 32px -16px rgba(0,0,0,0.4)",
        }}
      >
        <T
          x={32} cy={28.5} w={159.121}
          className={`font-semibold ${centered ? "text-center" : ""}`}
          style={{ fontSize: 16, lineHeight: "24.8px", color: olive ? LINEN : OIL }}
        >
          <p>{label}</p>
        </T>
        <Ico size={18} layers={olive ? IC_ARROW_CREAM : IC_ARROW_DARK} className="ix-cta-arrow absolute" style={{ left: 201.39, top: 20.39 }} />
        <span className="ix-cta-shine" aria-hidden />
      </a>
    </Pop>
  );
}

/* ── Contenido ───────────────────────────────────────────────────────────── */

const PASOS = [
  { n: "1", t: "Comparte tu perfil", lines: ["Completa un formulario breve con", "tus datos, capital disponible,", "objetivo y mercados de interés."] },
  { n: "2", t: "Conversemos", lines: ["Después de revisar tu información,", "coordinamos una sesión virtual", "para conocer tu estrategia, resolver", "preguntas y alinear expectativas."] },
  { n: "3", t: "Confirmamos el acceso", lines: ["Al finalizar la sesión, ambas partes", "validan si existe afinidad para", "avanzar. Cuando el perfil es", "aprobado, habilitamos el acceso a", "la plataforma."] },
];

const ENCUENTRAS = [
  { t: "Datos del activo", lines: ["Ubicación, área, valor de entrada y", "características principales."] },
  { t: "Propuesta de transformación", lines: ["Alcance preliminar de diseño,", "remodelación e inversión."] },
  { t: "Lectura de la oportunidad", lines: ["Potencial de renta, valorización y", "alternativas de salida."] },
];

const MERCADOS = [
  { label: "Bogotá", x: 0, y: 0 },
  { label: "Medellín", x: 114.63, y: 0 },
  { label: "Cartagena", x: 236.77, y: 0 },
  { label: "Ciudad de Panamá", x: 0, y: 51 },
  { label: "Otros mercados", x: 199.66, y: 51 },
  { label: "Abierto a recomendaciones", x: 0, y: 102 },
];

/* ── Campos del formulario ───────────────────────────────────────────────── */

const LABEL_ST: CSSProperties = { fontSize: 12.8, lineHeight: "19.84px", color: BISTRE };
const FIELD_ST: CSSProperties = {
  background: ATHS,
  border: `1px solid ${DRIFT28}`,
  borderRadius: 12,
  fontSize: 15.4,
  width: "100%",
  padding: "15px 17px",
  outline: "none",
  color: OIL,
};

function Field({ label, placeholder, type = "text", w }: { label: string; placeholder: string; type?: string; w: number }) {
  return (
    <div style={{ width: w }}>
      <p className="font-medium" style={LABEL_ST}>{label}</p>
      <input type={type} placeholder={placeholder} className="ix-field mt-[8px] block font-normal" style={FIELD_ST} />
    </div>
  );
}

function Select({ label, placeholder, options, w }: { label: string; placeholder: string; options: string[]; w: number }) {
  return (
    <div style={{ width: w }}>
      <p className="font-medium" style={LABEL_ST}>{label}</p>
      <div className="relative mt-[8px]">
        <select
          defaultValue="" aria-label={label}
          className="ix-field block cursor-pointer appearance-none font-normal"
          style={{ ...FIELD_ST, paddingRight: 43 }}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <Ico size={16} layers={IC_CHEVRON} className="pointer-events-none absolute" style={{ right: 17, top: "calc(50% - 8px)" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Página
   ═══════════════════════════════════════════════════════════════════════════ */

export default function SolicitudAccesoScreen() {
  const router = useRouter();
  const [mercados, setMercados] = useState<string[]>([]);
  const toggle = (m: string) => setMercados((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  /**
   * Todavía no hay endpoint al que enviar: por ahora sólo lleva a la pantalla
   * de confirmación. Cuando exista el backend, el POST va aquí antes del push.
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/solicitud-acceso/confirmacion");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative size-full overflow-hidden" style={{ background: CREAM }} data-name="ACCESO">
        {/* ══════════ 1 · HERO (311:4484) ══════════ */}
        <L
          x={0} y={0} w={1920} h={936.42} className="overflow-hidden"
          style={{ backgroundImage: "linear-gradient(179.978deg, rgba(73,33,0,0.65) 24.665%, rgba(110,75,43,0.65) 48.338%, rgba(168,140,109,0.65) 82.277%, rgba(226,205,174,0.65) 99.915%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(134.987deg, rgba(201,168,119,0.12) 0%, rgba(201,168,119,0) 100%), linear-gradient(45.013deg, rgba(247,241,229,0.05) 0%, rgba(247,241,229,0.05) 0.49517%, rgba(247,241,229,0) 0.49517%, rgba(247,241,229,0) 0.99035%)",
            }}
          />
          <Rule x={620} y={279.99} w={34} color={LASER} delay={0.15} />
          <T x={666} cy={279.07} w={251.104} d={0.29} ry={14} className="whitespace-nowrap font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.226px", color: LASER }}>
            <p>Portafolio privado Serava</p>
          </T>
          <T x={620} cy={422.11} w={591.34} className="whitespace-nowrap" style={{ fontSize: 64, lineHeight: "71.68px", letterSpacing: "-1.6px", color: LINEN }}>
            <MLine delay={0.3}><span className="font-light">Conozcamos tu</span></MLine>
            <MLine delay={0.42}><span className="font-semibold">estrategia de</span></MLine>
            <MLine delay={0.54}><span className="font-semibold">inversión.</span></MLine>
          </T>
          <T x={620} cy={577.72} d={0.78} className="whitespace-nowrap font-light" style={{ fontSize: 20.5, lineHeight: "31.74px", color: "rgba(247,241,229,0.86)" }}>
            <p>Completa tu perfil para iniciar el proceso de acceso a</p>
            <p>oportunidades seleccionadas según tu capital, objetivo y</p>
            <p>mercados de interés.</p>
          </T>
          <CTA x={620} y={680.85} tone="olive" label="Completar mi perfil" d={0.94} />
          <T x={620} cy={773.24} d={1.06} className="whitespace-nowrap font-light" style={{ fontSize: 20.5, lineHeight: "31.74px", color: BROWN }}>
            <p>El formulario toma aproximadamente 2 minutos.</p>
          </T>
        </L>

        {/* ══════════ 2 · CÓMO FUNCIONA EL ACCESO (311:4521) ══════════ */}
        <L
          x={0} y={840} w={1920} h={1018} className="overflow-hidden"
          style={{ backgroundImage: "linear-gradient(180deg, rgba(226,205,174,0) 0%, rgb(226,205,174) 9.7409%, rgb(226,205,174) 24.685%, rgb(225,204,173) 100%)" }}
        >
          <T x={460} cy={198.16} w={760} d={0} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color: BROWN }}>
            <p>Un proceso de conocimiento mutuo</p>
          </T>
          <T x={460} cy={267.79} w={563.67} className="whitespace-nowrap" style={{ fontSize: 41.6, lineHeight: "46.59px", letterSpacing: "-1.04px", color: BROWN }}>
            <MLine delay={0.12}><span className="font-light">Tres pasos para entrar al</span></MLine>
            <MLine delay={0.24}><span className="font-semibold">portafolio privado.</span></MLine>
          </T>

          {PASOS.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.34 + i * 0.12, ease: EASE }}
              whileHover={{ y: -7 }}
              className="ix-card absolute overflow-hidden"
              style={{
                left: 460 + i * 339.33, top: 364.79, width: 321.33, height: 272,
                background: "rgba(73,33,0,0.8)", border: `1px solid ${LINEN18}`,
                borderRadius: 18, padding: "31px 27px", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
              }}
            >
              <motion.div
                className="ix-card-ico flex items-center justify-center"
                style={{ width: 44, height: 44, borderRadius: 22, background: "rgba(201,168,119,0.12)", border: `1px solid ${LINEN18}` }}
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: 0.5 + i * 0.12, ease: POP }}
              >
                <span className="text-center font-semibold" style={{ fontSize: 16, lineHeight: "24.8px", color: LASER }}>{p.n}</span>
              </motion.div>
              <p className="font-semibold" style={{ marginTop: 20, fontSize: 19.2, lineHeight: "21.5px", letterSpacing: "-0.48px", color: LINEN }}>{p.t}</p>
              <div className="font-light" style={{ marginTop: 9.3, fontSize: 14.7, lineHeight: "22.82px", color: "rgba(247,241,229,0.75)" }}>
                {p.lines.map((l) => <p key={l}>{l}</p>)}
              </div>
            </motion.div>
          ))}

          <T x={460} cy={655.8} w={1000} d={0.1} className="font-light" style={{ fontSize: 13.4, lineHeight: "20.83px", color: BROWN }}>
            <p>El acceso se confirma después de la sesión virtual con el equipo Serava.</p>
          </T>
        </L>

        {/* ══════════ 4 · QUÉ ENCUENTRAS AL INGRESAR (311:4713) ══════════ */}
        <L x={0} y={2668} w={1920} h={1158} className="overflow-hidden" style={{ background: CREAM }}>
          <T x={460} cy={321.16} w={760} d={0} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color: BROWN }}>
            <p>Tu espacio privado</p>
          </T>
          <T x={460} cy={414.19} w={563.67} className="whitespace-nowrap" style={{ fontSize: 41.6, lineHeight: "46.59px", letterSpacing: "-1.04px", color: BROWN }}>
            <MLine delay={0.12}><span className="font-light">Información estructurada</span></MLine>
            <MLine delay={0.22}>
              <span className="font-light">para </span>
              <span className="font-semibold">evaluar cada</span>
            </MLine>
            <MLine delay={0.32}><span className="font-semibold">oportunidad.</span></MLine>
          </T>
          <T x={460} cy={529.5} w={606.91} d={0.46} className="whitespace-nowrap font-light" style={{ fontSize: 17.6, lineHeight: "27.28px", color: BROWN }}>
            <p>Dentro de la plataforma accedes a oportunidades activas y a la</p>
            <p>información necesaria para comprender cada operación.</p>
          </T>

          {ENCUENTRAS.map((c, i) => (
            <motion.div
              key={c.t}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.68, delay: 0.2 + i * 0.11, ease: EASE }}
              whileHover={{ y: -7 }}
              className="ix-card absolute overflow-hidden"
              style={{
                left: 460 + i * 338.67, top: 605.89, width: 322.66, height: 200,
                background: AVOCADO, border: `1px solid ${LINEN18}`,
                borderRadius: 16, padding: "29px 25px",
              }}
            >
              <motion.div
                className="ix-card-ico flex items-center justify-center"
                style={{ width: 46, height: 46, borderRadius: 12, background: "#e5dccf" }}
                initial={{ scale: 0.4, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: 0.36 + i * 0.11, ease: POP }}
              >
                <Ico size={23} layers={IC_CARD[i]} />
              </motion.div>
              <p className="font-semibold" style={{ marginTop: 15, fontSize: 17.6, lineHeight: "27.28px", color: LINEN }}>{c.t}</p>
              <div className="font-light" style={{ marginTop: 8, fontSize: 14.4, lineHeight: "22.32px", color: "rgba(247,241,229,0.72)" }}>
                {c.lines.map((l) => <p key={l}>{l}</p>)}
              </div>
            </motion.div>
          ))}

          <T x={460} cy={836.8} w={1000} d={0.1} className="font-light" style={{ fontSize: 13.4, lineHeight: "20.83px", color: BROWN }}>
            <p>La información detallada del portafolio permanece dentro del entorno privado Serava.</p>
          </T>
        </L>

        {/* ══════════ 3 · FORMULARIO (311:4564) — se pinta sobre la sección 4 ══════════ */}
        <L x={0} y={1667} w={1920} h={1202.17} className="overflow-hidden" style={{ background: BROWN, borderRadius: "150px 0 0 0" }}>
          <img
            alt="" loading="lazy" src={`${A}/acc-cuadro.webp`}
            className="pointer-events-none absolute inset-0 size-full max-w-none object-cover"
            style={{ opacity: 0.1 }}
          />
          <span id="formulario" className="absolute left-0 top-0" />

          {/* Columna izquierda (311:4566) */}
          <T x={460} cy={179.16} w={399.5} d={0} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color: CREAM }}>
            <p>Tu perfil de inversión</p>
          </T>
          <T x={460} cy={249.07} w={399.5} style={{ fontSize: 41.6, lineHeight: "46.59px", letterSpacing: "-1.04px", color: CREAM }}>
            <MLine delay={0.12}><span className="font-light">Cuéntanos cómo</span></MLine>
            <MLine delay={0.24}><span className="font-semibold">quieres invertir.</span></MLine>
          </T>
          <T x={460} cy={336.02} w={399.5} d={0.4} className="font-light" style={{ fontSize: 17.6, lineHeight: "27.28px", color: CREAM }}>
            <p>Tus respuestas nos ayudan a preparar una</p>
            <p>conversación más útil desde el primer</p>
            <p>contacto.</p>
          </T>
          {([
            ["Toma unos 2 minutos.", IC_TICK],
            ["Sin membresía ni comisión para el inversionista.", IC_TICK],
            ["Tus datos se tratan de forma confidencial.", IC_LOCK],
          ] as const).map(([txt, ico], i) => (
            <Rise key={txt} className="absolute flex items-center gap-[11px]" style={{ left: 460, top: 421.62 + i * 34.3 }} delay={0.52 + i * 0.09} y={14} x={-14}>
              <Ico size={18} layers={ico} />
              <p className="whitespace-nowrap font-light" style={{ fontSize: 14.4, lineHeight: "22.32px", color: CREAM }}>{txt}</p>
            </Rise>
          ))}

          {/* Tarjeta del formulario (311:4588) */}
          <motion.div
            className="absolute overflow-hidden"
            style={{ left: 919.5, top: 168, width: 540.5, background: LINEN, borderRadius: 24, boxShadow: "0px 34px 70px -30px rgba(0,0,0,0.45)" }}
            initial={{ opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <form className="flex flex-col" style={{ padding: 45, gap: 15.2 }} onSubmit={onSubmit}>
              <div className="flex items-center gap-[13px]">
                <p className="whitespace-nowrap font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "2.074px", color: DRIFT }}>Tus datos</p>
                <span className="h-px flex-1" style={{ background: DRIFT28 }} />
              </div>
              <div className="flex gap-[16px]">
                <Field label="Nombre completo" placeholder="Nombre y apellido" w={217.25} />
                <Field label="Correo electrónico" placeholder="nombre@correo.com" type="email" w={217.25} />
              </div>
              <div className="flex gap-[16px]">
                <Field label="Teléfono / WhatsApp" placeholder="+57 300 000 0000" type="tel" w={217.25} />
                <Select label="País de residencia" placeholder="Selecciona un país" w={217.25} options={["Colombia", "Panamá", "México", "Estados Unidos", "España", "Otro"]} />
              </div>

              <div className="flex items-center gap-[13px]" style={{ marginTop: 12.8 }}>
                <p className="whitespace-nowrap font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "2.074px", color: DRIFT }}>Tu perfil de inversión</p>
                <span className="h-px flex-1" style={{ background: DRIFT28 }} />
              </div>
              <div className="flex gap-[16px]">
                <Select label="Capital disponible para invertir" placeholder="Selecciona un rango" w={217.25} options={["Menos de USD 100.000", "USD 100.000 – 250.000", "USD 250.000 – 500.000", "Más de USD 500.000"]} />
                <Select label="Objetivo principal" placeholder="Selecciona una opción" w={217.25} options={["Renta", "Valorización", "Ambos", "Diversificar patrimonio"]} />
              </div>

              <div>
                <p className="font-medium" style={LABEL_ST}>Mercados de interés</p>
                <div className="relative mt-[8px]" style={{ height: 144 }}>
                  {MERCADOS.map((m) => {
                    const on = mercados.includes(m.label);
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => toggle(m.label)}
                        aria-pressed={on}
                        className="ix-chip absolute flex items-center gap-[11.5px]"
                        style={{
                          left: m.x, top: m.y,
                          padding: "10px 17px 10px 20.5px",
                          borderRadius: 999,
                          background: on ? "rgba(127,139,87,0.16)" : ATHS,
                          border: `1px solid ${on ? AVOCADO : DRIFT28}`,
                        }}
                      >
                        <Ico size={7} layers={IC_CHIP_TICK} style={{ opacity: on ? 1 : 0 }} />
                        <span className="whitespace-nowrap text-center font-normal" style={{ fontSize: 13.8, color: MILLBROOK }}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Select label="¿Cuándo te gustaría invertir?" placeholder="Selecciona una opción" w={450.5} options={["En los próximos 3 meses", "En 3 – 6 meses", "En 6 – 12 meses", "Solo estoy explorando"]} />

              <label className="flex cursor-pointer items-start gap-[11px]">
                <input
                  type="checkbox"
                  className="shrink-0"
                  style={{ width: 19, height: 19, marginTop: 2.79, borderRadius: 2.5, border: "1px solid #767676", background: "#ffffff", accentColor: AVOCADO }}
                />
                <span className="font-light" style={{ fontSize: 13.4, lineHeight: "20.83px", color: MILLBROOK }}>
                  Autorizo el tratamiento de mis datos personales y el contacto por parte de Serava para continuar el proceso de evaluación.
                </span>
              </label>

              <button
                type="submit"
                className="ix-cta relative flex items-center justify-center gap-[11px] overflow-hidden"
                style={{ width: "100%", padding: "18px 32px", borderRadius: 999, background: AVOCADO, boxShadow: "0px 16px 32px -16px rgba(47,55,30,0.6)" }}
              >
                <span className="text-center font-semibold" style={{ fontSize: 16, color: LINEN }}>Enviar mi perfil</span>
                <Ico size={18} layers={IC_ARROW_CREAM} className="ix-cta-arrow" />
                <span className="ix-cta-shine" aria-hidden />
              </button>

              <p className="text-center font-light" style={{ fontSize: 13.1, lineHeight: "20.34px", color: MILLBROOK }}>
                Revisaremos tu información y te contactaremos para coordinar una sesión virtual de conocimiento mutuo.
              </p>
            </form>
          </motion.div>
        </L>

        {/* ══════════ 5 · CIERRE (311:4752) ══════════ */}
        <L x={0} y={3647} w={1920} h={823} className="overflow-hidden" style={{ background: BROWN, borderRadius: "150px 0 0 0" }}>
          <L x={-580} y={-116} w={1913} h={1109} className="overflow-hidden">
            <img alt="" loading="lazy" src={`${A}/acc-lineas.webp`} className="absolute inset-0 size-full max-w-none object-cover" style={{ opacity: 0.1 }} />
          </L>

          <Rule x={846.79} y={127.5} w={34} color={LASER} delay={0.12} />
          <T x={892.79} cy={126.58} w={178.15} d={0.26} ry={14} className="whitespace-nowrap text-center font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.226px", color: LASER }}>
            <p>Alineación primero</p>
          </T>
          <T x={660} cy={244.3} w={600} className="whitespace-nowrap text-center" style={{ fontSize: 48, lineHeight: "53.76px", letterSpacing: "-1.2px", color: LINEN }}>
            <MLine delay={0.24}><span className="font-light">Una buena inversión</span></MLine>
            <MLine delay={0.36}>
              <span className="font-light">empieza por </span>
              <span className="font-semibold">una buena</span>
            </MLine>
            <MLine delay={0.48}><span className="font-semibold">alineación.</span></MLine>
          </T>
          <T x={660} cy={371.46} w={600} d={0.66} className="whitespace-nowrap text-center font-light" style={{ fontSize: 17.6, lineHeight: "27.28px", color: "rgba(247,241,229,0.84)" }}>
            <p>Comparte tu perfil para iniciar el proceso y conocer si Serava se</p>
            <p>ajusta a la forma en que quieres invertir.</p>
          </T>
          <CTA x={834.31} y={431.18} tone="cream" label="Completar mi perfil" d={0.82} centered />
          <T x={660} cy={533.3} w={600} d={0.96} className="whitespace-nowrap text-center font-light" style={{ fontSize: 13.4, lineHeight: "20.83px", color: "rgba(247,241,229,0.6)" }}>
            <p>Portafolio privado. Acceso sujeto a evaluación, sesión virtual y disponibilidad de</p>
            <p>oportunidades.</p>
          </T>
        </L>

        {/* ══════════ NAV (311:4801) ══════════ */}
        <div className="absolute left-0 top-0 h-[83px] w-full">
          <motion.a
            href="/" className="ix-nav absolute block" style={{ left: 63, top: 26, width: 175.277, height: 32.797 }}
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          >
            <img alt="Serava" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} className="absolute inset-0 block size-full max-w-none" />
          </motion.a>
        </div>
      </div>
    </MotionConfig>
  );
}
