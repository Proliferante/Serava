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
  | "arq" | "data" | "comercial" | "equipo" | "gestion";

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

/**
 * Las seis etapas por las que pasa un inmueble desde el scraping hasta la
 * publicación. Tres de ellas comparten el mismo estado del dato: la etapa 1
 * (lo que trajo el scraping) y la 2 (revisarlo) miran los dos el estado
 * `nuevo`, porque son dos lecturas de la misma bandeja —lo que llegó, y lo que
 * hay que decidir—.
 */
export type FlujoStage = "nuevo" | "preseleccion" | "visita" | "publicado" | "descartado";

export type Inmueble = {
  id: string;
  t: string;
  zona: string;
  city: string;
  /** Precio en millones de pesos. */
  precio: number;
  m2: number;
  /** Precio por m², en millones. */
  ppm: number;
  /** Enlace a la publicación original del portal. */
  url: string;
  fecha: string;
  stage: FlujoStage;
  tel?: string;
  /** Fecha y hora de la visita, cuando ya está agendada. */
  cita?: string;
  /** Por qué se descartó. Queda registrado para no reingresarlo. */
  motivo?: string;
};

export const INMUEBLES_SEED: Inmueble[] = [
  { id: "i1", t: "Apartamento 3 alcobas con vista", zona: "La Cabrera", city: "Bogotá", precio: 2450, m2: 180, ppm: 13.6, url: "https://portal.example.com/aviso/48213", fecha: "Hoy", stage: "nuevo" },
  { id: "i2", t: "Casa para dividir en dos unidades", zona: "Laureles", city: "Medellín", precio: 1180, m2: 260, ppm: 4.5, url: "https://portal.example.com/aviso/48260", fecha: "Hoy", stage: "nuevo" },
  { id: "i3", t: "Penthouse con terraza", zona: "Chicó", city: "Bogotá", precio: 2900, m2: 210, ppm: 13.8, url: "https://portal.example.com/aviso/48277", fecha: "Hoy", stage: "nuevo" },
  { id: "i4", t: "Apto frente al mar", zona: "Bocagrande", city: "Cartagena", precio: 1620, m2: 150, ppm: 10.8, url: "https://portal.example.com/aviso/48291", fecha: "Ayer", stage: "nuevo" },
  { id: "i5", t: "Unidad en edificio boutique", zona: "El Poblado", city: "Medellín", precio: 980, m2: 145, ppm: 6.8, url: "https://portal.example.com/aviso/48120", fecha: "Ayer", stage: "preseleccion", tel: "3009876543" },
  { id: "i6", t: "Clásico para reposicionar", zona: "Rosales", city: "Bogotá", precio: 1750, m2: 190, ppm: 9.2, url: "https://portal.example.com/aviso/48090", fecha: "12 jul", stage: "visita", tel: "3005551212", cita: "Jue 18 jul · 10:00 a.m." },
  { id: "i7", t: "Torre lista para remodelar", zona: "Punta Pacífica", city: "Panamá", precio: 1520, m2: 150, ppm: 10.1, url: "https://portal.example.com/aviso/48001", fecha: "10 jul", stage: "publicado" },
  { id: "i8", t: "Apto sobrevalorado", zona: "Centro", city: "Cartagena", precio: 1400, m2: 120, ppm: 11.7, url: "https://portal.example.com/aviso/47980", fecha: "08 jul", stage: "descartado", motivo: "Precio por encima de comparables" },
];

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

export type Miembro = { ini: string; n: string; e: string; area: AreaKey | "admin"; perms: string };

export const MIEMBROS_SEED: Miembro[] = [
  { ini: "CM", n: "Christian Mejía", e: "christian@zequara.com", area: "arq", perms: "Evaluación técnica · obra · aprobación en comité" },
  { ini: "DP", n: "Daniela Peña", e: "daniela@zequara.com", area: "data", perms: "Score · valoración · comparables · aprobación en comité" },
  { ini: "AR", n: "Andrés Ruiz", e: "andres@zequara.com", area: "com", perms: "Leads · reservas · inversionistas · publicar predio" },
  { ini: "AD", n: "Administrador", e: "admin@zequara.com", area: "admin", perms: "Acceso total · gestión de equipo y permisos" },
];

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
