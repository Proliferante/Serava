"use client";

import { motion } from "framer-motion";

type FiltroCardProps = {
  cardLeft: string;
  label: string;
  title: string;
  body: string;
  bodyColor: string;
  delay?: number;
};

/**
 * Dark filter card (Home · Seccion 2 "El criterio de entrada", 378px tall).
 * Self-contained container with a staggered scroll-in entrance and hover lift.
 */
export default function FiltroCard({ cardLeft, label, title, body, bodyColor, delay = 0 }: FiltroCardProps) {
  return (
    <motion.div
      className="group absolute top-[264px] h-[378px] w-[245.46px]"
      style={{ left: cardLeft }}
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
    >
      <div className="absolute inset-0 rounded-[50px] bg-brown-dark border border-solid border-transparent transition-[border-color,box-shadow] duration-300 group-hover:border-[rgba(247,241,229,0.25)] group-hover:shadow-[0px_24px_48px_-20px_rgba(0,0,0,0.55)]" />
      <p className="[word-break:break-word] absolute left-[33px] top-[41px] w-[171.62px] font-semibold leading-[18.35px] not-italic text-tan-63 text-[11.8px] tracking-[2.368px]">{label}</p>
      <p className="[word-break:break-word] absolute left-[32px] top-[94px] w-[171.62px] font-semibold leading-[26.4px] not-italic text-cream-93 text-[24px] tracking-[-0.6px]">{title}</p>
      <p className="[word-break:break-word] absolute left-[32px] top-[154px] w-[171.62px] font-light leading-[22.82px] not-italic text-[15px]" style={{ color: bodyColor }}>{body}</p>
    </motion.div>
  );
}
