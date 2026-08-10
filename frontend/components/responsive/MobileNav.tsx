"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MARK } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   NAV DE MÓVIL Y TABLET — barra fija arriba y cajón a pantalla completa.

   La barra del escritorio mide 173 px de alto y lleva cuatro enlaces sueltos
   en absoluto: no cabe. Aquí la barra es sticky y estrecha, y los enlaces se
   van a un cajón que entra desde la derecha con las líneas escalonadas.

   El botón es el mismo en los dos estados: las tres rayas se convierten en
   aspa girando y encogiendo la del medio, así que no hay salto entre iconos.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/modelo", label: "¿Cómo operamos?" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/hub", label: "HUB" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Al cambiar de ruta el cajón se cierra solo: si no, queda abierto encima de
  // la página nueva.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-brown-dark/95 backdrop-blur-sm">
        <div className="mx-auto flex h-[64px] max-w-[880px] items-center justify-between px-[20px] sm:h-[72px]">
          <a href="/" aria-label="Zequara — Inicio" className="block h-[34px] w-[37px] shrink-0 sm:h-[38px] sm:w-[42px]">
            <img src={MARK} alt="" decoding="async" className="block size-full max-w-none" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="relative -mr-[8px] flex size-[44px] items-center justify-center"
          >
            <span className="relative block h-[14px] w-[24px]">
              {([0, 1, 2] as const).map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-0 block h-[2px] w-full rounded-full bg-sand"
                  style={{ top: i * 6 }}
                  animate={
                    open
                      ? [{ y: 6, rotate: 45 }, { opacity: 0, scaleX: 0.2 }, { y: -6, rotate: -45 }][i]
                      : { y: 0, rotate: 0, opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.32, ease: EASE }}
                />
              ))}
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 xl:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden />
            <motion.nav
              aria-label="Principal"
              className="absolute inset-y-0 right-0 flex w-[min(340px,86vw)] flex-col bg-brown-dark pt-[84px]"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.42, ease: EASE }}
            >
              <div className="flex flex-col px-[28px]">
                {LINKS.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    aria-current={pathname === l.href ? "page" : undefined}
                    className="border-b border-solid border-[rgba(226,205,174,0.14)] py-[18px] text-[22px] font-medium text-sand aria-[current=page]:text-tan"
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.12 + i * 0.06, ease: EASE }}
                  >
                    {l.label}
                  </motion.a>
                ))}
              </div>

              <motion.div
                className="mt-auto flex flex-col gap-[12px] px-[28px] pb-[36px]"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.36, ease: EASE }}
              >
                <a href="/login" className="flex h-[54px] items-center justify-center rounded-full border-2 border-solid border-sand text-[16px] font-medium text-sand">
                  Iniciar sesión
                </a>
                <a href="/solicitud-acceso" className="flex h-[54px] items-center justify-center rounded-full bg-cream text-[16px] font-semibold text-brown-dark">
                  Solicitar acceso
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
