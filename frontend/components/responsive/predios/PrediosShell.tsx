"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MARK, tinted } from "@/components/brand";
import { EASE } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   CABECERA DEL ÁREA PRIVADA para móvil y tablet.

   La del escritorio es un grupo de tres píldoras de 492 px con el logotipo a
   un lado y el avatar al otro: en 390 no cabe. Aquí va en dos filas —marca y
   avatar arriba, las tres píldoras debajo— y la fila de píldoras se desplaza
   en horizontal si hace falta, en vez de encoger el texto.

   `onLight` para Mis propiedades, que es la única del área con fondo claro: el
   logotipo se pinta en marrón con máscara y la barra en marrón sólido, como en
   la versión de escritorio.
   ═══════════════════════════════════════════════════════════════════════════ */

const BROWN = "#492100";

const LINKS = [
  { href: "/predios", label: "Predios disponibles" },
  { href: "/predios/add-value", label: "Análisis de valor" },
  { href: "/predios/mis-propiedades", label: "Mis propiedades" },
];

export function PrediosNavCompact({ onLight = false }: { onLight?: boolean }) {
  const pathname = usePathname();
  return (
    <header className={`sticky top-0 z-40 ${onLight ? "bg-cream/95" : "bg-[#2a1e14]/95"} backdrop-blur-sm`}>
      <div className="mx-auto max-w-[720px] px-[20px] pb-[10px] pt-[12px]">
        <div className="flex items-center justify-between">
          <a href="/" aria-label="Zequara — Inicio" className="ix-nav block size-[34px] shrink-0">
            {onLight
              ? <span aria-hidden className="block size-full" style={tinted(MARK, BROWN)} />
              : <img src={MARK} alt="" decoding="async" className="block size-full max-w-none" />}
          </a>
          <span
            className="flex size-[36px] items-center justify-center rounded-full border border-solid text-[12.5px] font-semibold"
            style={{ background: "rgba(201,168,119,0.28)", borderColor: onLight ? "rgba(73,33,0,0.18)" : "rgba(247,241,229,0.12)", color: onLight ? BROWN : "#c9a877" }}
          >
            NR
          </span>
        </div>

        {/* Barra de píldoras. `overflow-x-auto` para que las tres quepan sin
            recortar la etiqueta en pantallas de 360. */}
        <nav aria-label="Área de predios" className="-mx-[20px] mt-[10px] overflow-x-auto px-[20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-[6px] rounded-full p-[5px]" style={{ background: BROWN, border: "1px solid rgba(247,241,229,0.12)" }}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className="ix-pill flex h-[38px] items-center whitespace-nowrap rounded-full px-[16px] text-[13.6px] font-medium"
              >
                {l.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

/** Encabezado de página del área privada: antetítulo, titular y bajada. */
export function PrediosHead({ eyebrow, title, children, dark }: { eyebrow: string; title: ReactNode; children?: ReactNode; dark?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}
    >
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[2.6px]" style={{ color: dark ? BROWN : "#c9a877" }}>{eyebrow}</p>
      <h1 className="mt-[10px] text-[clamp(1.9rem,7.6vw,2.8rem)] font-light leading-[1.1] tracking-[-0.02em]" style={{ color: dark ? BROWN : "#f7f1e5" }}>
        {title}
      </h1>
      {children && (
        <p className="mt-[12px] text-[clamp(0.95rem,3.6vw,1.05rem)] font-light leading-[1.6]" style={{ color: dark ? "rgba(91,67,50,0.9)" : "rgba(247,241,229,0.75)" }}>
          {children}
        </p>
      )}
    </motion.div>
  );
}
