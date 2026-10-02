"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MARK } from "@/components/brand";
import { AUTORIZACION, AVISO_SOLICITUD, EnlacePolitica, evidencia } from "@/components/legal/consentimiento";
import {
  calcular, completa, PERFILES, PREGUNTAS, vacias, VERSION,
  type Respuestas, type Resultado,
} from "@/lib/diagnostico";

/* ═══════════════════════════════════════════════════════════════════════════
   DIAGNÓSTICO DEL INVERSIONISTA — el único formulario de entrada.

   ANTES (checkpoint del 30-sep-2026)
   Siete preguntas que no se leían: el resultado era siempre el mismo («82»,
   «Valorización estratégica», «Balanceado»), los datos del paso de captura no
   se enviaban a ningún sitio, y al final mandaba a /solicitud-acceso, que
   volvía a pedir el contacto, el objetivo, el capital (en dólares) y el plazo.
   Para quien llegaba, eran dos formularios y una vuelta en círculo.

   AHORA
   Un solo recorrido: diez preguntas → lectura parcial → registro → resultado.
   El registro ES la solicitud de acceso: se envía a POST /api/diagnostico y no
   hay un segundo formulario. La lógica (qué perfil, qué riesgo, qué
   compatibilidad, por qué) vive en lib/diagnostico.ts, con sus pruebas; esta
   pantalla solo la pinta.

   SIEMPRE HAY POR DÓNDE VOLVER
   Cada paso tiene «Anterior», y «Salir» arriba. Paola lo marcó: había pasos
   sin regreso y quedaba en loop.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Iconos ─────────────────────────────────────────────── */
const ic = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Clock = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...ic} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const ArrowR = ({ s = 18 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" {...ic} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
const ChevL = () => (<svg width="16" height="16" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M15 6l-6 6 6 6" /></svg>);
const XIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>);
const Check = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>);
const Home = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
const Spark = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M12 3v18M3 12h18" /></svg>);
const Loop = () => (<svg width="16" height="16" viewBox="0 0 24 24" {...ic} aria-hidden><path d="M4 9a8 8 0 0 1 14-5l2 2M20 15a8 8 0 0 1-14 5l-2-2" /><path d="M20 4v4h-4M4 20v-4h4" /></svg>);

const LETTERS = ["A", "B", "C", "D", "E"];
const EASE = [0.22, 1, 0.36, 1] as const;
const N = PREGUNTAS.length;
const PAISES = ["Colombia", "Panamá", "Estados Unidos", "México", "España", "Otro"];
/* El texto exacto que acepta la persona: se guarda con la solicitud. */
/** El texto que se guarda como evidencia es el mismo que se ve: la
    autorización compartida de `legal/consentimiento` y el nombre de la
    política a la que enlaza. */
const CONSENTIMIENTO = evidencia("solicitud").texto;
const RIESGO_TXT = {
  Conservador: "Priorizas cuidar el capital: prefieres certeza a un retorno más alto.",
  Moderado: "Aceptas variaciones razonables si hay una tesis clara de valorización.",
  Agresivo: "Toleras más incertidumbre a cambio de un retorno potencial mayor.",
} as const;

const BG = `radial-gradient(120% 120% at 0% 100%, rgba(127,139,87,0.16) 0%, rgba(0,0,0,0) 55%), radial-gradient(120% 120% at 100% 0%, rgba(165,122,78,0.22) 0%, rgba(83,61,39,0.11) 27%, rgba(0,0,0,0) 55%), #2a1e14`;

type Step = "intro" | "q" | "partial" | "capture" | "result";
type Envio = { estado: "no" | "enviando" | "ok" | "error"; error?: string };

/* ── Barra de progreso ───────────────────────────────────── */
function Progress({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="w-full">
      <div className="mb-[10px] flex items-baseline justify-between">
        <p className="text-[12.5px] font-light" style={{ color: "rgba(247,241,229,0.7)" }}>{label}</p>
        <p className="text-[12.5px] font-light" style={{ color: "rgba(247,241,229,0.7)" }}>{Math.round(pct)}%</p>
      </div>
      <div className="relative h-[5px] w-full overflow-visible rounded-full" style={{ background: "rgba(247,241,229,0.12)" }}>
        <motion.div
          className="absolute left-0 top-0 h-[5px] rounded-full"
          style={{ background: "linear-gradient(90deg, #7f8b57 0%, #9aa66f 100%)", boxShadow: "0 0 12px rgba(154,166,111,0.7)" }}
          initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="absolute right-0 top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full" style={{ background: "#cde0a0", boxShadow: "0 0 10px 2px rgba(205,224,160,0.9)" }} />
        </motion.div>
      </div>
    </div>
  );
}

function OliveBtn({ children, onClick, className = "", disabled = false, type = "button" }: {
  children: React.ReactNode; onClick?: () => void; className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  return (
    <motion.button
      type={type} onClick={onClick} disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }} whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`inline-flex items-center justify-center gap-[10px] rounded-full bg-[#7f8b57] px-[28px] py-[15px] text-[15px] font-semibold text-[#f7f1e5] shadow-[0px_16px_32px_-16px_rgba(47,55,30,0.6)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </motion.button>
  );
}

function Atras({ onClick, children = "Anterior" }: { onClick: () => void; children?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="ix-nav mt-[28px] flex items-center gap-[8px] text-[14.7px]" style={{ color: "rgba(247,241,229,0.65)" }}>
      <ChevL /> {children}
    </button>
  );
}

const campoSt = { background: "rgba(247,241,229,0.05)" };
function Field({ label, placeholder, value, onChange, type = "text", error, autoComplete }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string; error?: string; autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-[8px]">
      <span className="text-[13px] font-medium" style={{ color: "rgba(247,241,229,0.85)" }}>{label}</span>
      <input
        type={type} value={value} placeholder={placeholder} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[12px] border border-solid px-[16px] py-[13px] text-[15px] font-normal text-[#f7f1e5] outline-none transition-colors placeholder:text-[rgba(247,241,229,0.4)] focus:border-[#7f8b57]"
        style={{ ...campoSt, borderColor: error ? "#e39a7a" : "rgba(247,241,229,0.18)" }}
      />
      {error && <span className="text-[12px]" style={{ color: "#e39a7a" }}>{error}</span>}
    </label>
  );
}

/** Lo que falta o está mal en el registro. Mismo criterio que el backend. */
function erroresDe(f: Record<string, string>) {
  const e: Record<string, string> = {};
  if (!f.nombre.trim()) e.nombre = "Escribe tu nombre.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.correo.trim())) e.correo = "Revisa tu correo.";
  if ((f.whatsapp.match(/\d/g) ?? []).length < 7) e.whatsapp = "Escribe tu WhatsApp con indicativo.";
  if (!f.pais) e.pais = "Elige tu país.";
  return e;
}

/* ══════════════════════════════════════════════════════════
   El modal
   ══════════════════════════════════════════════════════════ */
export default function DiagnosticoModal({ open, onClose, origen = "portada" }: {
  open: boolean; onClose: () => void;
  /** De dónde se abrió (portada, solicitud de acceso, landing del evento): se guarda con la solicitud. */
  origen?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Respuestas>(vacias);
  const [form, setForm] = useState({ nombre: "", apellido: "", correo: "", whatsapp: "", ciudad: "", pais: "" });
  const [acepta, setAcepta] = useState(false);
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [envio, setEnvio] = useState<Envio>({ estado: "no" });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  // Se reinicia un momento después de cerrar, para que la salida se vea limpia.
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      setStep("intro"); setQIndex(0); setDir(1); setAnswers(vacias());
      setAcepta(false); setIntentoEnvio(false); setEnvio({ estado: "no" });
    }, 300);
    return () => window.clearTimeout(t);
  }, [open]);

  const listo = answers.every((_, i) => completa(answers, i));
  const resultado: Resultado | null = useMemo(() => (listo ? calcular(answers) : null), [answers, listo]);
  const errores = erroresDe(form);

  /* LA PANTALLA VACÍA (prueba del 2-oct-2026)
     Al tocar una opción se espera 260 ms antes de pasar a la siguiente, para
     que se vea marcada. Un segundo toque en ese rato —un doble toque, o
     cambiar de opción rápido— programaba OTRO avance: se saltaba una pregunta,
     quedaba sin responder, y al final la lectura parcial no tenía qué pintar
     (fondo, logo y «Salir»). Peor aún: un toque sobre la pregunta que se
     estaba yendo guardaba la respuesta en la pregunta siguiente.
     Tres cosas lo cierran:
       · `avanzando`: mientras hay un avance en curso, los toques se ignoran;
       · cada toque lleva el número de SU pregunta y se descarta si ya no es la
         que está en pantalla;
       · al llegar al final, si faltara alguna respuesta (no debería), se vuelve
         a esa pregunta en vez de mostrar una pantalla vacía. */
  const avanzando = useRef(false);
  /* Las respuestas al día, para el avance que corre 260 ms después del toque:
     el `answers` de ese momento ya es viejo. */
  const respuestas = useRef<Respuestas>(answers);
  respuestas.current = answers;
  const primeraSinResponder = (r: Respuestas) => r.findIndex((_, i) => !completa(r, i));

  const avanzar = (desde: number) => {
    setDir(1);
    if (desde < N - 1) { setQIndex(desde + 1); return; }
    const falta = primeraSinResponder(respuestas.current);
    if (falta >= 0) { setQIndex(falta); setStep("q"); } else setStep("partial");
  };
  const elegir = (pregunta: number, i: number) => {
    if (avanzando.current || pregunta !== qIndex) return;
    const p = PREGUNTAS[pregunta];
    if (p.multiple) {
      setAnswers((a) => {
        const n = [...a]; const v = (n[pregunta] as number[]) ?? [];
        n[pregunta] = v.includes(i) ? v.filter((x) => x !== i) : [...v, i];
        return n;
      });
      return; // las múltiples avanzan con «Continuar»
    }
    setAnswers((a) => { const n = [...a]; n[pregunta] = i; return n; });
    avanzando.current = true;
    window.setTimeout(() => { avanzar(pregunta); avanzando.current = false; }, 260);
  };
  const atras = () => {
    setDir(-1);
    if (step === "q") { if (qIndex > 0) setQIndex((q) => q - 1); else setStep("intro"); }
    else if (step === "partial") { setQIndex(N - 1); setStep("q"); }
    else if (step === "capture") setStep("partial");
  };

  const enviar = async () => {
    setIntentoEnvio(true);
    if (Object.keys(errores).length || !acepta || !resultado) return;
    setEnvio({ estado: "enviando" });
    try {
      const r = await fetch("/api/diagnostico", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({
          version: VERSION, respuestas: answers, resultado, contacto: form,
          consentimiento: acepta, consentimiento_texto: CONSENTIMIENTO, origen,
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        const det = d?.detail;
        throw new Error(typeof det === "string" ? det : Array.isArray(det) ? String(det[0]?.msg ?? "").replace(/^Value error, /, "") : `Error ${r.status}`);
      }
      setEnvio({ estado: "ok" });
    } catch (e) {
      // El resultado se muestra igual: la persona ya respondió y no debe perderlo.
      setEnvio({ estado: "error", error: (e as Error).message || "No hay conexión." });
    }
    setDir(1); setStep("result");
  };

  if (!mounted) return null;

  const p = PREGUNTAS[qIndex];
  const stepKey = step === "q" ? `q${qIndex}` : step;
  const pct = step === "q" ? ((qIndex + 1) / N) * 100 : 100;
  const slide = { initial: { opacity: 0, x: dir * 44 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: dir * -44 } };
  const per = resultado ? PERFILES[resultado.perfil] : null;
  const sec = resultado ? PERFILES[resultado.secundario] : null;
  const ver = (k: keyof typeof errores) => (intentoEnvio ? errores[k] : undefined);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-label="Diagnóstico del inversionista"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.div className="relative flex size-full flex-col overflow-hidden" style={{ background: BG }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.35, ease: EASE }}>
            <div className="flex shrink-0 items-center justify-between border-b border-solid border-[rgba(247,241,229,0.07)] px-[28px] py-[16px] sm:px-[48px] sm:py-[22px]">
              <img loading="lazy" decoding="async" src={MARK} alt="Zequara" className="h-[28px] w-[30.69px]" />
              <button type="button" onClick={onClose} className="ix-nav flex items-center gap-[6px] text-[13px]" style={{ color: "rgba(247,241,229,0.6)" }}>
                Salir <XIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[24px] pb-[64px] pt-[48px] sm:px-[40px] sm:pt-[72px]">
              <div className="mx-auto w-full max-w-[680px]">
                <AnimatePresence mode="wait" custom={dir}>
                  {/* ── INTRO ── */}
                  {step === "intro" && (
                    <motion.div key="intro" {...slide} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col items-center text-center">
                      <span className="mb-[26px] inline-flex items-center gap-[8px] rounded-full border border-solid px-[18px] py-[9px] text-[12.5px]" style={{ borderColor: "rgba(247,241,229,0.18)", color: "rgba(247,241,229,0.75)" }}>
                        <Clock /> Toma unos 3 minutos
                      </span>
                      <h2 className="text-[clamp(34px,5vw,48px)] font-light leading-[1.1] tracking-[-0.02em] text-[#f7f1e5]">Conoce tu perfil<br />de inversionista.</h2>
                      <p className="mt-[16px] max-w-[520px] text-[15.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>
                        En {N} preguntas identificamos qué estrategia inmobiliaria tiene más sentido para ti —proteger, rentar, renta turística,
                        transformar o buscar oportunidades— y si encaja con el modelo Zequara. Al final queda enviada tu solicitud de acceso.
                      </p>
                      <div className="mt-[26px] flex flex-wrap justify-center gap-[10px]">
                        {["Estrategia sugerida", "Perfil de riesgo", "Tipo de activo", "Zonas sugeridas", "Ruta recomendada"].map((c) => (
                          <span key={c} className="rounded-full border border-solid px-[16px] py-[8px] text-[12.5px]" style={{ borderColor: "rgba(247,241,229,0.18)", color: "rgba(247,241,229,0.7)" }}>{c}</span>
                        ))}
                      </div>
                      <OliveBtn onClick={() => { setDir(1); setStep("q"); setQIndex(0); }} className="mt-[30px]">Empezar <ArrowR /></OliveBtn>
                      <p className="mt-[26px] text-[13px]" style={{ color: "rgba(247,241,229,0.45)" }}>Completarlo no garantiza acceso a oportunidades Zequara.</p>
                    </motion.div>
                  )}

                  {/* ── PREGUNTAS ── */}
                  {step === "q" && (
                    <motion.div key={stepKey} {...slide} transition={{ duration: 0.42, ease: EASE }}>
                      <Progress pct={pct} label={`Pregunta ${qIndex + 1} de ${N}`} />
                      <p className="mt-[40px] text-[11.84px] font-bold uppercase tracking-[2.368px] text-[#c9a877]">Pregunta {String(qIndex + 1).padStart(2, "0")}</p>
                      <h3 className="mt-[16px] max-w-[520px] text-[28.6px] font-light leading-[1.35] tracking-[-0.704px] text-[#f7f1e5]">{p.q}</h3>
                      {p.ayuda && <p className="mt-[10px] max-w-[520px] text-[13.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.55)" }}>{p.ayuda}</p>}
                      <div className="mt-[28px] flex flex-col gap-[12px]">
                        {p.opciones.map((opt, i) => {
                          const v = answers[qIndex];
                          const active = Array.isArray(v) ? v.includes(i) : v === i;
                          return (
                            <motion.button key={opt.t} type="button" onClick={() => elegir(qIndex, i)} aria-pressed={active}
                              whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}
                              className="flex min-h-[70px] items-center gap-[16px] rounded-[15px] border border-solid px-[22px] py-[12px] text-left transition-colors"
                              style={{ background: active ? "rgba(127,139,87,0.22)" : "rgba(247,241,229,0.04)", borderColor: active ? "#7f8b57" : "rgba(247,241,229,0.18)" }}>
                              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] border border-solid text-[13.6px] font-bold transition-colors"
                                style={{ borderColor: active ? "#7f8b57" : "rgba(247,241,229,0.18)", background: active ? "#7f8b57" : "transparent", color: active ? "#f7f1e5" : "#c9a877" }}>
                                {p.multiple ? (active ? <Check /> : LETTERS[i]) : LETTERS[i]}
                              </span>
                              <span className="flex flex-col">
                                <span className="text-[16.3px] font-normal text-[#f7f1e5]">{opt.t}</span>
                                {opt.sub && <span className="text-[12.5px] font-light" style={{ color: "rgba(247,241,229,0.55)" }}>{opt.sub}</span>}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                      {p.multiple && (
                        <OliveBtn onClick={() => avanzar(qIndex)} disabled={!completa(answers, qIndex)} className="mt-[22px]">Continuar <ArrowR /></OliveBtn>
                      )}
                      <Atras onClick={atras} />
                    </motion.div>
                  )}

                  {/* Nunca una pantalla vacía: si en un paso posterior faltara una
                      respuesta, se ofrece volver a ella. */}
                  {step !== "intro" && step !== "q" && !resultado && (
                    <motion.div key="falta" {...slide} transition={{ duration: 0.4, ease: EASE }} className="flex flex-col items-center text-center">
                      <h3 className="text-[clamp(24px,3.6vw,30px)] font-light text-[#f7f1e5]">Falta una respuesta.</h3>
                      <p className="mt-[12px] text-[15px] font-light" style={{ color: "rgba(247,241,229,0.7)" }}>
                        Para darte tu resultado necesitamos que respondas la pregunta {primeraSinResponder(answers) + 1}.
                      </p>
                      <OliveBtn onClick={() => { setDir(-1); setQIndex(Math.max(0, primeraSinResponder(answers))); setStep("q"); }} className="mt-[24px]">
                        Ir a la pregunta <ArrowR />
                      </OliveBtn>
                    </motion.div>
                  )}

                  {/* ── LECTURA PARCIAL (ya con el resultado real) ── */}
                  {step === "partial" && resultado && per && (
                    <motion.div key="partial" {...slide} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col items-center text-center">
                      <div className="w-full"><Progress pct={100} label="Diagnóstico completado" /></div>
                      {/* La compatibilidad (0–100) NO se muestra: es un dato interno del equipo
                          para priorizar y analizar (decisión del 2-oct-2026). Se sigue calculando y
                          se guarda con la solicitud (columna `compatibilidad`). */}
                      <h3 className="mt-[44px] text-[clamp(26px,4vw,34px)] font-light tracking-[-0.02em] text-[#f7f1e5]">Ya tenemos una lectura inicial de tu perfil.</h3>
                      <div className="mt-[34px] w-full max-w-[560px] rounded-[18px] border border-solid p-[8px]" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.14)" }}>
                        {([
                          ["Estrategia sugerida", per.nombre, false],
                          ["Perfil de riesgo", resultado.riesgo, false],
                          ["Tipo de activo recomendado", per.tipo, true],
                          ["Zonas sugeridas", `${resultado.zonas.length} zonas`, true],
                        ] as const).map(([k, v, blur]) => (
                          <div key={k} className="flex items-center justify-between gap-[16px] border-b border-solid px-[22px] py-[16px] last:border-0" style={{ borderColor: "rgba(247,241,229,0.08)" }}>
                            <span className="text-left text-[14px]" style={{ color: "rgba(247,241,229,0.6)", filter: blur ? "blur(4px)" : "none" }}>{k}</span>
                            <span className="text-right text-[14px] font-semibold text-[#c9a877]" style={{ filter: blur ? "blur(4px)" : "none" }}>{v}</span>
                          </div>
                        ))}
                        <p className="px-[22px] py-[12px] text-[12.5px]" style={{ color: "rgba(247,241,229,0.5)" }}>Escribe tus datos y agenda una cita con nuestro equipo: en ella revisamos contigo tu diagnóstico completo y las oportunidades que encajan con tu perfil.</p>
                      </div>
                      <OliveBtn onClick={() => { setDir(1); setStep("capture"); }} className="mt-[28px] w-full max-w-[560px]">Quiero agendar mi cita <ArrowR /></OliveBtn>
                      <Atras onClick={atras}>Cambiar mis respuestas</Atras>
                    </motion.div>
                  )}

                  {/* ── REGISTRO (es la solicitud de acceso) ── */}
                  {step === "capture" && (
                    <motion.div key="capture" {...slide} transition={{ duration: 0.5, ease: EASE }} className="w-full">
                      <Progress pct={100} label="Último paso" />
                      <form className="mt-[26px] rounded-[18px] border border-solid p-[clamp(20px,4vw,40px)]" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.14)" }}
                        onSubmit={(e) => { e.preventDefault(); enviar(); }} noValidate>
                        <h3 className="text-[clamp(24px,3.5vw,30px)] font-light tracking-[-0.02em] text-[#f7f1e5]">Agenda tu cita con Zequara.</h3>
                        <p className="mt-[10px] text-[14px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>
                          Escribe tus datos y te contactamos para agendar una cita virtual en la que conoces más sobre Zequara, revisamos tu perfil
                          y te mostramos las oportunidades que encajan contigo. Al enviarlos verás tu diagnóstico completo.
                        </p>
                        <div className="mt-[22px] grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                          <Field label="Nombre" placeholder="Tu nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} error={ver("nombre")} autoComplete="given-name" />
                          <Field label="Apellido" placeholder="Tu apellido" value={form.apellido} onChange={(v) => setForm({ ...form, apellido: v })} autoComplete="family-name" />
                          <Field label="Correo electrónico" placeholder="nombre@correo.com" type="email" value={form.correo} onChange={(v) => setForm({ ...form, correo: v })} error={ver("correo")} autoComplete="email" />
                          <Field label="WhatsApp" placeholder="+57 300 000 0000" type="tel" value={form.whatsapp} onChange={(v) => setForm({ ...form, whatsapp: v })} error={ver("whatsapp")} autoComplete="tel" />
                          <Field label="Ciudad" placeholder="Ciudad de residencia" value={form.ciudad} onChange={(v) => setForm({ ...form, ciudad: v })} autoComplete="address-level2" />
                          <label className="flex flex-col gap-[8px]">
                            <span className="text-[13px] font-medium" style={{ color: "rgba(247,241,229,0.85)" }}>País de residencia</span>
                            <select value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}
                              className="rounded-[12px] border border-solid px-[14px] py-[13px] text-[15px] text-[#f7f1e5] outline-none focus:border-[#7f8b57]"
                              style={{ ...campoSt, borderColor: ver("pais") ? "#e39a7a" : "rgba(247,241,229,0.18)" }}>
                              <option value="" style={{ color: "#2a1e14" }}>Selecciona un país</option>
                              {PAISES.map((x) => <option key={x} value={x} style={{ color: "#2a1e14" }}>{x}</option>)}
                            </select>
                            {ver("pais") && <span className="text-[12px]" style={{ color: "#e39a7a" }}>{ver("pais")}</span>}
                          </label>
                        </div>
                        <p className="mt-[18px] text-[12px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>{AVISO_SOLICITUD}</p>
                        <label className="mt-[12px] flex cursor-pointer items-start gap-[11px]">
                          <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className="mt-[3px] size-[18px] shrink-0" style={{ accentColor: "#7f8b57" }} />
                          <span className="text-[12.5px] leading-[1.5]" style={{ color: intentoEnvio && !acepta ? "#e39a7a" : "rgba(247,241,229,0.65)" }}>
                            {AUTORIZACION.solicitud} <EnlacePolitica className="text-[#f7f1e5]" />.
                          </span>
                        </label>
                        <OliveBtn type="submit" disabled={envio.estado === "enviando"} className="mt-[22px] w-full">
                          {envio.estado === "enviando" ? "Enviando…" : <>Enviar mis datos y agendar mi cita <ArrowR /></>}
                        </OliveBtn>
                      </form>
                      <Atras onClick={atras} />
                    </motion.div>
                  )}

                  {/* ── RESULTADO COMPLETO ── */}
                  {step === "result" && resultado && per && sec && (
                    <motion.div key="result" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: EASE }} className="flex flex-col items-center pt-[20px] text-center">
                      {envio.estado === "ok" ? (
                        <p className="mb-[22px] w-full rounded-[12px] px-[16px] py-[12px] text-[13.5px]" style={{ background: "rgba(127,139,87,0.2)", color: "#e6ecd2" }}>
                          ✓ Recibimos tus datos. Te escribiremos al correo o al WhatsApp que dejaste para agendar tu cita.
                        </p>
                      ) : (
                        <p className="mb-[22px] w-full rounded-[12px] px-[16px] py-[12px] text-[13.5px]" style={{ background: "rgba(227,154,122,0.15)", color: "#f2c9b6" }}>
                          No pudimos enviar tu solicitud ({envio.error}). Tu diagnóstico está abajo.{" "}
                          <button type="button" onClick={enviar} className="underline">Reintentar el envío</button>
                        </p>
                      )}
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[#c9a877]">— Tu diagnóstico de inversionista</p>
                      <h2 className="mt-[14px] text-[clamp(30px,5vw,44px)] font-extrabold text-[#f7f1e5]">{per.nombre}</h2>
                      <p className="mt-[6px] text-[12px] uppercase tracking-[0.15em]" style={{ color: "rgba(247,241,229,0.5)" }}>{per.equivale}{resultado.internacional ? " · con diversificación internacional" : ""}</p>
                      <p className="mt-[12px] max-w-[520px] text-[15px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>{per.frase}</p>

                      <div className="mt-[34px] grid w-full grid-cols-1 gap-[16px] sm:grid-cols-3">
                        {[
                          { icon: <Check />, tag: "Perfil de riesgo", title: resultado.riesgo, desc: RIESGO_TXT[resultado.riesgo] },
                          { icon: <Home />, tag: "Tipo de activo", title: per.tipo, desc: per.activo },
                          { icon: <Spark />, tag: "Estrategia secundaria", title: sec.nombre, desc: sec.frase },
                        ].map((c, i) => (
                          <motion.div key={c.tag} initial={{ y: 22 }} animate={{ y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5, ease: EASE }}
                            className="flex flex-col rounded-[16px] border border-solid p-[22px] text-left" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.12)" }}>
                            <span className="flex size-[38px] items-center justify-center rounded-[10px] text-[#9aa66f]" style={{ background: "rgba(127,139,87,0.15)" }}>{c.icon}</span>
                            <p className="mt-[16px] text-[10.5px] uppercase tracking-[0.15em]" style={{ color: "rgba(247,241,229,0.5)" }}>{c.tag}</p>
                            <p className="mt-[6px] text-[19px] font-bold leading-[1.2] text-[#f7f1e5]">{c.title}</p>
                            <p className="mt-[10px] text-[13px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.65)" }}>{c.desc}</p>
                          </motion.div>
                        ))}
                      </div>

                      {resultado.zonas.length > 0 && (
                        <div className="mt-[16px] w-full rounded-[16px] border border-solid p-[22px] text-left" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.12)" }}>
                          <p className="text-[15px] font-bold text-[#f7f1e5]">Zonas Zequara que encajan contigo</p>
                          <div className="mt-[12px] flex flex-wrap gap-[8px]">
                            {resultado.zonas.map((z) => <span key={z} className="rounded-full border border-solid px-[14px] py-[7px] text-[12.5px]" style={{ borderColor: "rgba(247,241,229,0.18)", color: "rgba(247,241,229,0.8)" }}>{z}</span>)}
                          </div>
                        </div>
                      )}

                      <div className="mt-[16px] w-full rounded-[16px] border border-solid p-[26px] text-left" style={{ background: "rgba(247,241,229,0.03)", borderColor: "rgba(247,241,229,0.12)" }}>
                        <p className="flex items-center gap-[8px] text-[15px] font-bold text-[#f7f1e5]"><span className="text-[#9aa66f]"><Loop /></span> Tu ruta inicial</p>
                        <div className="mt-[16px] flex flex-col gap-[12px]">
                          {per.ruta.map((s, i) => (
                            <motion.div key={s} initial={{ x: -12 }} animate={{ x: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }} className="flex items-center gap-[14px]">
                              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full border border-solid text-[12px] text-[#c9a877]" style={{ borderColor: "rgba(201,168,119,0.4)" }}>{i + 1}</span>
                              <span className="text-[14px]" style={{ color: "rgba(247,241,229,0.8)" }}>{s}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-[16px] w-full overflow-hidden rounded-[20px] p-[32px]" style={{ background: resultado.afinidad === "Baja" ? "rgba(247,241,229,0.06)" : "linear-gradient(160deg, #7f8b57 0%, #5f6b3e 100%)" }}>
                        <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(247,241,229,0.75)" }}>Tu encaje con Zequara</p>
                        <h3 className="mt-[10px] text-[clamp(22px,3.6vw,28px)] font-light text-[#f7f1e5]">
                          {resultado.afinidad === "Alta" ? "Tu perfil se alinea con el modelo Zequara."
                            : resultado.afinidad === "Media" ? "Tu perfil tiene puntos en común con el modelo Zequara."
                              : "Por ahora tu perfil no encaja del todo con el modelo Zequara."}
                        </h3>
                        {resultado.motivos.length > 0 && (
                          <ul className="mx-auto mt-[12px] max-w-[480px] list-none space-y-[6px] p-0 text-[13.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.85)" }}>
                            {resultado.motivos.map((m) => <li key={m}>{m}</li>)}
                          </ul>
                        )}
                        <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          className="mt-[22px] inline-flex items-center justify-center gap-[10px] rounded-full bg-[#f7f1e5] px-[30px] py-[15px] text-[15px] font-bold text-[#2a1e14] shadow-[0px_10px_24px_-10px_rgba(0,0,0,0.5)]">
                          Volver a Zequara <ArrowR />
                        </motion.button>
                      </div>

                      <p className="mt-[24px] max-w-[520px] text-[11.5px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.4)" }}>
                        Esta lectura es orientativa y no constituye asesoría financiera ni una promesa de acceso a oportunidades. Zequara opera bajo un modelo de acceso cerrado.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
