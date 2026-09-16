"use client";

import CanvasImage from "@/components/CanvasImage";
import PrediosNav from "@/components/predios/PrediosNav";
import Footer from "@/components/sections/Footer";
import { motion } from "framer-motion";
import {
  Band, Barre, BROWN, Cifra, CREAM, EASE, Entra, HAIRLINE, HeroFicha, IcArrowRight,
  IcCalendar, IcChat, IcCheck13, IcCheck18, IcDoc, IcHome18, IcHome22, IcPhone, IcPin, IcStar,
  IcTrend, IcUsers, Reveal, STRIPES, TabsFicha,
} from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA PREDIO · OPORTUNIDAD — frame 729:2379 de Figma (1920 × 4395).

   El rediseño adelgazó «La oportunidad en una mirada»: de cuatro tarjetas
   —puente de valor, valor creado, comparables y supuestos— pasa a dos, con una
   fila de tres cifras y el enlace al análisis debajo. Lo que se cayó vive
   ahora en la ficha técnica completa, dentro de la pestaña de Finanzas.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

/* ── Datos ─────────────────────────────────────────────────────────────── */

export const WHY = [
  { Ic: IcStar, t: "Entrada competitiva", d: "Precio por m² por debajo de la media de la microzona." },
  { Ic: IcTrend, t: "Microzona sólida", d: "Demanda estable, escasez de oferta y alta liquidez de salida." },
  { Ic: IcHome22, t: "Activo difícil de replicar", d: "320 m² con características únicas en la zona." },
  { Ic: IcUsers, t: "Alineado con nuestra tesis", d: "Cumple los criterios de retorno, perfil de demanda y bajo riesgo regulatorio." },
];

/**
 * Tramos de la barra apilada del puente de valor, en % de sus 556,31 px.
 * El cuarto —el valor creado— es el único que no lleva filete a la derecha.
 */
export const STACK = [
  { from: "#5b4633", to: "#463527", w: 68.86, label: "Precio · $2.600M" },
  { from: "#a87c4e", to: "#8f6740", w: 21.19, label: "Remod. $800M" },
  { from: "#c9a877", to: "#bb9662", w: 1.32, label: "" },
  { from: "#84915b", to: "#5f6b3e", w: 8.63, label: "+$326M" },
];

export const LEGEND = [
  { c: "#463527", l: "Precio actual", v: "$2.600M", vc: "#3a2c1c", w: 73.19 },
  { c: "#8f6740", l: "Remodelación", v: "$800M", vc: "#3a2c1c", w: 81.11 },
  { c: "#c9a877", l: "Otros costos", v: "$50M", vc: "#3a2c1c", w: 69.89 },
  { c: "#5f6b3e", l: "Valor creado", v: "+$326M", vc: "#4a5730", w: 72.39 },
];

/** Las tres cifras que cierran la mirada, antes del enlace al análisis. */
export const MIRADA = [
  { t: "Retorno total (5 años)", v: "54,4%", cop: false },
  { t: "Renta mensual estimada", v: "$18,6M", cop: true },
  { t: "Rentabilidad anual neta", v: "4,6%", cop: false },
];

export const TCARDS = [
  { t: "Zona social", d: ["Potencial de apertura, iluminación y", "actualización."] },
  { t: "Cocina", d: ["Alto impacto en la percepción y valor", "del activo."] },
  { t: "Habitaciones", d: ["Optimización de distribución y mayor", "funcionalidad."] },
  { t: "Baños", d: ["Intervención integral para llevarlos al", "estándar premium."] },
];

export const PASOS = [
  { n: "01", Ic: IcPhone, t: "Llamada", d: ["Revisamos el análisis y tus", "objetivos."] },
  { n: "02", Ic: IcChat, t: "Negociación", d: ["Iniciamos el proceso de", "negociación del inmueble."] },
  { n: "03", Ic: IcDoc, t: "Propuesta", d: ["Desarrollamos la propuesta", "arquitectónica y económica."] },
  { n: "04", Ic: IcCheck18, t: "Cierre", d: ["Compra del inmueble + contrato", "de remodelación."] },
];

export const POIS = [
  ["Parque El Virrey", "5 min"],
  ["Centro Andino", "7 min"],
  ["Zona T", "7 min"],
  ["Clínica del Country", "8 min"],
];

/* ── Piezas ────────────────────────────────────────────────────────────── */

/** Tarjeta de "Por qué ZEQUARA lo seleccionó". El radio lo pone quien la usa. */
function WhyCard({ i, radius }: { i: number; radius?: string }) {
  const { Ic, t, d } = WHY[i];
  return (
    <div className="relative size-full" style={{ backgroundColor: "#eedbc0", borderRadius: radius }}>
      <div className="absolute flex items-center justify-center" style={{ left: 22, top: 26, width: 42, height: 42, borderRadius: 11, backgroundColor: "#ccd5af", color: "#463527" }}>
        <Ic />
      </div>
      <p className="absolute font-semibold" style={{ left: 22, right: 22, top: 83, fontSize: 30, lineHeight: "22.46px", letterSpacing: -0.208, color: "#4b542e" }}>{t}</p>
      <p className="absolute font-light" style={{ left: 22, right: 22, top: i === 0 || i === 1 ? 131 : 127, fontSize: 25, lineHeight: "37px", color: BROWN }}>{d}</p>
    </div>
  );
}

/** Tramo de la barra apilada. El rótulo va centrado dentro de su tramo. */
function Seg({ i }: { i: number }) {
  const s = STACK[i];
  return (
    <div
      className="relative flex h-full shrink-0 items-center justify-center"
      style={{
        width: `${s.w}%`,
        backgroundImage: `linear-gradient(180deg, ${s.from} 0%, ${s.to} 100%)`,
        borderRight: i === STACK.length - 1 ? undefined : "2px solid #faf5ea",
      }}
    >
      {s.label && (
        <span className="absolute whitespace-nowrap font-semibold text-white" style={{ fontSize: 11.8, lineHeight: "17.76px" }}>{s.label}</span>
      )}
    </div>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

export default function Oportunidad() {
  return (
    <div className="relative size-full" style={{ backgroundColor: CREAM }}>
      {/* ── Nav ── */}
      <div className="absolute left-0 top-0 w-full" style={{ height: 81.81, backgroundColor: BROWN, zIndex: 10 }}>
        <PrediosNav active="predios" geo="ficha" />
      </div>

      {/* ── Hero ── */}
      <section className="absolute left-0 w-full overflow-hidden" style={{ top: 77, height: 540, backgroundColor: BROWN, borderBottomLeftRadius: 60, zIndex: 7 }}>
        <HeroFicha contentTop={-40} veil={{ top: 1, height: 540 }} sidebar={{ left: 1523, top: 28 }} specs={{ left: 161, top: 351 }} termo={{ left: 161, top: 292 }} priority />
      </section>

      {/* ── Pestañas ── */}
      <div className="absolute left-0 w-full" style={{ top: 568, zIndex: 6 }}><TabsFicha active="oportunidad" /></div>

      {/* ── Por qué ZEQUARA lo seleccionó ── */}
      <Band top={710} height={753} bg={CREAM} corner="br" z={5}>
        <h2 className="absolute font-bold" style={{ left: 129, top: 74.61, width: 965, fontSize: 60, lineHeight: "51px", letterSpacing: -0.352, color: BROWN }}>Por qué ZEQUARA lo seleccionó</h2>
      </Band>

      {/* Las cuatro razones. Van sueltas sobre la banda porque la fila de abajo
          se sale de la caja que agrupa a la de arriba. */}
      <Reveal left={141} top={868.39} width={917} height={262} delay={0.04} zIndex={6}>
        <div className="relative size-full overflow-hidden" style={{ borderRadius: 16 }}>
          <div className="absolute" style={{ left: 0, top: 0, width: 452, height: 262 }}><WhyCard i={0} /></div>
          <div className="absolute" style={{ left: 459, top: 0, width: 458, height: 262 }}><WhyCard i={1} /></div>
        </div>
      </Reveal>
      <Reveal left={143} top={1139.39} width={450} height={253} delay={0.08} zIndex={6}>
        <WhyCard i={2} radius="0 0 0 16px" />
      </Reveal>
      <Reveal left={600} top={1139.39} width={458} height={254} delay={0.12} zIndex={6}>
        <WhyCard i={3} radius="0 0 16px 0" />
      </Reveal>

      {/* Interior del inmueble. El encuadre está desplazado a la izquierda: la
          foto entra al 146 % del ancho de la caja, como en el diseño. */}
      <Reveal left={1129} top={765} width={696} height={658} delay={0.06} zIndex={6}>
        <div className="relative size-full overflow-hidden" style={{ borderRadius: 16 }}>
          <div className="absolute" style={{ left: -320.4, top: 0, width: 1016.2, height: 658 }}>
            <CanvasImage src={`${A}/ficha-interior.webp`} w={1016} />
          </div>
        </div>
      </Reveal>

      {/* ── La oportunidad en una mirada ── */}
      <Band top={1369} height={840} bg={BROWN} corner="bl" z={4}>
        <h2 className="absolute whitespace-nowrap font-medium" style={{ left: 152, top: 164, fontSize: 60, lineHeight: "51px", letterSpacing: -0.352, color: CREAM }}>La oportunidad en una mirada</h2>
        <p className="absolute font-light" style={{ left: 152, top: 232, width: 900, fontSize: 25, lineHeight: "30px", color: "rgba(247,241,229,0.75)" }}>
          Del precio de compra al valor que el mercado remodelado ya paga.
        </p>

        {/* Puente de valor: de lo que cuesta a lo que vale */}
        <Reveal left={438} top={296} width={604.31} height={334} delay={0.04}>
          <div className="relative size-full" style={{ backgroundColor: "#faf5ea", borderRadius: 16 }}>
            {/* De un extremo al otro */}
            <div className="absolute" style={{ left: 24, top: 24, width: 556.31, height: 74 }}>
              <div className="absolute" style={{ left: 0, top: 0, width: 140 }}>
                <span className="block whitespace-nowrap font-semibold uppercase" style={{ fontSize: 10.2, lineHeight: "16px", letterSpacing: 0.922, color: "#9d8b70" }}>Tu All-in Cost</span>
                <Cifra v="$3.450M" className="block whitespace-nowrap font-semibold" style={{ paddingTop: 5, fontSize: 32, lineHeight: "32px", color: "#3a2c1c" }} />
                <span className="block whitespace-nowrap" style={{ paddingTop: 5, fontSize: 11.5, lineHeight: "17px", color: "#9d8b70" }}>$10,8M / m²</span>
              </div>
              <motion.span
                className="absolute font-normal"
                style={{ left: 235.65, top: 26, fontSize: 25.6, lineHeight: "38px", color: "#a57a4e" }}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
              >
                →
              </motion.span>
              <div className="absolute text-right" style={{ left: 357.3, top: 0, width: 199 }}>
                <span className="block whitespace-nowrap font-semibold uppercase" style={{ fontSize: 10.2, lineHeight: "16px", letterSpacing: 0.922, color: "#9d8b70" }}>Valor de mercado remodelado</span>
                <Cifra v="$3.776M" className="block whitespace-nowrap font-semibold" style={{ paddingTop: 5, fontSize: 32, lineHeight: "32px", color: "#3a2c1c" }} />
                <span className="block whitespace-nowrap" style={{ paddingTop: 5, fontSize: 11.5, lineHeight: "17px", color: "#9d8b70" }}>$11,8M / m²</span>
              </div>
            </div>

            {/* La barra se llena de izquierda a derecha, como se llenaría la
                inversión: primero el precio, luego la obra, y al final lo que
                no se paga. */}
            <Barre className="absolute flex overflow-hidden" style={{ left: 24, top: 116, width: 556.31, height: 60, borderRadius: 11 }} delay={0.18}>
              {STACK.map((_, i) => <Seg key={i} i={i} />)}
            </Barre>

            <p className="absolute font-light" style={{ left: 24, top: 190, width: 556.31, fontSize: 13.1, lineHeight: "20px", color: "#7a6a52" }}>
              Tu inversión llega a <span className="font-semibold" style={{ color: "#3d2c1e" }}>$3.450M</span>; el mercado remodelado paga <span className="font-semibold" style={{ color: "#3d2c1e" }}>$3.776M</span>. Ese <span className="font-semibold" style={{ color: "#5f6b3e" }}>+$326M (+9%)</span> es valor patrimonial que no pagas.
            </p>

            <div className="absolute flex flex-wrap gap-x-[16px]" style={{ left: 24, top: 245, width: 556.31, paddingTop: 16, borderTop: "1px solid rgba(60,45,30,0.09)" }}>
              {LEGEND.map((g, i) => (
                <motion.div
                  key={g.v}
                  className="flex items-center gap-[9px]"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: 0.5 + i * 0.07, ease: EASE }}
                >
                  <span className="shrink-0" style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: g.c }} />
                  <div className="relative" style={{ width: g.w, height: 39.44 }}>
                    <span className="absolute whitespace-nowrap" style={{ left: 0, top: -1, fontSize: 11.2, lineHeight: "13.44px", color: "#7a6a52" }}>{g.l}</span>
                    <span className="absolute whitespace-nowrap font-semibold" style={{ left: 0, top: 13.44, fontSize: 16.8, lineHeight: "26px", color: g.vc }}>{g.v}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Valor creado hoy */}
        <Reveal left={1060.31} top={296} width={377.69} height={336.6} delay={0.1}>
          <div className="relative size-full overflow-hidden" style={{ borderRadius: 16, backgroundImage: "linear-gradient(159.745deg, rgb(231,235,216) 0%, rgb(215,221,196) 100%)" }}>
            <span className="absolute whitespace-nowrap font-semibold uppercase" style={{ left: 26, top: 26, fontSize: 10.6, lineHeight: "17px", letterSpacing: 1.056, color: "#5f6b3e" }}>Valor creado hoy</span>
            <motion.span
              className="absolute"
              style={{ left: 329.69, top: 26, color: "#5f6b3e" }}
              initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.24 }}
            >
              <IcTrend />
            </motion.span>
            <Cifra v="+$326M" className="absolute block font-bold" style={{ left: 26, top: 58, width: 325.69, fontSize: 54.4, lineHeight: "54.4px", color: "#4a5730" }} />
            <Cifra v="+9%" className="absolute block font-semibold" style={{ left: 26, top: 116, width: 325.69, fontSize: 25.6, lineHeight: "38px", color: "#5f6b3e" }} />
            <p className="absolute font-light" style={{ left: 26, top: 170, width: 325.69, fontSize: 13.6, lineHeight: "20.4px", color: "#4a5730" }}>
              Compras por debajo de lo que el mercado remodelado comparable ya paga en la microzona. Ese diferencial es tu margen patrimonial desde el día uno.
            </p>
            <div className="absolute flex items-center gap-[7px]" style={{ left: 26, top: 280.6, height: 30, padding: "0 12px", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.55)" }}>
              <IcCheck13 className="shrink-0" style={{ color: "#5f6b3e" }} />
              <span className="whitespace-nowrap font-semibold" style={{ fontSize: 11.5, lineHeight: "17.28px", color: "#5f6b3e" }}>~8% por debajo de la media remodelada</span>
            </div>
          </div>
        </Reveal>

        {/* Tres cifras que enganchan y el enlace al análisis completo */}
        <div className="absolute flex items-center gap-[14px]" style={{ left: 438, top: 652, width: 1000, height: 88 }}>
          {MIRADA.map((k, i) => (
            <Entra
              key={k.t}
              delay={0.06 + i * 0.08}
              className="relative"
              style={{
                width: 245.88, height: 88, borderRadius: 14,
                backgroundColor: i === 0 ? undefined : "rgba(247,241,229,0.06)",
                backgroundImage: i === 0 ? "linear-gradient(154.392deg, rgb(95,107,62) 0%, rgb(71,83,31) 100%)" : undefined,
                border: i === 0 ? "1px solid rgba(0,0,0,0)" : "1px solid rgba(247,241,229,0.12)",
              }}
            >
              <span className="absolute whitespace-nowrap font-semibold uppercase" style={{ left: 18, top: 17, fontSize: 10.9, lineHeight: "16px", letterSpacing: 0.653, color: "rgba(247,241,229,0.65)" }}>{k.t}</span>
              <Cifra v={k.v} className="absolute whitespace-nowrap font-semibold" style={{ left: 18, top: 39, fontSize: 30.4, lineHeight: "31.92px", color: "#e7dbc2" }} />
              {k.cop && <span className="absolute whitespace-nowrap" style={{ left: 130, top: 55, fontSize: 11.5, lineHeight: "12px", color: "rgba(247,241,229,0.65)" }}>COP</span>}
            </Entra>
          ))}
          <Entra delay={0.3}>
            <a
              href="/predios/ficha/finanzas"
              className="ix-press flex items-center justify-center gap-[9px] font-semibold"
              style={{ width: 220.38, height: 52, borderRadius: 11, backgroundColor: CREAM, fontSize: 14.1, color: "#3d2c1e" }}
            >
              Ver análisis completo
              <IcArrowRight className="shrink-0" />
            </a>
          </Entra>
        </div>
      </Band>

      {/* ── El potencial de transformación ── */}
      <Band top={2178} height={700} bg={CREAM} corner="br" z={3}>
        <a href="#galeria" className="ix-nav absolute whitespace-nowrap font-semibold" style={{ left: 1011.56, top: 41.88, fontSize: 13.1, color: "#a57a4e" }}>Ver más fotos →</a>
        <h2 className="absolute whitespace-nowrap font-semibold" style={{ left: 154, top: 119.24, fontSize: 60, lineHeight: "36.29px", letterSpacing: -0.336, color: "#3d2c1e" }}>El potencial de transformación</h2>
        <p className="absolute whitespace-nowrap font-light" style={{ left: 154, top: 193, fontSize: 25, lineHeight: "37.5px", color: "#6b5b47" }}>
          Espacios con gran capacidad de cambio. La propuesta arquitectónica se desarrolla durante el proceso de negociación.
        </p>

        <div className="absolute flex gap-[14px]" style={{ left: 89, top: 259, width: 1747 }}>
          {TCARDS.map((c, i) => (
            <Entra key={c.t} delay={0.04 + i * 0.08} className="ix-lift relative overflow-hidden" style={{ width: 426.25, height: 336.88, borderRadius: 14, backgroundColor: BROWN, backgroundImage: STRIPES }}>
              <div className="flex size-full flex-col items-start justify-end" style={{ padding: 18, backgroundImage: "linear-gradient(180deg, rgba(18,12,8,0) 38%, rgba(18,12,8,0.86) 100%)" }}>
                <span className="mb-[12px] flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: "rgba(247,241,229,0.16)", color: "#efe6d5" }}>
                  <IcHome18 />
                </span>
                <span className="whitespace-nowrap font-semibold" style={{ fontSize: 25, lineHeight: "22.88px", color: "#efe6d5" }}>{c.t}</span>
                <span className="mt-[5px] block" style={{ fontSize: 20, lineHeight: "30px", color: "rgba(247,241,229,0.82)" }}>{c.d[0]}<br />{c.d[1]}</span>
              </div>
              <span className="sr-only">Foto {i + 1} pendiente</span>
            </Entra>
          ))}
        </div>
      </Band>

      {/* ── Nuestro proceso ── */}
      <Band top={2817} height={637} bg={BROWN} corner="bl" z={2}>
        <h2 className="absolute font-semibold" style={{ left: 166, top: 160, fontSize: 60, lineHeight: "36.29px", letterSpacing: -0.336, color: CREAM }}>Nuestro proceso</h2>
        <p className="absolute whitespace-nowrap font-light" style={{ left: 166, top: 225.12, fontSize: 25, lineHeight: "37.5px", color: CREAM }}>De la oportunidad a un activo transformado.</p>

        {PASOS.map((p, i) => (
          <motion.div
            key={p.n}
            className="absolute flex flex-col gap-[6px]"
            style={{ left: [89, 541, 994, 1446][i], top: 288, width: [413, 414, 413, 413][i], height: 199, padding: 22, borderRadius: 14, backgroundColor: CREAM, border: `1px solid ${HAIRLINE}` }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.04 + i * 0.09, ease: EASE }}
          >
            <div className="flex items-center gap-[12px]">
              <span className="whitespace-nowrap font-bold" style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: 27.2, lineHeight: "27.2px", color: "#a57a4e" }}>{p.n}</span>
              <span className="flex shrink-0 items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, border: "1px solid rgba(60,45,30,0.13)", color: "#5f6b3e" }}>
                <p.Ic />
              </span>
            </div>
            <p className="font-semibold" style={{ paddingTop: 6, fontSize: 25, lineHeight: "37.5px", color: BROWN }}>{p.t}</p>
            <p style={{ fontSize: 20, lineHeight: "30px", color: BROWN }}>{p.d[0]}<br />{p.d[1]}</p>
          </motion.div>
        ))}

        <a href="/modelo" className="ix-nav absolute whitespace-nowrap font-semibold" style={{ left: 174, top: 523, fontSize: 20, lineHeight: "30px", color: "#a57a4e" }}>Conoce cómo funciona →</a>
      </Band>

      {/* ── Ubicación y entorno + CTA ── */}
      <Band top={3398} height={633} bg={CREAM} corner="br" z={1}>
        <Reveal left={350} top={147} width={623} height={417} delay={0.04}>
          <div className="relative size-full" style={{ backgroundColor: "#fbf8f1", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
            <h2 className="absolute font-semibold" style={{ left: 24, right: 24, top: 46.57, fontSize: 40, lineHeight: "29.38px", letterSpacing: -0.272, color: "#3d2c1e" }}>Ubicación y entorno</h2>
            <p className="absolute whitespace-nowrap font-light" style={{ left: 24, top: 94.55, fontSize: 20, lineHeight: "30px", color: "#6b5b47" }}>Conectividad, exclusividad y alta demanda.</p>

            <div className="absolute overflow-hidden" style={{ left: 24, top: 138.12, width: 309.44, height: 230, borderRadius: 12 }}>
              <div className="absolute" style={{ left: 0, top: 0, width: 329, height: 230 }}>
                <CanvasImage src={`${A}/ficha-mapa.webp`} w={329} alt="Mapa de La Cabrera, Bogotá" />
              </div>
            </div>

            <ul className="absolute" style={{ left: 351.44, top: 138.12, width: 247.56 }}>
              {POIS.map(([name, min], i) => (
                <motion.li
                  key={name}
                  className="flex items-center justify-between"
                  style={{ paddingTop: 11, paddingBottom: 11, borderBottom: i < POIS.length - 1 ? `1px solid ${HAIRLINE}` : undefined }}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.07, ease: EASE }}
                >
                  <span className="flex items-center gap-[9px]">
                    <IcPin className="shrink-0" style={{ color: "#a57a4e" }} />
                    <span className="whitespace-nowrap" style={{ fontSize: 13.8, color: "#6b5b47" }}>{name}</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold" style={{ fontSize: 13.8, color: "#2a241c" }}>{min}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal left={1107} top={146} width={462} height={418} delay={0.1}>
          <div className="relative size-full overflow-hidden" style={{ backgroundColor: BROWN, borderRadius: 16 }}>
            <h2 className="absolute font-semibold" style={{ left: 28, right: 28, top: 90.89, fontSize: 28, lineHeight: "30.24px", letterSpacing: -0.288, color: "#efe6d5" }}>
              Las buenas oportunidades no esperan
            </h2>
            <p className="absolute font-light" style={{ left: 28, right: 28, top: 162.24, fontSize: 13.8, lineHeight: "20.7px", color: "rgba(247,241,229,0.8)" }}>
              Este inmueble está disponible hoy, pero puede entrar en negociación con otro comprador en cualquier momento.
            </p>
            <a
              href="/solicitud-acceso"
              className="ix-press absolute flex items-center gap-[9px] font-semibold text-white"
              style={{ left: 28, top: 246.1, padding: "12px 20px 13px", borderRadius: 10, backgroundColor: "#a57a4e", fontSize: 13.6 }}
            >
              Quiero conocer esta oportunidad
              <IcArrowRight className="shrink-0" />
            </a>
            <div className="absolute flex items-center gap-[9px]" style={{ left: 28, right: 28, top: 305.24 }}>
              <IcCalendar className="shrink-0" style={{ color: "#c9a877" }} />
              <span className="whitespace-nowrap" style={{ fontSize: 13.1, color: "rgba(247,241,229,0.85)" }}>Agenda una llamada con ZEQUARA</span>
            </div>
          </div>
        </Reveal>
      </Band>

      {/* ── Footer ── */}
      <div className="absolute" style={{ left: 0, top: 4031, width: 1922, height: 364, zIndex: 6 }}><Footer /></div>
    </div>
  );
}
