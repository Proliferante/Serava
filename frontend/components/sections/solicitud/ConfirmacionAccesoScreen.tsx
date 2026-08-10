"use client";

import { motion, MotionConfig } from "framer-motion";
import { EASE } from "@/components/motion/Kinetics";
import { WORDMARK, wordmarkH } from "@/components/brand";
import CanvasImage from "@/components/CanvasImage";
import ConfirmacionContenido, { CARD, CARD_CONT, CONF_H, CONF_W } from "@/components/sections/solicitud/ConfirmacionContenido";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRMACIÓN DE ACCESO — reproducción 1:1 del frame de Figma 311:4977
   (CONFIRMACIÓN ACCESO, 1920 × 1199.7). Pantalla a la que llega el formulario
   de /solicitud-acceso al enviarse.

   El fondo son dos capas: la foto a sangre y, encima, el degradado del frame.
   Las cinco paradas del degradado van con alfa 0,93, así que la foto se
   transparenta un 7 % por debajo; sin ella el 7 % caía sobre nada y el fondo
   quedaba plano.

   El contenido de la tarjeta vive en <ConfirmacionContenido>, porque lo comparte
   con el modal que sale al enviar el formulario.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const BROWN = "#492100";

/** Sitio de la tarjeta dentro del frame. Sus medidas van con el contenido. */
const CARD_POS = { x: 627, y: 177 };

export default function ConfirmacionAccesoScreen() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative size-full overflow-hidden" data-name="CONFIRMACIÓN ACCESO">
        {/* Foto de fondo, a sangre sobre todo el frame. Va debajo del degradado. */}
        <CanvasImage src={`${A}/confirmacion-acceso.webp`} w={1920} priority />

        {/* Degradado del frame (311:4977), con sus cinco paradas al 93 %. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(179.882deg, rgba(73,33,0,0.93) 0.164%, rgba(82,43,10,0.93) 35.973%, rgba(97,60,28,0.93) 50.479%, rgba(151,120,88,0.93) 80.07%, rgba(226,205,174,0.93) 99.836%)",
          }}
        />

        <motion.div
          className="absolute"
          style={{ left: CARD_POS.x, top: CARD_POS.y, width: CARD.w, height: CARD.h, background: BROWN, borderRadius: CARD.radius, boxShadow: CARD.halo }}
          initial={{ opacity: 0, y: 34, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <div className="absolute" style={{ left: CARD_CONT.x, top: CARD_CONT.y, width: CONF_W, height: CONF_H }}>
            <ConfirmacionContenido />
          </div>
        </motion.div>

        {/* Nav (311:4979) — el wordmark completo, igual que en /solicitud-acceso. */}
        <div className="absolute left-0 top-0 h-[83px] w-full">
          <motion.a
            href="/" aria-label="Zequara — Inicio" className="ix-nav absolute block" style={{ left: 63, top: 39.11, width: 175.28, height: wordmarkH(175.28) }}
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          >
            <img alt="Zequara" src={WORDMARK} className="absolute inset-0 block size-full max-w-none" />
          </motion.a>
        </div>
      </div>
    </MotionConfig>
  );
}
