import ScaledCanvas from "@/components/ScaledCanvas";
import CountUp from "@/components/motion/CountUp";
import PredioCard, { type Predio } from "@/components/predios/PredioCard";

const A = "/figma";
const DARK_IMG = "linear-gradient(180deg, #2a1e14 12%, #492202 85%)";

const PREDIOS: Predio[] = [
  { city: "La Cabrera · Bogotá", title: ["Apartamento ultra lujo", "remodelado"], score: 96, urgency: { label: "Reserva liberada en", value: "3h 10m" }, specs: ["320 m²", "3 hab", "3 baños", "2 parq"], price: "$3.100M COP", roi: 22, note: { text: "5 inversionistas viendo este predio ahora", tone: "red" }, variant: "available" },
  { city: "Chicó · Bogotá", title: ["Penthouse con terraza,", "vista abierta"], score: 91, pill: { label: "Última oferta", tone: "orange" }, specs: ["280 m²", "3 hab", "3 baños", "3 parq"], price: "$2.050M COP", roi: 19, note: { text: "Última unidad · último llamado", tone: "red" }, variant: "available" },
  { city: "Rosales · Bogotá", title: ["Reserva reciente —", "ejemplo"], score: 91, specs: ["190 m²", "3 hab", "3 baños", "3 parq"], price: "$1.900M COP", roi: 20, note: { text: "Reservada — ya no disponible", tone: "muted" }, variant: "reserved" },
  { city: "El Poblado · Medellín", title: ["Unidad reconvertida,", "edificio boutique"], score: 95, pill: { label: "Más visto", tone: "orange" }, specs: ["148 m²", "2 hab", "2 baños", "1 parq"], price: "$1.180M COP", roi: 21, note: { text: "6 inversionistas viendo este predio ahora", tone: "red" }, variant: "available" },
  { city: "Costa del Este · Panamá", title: ["Apartamento premium", "frente al mar"], score: 90, pill: { label: "Recién liberado", tone: "green" }, specs: ["160 m²", "3 hab", "3 baños", "3 parq"], price: "$420k USD", roi: 16, note: { text: "4 personas lo tienen en la mira", tone: "red" }, variant: "available" },
  { city: "Punta Pacífica · Panamá", title: ["Torre exclusiva,", "acabados de lujo"], score: 89, pill: { label: "Última oferta", tone: "orange" }, specs: ["190 m²", "3 hab", "3 baños", "3 parq"], price: "$390k USD", roi: 15, note: { text: "7 inversionistas viendo este predio ahora", tone: "red" }, variant: "available" },
  { city: "Laureles · Medellín", title: ["Clásico intervenido", "con criterio"], score: 88, specs: ["170 m²", "3 hab", "2 baños", "1 parq"], price: "$890M COP", roi: 18, note: { text: "1 persona la tiene en la mira", tone: "muted" }, variant: "available" },
  { city: "Alto Prado · Barranquilla", title: ["Residencia amplia,", "zona consolidada"], score: 87, specs: ["260 m²", "4 hab", "3 baños", "2 parq"], price: "$1.450M COP", roi: 17, note: { text: "Disponible — sé el primero en reservar", tone: "green" }, variant: "available" },
  { city: "Ciudad de México · México", title: ["Próxima camada —", "mercado en apertura"], pill: { label: "Próximamente", tone: "neutral" }, variant: "coming", description: "Estamos abriendo esta camada según el interés de nuestros inversionistas." },
  { city: "Madrid · España", title: ["Próxima camada —", "mercado en apertura"], pill: { label: "Próximamente", tone: "neutral" }, variant: "coming", description: "Estamos abriendo esta camada según el interés de nuestros inversionistas." },
];

const NAV = ["Predios disponibles", "Análisis Add Value", "Mis propiedades"];
const FILTERS = [
  { label: "País", value: "Todos", w: 170 },
  { label: "Ciudad", value: "Todas", w: 202 },
  { label: "Zona", value: "Todas", w: 170 },
  { label: "Antigüedad", value: "Cualquiera", w: 173 },
];
const Chevron = () => (<svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>);

export default function PrediosPage() {
  return (
    <main className="min-h-screen bg-cream">
      <ScaledCanvas width={1920} height={3107}>
        <div className="relative size-full" style={{ background: "linear-gradient(0deg, #E2CDAE 0.02%, #492100 82.77%), #FFF" }}>
          {/* Dark top (nav + header) */}
          <div className="absolute left-0 top-0 h-[674px] w-full" style={{ backgroundColor: "#2a1e14", backgroundImage: DARK_IMG }}>
            {/* Nav */}
            <div className="absolute left-0 top-0 h-[82px] w-full">
              <a href="/" className="ix-nav absolute h-[29.8px] left-[101px] top-[21px] w-[175.28px]">
                <img loading="lazy" decoding="async" alt="Serava" className="absolute inset-0 block size-full max-w-none" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
              </a>
              <div className="absolute left-1/2 top-[16px] flex -translate-x-1/2 items-center gap-[6px] rounded-[999px] p-[5px]" style={{ background: "rgba(247,241,229,0.06)" }}>
                {NAV.map((n, i) => (
                  <span key={n} className={`rounded-[999px] px-[18px] py-[9px] text-[13px] font-medium ${i === 0 ? "bg-[#7f8b57] text-cream-93" : "text-[rgba(247,241,229,0.65)]"}`}>{n}</span>
                ))}
              </div>
              <div className="absolute right-[320px] top-[22px] flex size-[38px] items-center justify-center rounded-full border border-solid border-[rgba(247,241,229,0.2)] text-[12px] font-semibold text-cream-93" style={{ background: "rgba(247,241,229,0.06)" }}>NR</div>
            </div>

            {/* Header */}
            <div className="absolute left-[392px] top-[146px] w-[1136px]">
              <div className="flex items-center gap-[12px]">
                <span className="h-px w-[32px] bg-tan-63 opacity-80" />
                <span className="font-semibold text-[11px] uppercase tracking-[0.3em] text-tan-63">Oportunidades abiertas hoy</span>
              </div>
              <p className="mt-[26px] max-w-[600px] font-light text-[52px] leading-[1.08] tracking-[-0.02em] text-cream-93">Las mejores oportunidades no esperan.</p>
              <p className="mt-[18px] max-w-[555px] font-light text-[16px] leading-[1.5]" style={{ color: "rgba(247,241,229,0.78)" }}>Predios curados por el criterio Serava, listos para reservar. Cuando uno se reserva, deja de estar disponible para todos los demás.</p>
              <div className="mt-[30px] flex items-center gap-[26px] border-t border-solid pt-[22px] text-[14px]" style={{ borderColor: "rgba(247,241,229,0.14)", color: "rgba(247,241,229,0.82)" }}>
                <span className="flex items-center gap-[6px]"><span className="ix-live inline-block size-[10px] rounded-full bg-[#7f8b57]" /><b className="font-semibold text-tan-63"><CountUp value={14} /></b> inversionistas viendo predios ahora</span>
                <span><b className="font-semibold text-tan-63"><CountUp value={3} /></b> reservados en las últimas 24h</span>
                <span><b className="font-semibold text-tan-63"><CountUp value={7} /></b> disponibles de esta camada</span>
              </div>
            </div>
          </div>

          {/* Decorative building backdrop (faint towers) — image 9 (left) + image 10 (right) */}
          <div className="pointer-events-none absolute left-[-484px] top-[294px] h-[2806px] w-[1871px]">
            <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover opacity-10" src={`${A}/1603eea0cdf422fdf4ee349b5d252c4253213488.webp`} />
          </div>
          <div className="pointer-events-none absolute left-[1043px] top-[1021px] h-[2089px] w-[877px]">
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <img loading="lazy" decoding="async" alt="" className="absolute left-0 top-0 h-full max-w-none" style={{ width: "158.84%" }} src={`${A}/1603eea0cdf422fdf4ee349b5d252c4253213488.webp`} />
            </div>
          </div>

          {/* Filters bar */}
          <div className="absolute left-0 top-[569.5px] h-[104.36px] w-full" style={{ borderBottom: "1px solid rgba(165,122,78,0.28)" }}>
            <div className="absolute left-[320px] top-0 flex h-[103.36px] max-w-[1280px] flex-wrap items-end gap-x-[16px] px-[72px] py-[20px]">
              {FILTERS.map((f) => (
                <div key={f.label} className="flex flex-col gap-[7px]" style={{ width: f.w }}>
                  <span className="font-semibold text-[11.2px] uppercase leading-[17.36px] tracking-[1.568px] text-[#fde8d3]">{f.label}</span>
                  <div className="flex items-center justify-between rounded-[11px] border border-solid border-[rgba(165,122,78,0.28)] px-[16px] py-[12px]" style={{ backgroundColor: "#efe6d5" }}>
                    <span className="font-normal text-[14.7px] leading-[15px] text-[#2a1e14]">{f.value}</span>
                    <span className="text-[#5b4332]"><Chevron /></span>
                  </div>
                </div>
              ))}
              {/* Ordenar por — grows to fill the row */}
              <div className="flex min-w-[221px] flex-1 flex-col gap-[7px]">
                <span className="font-semibold text-[11.2px] uppercase leading-[17.36px] tracking-[1.568px] text-[#fde8d3]">Ordenar por</span>
                <div className="flex items-center justify-between rounded-[11px] border border-solid border-[rgba(165,122,78,0.28)] px-[16px] py-[12px]" style={{ backgroundColor: "#efe6d5" }}>
                  <span className="font-normal text-[14.7px] leading-[15px] text-[#2a1e14]">Score Serava (mayor)</span>
                  <span className="text-[#5b4332]"><Chevron /></span>
                </div>
              </div>
              {/* Limpiar filtros */}
              <div className="flex h-[63.36px] items-center">
                <button type="button" className="ix-press whitespace-nowrap text-[13.6px] font-normal text-white underline">Limpiar filtros</button>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="absolute left-[392px] top-[698px] w-[1136px]">
            <div className="flex items-center justify-between">
              <p className="text-[16px] font-semibold text-white">7 oportunidades disponibles</p>
              <span className="rounded-[999px] border border-solid border-[rgba(181,84,47,0.3)] bg-[rgba(181,84,47,0.1)] px-[16px] py-[9px] text-[12.8px] font-semibold text-[#b5542f]">Inventario limitado · nuevas camadas cada mes</span>
            </div>
            <div className="mt-[24px] grid grid-cols-3 gap-x-[24px] gap-y-[24px]">
              {PREDIOS.map((p, i) => (
                <PredioCard key={i} data={p} delay={(i % 3) * 0.08} />
              ))}
            </div>
          </div>
        </div>
      </ScaledCanvas>
    </main>
  );
}
