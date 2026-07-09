"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Vertical line that "draws" itself top → bottom when scrolled into view. */
export default function DrawLine({
  className,
  style,
  duration = 1.1,
  delay = 0,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  duration?: number;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      style={{ ...style, transformOrigin: "top" }}
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Marker that pops (scale + fade) into view — for timeline dots. */
export function Pop({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.45, delay, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {children}
    </motion.div>
  );
}
