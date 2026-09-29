import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { firma } from "@/lib/firma";

/* ═══════════════════════════════════════════════════════════════════════════
   LA PUERTA DEL ÁREA PRIVADA — sólo en el servidor.

   `/predios`, `/panel` y `/cuenta` son del inversionista con sesión. Cada una
   tiene un `layout.tsx` que llama a `exigeInversor()` antes de pintar nada:
   se le pregunta al backend si la cookie `zq_inversor` vale, y si no, a
   `/login`.

   Se comprueba en el servidor y contra el backend, no mirando si la cookie
   existe: una cookie inventada existe igual. Y va en el layout y no en el
   middleware porque el middleware corre en cada petición, imágenes incluidas,
   y aquí basta con una consulta por página.

   Esto es la puerta de la página. La de los datos es otra y no depende de
   esta: `/api/predios` exige la misma sesión en el backend
   (backend/app/main.py), así que aunque alguien se saltara la página, lo que
   hay detrás no le contesta.
   ═══════════════════════════════════════════════════════════════════════════ */

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export const COOKIE_INVERSOR = "zq_inversor";

/** La cabecera `Cookie` para reenviar al backend la sesión del visitante. */
export function cookieInversor(): Record<string, string> {
  const sid = cookies().get(COOKIE_INVERSOR)?.value;
  return sid ? { cookie: `${COOKIE_INVERSOR}=${sid}` } : {};
}

export type Inversor = { nombre: string; correo: string };

export async function sesionInversor(): Promise<Inversor | null> {
  const galleta = cookieInversor();
  if (!galleta.cookie) return null;
  try {
    const r = await fetch(`${BACKEND}/api/inversor/yo`, {
      headers: { ...firma(), ...galleta },
      cache: "no-store",
    });
    return r.ok ? ((await r.json()) as Inversor) : null;
  } catch {
    /* Sin backend no se puede comprobar, y una sesión que no se puede
       comprobar no es una sesión: fuera, igual que el backend. */
    return null;
  }
}

/** Para los layouts del área privada. `desde` es a dónde volver al entrar. */
export async function exigeInversor(desde: string): Promise<Inversor> {
  const u = await sesionInversor();
  if (!u) redirect(`/login?siguiente=${encodeURIComponent(desde)}`);
  return u;
}
