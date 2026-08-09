"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { type CSSProperties, type ReactNode, type RefObject } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   Kinetics — vocabulario de movimiento compartido por las páginas de canvas
   fijo (Cómo operamos, Oportunidades).

   Todo se limita a `transform` y `opacity` para que el navegador lo componga
   en GPU: el canvas mide 1920 px y se escala, así que animar layout o filtros
   sobre áreas grandes provocaría jank.

   Las animaciones respetan `prefers-reduced-motion` — la raíz de cada página
   va envuelta en <MotionConfig reducedMotion="user">, y los helpers con bucle
   infinito comprueban `useReducedMotion()` directamente. El de <Orbit> es la
   excepción: como el bucle es CSS, se apaga en globals.css con el resto.
   ═══════════════════════════════════════════════════════════════════════════ */

export const EASE = [0.22, 1, 0.36, 1] as const;
/** Sobreimpulso suave — para elementos que "aparecen de golpe" (iconos, puntos). */
export const POP = [0.34, 1.56, 0.64, 1] as const;

/* ── Entradas al hacer scroll ────────────────────────────────────────────── */

/** Sube y aparece al entrar en viewport. La base de casi todo. */
export function Rise({
  children, className, style, delay = 0, y = 26, x = 0, scale, dur = 0.7, amount = 0.3,
}: {
  children?: ReactNode; className?: string; style?: CSSProperties;
  delay?: number; y?: number; x?: number; scale?: number; dur?: number; amount?: number;
}) {
  if (useReducedMotion()) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: dur, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Línea de titular con máscara: el texto sube desde fuera de su propia caja.
 *
 * El relleno vertical (compensado con margen negativo, así el layout no se
 * mueve ni un píxel) deja sitio a ascendentes y descendentes, que en Poppins
 * sobresalen ~0.35em de la caja de línea y de otro modo se recortarían.
 */
export function MLine({
  children, className, style, delay = 0, dur = 0.95, pad = 0.45, amount = 0.15,
}: {
  children: ReactNode; className?: string; style?: CSSProperties;
  delay?: number; dur?: number; pad?: number; amount?: number;
}) {
  // Sin la máscara si el usuario pidió menos movimiento: dejar el texto
  // desplazado fuera de su caja lo dejaría invisible.
  if (useReducedMotion()) return <span className={`block ${className ?? ""}`} style={style}>{children}</span>;
  return (
    <span className="block overflow-hidden" style={{ padding: `${pad}em 0`, margin: `-${pad}em 0` }}>
      <motion.span
        className={`block ${className ?? ""}`}
        style={style}
        initial={{ y: "220%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, amount }}
        transition={{ duration: dur, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Aparece con sobreimpulso — iconos, puntos de timeline, badges. */
export function Pop({
  children, className, style, delay = 0, dur = 0.5, from = 0.4, amount = 0.5,
}: {
  children: ReactNode; className?: string; style?: CSSProperties;
  delay?: number; dur?: number; from?: number; amount?: number;
}) {
  if (useReducedMotion()) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, scale: from }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount }}
      transition={{ duration: dur, delay, ease: POP }}
    >
      {children}
    </motion.div>
  );
}

/** Filete horizontal que se dibuja de izquierda a derecha (eyebrows). */
export function Rule({
  x, y, w, h = 1, color, opacity = 0.8, delay = 0, dur = 0.7,
}: { x: number; y: number; w: number; h?: number; color: string; opacity?: number; delay?: number; dur?: number }) {
  const base: CSSProperties = { left: x, top: y, width: w, height: h, background: color, opacity };
  if (useReducedMotion()) return <div className="absolute" style={base} />;
  return (
    <motion.div
      className="absolute"
      style={{ ...base, transformOrigin: "left center" }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: dur, delay, ease: EASE }}
    />
  );
}

/** Línea vertical que se traza de arriba abajo (timelines, blockquote). */
export function Draw({
  className, style, delay = 0, dur = 1.1, origin = "top", children,
}: { className?: string; style?: CSSProperties; delay?: number; dur?: number; origin?: "top" | "bottom"; children?: ReactNode }) {
  if (useReducedMotion()) return <div className={`absolute ${className ?? ""}`} style={style}>{children}</div>;
  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      style={{ ...style, transformOrigin: origin }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: dur, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Contorno decorativo que se dibuja escalando desde dentro. */
export function Bloom({
  children, className, style, delay = 0, dur = 1.6, from = 0.86,
}: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number; dur?: number; from?: number }) {
  if (useReducedMotion()) return <div className={`absolute ${className ?? ""}`} style={style}>{children}</div>;
  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      style={style}
      initial={{ opacity: 0, scale: from }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: dur, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Parallax ligado al scroll ───────────────────────────────────────────── */

/**
 * Devuelve un `y` suavizado que va de `+amp` a `-amp` mientras `ref` cruza el
 * viewport. Se aplica a la <img> interior de una caja con overflow oculto, de
 * modo que el recorte de Figma se mantiene y sólo se desplaza el contenido.
 *
 * `null` si el usuario pidió menos movimiento.
 */
export function useParallaxY(ref: RefObject<HTMLElement | null>, amp: number): MotionValue<number> | null {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], [amp, -amp]);
  return reduce ? null : y;
}

/* ── Bucles infinitos (decorativos) ──────────────────────────────────────── */

/** Flotación vertical continua — puntos y marcadores decorativos. */
export function Float({
  children, className, style, amp = 6, dur = 4.5, delay = 0,
}: { children?: ReactNode; className?: string; style?: CSSProperties; amp?: number; dur?: number; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute ${className ?? ""}`}
      style={style}
      animate={reduce ? undefined : { y: [0, -amp, 0] }}
      transition={{ duration: dur, delay, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Giro perpetuo sobre un contorno **elíptico**, sin deformarlo: el trazo se
 * queda clavado donde lo puso el diseño y sólo viajan los adornos que lleva
 * encima (puntos, marcas).
 *
 * Girar una elipse la hace bailar: como sus semiejes no miden lo mismo, el
 * contorno se sale de su sitio hasta la diferencia entre ambos — en el aro de
 * Oportunidades son 21 px, muy visibles. El truco es meter la rotación entre
 * dos escalas inversas: la de dentro estira el eje corto hasta convertir la
 * elipse en círculo, que sí es invariante al giro, y la de fuera devuelve el
 * círculo a su óvalo. Lo único que se mueve es lo que rompe la simetría.
 *
 * Las tres capas comparten el mismo `transform-origin` — el centro de la
 * elipse, no el de la caja — porque si no, cada escala desplazaría el aro.
 *
 * `cx`/`cy` es ese centro y `rx`/`ry` los semiejes, en píxeles locales a la
 * caja. Se pasan explícitos porque la caja suele ser mayor que la elipse: los
 * adornos que sobresalen del trazo la ensanchan.
 *
 * El giro va en CSS (`.ix-orbit`, en globals.css) y no en framer-motion, como
 * el resto de bucles perpetuos del proyecto: es una rotación lineal constante,
 * así que la compone la GPU sin pasar por JS en cada frame. De ahí también que
 * `prefers-reduced-motion` se resuelva allí y no con `useReducedMotion()`.
 */
export function Orbit({
  children, className, style, cx, cy, rx, ry, dur = 60, reverse = false,
}: {
  children?: ReactNode; className?: string; style?: CSSProperties;
  cx: number; cy: number; rx: number; ry: number; dur?: number; reverse?: boolean;
}) {
  const origin = `${cx}px ${cy}px`;
  return (
    <div className={`absolute ${className ?? ""}`} style={{ ...style, transformOrigin: origin, transform: `scaleY(${ry / rx})` }}>
      <div
        className="ix-orbit absolute inset-0"
        style={{ transformOrigin: origin, animationDuration: `${dur}s`, animationDirection: reverse ? "reverse" : undefined }}
      >
        <div className="absolute inset-0" style={{ transformOrigin: origin, transform: `scaleY(${rx / ry})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
