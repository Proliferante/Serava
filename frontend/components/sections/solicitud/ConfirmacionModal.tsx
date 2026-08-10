"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmacionContenido, { CARD, CARD_CONT, CONF_H, CONF_W } from "@/components/sections/solicitud/ConfirmacionContenido";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRMACIÓN EN MODAL — la misma tarjeta de /solicitud-acceso/confirmacion
   (358:1108 + contenedor 311:4982), pero encima del formulario en vez de en
   una página aparte. La ruta sigue existiendo y sirve la versión completa.

   La tarjeta se dibuja a su tamaño de diseño (662 × 888) y se escala entera
   para caber en el viewport, como hace <ScaledCanvas> con las páginas; aquí
   además se mide el alto, porque 888 px no entran en una pantalla de portátil.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;
const BROWN = "#492100";
const LINEN = "#f7f1e5";

/** Aire mínimo entre la tarjeta y el borde de la ventana. */
const MARGEN = 24;

export default function ConfirmacionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [escala, setEscala] = useState(1);

  useEffect(() => setMounted(true), []);

  const ajustar = useCallback(() => {
    setEscala(Math.min(1, (window.innerWidth - MARGEN * 2) / CARD.w, (window.innerHeight - MARGEN * 2) / CARD.h));
  }, []);

  useEffect(() => {
    if (!open) return;
    ajustar();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("resize", ajustar);
    window.addEventListener("keydown", onKey);
    // Bloquea el scroll del formulario que queda detrás.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", ajustar);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, ajustar]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center"
          role="dialog" aria-modal="true" aria-label="Perfil recibido"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          <div className="absolute inset-0 bg-black/70" aria-hidden onClick={onClose} />

          {/* Por debajo de 1280 la tarjeta no se escala sino que se rehace
              fluida: a 390 px el factor sería 0.52 y el cuerpo de 20 px
              acabaría en 10. Mismo contenido, tamaños propios. */}
          <motion.div
            className="relative w-[min(420px,92vw)] rounded-[32px] px-[26px] py-[38px] text-center xl:hidden"
            style={{ background: BROWN, boxShadow: "0 0 0 10px rgba(226,205,174,0.9)" }}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <span className="mx-auto flex size-[68px] items-center justify-center rounded-full" style={{ background: "rgba(127,139,87,0.2)" }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#9aa66f" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            <p className="mt-[18px] text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: "#c9a877" }}>Perfil recibido</p>
            <h2 className="mt-[10px] text-[clamp(1.6rem,7.4vw,2.1rem)] font-light leading-[1.15]" style={{ color: LINEN }}>
              Recibimos tu <span className="font-semibold">perfil.</span>
            </h2>
            <p className="mt-[14px] text-[15.5px] font-medium leading-[1.45]" style={{ color: "rgba(247,241,229,0.82)" }}>
              El equipo Zequara revisará tu información y se comunicará contigo para coordinar una <span style={{ color: LINEN }}>sesión virtual de conocimiento mutuo.</span>
            </p>
            <p className="mt-[12px] text-[14px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.7)" }}>
              Después de esa conversación confirmaremos si avanzamos con el acceso al portafolio privado.
            </p>
            <a href="/" className="ix-press mt-[24px] flex h-[54px] w-full items-center justify-center rounded-full text-[15.5px] font-semibold" style={{ background: LINEN, color: "#2a1e14" }}>
              Volver al inicio
            </a>
            <p className="mt-[16px] text-[12.5px] font-medium leading-[1.45]" style={{ color: "#e2cdae" }}>
              Portafolio privado. Acceso sujeto a evaluación, sesión virtual y disponibilidad.
            </p>
          </motion.div>

          {/* La caja exterior reserva el sitio ya escalado, para que el flex la
              centre bien; la de dentro va al tamaño del diseño y se encoge. */}
          <motion.div
            className="relative hidden xl:block"
            style={{ width: CARD.w * escala, height: CARD.h * escala }}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div
              className="absolute left-0 top-0"
              style={{
                width: CARD.w, height: CARD.h, background: BROWN,
                borderRadius: CARD.radius, boxShadow: CARD.halo,
                transform: `scale(${escala})`, transformOrigin: "top left",
              }}
            >
              <div className="absolute" style={{ left: CARD_CONT.x, top: CARD_CONT.y, width: CONF_W, height: CONF_H }}>
                <ConfirmacionContenido />
              </div>
            </div>
          </motion.div>

          <button
            type="button" onClick={onClose} aria-label="Cerrar"
            className="ix-nav absolute right-[24px] top-[24px] flex size-[44px] items-center justify-center rounded-full"
            style={{ background: "rgba(247,241,229,0.12)", color: LINEN }}
          >
            <svg viewBox="0 0 24 24" className="size-[20px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
