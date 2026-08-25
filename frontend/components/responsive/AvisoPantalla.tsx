"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MARK } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   AVISO DE PANTALLA — al entrar a un área de trabajo desde un móvil.

   Es sólo un aviso: no cambia ninguna configuración. Las pantallas ya están
   adaptadas a la columna, así que aquí no hay nada que arreglar; lo que se
   dice es que en un computador se ve todo de un vistazo —tablas y cronogramas
   lado a lado— y que apilado hay que desplazarse más.

   Antes ofrecía cambiar a la vista de escritorio. Se quitó porque esa opción
   guardaba una preferencia que después seguía al usuario a otras pantallas, y
   porque con las vistas fluidas terminadas ya no hace falta.

   Se muestra una sola vez por sesión —`sessionStorage`, no `localStorage`: si
   alguien vuelve mañana desde el móvil, el aviso sigue siendo útil— y sólo por
   debajo de 1024, que es donde la vista de escritorio deja de caber.

   El texto entra por props porque lo usan dos áreas: el panel del inversionista
   y la consola interna del equipo. Cada una lleva su propia `clave` de
   `sessionStorage`: haber visto uno no debe callar el otro, son dos entradas
   distintas y con contenido distinto.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;
const CORTE = 1024;

const LINEN = "#f7f1e5";
const CREAM = "#e2cdae";
const BROWN = "#492100";
const LASER = "#c9a877";

export default function AvisoPantalla({
  clave = "zq:aviso-panel",
  eyebrow = "Tu plataforma",
  titulo = <>Tienes el panel completo, <span className="font-semibold">también aquí.</span></>,
  boton = "Entendido, sigo aquí",
  children,
}: {
  /** Clave de `sessionStorage`. Una por área, para que no se tapen entre sí. */
  clave?: string;
  eyebrow?: string;
  titulo?: ReactNode;
  boton?: string;
  /** El cuerpo del aviso. Sin él va el del panel del inversionista. */
  children?: ReactNode;
} = {}) {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (window.innerWidth >= CORTE) return;
    try {
      if (window.sessionStorage.getItem(clave) === "visto") return;
    } catch { /* sin sessionStorage se muestra igual */ }
    setAbierto(true);
  }, [clave]);

  const cerrar = () => {
    setAbierto(false);
    try { window.sessionStorage.setItem(clave, "visto"); } catch { /* da igual */ }
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
              {eyebrow}
            </p>

            <h2 id="aviso-pantalla-titulo" className="mt-[10px] text-[clamp(1.35rem,6.2vw,1.7rem)] font-light leading-[1.2]" style={{ color: LINEN }}>
              {titulo}
            </h2>

            <p className="mx-auto mt-[14px] max-w-[320px] text-[14.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.78)" }}>
              {children ?? <>
                Toda la información de tu obra está en esta pantalla: avance, presupuesto,
                aprobaciones, interventoría y documentos. Desde un computador la verás en
                menos desplazamientos, con las tablas y el cronograma lado a lado.
              </>}
            </p>

            <div className="mt-[24px]">
              <button
                type="button"
                onClick={cerrar}
                className="ix-press flex h-[54px] w-full items-center justify-center gap-[9px] rounded-full text-[15.5px] font-semibold"
                style={{ background: CREAM, color: BROWN }}
              >
                {boton}
              </button>
            </div>

            <p className="mt-[16px] text-[12.5px] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.5)" }}>
              Este aviso sale una sola vez por visita.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
