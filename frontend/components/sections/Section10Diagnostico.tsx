import type { CSSProperties } from "react";
import DiagnosticoTrigger from "@/components/DiagnosticoTrigger";

const A = "/figma";
const MASK = `url("${A}/4697f1e876333b5d184437c4efd2d030a61e1462.svg")`;

/** Shared mask (rounded card shape) — the same absolute region for every masked layer. */
function mask(position: string): CSSProperties {
  return {
    WebkitMaskImage: MASK,
    maskImage: MASK,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "538px 464px",
    maskSize: "538px 464px",
    WebkitMaskPosition: position,
    maskPosition: position,
  };
}

/** Frame 12 — Diagnóstico patrimonial (1920 × 869) */
export default function Section10Diagnostico() {
  return (
    <div className="bg-cream overflow-clip relative rounded-tl-[150px] size-full" data-name="Frame 12">
      {/* Left copy */}
      <p className="[word-break:break-word] absolute font-black leading-[normal] left-[411px] not-italic text-brown-dark text-[60px] top-[118px] w-[641px]">
        ¿Qué estrategia inmobiliaria se ajusta mejor a tu patrimonio?
      </p>
      <p className="[word-break:break-word] absolute font-normal leading-[0] left-[411px] not-italic text-brown-dark text-[0px] top-[501px] w-[611px]">
        <span className="leading-[normal] text-[25px]">En menos de </span>
        <span className="font-bold leading-[normal] text-[25px]">5 minutos </span>
        <span className="leading-[normal] text-[25px]">obtén una lectura inicial sobre tu perfil de riesgo, estrategia de inversión, mercados compatibles y potencial ruta patrimonial.</span>
      </p>

      {/* Right masked card: photo */}
      <div className="absolute h-[623px] left-[981px] top-[55px] w-[831px]" style={mask("80px 86px")}>
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${A}/1d104ea194ca7ae5b0f84b1328433a3a584b589f.webp`} />
      </div>
      {/* Dark gradient overlay */}
      <div
        className="absolute h-[464px] left-[1061px] rounded-tl-[51px] top-[141px] w-[441px]"
        style={{
          ...mask("0px 0px"),
          backgroundImage:
            "linear-gradient(269.822deg, rgba(217, 217, 217, 0) 0.16161%, rgba(73, 33, 0, 0.8) 93.609%, rgb(73, 33, 0) 99.828%)",
        }}
      />
      {/* Card text */}
      <div className="[word-break:break-word] absolute font-normal leading-[0] left-[1097px] not-italic text-[0px] text-white top-[240px] w-[405px]" style={mask("-36px -99px")}>
        <p className="font-extrabold leading-[2.015] mb-0 text-[25px]">Toma 5 minutos</p>
        <ul className="list-disc ps-[1.5em]">
          <li className="mb-0"><span className="leading-[2.015] text-[25px]">Tu perfil de riesgo</span></li>
          <li className="mb-0"><span className="leading-[2.015] text-[25px]">Mercados compatibles</span></li>
          <li><span className="leading-[2.015] text-[25px]">Ruta patrimonial sugerida</span></li>
        </ul>
      </div>
      {/* CTA button (masked) → abre el modal de diagnóstico */}
      <DiagnosticoTrigger
        className="ix-invert-w absolute bg-white flex h-[92px] items-center justify-center left-[1150px] overflow-clip px-[42px] py-[20px] rounded-[98px] shadow-[0px_6px_10px_0px_rgba(0,0,0,0.25)] top-[479px] w-[349px]"
        style={mask("-89px -338px")}
      >
        <div className="[word-break:break-word] flex flex-col font-bold h-[68px] justify-center leading-[0] not-italic text-brown-dark text-[20px] text-center w-[687px] whitespace-pre-wrap">
          <p className="leading-[1.36] mb-0">Hacer diagnóstico </p>
          <p className="leading-[1.36]">patrimonial</p>
        </div>
      </DiagnosticoTrigger>
    </div>
  );
}
