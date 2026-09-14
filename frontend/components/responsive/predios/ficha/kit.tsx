"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import MobileFooter from "@/components/responsive/MobileFooter";
import { PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { EASE, In, WRAP } from "@/components/responsive/kit";
import { IcArea, IcBath, IcBed, IcCar, type TabKey } from "@/components/predios/ficha/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA DE PREDIO — piezas de la vista fluida (móvil y tablet).

   El escritorio es un lienzo de 1920 con todo posicionado; aquí no se escala
   nada, se rehace. Se conserva el vocabulario del rediseño —bandas marrón y
   crema que se muerden una esquina, tarjetas claras, la píldora oliva de las
   pestañas— y cambia lo que en una pantalla estrecha no funciona: el hero
   pasa a foto arriba y texto debajo, las rejillas de cuatro columnas se parten
   en dos o una, y las tablas anchas se vuelven filas de etiqueta y valor.

   Los textos y las cifras se leen de los componentes del lienzo para que no
   existan dos copias que se desincronicen.
   ═══════════════════════════════════════════════════════════════════════════ */

export const BROWN = "#492100";
export const CREAM = "#e2cdae";
export const LINEN = "#f7f1e5";
/** Crema de tarjeta sobre banda marrón. */
export const CARD = "#f7edd9";
export const HAIRLINE = "rgba(60,45,30,0.08)";
export const OLIVE = "#7f8b57";
export const DRIFT = "#a57a4e";
export const VERD = "#5f6b3e";
export const TUSCANY = "#b5542f";
export const MILL = "#6b5b47";
export const ZEUS = "#2a241c";

/* ── Bandas ───────────────────────────────────────────────────────────────
   El rediseño alterna marrón y crema, y cada sección muerde con una esquina
   redondeada a la de abajo. En el lienzo el radio es de 60 px sobre 1920; a
   ancho de móvil eso sería casi la mitad de la pantalla, así que baja a 40. */

export function Band({
  tone, corner, className = "", children,
}: { tone: "brown" | "cream"; corner?: "bl" | "br"; className?: string; children: ReactNode }) {
  const radius = corner === "bl" ? { borderBottomLeftRadius: 40 } : corner === "br" ? { borderBottomRightRadius: 40 } : {};
  return (
    <section
      className={`relative ${className}`}
      style={{ backgroundColor: tone === "brown" ? BROWN : CREAM, ...radius }}
    >
      {children}
    </section>
  );
}

/** Titular de sección. `dark` es para las bandas marrón. */
export function H2({ children, dark = false, className = "" }: { children: ReactNode; dark?: boolean; className?: string }) {
  return (
    <h2
      className={`m-0 text-[clamp(1.7rem,6.6vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.02em] ${className}`}
      style={{ color: dark ? CREAM : "#3d2c1e" }}
    >
      {children}
    </h2>
  );
}

export function Sub({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="m-0 mt-[12px] text-[clamp(0.95rem,3.7vw,1.08rem)] font-light leading-[1.55]" style={{ color: dark ? "rgba(226,205,174,0.82)" : MILL }}>
      {children}
    </p>
  );
}

/** Coletilla "(referencial)" del diseño. */
export function Ref({ dark = false }: { dark?: boolean }) {
  return <span className="ml-[8px] align-middle text-[12px] font-light" style={{ color: dark ? "rgba(226,205,174,0.6)" : "rgba(107,91,71,0.7)" }}>(referencial)</span>;
}

/** Tarjeta clara. Es el patrón de casi todo el contenido del rediseño. */
export function Card({ children, className = "", style, delay = 0 }: { children: ReactNode; className?: string; style?: CSSProperties; delay?: number }) {
  return (
    <In delay={delay} className={`rounded-[16px] border border-solid p-[18px] ${className}`} style={{ backgroundColor: CARD, borderColor: HAIRLINE, ...style }}>
      {children}
    </In>
  );
}

/* ── Pestañas ─────────────────────────────────────────────────────────────
   La franja oliva del lienzo, aquí a lo ancho de la pantalla. Las tres caben
   en 360 con el texto corto; el `overflow-x-auto` queda de red. */

const TABS: { key: TabKey; label: string; corto: string; href: string }[] = [
  { key: "oportunidad", label: "Oportunidad", corto: "Oportunidad", href: "/predios/ficha" },
  { key: "finanzas", label: "Finanzas", corto: "Finanzas", href: "/predios/ficha/finanzas" },
  { key: "transformacion", label: "Transformación", corto: "Transform.", href: "/predios/ficha/transformacion" },
];

export function TabsCompact({ active }: { active: TabKey }) {
  return (
    <nav
      aria-label="Secciones de la ficha"
      className="overflow-x-auto px-[24px] py-[14px] [scrollbar-width:none] sm:px-[40px] [&::-webkit-scrollbar]:hidden"
      style={{ backgroundColor: OLIVE, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }}
    >
      <div className="mx-auto flex max-w-[720px] gap-[6px]">
        {TABS.map((t, i) => {
          const on = t.key === active;
          return (
            <a
              key={t.key}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className="ix-pill relative flex h-[42px] flex-1 items-center justify-center whitespace-nowrap rounded-[14px] px-[10px] text-[14px] font-medium"
              style={{ color: on ? BROWN : "#e5dccf" }}
            >
              {on && (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-[14px]"
                  style={{ backgroundColor: "#b2bf89", filter: "drop-shadow(3px 3px 2px rgba(61,44,30,0.28))" }}
                  initial={{ scale: 0.72, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.03, ease: EASE }}
                />
              )}
              <span className="relative sm:hidden">{t.corto}</span>
              <span className="relative hidden sm:inline">{t.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────
   La foto pasa arriba a sangre y el texto debajo: en vertical no hay sitio
   para ponerlos uno al lado del otro, y partir la foto por la mitad con un
   velo —como hace el lienzo— deja ilegible lo poco que se vería de ella. */

const SPECS = [
  { Ic: IcArea, v: "320 m²", l: "Área total" },
  { Ic: IcBed, v: "3", l: "Habitaciones" },
  { Ic: IcBath, v: "3", l: "Baños" },
  { Ic: IcCar, v: "4", l: "Parqueaderos" },
];

export function HeroCompact({
  title, sub, media, cta, children,
}: {
  title: ReactNode;
  sub?: string;
  /** Lo que va arriba: la foto del inmueble o el comparador antes/después. */
  media: ReactNode;
  cta?: { label: string; href: string };
  /** La tarjeta de reserva, que en el lienzo va dentro del propio hero. */
  children?: ReactNode;
}) {
  return (
    <div className="relative" style={{ backgroundColor: BROWN, borderBottomLeftRadius: 40 }}>
      {media}

      <div className={`${WRAP} pb-[28px] pt-[24px]`}>
        <In y={16}>
          <p className="m-0 text-[11.5px] font-semibold uppercase leading-[1.5] tracking-[2px]" style={{ color: "#c9a877" }}>La Cabrera, Bogotá</p>
          <h1 className="mt-[10px] text-[clamp(2rem,8.4vw,3rem)] font-light leading-[1.08] tracking-[-0.02em]" style={{ color: "#efe6d5" }}>{title}</h1>
          {sub && <p className="m-0 mt-[14px] max-w-[520px] text-[clamp(0.95rem,3.8vw,1.1rem)] font-light leading-[1.5]" style={{ color: "rgba(247,241,229,0.82)" }}>{sub}</p>}
        </In>

        <div className="mt-[20px] grid grid-cols-2 gap-[10px] sm:grid-cols-4">
          {SPECS.map(({ Ic, v, l }, i) => (
            <In key={l} delay={0.04 * i} y={12} className="flex items-center gap-[10px] rounded-[14px] border border-solid px-[13px] py-[11px]" style={{ borderColor: "rgba(201,168,119,0.24)", background: "rgba(247,241,229,0.04)" }}>
              <Ic className="shrink-0" style={{ color: "#c9a877" }} />
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold leading-[1.2]" style={{ color: "#efe6d5" }}>{v}</span>
                <span className="block truncate text-[11px] leading-[1.3]" style={{ color: "rgba(247,241,229,0.6)" }}>{l}</span>
              </span>
            </In>
          ))}
        </div>

        {cta && (
          <In delay={0.12}>
            <a
              href={cta.href}
              className="ix-press mt-[20px] flex h-[52px] w-full max-w-[260px] items-center justify-center gap-[9px] rounded-[12px] text-[17px] font-semibold"
              style={{ backgroundColor: OLIVE, border: "1px solid rgba(60,45,30,0.13)", color: "rgba(247,241,229,0.95)" }}
            >
              {cta.label}
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </In>
        )}

        {children && <div className="mt-[26px]">{children}</div>}
      </div>
    </div>
  );
}

/** Foto del inmueble a sangre, con el marrón entrando por abajo. */
export function HeroFoto() {
  return (
    <div className="relative">
      <img src="/figma/ficha-hero.webp" alt="" fetchPriority="high" decoding="async" className="block w-full max-w-none object-cover" style={{ aspectRatio: "16 / 10" }} />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 block h-[38%]" style={{ background: "linear-gradient(180deg, rgba(73,33,0,0) 0%, rgba(73,33,0,0.86) 62%, #492100 100%)" }} />
    </div>
  );
}

/* ── Tarjeta de reserva ───────────────────────────────────────────────────
   El lateral del lienzo, entero. En columna cae justo después del hero, que
   es donde está en escritorio. */

function useCuentaAtras(inicio: number) {
  const [s, setS] = useState(inicio);
  useEffect(() => {
    const id = window.setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export function ReservaCompact() {
  const tiempo = useCuentaAtras(2 * 3600 + 59 * 60 + 38);
  const BORDE = "rgba(90,67,50,0.16)";

  return (
    <In className="overflow-hidden rounded-[20px] border border-solid" style={{ background: LINEN, borderColor: BORDE, boxShadow: "0 30px 60px -40px rgba(42,30,20,0.4)" }}>
      <div className="flex items-center justify-center gap-[8px] px-[20px] py-[11px]" style={{ background: TUSCANY }}>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth={1.4} aria-hidden><path d="M7.58333 1.16667L1.75 8.16667H5.83333L5.25 12.8333L11.0833 5.83333H7L7.58333 1.16667Z" /></svg>
        <span className="text-[12.5px] font-bold tracking-[0.4px] text-white">No te pierdas esta oportunidad</span>
      </div>

      <div className="p-[20px]">
        <div className="flex items-center gap-[13px] border-b border-solid pb-[16px]" style={{ borderColor: BORDE }}>
          <span className="text-[26px] font-bold leading-none" style={{ color: VERD }}>96/100</span>
          <span>
            <span className="block text-[10.6px] uppercase tracking-[0.6px]" style={{ color: "#5b4332" }}>Score Zequara</span>
            <span className="block text-[15px] font-semibold" style={{ color: ZEUS }}>Prioridad alta</span>
          </span>
        </div>

        <p className="m-0 mt-[16px] text-[12px] font-light" style={{ color: "#5b4332" }}>Inversión total</p>
        <div className="mt-[2px] flex items-baseline gap-[8px]">
          <span className="text-[clamp(1.9rem,8vw,2.4rem)] font-light leading-[1.15] tracking-[-0.02em]" style={{ color: "#3d2c1e" }}>$3.100M</span>
          <span className="text-[13px] font-light" style={{ color: "#5b4332" }}>COP</span>
        </div>

        <div className="mt-[12px] flex items-baseline justify-between gap-[10px] border-b border-solid pb-[16px]" style={{ borderColor: BORDE }}>
          <span className="text-[13px] font-light" style={{ color: "#5b4332" }}>ROI estimado</span>
          <span className="text-[18px] font-bold" style={{ color: VERD }}>~22%</span>
        </div>

        <div className="mt-[16px] flex items-center gap-[10px] rounded-[12px] border border-solid px-[14px] py-[12px]" style={{ background: "rgba(181,84,47,0.08)", borderColor: "rgba(181,84,47,0.25)" }}>
          <svg width={18} height={18} viewBox="0 0 18 18" fill="none" stroke={TUSCANY} strokeWidth={1.425} aria-hidden><path d="M9 15.75C12.7279 15.75 15.75 12.7279 15.75 9C15.75 5.27208 12.7279 2.25 9 2.25C5.27208 2.25 2.25 5.27208 2.25 9C2.25 12.7279 5.27208 15.75 9 15.75ZM9 5.25V9L11.25 10.5" /></svg>
          <span>
            <span className="block text-[11.5px] font-light" style={{ color: "#5b4332" }}>Reserva disponible por</span>
            <span className="block text-[18px] font-bold tabular-nums" style={{ color: TUSCANY }}>{tiempo}</span>
          </span>
        </div>

        <button type="button" className="ix-press mt-[16px] flex h-[56px] w-full items-center justify-center gap-[9px] rounded-[12px] text-[16.5px] font-semibold text-white" style={{ background: TUSCANY, boxShadow: "0 14px 28px -14px rgba(181,84,47,0.7)" }}>
          <svg width={17} height={17} viewBox="0 0 17 17" fill="none" stroke="#fff" strokeWidth={1.558} aria-hidden><path d="M9.20833 1.41667L2.125 9.91667H7.08333L6.375 15.5833L13.4583 7.08333H8.5L9.20833 1.41667Z" /></svg>
          Reservar ahora
        </button>

        <p className="m-0 mt-[14px] text-center text-[12.5px] font-medium" style={{ color: TUSCANY }}>
          <span className="motion-safe:animate-pulse">●</span> 5 inversionistas viendo este predio
        </p>
        <p className="m-0 mt-[8px] text-center text-[12px] font-light leading-[1.5]" style={{ color: "#5b4332" }}>
          Al reservar, <span className="font-semibold" style={{ color: "#3d2c1e" }}>el predio se bloquea</span> y deja de estar disponible para otros mientras tu reserva esté vigente.
        </p>
      </div>
    </In>
  );
}

/* ── Marcador de foto pendiente ───────────────────────────────────────────
   La trama diagonal con la que el diseño señala los huecos de imagen. */

export function FotoPendiente({ caption, ratio = "4 / 3", className = "" }: { caption: string; ratio?: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[14px] ${className}`}
      style={{
        aspectRatio: ratio,
        backgroundColor: BROWN,
        backgroundImage: "linear-gradient(148deg, rgba(201,168,119,0.16) 0%, rgba(201,168,119,0) 100%), repeating-linear-gradient(32deg, rgba(247,241,229,0.05) 0 12px, rgba(247,241,229,0) 12px 24px)",
      }}
    >
      <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width={26} height={26} viewBox="0 0 22 22" fill="none" stroke="rgba(247,241,229,0.5)" strokeWidth={1.1875} aria-hidden>
        <path d="M17.4167 3.66667H4.58333C3.57081 3.66667 2.75 4.48748 2.75 5.5V16.5C2.75 17.5125 3.57081 18.3333 4.58333 18.3333H17.4167C18.4292 18.3333 19.25 17.5125 19.25 16.5V5.5C19.25 4.48748 18.4292 3.66667 17.4167 3.66667ZM2.75 13.75L6.41667 10.0833L11 14.6667" />
      </svg>
      <span className="absolute bottom-[10px] left-[10px] rounded-[6px] px-[9px] py-[4px] text-[9.9px] uppercase tracking-[0.6px]" style={{ background: "rgba(20,14,9,0.6)", color: "#efe6d5" }}>{caption}</span>
    </div>
  );
}

/* ── Armazón de página ────────────────────────────────────────────────────
   Nav, pestañas, contenido, barra fija de acción y pie. */

export function FichaShellCompact({ tab, hero, children }: { tab: TabKey; hero: ReactNode; children: ReactNode }) {
  return (
    <div style={{ backgroundColor: CREAM }}>
      <PrediosNavCompact />
      {hero}
      <TabsCompact active={tab} />
      {children}

      {/* En una ficha larga la acción no puede quedar a diez pantallas de
          scroll de donde se toma la decisión. */}
      <div className="sticky bottom-0 z-30 border-t border-solid px-[24px] pb-[16px] pt-[13px] sm:px-[40px]" style={{ background: "rgba(42,30,20,0.96)", borderColor: "rgba(165,122,78,0.28)", backdropFilter: "blur(6px)" }}>
        <div className="mx-auto flex max-w-[720px] items-center gap-[12px]">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[16px] font-semibold" style={{ color: LINEN }}>COP $3.100M</span>
            <span className="block text-[11.5px] font-light" style={{ color: "rgba(247,241,229,0.6)" }}>Compra + remodelación</span>
          </span>
          <button type="button" className="ix-press flex h-[48px] shrink-0 items-center justify-center rounded-full px-[20px] text-[15px] font-semibold text-white" style={{ background: TUSCANY }}>
            Reservar ahora
          </button>
        </div>
      </div>

      <MobileFooter />
    </div>
  );
}
