"use client";

import { useCallback, useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   EL BOTÓN «INSTALAR APP» DE LA CONSOLA.

   Chrome, Edge y Android no avisan solos de que la consola se puede instalar:
   ponen un icono pequeño en la barra de direcciones, o la opción en un menú,
   y casi nadie la encuentra. Cuando la página es instalable disparan
   `beforeinstallprompt`; se guarda ese evento y el botón lo usa para abrir la
   ventana de instalación del propio navegador.

   Safari (iPhone y iPad) no tiene ese evento ni deja instalar por código: ahí
   el botón sólo puede explicar los dos toques de Compartir → Agregar a
   inicio.

   Si la consola ya se abrió como app instalada, no se ofrece nada. Y fuera
   del subdominio tampoco: en `/admin` no hay manifiesto (ver Instalable.tsx).
   ═══════════════════════════════════════════════════════════════════════════ */

type EventoInstalar = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type Instalar =
  | { modo: "ninguno" }
  | { modo: "navegador"; instalar: () => Promise<void> }
  | { modo: "ios" };

export function useInstalar(): Instalar {
  const [evento, setEvento] = useState<EventoInstalar | null>(null);
  const [ios, setIos] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    if (!window.location.hostname.startsWith("admin.")) return;

    const comoApp =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (comoApp) {
      setInstalada(true);
      return;
    }

    /* iPhone, iPad (que se presenta como Mac con pantalla táctil) y en
       Safari: los otros navegadores de iOS no pueden agregar a inicio. */
    const ua = navigator.userAgent;
    const esIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const esSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    setIos(esIos && esSafari);

    const antes = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalar);
    };
    const hecha = () => {
      setInstalada(true);
      setEvento(null);
    };
    window.addEventListener("beforeinstallprompt", antes);
    window.addEventListener("appinstalled", hecha);
    return () => {
      window.removeEventListener("beforeinstallprompt", antes);
      window.removeEventListener("appinstalled", hecha);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    /* El evento sirve una sola vez. Si dijo que no, el navegador vuelve a
       dispararlo más adelante y el botón reaparece solo. */
    setEvento(null);
    if (outcome === "accepted") setInstalada(true);
  }, [evento]);

  if (instalada) return { modo: "ninguno" };
  if (evento) return { modo: "navegador", instalar };
  if (ios) return { modo: "ios" };
  return { modo: "ninguno" };
}
