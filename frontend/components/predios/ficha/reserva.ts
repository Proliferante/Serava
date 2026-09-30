"use client";

import { useEffect, useState } from "react";

import type { Lector } from "@/components/predios/ficha/datos";

/* ═══════════════════════════════════════════════════════════════════════════
   LA RESERVA Y QUIÉN MIRA — lo comparten el recuadro de escritorio y el de
   móvil (predios/ficha/kit.tsx y responsive/predios/ficha/kit.tsx).

   LA CUENTA ATRÁS ES DE VERDAD
   Antes arrancaba en cada carga de la página en «horas de la ficha + 59:38»
   —el diseño lo añadía para que pareciera una cuenta ya empezada—: al
   recargar volvía a 48:59 y cada inversionista veía otro tiempo. Con un
   predio real eso es decir algo que no es.

   Ahora:
     · con `reserva_hasta` (fecha y hora de Colombia) cuenta hasta ese
       momento, igual para todos y aunque se recargue. Pasada la hora dice
       «Cerrada».
     · sin fecha pero con `reserva_horas`, dice cuánto dura la reserva
       («Tu reserva dura 48 horas») sin contar nada.
     · sin ninguna de las dos, el recuadro no sale.

   QUIÉN MIRA
   «N inversionistas viendo este predio» sólo sale si el equipo lo escribió.
   Antes, vacío, decía «5»: una cifra que nadie midió.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Reserva = { etiqueta: string; valor: string };

const dos = (n: number) => String(n).padStart(2, "0");

function restante(s: number): string {
  const dias = Math.floor(s / 86_400);
  const hms = `${dos(Math.floor((s % 86_400) / 3600))}:${dos(Math.floor((s % 3600) / 60))}:${dos(s % 60)}`;
  return dias > 0 ? `${dias} d ${hms}` : hms;
}

/** «2026-10-05T18:00», como lo guarda el campo de fecha del panel, es hora de
 *  Colombia. Se le pone el −05:00 para que un inversionista en otro país vea
 *  el mismo cierre y no el de su reloj. */
function cierre(texto: string): number {
  const t = texto.trim();
  if (!t) return NaN;
  return Date.parse(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t) ? `${t}:00-05:00` : t);
}

export function useReserva(d: Lector): Reserva | null {
  const fin = cierre(d.t("reserva_hasta", ""));
  const horas = d.n("reserva_horas", 0);
  /* `null` hasta montar: en el servidor no hay "ahora" que valga, y pintar
     una cuenta allí haría que el HTML no coincidiera con el del navegador. */
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(fin)) return;
    setAhora(Date.now());
    const id = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [fin]);

  if (Number.isFinite(fin)) {
    if (ahora === null) return { etiqueta: "Reserva disponible por", valor: "··:··:··" };
    const s = Math.max(0, Math.floor((fin - ahora) / 1000));
    return s > 0
      ? { etiqueta: "Reserva disponible por", valor: restante(s) }
      : { etiqueta: "Reserva", valor: "Cerrada" };
  }
  if (horas > 0) return { etiqueta: "Tu reserva dura", valor: `${horas} ${horas === 1 ? "hora" : "horas"}` };
  return null;
}

export function viendoAhora(d: Lector): string | null {
  const n = Math.floor(d.n("viendo_ahora", 0));
  if (n <= 0) return null;
  return `${n} ${n === 1 ? "inversionista" : "inversionistas"} viendo este predio`;
}
