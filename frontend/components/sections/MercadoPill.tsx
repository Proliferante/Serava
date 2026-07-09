"use client";

import { motion } from "framer-motion";
import { useState } from "react";

/** Selectable "¿Dónde te gustaría invertir?" chip (Home · Seccion 9). */
export default function MercadoPill({
  left,
  top,
  width,
  label,
}: {
  left: string;
  top: string;
  width: string;
  label: string;
}) {
  const [on, setOn] = useState(false);

  return (
    <motion.button
      type="button"
      aria-pressed={on}
      onClick={() => setOn((v) => !v)}
      className="ix-chip absolute backdrop-blur-[10px] flex h-[60px] items-center justify-center overflow-clip px-[42px] py-[20px] rounded-[98px] border border-solid"
      style={{ left, top, width }}
      initial={false}
      animate={{
        backgroundColor: on ? "rgba(127,139,87,0.9)" : "rgba(73,33,0,0.2)",
        borderColor: on ? "rgba(154,166,111,0.95)" : "rgba(247,241,229,0.18)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="font-medium leading-[90.645%] not-italic text-[24px] text-center text-white whitespace-nowrap">{label}</span>
    </motion.button>
  );
}
