"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   KIT DE LA VISTA FLUIDA — las piezas que comparten las páginas por debajo de
   1280 px.

   El vocabulario es el mismo del escritorio (antetítulo con filete, titular,
   cuerpo, botón), pero aquí nada va posicionado: se apila, y los cuerpos usan
   `clamp()` para escalar de 320 a 1280 sin saltos.

   Todo el movimiento se limita a `transform` y `opacity` para que lo componga
   la GPU, y respeta `prefers-reduced-motion` a través del <MotionConfig> que
   envuelve cada pantalla.
   ═══════════════════════════════════════════════════════════════════════════ */

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Columna de lectura. En tablet crece, pero no se desparrama. */
export const WRAP = "mx-auto w-full max-w-[720px] px-[24px] sm:px-[40px]";

export const CREAM = "#e2cdae";
export const LINEN = "#f7f1e5";
export const BROWN = "#492100";
export const MILLBROOK = "#5b4332";
export const LASER = "#c9a877";
export const DRIFT = "#a57a4e";
export const AVOCADO = "#7f8b57";

/** Bloque que entra al aparecer en pantalla. La base de todo. */
export function In({ children, className, style, delay = 0, y = 26 }: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number; y?: number }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.62, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Antetítulo con su filete, como el `Rule` + eyebrow del escritorio. */
export function Eyebrow({ children, tone = "laser" }: { children: ReactNode; tone?: "laser" | "brown" }) {
  const color = tone === "laser" ? LASER : BROWN;
  return (
    <div className="flex items-center gap-[12px]">
      <span className="block h-px w-[28px] shrink-0 opacity-80" style={{ background: color }} />
      <span className="text-[11px] font-semibold uppercase leading-[1.4] tracking-[2.6px]" style={{ color }}>{children}</span>
    </div>
  );
}

/** Titular de sección. */
export function H2({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <h2 className="mt-[14px] text-[clamp(1.75rem,6.4vw,2.6rem)] font-light leading-[1.12] tracking-[-0.02em]" style={{ color: dark ? BROWN : LINEN }}>
      {children}
    </h2>
  );
}

export function P({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="mt-[14px] text-[clamp(0.95rem,3.6vw,1.1rem)] font-light leading-[1.6]" style={{ color: dark ? MILLBROOK : "rgba(247,241,229,0.78)" }}>
      {children}
    </p>
  );
}

/**
 * Botón principal. 56 px de alto: el mínimo cómodo para el pulgar.
 *
 * `whileTap` en vez de `:hover`: en táctil no hay hover, y sin respuesta al
 * pulsar la interfaz se siente muerta. El hundido es la señal de que el toque
 * entró, que en móvil llega antes que la navegación.
 */
export function CTA({ href, children, tone = "cream" }: { href: string; children: ReactNode; tone?: "cream" | "olive" }) {
  const cream = tone === "cream";
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.14, ease: EASE }}
      className="ix-press mt-[26px] flex h-[56px] w-full max-w-[340px] items-center justify-center rounded-full text-[16px] font-semibold"
      style={cream ? { background: CREAM, color: BROWN } : { background: AVOCADO, color: LINEN }}
    >
      {children}
    </motion.a>
  );
}

/**
 * Titular que entra palabra a palabra. Se reserva para el titular de una
 * página, no para cada sección: escalonar todo cansa.
 */
export function Words({ text, className, style, delay = 0 }: { text: string; className?: string; style?: CSSProperties; delay?: number }) {
  return (
    <span className={className} style={style}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: "0.35em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + i * 0.045, ease: EASE }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

/** Nota al pie de sección, del tamaño de las advertencias del diseño. */
export function Note({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="mt-[18px] text-[13px] font-light leading-[1.5]" style={{ color: dark ? "rgba(91,67,50,0.85)" : "rgba(247,241,229,0.55)" }}>
      {children}
    </p>
  );
}

/**
 * Línea de tiempo numerada: el filete se dibuja al entrar y los pasos cuelgan
 * de él. Es el patrón de "Así funciona tu inversión" y de los siete pasos del
 * método, que en escritorio son secciones sueltas de pantalla completa.
 */
export function Timeline({ children }: { children: ReactNode }) {
  return (
    <div className="relative mt-[34px] pl-[38px]">
      <motion.span
        className="absolute left-[13px] top-[6px] w-px origin-top bg-[rgba(201,168,119,0.45)]"
        style={{ bottom: 6 }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.1, ease: EASE }}
      />
      {children}
    </div>
  );
}

export function Step({ n, title, children, delay = 0 }: { n: string; title: string; children: ReactNode; delay?: number }) {
  return (
    <In delay={delay} className="relative pb-[30px] last:pb-0">
      <span className="absolute -left-[38px] top-[2px] flex size-[27px] items-center justify-center rounded-full border border-solid border-[rgba(201,168,119,0.5)] bg-brown-dark text-[11px] font-semibold text-tan-63">
        {n}
      </span>
      <h3 className="m-0 text-[clamp(1.05rem,4.4vw,1.35rem)] font-semibold leading-[1.25] text-cream-93">{title}</h3>
      <div className="mt-[7px] text-[15px] font-light leading-[1.55] text-[rgba(247,241,229,0.72)]">{children}</div>
    </In>
  );
}

/** Tarjeta clara sobre fondo crema. */
export function Card({ title, children, delay = 0 }: { title: string; children: ReactNode; delay?: number }) {
  return (
    <In delay={delay} className="rounded-[16px] border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(255,255,255,0.4)] p-[20px]">
      <h3 className="m-0 text-[17px] font-semibold" style={{ color: BROWN }}>{title}</h3>
      <div className="mt-[7px] text-[14.5px] font-light leading-[1.55]" style={{ color: MILLBROOK }}>{children}</div>
    </In>
  );
}

/** Lista de comprobación con el check en su círculo olivo. */
export function CheckList({ items, dark }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="mt-[22px] flex list-none flex-col gap-[10px] p-0">
      {items.map((t, i) => (
        <In key={t} delay={0.05 * i}>
          <li className="flex items-start gap-[11px] text-[15.5px] font-light leading-[1.45]" style={{ color: dark ? MILLBROOK : "rgba(247,241,229,0.85)" }}>
            <span className="mt-[2px] flex size-[22px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(127,139,87,0.22)" }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={AVOCADO} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
            </span>
            {t}
          </li>
        </In>
      ))}
    </ul>
  );
}
