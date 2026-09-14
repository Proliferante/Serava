"use client";

import { In, WRAP } from "@/components/responsive/kit";
import { StrokeIcon } from "@/components/predios/ficha/kit";
import {
  ALCANCE, D_CHECK17, D_INFO17, D_SEARCH17, PASOS, PLANO_MARCO, PLANOS, PGRID, QLIST, VIC,
} from "@/components/predios/ficha/Transformacion";
import {
  Band, BROWN, CREAM, FotoPendiente, H2, HAIRLINE, HeroCompact,
  MILL, Ref, ReservaCompact, Sub, ZEUS,
} from "./kit";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA · TRANSFORMACIÓN — vista fluida (móvil y tablet).

   El comparador antes/después y los dos planos se rehacen con porcentajes en
   vez de con las coordenadas del lienzo, para que escalen con la pantalla. Y
   el cronograma, que en escritorio es una línea horizontal de cuatro hitos,
   gira a vertical: en 360 px cuatro columnas dejan los rótulos en dos letras
   por renglón.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Comparador antes/después. Las dos mitades son marcadores de foto. */
function AntesDespues() {
  return (
    <div className="relative overflow-hidden" style={{ aspectRatio: "665 / 374" }}>
      {/* Después */}
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(148.21deg, rgb(107,88,66) 0%, rgb(63,48,32) 100%)" }}>
        <span className="absolute left-1/2 top-[53%] -translate-x-1/2 whitespace-nowrap text-[9.9px] font-semibold uppercase tracking-[1.4px]" style={{ color: "rgba(247,241,229,0.6)" }}>
          Después — render referencial
        </span>
      </div>
      {/* Antes, recortado por el tirador */}
      <div className="absolute inset-0" style={{ clipPath: "inset(0 48.14% 0 0)", backgroundImage: "linear-gradient(149.98deg, rgb(141,133,122) 0%, rgb(92,85,76) 100%)" }}>
        <span className="absolute left-1/2 top-[49%] -translate-x-1/2 whitespace-nowrap text-[9.9px] font-semibold uppercase tracking-[1.4px]" style={{ color: "rgba(247,241,229,0.6)" }}>
          Antes — estado actual
        </span>
      </div>

      <span className="absolute inset-y-0 block w-[2px]" style={{ left: "51.86%", backgroundColor: "#efe6d5" }} />
      <span className="absolute left-[51.86%] top-1/2 flex h-[40px] w-[38px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[2px] rounded-full" style={{ backgroundColor: "#efe6d5", boxShadow: "0 6px 18px -4px rgba(0,0,0,0.5)", color: BROWN }}>
        <StrokeIcon vb={13} d="M8.125 3.25L4.875 6.5L8.125 9.75" w={1.3} />
        <StrokeIcon vb={13} d="M4.875 3.25L8.125 6.5L4.875 9.75" w={1.3} />
      </span>

      <span className="absolute bottom-[14px] left-[14px] rounded-[9px] px-[13px] py-[7px] text-[11.5px] font-semibold" style={{ backgroundColor: "rgba(20,14,9,0.72)", color: "#efe6d5" }}>Antes</span>
      <span className="absolute bottom-[14px] right-[14px] rounded-[9px] px-[13px] py-[7px] text-[11.5px] font-semibold" style={{ backgroundColor: "rgba(20,14,9,0.72)", color: "#efe6d5" }}>Después (referencial)</span>
    </div>
  );
}

/** Plano de planta. Los dos trazos van en porcentaje para escalar con la caja. */
function Plano({ d }: { d: string }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "194.77 / 142.83" }}>
      <svg className="absolute" style={{ left: "0.83%", top: "1.13%", width: "98.33%", height: "97.73%" }} viewBox="0 0 191.523 139.585" fill="none" preserveAspectRatio="none" aria-hidden>
        <path d={PLANO_MARCO} stroke="#bfae93" strokeWidth={1.94769} vectorEffect="non-scaling-stroke" />
      </svg>
      <svg className="absolute" style={{ left: "1.33%", top: "1.82%", width: "97.33%", height: "96.36%" }} viewBox="0 0 189.576 137.637" fill="none" preserveAspectRatio="none" aria-hidden>
        <path d={d} stroke="#cbbb9e" strokeWidth={1.55833} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** El hero de la pestaña: el comparador antes/después en vez de la foto. */
export function TransformacionHeroCompact() {
  return (
    <HeroCompact
      media={<AntesDespues />}
      title={<>De un mueble usado a un activo extraordinario.</>}
      sub="Este apartamento tiene una estructura, ubicación y área que ya son difíciles de encontrar en La Cabrera. Nuestra propuesta de transformación aprovecha ese potencial para crear un espacio contemporáneo, funcional y atemporal, alineado con la demanda actual del mercado."
      cta={{ label: "Ver galería", href: "#galeria" }}
    >
      <ReservaCompact />
    </HeroCompact>
  );
}

/**
 * El cuerpo de la pestaña. Nav, pestañas, barra de reserva y footer los monta
 * `FichaCompact`, que es quien se queda fijo mientras esto entra y sale.
 */
export default function TransformacionCompact() {
  return (
    <>
      {/* ══════════ VISIÓN DE DISEÑO ══════════ */}
      <Band tone="cream" corner="br" className="pb-[40px] pt-[42px]">
        <div className={WRAP}>
          <In>
            <H2>Visión de diseño</H2>
            <Sub>
              Un estilo contemporáneo y atemporal, con materiales naturales, espacios abiertos y una distribución que responde al estilo de vida actual. Diseñamos para que el inmueble se sienta más amplio, más luminoso y más conectado con su entorno.
            </Sub>
          </In>

          <div className="mt-[22px] grid grid-cols-2 gap-[14px] sm:grid-cols-4">
            {VIC.map((v, i) => (
              <In key={v.t[0]} delay={0.04 * i}>
                <span className="flex size-[40px] items-center justify-center rounded-[11px]" style={{ backgroundColor: "#ede7da", color: "#a57a4e" }}>
                  <StrokeIcon vb={20} d={v.d} w={1.25} />
                </span>
                <span className="mt-[10px] block text-[13.5px] font-semibold leading-[1.25]" style={{ color: ZEUS }}>{v.t.join(" ")}</span>
              </In>
            ))}
          </div>

          <In delay={0.1} className="mt-[24px] rounded-[16px] border border-solid p-[20px]" style={{ backgroundColor: "#fbf8f1", borderColor: HAIRLINE }}>
            <h3 className="m-0 text-[clamp(1.3rem,5.4vw,1.8rem)] font-semibold leading-[1.15] tracking-[-0.01em]" style={{ color: "#3d2c1e" }}>Qué transforma esta oportunidad</h3>
            <ul className="m-0 mt-[12px] list-none p-0">
              {QLIST.map((t) => (
                <li key={t} className="flex items-start gap-[12px] py-[9px]">
                  <StrokeIcon vb={17} d={D_CHECK17} w={1.7} className="mt-[3px] shrink-0" style={{ color: "#a57a4e" }} />
                  <span className="text-[14.5px] leading-[1.45]" style={{ color: MILL }}>{t}</span>
                </li>
              ))}
            </ul>
          </In>
        </div>
      </Band>

      {/* ══════════ PROPUESTA + ALCANCE ══════════ */}
      <Band tone="brown" corner="bl" className="pb-[42px] pt-[42px]">
        <div className={WRAP}>
          <In><H2 dark>Propuesta de transformación<Ref dark /></H2></In>

          <div className="mt-[22px] grid grid-cols-2 gap-[10px]">
            {PGRID.map((c, i) => (
              <In key={c.cap} delay={0.04 * i} className={i === 0 ? "col-span-2" : undefined}>
                <FotoPendiente caption={c.cap} ratio={i === 0 ? "16 / 10" : "1 / 1"} />
              </In>
            ))}
          </div>

          <In delay={0.1} className="mt-[30px]">
            <h3 className="m-0 text-[clamp(1.3rem,5.4vw,1.7rem)] font-semibold leading-[1.15] tracking-[-0.01em]" style={{ color: CREAM }}>Alcance de la remodelación</h3>
            <ul className="m-0 mt-[12px] list-none p-0">
              {ALCANCE.map((a, i) => (
                <li
                  key={a.t}
                  className="flex items-center gap-[12px] py-[13px]"
                  style={{ borderBottom: i < ALCANCE.length - 1 ? `1px solid rgba(226,205,174,0.16)` : undefined }}
                >
                  <StrokeIcon vb={18} d={a.d} w={1.20417} className="shrink-0" style={{ color: "#a57a4e" }} />
                  <span className="text-[16px] leading-[1.3]" style={{ color: CREAM }}>{a.t}</span>
                </li>
              ))}
            </ul>

            <div className="mt-[18px] flex gap-[11px] rounded-[12px] p-[16px]" style={{ backgroundColor: "#ede7da" }}>
              <StrokeIcon vb={17} d={D_INFO17} w={1.20417} className="mt-[2px] shrink-0" style={{ color: "#a57a4e" }} />
              <span className="text-[14px] font-light leading-[1.4]" style={{ color: MILL }}>
                El alcance definitivo se define durante el proceso de negociación, ajustado a tus objetivos de inversión.
              </span>
            </div>
          </In>
        </div>
      </Band>

      {/* ══════════ DISTRIBUCIÓN + CRONOGRAMA ══════════ */}
      <Band tone="cream" className="pb-[46px] pt-[42px]">
        <div className={WRAP}>
          <In><H2>Distribución<Ref /></H2></In>

          <div className="mt-[20px] grid grid-cols-2 gap-[12px]">
            {PLANOS.map((p, i) => (
              <In key={p.label} delay={0.05 * i} className="text-center">
                <span className="block text-[15px] font-semibold" style={{ color: "#a57a4e" }}>{p.label}</span>
                <span className="mt-[10px] block rounded-[12px] border border-solid p-[12px]" style={{ backgroundColor: "#fbf8f1", borderColor: HAIRLINE }}>
                  <Plano d={p.d} />
                </span>
                <span className="mt-[10px] block text-[13.4px] font-semibold" style={{ color: ZEUS }}>{p.t}</span>
                <span className="block text-[12.2px] font-light" style={{ color: MILL }}>{p.s}</span>
              </In>
            ))}
          </div>

          <In delay={0.1} className="mt-[34px]">
            <h3 className="m-0 text-[clamp(1.3rem,5.4vw,1.8rem)] font-semibold leading-[1.15] tracking-[-0.01em]" style={{ color: "#3d2c1e" }}>Cronograma estimado</h3>
            <p className="m-0 mt-[8px] text-[14.7px] font-light leading-[1.5]" style={{ color: MILL }}>
              La remodelación se ejecuta bajo un modelo de gestión integral, con proveedores validados y seguimiento continuo.
            </p>

            {/* En vertical: el filete a la izquierda y los hitos colgando. */}
            <ol className="relative m-0 mt-[18px] list-none p-0 pl-[26px]">
              <span className="absolute bottom-[10px] left-[6px] top-[10px] block w-[2px]" style={{ backgroundColor: "rgba(60,45,30,0.13)" }} />
              {PASOS.map((p) => (
                <li key={p.dur} className="relative pb-[18px] last:pb-0">
                  <span className="absolute -left-[26px] top-[4px] block size-[14px] rounded-full" style={{ backgroundColor: "#a57a4e", border: "3px solid #f3eee4" }} />
                  <span className="block text-[14.5px] font-semibold leading-[1.3]" style={{ color: ZEUS }}>{p.tLines.join(" ")}</span>
                  <span className="block text-[12.5px] font-light" style={{ color: MILL }}>{p.dur}</span>
                </li>
              ))}
            </ol>

            <div className="mt-[18px] rounded-[12px] border border-solid p-[18px]" style={{ backgroundColor: "#fbf8f1", borderColor: HAIRLINE }}>
              <span className="flex items-center gap-[10px]">
                <StrokeIcon vb={17} d={D_SEARCH17} w={1.275} className="shrink-0" style={{ color: MILL }} />
                <span className="text-[14.5px] font-semibold" style={{ color: "#3d2c1e" }}>Tiempo total estimado: 6 meses</span>
              </span>
              <p className="m-0 mt-[8px] text-[13.5px] font-light leading-[1.45]" style={{ color: MILL }}>
                Nos enfocamos en cumplir tiempos y presupuesto sin sacrificar el estándar de calidad.
              </p>
            </div>
          </In>
        </div>
      </Band>
    </>
  );
}
