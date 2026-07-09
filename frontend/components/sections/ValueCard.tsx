"use client";

import { motion } from "framer-motion";

type ValueCardProps = {
  cardLeft: string;
  title: string;
  titleTop: number;
  body: string;
  bodyTop: number;
  bodyColor: string;
  delay?: number;
};

/**
 * Dark value card (Home · Seccion 7 "Remodelamos", 335px tall).
 * Self-contained container with a staggered scroll-in entrance and hover lift.
 */
export default function ValueCard({ cardLeft, title, titleTop, body, bodyTop, bodyColor, delay = 0 }: ValueCardProps) {
  return (
    <motion.div
      className="group absolute top-[990px] h-[335px] w-[245.46px]"
      style={{ left: cardLeft }}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
    >
      <div className="absolute inset-0 rounded-[50px] bg-brown-dark border border-solid border-transparent transition-[border-color,box-shadow] duration-300 group-hover:border-[rgba(247,241,229,0.25)] group-hover:shadow-[0px_24px_48px_-20px_rgba(0,0,0,0.55)]" />
      <p className="[word-break:break-word] absolute left-[32px] w-[171.62px] font-semibold leading-[26.4px] not-italic text-cream-93 text-[24px] text-center tracking-[-0.6px]" style={{ top: titleTop }}>{title}</p>
      <p className="[word-break:break-word] absolute left-[32px] w-[171.62px] font-light leading-[22.82px] not-italic text-[15px]" style={{ top: bodyTop, color: bodyColor }}>{body}</p>
    </motion.div>
  );
}
