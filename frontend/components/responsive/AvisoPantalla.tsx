"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MARK } from "@/components/brand";
import { useVistaEscritorio } from "@/components/responsive/vistaEscritorio";

/* ═══════════════════════════════════════════════════════════════════════════
   AVISO DE PANTALLA — al entrar al panel desde un móvil.

   El panel son diez pantallas de tablas, cronogramas y gráficas de obra:
   información pensada para leerse a lo ancho. En vez de rehacerla en columna y
   perder la comparación entre filas, se avisa y se dan las dos salidas reales:
   cambiar a la vista de escritorio aquí mismo, o seguir en el móvil.

   Se muestra una sola vez por sesión —`sessionStorage`, no `localStorage`: si
   alguien vuelve mañana desde el móvil, el aviso sigue siendo útil— y sólo por
   debajo de 1024, que es donde una tabla de obra deja de caber.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;
const CLAVE = "zq:aviso-panel";
const CORTE = 1024;

const LINEN = "#f7f1e5";
const CREAM = "#e2cdae";
const BROWN = "#492100";
const LASER = "#c9a877";

export default function AvisoPantalla() {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const { cambiar } = useVistaEscritorio();

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (window.innerWidth >= CORTE) return;
    try {
      if (window.sessionStorage.getItem(CLAVE) === "visto") return;
    } catch { /* sin sessionStorage se muestra igual */ }
    setAbierto(true);
  }, []);

  const cerrar = () => {
    setAbierto(false);
    try { window.sessionStorage.setItem(CLAVE, "visto"); } catch { /* da igual */ }
  };

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cerrar(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  if (!montado) return null;

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center p-[20px]"
          role="dialog" aria-modal="true" aria-labelledby="aviso-pantalla-titulo"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div className="absolute inset-0 bg-black/72" aria-hidden onClick={cerrar} />

          <motion.div
            className="relative w-full max-w-[400px] overflow-hidden rounded-[26px] px-[26px] pb-[26px] pt-[34px] text-center"
            style={{ background: BROWN, border: "1px solid rgba(201,168,119,0.28)" }}
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <motion.span
              className="mx-auto block size-[54px]"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            >
              <img src={MARK} alt="Zequara" decoding="async" className="block size-full max-w-none" />
            </motion.span>

            <p className="mt-[18px] text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: LASER }}>
              Tu plataforma
            </p>

            <h2 id="aviso-pantalla-titulo" className="mt-[10px] text-[clamp(1.35rem,6.2vw,1.7rem)] font-light leading-[1.2]" style={{ color: LINEN }}>
              Esta sección se aprecia mejor en <span className="font-semibold">pantalla grande.</span>
            </h2>

            <p className="mx-auto mt-[14px] max-w-[320px] text-[14.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.78)" }}>
              El seguimiento de tu obra reúne cronogramas, presupuestos y comparativas
              pensados para leerse a lo ancho. Desde un computador verás cada cifra en su
              contexto y podrás revisar los documentos con comodidad.
            </p>

            <div className="mt-[24px] flex flex-col gap-[10px]">
              <button
                type="button"
                onClick={() => { cambiar(true); cerrar(); }}
                className="ix-press flex h-[54px] items-center justify-center gap-[9px] rounded-full text-[15.5px] font-semibold"
                style={{ background: CREAM, color: BROWN }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2.5" y="4" width="19" height="13" rx="2" /><path d="M8 20h8M12 17v3" />
                </svg>
                Ver en vista de escritorio
              </button>

              <button
                type="button"
                onClick={cerrar}
                className="ix-press flex h-[52px] items-center justify-center rounded-full border border-solid text-[15px] font-medium"
                style={{ borderColor: "rgba(247,241,229,0.22)", color: LINEN }}
              >
                Continuar en el móvil
              </button>
            </div>

            <p className="mt-[16px] text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>
              La vista de escritorio muestra la plataforma completa; puedes ampliar con los
              dedos y volver al móvil cuando quieras.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
