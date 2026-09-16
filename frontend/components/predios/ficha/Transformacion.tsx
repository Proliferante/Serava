"use client";

import type { CSSProperties } from "react";
import Footer from "@/components/sections/Footer";
import { motion } from "framer-motion";
import PrediosNav from "@/components/predios/PrediosNav";
import { Band, BROWN, Crece, CREAM, EASE, Entra, HAIRLINE, HeroFicha, Reveal, STRIPES, TabsFicha, Traza } from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA PREDIO · TRANSFORMACIÓN — frame 752:2869 de Figma (1920 × 2705).

   Dos cosas la separan de las otras dos pestañas: la barra de pestañas va
   encima del hero en vez de debajo, y el hero cambia la foto del inmueble por
   el comparador antes/después. Por lo demás comparte nav, sidebar y footer.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Iconos ────────────────────────────────────────────────────────────── */

function Ic({ vb, d, s, w, className, style }: { vb: number; d: string; s?: number; w: number; className?: string; style?: CSSProperties }) {
  return (
    <svg width={s ?? vb} height={s ?? vb} viewBox={`0 0 ${vb} ${vb}`} fill="none" className={className} style={style} aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth={w} />
    </svg>
  );
}

export const VIC = [
  { t: ["Funcionalidad", "real"], d: "M10 1.66667L16.6667 5V10C16.6667 14.1667 13.75 16.6667 10 18.3333C6.25 16.6667 3.33333 14.1667 3.33333 10V5L10 1.66667ZM7.5 10L9.16667 11.6667L12.5 8.33333" },
  { t: ["Estética duradera"], d: "M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5ZM10 5.83333V10L12.5 11.6667" },
  { t: ["Materiales de alta", "calidad"], d: "M10 1.66667L12.5 6.66667L17.5 7.33333L13.75 10.8333L14.75 15.8333L10 13.3333L5.08333 15.8333L6.08333 10.8333L2.5 7.33333L7.5 6.66667L10 1.66667Z" },
  { t: ["Espacios que", "generan valor"], d: "M2.5 17.5V5.83333L10 2.5L17.5 5.83333M17.5 5.83333V17.5M17.5 5.83333V2.5H14.1667M7.5 17.5V12.5H12.5V17.5M11.6667 2.5L17.5 8.33333" },
];

export const D_CHECK17 = "M14.1667 4.25L6.375 12.0417L2.83333 8.5";
export const D_IMG22 = "M17.4167 3.66667H4.58333C3.57081 3.66667 2.75 4.48748 2.75 5.5V16.5C2.75 17.5125 3.57081 18.3333 4.58333 18.3333H17.4167C18.4292 18.3333 19.25 17.5125 19.25 16.5V5.5C19.25 4.48748 18.4292 3.66667 17.4167 3.66667ZM2.75 13.75L6.41667 10.0833L11 14.6667";
export const D_INFO17 = "M13.4583 2.83333H3.54167C2.75926 2.83333 2.125 3.4676 2.125 4.25V13.4583C2.125 14.2407 2.75926 14.875 3.54167 14.875H13.4583C14.2407 14.875 14.875 14.2407 14.875 13.4583V4.25C14.875 3.4676 14.2407 2.83333 13.4583 2.83333ZM2.125 6.375H14.875M5.66667 1.41667V4.25M11.3333 1.41667V4.25";
export const D_ARROW22 = "M4.58333 11H17.4167M11.9167 16.5L17.4167 11L11.9167 5.5";
export const D_SEARCH17 = "M7.79167 12.75C10.5301 12.75 12.75 10.5301 12.75 7.79167C12.75 5.05325 10.5301 2.83333 7.79167 2.83333C5.05325 2.83333 2.83333 5.05325 2.83333 7.79167C2.83333 10.5301 5.05325 12.75 7.79167 12.75ZM14.875 14.875L11.8292 11.8292";
const D_CHEVL = "M8.125 3.25L4.875 6.5L8.125 9.75";
const D_CHEVR = "M4.875 3.25L8.125 6.5L4.875 9.75";

export const QLIST = [
  "Zona social integrada, con mayor amplitud y luz natural.",
  "Cocina abierta, moderna y funcional.",
  "Habitaciones con mejor distribución y baños renovados.",
  "Espacios de almacenamiento optimizados.",
  "Acabados de alto estándar, pensados para un perfil premium.",
  "Un inmueble alineado con la demanda actual de la zona.",
];

/** Rejilla de fotos pendientes: la primera ocupa las dos filas. */
export const PGRID = [
  { cap: "Zona social", left: 0, top: 0, w: 494.12, h: 312 },
  { cap: "Cocina", left: 506.12, top: 0, w: 352.94, h: 150 },
  { cap: "Habitación principal", left: 871.06, top: 0, w: 352.94, h: 150 },
  { cap: "Baño principal", left: 506.12, top: 162, w: 352.94, h: 150 },
  { cap: "Estudio / Habitación", left: 871.06, top: 162, w: 352.94, h: 150 },
];

/** Alcance: cada línea con su icono y el sangrado exacto del frame. */
export const ALCANCE = [
  { t: "Demolición y adecuaciones", x: 29, d: "M10.5 5.25L9 3.75L2.25 10.5L3.75 12M10.5 5.25L13.5 8.25L15.75 6L12.75 3L10.5 5.25ZM9 9L12 12" },
  { t: "Rediseño arquitectónico y espacial", x: 29, d: "M2.25 9L9 13.5L15.75 9M9 1.5L15.75 6L9 10.5L2.25 6L9 1.5Z" },
  { t: "Instalaciones eléctricas e hidráulicas", x: 30, d: "M9.75 1.5L2.25 10.5H7.5L6.75 16.5L14.25 7.5H9L9.75 1.5Z" },
  { t: "Cocina y baños", x: 29, d: "M9 2.25C10.5 4.5 11.25 6 11.25 7.5C11.25 8.09674 11.0129 8.66903 10.591 9.09099C10.169 9.51295 9.59674 9.75 9 9.75C8.40326 9.75 7.83097 9.51295 7.40901 9.09099C6.98705 8.66903 6.75 8.09674 6.75 7.5C6.75 6 7.5 4.5 9 2.25Z" },
  { t: "Pisos, carpintería y acabados", x: 30, d: "M15 3H3C2.58579 3 2.25 3.33579 2.25 3.75V14.25C2.25 14.6642 2.58579 15 3 15H15C15.4142 15 15.75 14.6642 15.75 14.25V3.75C15.75 3.33579 15.4142 3 15 3ZM2.25 7.5H15.75M6.75 3V15" },
  { t: "Iluminación", x: 33, d: "M6.75 13.5H11.25M7.5 15.75H10.5M9 2.25C8.1614 2.31399 7.35751 2.61172 6.67953 3.1094C6.00154 3.60708 5.4766 4.28481 5.16424 5.0657C4.85189 5.84659 4.76462 6.69938 4.91235 7.52735C5.06007 8.35531 5.43687 9.12531 6 9.75C6.75 10.5 6.75 11.25 6.75 12H11.25C11.25 11.25 11.25 10.5 12 9.75C12.5631 9.12531 12.9399 8.35531 13.0877 7.52735C13.2354 6.69938 13.1481 5.84659 12.8358 5.0657C12.5234 4.28481 11.9985 3.60708 11.3205 3.1094C10.6425 2.61172 9.8386 2.31399 9 2.25Z" },
  { t: "Climatización (según alcance)", x: 30, d: "M2.25 6H12C12.445 6 12.88 5.86804 13.25 5.62081C13.62 5.37357 13.9084 5.02217 14.0787 4.61104C14.249 4.1999 14.2936 3.7475 14.2068 3.31105C14.12 2.87459 13.9057 2.47368 13.591 2.15901C13.2763 1.84434 12.8754 1.63005 12.439 1.54323C12.0025 1.45642 11.5501 1.50097 11.139 1.67127C10.7278 1.84157 10.3764 2.12996 10.1292 2.49997C9.88196 2.86998 9.75 3.30499 9.75 3.75M2.25 9H14.25C14.695 9 15.13 9.13196 15.5 9.37919C15.87 9.62643 16.1584 9.97783 16.3287 10.389C16.499 10.8001 16.5436 11.2525 16.4568 11.689C16.37 12.1254 16.1557 12.5263 15.841 12.841C15.5263 13.1557 15.1254 13.3699 14.689 13.4568C14.2525 13.5436 13.8001 13.499 13.389 13.3287C12.9778 13.1584 12.6264 12.87 12.3792 12.5C12.132 12.13 12 11.695 12 11.25M2.25 12H9.75" },
  { t: "Gestión y coordinación de obra", x: 31, d: "M6.75 8.25L9 10.5L16.5 3M15.75 9V14.25C15.75 14.6478 15.592 15.0294 15.3107 15.3107C15.0294 15.592 14.6478 15.75 14.25 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H12" },
];

/** Pasos del cronograma. `tLines` reparte los que llevan dos renglones. */
export const PASOS = [
  { x: 2.495, tLines: ["1. Diseño"], dur: "2–3 semanas", pt: 13 },
  { x: 148.605, tLines: ["2. Licencias y", "preparación"], dur: "2–4 semanas", pt: 12.34 },
  { x: 294.715, tLines: ["3. Ejecución de obra"], dur: "4–6 meses", pt: 13 },
  { x: 440.825, tLines: ["4. Entrega y cierre"], dur: "1–2 semanas", pt: 13 },
];

/** Los dos planos: contorno común y tabiquería propia de cada propuesta. */
export const PLANO_MARCO = "M190.549 0.973847H0.973847V138.611H190.549V0.973847Z";
export const PLANOS = [
  { label: "Estado actual", t: "3 habitaciones + servicio", s: "Espacios compartimentados", d: "M0 49.3416H77.9078H135.04M77.9078 0V90.8924H0M135.04 0V137.637M135.04 68.8185H189.576M49.3416 90.8924V137.637" },
  { label: "Propuesta ZEQUARA", t: "3 habitaciones + servicio", s: "Zona social integrada", d: "M120.757 0V75.3109H189.576M0 90.8924H77.9078M77.9078 75.3109V137.637M140.234 75.3109V137.637" },
];

/* ── Piezas ────────────────────────────────────────────────────────────── */

/**
 * Comparador antes/después. Las dos mitades son marcadores de foto pendiente:
 * un degradado gris para el estado actual y uno cálido para el render. El
 * recorte va en el 51.86 % que marca el frame, donde cae el tirador.
 */
function AntesDespues() {
  return (
    <div className="absolute overflow-hidden" style={{ left: 838, top: 68, width: 665, height: 374, borderRadius: 16 }}>
      {/* Después */}
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(148.21deg, rgb(107,88,66) 0%, rgb(63,48,32) 100%)" }}>
        <span className="absolute -translate-x-1/2 whitespace-nowrap font-semibold uppercase" style={{ left: "50%", top: 192.31, fontSize: 9.9, lineHeight: "14.88px", letterSpacing: 1.389, color: "rgba(247,241,229,0.6)" }}>
          Después — render referencial
        </span>
      </div>
      {/* Antes, recortado por el tirador. Al entrar en pantalla el recorte
          empieza tapando el render y se abre hasta el 51.86 % del frame: la
          comparación se hace sola, que es justo lo que la tarjeta cuenta. */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: "linear-gradient(149.98deg, rgb(141,133,122) 0%, rgb(92,85,76) 100%)" }}
        initial={{ clipPath: "inset(0 0% 0 0)" }}
        whileInView={{ clipPath: "inset(0 48.14% 0 0)" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
      >
        <span className="absolute -translate-x-1/2 whitespace-nowrap font-semibold uppercase" style={{ left: "50%", top: 178.25, fontSize: 9.9, lineHeight: "14.88px", letterSpacing: 1.389, color: "rgba(247,241,229,0.6)" }}>
          Antes — estado actual
        </span>
      </motion.div>

      <motion.span
        className="absolute"
        style={{ top: 0, bottom: 0, width: 1.79, backgroundColor: "#efe6d5" }}
        initial={{ left: "100%" }}
        whileInView={{ left: "51.86%" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
      />
      <motion.div
        className="absolute flex items-center justify-center gap-[2px]"
        style={{ top: 165, height: 44, borderRadius: 22, backgroundColor: "#efe6d5", boxShadow: "0px 6px 18px -4px rgba(0,0,0,0.5)", color: BROWN }}
        initial={{ left: "97.17%", right: "-3.13%" }}
        whileInView={{ left: "49.03%", right: "45.04%" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
      >
        <Ic vb={13} d={D_CHEVL} w={1.3} />
        <Ic vb={13} d={D_CHEVR} w={1.3} />
      </motion.div>

      <span className="absolute font-semibold" style={{ left: 16, bottom: 15.62, padding: "7px 15px 8.27px", borderRadius: 9, backgroundColor: "rgba(20,14,9,0.72)", fontSize: 11.5, lineHeight: "17.28px", color: "#efe6d5" }}>Antes</span>
      <span className="absolute font-semibold" style={{ right: 15.7, bottom: 15.62, padding: "7px 15px 8.27px", borderRadius: 9, backgroundColor: "rgba(20,14,9,0.72)", fontSize: 11.5, lineHeight: "17.28px", color: "#efe6d5" }}>Después (referencial)</span>
    </div>
  );
}

/** Plano de 224.77 de ancho: rótulo, dibujo y dos líneas de pie. */
function Plano({ p, left, retraso = 0 }: { p: (typeof PLANOS)[number]; left: number; retraso?: number }) {
  return (
    <div className="absolute" style={{ left, top: 237.33, width: 224.77, height: 248.82 }}>
      <p className="absolute w-full whitespace-nowrap text-center font-semibold" style={{ top: 0, fontSize: 20, lineHeight: "17.28px", color: "#a57a4e" }}>{p.label}</p>

      <div className="absolute" style={{ left: 0, top: 40.67, width: 224.77, height: 181.82, backgroundColor: "#fbf8f1", border: `1px solid ${HAIRLINE}`, borderRadius: 12 }}>
        <div className="absolute overflow-hidden" style={{ left: 14, top: 22.99, width: 194.77, height: 142.83 }}>
          {/* Los dos planos se dibujan solos: primero el contorno y después la
              tabiquería, que es el orden en que se levantaría. `largo` va con
              holgura sobre el camino real. */}
          <svg className="absolute" style={{ left: 1.62, top: 1.62 }} width={191.523} height={139.585} viewBox="0 0 191.523 139.585" fill="none" aria-hidden>
            <Traza d={PLANO_MARCO} largo={700} dur={1} delay={retraso} stroke="#bfae93" strokeWidth={1.94769} />
          </svg>
          <svg className="absolute" style={{ left: 2.59, top: 2.6 }} width={189.576} height={137.637} viewBox="0 0 189.576 137.637" fill="none" aria-hidden>
            <Traza d={p.d} largo={900} dur={1.1} delay={retraso + 0.45} stroke="#cbbb9e" strokeWidth={1.55833} />
          </svg>
        </div>
      </div>

      <p className="absolute w-full whitespace-nowrap text-center font-semibold" style={{ top: 221.49 + 22.5 - 10.08, fontSize: 13.4, lineHeight: "20.16px", color: "#2a241c" }}>{p.t}</p>
      <p className="absolute w-full whitespace-nowrap text-center font-light" style={{ top: 253.49 + 9.5 - 9.12, fontSize: 12.2, lineHeight: "18.24px", color: "#6b5b47" }}>{p.s}</p>
    </div>
  );
}

/* ── Página ────────────────────────────────────────────────────────────── */

export default function Transformacion() {
  return (
    <div className="relative size-full" style={{ backgroundColor: CREAM }}>
      {/* ── Pestañas ── */}
      <div className="absolute" style={{ left: -1, top: 568, width: 1921, height: 142, zIndex: 4 }}><TabsFicha active="transformacion" /></div>

      {/* ── Nav ── */}
      <div className="absolute left-0 top-0 w-full" style={{ height: 81.81, backgroundColor: BROWN, zIndex: 10 }}>
        <PrediosNav active="predios" geo="ficha" />
      </div>

      {/* ── Hero ── */}
      <section className="absolute left-0 w-full overflow-hidden" style={{ top: 82, height: 542, backgroundColor: BROWN, borderBottomLeftRadius: 60, zIndex: 5 }}>
        <HeroFicha
          contentTop={-50}
          contentLeft={0}
          veil={{ top: 0, height: 552 }}
          sidebar={{ left: 1551, top: 22 }}
          specs={{ left: 145, top: 353 }}
          termo={{ left: 135, top: 294 }}
          photo={false}
          title={<>De un mueble usado a<br />un activo extraordinario.</>}
        >
          <AntesDespues />
        </HeroFicha>
      </section>

      {/* ── Visión de diseño + Qué transforma ── */}
      <Band width={1919} top={663} height={510} bg={CREAM} corner="br" z={3}>
        <h2 className="absolute font-semibold" style={{ left: 206, top: 110, width: 717, fontSize: 60, lineHeight: "34.56px", letterSpacing: -0.32, color: "#3d2c1e" }}>Visión de diseño</h2>
        <p className="absolute font-light" style={{ left: 206, top: 178, width: 714, fontSize: 25, lineHeight: "29px", color: "#6b5b47" }}>
          Un estilo contemporáneo y atemporal, con materiales naturales, espacios abiertos y una distribución que responde al estilo de vida actual. Diseñamos para que el inmueble se sienta más amplio, más luminoso y más conectado con su entorno.
        </p>

        <div className="absolute flex gap-[16px]" style={{ left: 206, top: 363, width: 717 }}>
          {VIC.map((v, i) => (
            <Entra key={v.t[0]} delay={0.06 + i * 0.08} className="flex flex-col gap-[9.2px]" style={{ width: 167.25 }}>
              <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 11, backgroundColor: "#ede7da", color: "#a57a4e" }}>
                <Ic vb={20} d={v.d} w={1.25} />
              </span>
              <span className="font-semibold" style={{ fontSize: 13.1, lineHeight: "16.4px", color: "#2a241c" }}>
                {v.t[0]}{v.t[1] && <><br />{v.t[1]}</>}
              </span>
            </Entra>
          ))}
        </div>

        <Reveal left={960} top={97} width={750} height={339.2} delay={0.08}>
          <div className="relative size-full" style={{ backgroundColor: "#fbf8f1", border: `1px solid ${HAIRLINE}`, borderRadius: 16 }}>
            <h2 className="absolute font-semibold" style={{ left: 26, right: 26, top: 25, fontSize: 32, lineHeight: "34.56px", letterSpacing: -0.32, color: "#3d2c1e" }}>Qué transforma esta oportunidad</h2>
            <ul className="absolute" style={{ left: 26, right: 26, top: 76.55 }}>
              {QLIST.map((t, i) => (
                <motion.li
                  key={t}
                  className="flex items-center gap-[12px]"
                  style={{ paddingTop: 8, paddingBottom: 9.11 }}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.42, delay: 0.14 + i * 0.06, ease: EASE }}
                >
                  <Ic vb={17} d={D_CHECK17} w={1.7} className="shrink-0" style={{ color: "#a57a4e" }} />
                  <span className="whitespace-nowrap" style={{ fontSize: 14.1, lineHeight: "21.12px", color: "#6b5b47" }}>{t}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Band>

      {/* ── Propuesta de transformación + Alcance ── */}
      <Band top={1094} height={752} bg={BROWN} corner="bl" z={2}>
        <h2 className="absolute whitespace-nowrap font-semibold" style={{ left: 181, top: 173 + 0.98 - 24.76, fontSize: 60, lineHeight: "34.56px", letterSpacing: -0.32, color: CREAM }}>Propuesta de transformación</h2>
        <span className="absolute whitespace-nowrap" style={{ left: 181 + 1147, top: 173 + 0.98 + 13.11, fontSize: 12.8, lineHeight: "13.82px", color: CREAM }}>(referencial)</span>

        <div className="absolute" style={{ left: 181, top: 222.53, width: 1224, height: 352 }}>
          {PGRID.map((c, i) => (
            <motion.div
              key={c.cap}
              className="ix-lift absolute flex items-center justify-center overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: 0.04 + i * 0.08, ease: EASE }}
              style={{
                left: c.left, top: c.top, width: c.w, height: c.h, borderRadius: 13,
                backgroundImage: `linear-gradient(148deg, rgba(201,168,119,0.16) 0%, rgba(201,168,119,0) 100%), ${STRIPES}`,
                color: "rgba(247,241,229,0.5)",
              }}
            >
              <Ic vb={22} d={D_IMG22} w={1.1875} />
              <span className="absolute whitespace-nowrap uppercase" style={{ left: 10, bottom: 8.88, padding: "4px 9px", borderRadius: 6, backgroundColor: "rgba(20,14,9,0.6)", fontSize: 9.9, lineHeight: "14.88px", letterSpacing: 0.595, color: "#efe6d5" }}>{c.cap}</span>
            </motion.div>
          ))}
        </div>

        <div className="absolute" style={{ left: 1473, top: 174, width: 300 }}>
          <h2 className="font-semibold" style={{ fontSize: 25, lineHeight: "22.46px", letterSpacing: -0.208, color: CREAM }}>Alcance de la remodelación</h2>
          <ul style={{ marginTop: 14 }}>
            {ALCANCE.map((a, i) => (
              <motion.li
                key={a.t}
                className="relative"
                style={{ height: i === ALCANCE.length - 1 ? 42.64 : 43.64, borderBottom: i === ALCANCE.length - 1 ? undefined : `1px solid ${HAIRLINE}` }}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.42, delay: 0.06 + i * 0.055, ease: EASE }}
              >
                <Ic vb={18} d={a.d} w={1.20417} className="absolute -translate-y-1/2" style={{ left: 0, top: "50%", color: "#a57a4e" }} />
                <span className="absolute -translate-y-1/2 whitespace-nowrap" style={{ left: a.x, top: "50%", fontSize: 20, lineHeight: "20.64px", color: CREAM }}>{a.t}</span>
              </motion.li>
            ))}
          </ul>
          <div className="flex gap-[11px]" style={{ marginTop: 14, width: 346, padding: "15px 16px", borderRadius: 12, backgroundColor: "#ede7da" }}>
            <Ic vb={17} d={D_INFO17} w={1.20417} className="mt-px shrink-0" style={{ color: "#a57a4e" }} />
            <span className="font-light" style={{ fontSize: 15, lineHeight: "19.2px", color: "#6b5b47" }}>
              El alcance definitivo se define durante el proceso de negociación, ajustado a tus objetivos de inversión.
            </span>
          </div>
        </div>
      </Band>

      {/* ── Distribución + Cronograma ── */}
      <Band width={1919} top={1749} height={725} bg={CREAM} corner="br" z={1}>
        <h2 className="absolute whitespace-nowrap font-semibold" style={{ left: 291, top: 157, fontSize: 60, lineHeight: "34.56px", letterSpacing: -0.32, color: "#3d2c1e" }}>Distribución</h2>
        <span className="absolute whitespace-nowrap" style={{ left: 675, top: 181, fontSize: 12.8, lineHeight: "13.82px", color: "#6b5b47" }}>(referencial)</span>

        <Plano p={PLANOS[0]} left={287.94} />
        <motion.span
          className="absolute"
          style={{ left: 526.71, top: 347.24, color: "#a57a4e" }}
          initial={{ opacity: 0, x: -14 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.95, ease: EASE }}
        >
          <Ic vb={22} d={D_ARROW22} w={1.83333} />
        </motion.span>
        <Plano p={PLANOS[1]} left={562.71} retraso={0.5} />

        <div className="absolute" style={{ left: 960, top: 203, width: 579.45 }}>
          <h2 className="font-semibold" style={{ fontSize: 32, lineHeight: "34.56px", letterSpacing: -0.32, color: "#3d2c1e" }}>Cronograma estimado</h2>
          <p className="font-light" style={{ marginTop: 14, width: 471.47, fontSize: 14.7, lineHeight: "22px", color: "#6b5b47" }}>
            La remodelación se ejecuta bajo un modelo de gestión integral, con proveedores validados y seguimiento continuo.
          </p>

          <div className="relative" style={{ marginTop: 14, paddingTop: 16 }}>
            <Crece eje="x" dur={0.9} className="absolute" style={{ left: 6, right: 6, top: 22, height: 2, backgroundColor: "rgba(60,45,30,0.13)" }} />
            {PASOS.map((p, i) => (
              <motion.div
                key={p.dur}
                className="absolute"
                style={{ left: p.x, top: 16, width: 136.11 }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: 0.25 + i * 0.18, ease: EASE }}
              >
                <span className="block" style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#a57a4e", border: "3px solid #f3eee4" }} />
                <span className="block font-semibold" style={{ paddingTop: p.pt, fontSize: 13.1, lineHeight: "19.68px", color: "#2a241c" }}>
                  {p.tLines[0]}{p.tLines[1] && <><br />{p.tLines[1]}</>}
                </span>
                <span className="block font-light" style={{ fontSize: 11.8, lineHeight: "17.76px", color: "#6b5b47" }}>{p.dur}</span>
              </motion.div>
            ))}
            <div style={{ height: 99.46 }} />
          </div>

          <div className="flex flex-wrap items-center gap-x-[14px]" style={{ marginTop: 14, padding: "24px 18px 16px", borderRadius: 12, backgroundColor: "#fbf8f1", border: `1px solid ${HAIRLINE}` }}>
            <span className="relative" style={{ width: 250.17, height: 20.64 }}>
              <Ic vb={17} d={D_SEARCH17} w={1.275} className="absolute -translate-y-1/2" style={{ left: 0, top: "50%", color: "#6b5b47" }} />
              <span className="absolute -translate-y-1/2 whitespace-nowrap font-semibold" style={{ left: 26, top: "50%", fontSize: 13.8, lineHeight: "20.64px", color: "#3d2c1e" }}>Tiempo total estimado: 6 meses</span>
            </span>
            <span className="flex-1 font-light" style={{ minWidth: 200, fontSize: 12.8, lineHeight: "19.2px", color: "#6b5b47" }}>
              Nos enfocamos en cumplir tiempos y presupuesto sin sacrificar el estándar de calidad.
            </span>
          </div>
        </div>
      </Band>

      {/* ── Footer ── */}
      <div className="absolute" style={{ left: -2, top: 2341, width: 1922, height: 364, zIndex: 6 }}><Footer /></div>
    </div>
  );
}
