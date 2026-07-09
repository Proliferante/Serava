"use client";

import { motion } from "framer-motion";

const PIN = "/figma/295553d75cc2ca10362c75d56def25e43b219ada.svg";

type CityCardProps = {
  left: string;
  imgSrc: string;
  label: string;
  crop?: boolean;
  shadow?: boolean;
  delay?: number;
};

/**
 * "Operación activa hoy" city card (Home · Seccion 9).
 * Gradient base + rounded photo + pin/label, with a staggered scroll-in
 * entrance, hover lift and photo zoom.
 */
export default function CityCard({ left, imgSrc, label, crop, shadow, delay = 0 }: CityCardProps) {
  return (
    <motion.div
      className="group absolute top-[395px] h-[378px] w-[279.95px]"
      style={{ left }}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10 }}
    >
      {/* Gradient base */}
      <div className="absolute inset-0 rounded-[50px] bg-gradient-to-b from-cream to-brown-dark transition-shadow duration-300 group-hover:shadow-[0px_26px_50px_-18px_rgba(0,0,0,0.6)]" />

      {/* Photo (zooms on hover) */}
      <div className={`absolute left-0 top-0 h-[310.111px] w-full overflow-hidden rounded-[50px] ${shadow ? "shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" : ""}`}>
        {crop ? (
          <img alt={label} className="ix-zoom absolute h-full left-[-103.75%] max-w-none top-0 w-[207.5%] pointer-events-none" src={imgSrc} />
        ) : (
          <img alt={label} className="ix-zoom absolute inset-0 max-w-none object-cover size-full pointer-events-none" src={imgSrc} />
        )}
      </div>

      {/* Pin + label */}
      <div className="absolute left-[24px] top-[333px] h-[9.22px] w-[9.714px]">
        <div className="absolute inset-[-43.39%_-41.18%]">
          <img alt="" className="block max-w-none size-full" src={PIN} />
        </div>
      </div>
      <p className="[word-break:break-word] absolute left-[42px] top-[329px] font-semibold leading-[17.86px] not-italic text-cream text-[18px] tracking-[2.995px] uppercase whitespace-nowrap">{label}</p>
    </motion.div>
  );
}
