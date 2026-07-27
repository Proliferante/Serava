"use client";

import { MotionConfig, motion } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import CountUp from "@/components/motion/CountUp";
import { Bloom, BloomSpin, Draw, EASE, Float, MLine, POP, Pop, Rise, Rule, useParallaxY } from "@/components/motion/Kinetics";

/* ═══════════════════════════════════════════════════════════════════════════
   COMO OPERAMOS — reproducción 1:1 del frame de Figma 311:1396 (1920 × 9717).
   Todas las medidas, colores, degradados, tipografías y assets provienen del
   design context de Figma; las coordenadas de cada sección son locales.

   El movimiento se apoya en components/motion/Kinetics: cada elemento entra
   por su cuenta con retardos encadenados (en vez de que la sección aparezca
   como un bloque), las fotos hacen parallax al hacer scroll y las piezas
   decorativas giran o flotan en bucle. Todo respeta prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const I = "/figma/como";

/* ── Tokens (variables de Figma) ─────────────────────────────────────────── */
const CREAM = "#e2cdae"; // Serava cream
const LINEN = "#f7f1e5"; // White Linen
const LINEN80 = "rgba(247,241,229,0.8)";
const BROWN = "#492100"; // color/orange/48 base oscuro
const BROWN5 = "#3d2104"; // fondo sección 5
const DRIFT = "#a57a4e"; // Driftwood
const BISTRE = "#3d2c1e";
const MILLBROOK = "#5b4332";
const LASER = "#c9a877";
const GREEN_SMOKE = "#9aa66f";
const AVOCADO = "#7f8b57";
const VERDIGRIS = "#5f6b3e";
const OIL = "#2a1e14";

const LASER12 = "rgba(201,168,119,0.12)";
const LASER30 = "rgba(201,168,119,0.3)";
const AVOCADO10 = "rgba(127,139,87,0.1)";
const AVOCADO16 = "rgba(127,139,87,0.16)";
const AVOCADO30 = "rgba(127,139,87,0.3)";
const DRIFT28 = "rgba(165,122,78,0.28)";

/* ── Primitivas ──────────────────────────────────────────────────────────── */

type Box = { x: number; y: number; w?: number; h?: number };

/** Capa absoluta con geometría explícita de Figma. */
function L({ x, y, w, h, className, style, children }: Box & { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`absolute ${className ?? ""}`} style={{ left: x, top: y, width: w, height: h, ...style }}>
      {children}
    </div>
  );
}

/**
 * Bloque de texto de Figma: los nodos de texto se centran verticalmente sobre
 * `cy`, así que replicamos ese anclaje para que las líneas caigan al píxel.
 * `d` añade la entrada (sube + aparece) sin tocar el `translateY(-50%)` del
 * contenedor, que es lo que fija la posición.
 */
function T({
  x, cy, w, className, style, d, ry = 24, amount = 0.4, children,
}: { x: number; cy: number; w?: number; className?: string; style?: CSSProperties; d?: number; ry?: number; amount?: number; children: ReactNode }) {
  return (
    <div
      className={`absolute flex flex-col justify-center ${className ?? ""}`}
      style={{ left: x, top: cy, width: w, transform: "translateY(-50%)", ...style }}
    >
      {d === undefined ? children : (
        <motion.div
          initial={{ opacity: 0, y: ry }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount }}
          transition={{ duration: 0.72, delay: d, ease: EASE }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Icono de Figma: cada vector es un SVG posicionado por `inset` (en % o px)
 * dentro de la caja del icono, tal como lo exporta Figma.
 */
function Ico({ size, layers, className, style }: { size: number; layers: [string, string, string][]; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`} style={{ width: size, height: size, ...style }}>
      {layers.map(([outer, inner, src], i) => (
        <div key={i} className="absolute" style={{ inset: outer }}>
          <div className="absolute" style={{ inset: inner }}>
            <img alt="" src={`${I}/${src}`} className="block size-full max-w-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Icono de una sola pieza (SVG completo que llena su caja). */
function Svg({ src, x, y, w, h, inset, d }: { src: string; x: number; y: number; w: number; h?: number; inset?: string; d?: number }) {
  const img = (
    <div className="absolute" style={{ inset: inset ?? "0" }}>
      <img alt="" src={`${I}/${src}`} className="block size-full max-w-none" />
    </div>
  );
  if (d === undefined) return <L x={x} y={y} w={w} h={h ?? w} className="overflow-hidden">{img}</L>;
  return (
    <Pop className="absolute overflow-hidden" style={{ left: x, top: y, width: w, height: h ?? w }} delay={d}>
      {img}
    </Pop>
  );
}

/** `<img>` con el encuadre exacto de Figma + parallax vertical opcional. */
function ParImg({ src, style, par = 0, over, alt = "", eager }: { src: string; style: CSSProperties; par?: number; over?: number; alt?: string; eager?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const py = useParallaxY(ref, par);
  return (
    <motion.img
      ref={ref}
      alt={alt}
      src={`${A}/${src}`}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className="absolute max-w-none object-cover"
      style={{ ...style, scale: over, y: par ? py ?? 0 : 0 }}
    />
  );
}

/**
 * Nodo de imagen de Figma: caja recortada + `<img>` interior con el encuadre
 * exacto (los % que Figma calcula para el crop del fill).
 *
 * `par` desplaza la imagen dentro de su recorte al hacer scroll; `over` la
 * sobreescala para que el desplazamiento no descubra los bordes.
 */
function Pic({
  x, y, w, h, radius, src, alt, crop, shadow, opacity, delay = 0, par = 0, over, rise = 0, eager,
}: Box & { w: number; h: number; radius?: string; src: string; alt: string; crop?: CSSProperties; shadow?: string; opacity?: number; delay?: number; par?: number; over?: number; rise?: number; eager?: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute overflow-hidden"
      style={{ left: x, top: y, width: w, height: h, borderRadius: radius, boxShadow: shadow }}
      initial={{ opacity: 0, y: rise }}
      whileInView={{ opacity: opacity ?? 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      <ParImg src={src} alt={alt} par={par} over={over} eager={eager} style={crop ?? { inset: 0, width: "100%", height: "100%" }} />
    </motion.div>
  );
}

/* ── Bits del sistema de diseño ──────────────────────────────────────────── */

/** Eyebrow: filete de 34 px que se dibuja + label 11.5/17.86 SemiBold. */
function Eyebrow({ x, cy, label, color, w, labelColor, center, d = 0 }: { x: number; cy: number; label: string; color: string; w: number; labelColor?: string; center?: boolean; d?: number }) {
  return (
    <>
      <Rule x={x} y={cy - 0.5} w={34} color={color} delay={d} />
      <T
        x={x + 46} cy={cy - 0.92} w={w} d={d + 0.14} ry={14}
        className={`whitespace-nowrap font-semibold uppercase ${center ? "text-center" : ""}`}
        style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.226px", color: labelColor ?? color }}
      >
        <p>{label}</p>
      </T>
    </>
  );
}

/** "Paso 0X · …" — 11.5/17.86 SemiBold, tracking 2.304. Entra desde la izquierda. */
function Paso({ x, cy, w, label, color, d = 0 }: { x: number; cy: number; w: number; label: string; color: string; d?: number }) {
  return (
    <div className="absolute flex flex-col justify-center" style={{ left: x, top: cy, width: w, transform: "translateY(-50%)" }}>
      <motion.p
        className="font-semibold"
        style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "2.304px", color }}
        initial={{ opacity: 0, x: -22 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, delay: d, ease: EASE }}
      >
        {label}
      </motion.p>
    </div>
  );
}

/** Pregunta de sección — 14.4/22.32 Regular. */
function Question({ x, cy, w, children, color, d = 0.1 }: { x: number; cy: number; w: number; children: ReactNode; color: string; d?: number }) {
  return (
    <T x={x} cy={cy} w={w} d={d} ry={16} className="font-normal" style={{ fontSize: 14.4, lineHeight: "22.32px", color }}>
      <p>{children}</p>
    </T>
  );
}

/** Heading 3 — 30 px SemiBold, tracking -0.468. Revelado con máscara. */
function H3({
  x, cy, w, lh = 35, color, children, className, d = 0.18, mask = true,
}: { x: number; cy: number; w: number; lh?: number; color: string; children: ReactNode; className?: string; d?: number; mask?: boolean }) {
  const style: CSSProperties = { fontSize: 30, lineHeight: `${lh}px`, letterSpacing: "-0.468px", color };
  if (!mask) {
    return <T x={x} cy={cy} w={w} d={d} className={`font-semibold ${className ?? ""}`} style={style}>{children}</T>;
  }
  return (
    <T x={x} cy={cy} w={w} className={`font-semibold ${className ?? ""}`} style={style}>
      <MLine delay={d} dur={1}>{children}</MLine>
    </T>
  );
}

/** Párrafo largo — 17.9/27.78 Light. */
function P({
  x, cy, w, color, children, size = 17.9, lh = 27.78, className, d = 0.26,
}: { x: number; cy: number; w?: number; color: string; children: ReactNode; size?: number; lh?: number; className?: string; d?: number }) {
  return (
    <T x={x} cy={cy} w={w} d={d} className={`font-light ${className ?? ""}`} style={{ fontSize: size, lineHeight: `${lh}px`, color }}>
      {children}
    </T>
  );
}

const CK_DARK: [string, string, string][] = [
  ["41.67% 37.5%", "-17.68% -11.79% -35.36% -11.79%", "ck-dark1.svg"],
  ["12.5%", "-5.56%", "ck-dark2.svg"],
];
const CK_LIGHT_TICK: [string, string, string][] = [["25% 25% 16.67% 25%", "0 -8.33%", "ck-light1.svg"]];
const CK_LIGHT: [string, string, string][] = [
  ["41.67% 37.5%", "-17.68% -11.79% -35.36% -11.79%", "ck-light2a.svg"],
  ["12.5%", "-5.56%", "ck-light2b.svg"],
];
const CK_P: [string, string, string][] = [
  ["8.33% 16.67%", "-5% -6.25%", "ck-p1.svg"],
  ["8.33% 16.67% 29.17% 37.5%", "0 0 -9.43% -6.43%", "ck-p2.svg"],
];
const CK_O: [string, string, string][] = [
  ["16.67% 12.5%", "-6.25% -5.56%", "ck-o1.svg"],
  ["37.5% 12.5% 33.33% 12.5%", "-14.29% 0 -20.2% 0", "ck-o2.svg"],
];
const CK_R: [string, string, string][] = [["12.5% 16.67% 24.17% 16.67%", "-14.71% -13.43% -11.51% -13.43%", "ck-r1.svg"]];
const CK_S: [string, string, string][] = [
  ["8.33%", "0", "ck-s1.svg"],
  ["37.5%", "-16.67%", "ck-s2.svg"],
];

/**
 * Callout "Overlay+Border": recuadro 14 px con icono 19 px + texto 14.7/22.82
 * Medium. Variante clara (avocado) y oscura (laser).
 */
function Callout({
  x, y, w, h, dark, icon, textX = 53, textCy, textW, iconX = 21, iconY = 19, d = 0.34, children,
}: Box & { w: number; h: number; dark?: boolean; icon: [string, string, string][]; textX?: number; textCy: number; textW?: number; iconX?: number; iconY?: number; d?: number; children: ReactNode }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: x, top: y, width: w, height: h,
        background: dark ? LASER12 : AVOCADO10,
        border: `1px solid ${dark ? LASER30 : AVOCADO30}`,
        borderRadius: 14,
      }}
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay: d, ease: EASE }}
    >
      <Pop className="absolute" style={{ left: iconX, top: iconY }} delay={d + 0.22} from={0.3}>
        <Ico size={19} layers={icon} />
      </Pop>
      <T x={textX} cy={textCy} w={textW} className="font-medium" style={{ fontSize: 14.7, lineHeight: "22.82px", color: dark ? LINEN : BISTRE }}>
        {children}
      </T>
    </motion.div>
  );
}

/** Tarjeta 336 × 197 con icono, Heading 4 y descripción. */
function Card({
  x, w = 336, dark, icon, title, children, delay,
}: { x: number; w?: number; dark?: boolean; icon: [string, string, string][]; title: string; children: ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 34, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.72, delay, ease: EASE }}
      whileHover={{ y: -7 }}
      className="ix-card absolute overflow-hidden"
      style={{
        left: x, top: 0, width: w, height: 197,
        background: dark ? BROWN : LINEN,
        border: `1px solid ${DRIFT28}`,
        borderRadius: 16,
        padding: "27px 25px",
        boxShadow: dark ? "0px 4px 2px rgba(0,0,0,0.25)" : undefined,
      }}
    >
      <motion.div
        className="ix-card-ico flex items-center justify-center"
        style={{ width: 46, height: 46, borderRadius: 12, background: AVOCADO16 }}
        initial={{ scale: 0.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, delay: delay + 0.18, ease: POP }}
      >
        <Ico size={23} layers={icon} />
      </motion.div>
      <p className="font-semibold" style={{ marginTop: 16, fontSize: 17.9, lineHeight: "27.78px", color: dark ? CREAM : OIL }}>
        {title}
      </p>
      <p className="font-light" style={{ marginTop: 8, fontSize: 14.4, lineHeight: "22.32px", color: dark ? CREAM : MILLBROOK }}>
        {children}
      </p>
    </motion.div>
  );
}

/**
 * "ANTES DE EMPEZAR" (sección 7): anillo de 70 px + icono de 50 px + etiqueta,
 * con las coordenadas exactas de cada uno de los cinco elementos.
 */
type AntesItem = {
  ring: [number, number];
  icon: [number, number];
  iconSrc?: string;
  iconW?: number;
  ico?: [string, string, string][];
  text: [number, number];
  textW: number;
  lh?: number;
  center?: boolean;
  label: string;
};

const ANTES_ITEMS: AntesItem[] = [
  { ring: [204, 320], icon: [214, 328], ico: [["10.42% 8.33%", "-2.53% -2.4%", "layers.svg"]], text: [199, 410], textW: 99, label: "Materiales" },
  { ring: [359, 318], icon: [369, 328], iconSrc: "people50.svg", text: [336, 410], textW: 128, label: "Mano de obra" },
  { ring: [504, 320], icon: [514, 328], iconSrc: "calendar50.svg", text: [488, 410], textW: 128, label: "Cronograma" },
  { ring: [644, 318], icon: [659, 328], iconSrc: "money50.svg", iconW: 40.625, text: [598, 411], textW: 169, lh: 16, center: true, label: "Fechas de pago" },
  { ring: [796, 317], icon: [806, 328], ico: [["8.33% 12.5%", "-1.8% -2%", "security50.svg"]], text: [753, 419], textW: 169, lh: 16, center: true, label: "Proceso de aprobación de cambios" },
];

/** Sección: caja absoluta a ancho completo con fondo, radio y recorte. */
function Sec({ top, h, bg, radius, children }: { top: number; h: number; bg?: string; radius?: string; children: ReactNode }) {
  return (
    <div className="absolute left-0 w-full overflow-hidden" style={{ top, height: h, background: bg, borderRadius: radius }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Página
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ComoOperamosScreen() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative size-full overflow-hidden" style={{ background: CREAM }} data-name="COMO OPERAMOS">
        {/* ══════════ 1 · HERO ══════════ */}
        <Sec top={0} h={1082}>
          <Pic x={0} y={0} w={1920} h={1082} src="como-hero.webp" alt="" par={46} over={1.12} eager />
        </Sec>
        <Sec top={0} h={1079}>
          {/* Rectangle 45 (414:1107): degradado horizontal, 1713 de ancho — deja
              respirar la foto por la derecha. Antes era vertical a 1920. */}
          <div
            className="absolute left-0 top-0 h-full w-[1713px]"
            style={{
              backgroundImage:
                "linear-gradient(90.1086deg, rgb(73,33,0) 0%, rgba(73,33,0,0.886) 39.484%, rgba(73,33,0,0.714) 51.442%, rgba(73,33,0,0.53) 81.877%, rgba(73,33,0,0) 99.94%)",
            }}
          />
          <Eyebrow x={251} cy={247.5} label="Cómo operamos" color={CREAM} w={143.13} d={0.15} />
          <T x={251} cy={433.2} className="whitespace-nowrap" style={{ fontSize: 70.4, letterSpacing: "-1.76px", lineHeight: "78.85px", color: CREAM }}>
            <MLine delay={0.3}><span className="font-light">Una inversión bien</span></MLine>
            <MLine delay={0.4}><span className="font-light">operada empieza</span></MLine>
            <MLine delay={0.5}>
              <span className="font-light">con </span>
              <span className="font-semibold">mejores</span>
            </MLine>
            <MLine delay={0.6}><span className="font-semibold">decisiones.</span></MLine>
          </T>
          <T x={251} cy={658.49} d={0.85} className="whitespace-nowrap font-normal" style={{ fontSize: 20.8, lineHeight: "32.24px", color: CREAM }}>
            <p>Serava integra selección, remodelación y operación en un sistema</p>
            <p>diseñado para aumentar el valor del activo y simplificar la</p>
            <p>experiencia del inversionista.</p>
          </T>
        </Sec>

        {/* Fondo de la sección 2 (426:1108) — capa propia: arranca en 893, por
            encima del hero, y desborda la sección por arriba y por abajo. */}
        <Pic x={0} y={893} w={1920} h={1280} radius="150px 0 0 0" src="como-metodo-bg.webp" alt="" par={30} over={1.1} />

        {/* ══════════ 2 · NUESTRO MÉTODO ══════════ */}
        <Sec top={932} h={906} radius="150px 0 0 0">
          <Eyebrow x={440} cy={146.5} label="Nuestro método" color={DRIFT} w={147.13} />
          <T x={440} cy={224.7} w={820} style={{ fontSize: 44.8, lineHeight: "50.18px", letterSpacing: "-1.12px", color: BISTRE }}>
            <MLine delay={0.16} dur={1}>
              <span className="font-light">Un sistema construido durante </span>
              <span className="font-semibold">veinte años.</span>
            </MLine>
          </T>
          <P x={440} cy={309.42} w={617.69} color={MILLBROOK} className="whitespace-nowrap" d={0.34}>
            <p>Cada decisión de Serava combina tres capacidades:</p>
          </P>
          <T x={440} cy={358.02} d={0.46} ry={14} className="whitespace-nowrap font-semibold" style={{ fontSize: 16.8, lineHeight: "26px", color: BISTRE }}>
            <p>Datos verificables</p>
          </T>
          <T x={608} cy={358.02} d={0.52} ry={14} className="font-semibold" style={{ fontSize: 16.8, lineHeight: "26px", color: DRIFT }}>
            <p>·</p>
          </T>
          <T x={627} cy={358.02} d={0.56} ry={14} className="whitespace-nowrap font-semibold" style={{ fontSize: 16.8, lineHeight: "26px", color: BISTRE }}>
            <p>Criterio técnico</p>
          </T>
          <T x={773} cy={358.02} d={0.62} ry={14} className="font-semibold" style={{ fontSize: 16.8, lineHeight: "26px", color: DRIFT }}>
            <p>·</p>
          </T>
          <T x={792} cy={358.02} d={0.66} ry={14} className="whitespace-nowrap font-semibold" style={{ fontSize: 16.8, lineHeight: "26px", color: BISTRE }}>
            <p>Experiencia operativa</p>
          </T>

          <L x={440} y={404} w={1040} h={197}>
            <Card x={0} dark icon={[["25% 12.5% 41.67% 12.5%", "-18.39% -3.78% -6.37% -3.34%", "ic-a1.svg"], ["83.33% 12.5% 16.67% 12.5%", "-0.81px 0", "ic-a2.svg"]]} title="Datos verificables" delay={0}>
              Modelos y métricas de zona que sustentan cada decisión, no intuiciones.
            </Card>
            <Card x={352} dark icon={[["12.5% 16.67% 24.17% 16.67%", "-12.5% -11.41% -9.79% -11.41%", "ic-b1.svg"]]} title="Criterio técnico" delay={0.12}>
              Arquitectura, distribución y estado real del inmueble evaluados por expertos.
            </Card>
            <Card x={704} dark icon={[["12.5%", "-5.8% 0 -4.72% 0", "ic-c1.svg"], ["62.5% 37.5% 12.5% 37.5%", "-14.17% -14.17% 0 -14.17%", "ic-c2.svg"]]} title="Experiencia operativa" delay={0.24}>
              Veinte años ejecutando obra traducidos en procesos y controles.
            </Card>
          </L>

          <P x={440} cy={668} color={MILLBROOK} className="whitespace-nowrap" d={0.2}>
            <p>Seleccionamos activos con condiciones reales para generar renta, aumentar su valor y conservar</p>
            <p>alternativas de salida en el tiempo.</p>
          </P>
        </Sec>

        {/* ══════════ 3 · PASO 01 · SELECCIÓN DE LA ZONA ══════════ */}
        <Sec top={1716} h={975} bg={BROWN} radius="0 150px 0 0">
          <Pic
            x={1014} y={0} w={906} h={801} radius="0 150px 0 0" src="como-zona.webp" alt="Selección de la zona" par={40} over={1.14}
            crop={{ height: "100%", top: 0, left: "-36.66%", width: "157.09%" }}
          />
          <L
            x={1014} y={0} w={906} h={794}
            style={{ backgroundImage: "linear-gradient(88.685deg, rgb(73,33,0) 0.983%, rgba(87,39,0,0.863) 14.207%, rgba(201,168,119,0.03) 99.017%)" }}
          />
          <Paso x={440} cy={137.93} w={484} label="Paso 01 · Selección de la zona" color={LASER} />
          <Question x={440} cy={173} w={484} color={GREEN_SMOKE}>¿Cómo identificamos dónde operar?</Question>
          <H3 x={440} cy={248.34} w={484} color={LINEN}>
            <p>
              <span>Encontramos mercados donde </span>
              <span style={{ color: CREAM }}>el valor todavía puede construirse.</span>
            </p>
          </H3>
          <P x={440} cy={376.48} w={484} color={LINEN80} d={0.34}>
            <p>
              <span>El </span>
              <span className="font-semibold" style={{ color: LINEN }}>Score Serava</span>
              <span> es un modelo especializado que identifica zonas consolidadas de alta demanda, oferta limitada y activos con potencial de transformación.</span>
            </p>
          </P>
          <P x={440} cy={501.63} w={484} color={LINEN80} d={0.42}>
            <p>Buscamos mercados donde el diseño, la remodelación y una mejor operación pueden ampliar la diferencia entre el valor de entrada y el valor que el mercado reconoce después de la intervención.</p>
          </P>
          <Callout x={440} y={586.07} w={484} h={79.63} dark icon={CK_DARK} textCy={39.4} textW={410}>
            <p>Solo las zonas que cumplen los criterios del modelo</p>
            <p>avanzan a selección de inmuebles.</p>
          </Callout>
        </Sec>

        {/* ══════════ 4 · PASO 02 · SELECCIÓN DEL INMUEBLE ══════════ */}
        <Sec top={2513} h={907} bg={CREAM} radius="150px 0 0 0">
          <Pic
            x={0} y={0} w={1013} h={710} radius="150px 0 0 0" src="como-inmueble.webp" alt="Selección del inmueble" par={38} over={1.14}
            crop={{ height: "108.45%", top: "-8.45%", left: 0, width: "100%" }}
          />
          <L
            x={917} y={0} w={120} h={710}
            style={{ backgroundImage: "linear-gradient(90.111deg, rgba(232,205,167,0) 0.565%, rgb(226,205,174) 99.435%)" }}
          />
          <Paso x={1076} cy={68.93} w={484} label="Paso 02 · Selección del inmueble" color={DRIFT} />
          <Question x={1076} cy={104.01} w={484} color={VERDIGRIS}>¿Cómo validamos cada oportunidad?</Question>
          <H3 x={1076} cy={161.85} w={484} color={BROWN}>
            <p>Dos filtros antes de recomendar una compra.</p>
          </H3>

          {/* Línea de tiempo (Line 13 + Ellipse 22/23/24) que se traza al entrar */}
          <Draw style={{ left: 1090.5, top: 209, width: 3, height: 288, backgroundImage: `linear-gradient(to bottom, ${BROWN}, ${CREAM})` }} delay={0.3} dur={1.2} />
          <Svg src="dot13.svg" x={1084} y={238} w={13} d={0.55} />
          <Svg src="dot13.svg" x={1084} y={336} w={13} d={0.75} />
          <Svg src="dot13b.svg" x={1084} y={435} w={13} h={14} d={0.95} />

          <P x={1129} cy={259.26} w={484} color={MILLBROOK} size={15} lh={22} d={0.42}>
            <p>Primero analizamos la microzona, el precio por metro cuadrado, la inversión estimada y el potencial de valorización.</p>
          </P>
          <P x={1129} cy={362} w={484} color={MILLBROOK} size={15} lh={22} d={0.56}>
            <p>Después, nuestro equipo inspecciona el inmueble y evalúa su arquitectura, distribución, luz natural, estado del edificio, entorno y posibilidades reales de remodelación.</p>
          </P>
          <P x={1129} cy={454} w={484} color={MILLBROOK} size={15} lh={22} d={0.7}>
            <p>Cada activo debe cumplir los criterios comerciales y técnicos de Serava para avanzar.</p>
          </P>
          <Callout x={1076} y={540.25} w={484} h={79.63} icon={CK_LIGHT_TICK} textX={52} textCy={38.41} textW={410} iconX={20} iconY={18} d={0.82}>
            <p>De cada 100 oportunidades evaluadas, menos de 3</p>
            <p>llegan a recomendación de compra.</p>
          </Callout>
        </Sec>

        {/* ══════════ 5 · PASO 03 · PREACUERDO ══════════ */}
        <Sec top={3223} h={862} bg={BROWN5} radius="0 150px 0 0">
          <Pic
            x={1137} y={41} w={783} h={628} radius="0 150px 0 0" src="como-preacuerdo.webp" alt="Preacuerdo" par={36} over={1.16}
            crop={{ height: "102.1%", top: "0.05%", left: "0.03%", width: "100%" }}
          />
          <Paso x={419} cy={88} w={760} label="Paso 03 · Preacuerdo" color={LASER} />
          <Question x={419} cy={123.34} w={760} color={GREEN_SMOKE}>¿Qué establece la relación desde el comienzo?</Question>
          <H3 x={419} cy={156.34} w={760} lh={20.97} color={CREAM} mask={false} d={0.2}>
            <p>Un acuerdo claro antes de acceder al portafolio.</p>
          </H3>

          <Svg src="paper.svg" x={418} y={214} w={70} inset="12.5% 12.5% 0.78% 8.33%" d={0.34} />
          <P x={509} cy={249.39} color={LINEN80} className="whitespace-nowrap" d={0.4}>
            <p>El preacuerdo protege la confidencialidad de las oportunidades y</p>
            <p>define cómo se ejecuta el modelo Serava.</p>
          </P>

          <Svg src="people70.svg" x={419} y={335} w={70} d={0.5} />
          <P x={509} cy={369} color={LINEN80} className="whitespace-nowrap" d={0.56}>
            <p>Cuando adquieres un inmueble presentado en la plataforma, la</p>
            <p>remodelación se desarrolla con nuestro equipo, bajo un alcance,</p>
            <p>presupuesto y contrato previamente aprobados.</p>
          </P>

          <Svg src="home70.svg" x={419} y={446} w={70} d={0.66} />
          <P x={509} cy={489} color={LINEN80} className="whitespace-nowrap" d={0.72}>
            <p>La administración posterior del activo permanece como una</p>
            <p>decisión del inversionista.</p>
          </P>

          <Callout x={419} y={575} w={602.88} h={57} dark icon={CK_P} textCy={28.5} d={0.84}>
            <p className="whitespace-nowrap">Acceso sin membresía. Compra sin comisión para el inversionista.</p>
          </Callout>
        </Sec>

        {/* ══════════ 6 · PASO 04 · MODELO DE COBRO ══════════ */}
        <Sec top={3935} h={940} bg={CREAM} radius="150px 0 0 0">
          {/* ciudad 2 — textura rotada 90° y volteada, al 25 % */}
          <L x={145.35} y={-0.72} w={1772.805} h={886.494} className="flex items-center justify-center">
            <div style={{ transform: "rotate(90deg) scaleY(-1)", flex: "none" }}>
              <div className="relative overflow-hidden" style={{ width: 886.494, height: 1772.805, opacity: 0.25 }}>
                <ParImg src="como-ciudad.webp" par={70} style={{ height: "151.62%", left: "-55.17%", top: "-51.62%", width: "246.67%" }} />
              </div>
            </div>
          </L>
          <L
            x={0} y={-1} w={1708} h={888} style={{ borderRadius: "150px 0 0 0", backgroundImage: "linear-gradient(89.515deg, rgb(232,217,193) 0.218%, rgba(229,210,184,0) 99.782%)" }}
          />
          <Paso x={440} cy={137.93} w={760} label="Paso 04 · Modelo de cobro" color={DRIFT} />
          <Question x={440} cy={173} w={760} color={VERDIGRIS}>¿Cómo cobra Serava?</Question>
          <H3 x={440} cy={230.84} w={760} color={BROWN}>
            <p>Honorarios vinculados a la ejecución sobre el activo.</p>
          </H3>
          <P x={440} cy={341.5} w={617.69} color={MILLBROOK} className="whitespace-nowrap" d={0.34}>
            <p>El acceso aprobado a la plataforma y la curaduría de oportunidades</p>
            <p>
              <span>hacen parte del proceso de vinculación. </span>
              <span className="font-semibold" style={{ color: BISTRE }}>Serava cobra cuando</span>
            </p>
            <p>
              <span className="font-semibold" style={{ color: BISTRE }}>ejecuta servicios sobre la propiedad.</span>
              <span> Cada servicio tiene su propio</span>
            </p>
            <p>alcance, contrato y estructura de honorarios.</p>
          </P>

          <L x={440} y={398.945} w={1040} h={197}>
            <Card x={0} icon={[["33.33% 20.83% 12.5% 12.5%", "-9.25% -7.51% -6.54% 0", "ic-d1.svg"]]} title="Diseño y remodelación" delay={0}>
              Intervención del activo a alcance y costo cerrado.
            </Card>
            <Card x={352} icon={[["16.67% 41.67% 16.67% 16.67%", "-5.31% -8.5%", "ic-e1.svg"]]} title="Administración del arriendo" delay={0.12}>
              Comercialización, arrendatario y operación del activo.
            </Card>
            <Card x={704} icon={[["12.5%", "0 0 -4.72% -4.72%", "ic-f1.svg"]]} title="Gestión de venta" delay={0.24}>
              Salida acompañada cuando decides vender.
            </Card>
          </L>

          <Callout x={440} y={623.945} w={602.88} h={79.63} icon={CK_LIGHT} textCy={39.4} textW={528.88} d={0.4}>
            <p className="whitespace-nowrap">Conoces los honorarios y las condiciones antes de aprobar cada</p>
            <p>servicio.</p>
          </Callout>
        </Sec>

        {/* ══════════ 7 · PASO 05 · CONTROL DE OBRA ══════════ */}
        <Sec top={4733} h={944} bg={BROWN} radius="0 150px 0 0">
          <Pic
            x={1020} y={77} w={810} h={612} radius="40px" src="como-dashboard.webp" alt="Plataforma de control de obra"
            shadow="18px 22px 18.4px -5px rgba(226,205,174,0.73)" par={30} over={1.14} rise={38} delay={0.1}
            crop={{ height: "107.52%", top: "-2.61%", left: "-4.59%", width: "108.31%" }}
          />
          <Paso x={199} cy={54.93} w={484} label="Paso 05 · Control de obra" color={LASER} />
          <Question x={199} cy={90.01} w={484} color={GREEN_SMOKE}>¿Cómo protegemos el presupuesto?</Question>
          <H3 x={199} cy={165.35} w={484} color={CREAM}>
            <p>Alcance, costos y cronograma definidos antes de comenzar.</p>
          </H3>

          {/* Bloque ANTES DE EMPEZAR */}
          <Rise className="absolute" style={{ left: 168, top: 260, width: 782, height: 193, border: `1px solid ${CREAM}`, borderRadius: 20 }} delay={0.3} y={20} scale={0.98} amount={0.2} />
          <Rise className="absolute" style={{ left: 192, top: 236, width: 216, height: 49, background: "#687540", borderRadius: 100 }} delay={0.42} x={-26} y={0} amount={0.2} />
          <T x={208} cy={259.5} w={186} d={0.52} ry={0} className="font-semibold" style={{ fontSize: 20, lineHeight: "35px", letterSpacing: "-0.468px", color: CREAM }}>
            <p>ANTES DE EMPEZAR</p>
          </T>
          <P x={199} cy={303} w={484} color={LINEN80} size={15} d={0.5}>
            <p>Antes de iniciar la remodelación se establecen :</p>
          </P>

          {/* 5 anillos + iconos + etiquetas, en cascada de izquierda a derecha */}
          {ANTES_ITEMS.map((it, i) => (
            <div key={it.label}>
              <Svg src="ring70.svg" x={it.ring[0]} y={it.ring[1]} w={70} d={0.6 + i * 0.09} />
              {it.ico
                ? <Pop className="absolute" style={{ left: it.icon[0], top: it.icon[1] }} delay={0.68 + i * 0.09}><Ico size={50} layers={it.ico} /></Pop>
                : <Svg src={it.iconSrc!} x={it.icon[0]} y={it.icon[1]} w={it.iconW ?? 50} h={50} d={0.68 + i * 0.09} />}
              <P x={it.text[0]} cy={it.text[1]} w={it.textW} color={LINEN80} size={15} lh={it.lh} className={it.center ? "text-center" : undefined} d={0.76 + i * 0.09}>
                <p>{it.label}</p>
              </P>
            </div>
          ))}

          {/* Bloque DURANTE LA EJECUCIÓN */}
          <Rise className="absolute" style={{ left: 168, top: 454, width: 782, height: 168, border: `1px solid ${CREAM}`, borderRadius: 20 }} delay={0.34} y={20} scale={0.98} amount={0.2} />
          <Rise className="absolute" style={{ left: 192, top: 430, width: 265, height: 49, background: "#687540", borderRadius: 100 }} delay={0.46} x={-26} y={0} amount={0.2} />
          <T x={204} cy={453.5} w={273} d={0.56} ry={0} className="font-semibold" style={{ fontSize: 20, lineHeight: "35px", letterSpacing: "-0.468px", color: CREAM }}>
            <p>DURANTE LA EJECUCIÓN</p>
          </T>

          <Svg src="findpage70.svg" x={185} y={508} w={70} d={0.62} />
          <P x={254} cy={544} w={180} color={LINEN80} size={13} lh={18} d={0.7}>
            <p>Los hallazgos técnicos identificados durante la evaluación se incorporan al presupuesto inicial.</p>
          </P>
          <Svg src="paper.svg" x={453} y={508} w={70} inset="12.5% 12.5% 0.78% 8.33%" d={0.74} />
          <P x={536} cy={553} w={166} color={LINEN80} size={13} lh={18} d={0.82}>
            <p>Las modificaciones posteriores se documentan, cotizan y aprueban antes de ejecutarse.</p>
          </P>
          <Svg src="growth70.svg" x={703} y={508} w={70} d={0.86} />
          <P x={782} cy={544} w={150} color={LINEN80} size={13} lh={18} d={0.94}>
            <p>Durante la obra</p>
            <p>puedes consultar digitalmente el avance del proyecto.</p>
          </P>

          <Callout x={168} y={642} w={602.88} h={75} dark icon={CK_O} textX={46} textCy={39} textW={539} iconX={20} iconY={18} d={1}>
            <p>Seguimiento de progreso, cronograma, documentación y aprobaciones desde tu plataforma personal.</p>
          </Callout>
        </Sec>

        {/* ══════════ 8 · PASO 06 · ESTRATEGIA DE RENTA ══════════ */}
        <Sec top={5499} h={879} bg={CREAM}>
          <Pic
            x={0} y={0} w={1025} h={699} radius="0 100px 100px 0" src="como-renta.webp" alt="Estrategia de renta" par={40} over={1.14}
            crop={{ height: "100.02%", top: "-0.01%", left: "-2.15%", width: "102.15%" }}
          />
          <Paso x={1162} cy={52.93} w={484} label="Paso 06 · Estrategia de renta" color={DRIFT} />
          <Question x={1162} cy={88} w={484} color={VERDIGRIS}>¿Cómo se diseña un inmueble para atraer demanda?</Question>
          <H3 x={1162} cy={145.84} w={484} color={BROWN}>
            <p>El perfil del arrendatario se define primero.</p>
          </H3>

          {/* Línea de tiempo (Line 12 + Ellipse 19/20/21) */}
          <Draw style={{ left: 1119, top: 193.98, width: 3, height: 351.036, backgroundImage: `linear-gradient(to bottom, ${BROWN}, ${CREAM})` }} delay={0.28} dur={1.3} />
          <Svg src="dot16.svg" x={1111} y={229} w={16} d={0.5} />
          <Svg src="dot16.svg" x={1111} y={349} w={16} d={0.72} />
          <Svg src="dot16.svg" x={1111} y={470} w={16} d={0.94} />

          <P x={1162} cy={232.39} w={484} color={MILLBROOK} d={0.4}>
            <p className="font-bold" style={{ color: BROWN }}>Primero</p>
            <p>Antes de remodelar, identificamos quién debe querer vivir en el inmueble y qué características valora.</p>
          </P>
          <P x={1162} cy={349.385} w={484} color={MILLBROOK} d={0.62}>
            <p className="font-bold" style={{ color: BROWN }}>Después</p>
            <p>La distribución, los materiales, el mobiliario y el canon se proyectan según la demanda de cada microzona y el perfil del arrendatario objetivo.</p>
          </P>
          <P x={1162} cy={476.385} w={484} color={MILLBROOK} d={0.84}>
            <p className="font-bold" style={{ color: BROWN }}>Finalmente</p>
            <p>Una vez disponible, Serava gestiona la comercialización, las visitas, la selección del arrendatario y la operación del activo.</p>
          </P>

          <Callout x={1162} y={576} w={484} h={79.63} icon={CK_R} textCy={39.4} textW={410} d={1}>
            <p>Cada oportunidad incluye una hipótesis de demanda, canon y ocupación.</p>
          </Callout>
        </Sec>

        {/* ══════════ 9 · PASO 07 · ESTRATEGIA DE SALIDA ══════════ */}
        <Sec top={6182} h={955} bg={BROWN} radius="0 150px 0 0">
          <Pic
            x={1058} y={-0.27} w={862} h={789} radius="0 150px 0 0" src="como-salida.webp" alt="Estrategia de salida" par={42} over={1.14}
            crop={{ height: "100.04%", top: "-0.02%", left: 0, width: "137.35%" }}
          />
          <L
            x={960} y={-0.27} w={960} h={789}
            style={{ borderRadius: "0 150px 0 0", backgroundImage: "linear-gradient(90.834deg, rgb(73,33,0) 12.941%, rgba(73,33,0,0.58) 46.674%, rgba(73,33,0,0) 99.412%)" }}
          />
          <Paso x={440} cy={137.93} w={820} label="Paso 07 · Estrategia de salida" color={LASER} />
          <Question x={440} cy={173} w={820} color={GREEN_SMOKE}>¿Cómo identificamos el momento de vender?</Question>
          <H3 x={440} cy={206.34} w={820} lh={20.97} color={CREAM} mask={false} d={0.2}>
            <p>Los datos orientan. Tú decides.</p>
          </H3>
          <P x={440} cy={279.05} color={LINEN80} className="whitespace-nowrap" d={0.3}>
            <p>Serava monitorea el comportamiento de la microzona, la oferta</p>
            <p>disponible, la velocidad de venta y los nuevos proyectos en</p>
            <p>construcción.</p>
          </P>

          {/* Chips de indicadores — entran en cascada */}
          {([
            [0, 128.27, 74.109, "Microzona"],
            [138.27, 177.36, 123.186, "Oferta disponible"],
            [325.63, 193.23, 139.105, "Velocidad de venta"],
            [528.86, 182.25, 128.193, "Nuevos proyectos"],
          ] as const).map(([dx, w, tw, label], i) => (
            <motion.div
              key={label}
              className="ix-chip absolute"
              style={{
                left: 440 + dx, top: 347.055, width: w, height: 45.81,
                background: "rgba(247,241,229,0.06)", border: "1px solid rgba(247,241,229,0.18)", borderRadius: 999,
              }}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.44 + i * 0.09, ease: POP }}
            >
              <L x={18} y={18.9} w={8} h={8} style={{ background: GREEN_SMOKE, borderRadius: 4 }} />
              <T x={35} cy={21.99} w={tw} className="font-medium" style={{ fontSize: 14.1, lineHeight: "21.82px", color: LINEN }}>
                <p>{label}</p>
              </T>
            </motion.div>
          ))}

          <P x={440} cy={482.32} color={LINEN80} className="whitespace-nowrap" d={0.82}>
            <p>Cuando los indicadores muestran una oportunidad de salida,</p>
            <p>presentamos un escenario con valor estimado de mercado,</p>
            <p>plusvalía potencial, costos de venta y comparación frente a</p>
            <p>mantener el activo en renta. La propiedad y la decisión final siempre</p>
            <p>permanecen en manos del inversionista.</p>
          </P>

          <Callout x={440} y={579.865} w={602.88} h={79.63} dark icon={CK_S} textCy={39.4} textW={528.88} d={0.94}>
            <p className="whitespace-nowrap">Una misma inversión puede conservar alternativas de renta, venta o</p>
            <p>permanencia.</p>
          </Callout>
        </Sec>

        {/* ══════════ 10 · CAPACIDAD OPERATIVA ══════════ */}
        <Sec top={6971} h={1002} bg={CREAM}>
          <L x={-0.477} y={-1} w={1918.694} h={1080.929} className="overflow-hidden">
            <ParImg src="como-ciudad.webp" par={80} style={{ height: "127.34%", left: "-40.46%", top: "-27.34%", width: "180.93%", opacity: 0.25 }} />
          </L>
          <L
            x={0} y={1} w={1157} h={790}
            style={{ borderRadius: "150px 0 0 0", backgroundImage: "linear-gradient(89.631deg, rgb(232,217,193) 0.218%, rgba(229,210,184,0) 99.782%)" }}
          />
          <Eyebrow x={440} cy={146.5} label="Capacidad operativa" color={DRIFT} w={194.17} />
          <Question x={440} cy={186.58} w={760} color={VERDIGRIS} d={0.16}>¿Qué experiencia respalda la operación?</Question>
          <H3 x={440} cy={219.92} w={760} lh={20.97} color={BROWN} mask={false} d={0.24}>
            <p>Veinte años de ejecución verificable.</p>
          </H3>
          <P x={440} cy={306.5} w={617.69} color={MILLBROOK} className="whitespace-nowrap" d={0.34}>
            <p>El equipo Serava reúne experiencia en diseño, estructuración y</p>
            <p>ejecución de proyectos residenciales, comerciales, institucionales e</p>
            <p>industriales. Ese recorrido se traduce en procesos, presupuestos y</p>
            <p>controles aplicados a cada nueva operación.</p>
          </P>

          {([
            [0.005, 334.66, 20, "+", "", false, "Proyectos estructurados"],
            [352.665, 334.67, 7000, "+", " m²", true, "Intervenidos"],
            [705.335, 334.66, 2, "", " países", false, "Experiencia operativa"],
          ] as const).map(([dx, w, value, prefix, suffix, grouping, label], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.42 + i * 0.12, ease: EASE }}
              whileHover={{ y: -7 }}
              className="ix-card absolute overflow-hidden"
              style={{
                left: 440 + dx, top: 412.535, width: w, height: 165,
                background: BROWN, border: `1px solid ${DRIFT28}`, borderRadius: 16,
                padding: "30px 27px 31px",
              }}
            >
              <p className="font-bold" style={{ fontSize: 48, lineHeight: "74.4px", letterSpacing: "-0.96px", color: CREAM }}>
                <CountUp value={value} prefix={prefix} suffix={suffix} grouping={grouping} />
              </p>
              <p className="font-light" style={{ marginTop: 6, fontSize: 14.4, lineHeight: "22.32px", color: "#ffffff" }}>{label}</p>
            </motion.div>
          ))}

          <Callout x={440} y={605.535} w={602.88} h={57} icon={CK_LIGHT} textCy={28.5} textW={418} d={0.8}>
            <p className="whitespace-nowrap">Track record disponible durante la entrevista de acceso.</p>
          </Callout>
        </Sec>

        {/* ══════════ 11 · RESPALDO HUMANO ══════════ */}
        <Sec top={7762.25} h={854.835} bg={BROWN} radius="0 150px 0 0">
          {/* Composición "Imagen Christian" (orden de pintado de Figma) */}
          <Pic x={623} y={-29.25} w={1561} h={1041} src="como-christian-bg.webp" alt="" par={34} over={1.08} />
          <Bloom style={{ left: 1039, top: 88.75, width: 754, height: 746 }} delay={0.1} dur={1.5} from={0.9}>
            <img alt="" src={`${I}/ch-e12.svg`} className="absolute inset-0 block size-full max-w-none" />
          </Bloom>
          <BloomSpin style={{ left: 985, top: 41.75, width: 971, height: 858 }} delay={0.2} dur={1.8} spin={150}>
            <img alt="" src={`${I}/ch-e10.svg`} className="absolute inset-0 block size-full max-w-none" />
          </BloomSpin>
          <Bloom style={{ left: 1045, top: 404.75, width: 591, height: 516 }} delay={0.15} dur={1.6} from={0.88}>
            <div className="absolute" style={{ inset: "-13.95% -12.18%" }}>
              <img alt="" src={`${I}/ch-e13.svg`} className="block size-full max-w-none" />
            </div>
          </Bloom>
          <Pic x={1125} y={3.75} w={566} h={851} src="como-christian.webp" alt="Christian Mejía" delay={0.25} par={22} over={1.06} rise={34} />
          <Draw style={{ left: 1758, top: 305.75, width: 2, height: 480 }} delay={0.5} dur={1.2}>
            <div className="flex size-full items-center justify-center">
              <div style={{ transform: "rotate(89.76deg)", flex: "none" }}>
                <div className="relative" style={{ width: 480.004, height: 0 }}>
                  <div className="absolute" style={{ inset: "-1px 0 0 0" }}>
                    <img alt="" src={`${I}/ch-line11.svg`} className="block size-full max-w-none" />
                  </div>
                </div>
              </div>
            </div>
          </Draw>
          <motion.div
            className="pointer-events-none absolute flex items-center justify-center"
            style={{ left: 698, top: 88.75, width: 1222, height: 766 }}
            initial={{ opacity: 0, y: 54 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1.05, delay: 0.35, ease: EASE }}
          >
            <div style={{ transform: "rotate(180deg) scaleY(-1)", flex: "none" }}>
              <div className="relative overflow-hidden" style={{ width: 1222, height: 766 }}>
                <img alt="" loading="lazy" src={`${A}/como-christian-img1.webp`} className="absolute max-w-none" style={{ height: "172.76%", left: "-61.55%", top: "10.21%", width: "162.44%" }} />
              </div>
            </div>
          </motion.div>
          <Float style={{ left: 979, top: 374.75, width: 30, height: 30 }} amp={7} dur={5.5}>
            <Pop delay={0.7}><img alt="" src={`${I}/ch-dot30.svg`} className="block size-full max-w-none" /></Pop>
          </Float>
          <Float style={{ left: 1745, top: 389.75, width: 30, height: 30 }} amp={7} dur={6.2} delay={0.4}>
            <Pop delay={0.8}><img alt="" src={`${I}/ch-dot30.svg`} className="block size-full max-w-none" /></Pop>
          </Float>
          <T x={1678} cy={272.75} w={159.138} d={0.9} ry={12} className="text-center font-semibold uppercase" style={{ fontSize: 11.5, lineHeight: "17.86px", letterSpacing: "3.226px", color: LASER, whiteSpace: "pre-wrap" }}>
            <p>Christian </p>
            <p>mejia</p>
          </T>

          <Eyebrow x={440} cy={146.5} label="Respaldo humano" color={LASER} w={159.14} />
          <Question x={440} cy={186.58} w={484} color={GREEN_SMOKE} d={0.16}>El criterio detrás de cada inmueble.</Question>
          <T x={440} cy={274.92} w={484} style={{ fontSize: 38.4, lineHeight: "43px", letterSpacing: "-0.96px", color: LINEN }}>
            <MLine delay={0.24} dur={1.05}>
              <span className="font-light">Christian Mejía, </span>
              <span className="font-semibold">director de diseño y operación técnica.</span>
            </MLine>
          </T>
          <P x={440} cy={414.57} w={484} color={LINEN80} d={0.44}>
            <p>Christian cuenta con veinte años de experiencia ejecutando proyectos de alta exigencia técnica: plantas industriales, laboratorios, espacios comerciales y reconversiones inmobiliarias.</p>
          </P>
          <P x={440} cy={525.835} w={484} color={LINEN80} d={0.56}>
            <p>Ese mismo rigor se aplica para evaluar cada inmueble, definir su intervención y supervisar la ejecución de la obra.</p>
          </P>
          <L x={440} y={593.835} w={484} h={83.19}>
            <Draw style={{ left: 0, top: 0, width: 3, height: "100%", background: AVOCADO }} delay={0.62} dur={0.8} />
            <T x={24} cy={41.3} d={0.78} className="whitespace-nowrap italic font-light" style={{ fontSize: 32, lineHeight: "41.6px", color: LINEN }}>
              <p>“Una inversión inmobiliaria</p>
              <p>se hace bien o no se hace.”</p>
            </T>
          </L>
          <P x={440} cy={713} w={484} color="rgba(247,241,229,0.6)" size={14.1} lh={21.82} d={0.92}>
            <p>Christian revisa cada operación que ingresa al portafolio Serava.</p>
          </P>
        </Sec>

        {/* ══════════ 12 · CIERRE ══════════ */}
        <Sec top={8616} h={884} bg={CREAM}>
          <L x={-5} y={70} w={1929} h={919} className="overflow-hidden">
            <ParImg src="como-cierre.webp" par={60} style={{ height: "262.38%", left: 0, top: "-162.36%", width: "100%", opacity: 0.25 }} />
          </L>
          <L
            x={0} y={0} w={1920} h={585}
            style={{ backgroundImage: "linear-gradient(180.336deg, rgb(226,205,174) 0.945%, rgba(226,205,174,0.38) 99.055%)" }}
          />
          {/* Filete en laser, label en marrón (sección clara) */}
          <Eyebrow x={830.835} cy={146.5} label="El acceso es selectivo" color={LASER} labelColor={BROWN} w={209.179} center />

          <T x={630} cy={266.22} w={660} className="whitespace-nowrap text-center" style={{ fontSize: 54.4, lineHeight: "60.93px", letterSpacing: "-1.36px", color: BROWN }}>
            <MLine delay={0.24}><span className="font-light">Tu capital trabaja.</span></MLine>
            <MLine delay={0.36}><span className="font-semibold">Serava se ocupa de la</span></MLine>
            <MLine delay={0.48}><span className="font-semibold">operación.</span></MLine>
          </T>

          <T x={651.155} cy={420.76} w={617.69} d={0.68} className="whitespace-nowrap text-center font-light" style={{ fontSize: 17.9, lineHeight: "27.78px", color: BROWN }}>
            <p>Tú mantienes la propiedad y apruebas las decisiones clave. Serava</p>
            <p>conecta selección, remodelación y operación mediante un solo</p>
            <p>equipo, un proceso trazable y un único interlocutor.</p>
          </T>

          <Pop className="absolute" style={{ left: 849, top: 491 }} delay={0.84} from={0.86} dur={0.6}>
            <a
              href="/solicitud-acceso"
              className="ix-cta relative block overflow-hidden"
              style={{ width: 222.17, height: 58.8, background: LINEN, borderRadius: 999, boxShadow: "0px 16px 32px -16px rgba(0,0,0,0.4)" }}
            >
              <T x={32} cy={28.5} w={130.195} className="text-center font-semibold" style={{ fontSize: 16, lineHeight: "24.8px", color: OIL }}>
                <p>Solicitar acceso</p>
              </T>
              <Ico
                size={18}
                layers={[["50% 20.83% 50% 20.83%", "-0.75px 0", "arrow1.svg"], ["25% 20.83% 25% 54.17%", "-5.89% -23.57% -5.89% -11.79%", "arrow2.svg"]]}
                className="ix-cta-arrow absolute"
                style={{ left: 172.17, top: 20.4 }}
              />
              <span className="ix-cta-shine" aria-hidden />
            </a>
          </Pop>

          <T x={630} cy={595.29} w={660} d={1} className="whitespace-nowrap text-center font-semibold" style={{ fontSize: 13.4, lineHeight: "20.83px", color: BROWN }}>
            <p>Portafolio reservado para un grupo limitado de inversionistas. Acceso sujeto a evaluación.</p>
          </T>
        </Sec>

      </div>
    </MotionConfig>
  );
}
