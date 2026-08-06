import ScaledCanvas from "@/components/ScaledCanvas";
import PredioCard, { type Predio } from "@/components/predios/PredioCard";
import PrediosNav from "@/components/predios/PrediosNav";

/* ═══════════════════════════════════════════════════════════════════════════
   PREDIOS — reproducción del frame de Figma 100:2349 (1920 × 2850).

   Nav, encabezado sobre el degradado oscuro, la barra de seis filtros y la
   rejilla de ocho oportunidades (3 + 3 + 2).

   Las torres de fondo (image 9 e image 10) se pintan encima del encabezado y
   por debajo de la barra de filtros, como en el orden de capas del diseño.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const CANVAS_W = 1920;
const CANVAS_H = 2850;

/** Alto de la zona oscura: hasta el pie de la barra de filtros (570 + 111). */
const DARK_H = 681;

/**
 * Rejilla de tarjetas (311:3742). Los valores van literales y no calculados a
 * partir del alto de la tarjeta: `PredioCard` es un componente de cliente, y
 * las constantes que exporta llegan a este server component como referencia,
 * no como número — al operar con ellas saldría `NaN`.
 */
const COLS = [380, 772, 1164];
const ROWS = [780.19, 1448.22, 2116.25];
const DARK_BG = "linear-gradient(180deg, #2a1e14 12%, #492202 85%)";

const CREAM = "#f7f1e5";
const LASER = "#c9a877";
const LINE = "rgba(165,122,78,0.28)";

/* ── Datos ───────────────────────────────────────────────────────────────── */


/** `x` y `w` salen del frame de la barra (100:3062): canales de 27 px. */
const FILTERS = [
  { label: "País", value: "Todos", x: 401, w: 150 },
  { label: "Ciudad", value: "Todas", x: 578, w: 195 },
  { label: "Zona", value: "Todas", x: 800, w: 157 },
  { label: "Capital requerido", value: "Cualquiera", x: 984, w: 170 },
  { label: "Tipo de transformación", value: "Todas", x: 1181, w: 264 },
  { label: "Ordenar por", value: "Mayor Score Zequara", x: 1472, w: 198 },
];

const PREDIOS: Predio[] = [
  {
    badge: { label: "Disponible", tone: "green" }, score: 96,
    photo: "La Cabrera, Bogotá", city: "La Cabrera · Bogotá",
    title: "Apartamento de gran formato con potencial de reconversión",
    chip: "Reposicionamiento premium", specs: "320 m² · 3 hab · 3 baños · 2 parq",
    price: "COP $3.100M", priceNote: "Compra + remodelación",
    tir: 16, horizon: "Horizonte: 5 años", status: "Abierto para evaluación",
  },
  {
    badge: { label: "Disponible", tone: "green" }, score: 88,
    photo: "Laureles, Medellín", city: "Laureles · Medellín",
    title: "Casa con potencial de división en dos unidades",
    chip: "División en dos unidades", specs: "260 m² · 4 hab · 3 baños · 2 parq",
    price: "COP $1.450M", priceNote: "Compra + remodelación",
    tir: 17, horizon: "Horizonte: 5 años", status: "Abierto para evaluación",
  },
  {
    badge: { label: "Disponible", tone: "green" }, score: 85,
    photo: "Punta Pacífica, Ciudad de Panamá", city: "Punta Pacífica · Ciudad de Panamá",
    title: "Torre exclusiva lista para remodelación integral",
    chip: "Remodelación completa", specs: "150 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $1.520M", priceNote: "Compra + remodelación",
    tir: 15, horizon: "Horizonte: 4 años", status: "Abierto para evaluación",
  },
  {
    badge: { label: "Nueva oportunidad", tone: "gold" }, score: 90,
    photo: "El Poblado, Medellín", city: "El Poblado · Medellín",
    title: "Unidad reconvertible en edificio boutique",
    chip: "Remodelación completa", specs: "145 m² · 2 hab · 2 baños · 1 parq",
    price: "COP $1.180M", priceNote: "Compra + remodelación",
    tir: 18, horizon: "Horizonte: 4 años", status: "Recién incorporada al portafolio",
  },
  {
    badge: { label: "Reserva liberada", tone: "green" }, score: 86,
    photo: "Costa del Este, Ciudad de Panamá", city: "Costa del Este · Ciudad de Panamá",
    title: "Unidad premium con potencial de mejor distribución",
    chip: "Cambio de distribución", specs: "160 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $1.680M", priceNote: "Compra + remodelación",
    tir: 14, horizon: "Horizonte: 5 años", status: "Disponible nuevamente",
  },
  {
    badge: { label: "Alta actividad", tone: "amber" }, score: 92,
    photo: "Chicó, Bogotá", city: "Chicó · Bogotá",
    title: "Piso alto con vista, ideal para ampliar la zona social",
    chip: "Cambio de distribución", specs: "210 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $2.050M", priceNote: "Compra + remodelación",
    tir: 15, horizon: "Horizonte: 5 años", status: "Actualmente en evaluación por inversionistas",
  },
  {
    badge: { label: "En proceso de reserva", tone: "steel" }, score: 87,
    photo: "Bocagrande, Cartagena", city: "Bocagrande · Cartagena",
    title: "Apartamento frente al mar para reposicionar a premium",
    chip: "Reposicionamiento premium", specs: "180 m² · 3 hab · 3 baños · 1 parq",
    price: "COP $1.950M", priceNote: "Compra + remodelación",
    tir: 15, horizon: "Horizonte: 5 años", status: "Reserva en validación",
  },
  {
    badge: { label: "Reservada", tone: "dark" }, score: 91,
    photo: "Rosales, Bogotá", city: "Rosales · Bogotá",
    title: "Clásico de Rosales reservado recientemente",
    chip: "Reposicionamiento premium", specs: "190 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $1.900M", priceNote: "Compra + remodelación",
    tir: 16, horizon: "Horizonte: 5 años", status: "Oportunidad reservada",
  },
];

/* ── Piezas ──────────────────────────────────────────────────────────────── */

const Chevron = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

/** Desplegable de la barra de filtros. Sin lógica todavía: no hay catálogo. */
function Select({ label, value, x, w }: (typeof FILTERS)[number]) {
  return (
    <div className="absolute" style={{ left: x, top: 589, width: w }}>
      <span className="block uppercase" style={{ fontSize: 11, lineHeight: "17px", fontWeight: 600, letterSpacing: "1.5px", color: "#fde8d3" }}>
        {label}
      </span>
      <button
        type="button"
        className="ix-press mt-[6px] flex h-[38px] w-full items-center justify-between rounded-[11px] border border-solid px-[15px]"
        style={{ borderColor: LINE, background: "#efe6d5" }}
      >
        <span className="truncate" style={{ fontSize: 14, color: "#2a1e14" }}>{value}</span>
        <span style={{ color: "#5b4332" }}><Chevron /></span>
      </button>
    </div>
  );
}

export default function PrediosPage() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        <div className="relative size-full" style={{ background: "linear-gradient(0deg, #E2CDAE 0.02%, #492100 82.77%), #FFF" }}>
          {/* Zona oscura de nav + encabezado + filtros */}
          <div className="absolute left-0 top-0 w-full" style={{ height: DARK_H, backgroundColor: "#2a1e14", backgroundImage: DARK_BG }} />

          {/* ── Encabezado (100:2351) ── */}
          <div className="absolute flex items-center gap-[12px]" style={{ left: 392, top: 152.39 }}>
            <span className="h-px w-[32px] opacity-80" style={{ background: LASER }} />
            <span className="uppercase" style={{ fontSize: 11, lineHeight: "18px", fontWeight: 600, letterSpacing: "3.2px", color: LASER }}>
              Oportunidades disponibles
            </span>
          </div>
          <h1
            className="absolute m-0"
            style={{ left: 392, top: 214.95, width: 560, fontSize: 48, lineHeight: "55px", letterSpacing: "-1.2px", fontWeight: 300, color: CREAM }}
          >
            Activos seleccionados<br />para <span style={{ fontWeight: 600 }}>crear valor.</span>
          </h1>
          <p
            className="absolute m-0"
            style={{ left: 392, top: 366.25, width: 580, fontSize: 16, lineHeight: "26.5px", fontWeight: 300, color: "rgba(247,241,229,0.78)" }}
          >
            Predios curados por Zequara en zonas consolidadas, con demanda activa, oferta limitada y potencial de transformación.
          </p>
          <span className="absolute" style={{ left: 392, top: 474.79, width: 1136, height: 1, background: "rgba(247,241,229,0.14)" }} />

          {/* Torres decorativas — image 9 e image 10 (207:1208 / 207:1210) */}
          <div className="pointer-events-none absolute overflow-hidden" style={{ left: -624, top: -140, width: 1986, height: 2979 }}>
            <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover opacity-10" src={`${A}/1603eea0cdf422fdf4ee349b5d252c4253213488.webp`} />
          </div>
          <div className="pointer-events-none absolute overflow-hidden" style={{ left: 996, top: 633, width: 931, height: 2217 }}>
            <img loading="lazy" decoding="async" alt="" className="absolute left-0 top-0 h-full max-w-none opacity-10" style={{ width: "158.84%" }} src={`${A}/1603eea0cdf422fdf4ee349b5d252c4253213488.webp`} />
          </div>

          {/* ── Barra de filtros (100:3062) ── */}
          <div
            className="absolute"
            style={{ left: 118, top: 570, width: 1739, height: 111, borderRadius: 24, background: "#3b2410", borderBottom: `1px solid ${LINE}` }}
          />
          {FILTERS.map((f) => <Select key={f.label} {...f} />)}
          <button
            type="button"
            className="ix-press absolute underline"
            style={{ left: 1704, top: 609, width: 99, height: 43, fontSize: 13.6, color: "#ffffff" }}
          >
            Limpiar filtros
          </button>

          {/* ── Nav (100:3121) — compartida con Mis propiedades ── */}
          <PrediosNav active="predios" geo="predios" />

          {/* ── Cifras del portafolio (311:4896 / 4902 / 4906) ── */}
          <span className="absolute" style={{ left: 393, top: 492.81, width: 9, height: 9, borderRadius: 999, background: "#7f8b57" }} />
          <p className="absolute m-0 whitespace-nowrap" style={{ left: 411, top: 486, fontSize: 14, lineHeight: "21px", color: "rgba(247,241,229,0.82)" }}>
            <b style={{ fontWeight: 600, color: LASER }}>5</b> oportunidades disponibles
          </p>
          <p className="absolute m-0 whitespace-nowrap" style={{ left: 660, top: 486, fontSize: 14, lineHeight: "21px", color: "rgba(247,241,229,0.82)" }}>
            <b style={{ fontWeight: 600, color: LASER }}>3</b> en proceso de reserva
          </p>
          <p className="absolute m-0 whitespace-nowrap" style={{ left: 875, top: 486, fontSize: 14, lineHeight: "21px", color: "rgba(247,241,229,0.82)" }}>
            Portafolio actualizado el <b style={{ fontWeight: 600, color: LASER }}>14 de julio</b>
          </p>

          {/* ── Rejilla (311:3734) ── */}
          <p className="absolute m-0" style={{ left: 380, top: 728, fontSize: 16.5, lineHeight: "26px", fontWeight: 600, color: CREAM }}>
            7 oportunidades disponibles
          </p>
          <p className="absolute m-0 whitespace-nowrap text-right" style={{ right: 388, top: 732, fontSize: 13.5, lineHeight: "20px", fontWeight: 300, color: "rgba(247,241,229,0.6)" }}>
            Portafolio limitado · actualización mensual
          </p>
          {PREDIOS.map((p, i) => (
            <PredioCard
              key={p.title}
              x={COLS[i % 3]}
              y={ROWS[Math.floor(i / 3)]}
              data={p}
              delay={(i % 3) * 0.08}
            />
          ))}
        </div>
      </ScaledCanvas>
    </main>
  );
}
