"use client";

import { motion } from "framer-motion";
import {
  BODY_TOP, CARD_H, CARD_RADIUS, CARD_TOP, CARD_W, COL_W, COL_X, TITLE_BAND_H, TITLE_LH, TITLE_TOP,
} from "@/components/sections/valueCardMetrics";

type ValueCardProps = {
  /** Posición horizontal dentro de la sección (px). */
  left: number;
  title: string;
  body: string;
  bodyColor: string;
  delay?: number;
};

/**
 * Tarjeta oscura de valor (Home · Sección 7 "Remodelamos", 245.46 × 335).
 *
 * El bloque de texto se centra por regla en vez de con offsets a mano: en
 * Figma las cajas de texto están a ~32 px del borde izquierdo (unos 5 px a la
 * izquierda del centro real) y cada tarjeta tenía su propio `top` de cuerpo,
 * lo que dejaba huecos distintos entre título y texto.
 */
export default function ValueCard({ left, title, body, bodyColor, delay = 0 }: ValueCardProps) {
  return (
    <motion.div
      className="group absolute"
      style={{ left, top: CARD_TOP, width: CARD_W, height: CARD_H }}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
    >
      <div
        className="absolute inset-0 border border-solid border-transparent bg-brown-dark transition-[border-color,box-shadow] duration-300 group-hover:border-[rgba(247,241,229,0.25)] group-hover:shadow-[0px_24px_48px_-20px_rgba(0,0,0,0.55)]"
        style={{ borderRadius: CARD_RADIUS }}
      />

      {/* Título — centrado en su banda, tanto a una como a dos líneas */}
      <div
        className="absolute flex items-center justify-center"
        style={{ left: COL_X, top: TITLE_TOP, width: COL_W, height: TITLE_BAND_H }}
      >
        <p
          className="[word-break:break-word] text-center font-semibold not-italic text-cream-93"
          style={{ fontSize: 24, lineHeight: `${TITLE_LH}px`, letterSpacing: "-0.6px" }}
        >
          {title}
        </p>
      </div>

      {/* Cuerpo */}
      <p
        className="[word-break:break-word] absolute font-light not-italic"
        style={{ left: COL_X, top: BODY_TOP, width: COL_W, fontSize: 15, lineHeight: "22.82px", color: bodyColor }}
      >
        {body}
      </p>
    </motion.div>
  );
}
