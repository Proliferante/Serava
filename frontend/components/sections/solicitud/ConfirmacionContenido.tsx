"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { EASE, MLine, Pop, Rule } from "@/components/motion/Kinetics";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRMACIÓN — contenido del contenedor 311:4982 de Figma (498.53 × 582.4),
   con las coordenadas locales a esa caja.

   Vive aparte de la pantalla porque lo pintan dos sitios: la página
   /solicitud-acceso/confirmacion y el modal que sale al enviar el formulario.
   Quien lo use sólo tiene que colocarlo en una caja posicionada de ese tamaño.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Medidas del contenedor, para que quien lo coloque no las repita. */
export const CONF_W = 498.53;
export const CONF_H = 582.4;

/** Tarjeta que lo enmarca (358:1108) y sitio del contenido dentro de ella. */
export const CARD = { w: 662, h: 888, radius: 150, halo: "0px 5px 17.7px 19px #e2cdae" };
export const CARD_CONT = { x: 83.735, y: 153.14 };

const I = "/figma/acc";

const CREAM = "#e2cdae";
const LINEN = "#f7f1e5";
const LASER = "#c9a877";
const OIL = "#2a1e14";

/** Nodo de texto de Figma: centrado verticalmente sobre `cy`. */
function T({
  x, cy, w, className, style, d, ry = 20, children,
}: { x: number; cy: number; w?: number; className?: string; style?: CSSProperties; d?: number; ry?: number; children: ReactNode }) {
  return (
    <div
      className={`absolute flex flex-col justify-center ${className ?? ""}`}
      style={{ left: x, top: cy, width: w, transform: "translateY(-50%)", ...style }}
    >
      {d === undefined ? children : (
        <motion.div
          initial={{ opacity: 0, y: ry }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: d, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Icono de Figma: vectores SVG posicionados por `inset`.
 *
 * `pos` en vez de colar `absolute` por `className`: las dos son utilidades de
 * `position` y en la hoja de Tailwind `relative` va después, así que ganaría
 * siempre la de aquí y el icono se quedaría en el flujo.
 */
function Ico({ size, layers, className, style, pos = "relative" }: { size: number; layers: [string, string, string][]; className?: string; style?: CSSProperties; pos?: "relative" | "absolute" }) {
  return (
    <div className={`${pos} shrink-0 overflow-hidden ${className ?? ""}`} style={{ width: size, height: size, ...style }}>
      {layers.map(([outer, inner, src], i) => (
        <div key={i} className="absolute" style={{ inset: outer }}>
          <div className="absolute" style={{ inset: inner }}>
            <img alt="" src={`${I}/${src}`} className="block size-full max-w-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

const IC_CHECK: [string, string, string][] = [["25% 16.67% 29.17% 16.67%", "-6.43% -4.42% -12.86% -4.42%", "check44.svg"]];
const IC_ARROW_DARK: [string, string, string][] = [
  ["50% 20.83% 50% 20.83%", "-0.75px 0", "arrow-dark1.svg"],
  ["25% 20.83% 25% 54.17%", "-5.89% -23.57% -5.89% -11.79%", "arrow-dark2.svg"],
];

export default function ConfirmacionContenido() {
  return (
    <>
      {/* Círculo del check (311:4984) */}
      <Pop className="absolute flex items-center justify-center" style={{ left: 203.265, top: 0, width: 92, height: 92, borderRadius: 46, background: "rgba(127,139,87,0.2)" }} delay={0.35} from={0.4} dur={0.7}>
        <Ico size={44} layers={IC_CHECK} />
      </Pop>

      {/* Eyebrow con filete a los dos lados (311:4990) */}
      <Rule x={139.7} y={138.5} w={26} color={LASER} opacity={0.7} delay={0.5} />
      {/* `whitespace-nowrap`: con el interletraje de 3,456 px el texto mide algo
          más que los 140,124 px del nodo y se partía en dos líneas. En Figma el
          nodo es de ancho automático, así que nunca parte. */}
      <T x={177.7} cy={137.58} w={140.124} d={0.6} ry={12} className="whitespace-nowrap text-center font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.456px", color: LASER }}>
        <p>Perfil recibido</p>
      </T>
      <Rule x={332.84} y={138.5} w={26} color={LASER} opacity={0.7} delay={0.5} />

      {/* Heading 1 (311:4995) */}
      <T x={0} cy={196.42} w={CONF_W} className="whitespace-nowrap text-center" style={{ fontSize: 48, lineHeight: "53.76px", letterSpacing: "-0.96px", color: LINEN }}>
        <MLine delay={0.7} amount={0}>
          <span className="font-light">Recibimos tu </span>
          <span className="font-semibold">perfil.</span>
        </MLine>
      </T>

      {/* Párrafos (311:4999 / 311:5006) */}
      {/* Este párrafo va a 20 px / 28 px en Medium (311:5003), no a 17,6 en
          Light: llevaba los valores del párrafo de abajo (311:5007), que sí
          es 17,6 Light. Por eso se veía más pequeño que en el diseño. */}
      <T x={0} cy={284.42} w={CONF_W} d={0.9} className="whitespace-nowrap text-center font-medium" style={{ fontSize: 20, lineHeight: "28px", color: "rgba(247,241,229,0.82)" }}>
        <p>El equipo Zequara revisará tu información y se</p>
        <p>
          <span>comunicará contigo para coordinar una </span>
          <span className="font-medium" style={{ color: LINEN }}>sesión virtual</span>
        </p>
        <p className="font-medium" style={{ color: LINEN }}>de conocimiento mutuo.</p>
      </T>
      <T x={0} cy={367.42} w={CONF_W} d={1.02} className="whitespace-nowrap text-center font-light" style={{ fontSize: 17.6, lineHeight: "27.28px", color: "rgba(247,241,229,0.82)" }}>
        <p>Después de esa conversación confirmaremos si</p>
        <p>avanzamos con el acceso al portafolio privado.</p>
      </T>

      {/* Volver al inicio (311:5008) */}
      <Pop className="absolute" style={{ left: 143.266, top: 425.86 }} delay={1.14} from={0.88} dur={0.6}>
        <a
          href="/"
          className="ix-cta ix-pulse relative block overflow-hidden"
          style={{ width: 211.63, height: 58.8, background: LINEN, borderRadius: 999, boxShadow: "0px 16px 32px -16px rgba(0,0,0,0.4)" }}
        >
          <T x={32} cy={28.5} w={119.182} className="text-center font-semibold" style={{ fontSize: 16, lineHeight: "24.8px", color: OIL }}>
            <p>Volver al inicio</p>
          </T>
          <Ico size={18} layers={IC_ARROW_DARK} className="ix-cta-arrow" pos="absolute" style={{ left: 161.62, top: 20.39 }} />
          <span className="ix-cta-shine" aria-hidden />
        </a>
      </Pop>

      {/* Nota legal (311:5015) */}
      <T x={63.266} cy={530.27} w={371.474} d={1.26} className="whitespace-nowrap text-center font-medium" style={{ fontSize: 13.1, lineHeight: "20.34px", color: CREAM }}>
        <p>Portafolio privado. Acceso sujeto a evaluación, sesión</p>
        <p>virtual y disponibilidad.</p>
      </T>
    </>
  );
}
