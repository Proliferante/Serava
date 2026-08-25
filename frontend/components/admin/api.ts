/* ═══════════════════════════════════════════════════════════════════════════
   CONSOLA INTERNA — la capa que habla con el pipeline.

   Los cinco endpoints viven en `backend/app/api/admin.py`, montados en
   `/api/admin`. La consola funciona en dos modos y lo dice en pantalla:

   1. CONECTADA — `python -m uvicorn app.main:app` corriendo. `/config`
      responde, y entonces la tabla, el embudo y las decisiones son reales:
      salen de `serava_clean.db` y se guardan en `seguimiento.db`.
   2. LOCAL — sin servidor. Se usa la muestra de datos reales exportada de
      `serava_clean.db`, que antes iba embebida en el HTML (93 KB de JSON en
      una sola línea) y ahora es `public/admin/muestra-extraccion.json`: se
      pide sólo cuando hace falta, así que no entra en el paquete del
      navegador de nadie que no abra esta pantalla.

   Lo que el pipeline aún no captura —canon de arriendo, costo real de
   remodelación, score de zona fuera de La Cabrera— llega marcado
   `sintetico: true` y la pantalla lo pinta como estimado. No se inventa nada
   del lado del cliente.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Prefijo de los endpoints. El backend oficial los monta en `/api/admin`. */
export const API = "/api/admin";

export const url = (p: string) => API + p;

/* ── Muestra local ───────────────────────────────────────────────────────── */

export type ZonaMuestra = { z: string; c: string; p: string; mon: string; portal: string; i?: number };
export type AggZona = { raw?: number; scope?: number; n?: number; bajo?: number; atip?: number; fuera?: number; sineval?: number; sim?: number; med?: number };

export type Muestra = {
  zonas: ZonaMuestra[];
  agg: Record<string, AggZona>;
  /** Filas comprimidas en array posicional; `filaLocal` las expande. */
  rows: (number | string)[][];
  totales: Record<string, number>;
};

let cache: Promise<Muestra> | null = null;

/**
 * La muestra se pide una sola vez por sesión y se guarda. Son 93 KB: pedirla
 * en cada cambio de filtro sería absurdo, y meterla en el paquete lo sería
 * más — sólo la necesita quien entre a Extracción sin servidor.
 */
export function muestra(): Promise<Muestra> {
  if (!cache) cache = fetch("/admin/muestra-extraccion.json").then((r) => r.json());
  return cache;
}

/* ── Tipos del pipeline ──────────────────────────────────────────────────── */

export type Fila = {
  id: string;
  zona: string; ciudad: string; pais: string; mon: string; portal: string;
  tipo: string; titulo: string; link: string;
  area: number; precio: number; pm2: number;
  hab: number; ban: number;
  /** Precio por m² marcado como atípico por rango intercuartílico. */
  atip: boolean;
  /** Validación geográfica: 1 dentro, 0 fuera, −1 sin coordenadas. */
  po: number;
  /** Similitud robusta con la zona: 1 sí, 0 no, −1 sin evaluar. */
  si: number;
  dup: boolean; modelo: boolean; bajo: boolean; med: number;
  /** `manual` cuando alguien lo descartó desde la consola. */
  desc: string;
  motivo: string;
  /** Ya enviado a revisión arquitectónica. */
  sent: boolean;
  score: number | null;
  prioridad?: string;
};

export type Resumen = {
  extraidos: number; en_scope: number; clean: number; bajo: number;
  habilitados?: number; atipicos: number; fuera: number; sin_evaluar: number; similares: number;
};

export type Config = {
  ultima_corrida?: string;
  criterios_fijos: { tipo_inmueble: string[]; portales: string[] };
};

/** Expande una fila de la muestra local a la forma que usa la tabla. */
export function filaLocal(a: (number | string)[], zonas: ZonaMuestra[], agg: Record<string, AggZona>): Fila {
  const z = zonas[a[0] as number];
  const ag = agg[z.z] || {};
  const link = String(a[3]);
  return {
    id: "x" + a[0] + "_" + link.slice(-14),
    zona: z.z, ciudad: z.c, pais: z.p, mon: z.mon, portal: z.portal,
    tipo: a[1] ? "Casa" : "Apartamento",
    titulo: String(a[2]), link,
    area: a[4] as number, precio: a[5] as number, pm2: a[6] as number,
    hab: a[7] as number, ban: a[8] as number,
    atip: a[9] !== 0,
    po: a[10] as number, si: a[11] as number,
    dup: a[12] === 1, modelo: a[13] === 1, bajo: a[14] === 1,
    med: ag.med || 0,
    desc: "", motivo: "", sent: false, score: null,
  };
}

/** Traduce una fila del endpoint `/predios` a la forma de la tabla. */
export function filaApi(f: Record<string, unknown>): Fila {
  const s = (k: string) => (f[k] == null ? "" : String(f[k]));
  const n = (k: string) => (f[k] == null ? 0 : Number(f[k]));
  const clas = s("precio_m2_clasificacion");
  const tri = (k: string) => (f[k] === 1 ? 1 : f[k] === 0 ? 0 : -1);
  return {
    id: "a" + s("link").slice(-18),
    zona: s("zona"), ciudad: s("ciudad"), pais: s("pais"), mon: s("moneda"),
    portal: s("portal"), tipo: s("tipo_inmueble"), titulo: s("titulo"), link: s("link"),
    area: n("area_m2"), precio: n("precio_venta"), pm2: n("precio_m2"),
    hab: n("habitaciones"), ban: n("banos"),
    atip: clas.indexOf("atipico") === 0,
    po: tri("dentro_poligono_real"), si: tri("similar_a_zona"),
    dup: f["posible_duplicado"] === 1,
    modelo: f["modelo_repetido_edificio_nuevo"] === 1,
    bajo: f["bajo_media_zona"] === 1,
    med: n("mediana_precio_m2_zona"),
    desc: s("filtro_arquitectonico") === "no_pasa" ? "manual" : "",
    motivo: s("motivo_no_pasa"),
    sent: s("filtro_arquitectonico") === "pasa",
    score: f["score_zequara"] == null ? null : Number(f["score_zequara"]),
    prioridad: s("prioridad_revision"),
  };
}

/* ── Llamadas ────────────────────────────────────────────────────────────── */

export async function getConfig(): Promise<Config> {
  const r = await fetch(url("/config"));
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export async function getPredios(q: Record<string, string>) {
  const p = new URLSearchParams(q).toString();
  const r = await fetch(url("/predios?" + p));
  if (!r.ok) throw new Error(String(r.status));
  return r.json() as Promise<{ filas: Record<string, unknown>[]; resumen: Resumen; truncado?: boolean }>;
}

export async function getZonasResumen(ciudad: string) {
  const r = await fetch(url("/zonas_resumen?ciudad=" + encodeURIComponent(ciudad)));
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export async function getPredioAnalisis(link: string) {
  const r = await fetch(url("/predio_analisis?link=" + link));
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export async function postExtraer(zonas: string[], soloTransformar: boolean) {
  const r = await fetch(url("/extraer"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zonas, solo_transformar: soloTransformar }),
  });
  if (!r.ok) {
    const e = await r.json().catch(() => ({}));
    throw new Error(e.detail || String(r.status));
  }
  return r.json();
}

export type EstadoCorrida = {
  corriendo: boolean;
  log: { t: string; m: string; n?: string }[];
  n_log: number;
  paso?: number;
  total?: number;
  error?: string;
};

export async function getEstadoCorrida(desde: number): Promise<EstadoCorrida> {
  const r = await fetch(url("/extraer/estado?desde=" + desde));
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export async function postSeguimiento(links: string[], decision: string, motivo: string | null) {
  const r = await fetch(url("/seguimiento"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ links, decision, motivo }),
  });
  if (!r.ok) throw new Error(String(r.status));
  return r.json() as Promise<{ errores?: unknown[] }>;
}

/* ── Formatos ────────────────────────────────────────────────────────────── */

/** Cada moneda con su notación: el peso en millones, el dólar entero. */
export const fmtPrecio = (v: number, mon: string) =>
  mon === "COP"
    ? "$" + (v / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 0 }) + "M"
    : "US$" + Math.round(v).toLocaleString("es-CO");

export const fmtPm2 = (v: number, mon: string) =>
  mon === "COP"
    ? "$" + (v / 1e6).toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "M"
    : "US$" + Math.round(v).toLocaleString("es-CO");

export const fmtMoneda = (v: number | null | undefined, mon?: string) =>
  v == null ? "—" : (mon === "USD" ? "US$" : "$") + Math.round(v).toLocaleString("es-CO");

export const miles = (v: number | null | undefined) => (v ?? 0).toLocaleString("es-CO");
