"use client";

import CanvasImage from "@/components/CanvasImage";
import Footer from "@/components/sections/Footer";
import { motion } from "framer-motion";
import {
  Arrow, Band, Barre, BROWN, Cifra, Crece, CREAM, EASE, Entra, HAIRLINE, HeroFicha, IcArrowRight,
  IcCalendar, IcChat, IcCheck13, IcCheck18, IcDoc, IcHome18, IcHome22, IcPhone, IcPin, IcStar,
  IcTrend, IcUsers, Reveal, STRIPES,
} from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA PREDIO · OPORTUNIDAD — frame 729:2379 de Figma (1920 × 4745).
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";

/* ── Datos ─────────────────────────────────────────────────────────────── */

export const WHY = [
  { Ic: IcStar, t: "Entrada competitiva", d: "Precio por m² por debajo de la media de la microzona." },
  { Ic: IcTrend, t: "Microzona sólida", d: "Demanda estable, escasez de oferta y alta liquidez de salida." },
  { Ic: IcHome22, t: "Activo difícil de replicar", d: "320 m² con características únicas en la zona." },
  { Ic: IcUsers, t: "Alineado con nuestra tesis", d: "Cumple los criterios de retorno, perfil de demanda y bajo riesgo regulatorio." },
];

/** Tramos de la barra apilada, en porcentaje del ancho (inset de Figma). */
export const STACK = [
  { from: "#5b4633", to: "#463527", left: 0, right: 45.72, label: "Precio · $2.600M" },
  { from: "#a87c4e", to: "#8f6740", left: 54.28, right: 29.01, label: "Remod. $800M" },
  { from: "#c9a877", to: "#bb9662", left: 70.95, right: 21.33, label: "" },
  { from: "#84915b", to: "#5f6b3e", left: 78.67, right: 1.63, label: "+$326M" },
];

export const LEGEND = [
  { c: "#463527", l: "", v: "$2.600M", vc: "#2a241c", w: 75.33 },
  { c: "#8f6740", l: "Remodelación", v: "$800M", vc: "#2a241c", w: 83.48 },
  { c: "#c9a877", l: "Otros costos", v: "$50M", vc: "#2a241c", w: 71.95 },
  { c: "#5f6b3e", l: "Valor creado", v: "+$326M", vc: "#4a5730", w: 74.52 },
];

export const BARS = [
  { v: "$8,1M", from: "#c79a6a", to: "#a87c4e", c: ["Este activo", "(estado actual)"] },
  { v: "$8,7M", from: "#d8c6a6", to: "#c2ad86", c: ["Media usado", "microzona"] },
  { v: "$10,8M", from: "#8a9463", to: "#6d774a", c: ["All-in Cost", "ZEQUARA"] },
  { v: "$11,8M", from: "#bfae93", to: "#a8967a", c: ["Media remodelado", "microzona"] },
];

export const SUPUESTOS: { l: string[]; v: string[]; top: number; h: number }[] = [
  { l: ["Microzona de referencia"], v: ["La Cabrera, Bogotá"], top: 41, h: 44 },
  { l: ["Fecha del análisis"], v: ["Septiembre 2026"], top: 84, h: 44 },
  { l: ["Comparables analizados"], v: ["12 inmuebles"], top: 127, h: 44 },
  { l: ["Media mercado usado"], v: ["$8,7M / m²"], top: 170, h: 44 },
  { l: ["Media mercado remodelado"], v: ["$11,8M / m²"], top: 213, h: 44 },
  { l: ["Media arriendo remodelado"], v: ["$58 mil / m² / mes"], top: 256, h: 44 },
  { l: ["Costo de remodelación", "estimado"], v: ["$2,5M / m²"], top: 299, h: 64.78 },
  { l: ["Incluye"], v: ["No incluye impuestos ni", "notariales"], top: 362.78, h: 64.78 },
  { l: ["Horizonte de referencia"], v: ["5 años"], top: 426.56, h: 44 },
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

/** Columna de la barra apilada. */
function Seg({ i }: { i: number }) {
  const s = STACK[i];
  const last = i === STACK.length - 1;
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: `${s.left}%`, right: `${s.right}%`, top: last ? -1 : 0, bottom: last ? 1 : 0,
        backgroundImage: `linear-gradient(180deg, ${s.from} 0%, ${s.to} 100%)`,
        borderRight: last ? undefined : "2px solid #fbf8f1",
        borderTopRightRadius: last ? 15 : undefined, borderBottomRightRadius: last ? 15 : undefined,
      }}
    >
      {s.label && (
        <span className="absolute whitespace-nowrap font-semibold text-white" style={{ left: last ? undefined : 10, fontSize: 11.8, lineHeight: "17.76px" }}>{s.label}</span>
      )}
    </div>
  );
}

/** Fila de la tabla "Supuestos del análisis". */
function SupRow({ r, i }: { r: (typeof SUPUESTOS)[number]; i: number }) {
  return (
    <motion.div
      className="absolute left-0 right-0"
      style={{ top: r.top, height: r.h, borderBottom: "1px solid #7f8b57" }}
      initial={{ opacity: 0, x: 18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.45, delay: 0.04 + i * 0.05, ease: EASE }}
    >
      <div className="absolute" style={{ left: 118.49, top: r.h === 44 ? 11 : r.l.length > 1 ? 10.695 : 20.69 }}>
        {r.l.map((line) => (
          <p key={line} className="whitespace-nowrap" style={{ fontSize: 18, lineHeight: "20.4px", color: "#6b5b47" }}>{line}</p>
        ))}
      </div>
      <div className="absolute text-right" style={{ right: 16.8, top: (r.h - r.v.length * 20.4) / 2 }}>
        {r.v.map((line) => (
          <p key={line} className="whitespace-nowrap font-medium" style={{ fontSize: 18, lineHeight: "20.4px", color: "#7f8b57" }}>{line}</p>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

export default function Oportunidad() {
  return (
    /* El fondo crema lo pone el shell: la franja de pestañas va por debajo de
       esta capa para que el hero le tape el borde de arriba, como en el frame. */
    <div className="relative size-full">
      {/* ── Hero ── */}
      <section className="absolute left-0 w-full overflow-hidden" style={{ top: 77, height: 540, backgroundColor: BROWN, borderBottomLeftRadius: 60, zIndex: 7 }}>
        <HeroFicha height={540} contentTop={-40} veil={{ top: 1, height: 540 }} sidebar={{ left: 1523, top: 28 }} priority />
      </section>

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
      <Band top={1369} height={1258} bg={BROWN} corner="bl" z={4}>
        <h2 className="absolute whitespace-nowrap font-medium" style={{ left: 145, top: 164, fontSize: 60, lineHeight: "38px", letterSpacing: -0.352, color: CREAM }}>La oportunidad en una mirada</h2>

        {/* Del precio de compra al valor de mercado remodelado */}
        <Reveal left={151} top={334} width={801} height={336} delay={0.04}>
          <div className="relative size-full" style={{ backgroundColor: "rgba(248,239,220,0.95)", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
            {/* Extremos */}
            <div className="absolute flex flex-col gap-[2px]" style={{ left: 29, top: 24, width: 147 }}>
              <span className="whitespace-nowrap font-semibold uppercase" style={{ fontSize: 10.6, lineHeight: "15.84px", letterSpacing: 0.95, color: "#94836b" }}>Tu All-in Cost</span>
              <Cifra v="$3.450M" className="whitespace-nowrap font-semibold" style={{ paddingTop: 3, fontSize: 33.6, lineHeight: "33.6px", color: "#7f8b57" }} />
              <span className="whitespace-nowrap" style={{ fontSize: 11.5, lineHeight: "17.28px", color: "#94836b" }}>$10,8M / m²</span>
            </div>
            <motion.div
              className="absolute"
              style={{ left: 354, top: 39.91 }}
              initial={{ opacity: 0, x: -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            >
              <Arrow />
            </motion.div>
            <div className="absolute text-right" style={{ left: 548, top: 23, width: 207 }}>
              <span className="absolute right-0 whitespace-nowrap font-semibold uppercase" style={{ top: 0, fontSize: 10.6, lineHeight: "15.84px", letterSpacing: 0.95, color: "#94836b" }}>Valor de mercado remodelado</span>
              <Cifra v="$3.776M" className="absolute right-0 whitespace-nowrap font-semibold" style={{ top: 21, fontSize: 33.6, lineHeight: "33.6px", color: "#7f8b57" }} />
              <span className="absolute right-0 whitespace-nowrap" style={{ top: 57, fontSize: 11.5, lineHeight: "17.28px", color: "#94836b" }}>$11,8M / m²</span>
            </div>

            {/* Barra apilada */}
            <Barre className="absolute overflow-hidden" style={{ left: 24, top: 120, width: 753.22, height: 62, borderRadius: 12 }} delay={0.18}>
              {STACK.map((_, i) => <Seg key={i} i={i} />)}
              <span className="absolute whitespace-nowrap font-semibold text-white" style={{ left: "calc(50% + 167.39px)", top: 22, fontSize: 11.8, lineHeight: "17.76px" }}>$50 M</span>
            </Barre>

            <p className="absolute" style={{ left: 24, top: 194.35, width: 753.22, fontSize: 15, lineHeight: "19.68px", color: "#6b5b47" }}>
              Tu inversión llega a <span style={{ color: "#3d2c1e" }}>$3.450M</span>; el mercado remodelado paga <span style={{ color: "#3d2c1e" }}>$3.776M</span>. Ese <span style={{ color: "#5f6b3e" }}>+$326M (+9%) </span>es valor patrimonial que no pagas.
            </p>

            <div className="absolute flex flex-wrap gap-x-[16px]" style={{ left: 24, top: 243, width: 753.22, paddingTop: 16, borderTop: `1px solid ${HAIRLINE}` }}>
              {LEGEND.map((g) => (
                <div key={g.v} className="flex items-center gap-[9px]">
                  <span className="shrink-0" style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: g.c }} />
                  <div className="relative" style={{ width: g.w, height: 40.2 }}>
                    {g.l && <span className="absolute whitespace-nowrap" style={{ left: 0, top: -1, fontSize: 11.5, lineHeight: "13.82px", color: "#6b5b47" }}>{g.l}</span>}
                    <span className="absolute whitespace-nowrap font-semibold" style={{ left: 0, top: 12.81, fontSize: 17.6, lineHeight: "26.4px", color: g.vc }}>{g.v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Valor creado hoy */}
        <Reveal left={980} top={334} width={709} height={335} delay={0.1}>
          <div className="relative size-full overflow-hidden" style={{ backgroundColor: "#f6ecd9", borderRadius: 16 }}>
            <span className="absolute whitespace-nowrap font-semibold uppercase" style={{ left: 30, top: 33.21, fontSize: 10.9, lineHeight: "16.32px", letterSpacing: 1.306, color: "#5f6b3e" }}>Valor creado hoy</span>
            <Cifra v="+$326M" className="absolute font-bold" style={{ left: 30, top: 59.18, fontSize: 57.6, lineHeight: "57.6px", color: "#4a5730" }} />
            <Cifra v="+9%" className="absolute font-semibold" style={{ left: 30, top: 118.88, fontSize: 27.2, lineHeight: "40.8px", color: "#5f6b3e" }} />
            <p className="absolute font-light" style={{ left: 30, top: 174.09, width: 648.78, fontSize: 23, lineHeight: "25px", color: "#4a5730" }}>
              Compras por debajo de lo que el mercado remodelado comparable ya paga en la microzona. Ese diferencial es tu margen patrimonial desde el día uno.
            </p>
            <div className="absolute flex items-center" style={{ left: 30, top: 286, width: 281.72, height: 29.27, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.55)" }}>
              <IcCheck13 className="absolute" style={{ left: 12, color: "#5f6b3e" }} />
              <span className="absolute whitespace-nowrap font-semibold" style={{ left: 32, fontSize: 11.5, lineHeight: "17.28px", color: "#5f6b3e" }}>~8% por debajo de la media remodelada</span>
            </div>
            <div className="absolute flex items-center justify-center" style={{ left: 624, top: 41, width: 42, height: 44 }}>
              <span className="block" style={{ transform: "rotate(-46.33deg)" }}><Arrow /></span>
            </div>
          </div>
        </Reveal>

        {/* Comparables de la microzona */}
        <Reveal left={152} top={684} width={800} height={515} delay={0.04}>
          <div className="relative size-full" style={{ backgroundColor: "#f6ecd9", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
            <span className="absolute" style={{ left: 24, top: 7.4, fontSize: 21.6, lineHeight: "32.4px", color: "#3d2c1e" }}>Comparables de la microzona</span>
            <span className="absolute" style={{ left: 358.72, top: 10.36, fontSize: 11.5, lineHeight: "17.28px", color: "#94836b" }}>precio por m²</span>

            <div className="absolute flex gap-[16px]" style={{ left: 25, top: 65.39, width: 750, height: 206, paddingTop: 16 }}>
              {BARS.map((b, i) => (
                <div key={b.v} className="flex flex-col items-center" style={{ width: 175.5 }}>
                  <Cifra v={b.v} className="flex items-center justify-center whitespace-nowrap font-semibold" style={{ height: 35.61, fontSize: 16, lineHeight: "27.6px", color: BROWN }} />
                  <Crece className="w-full" delay={0.06 * i} style={{ height: 117.03, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundImage: `linear-gradient(180deg, ${b.from} 0%, ${b.to} 100%)` }} />
                  <span className="block text-center" style={{ paddingTop: 9.36, fontSize: 10.6, lineHeight: "13.73px", color: "#6b5b47" }}>
                    {b.c[0]}<br />{b.c[1]}
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute flex items-center" style={{ left: 24, right: 24, top: 319, height: 137, borderRadius: 12, backgroundColor: CREAM }}>
              <p style={{ paddingLeft: 16, paddingRight: 16, fontSize: 20, lineHeight: "27px", color: "#6b5b47" }}>
                Nuestro All-in queda <span className="font-semibold" style={{ color: "#5f6b3e" }}>~8% por debajo</span> de la media remodelada comparable. Análisis basado en 12 inmuebles comparables en La Cabrera.
                <span className="block font-bold" style={{ marginTop: 20.64, lineHeight: "20.64px" }}>Actualizado: septiembre 2026.</span>
              </p>
            </div>
          </div>
        </Reveal>

        {/* Supuestos del análisis */}
        <Reveal left={980} top={680} width={710} height={519} delay={0.1}>
          <div className="relative size-full" style={{ backgroundColor: "#f6ecd9", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
            <span className="absolute whitespace-nowrap" style={{ left: 24, top: 23, fontSize: 21.6, lineHeight: "32.4px", color: "#3d2c1e" }}>Supuestos del análisis</span>
            <div className="absolute" style={{ left: 24, top: 23.39, width: 662.48, height: 470.56 }}>
              {SUPUESTOS.map((r, i) => <SupRow key={r.l[0]} r={r} i={i} />)}
            </div>
          </div>
        </Reveal>
      </Band>

      {/* ── El potencial de transformación ── */}
      <Band top={2568} height={700} bg={CREAM} corner="br" z={3}>
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
      <Band top={3207} height={666} bg={BROWN} corner="bl" z={2}>
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
      <Band top={3788} height={633} bg={CREAM} corner="br" z={1}>
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
      <div className="absolute" style={{ left: 0, top: 4421, width: 1922, height: 364, zIndex: 6 }}><Footer /></div>
    </div>
  );
}
