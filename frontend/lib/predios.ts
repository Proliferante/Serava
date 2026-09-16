import type { Predio } from "@/components/predios/PredioCard";

/* ═══════════════════════════════════════════════════════════════════════════
   LOS PREDIOS PUBLICADOS — del backend a las páginas del inversionista.

   Esto se llama desde componentes de servidor, así que no puede usar la ruta
   relativa `/api/...`: la reescritura de `next.config.js` la resuelve el
   navegador o el servidor de Next para peticiones que le llegan, no un
   `fetch` que sale de dentro. Hace falta la dirección completa del backend,
   que es la misma variable del despliegue.

   SI EL BACKEND NO RESPONDE, LA PÁGINA NO SE CAE
   Devuelve la lista vacía y lo dice en el registro. Una caída del backend
   tiene que verse como "aún no hay oportunidades", no como una pantalla de
   error de Next: el resto de la página —el encabezado, los filtros, el
   nav— sigue siendo válido y útil.

   EL PROTOTIPO SIGUE AHÍ, Y TIENE INTERRUPTOR
   Mientras no haya predios reales publicados, `/predios` enseña las ocho
   tarjetas de muestra del diseño. No son reales y lo serán menos cada día,
   así que en cuanto haya inventario de verdad se apaga con
   `NEXT_PUBLIC_PREDIOS_MUESTRA=0` y la página pasa a decir la verdad: que
   todavía no hay nada publicado.
   ═══════════════════════════════════════════════════════════════════════════ */

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

/** Se revalida solo cada minuto: publicar un predio no es algo de cada hora. */
const REVALIDAR = 60;

export type PredioPublicado = Predio & { slug: string; foto?: string | null };

export type Listado = {
  predios: PredioPublicado[];
  total: number;
  actualizado: string | null;
};

export type FichaPublicada = {
  slug: string;
  ficha: Record<string, unknown>;
  fotos: Record<string, string>;
  tarjeta: PredioPublicado;
};

/** ¿Se enseñan las tarjetas de muestra del diseño cuando no hay nada real? */
export function conMuestra() {
  return process.env.NEXT_PUBLIC_PREDIOS_MUESTRA !== "0";
}

async function pedir<T>(ruta: string): Promise<T | null> {
  try {
    const r = await fetch(`${BACKEND}${ruta}`, { next: { revalidate: REVALIDAR } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch (e) {
    /* Sin backend en local es lo normal mientras se trabaja sólo en el
       frontend. Se anota y se sigue: la página sabe qué hacer sin datos. */
    console.warn(`[predios] no se pudo leer ${ruta}:`, (e as Error).message);
    return null;
  }
}

export async function listaPredios(): Promise<Listado> {
  return (await pedir<Listado>("/api/predios")) ?? { predios: [], total: 0, actualizado: null };
}

export async function fichaPredio(slug: string): Promise<FichaPublicada | null> {
  return pedir<FichaPublicada>(`/api/predios/${encodeURIComponent(slug)}`);
}

/** «14 de julio», como lo escribe el encabezado del portafolio. */
export function fechaLarga(iso: string | null): string | null {
  if (!iso) return null;
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return null;
  return f.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}
