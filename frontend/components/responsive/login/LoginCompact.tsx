"use client";

import { MotionConfig, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORDMARK, wordmarkH } from "@/components/brand";
import { EASE, LASER, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN — vista fluida para móvil y tablet (por debajo de 1280).

   El lienzo son dos columnas de 1008 y 912 sobre 1920 × 1045: la foto y el
   formulario. Aquí la foto pasa a ser una banda corta arriba con el reclamo
   encima, y el formulario ocupa el ancho. No lleva la nav de móvil a
   propósito: es una pantalla de entrada y el menú sólo invita a irse.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

const INPUT = "h-[58px] w-full rounded-[13px] border border-solid pl-[48px] pr-[16px] text-[16px] outline-none";
const INPUT_ST = { background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)", color: "#f7f1e5" } as const;
const LABEL = "mb-[8px] block text-[13px] font-medium tracking-[0.5px]";
const LABEL_ST = { color: "rgba(247,241,229,0.85)" } as const;

function UserIcon() {
  return (<svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></svg>);
}
function KeyIcon() {
  return (<svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>);
}
function LockIcon() {
  return (<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
}

export default function LoginCompact() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  /** Todavía no hay backend: el prototipo entra directo al área privada. */
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!usuario.trim() || !clave) return;
    router.push("/predios");
  };

  const wm = 170;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen" style={{ background: "#2a1e14" }}>
        {/* Banda de la foto con el reclamo, que en escritorio es la columna
            izquierda entera. */}
        <section className="relative overflow-hidden">
          <img
            src={`${A}/1d104ea194ca7ae5b0f84b1328433a3a584b589f.webp`} alt="" loading="eager" decoding="async"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-55"
          />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(42,30,20,0.55) 0%, rgba(42,30,20,0.95) 100%)" }} />
          <div className={`${WRAP} relative pb-[34px] pt-[34px]`}>
            <motion.a
              href="/" aria-label="Zequara — Inicio" className="block"
              style={{ width: wm, height: wordmarkH(wm) }}
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
            >
              <img src={WORDMARK} alt="Zequara" decoding="async" className="block size-full max-w-none" />
            </motion.a>
            <motion.p
              className="mt-[26px] text-[clamp(1.5rem,7vw,2.2rem)] font-light leading-[1.15] text-cream-93"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.08, ease: EASE }}
            >
              El acceso a Zequara <span className="font-semibold">es selectivo.</span>
            </motion.p>
            <motion.p
              className="mt-[14px] text-[15.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.75)" }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.14, ease: EASE }}
            >
              Cada operación pasa por un criterio técnico de veinte años. Entra para ver las oportunidades disponibles hoy.
            </motion.p>
          </div>
        </section>

        {/* Formulario */}
        <section className={`${WRAP} pb-[56px] pt-[38px]`}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.14, ease: EASE }}>
            <div className="flex items-center gap-[12px]">
              <span className="block h-px w-[28px] opacity-80" style={{ background: LASER }} />
              <span className="text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: LASER }}>Acceso inversionistas</span>
            </div>

            <h1 className="mt-[14px] text-[clamp(1.9rem,8vw,2.7rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-cream-93">
              Bienvenido de vuelta.
            </h1>
            <p className="mt-[12px] text-[15.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.72)" }}>
              Ingresa el usuario y contraseña que fueron enviados a tu correo electrónico.
            </p>

            <form className="mt-[28px]" onSubmit={submit}>
              <label className={LABEL} style={LABEL_ST} htmlFor="lc-user">Nombre de usuario</label>
              <div className="relative">
                <span className="absolute left-[16px] top-1/2 -translate-y-1/2" style={{ color: "rgba(247,241,229,0.45)" }}><UserIcon /></span>
                <input
                  id="lc-user" type="text" autoComplete="username" placeholder="@usuario"
                  value={usuario} onChange={(e) => setUsuario(e.target.value)}
                  className={`ix-field ${INPUT} placeholder:text-[rgba(247,241,229,0.45)]`} style={INPUT_ST}
                />
              </div>

              <label className={`${LABEL} mt-[18px]`} style={LABEL_ST} htmlFor="lc-pass">Contraseña</label>
              <div className="relative">
                <span className="absolute left-[16px] top-1/2 -translate-y-1/2" style={{ color: "rgba(247,241,229,0.45)" }}><KeyIcon /></span>
                <input
                  id="lc-pass" type="password" autoComplete="current-password" placeholder="••••••••••••"
                  value={clave} onChange={(e) => setClave(e.target.value)}
                  className={`ix-field ${INPUT} placeholder:text-[rgba(247,241,229,0.45)]`} style={INPUT_ST}
                />
              </div>

              <button type="submit" className="ix-press mt-[24px] flex h-[58px] w-full items-center justify-center gap-[10px] rounded-full text-[16px] font-semibold" style={{ background: "#687540", color: "#f7f1e5" }}>
                Ingresar
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </form>

            <div className="mt-[28px] flex items-center gap-[14px]">
              <span className="h-px flex-1" style={{ background: "rgba(247,241,229,0.18)" }} />
              <span className="text-[12.5px]" style={{ color: "rgba(247,241,229,0.4)" }}>¿Aún no tienes acceso?</span>
              <span className="h-px flex-1" style={{ background: "rgba(247,241,229,0.18)" }} />
            </div>

            <a href="/solicitud-acceso" className="ix-press mt-[18px] flex h-[56px] w-full items-center justify-center rounded-full border border-solid text-[15px] font-medium text-cream-93" style={{ borderColor: "rgba(247,241,229,0.18)" }}>
              Solicitar acceso a Zequara
            </a>

            <div className="mt-[26px] flex flex-col items-center gap-[3px] text-center" style={{ color: "rgba(247,241,229,0.5)" }}>
              <span className="flex items-center gap-[6px] text-[13px] font-light"><LockIcon />Acceso cerrado y verificado.</span>
              <span className="text-[13px] font-light">Solo inversionistas aprobados pueden ver las oportunidades.</span>
            </div>
          </motion.div>
        </section>
      </div>
    </MotionConfig>
  );
}
