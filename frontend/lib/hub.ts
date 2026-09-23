import type { CardData } from "@/components/sections/hub/HubCard";
import type { CardType } from "@/components/sections/hub/icons";

/* ═══════════════════════════════════════════════════════════════════════════
   EL CONTENIDO DEL HUB — de la consola a la página.

   Igual que `lib/predios.ts`: esto se llama desde componentes de servidor, así
   que no vale la ruta relativa `/api/...` —la reescritura de next.config la
   resuelve el navegador, no un `fetch` que sale de dentro—. Hace falta la
   dirección completa del backend.

   SI EL BACKEND NO RESPONDE, LA PÁGINA NO SE CAE
   Devuelve la lista vacía, y con la lista vacía el HUB sigue enseñando las
   ocho tarjetas de muestra del diseño. El día que haya contenido de verdad,
   las de muestra desaparecen solas.

   POR QUÉ SE PARTEN LOS TEXTOS AQUÍ
   El lienzo es de medidas fijas y la tarjeta pinta el titular en dos
   renglones y la descripción en dos o tres. Quien escribe en la consola
   teclea el texto seguido —pedirle que cuente caracteres sería absurdo—, así
   que el reparto se hace aquí, contando por palabras para no partir ninguna.
   ═══════════════════════════════════════════════════════════════════════════ */

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

/** Se revalida solo cada minuto: publicar en el HUB no es algo de cada hora. */
const REVALIDAR = 60;

export type ContenidoHub = {
  slug: string;
  tipo: CardType;
  categoria: string;
  titulo: string;
  descripcion: string;
  meta: string;
  enlace: string;
  foto: string | null;
  pie_foto: string;
  destacado: boolean;
  orden: number;
};

/** ¿Se enseñan las tarjetas de muestra del diseño cuando no hay nada real? */
export function conMuestra() {
  return process.env.NEXT_PUBLIC_HUB_MUESTRA !== "0";
}

/**
 * Reparte un texto en `n` renglones sin partir palabras.
 *
 * No busca el reparto perfecto: busca que ningún renglón se pase de largo y
 * que el último no quede con una palabra suelta. Con dos renglones eso es
 * cortar lo más cerca posible de la mitad.
 */
export function enLineas(texto: string, n: number): string[] {
  const limpio = (texto || "").replace(/\s+/g, " ").trim();
  if (!limpio) return Array(n).fill("");
  const palabras = limpio.split(" ");
  if (palabras.length <= n) {
    return [...palabras, ...Array(n - palabras.length).fill("")];
  }
  const objetivo = Math.ceil(limpio.length / n);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const quedan = n - lineas.length;
    // En el último renglón cabe todo lo que falte: partirlo otra vez dejaría
    // texto fuera de la tarjeta.
    if (quedan === 1) { actual = actual ? `${actual} ${p}` : p; continue; }
    if (actual && (actual + " " + p).length > objetivo) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = actual ? `${actual} ${p}` : p;
    }
  }
  lineas.push(actual);
  while (lineas.length < n) lineas.push("");
  return lineas.slice(0, n);
}

/** Una fila de la base, en la forma que pinta la tarjeta. */
export function aTarjeta(c: ContenidoHub): CardData {
  const [t1, t2] = enLineas(c.titulo, 2);
  return {
    type: c.tipo,
    imageLabel: c.pie_foto || c.categoria.toLowerCase(),
    category: c.categoria,
    title: [t1, t2],
    desc: enLineas(c.descripcion, c.descripcion.length > 120 ? 3 : 2).filter(Boolean),
    meta: c.meta,
    foto: c.foto || undefined,
    enlace: c.enlace || undefined,
  };
}

export async function contenidoHub(): Promise<ContenidoHub[]> {
  try {
    const r = await fetch(`${BACKEND}/api/hub`, { next: { revalidate: REVALIDAR } });
    if (!r.ok) return [];
    const d = (await r.json()) as { contenido: ContenidoHub[] };
    return d.contenido ?? [];
  } catch (e) {
    /* Sin backend en local es lo normal mientras se trabaja sólo en el
       frontend. Se anota y se sigue: la página sabe qué hacer sin datos. */
    console.warn("[hub] no se pudo leer /api/hub:", (e as Error).message);
    return [];
  }
}
