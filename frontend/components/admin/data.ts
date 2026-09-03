/* ═══════════════════════════════════════════════════════════════════════════
   CONSOLA INTERNA — datos y constantes.

   Al integrar la consola (venía como `public/admin-app/index.html`, un archivo
   suelto servido en un iframe) las listas que estaban escritas dentro del
   marcado o declaradas al vuelo en el `<script>` se juntaron aquí. Son datos
   de maqueta salvo lo que baja del pipeline, que vive en `api.ts`.

   Las etiquetas y los textos son los del archivo original, palabra por
   palabra: la integración cambia dónde vive el código, no lo que dice.
   ═══════════════════════════════════════════════════════════════════════════ */

export type VistaKey =
  | "panel" | "predios" | "extraccion" | "flujo" | "nuevo" | "comite"
  | "arq" | "data" | "comercial" | "equipo" | "gestion" | "cuenta";

export type AreaKey = "arq" | "data" | "com";

export const AREAS: Record<AreaKey, string> = {
  arq: "Arquitectura",
  data: "Data",
  com: "Comercial",
};

/** Los ocho estados por los que pasa un predio, en orden. */
export const ESTADOS = [
  "Borrador", "En evaluación", "En comité", "Publicado",
  "Reservado", "En obra", "Arrendado", "En venta",
];

/** Clave de estado → clase de la píldora y etiqueta. */
export const EST: Record<string, { c: string; t: string }> = {
  bor: { c: "e-bor", t: "Borrador" },
  eval: { c: "e-eval", t: "En evaluación" },
  com: { c: "e-com", t: "En comité" },
  pub: { c: "e-pub", t: "Publicado" },
  res: { c: "e-res", t: "Reservado" },
  obra: { c: "e-obra", t: "En obra" },
  rent: { c: "e-rent", t: "Arrendado" },
};

/* ── Flujo de inmuebles ──────────────────────────────────────────────────── */

/* El inmueble y su etapa ya no se declaran aquí: los trae el backend
   (`GET /api/admin/flujo`) y su forma vive junto a la vista que la consume,
   en views/FlujoInmuebles.tsx. Lo que queda abajo es texto fijo del
   producto: las opciones de un desplegable y las cabeceras de un CSV. */

/** Tipos de transformación que se eligen al completar tras la visita. */
export const TRANSFORMACIONES = [
  "Reposicionamiento premium",
  "Remodelación completa",
  "Cambio de distribución",
  "División en dos unidades",
];

/** Cabeceras del CSV del listado de scraping. */
export const CSV_SCRAPING = ["Titulo", "Zona", "Ciudad", "Precio(COP M)", "m2", "$/m2(COP M)", "URL"];

export type Predio = {
  id: string;
  nombre: string;
  zona: string;
  est: keyof typeof EST | string;
  score: string;
  inversion: string;
  area: AreaKey;
  city: string;
  publicado: boolean;
  /** Enlace al anuncio original, cuando el predio entró por extracción. */
  link?: string;
};

/** El listado maestro con el que arranca la consola. */
export const PREDIOS_SEED: Predio[] = [
  { id: "p1", nombre: "Apto gran formato", zona: "La Cabrera · Bogotá", est: "obra", score: "96", inversion: "$3.100M", area: "arq", city: "Bogotá", publicado: true },
  { id: "p2", nombre: "Casa división 2 unidades", zona: "Laureles · Medellín", est: "eval", score: "—", inversion: "$1.450M", area: "data", city: "Medellín", publicado: false },
  { id: "p3", nombre: "Torre remodelación integral", zona: "Punta Pacífica · Panamá", est: "pub", score: "85", inversion: "$1.520M", area: "com", city: "Panamá", publicado: true },
  { id: "p4", nombre: "Unidad edificio boutique", zona: "El Poblado · Medellín", est: "com", score: "90", inversion: "$1.180M", area: "arq", city: "Medellín", publicado: false },
  { id: "p5", nombre: "Apto frente al mar", zona: "Bocagrande · Cartagena", est: "res", score: "87", inversion: "$1.950M", area: "com", city: "Cartagena", publicado: true },
  { id: "p6", nombre: "Piso alto con vista", zona: "Chicó · Bogotá", est: "rent", score: "92", inversion: "$2.050M", area: "com", city: "Bogotá", publicado: true },
  { id: "p7", nombre: "Clásico de Rosales", zona: "Rosales · Bogotá", est: "bor", score: "—", inversion: "$1.900M", area: "data", city: "Bogotá", publicado: false },
];

/* ── Comercial ───────────────────────────────────────────────────────────── */

export const STAGES = ["Lead nuevo", "Contactado", "Sesión agendada", "Acceso aprobado", "Reservó"];

/** Clase de píldora por etapa del embudo, en el orden de `STAGES`. */
export const STAGE_EST = ["e-bor", "e-com", "e-eval", "e-apr", "e-res"];

export type Lead = { n: string; cap: string; mk: string; s: number };

export const LEADS_SEED: Lead[] = [
  { n: "M. Gómez", cap: "$1.500–3.000M", mk: "Bogotá", s: 2 },
  { n: "J. Ortiz", cap: "> $3.000M", mk: "Panamá", s: 3 },
  { n: "L. Ferro", cap: "$800–1.500M", mk: "Medellín", s: 1 },
  { n: "P. Suárez", cap: "$500–800M", mk: "Cartagena", s: 0 },
];

export type Reserva = { predio: string; inv: string; nota: string; validada: boolean };

export const RESERVAS_SEED: Reserva[] = [
  { predio: "Bocagrande · Cartagena", inv: "J. Ortiz", nota: "Bloqueo activo · vence en 2 h", validada: false },
  { predio: "Rosales · Bogotá", inv: "Lead directo", nota: "Documentos pendientes", validada: false },
];

export type Sesion = { inv: string; fecha: string; canal: string; notas: string };

export const AGENDA_SEED: Sesion[] = [
  { inv: "M. Gómez", fecha: "19 jul 10:00", canal: "Videollamada", notas: "Conocer estrategia" },
];

/* ── Equipo ──────────────────────────────────────────────────────────────── */

/* Los miembros de maqueta se fueron: la lista real la trae
   `GET /api/auth/usuarios` (ver views/Usuarios.tsx). Lo que sigue aquí es
   la descripción de cada área, que es texto fijo del producto. */

/** Qué hace cada área en la consola. */
export const AREA_DESC: { k: AreaKey; d: string }[] = [
  { k: "arq", d: "Evalúa técnicamente, define alcance y presupuesto cerrado, gestiona obra e interventoría. Aprueba en comité." },
  { k: "data", d: "Calcula el Score, valoración y comparables. Publica cifras de la ficha. Aprueba en comité." },
  { k: "com", d: "Gestiona leads, sesiones, reservas e inversionistas. Publica el predio tras el comité." },
];

/* ── Comité ──────────────────────────────────────────────────────────────── */

export type Firma = { area: AreaKey; quien: string; estado: "ok" | "pend" | "obs" };
export type CasoComite = {
  id: string;
  titulo: string;
  meta: string;
  firmas: Firma[];
  /** Bloqueado por observación: no se puede publicar aunque falte solo firmar. */
  bloqueado?: string;
};

export const COMITE_SEED: CasoComite[] = [
  {
    id: "l",
    titulo: "Casa con potencial de división en dos unidades",
    meta: "Laureles · Medellín · en comité desde el 12 jul",
    firmas: [
      { area: "arq", quien: "C. Mejía", estado: "ok" },
      { area: "data", quien: "Sin asignar", estado: "pend" },
      { area: "com", quien: "A. Ruiz", estado: "pend" },
    ],
  },
  {
    id: "p",
    titulo: "Unidad reconvertible en edificio boutique",
    meta: "El Poblado · Medellín · en comité desde el 10 jul",
    firmas: [
      { area: "arq", quien: "C. Mejía", estado: "ok" },
      { area: "data", quien: "D. Peña", estado: "ok" },
      { area: "com", quien: "A. Ruiz", estado: "pend" },
    ],
  },
  {
    id: "b",
    titulo: "Apartamento frente al mar para reposicionar",
    meta: "Bocagrande · Cartagena · con observación",
    firmas: [
      { area: "arq", quien: "C. Mejía", estado: "ok" },
      { area: "data", quien: "D. Peña", estado: "obs" },
      { area: "com", quien: "A. Ruiz", estado: "pend" },
    ],
    bloqueado: "Data marcó una observación en la valoración. No puede publicarse hasta resolverla.",
  },
];

/* ── Extracción ──────────────────────────────────────────────────────────── */

/** Motivos de descarte del modal de la tabla de extracción. */
export const MOTIVOS_DESCARTE = [
  "Fuera del alcance arquitectónico",
  "Precio no sostiene la remodelación",
  "Anuncio incompleto o poco confiable",
  "Precio atípico: probable error de digitación",
  "Zona no prioritaria este trimestre",
];

/** Las cabeceras del CSV, en el orden en que se escriben las columnas. */
export const CSV_COLS = [
  "pais", "ciudad", "zona", "portal", "tipo", "titulo", "link", "area_m2",
  "precio", "moneda", "precio_m2", "mediana_zona", "bajo_mediana",
  "validacion_geografica", "similar_a_zona", "atipico", "republicacion",
  "modelo_repetido", "descartado", "motivo",
];

/** Las cuatro ciudades con zonas monitoreadas en Data & Score. */
export const CIUDADES_DATA = ["Bogotá", "Medellín", "Cartagena", "Ciudad de Panamá"];

/* Los anuncios de encuentra24 llegan sin `titulo` —de 11.622 filas, 2.858 lo
   traen vacío, y son justo las de la última extracción—, así que la pantalla
   se llenaba de "(sin título)" y no se distinguía una fila de otra. El propio
   enlace lleva la descripción del portal en la ruta:

     .../venta-de-apartamento-en-marbella-con-vista-al-mar/30971715

   De ahí sale el título. No se inventa nada: es el texto que el portal puso
   en su URL. Si tampoco hay enlace del que sacarlo, se dice que no hay. */
export function tituloDelEnlace(link?: string | null): string | null {
  if (!link) return null;
  const partes = link.split("?")[0].split("#")[0].split("/").filter(Boolean);
  // El último tramo suele ser el código del anuncio (30971715): se salta.
  const tramo = [...partes].reverse().find((t) => /[a-z]{3}/i.test(t) && t.includes("-"));
  if (!tramo) return null;
  const texto = decodeURIComponent(tramo).replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (texto.length < 8) return null;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
