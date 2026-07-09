"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Use a comma as the decimal separator (es-CO formatting). */
  comma?: boolean;
  /** Group the integer part with "." thousands separators (e.g. 3.100). */
  grouping?: boolean;
  duration?: number;
};

function format(v: number, decimals: number, comma: boolean, grouping: boolean) {
  const s = v.toFixed(decimals);
  const dot = s.indexOf(".");
  let int = dot === -1 ? s : s.slice(0, dot);
  const dec = dot === -1 ? "" : s.slice(dot + 1);
  if (grouping) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return dec ? `${int}${comma ? "," : "."}${dec}` : int;
}

/**
 * Animates a number from 0 → value when it scrolls into view.
 * Renders a <span> so it inherits the surrounding typography.
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  comma = false,
  grouping = false,
  duration = 1.6,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  useEffect(() => {
    const node = ref.current;
    if (!inView || !node) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = `${prefix}${format(v, decimals, comma, grouping)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, prefix, suffix, decimals, comma, grouping, duration]);

  return <span ref={ref}>{`${prefix}${format(0, decimals, comma, grouping)}${suffix}`}</span>;
}
