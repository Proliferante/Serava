"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Icons ─────────────────────────────────────────────────────────── */
const st = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Pin = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>);
const Search = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
const Wrench = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>);
const Key = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><circle cx="7.5" cy="15.5" r="5.5" /><path d="M21 2l-9.6 9.6M15.5 7.5l3 3" /></svg>);
const Gear = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const Activity = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-6" /></svg>);
const Clock = () => (<svg viewBox="0 0 24 24" className="size-full" {...st} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
const Check = () => (<svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5" /></svg>);
const Star = () => (<svg viewBox="0 0 24 24" className="size-full" fill="currentColor" stroke="none" aria-hidden><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.6z" /></svg>);
const Chevron = ({ dir }: { dir: "l" | "r" }) => (<svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={dir === "l" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} /></svg>);
const ArrowR = () => (<svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>);

/* ── Data ──────────────────────────────────────────────────────────── */
type Step = {
  num: string;
  title: string;
  Icon: () => ReactNode;
  badge?: string;
  cuenta: string;
  serava: ReactNode[];
  chip?: string;
  takeaway: string;
  foot?: string;
};

const STEPS: Step[] = [
  {
    num: "01", title: "Elegir la zona", Icon: Pin,
    cuenta: "Semanas investigando mercados para, aun así, decidir sin certeza.",
    serava: [
      <>Zonas validadas por nuestros <b className="font-semibold">datos y el Serava Score</b>.</>,
      "Demanda alta, oferta limitada.",
    ],
    takeaway: "Meses de investigación que te ahorras.",
  },
  {
    num: "02", title: "Encontrar el predio", Icon: Search,
    cuenta: "Meses de búsqueda, con riesgo de pagar de más o comprar el activo equivocado.",
    serava: [
      <>Predios ya <b className="font-semibold">curados por arquitectos expertos</b>.</>,
      "Sustentados uno a uno, no solo por precio.",
    ],
    takeaway: "La selección, hecha y sustentada.",
  },
  {
    num: "03", title: "Remodelar", Icon: Wrench, badge: "El núcleo del modelo",
    cuenta: "Meses coordinando obra, con sobrecostos y retrasos que salen de tu bolsillo.",
    serava: [
      <>Sistema de gestión de obra con <b className="font-semibold">diseño e interventoría independientes</b>.</>,
      "Control real, no juez y parte.",
      "Materiales de alta calidad.",
      <b className="font-semibold">Sin sobrecostos.</b>,
    ],
    chip: "95% cumplimiento de tiempos",
    takeaway: "Cada mes de obra que no se pierde es renta que empieza antes.",
    foot: "Salvo imprevistos ajenos a Serava.",
  },
  {
    num: "04", title: "Arrendar", Icon: Key,
    cuenta: "Buscas inquilino y gestionas el contrato. Cada mes vacío es renta que no entra.",
    serava: [
      <><b className="font-semibold">Colocamos al arrendatario</b>.</>,
      "Administramos el arriendo de principio a fin.",
    ],
    takeaway: "El activo empieza a rentar, sin demora.",
  },
  {
    num: "05", title: "Administrar", Icon: Gear,
    cuenta: "Tu tiempo se va en mantenimiento, reparaciones y propiedad horizontal. Sin fecha de fin.",
    serava: [
      <>Sostenemos <b className="font-semibold">mantenimiento y reparaciones</b>.</>,
      "Propiedad horizontal incluida.",
    ],
    takeaway: "Tu atención queda libre. Indefinidamente.",
  },
  {
    num: "06", title: "Seguir la inversión", Icon: Activity,
    cuenta: "Armas tu propio control para no perder de vista el activo, la renta y el valor.",
    serava: [
      <><b className="font-semibold">Apruebas y sigues cada etapa</b>.</>,
      "Datos, obra y zona — sin ejecutar nada.",
    ],
    takeaway: "Control total, en minutos.",
  },
];

/* ── Step card ─────────────────────────────────────────────────────── */
function StepCard({ step }: { step: Step }) {
  return (
    <div className="w-[620px] max-w-full rounded-[40px] bg-[#f7f1e5] px-[42px] pt-[34px] pb-[36px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold not-italic text-[#a57a4e] text-[14px] leading-[22px]">{step.num}</p>
          <p className="font-light not-italic text-[#2a1e14] text-[28px] leading-[35px]">{step.title}</p>
          {step.badge && (
            <span className="mt-[8px] inline-block rounded-[7px] bg-[#7f8b57] px-[11px] py-[4px] font-bold text-[10px] leading-[15px] text-[#f7f1e5]">{step.badge}</span>
          )}
        </div>
        <div className="flex size-[54px] shrink-0 items-center justify-center rounded-full border border-solid border-[rgba(165,122,78,0.28)] bg-[rgba(165,122,78,0.12)] text-[#3d2c1e]">
          <span className="size-[25px]"><step.Icon /></span>
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-[26px] flex items-stretch gap-[12.6px]">
        {/* Por tu cuenta */}
        <div className="flex-1 rounded-[15px] border border-solid border-[rgba(181,84,47,0.18)] bg-[rgba(181,84,47,0.06)] p-[16px]">
          <p className="font-bold text-[10px] leading-[16px] text-[#b5542f]">Por tu cuenta</p>
          <p className="mt-[11px] font-light text-[14px] leading-[21px] text-[#5b4332]">{step.cuenta}</p>
        </div>
        {/* Con Serava */}
        <div className="flex-1 rounded-[15px] border border-solid border-[rgba(127,139,87,0.28)] bg-[rgba(127,139,87,0.09)] p-[16px]">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[10px] leading-[16px] text-[#5f6b3e]">Con Serava</p>
            <span className="flex size-[19.8px] items-center justify-center rounded-full bg-[#7f8b57] p-[4.5px] text-[#f7f1e5]"><Check /></span>
          </div>
          <ul className="mt-[12px] flex flex-col gap-[8px]">
            {step.serava.map((b, i) => (
              <li key={i} className="flex items-start gap-[8px]">
                <span className="mt-[3px] size-[13.5px] shrink-0 text-[#7f8b57]"><Check /></span>
                <p className="font-light text-[14px] leading-[21px] text-[#3d2c1e]">{b}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Metric chip */}
      {step.chip && (
        <div className="mt-[16px] flex h-[41px] items-center gap-[10px] rounded-[11px] bg-[#3d2c1e] px-[14px]">
          <span className="size-[15.3px] shrink-0 text-[#c9a877]"><Clock /></span>
          <p className="font-semibold text-[12.5px] leading-[21px] text-[#c9a877]">{step.chip}</p>
        </div>
      )}

      {/* Takeaway */}
      <div className="mt-[16px] flex items-start gap-[8px]">
        <span className="mt-[3px] size-[13.5px] shrink-0 text-[#5f6b3e]"><Star /></span>
        <p className="font-semibold text-[14px] leading-[22px] text-[#5f6b3e]">{step.takeaway}</p>
      </div>
      {step.foot && <p className="mt-[6px] font-light text-[11px] leading-[17px] text-[#5b4332]">{step.foot}</p>}
    </div>
  );
}

/* ── Modal content (header + carousel + nav + footer) ──────────────── */
function ModalContent() {
  const [[idx, dir], setIdx] = useState<[number, number]>([0, 0]);

  const go = (next: number) => {
    if (next < 0 || next > STEPS.length - 1) return;
    setIdx([next, next > idx ? 1 : -1]);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 64 : -64, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -64 : 64, opacity: 0 }),
  };

  return (
    <div className="relative w-[min(1040px,92vw)] rounded-[40px] bg-[#eadec9] px-[56px] pt-[52px] pb-[40px]">
      {/* Header */}
      <p className="font-semibold text-[#a57a4e] text-[20px] leading-[24px]">El ciclo de tu inversión</p>
      <p className="mt-[20px] max-w-[900px] font-semibold text-[46px] leading-[52px]">
        <span className="font-light text-[#3d2c1e]">En una inversión, cada etapa cuesta tiempo. Y el tiempo es </span>
        <span className="text-[#2a1e14]">renta y es riesgo. </span>
        <span className="text-[#5f6b3e]">Nosotros lo asumimos.</span>
      </p>
      <p className="mt-[22px] max-w-[640px] text-[20px] leading-[27px]">
        <span className="font-light text-[#5b4332]">Invertir directo es posible. Pero cada mes que tardas en encontrar, remodelar o arrendar es </span>
        <span className="font-medium text-[#3d2c1e]">renta que no entra y capital detenido. </span>
        <span className="font-light text-[#5b4332]">Serava elimina ese tiempo — y lo que ese tiempo te cuesta.</span>
      </p>

      {/* Carousel */}
      <div className="mt-[40px] flex min-h-[500px] items-start justify-center">
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={idx}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: EASE }}
          >
            <StepCard step={STEPS[idx]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="mt-[8px] flex flex-col items-center gap-[16px]">
        <div className="flex items-center gap-[22px]">
          <button
            type="button"
            onClick={() => go(idx - 1)}
            disabled={idx === 0}
            aria-label="Anterior"
            className="ix-press flex size-[46px] items-center justify-center rounded-full border border-solid border-[rgba(165,122,78,0.35)] bg-[rgba(165,122,78,0.12)] p-[13px] text-[#3d2c1e] transition-opacity disabled:opacity-30"
          >
            <Chevron dir="l" />
          </button>
          <p className="font-medium text-[16px] tabular-nums">
            <span className="text-[#3d2c1e]">{STEPS[idx].num}</span>
            <span className="text-[#a57a4e]"> / 06</span>
          </p>
          <button
            type="button"
            onClick={() => go(idx + 1)}
            disabled={idx === STEPS.length - 1}
            aria-label="Siguiente"
            className="ix-press flex size-[46px] items-center justify-center rounded-full bg-[#7f8b57] p-[13px] text-cream-93 transition-[opacity,transform] hover:scale-[1.05] disabled:opacity-30 disabled:hover:scale-100"
          >
            <Chevron dir="r" />
          </button>
        </div>
        {/* Dots */}
        <div className="flex items-center gap-[8px]">
          {STEPS.map((s, i) => (
            <button
              key={s.num}
              type="button"
              aria-label={`Paso ${s.num}`}
              onClick={() => go(i)}
              className="h-[6px] rounded-full transition-all duration-300"
              style={{ width: i === idx ? 24 : 6, backgroundColor: i === idx ? "#7f8b57" : "rgba(165,122,78,0.35)" }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-[36px] flex items-center justify-between gap-[24px]">
        <p className="max-w-[320px] text-[22px] leading-[34px]">
          <span className="font-light text-[#3d2c1e]">Tú sumas un inmueble a tu patrimonio. </span>
          <span className="text-[#5f6b3e]">Nosotros hacemos el resto.</span>
        </p>
        <a
          href="/solicitud-acceso"
          className="flex h-[58px] shrink-0 items-center gap-[10px] rounded-[999px] bg-[#7f8b57] px-[32px] text-cream-93 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          style={{ filter: "drop-shadow(0px 16px 16px rgba(47,55,30,0.6))" }}
        >
          <span className="font-semibold text-[16px]">Conoce el proceso de acceso</span>
          <span className="size-[18px]"><ArrowR /></span>
        </a>
      </div>
    </div>
  );
}

/** Popup: "El ciclo de tu inversión" — Por tu cuenta vs. Con Serava, en 6 pasos. */
export default function ComparativaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="El ciclo de tu inversión: por tu cuenta vs. con Serava"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden />

          <div className="relative flex min-h-full items-start justify-center p-6" onClick={onClose}>
            <motion.div
              className="relative shrink-0 rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="ix-press absolute right-[28px] top-[28px] z-10 flex size-[48px] items-center justify-center rounded-full bg-[#3d2c1e] text-cream-93 text-[26px] leading-none transition-colors hover:bg-black"
              >
                ×
              </button>
              <ModalContent />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
