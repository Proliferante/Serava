"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const A = "/figma";

const TABS = ["Todos", "Artículos", "Videos", "Noticias"];
const TAB_LEFT = [5, 95, 205, 301];
const FILTERS = ["Patrimonio", "Mercado", "Remodelación", "Zonas", "Legal"];

/** PAGINA HUB · Seccion 1 — Hero con búsqueda y tabs interactivos (1920 × 1263) */
export default function HubSection1Hero() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (f: string) =>
    setFilters((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });

  return (
    <div className="relative size-full" data-name="Seccion 1">
      {/* Background image */}
      <div className="absolute h-[1262px] left-[-93px] top-[-155px] w-[2241px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full object-cover" src={`${A}/0399392c61096f2f9a6febf99f556a00af4eb6ac.png`} />
      </div>
      {/* Overlay */}
      <div className="absolute bg-[rgba(73,33,0,0.6)] h-[934px] left-0 top-0 w-[1920px]" />

      {/* Logo → inicio */}
      <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute h-[34.12px] left-[222px] top-[115px] w-[175.28px]">
        <img alt="Serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/6a5469af8a03030efc2535c53f980eb3ea6d7f27.svg`} />
      </a>

      {/* Nav */}
      <a href="/" className="ix-navlink absolute flex items-center justify-center left-[1104px] p-[10px] top-[97px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Inicio</p>
      </a>
      <a href="/hub" className="ix-navlink absolute flex items-center justify-center left-[1279px] p-[10px] top-[96px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Hub</p>
      </a>
      <a href="/modelo" className="ix-navlink absolute flex items-center justify-center left-[1428px] p-[10px] top-[97px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[30px] whitespace-nowrap">Modelo</p>
      </a>
      <a href="/login" className="ix-fill absolute border-4 border-sand border-solid flex items-center justify-center left-[1610px] px-[25px] py-[24px] rounded-[98px] top-[87px]">
        <p className="font-medium leading-[normal] not-italic text-sand text-[24px] whitespace-nowrap">Iniciar sesión</p>
      </a>

      {/* Eyebrow */}
      <div className="absolute bg-tan-63 h-px left-[450px] opacity-80 top-[279.42px] w-[36px]" />
      <p className="[word-break:break-word] absolute font-semibold leading-[17.86px] left-[498px] not-italic text-tan-63 text-[11.5px] top-[270px] tracking-[3.456px] uppercase w-[202.17px]">Conocimiento Serava</p>

      {/* Heading */}
      <p className="[word-break:break-word] absolute font-medium leading-[88px] left-[450px] not-italic text-cream-93 text-[80px] top-[305px] tracking-[-2px] w-[1123px]">Criterio para invertir mejor en finca raíz</p>

      {/* Subtitle */}
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[450px] not-italic text-[18.9px] top-[504px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.8)" }}>
        <p className="leading-[29.26px] mb-0">Artículos, análisis y videos sobre patrimonio, mercado inmobiliario</p>
        <p className="leading-[29.26px] mb-0">y el método Serava. Lo que necesitas saber antes de cada</p>
        <p className="leading-[29.26px]">decisión.</p>
      </div>

      {/* Search bar (functional) */}
      <div className="absolute bg-[rgba(73,33,0,0.2)] backdrop-blur-[10px] h-[71px] left-[453px] rounded-[50px] top-[662px] w-[597px] flex items-center pl-[33px] pr-[24px] transition-shadow focus-within:shadow-[0_0_0_2px_rgba(201,168,119,0.55)]">
        <img alt="" className="h-[26px] w-[26px] shrink-0" src={`${A}/baf296062379ade92e3d68c04f542725059e8e22.svg`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar artículos, videos, noticias..."
          className="ml-[19px] w-full bg-transparent border-0 outline-none font-light text-[18.9px] text-cream-93 placeholder:text-[rgba(247,241,229,0.8)]"
        />
      </div>

      {/* Tabs bar */}
      <div className="absolute bg-cream h-[137px] left-0 overflow-clip top-[929px] w-[1920px]">
        {/* Tablist with sliding indicator */}
        <div className="absolute bg-[#efe6d5] h-[53px] left-[450px] rounded-[999px] top-[42px] w-[405px]">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(i)}
              className="absolute flex items-center justify-center pb-[11px] pt-[10px] px-[20px] rounded-[999px] top-[5px]"
              style={{ left: TAB_LEFT[i] }}
            >
              {tab === i && (
                <motion.span
                  layoutId="hubTabPill"
                  className="absolute inset-0 bg-[#2a1e14] rounded-[999px]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className={`relative z-10 font-medium text-[14.4px] text-center whitespace-nowrap transition-colors ${tab === i ? "text-cream-93" : "text-[#5b4332]"}`}>{t}</span>
            </button>
          ))}
        </div>

        {/* Filter chips (toggle) */}
        <div className="absolute flex flex-wrap gap-[9px] items-start right-[434px] top-[49px]">
          {FILTERS.map((f) => {
            const on = filters.has(f);
            return (
              <motion.button
                key={f}
                type="button"
                onClick={() => toggleFilter(f)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border border-solid flex flex-col items-center justify-center pb-[10px] pt-[9px] px-[17px] rounded-[999px] transition-colors"
                style={{
                  backgroundColor: on ? "#2a1e14" : "rgba(0,0,0,0)",
                  borderColor: on ? "#2a1e14" : "rgba(165,122,78,0.28)",
                }}
              >
                <span className="font-normal leading-[normal] not-italic text-[13.4px] text-center whitespace-nowrap transition-colors" style={{ color: on ? "#f7f1e5" : "#5b4332" }}>{f}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
