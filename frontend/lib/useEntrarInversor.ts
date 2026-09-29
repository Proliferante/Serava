"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ENTRAR AL PORTAFOLIO — lo comparten el login de escritorio y el de móvil.

   Manda correo y contraseña a `/api/inversor/login`; el backend responde con
   la cookie `zq_inversor` (HttpOnly: este código no la ve ni la guarda). Si
   entra, se va a donde se quería ir antes del login (`?siguiente=`) o al
   portafolio.
   ═══════════════════════════════════════════════════════════════════════════ */

const PRIVADAS = ["/predios", "/panel", "/cuenta"];

/** `?siguiente=` sólo puede llevar a una página propia del área privada.
 *  Si aceptara cualquier cosa, un enlace `…/login?siguiente=https://otro.com`
 *  mandaría al inversionista, recién identificado, a una copia falsa. */
function destino(): string {
  const s = new URLSearchParams(window.location.search).get("siguiente") ?? "";
  const propia = s.startsWith("/") && !s.startsWith("//") && !s.includes("\\");
  return propia && PRIVADAS.some((p) => s === p || s.startsWith(p + "/")) ? s : "/predios";
}

const SIN_RED = "No pudimos conectar con el servidor. Inténtalo de nuevo en un momento.";

export function useEntrarInversor() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (correo: string, clave: string) => {
    if (enviando) return;
    if (!correo.trim() || !clave) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const r = await fetch("/api/inversor/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ correo: correo.trim(), clave }),
      });
      if (r.ok) {
        router.replace(destino());
        router.refresh();
        return;
      }
      const d = (await r.json().catch(() => null)) as { detail?: unknown } | null;
      /* 401 y 429 traen un mensaje pensado para leerse (genérico a propósito:
         no dice si el correo existe). Un 422 es un campo imposible —un correo
         de 300 caracteres—, y ahí se dice lo mismo que ante uno equivocado. */
      setError(
        (r.status === 401 || r.status === 429 || r.status === 403) && typeof d?.detail === "string"
          ? d.detail
          : r.status === 422 ? "Correo o contraseña incorrectos." : SIN_RED,
      );
    } catch {
      setError(SIN_RED);
    } finally {
      setEnviando(false);
    }
  };

  return { entrar, error, enviando };
}
