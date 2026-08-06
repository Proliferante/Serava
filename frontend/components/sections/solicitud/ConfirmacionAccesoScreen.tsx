"use client";

import { MotionConfig, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { EASE, MLine, Pop, Rise, Rule } from "@/components/motion/Kinetics";
import { MARK } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRMACIÓN DE ACCESO — reproducción 1:1 del frame de Figma 311:4977
   (CONFIRMACIÓN ACCESO, 1920 × 1199.7). Pantalla a la que llega el formulario
   de /solicitud-acceso al enviarse.

   El fondo es sólo el degradado del frame: el mapa que se ve en el lienzo de
   Figma está detrás del frame, no dentro, así que no forma parte del diseño.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const I = "/figma/acc";

const CREAM = "#e2cdae";
const LINEN = "#f7f1e5";
const BROWN = "#492100";
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

/** Icono de Figma: vectores SVG posicionados por `inset`. */
function Ico({ size, layers, className, style }: { size: number; layers: [string, string, string][]; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative shrink-0 overflow-hidden ${className ?? ""}`} style={{ width: size, height: size, ...style }}>
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

export default function ConfirmacionAccesoScreen() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="relative size-full overflow-hidden"
        data-name="CONFIRMACIÓN ACCESO"
        style={{
          backgroundImage:
            "linear-gradient(179.882deg, rgba(73,33,0,0.93) 0.164%, rgba(82,43,10,0.93) 35.973%, rgba(97,60,28,0.93) 50.479%, rgba(151,120,88,0.93) 80.07%, rgba(226,205,174,0.93) 99.836%)",
        }}
      >
        {/* Tarjeta con el halo crema (358:1108) */}
        <motion.div
          className="absolute"
          style={{ left: 627, top: 177, width: 662, height: 888, background: BROWN, borderRadius: 150, boxShadow: "0px 5px 17.7px 19px #e2cdae" }}
          initial={{ opacity: 0, y: 34, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: EASE }}
        />

        {/* Círculo del check (311:4984) */}
        <Pop className="absolute flex items-center justify-center" style={{ left: 914, top: 330.14, width: 92, height: 92, borderRadius: 46, background: "rgba(127,139,87,0.2)" }} delay={0.35} from={0.4} dur={0.7}>
          <Ico size={44} layers={IC_CHECK} />
        </Pop>

        {/* Eyebrow con filete a los dos lados (311:4990) */}
        <Rule x={850.435} y={468.14} w={26} color={LASER} opacity={0.7} delay={0.5} />
        <T x={888.435} cy={467.72} w={140.124} d={0.6} ry={12} className="text-center font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.456px", color: LASER }}>
          <p>Perfil recibido</p>
        </T>
        <Rule x={1043.575} y={468.14} w={26} color={LASER} opacity={0.7} delay={0.5} />

        {/* Heading 1 (311:4995) */}
        <T x={710.735} cy={526.44} w={498.53} className="whitespace-nowrap text-center" style={{ fontSize: 48, lineHeight: "53.76px", letterSpacing: "-0.96px", color: LINEN }}>
          <MLine delay={0.7} amount={0}>
            <span className="font-light">Recibimos tu </span>
            <span className="font-semibold">perfil.</span>
          </MLine>
        </T>

        {/* Párrafos (311:4999 / 311:5006) */}
        <T x={710.735} cy={613.48} w={498.53} d={0.9} className="whitespace-nowrap text-center font-light" style={{ fontSize: 17.6, lineHeight: "27.28px", color: "rgba(247,241,229,0.82)" }}>
          <p>El equipo Zequara revisará tu información y se</p>
          <p>
            <span>comunicará contigo para coordinar una </span>
            <span className="font-medium" style={{ color: LINEN }}>sesión virtual</span>
          </p>
          <p className="font-medium" style={{ color: LINEN }}>de conocimiento mutuo.</p>
        </T>
        <T x={710.735} cy={697.34} w={498.53} d={1.02} className="whitespace-nowrap text-center font-light" style={{ fontSize: 17.6, lineHeight: "27.28px", color: "rgba(247,241,229,0.82)" }}>
          <p>Después de esa conversación confirmaremos si</p>
          <p>avanzamos con el acceso al portafolio privado.</p>
        </T>

        {/* Volver al inicio (311:5008) */}
        <Pop className="absolute" style={{ left: 854.185, top: 771.06 }} delay={1.14} from={0.88} dur={0.6}>
          <a
            href="/"
            className="ix-cta ix-pulse relative block overflow-hidden"
            style={{ width: 211.63, height: 58.8, background: LINEN, borderRadius: 999, boxShadow: "0px 16px 32px -16px rgba(0,0,0,0.4)" }}
          >
            <T x={32} cy={28.5} w={119.182} className="text-center font-semibold" style={{ fontSize: 16, lineHeight: "24.8px", color: OIL }}>
              <p>Volver al inicio</p>
            </T>
            <Ico size={18} layers={IC_ARROW_DARK} className="ix-cta-arrow absolute" style={{ left: 161.62, top: 20.39 }} />
            <span className="ix-cta-shine" aria-hidden />
          </a>
        </Pop>

        {/* Nota legal (311:5015) */}
        <T x={774.265} cy={875.37} w={371.47} d={1.26} className="whitespace-nowrap text-center font-medium" style={{ fontSize: 13.1, lineHeight: "20.34px", color: CREAM }}>
          <p>Portafolio privado. Acceso sujeto a evaluación, sesión</p>
          <p>virtual y disponibilidad.</p>
        </T>

        {/* Nav (311:4979) */}
        <div className="absolute left-0 top-0 h-[83px] w-full">
          <motion.a
            href="/" className="ix-nav absolute block" style={{ left: 63, top: 22.4, width: 43.84, height: 40 }}
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
          >
            <img alt="Zequara" src={MARK} className="absolute inset-0 block size-full max-w-none" />
          </motion.a>
        </div>
      </div>
    </MotionConfig>
  );
}
