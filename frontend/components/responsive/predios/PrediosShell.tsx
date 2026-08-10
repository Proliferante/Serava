"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

/** `corto` es la etiqueta de móvil: las tres completas suman 479 px y no caben. */
const LINKS = [
  { href: "/predios", label: "Predios disponibles", corto: "Predios" },
  { href: "/predios/add-value", label: "Análisis de valor", corto: "Análisis" },
  { href: "/predios/mis-propiedades", label: "Mis propiedades", corto: "Mis propiedades" },
];

export function PrediosNavCompact({ onLight = false }: { onLight?: boolean }) {
  const pathname = usePathname();
  const pista = useRef<HTMLDivElement>(null);
  const [oculta, setOculta] = useState(false);

  /**
   * La cabecera se retira al bajar y vuelve al subir, como la del sitio
   * público. Umbral de 8 px para que no tiemble con el rebote del scroll, y
   * por debajo de 120 nunca se esconde: arriba del todo siempre está.
   */
  const { scrollY } = useScroll();
  const ultimo = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    const d = y - ultimo.current;
    if (Math.abs(d) < 8) return;
    ultimo.current = y;
    setOculta(y > 120 && d > 0);
  });

  /**
   * La píldora activa, a la vista. Aunque con etiquetas cortas las tres caben
   * en 390, en pantallas de 320 la última se sale; y llegar a "Mis propiedades"
   * sin ver cuál está marcada era justo lo que se veía roto.
   *
   * Se mueve `scrollLeft` de la pista y no `scrollIntoView`, que arrastraría
   * también el scroll de la página.
   */
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const activa = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (!activa) return;
    const centro = activa.offsetLeft + activa.offsetWidth / 2 - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, centro);
  }, [pathname]);

  return (
    <motion.header
      className={`sticky top-0 z-40 ${onLight ? "bg-cream/95" : "bg-[#2a1e14]/95"} backdrop-blur-sm`}
      animate={{ y: oculta ? "-100%" : "0%" }}
      transition={{ duration: 0.34, ease: EASE }}
    >
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

        {/* Barra de píldoras. Ocupa el ancho y las tres se reparten el sitio;
            el `overflow-x-auto` queda de red por si la etiqueta no cupiera. */}
        <nav
          ref={pista}
          aria-label="Área de predios"
          className="-mx-[20px] mt-[10px] overflow-x-auto px-[20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-full gap-[4px] rounded-full p-[5px] sm:w-max" style={{ background: BROWN, border: "1px solid rgba(247,241,229,0.12)" }}>
            {LINKS.map((l, i) => {
              const activa = pathname === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={activa ? "page" : undefined}
                  className="ix-pill ix-pill-fluid relative flex h-[38px] flex-1 items-center justify-center whitespace-nowrap rounded-full px-[12px] text-[13px] font-medium sm:flex-none sm:px-[16px] sm:text-[13.6px]"
                >
                  {/* El fondo de la activa entra creciendo desde el centro, para
                      que al cambiar de pestaña se note dónde caíste. */}
                  {activa && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ background: "#7f8b57" }}
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.06 + i * 0.03, ease: EASE }}
                    />
                  )}
                  <span className="relative sm:hidden">{l.corto}</span>
                  <span className="relative hidden sm:inline">{l.label}</span>
                </a>
              );
            })}
          </div>
        </nav>
      </div>
    </motion.header>
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
