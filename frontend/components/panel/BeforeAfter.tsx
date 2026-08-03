"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Ico } from "@/components/panel/icons";
import { AVOCADO, LINEN, LINEN80 } from "@/components/panel/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   COMPARADOR ANTES / DESPUÉS — Figma 492:1958.

   El "después" va de fondo y el "antes" se recorta por la izquierda hasta la
   posición del tirador, así que arrastrar destapa la obra terminada.

   El recorte usa `clip-path: inset(...)` sobre el porcentaje, no un ancho en
   píxeles: el lienzo del panel va escalado por ScaledCanvas y los porcentajes
   sobreviven al `transform`.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Relleno del estado original: gris frío, obra sin intervenir. */
const BEFORE_BG = "linear-gradient(135deg, #4a4640 0%, #35322d 100%)";
/** Relleno del estado actual: maderas y luz cálida. */
const AFTER_BG = "linear-gradient(140deg, #9c7850 0%, #6b4f36 55%, #43301f 100%)";

/** Rótulo centrado del hueco de foto. */
function Caption({ children }: { children: string }) {
  return (
    <span
      className="absolute uppercase text-center"
      style={{
        left: 0, right: 0, top: "50%", transform: "translateY(-50%)",
        fontSize: 11, lineHeight: "15px", fontWeight: 500, letterSpacing: "1.2px",
        color: "rgba(247,241,229,0.55)", whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** Etiqueta de esquina. */
function BaTag({ side, label }: { side: "left" | "right"; label: string }) {
  const left = side === "left";
  return (
    <span
      className="absolute inline-flex items-center uppercase"
      style={{
        [left ? "left" : "right"]: 14, top: 14, height: 27, padding: "0 12px",
        borderRadius: 8,
        background: left ? "rgba(28,22,16,0.72)" : AVOCADO,
        color: left ? LINEN80 : LINEN,
        fontSize: 11, fontWeight: 600, letterSpacing: "1px",
      }}
    >
      {label}
    </span>
  );
}

export default function BeforeAfter({
  x, y, w, h, r = 12,
  beforeLabel = "Foto ANTES — estado original",
  afterLabel = "Foto DESPUÉS — estado actual",
}: {
  x: number; y: number; w: number; h: number; r?: number;
  beforeLabel?: string; afterLabel?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);

  const moveTo = useCallback((clientX: number) => {
    const el = box.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(100, Math.max(0, next)));
  }, []);

  // El arrastre se sigue en la ventana para que el puntero pueda salirse del
  // comparador sin que la barra se quede pegada a mitad de camino.
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => moveTo(e.clientX);
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, moveTo]);

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") setPct((p) => Math.max(0, p - step));
    else if (e.key === "ArrowRight") setPct((p) => Math.min(100, p + step));
    else if (e.key === "Home") setPct(0);
    else if (e.key === "End") setPct(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={box}
      className="absolute overflow-hidden"
      style={{ left: x, top: y, width: w, height: h, borderRadius: r, background: AFTER_BG, cursor: dragging ? "grabbing" : "ew-resize", touchAction: "none" }}
      onPointerDown={(e) => { setDragging(true); moveTo(e.clientX); }}
    >
      {/* Estado actual, de fondo */}
      <Caption>{afterLabel}</Caption>

      {/* Estado original, recortado hasta el tirador */}
      <div
        className="absolute inset-0"
        style={{ background: BEFORE_BG, clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <Caption>{beforeLabel}</Caption>
      </div>

      <BaTag side="left" label="Antes" />
      <BaTag side="right" label="Después" />

      {/* Línea y tirador */}
      <div className="absolute" style={{ left: `${pct}%`, top: 0, width: 2, height: "100%", marginLeft: -1, background: LINEN, opacity: 0.9 }} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparar antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-valuetext={`${Math.round(pct)} % del estado original visible`}
        onKeyDown={onKey}
        className="pnl-ba-handle absolute flex items-center justify-center"
        style={{
          left: `${pct}%`, top: "50%", width: 44, height: 44, marginLeft: -22, marginTop: -22,
          borderRadius: 999, background: LINEN, color: "#5b4332", gap: 1,
          boxShadow: "0 6px 18px -6px rgba(28,22,16,0.55)",
          cursor: dragging ? "grabbing" : "grab",
        }}
      >
        <Ico name="chevronL" size={13} />
        <Ico name="chevronR" size={13} />
      </div>
    </div>
  );
}
