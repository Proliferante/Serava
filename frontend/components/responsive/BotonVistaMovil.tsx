"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useVistaEscritorio } from "@/components/responsive/vistaEscritorio";

/* ═══════════════════════════════════════════════════════════════════════════
   VOLVER A LA VISTA MÓVIL.

   Sin esto, quien acepta "ver en escritorio" se queda ahí: la preferencia se
   guarda y le seguiría a todas las páginas sin manera visible de deshacerla.
   El botón sólo aparece cuando esa vista está activa y la pantalla es pequeña.

   Va `fixed` y no dentro del lienzo a propósito: en vista de escritorio la
   página se desplaza en horizontal, y cualquier cosa colocada dentro se iría
   fuera de cuadro al desplazarse.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;
const CORTE = 1280;

export default function BotonVistaMovil() {
  const { escritorio, cambiar } = useVistaEscritorio();
  const [pantallaChica, setPantallaChica] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${CORTE - 1}px)`);
    const leer = () => setPantallaChica(mq.matches);
    leer();
    mq.addEventListener("change", leer);
    return () => mq.removeEventListener("change", leer);
  }, []);

  return (
    <AnimatePresence>
      {escritorio && pantallaChica && (
        <motion.button
          type="button"
          onClick={() => cambiar(false)}
          className="ix-press fixed bottom-[18px] left-1/2 z-[120] flex h-[46px] -translate-x-1/2 items-center gap-[9px] rounded-full px-[20px] text-[14px] font-semibold"
          style={{ background: "#492100", color: "#e2cdae", border: "1px solid rgba(201,168,119,0.4)", boxShadow: "0 12px 30px -12px rgba(0,0,0,0.6)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.36, ease: EASE }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" />
          </svg>
          Volver a vista móvil
        </motion.button>
      )}
    </AnimatePresence>
  );
}
