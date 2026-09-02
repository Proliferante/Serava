"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { WORDMARK, wordmarkH } from "@/components/brand";
import { useSesion } from "@/components/admin/sesion";
import { EASE, LASER } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   ACCESO A LA CONSOLA INTERNA.

   Autentica de verdad contra `POST /api/auth/login`: el backend comprueba el
   hash bcrypt y devuelve un token de sesión con el rol dentro. Ya no entra
   cualquiera con cualquier cosa, como la primera versión de esta pantalla.

   El lenguaje visual es el del acceso de inversionistas
   (`sections/login/LoginScreen.tsx` y su versión fluida): marrón de la
   marca, wordmark arriba, antetítulo dorado con su filete y los dos campos
   con icono. No es una columna de 1920 escalada como el resto del sitio,
   sino una pantalla fluida con `clamp()` que sirve igual a 390 y a 1920 —la
   consola tampoco es un lienzo fijo, así que no había nada que emparejar—.

   El error que llega del servidor se muestra tal cual, y es a propósito el
   mismo para "no existe ese correo" y "contraseña equivocada": distinguirlos
   le diría a cualquiera qué correos tienen cuenta.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINEN = "#f7f1e5";
const BROWN = "#2a1e14";

const CAJA = "h-[56px] w-full rounded-[13px] border border-solid pl-[46px] pr-[16px] text-[16px] outline-none";
const CAJA_ST = { background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)", color: LINEN } as const;
const ETIQUETA = "mb-[8px] block text-[13px] font-medium tracking-[0.5px]";
const ETIQUETA_ST = { color: "rgba(247,241,229,0.85)" } as const;

const trazo = {
  fill: "none", stroke: "currentColor", strokeWidth: 1.8,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const IcoUser = () => <svg width={19} height={19} viewBox="0 0 24 24" {...trazo} aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></svg>;
const IcoKey = () => <svg width={19} height={19} viewBox="0 0 24 24" {...trazo} aria-hidden><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
const IcoLock = () => <svg width={13} height={13} viewBox="0 0 24 24" {...trazo} strokeWidth={2} aria-hidden><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;

export default function AdminLogin() {
  const { entrar } = useSesion();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !clave) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await entrar(correo, clave);
      /* No hace falta navegar: al quedar la sesión puesta, `AdminGate`
         cambia solo de pantalla. */
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const wm = 190;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen items-center justify-center px-[24px] py-[48px]" style={{ background: BROWN }}>
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <a href="/" aria-label="Zequara — Inicio" className="ix-nav mx-auto block" style={{ width: wm, height: wordmarkH(wm) }}>
            <img src={WORDMARK} alt="Zequara" decoding="async" className="block size-full max-w-none" />
          </a>

          <div
            className="mt-[34px] rounded-[22px] p-[26px] sm:p-[32px]"
            style={{ background: "rgba(247,241,229,0.04)", border: "1px solid rgba(247,241,229,0.12)" }}
          >
            <div className="flex items-center gap-[12px]">
              <span className="block h-px w-[28px] opacity-80" style={{ background: LASER }} />
              <span className="text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: LASER }}>Consola interna</span>
            </div>

            <h1 className="mt-[14px] text-[clamp(1.6rem,6.4vw,2.1rem)] font-light leading-[1.14] tracking-[-0.02em]" style={{ color: LINEN }}>
              Acceso del <span className="font-semibold">equipo.</span>
            </h1>
            <p className="mt-[12px] text-[15px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.72)" }}>
              Esta es la herramienta de operación de ZEQUARA: flujo de inmuebles, extracción,
              comité y seguimiento. No es el portal de inversionistas.
            </p>

            <form className="mt-[26px]" onSubmit={enviar} noValidate>
              <label className={ETIQUETA} style={ETIQUETA_ST} htmlFor="ad-user">Correo</label>
              <div className="relative">
                <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "rgba(247,241,229,0.45)" }}><IcoUser /></span>
                <input
                  id="ad-user" type="email" autoComplete="username" placeholder="persona@zequara.com"
                  value={correo} onChange={(e) => setCorreo(e.target.value)} disabled={enviando}
                  className={`ix-field ${CAJA} placeholder:text-[rgba(247,241,229,0.42)]`} style={CAJA_ST}
                />
              </div>

              <label className={`${ETIQUETA} mt-[18px]`} style={ETIQUETA_ST} htmlFor="ad-pass">Contraseña</label>
              <div className="relative">
                <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "rgba(247,241,229,0.45)" }}><IcoKey /></span>
                <input
                  id="ad-pass" type="password" autoComplete="current-password" placeholder="••••••••••••"
                  value={clave} onChange={(e) => setClave(e.target.value)} disabled={enviando}
                  className={`ix-field ${CAJA} placeholder:text-[rgba(247,241,229,0.42)]`} style={CAJA_ST}
                />
              </div>

              {error && (
                <p role="alert" className="mt-[12px] text-[13.5px] font-medium" style={{ color: "#e39c82" }}>{error}</p>
              )}

              <button
                type="submit" disabled={enviando}
                className="ix-press mt-[22px] flex h-[56px] w-full items-center justify-center gap-[10px] rounded-full text-[16px] font-semibold disabled:opacity-60"
                style={{ background: "#7f8b57", color: LINEN }}
              >
                {enviando ? "Entrando…" : "Entrar a la consola"}
                {!enviando && (
                  <svg width={18} height={18} viewBox="0 0 24 24" {...trazo} strokeWidth={2} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                )}
              </button>
            </form>

            <div className="mt-[22px] flex items-start gap-[8px] text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>
              <span className="mt-[3px] shrink-0"><IcoLock /></span>
              <span>
                Acceso restringido al equipo de ZEQUARA. Las cuentas las crea un administrador;
                cada entrada y cada decisión quedan registradas.
              </span>
            </div>
          </div>

          <a
            href="/login"
            className="ix-nav mx-auto mt-[20px] block text-center text-[13.5px] font-medium"
            style={{ color: "rgba(247,241,229,0.55)" }}
          >
            ¿Eres inversionista? Entra por aquí
          </a>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
