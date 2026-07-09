"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Absolutely-positioned section that fades + slides up when scrolled into view. */
export function RevealLayer({
  left,
  top,
  width,
  height,
  delay = 0,
  children,
}: {
  left: number;
  top: number;
  width?: number;
  height?: number;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      style={{ position: "absolute", left, top, width, height }}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Generic reveal wrapper (keeps any className, e.g. absolute positioning). */
export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
