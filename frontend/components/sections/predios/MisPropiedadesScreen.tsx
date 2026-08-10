"use client";

import type { CSSProperties, ReactNode } from "react";
import CountUp from "@/components/motion/CountUp";
import { EASE, Rise } from "@/components/motion/Kinetics";
import PrediosNav from "@/components/predios/PrediosNav";
import PropiedadCard, { type Propiedad } from "@/components/predios/PropiedadCard";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   MIS PROPIEDADES — Figma 656:2795 (1920 × 1813.32).

   Rehecha contra el frame nuevo. El anterior (600:3028, 1379 de alto) era otra
   página: fondo marrón, cuatro cifras sueltas en fila y dos activos. Ahora el
   fondo es claro con la silueta de ciudad, el saludo lleva avatar, el resumen
   son tres tarjetas —con barra de composición y sparkline— y debajo del grid
   hay una sección entera de "Lo último que revisaste" con su CTA.

   La columna de contenido son los 1132 px que define `div.wrap` (x 340 más 54
   de sangrado): de 394 a 1526. Las Y son las del frame.
   ═══════════════════════════════════════════════════════════════════════════ */

export const MIS_PROPIEDADES_H = 1813.32;

const A = "/figma";
const X = 394;
const W = 1132;

const LINEN = "#f7f1e5";
const CREAM = "#e2cdae";
const BROWN = "#492100";
const LASER = "#c9a877";
const DRIFT = "#a57a4e";
const BISTRE = "#3d2c1e";
const GREEN = "#9aa66f";
const AVOCADO = "#7f8b57";
const VERDIGRIS = "#5f6b3e";
const TUSSOCK = "#c8913f";
const OIL = "#2a1e14";
const HAIRLINE = "rgba(247,241,229,0.12)";
const L55 = "rgba(247,241,229,0.55)";
const L60 = "rgba(247,241,229,0.6)";
const L72 = "rgba(247,241,229,0.72)";

/** Velo dorado en diagonal de los huecos de foto, igual que en las tarjetas. */
const MEDIA_BG =
  "linear-gradient(134.79deg, rgba(201,168,119,0.14) 0%, rgba(201,168,119,0) 100%), " +
  "linear-gradient(45.21deg, rgba(247,241,229,0.05) 0%, rgba(247,241,229,0.05) 4.7123%, rgba(247,241,229,0) 4.7123%, rgba(247,241,229,0) 9.4246%)";

/* ── Iconos ──────────────────────────────────────────────────────────────── */
const st = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Chart = () => (<svg width={17} height={17} viewBox="0 0 24 24" strokeWidth={1.8} {...st} aria-hidden><path d="M3 3v18h18" /><path d="M7 15l3.5-3.5L14 15l4.5-5.5" /></svg>);
const TrendUp = () => (<svg width={12} height={12} viewBox="0 0 24 24" strokeWidth={2.4} {...st} aria-hidden><path d="M4 17 10 11l4 4 6-6" /><path d="M14 7h6v6" /></svg>);
const Wallet = () => (<svg width={17} height={17} viewBox="0 0 24 24" strokeWidth={1.8} {...st} aria-hidden><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /></svg>);
const Coins = () => (<svg width={17} height={17} viewBox="0 0 24 24" strokeWidth={1.8} {...st} aria-hidden><ellipse cx="12" cy="7" rx="8" ry="3.2" /><path d="M4 7v5c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2V7" /><path d="M4 12v5c0 1.77 3.58 3.2 8 3.2s8-1.43 8-3.2v-5" /></svg>);
const Home20 = () => (<svg width={20} height={20} viewBox="0 0 24 24" strokeWidth={1.5} {...st} aria-hidden><path d="M3.5 10.4 12 3.6l8.5 6.8V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /></svg>);
const Arrow = ({ s = 15 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" strokeWidth={2} {...st} aria-hidden><path d="M4.5 12h15M13.6 6.2 19.5 12l-5.9 5.8" /></svg>);

/* ── Tarjetas del resumen (656:2827 / 656:2865 / 656:2880) ───────────────── */

/** Cabecera de tarjeta: rótulo en versalitas y el icono en su caja redonda. */
function DTop({ label, icon, iconBg }: { label: string; icon: ReactNode; iconBg: string }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="m-0 uppercase" style={{ fontSize: 10.9, lineHeight: "16.32px", fontWeight: 600, letterSpacing: "0.653px", color: L55 }}>{label}</p>
      <span className="flex size-[34px] shrink-0 items-center justify-center" style={{ borderRadius: 9, background: iconBg, color: LINEN }}>{icon}</span>
    </div>
  );
}

/** Cifra: el `$` en dorado y el número en linen extraligero, como el frame. */
function DValue({ value, decimals, suffix, dur = 1.4 }: { value: number; decimals: number; suffix: string; dur?: number }) {
  return (
    <p className="m-0 whitespace-nowrap" style={{ fontSize: 36.8, lineHeight: "55.2px", letterSpacing: "-0.736px" }}>
      <span style={{ fontWeight: 400, color: LASER }}>$</span>
      <span style={{ fontWeight: 200, color: LINEN }}><CountUp value={value} decimals={decimals} suffix={suffix} duration={dur} /></span>
    </p>
  );
}

const DCARD: CSSProperties = { position: "absolute", top: 14, borderRadius: 18, display: "flex", flexDirection: "column", gap: 3 };

/* ── Contenido ───────────────────────────────────────────────────────────── */

export const PROPIEDADES: Propiedad[] = [
  {
    state: { label: "En obra", tone: "obra" },
    photo: "La Cabrera, Bogotá",
    city: "La Cabrera · Bogotá",
    title: "Apartamento ultra lujo remodelado a costo cerrado",
    specs: "320 m² · 3 hab · 3 baños · 2 parq",
    metric: { kind: "obra", label: "Avance de obra", pct: 78, aside: "Semana 9 de 12", note: "Dentro del cronograma" },
    invest: "COP $3.100M",
    href: "/panel",
  },
  {
    state: { label: "Arrendado", tone: "arrendado" },
    photo: "Chicó, Bogotá",
    city: "Chicó · Bogotá",
    title: "Piso alto con vista, zona social ampliada",
    specs: "210 m² · 2 hab · 3 baños · 2 parq",
    metric: { kind: "renta", label: "Canon mensual", value: "$12M", aside: "Ocupado · al día" },
    invest: "COP $2.050M",
    href: "/panel/operacion",
  },
  {
    state: { label: "Arrendado", tone: "arrendado" },
    photo: "Costa del Este, Panamá",
    city: "Costa del Este · Panamá",
    title: "Unidad premium frente al mar",
    specs: "160 m² · 2 hab · 2 baños · 2 parq",
    metric: { kind: "renta", label: "Canon mensual", value: "$9M", aside: "Ocupado · al día" },
    invest: "COP $1.680M",
    href: "/panel/operacion",
  },
];

/** Geometría de las tres tarjetas de propiedad (656:2906 / 2949 / 2990). */
const GRID = [
  { x: 394, w: 362.66, h: 610.16 },
  { x: 778.67, w: 362.67, h: 611.82 },
  { x: 1163.34, w: 362.66, h: 612.27 },
];

/** Fichas de "Lo último que revisaste" (Component 5). */
export const RECIENTES = [
  { x: 0, seen: "Visto hace 2 días", loc: "Laureles · Medellín", name: ["Casa con potencial de división", "en dos unidades"], tir: "TIR ~17%" },
  { x: 383.33, seen: "Visto hace 4 días", loc: "Punta Pacífica · Panamá", name: ["Torre exclusiva lista para", "remodelación integral"], tir: "TIR ~15%" },
  { x: 766.66, seen: "Visto hace 1 semana", loc: "Bocagrande · Cartagena", name: ["Apartamento frente al mar", "para reposicionar a premium"], tir: "TIR ~15%" },
];

export default function MisPropiedadesScreen() {
  return (
    <div className="relative size-full overflow-hidden" style={{ background: CREAM }} data-name="MIS PROPIEDADES">
      {/* Silueta de ciudad (656:3140), exportada del propio frame. Cubre desde
          y=172 hasta el pie, con `object-cover` y al 60 % como en el diseño. */}
      <img
        alt="" loading="lazy" src={`${A}/mis-propiedades-ciudad.webp`}
        className="pointer-events-none absolute max-w-none object-cover"
        style={{ left: 0, top: 172, width: 1920, height: 1641, opacity: 0.6 }}
      />

      <PrediosNav active="propiedades" onLight />

      {/* ══════════ HERO (656:2813) ══════════ */}
      <div className="absolute flex items-center gap-[20px]" style={{ left: X, top: 94.39 + 44, width: W }}>
        <div
          className="flex size-[64px] shrink-0 items-center justify-center"
          style={{ borderRadius: 32, border: `1px solid rgba(201,168,119,0.4)`, backgroundImage: `linear-gradient(150deg, ${DRIFT} 0%, ${BISTRE} 100%)` }}
        >
          <span style={{ fontSize: 20.8, lineHeight: "31.2px", fontWeight: 600, color: LINEN }}>NR</span>
        </div>
        <div className="flex w-[796px] flex-col gap-[6px]">
          <p className="m-0 whitespace-nowrap uppercase" style={{ fontSize: 11.2, lineHeight: "16.8px", fontWeight: 600, letterSpacing: "2.688px", color: BROWN }}>Tu portafolio</p>
          <p className="m-0 whitespace-nowrap pt-[2px]" style={{ fontSize: 40, lineHeight: "44.8px", letterSpacing: "-0.8px", color: BROWN }}>
            <span style={{ fontWeight: 300 }}>Hola, Pablo. </span>
            <span style={{ fontWeight: 200 }}>Bienvenido a tus propiedades.</span>
          </p>
          <p className="m-0 whitespace-nowrap" style={{ fontSize: 15.4, lineHeight: "23px", fontWeight: 300, color: BROWN }}>
            Esto es lo que has construido con Zequara. Elige una propiedad para ver su detalle.
          </p>
        </div>
      </div>

      {/* ══════════ RESUMEN (656:2826) ══════════ */}
      <div className="absolute" style={{ left: X, top: 263.39, width: W, height: 239.19 }}>
        {/* Valor estimado — la olivo, con delta, barra de composición y leyenda */}
        <Rise className="" style={{ ...DCARD, left: 0, width: 471.43, height: 224.97, padding: 22, background: AVOCADO, border: `1px solid rgba(127,139,87,0.3)` } as CSSProperties} delay={0.06} y={18} dur={0.6}>
          <DTop label="Valor estimado del portafolio" icon={<Chart />} iconBg="rgba(247,241,229,0.14)" />
          <div className="relative w-full" style={{ height: 66.19 }}>
            <div className="absolute left-0" style={{ top: 38, transform: "translateY(-50%)" }}><DValue value={8.1} decimals={3} suffix="M" /></div>
            <div className="absolute flex items-center" style={{ left: 149.55, top: 28.14, width: 63.53, height: 25.77, borderRadius: 999, background: "rgba(127,139,87,0.18)" }}>
              <span className="absolute" style={{ left: 10, color: GREEN }}><TrendUp /></span>
              <span className="absolute" style={{ left: 27, fontSize: 11.8, lineHeight: "17.76px", fontWeight: 600, letterSpacing: "-0.736px", color: GREEN }}>+19%</span>
            </div>
          </div>
          <p className="m-0 w-full" style={{ fontSize: 15, lineHeight: "18.24px", fontWeight: 500, color: L55 }}>sobre $6.830M invertidos · estimado por comparables de zona</p>
          <div className="flex w-full flex-col gap-[10px] pt-[13.01px]">
            <div className="flex h-[10px] w-full overflow-hidden rounded-full" style={{ background: "rgba(247,241,229,0.08)" }}>
              <span className="h-full shrink-0" style={{ width: 140.38, backgroundImage: `linear-gradient(90deg, ${TUSSOCK} 0%, #d9a656 100%)` }} />
              <span className="h-full shrink-0" style={{ width: 285.03, backgroundImage: `linear-gradient(90deg, ${AVOCADO} 0%, ${GREEN} 100%)` }} />
            </div>
            <div className="flex h-[17.77px] w-full gap-[16px]">
              {([["1 en obra", TUSSOCK, 68.63], ["2 arrendadas", AVOCADO, 95.38]] as const).map(([txt, color, w]) => (
                <span key={txt} className="relative shrink-0 self-stretch" style={{ width: w }}>
                  <span className="absolute left-0 top-1/2 size-[9px] -translate-y-1/2" style={{ borderRadius: 3, background: color }} />
                  <span className="absolute left-[16px] top-1/2 -translate-y-1/2 whitespace-nowrap" style={{ fontSize: 11.8, lineHeight: "17.76px", fontWeight: 300, color: L72 }}>{txt}</span>
                </span>
              ))}
            </div>
          </div>
        </Rise>

        {/* Inversión total */}
        <Rise className="" style={{ ...DCARD, left: 487.43, width: 314.28, height: 224.78, padding: "22px 22px 75.78px", background: BROWN, border: `1px solid ${HAIRLINE}` } as CSSProperties} delay={0.14} y={18} dur={0.6}>
          <DTop label="Inversión total" icon={<Wallet />} iconBg="rgba(201,168,119,0.16)" />
          <div className="w-full pt-[10px]"><DValue value={6.83} decimals={3} suffix="M" /></div>
          <p className="m-0 w-full" style={{ fontSize: 15, lineHeight: "18.24px", fontWeight: 500, color: L55 }}>Compra + remodelación · 3 activos</p>
        </Rise>

        {/* Renta mensual, con el sparkline de seis barras */}
        <Rise className="" style={{ ...DCARD, left: 817.71, width: 314.29, height: 224.78, padding: "22px 22px 29.77px", background: BROWN, border: `1px solid ${HAIRLINE}` } as CSSProperties} delay={0.22} y={18} dur={0.6}>
          <DTop label="Renta mensual" icon={<Coins />} iconBg="rgba(201,168,119,0.16)" />
          <div className="w-full pt-[10px]"><DValue value={21} decimals={0} suffix="M" dur={1.2} /></div>
          <p className="m-0 w-full" style={{ fontSize: 15, lineHeight: "18.24px", fontWeight: 300, color: L55 }}>≈ $252M al año · ocupación 100%</p>
          <div className="flex h-[43.01px] w-full items-end justify-center gap-[5px] pt-[9.01px]">
            {[13.59, 17.67, 16.31, 22.44, 20.39, 27.19].map((h, i) => (
              <motion.span
                key={h}
                className="min-w-px flex-1"
                style={{
                  height: h, borderTopLeftRadius: 3, borderTopRightRadius: 3, transformOrigin: "bottom",
                  ...(i === 5
                    ? { backgroundImage: `linear-gradient(180deg, ${LASER} 0%, ${DRIFT} 100%)` }
                    : { background: "rgba(201,168,119,0.4)" }),
                }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.06, ease: EASE }}
              />
            ))}
          </div>
        </Rise>
      </div>

      {/* ══════════ CABECERA DE LA LISTA (656:2900) ══════════ */}
      <Rise className="absolute" style={{ left: X, top: 502.58 + 41.99 - 2.57, width: 242 }} delay={0.1} y={14} dur={0.55}>
        <p className="m-0 whitespace-nowrap" style={{ fontSize: 25, lineHeight: "27.6px", fontWeight: 600, color: VERDIGRIS }}>Tus propiedades</p>
      </Rise>
      <p className="absolute m-0 whitespace-nowrap" style={{ left: X + 231, top: 502.58 + 42.42, fontSize: 20, lineHeight: "21.6px", fontWeight: 600, color: BROWN }}>· 3 activos</p>
      <p className="absolute m-0 whitespace-nowrap" style={{ left: X + 1030.72, top: 502.58 + 47.49, fontSize: 12.8, lineHeight: "19.2px", fontWeight: 300, color: BROWN }}>Actualizado hoy</p>

      {/* ══════════ TARJETAS (656:2905) ══════════ */}
      {PROPIEDADES.map((p, i) => (
        <PropiedadCard key={p.title} x={GRID[i].x} y={576.18 + 18} w={GRID[i].w} h={GRID[i].h} data={p} delay={0.08 * i} />
      ))}

      {/* ══════════ LO ÚLTIMO QUE REVISASTE (656:3031) ══════════ */}
      <motion.section
        className="absolute overflow-hidden"
        style={{ left: X, top: 1216, width: W, height: 484, background: BROWN, borderTop: `1px solid ${HAIRLINE}`, borderRadius: 20 }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <p className="absolute m-0" style={{ left: 22, top: 52, fontSize: 28.8, lineHeight: "43.2px", color: LINEN }}>
          <span style={{ fontWeight: 300 }}>Lo último que </span>
          <span style={{ fontWeight: 600 }}>revisaste</span>
        </p>
        <a href="/predios" className="ix-prop-cta absolute flex items-center gap-[6px]" style={{ left: 953, top: 75.84, color: LASER }}>
          <span className="whitespace-nowrap" style={{ fontSize: 13.4, lineHeight: "20.16px", fontWeight: 600 }}>Ver todos los predios</span>
          <span className="ix-prop-arrow"><Arrow /></span>
        </a>
        <div className="absolute" style={{ left: 22, top: 111 }}>
          <p className="m-0 whitespace-nowrap" style={{ fontSize: 14.4, lineHeight: "21.6px", fontWeight: 300, color: L60 }}>Retoma donde quedaste. Estas oportunidades siguen disponibles</p>
          <p className="m-0 whitespace-nowrap" style={{ fontSize: 14.4, lineHeight: "21.6px", fontWeight: 300, color: L60 }}>para sumar tu próxima propiedad.</p>
        </div>

        {RECIENTES.map((r, i) => (
          <motion.a
            key={r.loc}
            href="/predios/ficha"
            className="ix-prop absolute flex overflow-hidden"
            style={{ left: 22 + r.x, top: 165.2, width: 321.33, height: 133.05, borderRadius: 16, background: "rgba(247,241,229,0.04)", border: `1px solid ${HAIRLINE}` }}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: EASE }}
          >
            <span className="flex w-[110px] shrink-0 items-center justify-center self-stretch" style={{ backgroundImage: MEDIA_BG, color: "rgba(247,241,229,0.5)" }}>
              <span className="ix-prop-ico"><Home20 /></span>
            </span>
            <span className="flex min-w-px flex-1 flex-col gap-[3px] self-stretch" style={{ padding: "13px 16px 13.99px" }}>
              <span className="uppercase" style={{ fontSize: 9.9, lineHeight: "14.88px", fontWeight: 600, letterSpacing: "0.397px", color: "rgba(247,241,229,0.45)" }}>{r.seen}</span>
              <span className="pt-[1.99px] uppercase" style={{ fontSize: 10.6, lineHeight: "15.84px", fontWeight: 600, letterSpacing: "0.845px", color: DRIFT }}>{r.loc}</span>
              <span className="block" style={{ fontSize: 14.1, lineHeight: "17.6px", fontWeight: 500, color: LINEN }}>
                {r.name.map((l) => <span key={l} className="block">{l}</span>)}
              </span>
              <span className="flex items-center pt-[6px]">
                <span style={{ fontSize: 12.8, lineHeight: "19.2px", fontWeight: 600, color: GREEN }}>{r.tir}</span>
                <span className="ml-auto flex items-center gap-[3px]" style={{ color: LASER }}>
                  <span style={{ fontSize: 11.8, lineHeight: "17.76px", fontWeight: 600 }}>Ver</span>
                  <span className="ix-prop-arrow"><Arrow s={13} /></span>
                </span>
              </span>
            </span>
          </motion.a>
        ))}

        {/* CTA (656:3113) */}
        <div
          className="absolute flex items-center"
          style={{
            left: 22, top: 324, width: W - 48, height: 106, borderRadius: 18,
            border: `1px solid rgba(201,168,119,0.28)`,
            backgroundImage: "linear-gradient(118.35deg, rgba(165,122,78,0.22) 0%, rgba(127,139,87,0.16) 100%)",
          }}
        >
          <div className="absolute" style={{ left: 28, top: "calc(50% - 6.18px)", transform: "translateY(-50%)", width: 454 }}>
            <p className="m-0 whitespace-nowrap" style={{ fontSize: 18.4, lineHeight: "27.6px", fontWeight: 600, color: LINEN }}>¿Listo para sumar otra propiedad?</p>
            <p className="m-0 whitespace-nowrap" style={{ fontSize: 13.8, lineHeight: "20.64px", fontWeight: 300, color: L72 }}>Explora el portafolio curado de Zequara y elige tu próxima inversión.</p>
          </div>
          <a
            href="/predios"
            className="ix-cta absolute flex items-center gap-[9px]"
            style={{ left: 767, top: "calc(50% + 0.28px)", transform: "translateY(-50%)", width: 294.56, height: 50.56, paddingLeft: 26, borderRadius: 999, background: LINEN, color: OIL }}
          >
            <span className="whitespace-nowrap" style={{ fontSize: 15, lineHeight: "22.56px", fontWeight: 600 }}>Explorar predios disponibles</span>
            <span className="ix-cta-arrow"><Arrow s={17} /></span>
          </a>
        </div>
      </motion.section>

      {/* ══════════ NOTA AL PIE (656:3126) ══════════ */}
      <p className="absolute m-0" style={{ left: X, top: 1700.13 + 33.5, width: W, fontSize: 12.8, lineHeight: "19.2px", fontWeight: 500, color: BROWN }}>
        Cifras estimadas de referencia. El valor del portafolio se calcula sobre comparables de zona y no constituye una oferta de compra ni garantía de retorno.
      </p>
    </div>
  );
}
