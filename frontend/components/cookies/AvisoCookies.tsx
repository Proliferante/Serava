"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { EnlacePolitica } from "@/components/legal/consentimiento";
import {
  ANALITICA, EVENTO_ABRIR, apagarAnalitica, cargarAnalitica, esZonaPublica, guardarDecision, leerDecision, type Decision,
} from "@/lib/cookies";

/* ═══════════════════════════════════════════════════════════════════════════
   AVISO DE COOKIES — y quien carga la analítica cuando hay permiso.

   Va una sola vez, en el layout raíz. Sale en la primera visita al sitio
   público y no vuelve hasta que cambie la versión o pasen 6 meses;
   «Preferencias de cookies», al pie, lo vuelve a abrir.

   «Aceptar» es el botón principal; «Solo las esenciales» es secundario pero
   está en la misma fila, a un clic. Esconder el rechazo en un segundo
   panel, o marcar la casilla por defecto, ya no sería un consentimiento
   libre (Ley 1581) y contradiría lo que dice la política.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function AvisoCookies() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);

  // Al montar y al navegar: si ya decidió que sí, Google se carga (una vez);
  // si no ha decidido y está en el sitio público, sale el aviso.
  useEffect(() => {
    if (!ANALITICA) return;
    const publica = esZonaPublica();
    const d = leerDecision();
    if (d === "si" && publica) cargarAnalitica();
    setAbierto(d === null && publica);
  }, [ruta]);

  useEffect(() => {
    const abrir = () => setAbierto(true);
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  if (!ANALITICA) return null;

  const decidir = (d: Decision) => {
    guardarDecision(d);
    if (d === "si" && esZonaPublica()) cargarAnalitica();
    else apagarAnalitica();
    setAbierto(false);
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.section
          role="dialog" aria-modal="false" aria-labelledby="zq-cookies-titulo"
          className="fixed inset-x-[12px] bottom-[12px] z-[110] rounded-[20px] p-[20px] text-[#f7f1e5] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] sm:inset-x-auto sm:bottom-[24px] sm:left-[24px] sm:w-[420px] sm:p-[24px]"
          style={{ background: "linear-gradient(160deg, #3a2a1c 0%, #2a1e14 100%)", border: "1px solid rgba(247,241,229,0.12)" }}
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.6 }}
        >
          <div className="flex items-start gap-[14px]">
            <span aria-hidden className="mt-[2px] flex size-[38px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(127,139,87,0.22)", color: "#cde0a0" }}>
              <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 id="zq-cookies-titulo" className="m-0 text-[16.5px] font-semibold leading-[1.3]">¿Nos dejas medir tu visita?</h2>
              <p className="m-0 mt-[6px] text-[13.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.78)" }}>
                Con tu permiso usamos Google Analytics para saber qué partes del sitio te sirven. Lo vemos de forma agregada y no lo usamos para publicidad.
                Las cookies esenciales, como la de inicio de sesión, funcionan siempre.{" "}
                <EnlacePolitica className="text-[#f7f1e5]">Política de datos</EnlacePolitica>.
              </p>
            </div>
          </div>
          <div className="mt-[18px] flex items-center gap-[10px]">
            <motion.button
              type="button" onClick={() => decidir("si")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="h-[46px] flex-1 rounded-full text-[15px] font-semibold shadow-[0_12px_24px_-12px_rgba(47,55,30,0.9)]"
              style={{ background: "#7f8b57", color: "#f7f1e5" }}
            >
              Aceptar
            </motion.button>
            <button
              type="button" onClick={() => decidir("no")}
              className="h-[46px] shrink-0 rounded-full px-[16px] text-[13.5px] font-medium transition-colors hover:bg-[rgba(247,241,229,0.08)]"
              style={{ color: "rgba(247,241,229,0.8)", border: "1px solid rgba(247,241,229,0.22)" }}
            >
              Solo las esenciales
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

/** «Preferencias de cookies»: vuelve a abrir el aviso. No sale sin analítica. */
export function PreferenciasCookies({ className, style }: { className?: string; style?: React.CSSProperties }) {
  if (!ANALITICA) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO_ABRIR))} className={className} style={style}>
      Preferencias de cookies
    </button>
  );
}
