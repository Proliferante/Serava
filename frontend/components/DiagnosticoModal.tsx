"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const LOGO = "/figma/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg";

/* ── Icons ─────────────────────────────────────────────── */
const ic = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Clock = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const ArrowR = ({ s = 18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...ic} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const ChevL = () => (<svg width="16" height="16" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M15 6l-6 6 6 6" /></svg>);
const XIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>);
const Check = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>);
const Home = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
const Spark = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 3v18M3 12h18" /></svg>);
const Loop = () => (<svg width="16" height="16" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M4 9a8 8 0 0 1 14-5l2 2M20 15a8 8 0 0 1-14 5l-2-2" /><path d="M20 4v4h-4M4 20v-4h4" /></svg>);

/* ── Data ──────────────────────────────────────────────── */
const QUESTIONS = [
  { q: "¿Qué buscas principalmente con una inversión inmobiliaria?", opts: ["Proteger patrimonio", "Generar renta", "Capturar valorización", "Diversificar fuera de Colombia"] },
  { q: "¿Qué rango de inversión estás considerando?", opts: ["Menos de 500 millones COP", "500 a 1.500 millones COP", "1.500 a 3.000 millones COP", "Más de 3.000 millones COP"] },
  { q: "¿En qué momento estás?", opts: ["Estoy explorando", "Quiero invertir este año", "Tengo capital disponible", "Ya tengo una propiedad en mente"] },
  { q: "¿Qué estrategia te interesa más?", opts: ["Comprar y conservar", "Comprar para rentar", "Comprar, remodelar y vender", "Evaluar varios escenarios"] },
  { q: "¿Qué nivel de riesgo te resulta cómodo?", opts: ["Bajo: zonas consolidadas", "Medio: valorización con una tesis clara", "Alto: zonas de transformación", "No lo tengo claro"] },
  { q: "¿Qué te frena hoy?", opts: ["No tengo tiempo para buscar y evaluar", "No sé si estoy entrando a buen precio", "No quiero manejar la operación", "Me falta un equipo confiable"] },
  { q: "¿Qué nivel de involucramiento quieres tener?", opts: ["Bajo: prefiero delegar", "Medio: quiero revisar decisiones clave", "Alto: quiero participar activamente", "No lo tengo claro"] },
];
const LETTERS = ["A", "B", "C", "D"];
const EASE = [0.22, 1, 0.36, 1] as const;

const BG = `radial-gradient(120% 120% at 0% 100%, rgba(127,139,87,0.16) 0%, rgba(0,0,0,0) 55%), radial-gradient(120% 120% at 100% 0%, rgba(165,122,78,0.22) 0%, rgba(83,61,39,0.11) 27%, rgba(0,0,0,0) 55%), #2a1e14`;

type Step = "intro" | "q" | "partial" | "capture" | "result";

/* ── Progress bar (glowing, advances on each step) ───────── */
function Progress({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-[10px]">
        <p className="font-light text-[12.5px]" style={{ color: "rgba(247,241,229,0.7)" }}>{label}</p>
        <p className="font-light text-[12.5px]" style={{ color: "rgba(247,241,229,0.7)" }}>{Math.round(pct)}%</p>
      </div>
      <div className="relative h-[5px] w-full overflow-visible rounded-full" style={{ background: "rgba(247,241,229,0.12)" }}>
        <motion.div
          className="absolute left-0 top-0 h-[5px] rounded-full"
          style={{ background: "linear-gradient(90deg, #7f8b57 0%, #9aa66f 100%)", boxShadow: "0 0 12px rgba(154,166,111,0.7)" }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* bright leading head */}
          <span className="absolute right-0 top-1/2 -translate-y-1/2 h-[11px] w-[11px] rounded-full" style={{ background: "#cde0a0", boxShadow: "0 0 10px 2px rgba(205,224,160,0.9)" }} />
        </motion.div>
      </div>
    </div>
  );
}

/* ── Reusable button ─────────────────────────────────────── */
function OliveBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-[10px] rounded-full bg-[#7f8b57] px-[28px] py-[15px] font-semibold text-[15px] text-[#f7f1e5] shadow-[0px_16px_32px_-16px_rgba(47,55,30,0.6)] ${className}`}
    >
      {children}
    </motion.button>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className="font-medium text-[13px]" style={{ color: "rgba(247,241,229,0.85)" }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-[12px] border border-solid px-[16px] py-[13px] font-normal text-[15px] text-[#f7f1e5] outline-none transition-colors placeholder:text-[rgba(247,241,229,0.4)] focus:border-[#7f8b57]"
        style={{ background: "rgba(247,241,229,0.05)", borderColor: "rgba(247,241,229,0.18)" }}
      />
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   DIAGNÓSTICO PATRIMONIAL — modal wizard
   ══════════════════════════════════════════════════════════ */
export default function DiagnosticoModal({ open, onClose, initialStep = "intro", initialQ = 0 }: { open: boolean; onClose: () => void; initialStep?: Step; initialQ?: number }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>(initialStep);
  const [qIndex, setQIndex] = useState(initialQ);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(7).fill(null));
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", whatsapp: "", ciudad: "", pais: "" });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // reset a moment after close so the exit animation looks clean
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setStep("intro");
      setQIndex(0);
      setDir(1);
      setAnswers(Array(7).fill(null));
    }, 300);
    return () => window.clearTimeout(t);
  }, [open]);

  const goStart = () => { setDir(1); setStep("q"); setQIndex(0); };
  const selectOpt = (i: number) => {
    setAnswers((a) => { const n = [...a]; n[qIndex] = i; return n; });
    window.setTimeout(() => {
      if (qIndex < 6) { setDir(1); setQIndex((q) => q + 1); }
      else { setDir(1); setStep("partial"); }
    }, 260);
  };
  const goBack = () => {
    if (qIndex > 0) { setDir(-1); setQIndex((q) => q - 1); }
    else { setDir(-1); setStep("intro"); }
  };

  if (!mounted) return null;

  const stepKey = step === "q" ? `q${qIndex}` : step;
  const pct = step === "q" ? ((qIndex + 1) / 7) * 100 : 100;

  const slide = {
    initial: { opacity: 0, x: dir * 44 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: dir * -44 },
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-[16px] sm:p-[28px]"
          role="dialog"
          aria-modal="true"
          aria-label="Diagnóstico patrimonial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" onClick={onClose} />

          {/* Modal panel */}
          <motion.div
            className="relative z-10 flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[24px] border border-solid border-[rgba(247,241,229,0.1)] shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            style={{ background: BG }}
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {/* Top bar */}
            <div className="flex shrink-0 items-center justify-between border-b border-solid border-[rgba(247,241,229,0.07)] px-[28px] py-[16px]">
              <img loading="lazy" decoding="async" src={LOGO} alt="Serava" className="h-[21px] w-[108px]" />
              <button type="button" onClick={onClose} className="ix-nav flex items-center gap-[6px] text-[13px]" style={{ color: "rgba(247,241,229,0.6)" }}>
                Salir <XIcon />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-[24px] pt-[48px] pb-[48px] sm:px-[40px]">
              <div className="mx-auto w-full max-w-[680px]">
                <AnimatePresence mode="wait" custom={dir}>
              {/* ── INTRO ── */}
              {step === "intro" && (
                <motion.div key="intro" {...slide} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col items-center text-center">
                  <span className="mb-[26px] inline-flex items-center gap-[8px] rounded-full border border-solid px-[18px] py-[9px] text-[12.5px]" style={{ borderColor: "rgba(247,241,229,0.18)", color: "rgba(247,241,229,0.75)" }}>
                    <Clock /> Toma menos de 3 minutos
                  </span>
                  <h2 className="font-light text-[clamp(34px,5vw,48px)] leading-[1.1] text-[#f7f1e5] tracking-[-0.02em]">Conoce tu perfil<br />inmobiliario.</h2>
                  <p className="mt-[16px] max-w-[520px] font-light text-[15.5px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>
                    En 7 preguntas identificamos qué estrategia puede tener más sentido para tu patrimonio: conservar, rentar, remodelar, vender o diversificar fuera de Colombia.
                  </p>
                  <div className="mt-[26px] flex flex-wrap justify-center gap-[10px]">
                    {["Estrategia sugerida", "Perfil de riesgo", "Tipo de activo", "Ruta recomendada"].map((c) => (
                      <span key={c} className="rounded-full border border-solid px-[16px] py-[8px] text-[12.5px]" style={{ borderColor: "rgba(247,241,229,0.18)", color: "rgba(247,241,229,0.7)" }}>{c}</span>
                    ))}
                  </div>
                  <OliveBtn onClick={goStart} className="mt-[30px]">Empezar <ArrowR /></OliveBtn>
                  <p className="mt-[26px] text-[13px]" style={{ color: "rgba(247,241,229,0.45)" }}>Completarlo no garantiza acceso a oportunidades Serava.</p>
                </motion.div>
              )}

              {/* ── QUESTIONS ── */}
              {step === "q" && (
                <motion.div key={stepKey} {...slide} transition={{ duration: 0.42, ease: EASE }}>
                  <Progress pct={pct} label={`Pregunta ${qIndex + 1} de 7`} />
                  <p className="mt-[40px] font-bold text-[11.84px] uppercase tracking-[2.368px] text-[#c9a877]">Pregunta {String(qIndex + 1).padStart(2, "0")}</p>
                  <h3 className="mt-[16px] min-h-[120px] max-w-[420px] font-light text-[28.6px] leading-[49px] text-[#f7f1e5] tracking-[-0.704px]">{QUESTIONS[qIndex].q}</h3>
                  <div className="mt-[33px] flex flex-col gap-[12px]">
                    {QUESTIONS[qIndex].opts.map((opt, i) => {
                      const active = answers[qIndex] === i;
                      return (
                        <motion.button
                          key={i}
                          type="button"
                          onClick={() => selectOpt(i)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex h-[76px] items-center gap-[16px] rounded-[15px] border border-solid px-[22px] text-left transition-colors"
                          style={{
                            background: active ? "rgba(127,139,87,0.22)" : "rgba(247,241,229,0.04)",
                            borderColor: active ? "#7f8b57" : "rgba(247,241,229,0.18)",
                          }}
                        >
                          <span
                            className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-solid font-bold text-[13.6px] transition-colors"
                            style={{
                              borderColor: active ? "#7f8b57" : "rgba(247,241,229,0.18)",
                              background: active ? "#7f8b57" : "transparent",
                              color: active ? "#f7f1e5" : "#c9a877",
                            }}
                          >
                            {LETTERS[i]}
                          </span>
                          <span className="font-normal text-[16.3px] text-[#f7f1e5]">{opt}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <button type="button" onClick={goBack} className="ix-nav mt-[34px] flex items-center gap-[8px] text-[14.7px]" style={{ color: "rgba(247,241,229,0.65)" }}>
                    <ChevL /> Anterior
                  </button>
                </motion.div>
              )}

              {/* ── PARTIAL READING ── */}
              {step === "partial" && (
                <motion.div key="partial" {...slide} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col items-center text-center">
                  <div className="w-full"><Progress pct={100} label="Diagnóstico completado" /></div>
                  <motion.p initial={{ scale: 0.55 }} animate={{ scale: 1 }} transition={{ delay: 0.15, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }} className="mt-[40px] font-extrabold text-[38px] text-[#c9a877] leading-none">82</motion.p>
                  <p className="mt-[6px] text-[10.5px] uppercase tracking-[0.25em]" style={{ color: "rgba(247,241,229,0.55)" }}>Compat.</p>
                  <h3 className="mt-[26px] font-light text-[clamp(26px,4vw,34px)] text-[#f7f1e5] tracking-[-0.02em]">Ya tenemos una lectura inicial de tu perfil.</h3>
                  <div className="mt-[34px] w-full max-w-[560px] rounded-[18px] border border-solid p-[8px]" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.14)" }}>
                    {[
                      ["Estrategia sugerida", "Valorización estratégica", false],
                      ["Perfil de riesgo", "Balanceado", false],
                      ["Tipo de activo recomendado", "Zona en consolidación", true],
                      ["Ruta inicial sugerida", "4 pasos", true],
                    ].map(([k, v, blur], idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-solid px-[22px] py-[16px] last:border-0" style={{ borderColor: "rgba(247,241,229,0.08)" }}>
                        <span className="text-[14px]" style={{ color: "rgba(247,241,229,0.6)", filter: blur ? "blur(4px)" : "none" }}>{k as string}</span>
                        <span className="font-semibold text-[14px] text-[#c9a877]" style={{ filter: blur ? "blur(4px)" : "none" }}>{v as string}</span>
                      </div>
                    ))}
                    <p className="px-[22px] py-[12px] text-[12.5px]" style={{ color: "rgba(247,241,229,0.5)" }}>Déjanos tus datos para ver tu diagnóstico completo</p>
                  </div>
                  <OliveBtn onClick={() => { setDir(1); setStep("capture"); }} className="mt-[28px] w-full max-w-[560px]">Ver mi diagnóstico completo <ArrowR /></OliveBtn>
                </motion.div>
              )}

              {/* ── DATA CAPTURE ── */}
              {step === "capture" && (
                <motion.div key="capture" {...slide} transition={{ duration: 0.5, ease: EASE }} className="w-full">
                  <Progress pct={100} label="Último paso" />
                  <div className="mt-[26px] rounded-[18px] border border-solid p-[clamp(20px,4vw,40px)]" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.14)" }}>
                    <h3 className="font-light text-[clamp(24px,3.5vw,30px)] text-[#f7f1e5] tracking-[-0.02em]">Ya casi. Un último paso.</h3>
                    <p className="mt-[10px] font-light text-[14px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>Déjanos tus datos para ver tu diagnóstico completo y solicitar, si quieres, una evaluación de acceso a Serava.</p>
                    <div className="mt-[22px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                      <Field label="Nombre" placeholder="Tu nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
                      <Field label="Apellido" placeholder="Tu apellido" value={form.apellido} onChange={(v) => setForm({ ...form, apellido: v })} />
                      <Field label="Correo electrónico" placeholder="nombre@correo.com" type="email" value={form.correo} onChange={(v) => setForm({ ...form, correo: v })} />
                      <Field label="WhatsApp" placeholder="+57 300 000 0000" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} />
                      <Field label="Ciudad" placeholder="Ciudad de residencia" value={form.ciudad} onChange={(v) => setForm({ ...form, ciudad: v })} />
                      <Field label="País" placeholder="" value={form.pais} onChange={(v) => setForm({ ...form, pais: v })} />
                    </div>
                    <p className="mt-[16px] text-[12px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>Acepto el tratamiento de mis datos personales conforme a la política de privacidad de Serava.</p>
                    <OliveBtn onClick={() => { setDir(1); setStep("result"); }} className="mt-[22px] w-full">Ver mi diagnóstico <ArrowR /></OliveBtn>
                  </div>
                </motion.div>
              )}

              {/* ── RESULT ── */}
              {step === "result" && (
                <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: EASE }} className="flex flex-col items-center text-center pt-[20px]">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a877]">— Tu diagnóstico patrimonial</p>
                  <h2 className="mt-[14px] font-extrabold text-[clamp(30px,5vw,44px)] text-[#f7f1e5]">Valorización estratégica</h2>
                  <p className="mt-[12px] max-w-[520px] font-light text-[15px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>Buscas capturar valor a mediano plazo por ubicación, precio de entrada o dinámica futura del sector.</p>

                  {/* 3 cards */}
                  <div className="mt-[34px] grid w-full grid-cols-1 gap-[16px] sm:grid-cols-3">
                    {[
                      { icon: <Check />, tag: "Perfil de riesgo", title: "Balanceado", desc: "Buscas equilibrio entre valorización y seguridad, con una tesis clara." },
                      { icon: <Home />, tag: "Tipo de activo", title: "Zona en consolidación", desc: "Activo con tesis clara de valorización y buen precio de entrada." },
                      { icon: <Spark />, tag: "Estrategia secundaria", title: "Renovación con captura de valor", desc: "Escenario alterno a evaluar." },
                    ].map((c, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 22 }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: EASE }}
                        className="flex flex-col rounded-[16px] border border-solid p-[22px] text-left"
                        style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.12)" }}
                      >
                        <span className="flex size-[38px] items-center justify-center rounded-[10px] text-[#9aa66f]" style={{ background: "rgba(127,139,87,0.15)" }}>{c.icon}</span>
                        <p className="mt-[16px] text-[10.5px] uppercase tracking-[0.15em]" style={{ color: "rgba(247,241,229,0.5)" }}>{c.tag}</p>
                        <p className="mt-[6px] font-bold text-[19px] leading-[1.2] text-[#f7f1e5]">{c.title}</p>
                        <p className="mt-[10px] font-light text-[13px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.65)" }}>{c.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Ruta inicial */}
                  <div className="mt-[16px] w-full rounded-[16px] border border-solid p-[26px] text-left" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.12)" }}>
                    <p className="flex items-center gap-[8px] font-bold text-[15px] text-[#f7f1e5]"><span className="text-[#9aa66f]"><Loop /></span> Tu ruta inicial</p>
                    <div className="mt-[16px] flex flex-col gap-[12px]">
                      {["Definir la tesis de valorización.", "Validar precio de entrada vs. comparables.", "Decidir si rentar mientras se valoriza.", "Fijar horizonte de salida."].map((s, i) => (
                        <motion.div key={i} initial={{ x: -12 }} animate={{ x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }} className="flex items-center gap-[14px]">
                          <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full border border-solid text-[12px] text-[#c9a877]" style={{ borderColor: "rgba(201,168,119,0.4)" }}>{i + 1}</span>
                          <span className="text-[14px]" style={{ color: "rgba(247,241,229,0.8)" }}>{s}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* CTA card */}
                  <div className="mt-[16px] w-full overflow-hidden rounded-[20px] p-[36px]" style={{ background: "linear-gradient(160deg, #7f8b57 0%, #5f6b3e 100%)" }}>
                    <h3 className="font-light text-[clamp(24px,4vw,30px)] text-[#f7f1e5]">Tu perfil se alinea con el modelo Serava.</h3>
                    <p className="mx-auto mt-[10px] max-w-[420px] font-light text-[14px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.85)" }}>Solicita una evaluación de acceso. El acceso a Serava es selectivo: cada solicitud se evalúa.</p>
                    <motion.a
                      href="/solicitud-acceso"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-[22px] inline-flex items-center justify-center gap-[10px] rounded-full bg-[#f7f1e5] px-[30px] py-[15px] font-bold text-[15px] text-[#2a1e14] shadow-[0px_10px_24px_-10px_rgba(0,0,0,0.5)]"
                    >
                      Solicitar evaluación de acceso <ArrowR />
                    </motion.a>
                  </div>

                  <p className="mt-[24px] max-w-[520px] text-[11.5px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.4)" }}>Esta lectura es orientativa y no constituye asesoría financiera ni una promesa de acceso a oportunidades. Serava opera bajo un modelo de acceso cerrado.</p>
                </motion.div>
              )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
