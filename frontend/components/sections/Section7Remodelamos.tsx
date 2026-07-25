import ValueCard from "@/components/sections/ValueCard";
import { cardX } from "@/components/sections/valueCardMetrics";

const A = "/figma";

const CARDS = [
  {
    title: "Diseño atemporal",
    body: "Materiales naturales, lineas limpias. No seguimos tendencias porque lo que está de moda hoy desvaloriza en cinco años.",
    bodyColor: "rgba(247,241,229,0.9)",
  },
  {
    title: "Materiales de calidad",
    body: "Mejores materiales: menos mantenimiento y un activo que conserva su valor en el tiempo.",
    bodyColor: "rgba(247,241,229,0.78)",
  },
  {
    title: "Obra trazable",
    body: "Seguimiento en cada etapa. Si la obra se pasa del presupuesto, lo asumimos nosotros.",
    bodyColor: "rgba(247,241,229,0.78)",
  },
  {
    title: "Todo formalizado",
    body: "Cada etapa se respalda con contratos claros, desde el ingreso hasta cada servicio.",
    bodyColor: "rgba(247,241,229,0.78)",
  },
];

/** Seccion 7 — Remodelamos para que el activo valga más (1922 × 1688) */
export default function Section7Remodelamos() {
  return (
    <div className="relative size-full" data-name="Seccion 7">
      {/* Background image */}
      <div className="absolute h-[1639px] left-[-162px] top-[-117px] w-[2912px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${A}/7941b044560d1095b5aec747e08e5f1281f727b4.webp`} />
      </div>
      {/* Gradient overlay */}
      <div className="absolute bg-gradient-to-b from-[31.239%] from-[rgba(175,79,0,0)] h-[1695px] left-0 to-[79.582%] to-[rgba(73,33,0,0.73)] top-0 via-[64.478%] via-[rgba(61,26,0,0.73)] w-[1922px]" />

      {/* .serava. logo */}
      <div className="absolute h-[185.94px] left-[536px] top-[308px] w-[939.36px]">
        <img loading="lazy" decoding="async" alt=".serava." className="absolute block inset-0 max-w-none size-full" src={`${A}/b222563045c17eb7e6b761865e89c31fa20bb084.svg`} />
      </div>

      {/* Heading */}
      <p className="-translate-x-1/2 [word-break:break-word] absolute font-medium leading-[0] left-[949.5px] not-italic text-sand text-[0px] text-center top-[873px] w-[1309px]">
        <span className="leading-[normal] text-[35px]">Remodelamos para que el </span>
        <span className="font-bold leading-[normal] text-[35px]">activo valga más</span>
        <span className="leading-[normal] text-[35px]">, no para impresionar</span>
      </p>

      {/* Cards */}
      {CARDS.map((c, i) => (
        <ValueCard key={c.title} left={cardX(i)} delay={i * 0.1} {...c} />
      ))}
    </div>
  );
}
