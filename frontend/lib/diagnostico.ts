/* ═══════════════════════════════════════════════════════════════════════════
   EL DIAGNÓSTICO DEL INVERSIONISTA — preguntas, perfiles y cómo se cruzan.

   QUÉ PROBLEMA RESUELVE (checkpoint del 30-sep-2026)
   El diagnóstico de la portada daba SIEMPRE el mismo resultado («82 de
   compatibilidad», «Valorización estratégica», «Balanceado»), respondiera lo
   que respondiera la persona, y los datos que dejaba no se guardaban. Además
   repetía lo que volvía a preguntar la solicitud de acceso —contacto,
   objetivo, capital (allí en dólares, aquí en pesos), plazo—. Paola pidió un
   solo flujo, con una lógica real detrás, que defina «qué tipo de inversionista
   es para que acceda a la plataforma con la personalización de proyectos de
   acuerdo a su perfil», y que sume la renta corta.

   DE DÓNDE SALE LA LÓGICA
   · El perfil de riesgo de la Superfinanciera (conservador / moderado /
     agresivo): objetivo, horizonte, tolerancia y capacidad de asumir pérdidas.
     Su regla principal se respeta aquí: LA CAPACIDAD MANDA SOBRE LAS GANAS.
     Quien quiere riesgo alto pero necesita el dinero en un año no es agresivo.
   · Las cuatro estrategias inmobiliarias de la industria —core, core-plus,
     value-add y oportunista—, cada una con su riesgo y retorno. El modelo de
     Zequara (comprar bajo mercado, remodelar, valorizar) es value-add.
   · La tolerancia se mide con una situación («si bajara 15 % en un año, ¿qué
     harías?») y no preguntando «¿cuánto riesgo aceptas?»: casi todo el mundo se
     declara moderado en abstracto.

   SIN DEPENDENCIAS, A PROPÓSITO
   Ni React ni Next ni alias `@/`: así se prueba con `node --test`
   (lib/diagnostico.test.mjs) y, si algún día el backend necesita recalcular un
   resultado, se porta tal cual. Toda la pantalla (DiagnosticoModal) lee de aquí.

   SI SE CAMBIA UNA PREGUNTA
   Subir VERSION. Las respuestas se guardan por índice de opción junto con la
   versión: sin ella, una solicitud vieja se leería con preguntas nuevas.
   ═══════════════════════════════════════════════════════════════════════════ */

export const VERSION = "2026-10-01";

/** TRM oficial del 1-oct-2026 (Banco de la República vía datos.gov.co). Solo
 *  para el «≈ USD» de las opciones de capital: todo se calcula en pesos. */
export const TRM_REFERENCIA = 3312.84;

/** Desde aquí un capital alcanza para un predio Zequara. El más barato posible
 *  —60 m² en Laureles comprando en el p25 con 10 % de descuento y obra de
 *  $3,1M/m²— cuesta ~$555M todo incluido (mercado_referencia.json, 27-sep).
 *  Justo por debajo, para no excluir a quien complete con crédito. */
export const CAPITAL_MINIMO = 500_000_000;

export type PerfilId = "patrimonio" | "renta" | "turistica" | "valor" | "oportunidad";
export type Riesgo = "Conservador" | "Moderado" | "Agresivo";

export type Opcion = {
  t: string;
  /** Segunda línea pequeña bajo la opción (el «≈ USD» del capital). */
  sub?: string;
  /** Cuánto suma a cada perfil. */
  p?: Partial<Record<PerfilId, number>>;
};

export type Pregunta = {
  id: string;
  q: string;
  ayuda?: string;
  /** Se pueden marcar varias (mercados). */
  multiple?: boolean;
  opciones: Opcion[];
};

/** «USD 151 mil», «USD 1,06 millones». */
export function enDolares(cop: number): string {
  const x = cop / TRM_REFERENCIA;
  return x >= 1e6
    ? `USD ${(x / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 2 })} millones`
    : `USD ${Math.round(x / 1000).toLocaleString("es-CO")} mil`;
}

/* ── Las diez preguntas ──────────────────────────────────────────────────
   Unifican el diagnóstico y la solicitud de acceso: nada se pregunta dos
   veces. El orden va de lo que la persona tiene claro (qué busca) a lo que
   exige pensar (riesgo, patrimonio), y deja lo comercial (capital, cuándo)
   para el final, cuando ya hay confianza. */
export const PREGUNTAS: Pregunta[] = [
  {
    id: "objetivo",
    q: "¿Qué buscas principalmente con una inversión inmobiliaria?",
    opciones: [
      { t: "Proteger mi patrimonio", p: { patrimonio: 3, renta: 1 } },
      { t: "Generar una renta mensual", p: { renta: 3, turistica: 1 } },
      { t: "Que mi inversión valga más con el tiempo", p: { valor: 3, oportunidad: 1 } },
      { t: "Diversificar fuera de Colombia", p: { patrimonio: 1, valor: 1 } },
    ],
  },
  {
    id: "renta",
    q: "¿Qué tipo de renta te interesa?",
    ayuda: "La renta corta es la turística (Airbnb, Booking): renta más, pero exige más operación.",
    opciones: [
      { t: "Arriendo tradicional, con contrato largo", p: { renta: 2, patrimonio: 1 } },
      { t: "Renta corta o turística", p: { turistica: 3 } },
      { t: "No necesito renta: busco que el inmueble se valorice", p: { valor: 2, oportunidad: 1 } },
      { t: "Todavía no lo tengo claro" },
    ],
  },
  {
    id: "horizonte",
    q: "¿En cuánto tiempo necesitarías recuperar ese dinero?",
    ayuda: "Una inversión inmobiliaria suele necesitar al menos 3 años para dar su mejor resultado.",
    opciones: [
      { t: "En menos de 2 años" },
      { t: "Entre 2 y 5 años", p: { valor: 1, oportunidad: 1 } },
      { t: "Entre 5 y 10 años", p: { valor: 1, renta: 1, patrimonio: 1 } },
      { t: "En más de 10 años", p: { patrimonio: 2, renta: 1 } },
    ],
  },
  {
    id: "caida",
    q: "Si tu inmueble bajara 15 % de valor en un año, ¿qué harías?",
    opciones: [
      { t: "Lo vendería para no perder más", p: { patrimonio: 1, renta: 1 } },
      { t: "Esperaría a que se recupere", p: { valor: 1 } },
      { t: "Aprovecharía para comprar más", p: { oportunidad: 2, valor: 1 } },
    ],
  },
  {
    id: "peso",
    q: "¿Qué parte de tu patrimonio representaría esta inversión?",
    opciones: [
      { t: "Menos del 10 %" },
      { t: "Entre el 10 % y el 30 %" },
      { t: "Más del 30 %" },
    ],
  },
  {
    id: "experiencia",
    q: "¿Qué experiencia tienes invirtiendo en finca raíz?",
    opciones: [
      { t: "Ninguna todavía" },
      { t: "He comprado mi vivienda" },
      { t: "Tengo inmuebles en arriendo", p: { renta: 1, turistica: 1 } },
      { t: "Invierto en finca raíz de forma profesional", p: { oportunidad: 1, valor: 1 } },
    ],
  },
  {
    id: "involucramiento",
    q: "¿Cuánto quieres involucrarte en la inversión?",
    opciones: [
      { t: "Poco: prefiero delegar todo", p: { patrimonio: 1, valor: 1 } },
      { t: "Revisar las decisiones clave", p: { valor: 1 } },
      { t: "Mucho: quiero participar activamente", p: { oportunidad: 1, turistica: 1 } },
    ],
  },
  {
    id: "capital",
    q: "¿Cuánto capital tienes disponible para invertir?",
    ayuda: "En pesos colombianos, con su equivalente aproximado en dólares.",
    opciones: [
      { t: "Menos de 500 millones", sub: `≈ menos de ${enDolares(500e6)}` },
      { t: "Entre 500 y 1.000 millones", sub: `≈ ${enDolares(500e6)} a ${enDolares(1000e6)}` },
      { t: "Entre 1.000 y 2.000 millones", sub: `≈ ${enDolares(1000e6)} a ${enDolares(2000e6)}` },
      { t: "Entre 2.000 y 3.500 millones", sub: `≈ ${enDolares(2000e6)} a ${enDolares(3500e6)}` },
      { t: "Más de 3.500 millones", sub: `≈ más de ${enDolares(3500e6)}` },
    ],
  },
  {
    id: "mercados",
    q: "¿Qué mercados te interesan?",
    ayuda: "Puedes marcar varios.",
    multiple: true,
    opciones: [
      { t: "Bogotá" },
      { t: "Medellín" },
      { t: "Cartagena", p: { turistica: 1 } },
      { t: "Ciudad de Panamá" },
      { t: "Abierto a recomendaciones" },
    ],
  },
  {
    id: "momento",
    q: "¿Cuándo te gustaría invertir?",
    opciones: [
      { t: "Solo estoy explorando" },
      { t: "Este año" },
      { t: "Ya tengo el capital disponible" },
      { t: "Ya tengo un inmueble en mente" },
    ],
  },
];

const IDX = Object.fromEntries(PREGUNTAS.map((p, i) => [p.id, i])) as Record<string, number>;

/** Una respuesta por pregunta: el índice de la opción, o una lista en las múltiples. */
export type Respuestas = (number | number[] | null)[];

export function vacias(): Respuestas {
  return PREGUNTAS.map((p) => (p.multiple ? [] : null));
}

export function completa(r: Respuestas, i: number): boolean {
  const v = r[i];
  return Array.isArray(v) ? v.length > 0 : v != null;
}

/* ── Los perfiles ─────────────────────────────────────────────────────── */

export type Perfil = {
  id: PerfilId;
  nombre: string;
  /** La estrategia de la industria a la que corresponde. */
  equivale: string;
  frase: string;
  /** El tipo de activo en dos o tres palabras (título de la tarjeta). */
  tipo: string;
  activo: string;
  /** Zonas activas de Zequara que le encajan, por ciudad. */
  zonas: Record<string, string[]>;
  ruta: string[];
};

export const PERFILES: Record<PerfilId, Perfil> = {
  patrimonio: {
    id: "patrimonio", nombre: "Patrimonio protegido", equivale: "Core",
    frase: "Buscas conservar y proteger tu capital en activos sólidos, con poca volatilidad y horizonte largo.",
    tipo: "Zona consolidada",
    activo: "Inmuebles en zonas consolidadas, de alta demanda y fácil reventa.",
    zonas: { "Bogotá": ["La Cabrera", "El Retiro", "Chicó"], "Medellín": ["El Poblado"], "Ciudad de Panamá": ["Bella Vista / Obarrio"] },
    ruta: ["Definir cuánto de tu patrimonio quieres en finca raíz.", "Elegir zonas consolidadas con historial de valorización.",
      "Comprar por debajo del precio de mercado.", "Mantener a largo plazo con arriendo estable."],
  },
  renta: {
    id: "renta", nombre: "Renta estable", equivale: "Core-plus",
    frase: "Buscas un ingreso mensual predecible, con un inmueble listo para arrendar y bien ubicado.",
    tipo: "Listo para arrendar",
    activo: "Inmueble remodelado con arriendo tradicional, en zonas de demanda constante.",
    zonas: { "Bogotá": ["Chicó", "La Cabrera"], "Medellín": ["El Poblado", "Laureles"], "Ciudad de Panamá": ["El Cangrejo"] },
    ruta: ["Definir la renta mensual que esperas.", "Validar el arriendo real de la zona para ese tamaño.",
      "Remodelar para arrendar más y con menos vacancia.", "Delegar la administración del arriendo."],
  },
  turistica: {
    id: "turistica", nombre: "Renta turística", equivale: "Core-plus con operación",
    frase: "Buscas una renta más alta con alquiler de corta estancia, aceptando más operación y variación por temporada.",
    tipo: "Zona turística",
    activo: "Inmueble en zona turística, cuyo reglamento de propiedad horizontal permita la renta corta.",
    zonas: { "Cartagena": ["Centro Histórico", "Getsemaní"], "Medellín": ["El Poblado", "Laureles"], "Ciudad de Panamá": ["Casco Viejo"] },
    ruta: ["Confirmar que el reglamento del edificio permite la renta corta.", "Registrar el inmueble en el Registro Nacional de Turismo y asegurarlo.",
      "Remodelar y amoblar para huéspedes.", "Definir quién opera las reservas y la limpieza."],
  },
  valor: {
    id: "valor", nombre: "Transformación y valor", equivale: "Value-add · el modelo Zequara",
    frase: "Buscas capturar valor comprando por debajo del mercado y transformando el inmueble, en un horizonte de 3 a 5 años.",
    tipo: "Para transformar",
    activo: "Inmueble con potencial de remodelación, comprado bajo la mediana de su zona.",
    zonas: { "Bogotá": ["La Cabrera", "Chicó"], "Medellín": ["El Poblado"], "Ciudad de Panamá": ["Bella Vista / Obarrio"] },
    ruta: ["Encontrar un inmueble bajo el precio de su zona.", "Validar con arquitectura el alcance y el costo de la obra.",
      "Remodelar y decidir si arrendar o vender.", "Fijar el horizonte de salida con la valorización esperada."],
  },
  oportunidad: {
    id: "oportunidad", nombre: "Oportunidad", equivale: "Oportunista",
    frase: "Buscas el mayor retorno posible y aceptas más riesgo y plazos más inciertos.",
    tipo: "Zona en transformación",
    activo: "Inmuebles en zonas en transformación o con mucho margen de mejora.",
    zonas: { "Bogotá": ["Chicó"], "Medellín": ["Laureles"], "Cartagena": ["Getsemaní"], "Ciudad de Panamá": ["Casco Viejo"] },
    ruta: ["Definir cuánto riesgo puedes asumir sin afectar tu patrimonio.", "Identificar zonas con una tesis clara de transformación.",
      "Negociar fuerte la compra para tener margen de seguridad.", "Tener una salida alterna si la zona tarda en valorizarse."],
  },
};

/** En un empate gana el primero: lo más cercano al modelo de Zequara. */
const ORDEN: PerfilId[] = ["valor", "renta", "patrimonio", "turistica", "oportunidad"];

/* ── El resultado ─────────────────────────────────────────────────────── */

export type Resultado = {
  version: string;
  perfil: PerfilId;
  secundario: PerfilId;
  puntos: Record<PerfilId, number>;
  riesgo: Riesgo;
  /** Diversificación internacional: se suma a cualquier perfil. */
  internacional: boolean;
  /** Para el equipo: NO se le muestra a la persona (decisión del 2-oct-2026); se guarda con la solicitud. */
  compatibilidad: number;
  /** Lo que sí ve la persona, en palabras: «se alinea», «tiene puntos en común», «no encaja del todo». */
  afinidad: "Alta" | "Media" | "Baja";
  /** Por qué sale esa compatibilidad, en frases cortas: se le muestra a la persona. */
  motivos: string[];
  capitalSuficiente: boolean;
  ciudades: string[];
  /** Zonas sugeridas, ya filtradas por las ciudades que marcó. */
  zonas: string[];
  /** Para el equipo: cuánto apremia contactar. No se le muestra a la persona. */
  prioridad: "Alta" | "Media" | "Baja";
  /** Para personalizar los proyectos que ve en la plataforma. */
  etiquetas: { estrategia: PerfilId; riesgo: Riesgo; ticket: string; ciudades: string[]; renta_corta: boolean };
};

const TICKET = ["sin ticket todavía", "60–100 m²", "100–200 m²", "200–400 m²", "más de 400 m² o varios inmuebles"];
const CIUDADES = ["Bogotá", "Medellín", "Cartagena", "Ciudad de Panamá"];

const una = (r: Respuestas, id: string): number => {
  const v = r[IDX[id]];
  if (typeof v !== "number") throw new Error(`Falta responder «${id}»`);
  return v;
};

export function calcular(r: Respuestas): Resultado {
  PREGUNTAS.forEach((p, i) => { if (!completa(r, i)) throw new Error(`Falta responder «${p.id}»`); });

  // 1. Puntos por perfil: cada respuesta suma a uno o varios.
  const puntos: Record<PerfilId, number> = { patrimonio: 0, renta: 0, turistica: 0, valor: 0, oportunidad: 0 };
  PREGUNTAS.forEach((p, i) => {
    const v = r[i]!;
    for (const o of Array.isArray(v) ? v : [v]) {
      for (const [k, n] of Object.entries(p.opciones[o]?.p ?? {})) puntos[k as PerfilId] += n!;
    }
  });

  const objetivo = una(r, "objetivo"), renta = una(r, "renta"), horizonte = una(r, "horizonte");
  const caida = una(r, "caida"), peso = una(r, "peso"), experiencia = una(r, "experiencia");
  const involucra = una(r, "involucramiento"), capital = una(r, "capital"), momento = una(r, "momento");
  const mercados = (r[IDX.mercados] as number[]).map((i) => PREGUNTAS[IDX.mercados].opciones[i].t);

  // 2. Nivel de riesgo, al estilo Superfinanciera: tolerancia + capacidad.
  const nivel = [0, 2, 4][caida] + [2, 1, 0][peso] + [0, 1, 2, 2][horizonte] + [0, 0, 1, 2][experiencia];
  let riesgo: Riesgo = nivel >= 7 ? "Agresivo" : nivel >= 4 ? "Moderado" : "Conservador";
  // El perfil es el MENOR entre tolerancia y capacidad (criterio Superfinanciera):
  //   · la capacidad manda sobre las ganas: sin plazo o vendiendo ante una caída, conservador;
  //   · y al revés: mucha capacidad no hace agresivo a quien solo «esperaría».
  if (caida === 0 || horizonte === 0) riesgo = "Conservador";
  else if (riesgo === "Agresivo" && (caida < 2 || (peso === 2 && experiencia <= 1))) riesgo = "Moderado";

  // 3. Reglas que pesan más que los puntos.
  const descarta = new Set<PerfilId>();
  if (riesgo === "Conservador") descarta.add("oportunidad");
  if (horizonte === 0) { descarta.add("oportunidad"); puntos.valor = Math.floor(puntos.valor / 2); }
  if (riesgo === "Conservador" && horizonte > 0) puntos.valor = Math.floor(puntos.valor * 0.75);

  const candidatos = ORDEN.filter((k) => !descarta.has(k));
  const orden = [...candidatos].sort((a, b) => puntos[b] - puntos[a] || ORDEN.indexOf(a) - ORDEN.indexOf(b));
  let [perfil, secundario] = orden;
  // Quien eligió renta corta la ve al menos como estrategia secundaria.
  if (renta === 1 && perfil !== "turistica" && secundario !== "turistica") secundario = "turistica";

  // 4. Compatibilidad con el modelo de Zequara (0–100), explicada.
  const motivos: string[] = [];
  const capitalSuficiente = capital >= 1;
  const cCapital = [0, 25, 35, 35, 35][capital];
  if (!capitalSuficiente) motivos.push("Con menos de 500 millones todavía no alcanza para un inmueble completo: el más pequeño cuesta unos 555 millones con obra incluida.");
  const cHorizonte = [0, 15, 20, 20][horizonte];
  if (horizonte === 0) motivos.push("Un plazo menor a 2 años es corto para una inversión inmobiliaria con remodelación.");
  const cInvolucra = [20, 20, 10][involucra];
  if (involucra === 2) motivos.push("Zequara se encarga de la operación: si quieres participar en todo, conviene hablarlo en la sesión.");
  const cEstrategia = { valor: 15, renta: 13, patrimonio: 12, turistica: 10, oportunidad: 8 }[perfil];
  const cMomento = [2, 6, 10, 10][momento];
  let compatibilidad = cCapital + cHorizonte + cInvolucra + cEstrategia + cMomento;
  if (!capitalSuficiente) compatibilidad = Math.min(compatibilidad, 40);
  if (capitalSuficiente && horizonte > 0 && perfil === "valor") motivos.push("Tu perfil coincide con el modelo de Zequara: comprar bajo mercado, transformar y valorizar.");
  const afinidad = compatibilidad >= 75 ? "Alta" : compatibilidad >= 50 ? "Media" : "Baja";

  // 5. Zonas y personalización.
  const abierto = mercados.includes("Abierto a recomendaciones");
  const ciudades = abierto || !mercados.some((m) => CIUDADES.includes(m)) ? CIUDADES : mercados.filter((m) => CIUDADES.includes(m));
  const zonasDe = (id: PerfilId) => ciudades.flatMap((c) => (PERFILES[id].zonas[c] ?? []).map((z) => `${z} (${c})`));
  const zonas = zonasDe(perfil).length ? zonasDe(perfil) : zonasDe(secundario);
  const internacional = objetivo === 3 || mercados.includes("Ciudad de Panamá");

  const prioridad = capitalSuficiente && momento >= 2 && horizonte > 0 ? "Alta" : capitalSuficiente && momento >= 1 ? "Media" : "Baja";

  return {
    version: VERSION, perfil, secundario, puntos, riesgo, internacional,
    compatibilidad, afinidad, motivos, capitalSuficiente, ciudades, zonas, prioridad,
    etiquetas: { estrategia: perfil, riesgo, ticket: TICKET[capital], ciudades, renta_corta: renta === 1 },
  };
}
