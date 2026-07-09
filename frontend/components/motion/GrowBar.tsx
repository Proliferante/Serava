"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/** A bar that animates its width from 0 → widthPx when scrolled into view. */
export default function GrowBar({
  widthPx,
  className,
  delay = 0,
  style,
}: {
  widthPx: number;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ width: 0 }}
      animate={inView ? { width: widthPx } : { width: 0 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
    />
  );
}
