"use client";

import { MotionConfig } from "framer-motion";
import { useMemo, useState } from "react";
import MobileNav from "@/components/responsive/MobileNav";
import MobileFooter from "@/components/responsive/MobileFooter";
import { CARDS } from "@/components/sections/hub/HubCardsGrid";
import { BROWN, CREAM, In, LASER, MILLBROOK, WRAP } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   HUB — vista fluida para móvil y tablet (por debajo de 1280).

   El lienzo son 1920 × 3827 con la rejilla de fichas a tres columnas. Aquí
   van en una (dos desde 640) y el buscador, que en escritorio es decorativo,
   filtra de verdad: en una lista larga y en columna, encontrar algo a base de
   scroll es el problema principal de esta página en pantalla pequeña.

   Los filtros por categoría salen del propio contenido, así que no hay lista
   que mantener aparte.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

const TIPO: Record<string, string> = { article: "Artículo", video: "Video", noticia: "Noticia" };

/** Las mismas pestañas de tipo del lienzo, con el tipo del dato detrás. */
const TABS: { label: string; type: string | null }[] = [
  { label: "Todos", type: null },
  { label: "Artículos", type: "article" },
  { label: "Videos", type: "video" },
  { label: "Noticias", type: "noticia" },
];

export default function HubCompact() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);

  const categorias = useMemo(() => [...new Set(CARDS.map((c) => c.category))], []);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return CARDS.filter((c) => {
      if (tipo && c.type !== tipo) return false;
      if (cat && c.category !== cat) return false;
      if (!t) return true;
      return [c.title.join(" "), c.desc.join(" "), c.category, TIPO[c.type] ?? ""].join(" ").toLowerCase().includes(t);
    });
  }, [q, cat, tipo]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-cream">
        <MobileNav />

        {/* ══════════ HERO ══════════ */}
        <section className="relative overflow-hidden bg-brown-dark">
          <img
            src={`${A}/0399392c61096f2f9a6febf99f556a00af4eb6ac.webp`} alt="" loading="eager" decoding="async"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-45"
          />
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "linear-gradient(180deg, rgba(73,33,0,0.66) 0%, rgba(73,33,0,0.94) 100%)" }} />
          <div className={`${WRAP} relative pb-[52px] pt-[52px]`}>
            <In y={16}>
              <p className="m-0 text-[11px] font-semibold uppercase leading-[1.5] tracking-[2.6px]" style={{ color: LASER }}>Conocimiento Zequara</p>
            </In>
            <In y={20} delay={0.08}>
              <h1 className="mt-[12px] text-[clamp(2rem,8.4vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-cream-93">
                Criterio para invertir mejor en <span className="font-semibold">finca raíz.</span>
              </h1>
              <p className="mt-[14px] text-[clamp(0.95rem,3.6vw,1.05rem)] font-light leading-[1.6] text-[rgba(247,241,229,0.78)]">
                Artículos, análisis y videos sobre patrimonio, mercado inmobiliario y el método Zequara. Lo que necesitas saber antes de cada decisión.
              </p>
            </In>

            <In delay={0.16} className="mt-[24px]">
              <label className="relative block">
                <span className="sr-only">Buscar en el hub</span>
                <svg className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="rgba(247,241,229,0.5)" strokeWidth={1.9} strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar artículos, videos, noticias…"
                  className="ix-field h-[54px] w-full rounded-full border border-solid pl-[48px] pr-[18px] text-[15px] text-cream-93 outline-none placeholder:text-[rgba(247,241,229,0.45)]"
                  style={{ background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)" }}
                />
              </label>
            </In>
          </div>
        </section>

        {/* ══════════ DESTACADO ══════════ */}
        <section className={`${WRAP} pt-[40px]`}>
          <In>
            <a href="#" className="ix-card block overflow-hidden rounded-[24px] bg-brown-dark shadow-[0px_34px_70px_-36px_rgba(42,30,20,0.55)]">
              <div className="flex h-[172px] items-center justify-center" style={{ backgroundImage: "linear-gradient(155deg, #5b4332 0%, #3d2c1e 100%)" }}>
                <span className="text-[11px] font-semibold uppercase tracking-[1.4px]" style={{ color: "rgba(247,241,229,0.6)" }}>Imagen artículo — patrimonio</span>
              </div>
              <div className="p-[24px]">
                <span className="inline-flex items-center gap-[7px] rounded-full px-[12px] py-[5px] text-[10.6px] font-semibold uppercase tracking-[1.7px]" style={{ background: "rgba(201,168,119,0.22)", color: LASER }}>Artículo · Patrimonio</span>
                <h2 className="m-0 mt-[14px] text-[clamp(1.3rem,5.8vw,1.85rem)] font-light leading-[1.14] tracking-[-0.02em] text-cream-93">
                  Cómo se construye patrimonio con finca raíz (y no solo se compra)
                </h2>
                <p className="m-0 mt-[10px] text-[15px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.82)" }}>
                  La diferencia entre tener un inmueble y hacerlo trabajar para tu patrimonio.
                </p>
                <span className="mt-[14px] inline-flex items-center gap-[7px] text-[15px] font-semibold" style={{ color: LASER }}>
                  Leer ahora
                  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4.5 12h15M13.6 6.2 19.5 12l-5.9 5.8" /></svg>
                </span>
              </div>
            </a>
          </In>
        </section>

        {/* ══════════ NEWSLETTER ══════════ */}
        <section className={`${WRAP} pt-[28px]`}>
          {/* El mismo verde oliva del lienzo, no un degradado suave. */}
          <In className="rounded-[24px] p-[24px]" style={{ background: "#687540" }}>
            <h2 className="m-0 text-[clamp(1.3rem,5.6vw,1.75rem)] font-light leading-[1.15] tracking-[-0.02em] text-cream-93">Recibe nuestro criterio cada mes.</h2>
            <p className="m-0 mt-[9px] text-[14.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.85)" }}>
              Análisis de mercado, casos reales y aprendizajes del método Zequara. Sin ruido.
            </p>
            <form className="mt-[16px] flex flex-col gap-[10px] sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email" required placeholder="nombre@correo.com" aria-label="Correo electrónico"
                /* `sm:flex-1` y no `flex-1`: en columna, `flex-basis: 0` cae
                   sobre el alto y aplasta el campo a la altura del texto. */
                className="ix-field h-[52px] shrink-0 rounded-full border border-solid px-[23px] text-[15px] text-cream-93 outline-none sm:flex-1"
                style={{ background: "rgba(247,241,229,0.1)", borderColor: "rgba(247,241,229,0.4)" }}
              />
              <button type="submit" className="ix-press h-[52px] shrink-0 rounded-full px-[26px] text-[15px] font-semibold" style={{ background: "#f7f1e5", color: BROWN }}>
                Suscribirme
              </button>
            </form>
            <p className="m-0 mt-[12px] text-[13px] font-light" style={{ color: "rgba(247,241,229,0.7)" }}>Te avisaremos cada mes. Sin ruido.</p>
          </In>
        </section>

        {/* ══════════ REJILLA ══════════ */}
        <section className="relative overflow-hidden pb-[62px] pt-[38px]">
          {/* La trama de mapa del lienzo, al mismo 15 %. */}
          <img src={`${A}/d97817dcb8ef87e0a52ccef1d65f05587ff8c8dd.webp`} alt="" loading="lazy" decoding="async" className="pointer-events-none absolute inset-0 size-full object-cover opacity-15" />
          <div className={`${WRAP} relative`}>
          <div className="flex items-baseline justify-between gap-[12px]">
            <p className="m-0 text-[clamp(1.05rem,4.4vw,1.3rem)] font-medium" style={{ color: BROWN }}>Explora el contenido</p>
            <p className="m-0 text-[13px] font-light" style={{ color: MILLBROOK }}>
              {visibles.length} {visibles.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>

          {/* Pestañas de tipo, las mismas del lienzo. Van en su barra crema
              con la pastilla activa deslizándose, como en escritorio. */}
          <div className="mt-[14px] flex gap-[2px] rounded-full p-[5px]" style={{ background: "#efe6d5" }} role="tablist" aria-label="Tipo de contenido">
            {TABS.map((t) => {
              const on = tipo === t.type;
              return (
                <button
                  key={t.label} type="button" role="tab" aria-selected={on} onClick={() => setTipo(t.type)}
                  className="relative flex-1 rounded-full px-[10px] py-[9px] text-[13px] font-medium transition-colors"
                  style={on ? { background: BROWN, color: CREAM } : { background: "transparent", color: MILLBROOK }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Filtros por categoría. Salen del propio contenido. */}
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            {[null, ...categorias].map((c) => {
              const on = cat === c;
              return (
                <button
                  key={c ?? "todas"} type="button" onClick={() => setCat(c)} aria-pressed={on}
                  className="rounded-full border border-solid px-[14px] py-[8px] text-[13px] transition-colors"
                  style={on
                    ? { background: BROWN, borderColor: BROWN, color: CREAM }
                    : { background: "transparent", borderColor: "rgba(165,122,78,0.4)", color: MILLBROOK }}
                >
                  {c ?? "Todas"}
                </button>
              );
            })}
          </div>

          <div className="mt-[20px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            {visibles.map((c, i) => (
              <In key={c.title.join("")} delay={Math.min(i, 5) * 0.05}>
                <a href="#" className="ix-card flex h-full flex-col overflow-hidden rounded-[20px] border border-solid" style={{ borderColor: "rgba(165,122,78,0.28)", background: "#f7f1e5" }}>
                  <div className="relative flex h-[128px] items-center justify-center" style={{ backgroundImage: "linear-gradient(155deg, #5b4332 0%, #3d2c1e 100%)" }}>
                    <span className="text-[9.6px] font-semibold uppercase tracking-[1.15px]" style={{ color: "rgba(247,241,229,0.6)" }}>{c.imageLabel}</span>
                    <span className="absolute left-[12px] top-[12px] rounded-full px-[11px] py-[4px] text-[10.6px] font-semibold uppercase tracking-[1.7px]" style={{ background: "rgba(201,168,119,0.22)", color: LASER }}>{TIPO[c.type] ?? c.type}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-[16px]">
                    <span className="text-[11.5px] font-semibold uppercase tracking-[1.6px]" style={{ color: "#a57a4e" }}>{c.category}</span>
                    <h3 className="m-0 mt-[12px] text-[17.5px] font-semibold leading-[1.3]" style={{ color: "#2a1e14" }}>{c.title.join(" ")}</h3>
                    <p className="m-0 mt-[6px] text-[13.5px] font-light leading-[1.5]" style={{ color: MILLBROOK }}>{c.desc.join(" ")}</p>
                    <span className="mt-auto pt-[12px] text-[12px] font-medium" style={{ color: "rgba(91,67,50,0.7)" }}>{c.meta}</span>
                  </div>
                </a>
              </In>
            ))}
          </div>

          {visibles.length === 0 && (
            <p className="mt-[26px] text-[15px] font-light" style={{ color: MILLBROOK }}>
              No hay nada con ese criterio. Prueba con otra palabra o quita el filtro.
            </p>
          )}
          </div>
        </section>

        <MobileFooter />
      </div>
    </MotionConfig>
  );
}
