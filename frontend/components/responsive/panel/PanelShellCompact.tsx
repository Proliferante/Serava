"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MARK } from "@/components/brand";
import { Ico, type IconName } from "@/components/panel/icons";
import type { PanelKey } from "@/components/panel/Shell";
import { HELPBG, LASER, LINEN, LINEN40, LINEN72, OIL, PAPER, SHELL, TUSCANY } from "@/components/panel/ui";
import { EASE, PWRAP } from "@/components/responsive/panel/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   MARCO DEL PANEL en móvil y tablet.

   El del escritorio son 248 px de barra lateral fija más una barra de proyecto
   de 75: en 390 px eso se come media pantalla. Aquí la lateral pasa a un cajón
   que entra desde la derecha con los mismos dos grupos y los mismos diez
   destinos, y la barra de proyecto se queda arriba en dos líneas —nombre y
   estado— porque es la que dice dónde estás.

   La barra se retira al bajar y vuelve al subir, como en el resto del sitio, y
   la línea de progreso va fija al filo de la pantalla para que no se vaya con
   ella.
   ═══════════════════════════════════════════════════════════════════════════ */

type NavItem = { key: PanelKey; label: string; icon: IconName; href: string; badge?: number };

/** Los mismos dos grupos del sidebar, en el mismo orden. */
const GRUPOS: { label: string; items: NavItem[] }[] = [
  {
    label: "Tu obra",
    items: [
      { key: "resumen", label: "Resumen", icon: "home", href: "/panel" },
      { key: "avance", label: "Avance de obra", icon: "progress", href: "/panel/avance" },
      { key: "presupuesto", label: "Presupuesto", icon: "budget", href: "/panel/presupuesto" },
      { key: "aprobaciones", label: "Aprobaciones", icon: "approvals", href: "/panel/aprobaciones", badge: 2 },
      { key: "interventoria", label: "Interventoría", icon: "audit", href: "/panel/interventoria" },
    ],
  },
  {
    label: "Tu activo",
    items: [
      { key: "operacion", label: "Operación del activo", icon: "key", href: "/panel/operacion" },
      { key: "fotos", label: "Fotos y avance visual", icon: "photos", href: "/panel/fotos" },
      { key: "valor", label: "Proyección de valor", icon: "value", href: "/panel/valor" },
      { key: "documentos", label: "Documentos", icon: "docs", href: "/panel/documentos" },
      { key: "gestor", label: "Mi gestor", icon: "manager", href: "/panel/gestor" },
    ],
  },
];

/** Todas las vistas en fila, para la barra de pestañas deslizante. */
const TODAS = GRUPOS.flatMap((g) => g.items);

export default function PanelShellCompact({
  active,
  project = "La Cabrera · Bogotá",
  meta = "Apartamento 320 m² · Proyecto en ejecución",
  state = "En obra · Semana 9 de 12",
  children,
}: {
  active: PanelKey;
  project?: string;
  meta?: string;
  state?: string;
  children: ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const [oculta, setOculta] = useState(false);
  const ruta = usePathname();
  const pista = useRef<HTMLDivElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const ultimo = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    if (abierto) return;
    const d = y - ultimo.current;
    if (Math.abs(d) < 8) return;
    ultimo.current = y;
    setOculta(y > 140 && d > 0);
  });
  const progreso = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  // El cajón se cierra al cambiar de vista: si no, queda abierto encima.
  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAbierto(false); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  /**
   * La pestaña activa, a la vista. Se mueve `scrollLeft` de la pista y no
   * `scrollIntoView`, que arrastraría también el scroll de la página.
   */
  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const activa = el.querySelector<HTMLElement>('[aria-current="page"]');
    if (!activa) return;
    el.scrollLeft = Math.max(0, activa.offsetLeft + activa.offsetWidth / 2 - el.clientWidth / 2);
  }, [ruta]);

  return (
    <div style={{ background: PAPER, minHeight: "100vh" }}>
      <motion.header
        className="sticky top-0 z-40"
        style={{ background: OIL }}
        animate={{ y: oculta ? "-100%" : "0%" }}
        transition={{ duration: 0.34, ease: EASE }}
      >
        <div className={`${PWRAP} flex items-center gap-[12px] py-[11px]`}>
          <a href="/" aria-label="Zequara — Inicio" className="ix-nav block size-[32px] shrink-0">
            <img src={MARK} alt="Zequara" decoding="async" className="block size-full max-w-none" />
          </a>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-semibold leading-[1.35]" style={{ color: LINEN }}>{project}</span>
            <span className="block truncate text-[11.5px] font-light leading-[1.35]" style={{ color: LINEN40 }}>{meta}</span>
          </span>

          <button
            type="button"
            aria-label="Notificaciones"
            className="pnl-nav relative shrink-0"
            style={{ color: LINEN72, background: "none", border: 0 }}
          >
            <Ico name="bell" size={19} />
            <span className="absolute -top-[2px] left-[13px] size-[8px] rounded-full" style={{ background: TUSCANY, boxShadow: `0 0 0 2px ${OIL}` }} />
          </button>

          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? "Cerrar menú del panel" : "Abrir menú del panel"}
            className="relative flex size-[40px] shrink-0 items-center justify-center"
          >
            <span className="relative block h-[13px] w-[22px]">
              {([0, 1, 2] as const).map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-0 block h-[2px] w-full rounded-full"
                  style={{ top: i * 5.5, background: LASER }}
                  animate={
                    abierto
                      ? [{ y: 5.5, rotate: 45 }, { opacity: 0, scaleX: 0.2 }, { y: -5.5, rotate: -45 }][i]
                      : { y: 0, rotate: 0, opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.3, ease: EASE }}
                />
              ))}
            </span>
          </button>
        </div>

        {/* Estado de obra y pestañas. La fila de pestañas evita tener que abrir
            el cajón para saltar a la vista de al lado, que es el movimiento más
            frecuente dentro del panel. */}
        <div className="border-t border-solid" style={{ borderColor: "rgba(201,168,119,0.16)" }}>
          <div className={`${PWRAP} flex items-center gap-[10px] py-[8px]`}>
            <span
              className="inline-flex shrink-0 items-center gap-[7px] rounded-full px-[11px] py-[5px]"
              style={{ border: "1px solid rgba(201,168,119,0.28)", background: "rgba(247,241,229,0.05)" }}
            >
              <span className="ix-live block size-[6px] rounded-full" style={{ background: "#7f8b57" }} />
              <span className="whitespace-nowrap text-[11px] font-medium" style={{ color: LINEN72 }}>{state}</span>
            </span>
          </div>

          <nav
            ref={pista}
            aria-label="Vistas del panel"
            className="overflow-x-auto pb-[9px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max gap-[6px] px-[16px] sm:px-[24px]">
              {TODAS.map((it) => {
                const on = it.key === active;
                return (
                  <a
                    key={it.key}
                    href={it.href}
                    aria-current={on ? "page" : undefined}
                    className="relative inline-flex h-[34px] shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full px-[13px] text-[12.5px] font-medium"
                    style={on
                      ? { background: LASER, color: OIL }
                      : { background: "rgba(247,241,229,0.06)", color: LINEN72 }}
                  >
                    <Ico name={it.icon} size={14} />
                    {it.label}
                    {it.badge != null && (
                      <span
                        className="inline-flex items-center justify-center rounded-full px-[5px]"
                        style={{ minWidth: 16, height: 16, background: TUSCANY, color: LINEN, fontSize: 9.5, fontWeight: 700 }}
                      >
                        {it.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </nav>
        </div>
      </motion.header>

      <motion.span
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] block h-[3px] origin-left"
        style={{ scaleX: progreso, background: "linear-gradient(90deg, #a57a4e 0%, #c9a877 100%)" }}
      />

      {/* ── Cajón con los dos grupos ── */}
      <AnimatePresence>
        {abierto && (
          <motion.div
            className="fixed inset-0 z-[70]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="absolute inset-0 bg-black/55" aria-hidden onClick={() => setAbierto(false)} />
            <motion.nav
              aria-label="Menú del panel"
              className="absolute inset-y-0 right-0 flex w-[min(320px,86vw)] flex-col overflow-y-auto px-[20px] pb-[24px] pt-[22px]"
              style={{ background: SHELL }}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {GRUPOS.map((g, gi) => (
                <div key={g.label} className={gi ? "mt-[22px]" : ""}>
                  <p className="m-0 uppercase" style={{ fontSize: 10, lineHeight: "15px", letterSpacing: "1.3px", fontWeight: 600, color: LINEN40 }}>
                    {g.label}
                  </p>
                  <div className="mt-[8px] flex flex-col gap-[2px]">
                    {g.items.map((it, i) => (
                      <motion.a
                        key={it.key}
                        href={it.href}
                        aria-current={it.key === active ? "page" : undefined}
                        className="pnl-navitem flex h-[46px] items-center gap-[12px] px-[12px]"
                        style={{ borderRadius: 11 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.36, delay: 0.08 + (gi * 5 + i) * 0.03, ease: EASE }}
                      >
                        <span className="pnl-navitem-ico"><Ico name={it.icon} size={18} /></span>
                        <span className="pnl-navitem-label flex-1 text-[14.4px]">{it.label}</span>
                        {it.badge != null && (
                          <span
                            className="inline-flex items-center justify-center rounded-full px-[6px]"
                            style={{ minWidth: 19, height: 19, background: TUSCANY, color: LINEN, fontSize: 10.5, fontWeight: 700 }}
                          >
                            {it.badge}
                          </span>
                        )}
                      </motion.a>
                    ))}
                  </div>
                </div>
              ))}

              {/* La misma caja de ayuda del sidebar, al pie. */}
              <a href="/panel/gestor" className="pnl-nav mt-auto flex items-start gap-[12px] p-[16px]" style={{ borderRadius: 12, background: HELPBG }}>
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(201,168,119,0.16)", color: LASER }}>
                  <Ico name="help" size={18} />
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold" style={{ color: LINEN }}>¿Necesitas ayuda?</span>
                  <span className="mt-[2px] block text-[11.5px] font-light leading-[1.45]" style={{ color: LINEN40 }}>
                    Comunícate con tu gestor de proyecto.
                  </span>
                </span>
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contenido ── */}
      <div className="relative">
        {/* La misma silueta de ciudad del escritorio, al mismo 60 %. */}
        <img
          src="/figma/Fondo_Panel.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-x-0 top-0 w-full max-w-none"
          style={{ opacity: 0.6 }}
        />
        <div className={`${PWRAP} relative py-[22px]`}>{children}</div>
      </div>
    </div>
  );
}
