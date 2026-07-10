"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const A = "/figma";
const E1 = `${A}/169525296f86fae3030d42ec42fba14af800c658.svg`;
const E2 = `${A}/1da0ab0df570bff5e7f20decfb70c315aebe7075.svg`;
const E3 = `${A}/d7483626a2c8da636371951ab39e924c28b0adc3.svg`;

/**
 * Home · Seccion 3 timeline, driven by scroll: the vertical line fills as the
 * user scrolls through the section, and each dot lights up (fade + scale) the
 * moment the fill reaches it.
 */
export default function Section3Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  // Progress 0 when the timeline enters from the bottom, 1 while it sits in the
  // upper-middle of the viewport — so the whole fill + dot sequence plays out
  // while the section is comfortably on screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.6"],
  });

  // Line fill height (0 → 652px) tied to scroll progress.
  const fillHeight = useTransform(scrollYProgress, [0, 1], [0, 652]);

  // Dots activate as the fill reaches their position along the line.
  const d1o = useTransform(scrollYProgress, [0.0, 0.06], [0.3, 1]);
  const d1s = useTransform(scrollYProgress, [0.0, 0.06], [0.55, 1]);
  const d2o = useTransform(scrollYProgress, [0.38, 0.46], [0.3, 1]);
  const d2s = useTransform(scrollYProgress, [0.38, 0.46], [0.55, 1]);
  const d3o = useTransform(scrollYProgress, [0.8, 0.88], [0.3, 1]);
  const d3s = useTransform(scrollYProgress, [0.8, 0.88], [0.55, 1]);

  return (
    <>
      {/* Track (faint) — also the scroll measurement target */}
      <div
        ref={ref}
        className="absolute left-[1201px] top-[309px] w-[4px] h-[652px] rounded-full"
        style={{ background: "rgba(104,117,64,0.22)" }}
      >
        {/* Fill grows downward with scroll */}
        <motion.div
          className="absolute left-0 top-0 w-full rounded-full"
          style={{ height: fillHeight, background: "linear-gradient(180deg, #687540 0%, #8f9c63 100%)" }}
        />
      </div>

      {/* Timeline dots */}
      <motion.div className="absolute h-[41px] left-[1183px] top-[294px] w-[40px]" style={{ opacity: d1o, scale: d1s }}>
        <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={E1} />
      </motion.div>
      <motion.div className="absolute h-[41px] left-[1183px] top-[570px] w-[40px]" style={{ opacity: d2o, scale: d2s }}>
        <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={E2} />
      </motion.div>
      <motion.div className="absolute h-[41px] left-[1183px] top-[845px] w-[40px]" style={{ opacity: d3o, scale: d3s }}>
        <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={E3} />
      </motion.div>
    </>
  );
}
