/* ═══════════════════════════════════════════════════════════════════════════
   EL ESQUEMA DE LA FICHA — qué se pregunta, y dónde sale cada respuesta.

   La ficha que ve el inversionista son tres pestañas —Oportunidad, Finanzas
   y Transformación— con unos ciento veinte datos entre cifras, rótulos y
   fotos. Hasta ahora ese contenido vivía escrito a mano en el código del
   sitio; lo que se escribía en el flujo eran seis campos que no alimentaban
   nada.

   AQUÍ NO HAY PANTALLA, HAY UN ÍNDICE
   Este archivo no dibuja: describe. `ArmarFicha` recorre esta estructura y
   pinta un bloque por sección y un control por campo. Eso es lo que hace que
   añadir un dato a la ficha sea añadir una línea aquí, y no tocar un
   formulario de mil líneas — que es exactamente lo que va a pasar, porque el
   diseño se mueve: en la última revisión de Figma la pestaña de finanzas se
   partió en dos y la de oportunidad perdió dos tarjetas.

   EL ORDEN ES EL DE LA PÁGINA, A PROPÓSITO
   Los bloques van en el mismo orden en que se leen en la ficha y llevan su
   mismo título. Quien rellena esto tiene la página delante en la cabeza: si
   el formulario la reordenara "por lógica de datos", habría que traducir
   mentalmente en cada campo.

   `ayuda` dice dónde sale el dato. No es decoración: es la diferencia entre
   escribir "$8,1M" en el sitio correcto y escribirlo en el de al lado.

   LAS CLAVES SON CONTRATO
   `k` es lo que se guarda en `inmueble_detalle.ficha`. Cambiar una clave
   deja huérfano lo ya escrito, así que se añaden y se dejan de usar, pero no
   se renombran.
   ═══════════════════════════════════════════════════════════════════════════ */

export type TipoCampo =
  /** Una línea. */
  | "texto"
  /** Varias líneas: párrafos de la ficha. */
  | "parrafo"
  /** Número suelto: metros, habitaciones, score. */
  | "numero"
  /** Cifra tal y como se imprime en la ficha ("$3.450M", "+9%", "~30 días"). */
  | "cifra"
  /** Una de varias opciones. */
  | "opcion"
  /** Lista de líneas: las viñetas de la ficha. */
  | "lista"
  /** Rejilla de filas y columnas: la proyección año a año, el cronograma. */
  | "tabla";

export type Campo = {
  /** Clave en el JSON guardado. Ver «LAS CLAVES SON CONTRATO». */
  k: string;
  l: string;
  tipo: TipoCampo;
  /** Dónde sale en la ficha. */
  ayuda?: string;
  /** Lo que dice el diseño hoy, como ejemplo de formato. */
  ej?: string;
  /** Sin esto no se puede publicar. */
  req?: boolean;
  /** Ocupa la fila entera en vez de media. */
  ancho?: "entero";
  /** Para `opcion`. */
  opciones?: string[];
  /** Para `tabla`: cabeceras y número de filas. */
  columnas?: string[];
  filas?: number;
  /** Para `lista`: cuántas líneas se proponen al empezar. */
  lineas?: number;
  /**
   * Clave de `sugeridos` con la que el backend propone un valor sacado del
   * anuncio. Es una propuesta, no un valor: se ofrece y se acepta o no.
   */
  sug?: string;
};

export type Foto = {
  k: string;
  l: string;
  nota?: string;
  /** Proporción del hueco en la ficha, para que el recorte se vea antes. */
  ratio?: string;
  req?: boolean;
};

export type Bloque = {
  k: string;
  /** El título tal y como aparece en la ficha. */
  titulo: string;
  nota?: string;
  campos?: Campo[];
  fotos?: Foto[];
};

export type PestanaFicha = {
  k: "comun" | "oportunidad" | "finanzas" | "transformacion";
  l: string;
  nota: string;
  bloques: Bloque[];
};

/* ── Lo que comparten las tres pestañas ──────────────────────────────────── */

const COMUN: Bloque[] = [
  {
    k: "hero",
    titulo: "Cabecera",
    nota: "Sale igual en las tres pestañas: es lo primero que se ve al abrir la ficha.",
    campos: [
      { k: "hero_ubicacion", l: "Ubicación", tipo: "texto", req: true, ej: "La Cabrera, Bogotá", ayuda: "El renglón pequeño sobre el titular.", sug: "hero_ubicacion" },
      { k: "hero_titulo", l: "Titular", tipo: "texto", req: true, ancho: "entero", ej: "Un clásico con gran potencial de valor", ayuda: "El titular grande de Oportunidad y Finanzas. Transformación lleva el suyo.", sug: "hero_titulo" },
    ],
    fotos: [
      { k: "hero", l: "Foto principal", req: true, ratio: "16 / 9", nota: "A sangre por la derecha del hero. Horizontal y con aire: el titular se le monta encima por la izquierda." },
    ],
  },
  {
    k: "specs",
    titulo: "Metros y distribución",
    nota: "La fila de cuatro datos bajo el titular.",
    campos: [
      { k: "spec_area", l: "Área total (m²)", tipo: "numero", req: true, ej: "320", sug: "spec_area" },
      { k: "spec_habitaciones", l: "Habitaciones", tipo: "numero", req: true, ej: "3", sug: "spec_habitaciones" },
      { k: "spec_banos", l: "Baños", tipo: "numero", req: true, ej: "3", sug: "spec_banos" },
      { k: "spec_parqueaderos", l: "Parqueaderos", tipo: "numero", ej: "4" },
    ],
  },
  {
    k: "termo",
    titulo: "Termómetro de precio",
    nota: "La franja de color del hero y la tarjeta «Posición en el rango» de Finanzas. La marca se coloca sola con estos tres números.",
    campos: [
      { k: "termo_actual", l: "Precio de este activo ($/m², en millones)", tipo: "numero", req: true, ej: "8,1", sug: "precio_m2" },
      { k: "termo_min", l: "Mínimo del rango", tipo: "numero", req: true, ej: "7,5" },
      { k: "termo_max", l: "Máximo del rango", tipo: "numero", req: true, ej: "12" },
      { k: "termo_max_rotulo", l: "Rótulo del extremo derecho", tipo: "texto", ej: "Mercado remodelado $12M" },
      { k: "termo_nota", l: "Frase bajo la franja", tipo: "texto", ancho: "entero", ej: "Entramos por debajo del mercado: margen de valorización desde la compra.", ayuda: "Sólo en la tarjeta de Finanzas." },
    ],
  },
  {
    k: "reserva",
    titulo: "Tarjeta de reserva",
    nota: "La tarjeta clara de la derecha del hero, con el score y la cuenta atrás.",
    campos: [
      { k: "score", l: "Score ZEQUARA (sobre 100)", tipo: "numero", req: true, ej: "96" },
      { k: "prioridad", l: "Prioridad", tipo: "opcion", opciones: ["Prioridad alta", "Prioridad media", "Prioridad baja"], ej: "Prioridad alta" },
      { k: "inversion_total", l: "Inversión total", tipo: "cifra", req: true, ej: "$3.100M", ayuda: "Compra + remodelación. Es también el precio que sale en el listado de predios." },
      { k: "roi_estimado", l: "ROI estimado", tipo: "cifra", ej: "~22%" },
      { k: "reserva_horas", l: "Horas de bloqueo de la reserva", tipo: "numero", ej: "3", ayuda: "De dónde sale la cuenta atrás." },
      { k: "viendo_ahora", l: "Inversionistas viendo el predio", tipo: "numero", ej: "5" },
    ],
  },
];

/* ── La tarjeta del listado ──────────────────────────────────────────────── */

/* Lo único que no sale de la ficha sino de la página anterior: la tarjeta con
   la que el predio aparece en /predios. Casi todo lo reusa de la cabecera
   —foto, score, título, precio, tipo— y sólo hacen falta estos tres, que
   cuentan el estado comercial y no el inmueble. */
const TARJETA: Bloque[] = [
  {
    k: "tarjeta",
    titulo: "Tarjeta del listado",
    nota: "Cómo se ve el predio en /predios, antes de que nadie abra la ficha. La foto, el Score, el título, el precio y el tipo son los de arriba: aquí sólo lo que cuenta su estado comercial.",
    campos: [
      { k: "card_badge", l: "Etiqueta de la foto", tipo: "opcion", req: true, ej: "Disponible", opciones: ["Disponible", "Nueva oportunidad", "Alta actividad", "Reserva en curso", "Reserva liberada", "Reservada"], ayuda: "La píldora de color arriba a la izquierda de la foto." },
      { k: "card_estado", l: "Estado de la oportunidad", tipo: "texto", ej: "Abierto para evaluación", ayuda: "El renglón del pie de la tarjeta." },
      { k: "card_horizonte", l: "Horizonte", tipo: "texto", ej: "Horizonte: 5 años", ayuda: "Junto a la TIR, en el pie de la tarjeta." },
    ],
  },
];

/* ── Pestaña 1 · Oportunidad ─────────────────────────────────────────────── */

const razon = (n: number): Campo[] => [
  { k: `razon_${n}_t`, l: `Razón ${n} · título`, tipo: "texto", req: n <= 2, ej: ["Entrada competitiva", "Microzona sólida", "Activo difícil de replicar", "Alineado con nuestra tesis"][n - 1] },
  { k: `razon_${n}_d`, l: `Razón ${n} · descripción`, tipo: "parrafo", req: n <= 2, ej: ["Precio por m² por debajo de la media de la microzona.", "Demanda estable, escasez de oferta y alta liquidez de salida.", "320 m² con características únicas en la zona.", "Cumple los criterios de retorno, perfil de demanda y bajo riesgo regulatorio."][n - 1] },
];

const potencial = (n: number, cual: string): Campo[] => [
  { k: `potencial_${n}_t`, l: `Espacio ${n} · título`, tipo: "texto", ej: cual },
  { k: `potencial_${n}_d`, l: `Espacio ${n} · descripción`, tipo: "parrafo", ej: "Potencial de apertura, iluminación y actualización." },
];

const poi = (n: number): Campo[] => [
  { k: `poi_${n}_n`, l: `Punto ${n}`, tipo: "texto", ej: ["Parque El Virrey", "Centro Andino", "Zona T", "Clínica del Country"][n - 1] },
  { k: `poi_${n}_m`, l: `Punto ${n} · tiempo`, tipo: "texto", ej: ["5 min", "7 min", "7 min", "8 min"][n - 1] },
];

const OPORTUNIDAD: Bloque[] = [
  {
    k: "porque",
    titulo: "Por qué ZEQUARA lo seleccionó",
    nota: "Las cuatro tarjetas claras del primer bloque. Las dos primeras son obligatorias; las otras dos, si las hay.",
    campos: [...razon(1), ...razon(2), ...razon(3), ...razon(4)],
    fotos: [{ k: "interior", l: "Foto de interior", ratio: "1 / 1", nota: "La foto cuadrada a la derecha de las cuatro razones." }],
  },
  {
    k: "puente",
    titulo: "La oportunidad en una mirada · puente de valor",
    nota: "La tarjeta clara con la barra apilada: de lo que cuesta a lo que vale.",
    campos: [
      { k: "puente_allin", l: "Tu All-in Cost", tipo: "cifra", req: true, ej: "$3.450M" },
      { k: "puente_allin_m2", l: "All-in por m²", tipo: "cifra", ej: "$10,8M / m²" },
      { k: "puente_mercado", l: "Valor de mercado remodelado", tipo: "cifra", req: true, ej: "$3.776M" },
      { k: "puente_mercado_m2", l: "Mercado por m²", tipo: "cifra", ej: "$11,8M / m²" },
      { k: "costo_precio", l: "Tramo · precio de compra", tipo: "cifra", req: true, ej: "$2.600M", ayuda: "Los cuatro tramos dan el ancho de la barra apilada y la leyenda de abajo.", sug: "precio_compra" },
      { k: "costo_remodelacion", l: "Tramo · remodelación", tipo: "cifra", req: true, ej: "$800M" },
      { k: "costo_otros", l: "Tramo · otros costos", tipo: "cifra", ej: "$50M", ayuda: "Notariales, transacción." },
      { k: "valor_creado", l: "Tramo · valor creado", tipo: "cifra", req: true, ej: "+$326M" },
    ],
  },
  {
    k: "valor",
    titulo: "La oportunidad en una mirada · valor creado hoy",
    nota: "La tarjeta verde de la derecha y las tres cifras que van debajo.",
    campos: [
      { k: "valor_creado_pct", l: "Porcentaje sobre el All-in", tipo: "cifra", req: true, ej: "+9%" },
      { k: "valor_creado_chip", l: "Etiqueta del pie", tipo: "texto", ej: "~8% por debajo de la media remodelada" },
      { k: "valor_creado_texto", l: "Párrafo de la tarjeta", tipo: "parrafo", ancho: "entero", ej: "Compras por debajo de lo que el mercado remodelado comparable ya paga en la microzona. Ese diferencial es tu margen patrimonial desde el día uno." },
      { k: "kpi_retorno", l: "Retorno total (5 años)", tipo: "cifra", req: true, ej: "54,4%" },
      { k: "kpi_renta_mensual", l: "Renta mensual estimada", tipo: "cifra", req: true, ej: "$18,6M" },
      { k: "kpi_rentabilidad", l: "Rentabilidad anual neta", tipo: "cifra", req: true, ej: "4,6%" },
    ],
  },
  {
    k: "potencial",
    titulo: "El potencial de transformación",
    nota: "Las cuatro tarjetas oscuras con foto. Aquí van el rótulo y la descripción; las fotos, debajo.",
    campos: [
      { k: "potencial_intro", l: "Bajada del bloque", tipo: "parrafo", ancho: "entero", ej: "Espacios con gran capacidad de cambio. La propuesta arquitectónica se desarrolla durante el proceso de negociación." },
      ...potencial(1, "Zona social"), ...potencial(2, "Cocina"),
      ...potencial(3, "Habitaciones"), ...potencial(4, "Baños"),
    ],
    fotos: [
      { k: "potencial_1", l: "Foto · espacio 1", ratio: "5 / 4" },
      { k: "potencial_2", l: "Foto · espacio 2", ratio: "5 / 4" },
      { k: "potencial_3", l: "Foto · espacio 3", ratio: "5 / 4" },
      { k: "potencial_4", l: "Foto · espacio 4", ratio: "5 / 4" },
    ],
  },
  {
    k: "entorno",
    titulo: "Ubicación y entorno",
    nota: "El mapa y la lista de cuatro puntos con su tiempo.",
    campos: [
      { k: "entorno_bajada", l: "Bajada", tipo: "texto", ancho: "entero", ej: "Conectividad, exclusividad y alta demanda." },
      ...poi(1), ...poi(2), ...poi(3), ...poi(4),
    ],
    fotos: [{ k: "mapa", l: "Mapa de la zona", ratio: "4 / 3", nota: "Captura del mapa con el punto del inmueble marcado." }],
  },
];

/* ── Pestaña 2 · Finanzas ────────────────────────────────────────────────── */

const FINANZAS: Bloque[] = [
  {
    k: "esencial",
    titulo: "Lo esencial, en segundos",
    nota: "Lo primero de la pestaña: la cifra grande verde y las cuatro tarjetas claras. Es lo que decide si el inversionista sigue leyendo.",
    campos: [
      { k: "fin_retorno", l: "Retorno total acumulado", tipo: "cifra", req: true, ej: "54,4%", ayuda: "La cifra grande de la tarjeta verde." },
      { k: "fin_retorno_nota", l: "Pie de la cifra grande", tipo: "texto", ej: "a 5 años · sobre el capital invertido" },
      { k: "fin_tir", l: "TIR estimada", tipo: "cifra", req: true, ej: "~12,5%", ayuda: "La píldora de la tarjeta verde, junto al CDT." },
      { k: "fin_cdt", l: "CDT con el que se compara", tipo: "cifra", ej: "10,5%" },
      { k: "fin_renta_mensual", l: "Renta mensual estimada", tipo: "cifra", req: true, ej: "$18,6M" },
      { k: "fin_renta_nota", l: "Pie de la renta", tipo: "texto", ej: "arriendo remodelado de referencia" },
      { k: "fin_rentabilidad", l: "Rentabilidad anual neta", tipo: "cifra", req: true, ej: "4,6%" },
      { k: "fin_rentabilidad_nota", l: "Pie de la rentabilidad", tipo: "texto", ej: "yield neto sobre el All-in" },
      { k: "fin_rango_inversion", l: "Rango de inversión", tipo: "cifra", req: true, ej: "$3.100M–$3.450M" },
      { k: "fin_colocacion", l: "Colocación en arriendo", tipo: "cifra", ej: "~30 días" },
    ],
  },
  {
    k: "rentabilidad",
    titulo: "Ficha técnica · rentabilidad detallada",
    nota: "Primer bloque de lo que se despliega con «Ver ficha técnica completa».",
    campos: [
      { k: "ft_gastos_anuales", l: "Gastos estimados anuales", tipo: "cifra", ej: "$14M" },
      { k: "ft_gastos_nota", l: "Qué incluyen", tipo: "texto", ej: "admin., predial, seguros" },
      { k: "ft_tir_5", l: "TIR a 5 años", tipo: "cifra", ej: "~12,5%" },
    ],
  },
  {
    k: "mercado",
    titulo: "Ficha técnica · contexto de mercado",
    nota: "El rango de arriendo con su propio termómetro, y la vacancia de la zona.",
    campos: [
      { k: "ft_arriendo_min", l: "Arriendo mínimo", tipo: "cifra", ej: "$16M" },
      { k: "ft_arriendo_mediana", l: "Arriendo · mediana", tipo: "cifra", ej: "$18,6M" },
      { k: "ft_arriendo_max", l: "Arriendo máximo", tipo: "cifra", ej: "$21M" },
      { k: "ft_vacancia", l: "Tasa de vacancia estimada", tipo: "cifra", ej: "~4%" },
    ],
  },
  {
    k: "composicion",
    titulo: "Ficha técnica · composición del costo",
    nota: "La cascada de cinco columnas. Las cuatro primeras son los tramos del puente de valor de Oportunidad: se reusan y no se preguntan otra vez. Aquí sólo el total de mercado.",
    campos: [
      { k: "ft_mercado_total", l: "Media del mercado remodelado", tipo: "cifra", ej: "$3.776M" },
      { k: "ft_spread", l: "Spread de valor", tipo: "cifra", ej: "+9%" },
      { k: "ft_composicion_nota", l: "Nota al pie de la cascada", tipo: "parrafo", ancho: "entero", ej: "Precio de compra $2.600M · Remodelación $800M · Otros (notariales, transacción) $50M. Cifras de referencia." },
    ],
  },
  {
    k: "escenarios",
    titulo: "Ficha técnica · escenarios de TIR y alternativas",
    nota: "Las tres columnas de escenario y la tabla de comparación.",
    campos: [
      { k: "ft_tir_conservador", l: "Escenario conservador", tipo: "cifra", ej: "9,0%" },
      { k: "ft_tir_base", l: "Escenario base", tipo: "cifra", ej: "12,5%" },
      { k: "ft_tir_optimo", l: "Escenario óptimo", tipo: "cifra", ej: "16,0%" },
      { k: "ft_cdt_vigente", l: "CDT / renta fija vigente", tipo: "cifra", ej: "~10,5%" },
      { k: "ft_alternativas_nota", l: "Nota de la comparación", tipo: "parrafo", ancho: "entero", ej: "La TIR incluye renta y valorización; el CDT es renta fija sin activo subyacente." },
    ],
  },
  {
    k: "proyeccion",
    titulo: "Ficha técnica · proyección patrimonial detallada",
    nota: "Alimenta a la vez el gráfico y la tabla año a año. La última fila va resaltada en la ficha.",
    campos: [
      {
        k: "ft_proyeccion", l: "Año a año", tipo: "tabla", ancho: "entero",
        columnas: ["Año", "Valor activo", "Renta acum.", "Patrimonio", "Yield"],
        filas: 6,
        ej: "0 · $3.776M · $0 · $3.776M · —",
      },
    ],
  },
  {
    k: "liquidez",
    titulo: "Ficha técnica · liquidez y costos de salida",
    nota: "El último bloque de la ficha técnica, antes del pie.",
    campos: [
      { k: "ft_payback_renta", l: "Payback (solo renta)", tipo: "cifra", ej: "~22 años" },
      { k: "ft_payback_valorizacion", l: "Payback con valorización", tipo: "cifra", ej: "~5 años" },
      { k: "ft_comision_venta", l: "Comisión de venta", tipo: "cifra", ej: "~$113M" },
      { k: "ft_impuesto_venta", l: "Impuesto de venta", tipo: "texto", ej: "Según ganancia" },
      { k: "ft_impuesto_nota", l: "Pie del impuesto", tipo: "texto", ej: "ganancia ocasional u otros aplicables" },
    ],
  },
];

/* ── Pestaña 3 · Transformación ──────────────────────────────────────────── */

const vision = (n: number): Campo => ({
  k: `vision_${n}`, l: `Atributo ${n}`, tipo: "texto",
  ej: ["Funcionalidad real", "Estética duradera", "Materiales de alta calidad", "Espacios que generan valor"][n - 1],
});

const TRANSFORMACION: Bloque[] = [
  {
    k: "trans_hero",
    titulo: "Cabecera de la pestaña",
    nota: "Esta pestaña lleva su propio titular; la ubicación y los metros son los de arriba.",
    campos: [
      { k: "trans_titulo", l: "Titular", tipo: "texto", ancho: "entero", req: true, ej: "De un mueble usado a un activo extraordinario." },
      { k: "transformacion_tipo", l: "Tipo de transformación", tipo: "opcion", req: true, opciones: ["Reposicionamiento premium", "Remodelación completa", "Cambio de distribución", "División en dos unidades"], ayuda: "Es también el chip que sale en la tarjeta del listado de predios.", sug: "transformacion_tipo" },
    ],
    fotos: [
      { k: "antes", l: "Antes · estado actual", req: true, ratio: "16 / 9", nota: "La mitad izquierda del comparador del hero." },
      { k: "despues", l: "Después · render referencial", req: true, ratio: "16 / 9", nota: "La mitad derecha. Si todavía no hay render, se deja vacía y sale el marcador." },
    ],
  },
  {
    k: "vision",
    titulo: "Visión de diseño",
    nota: "El párrafo de la izquierda y los cuatro atributos con icono.",
    campos: [
      { k: "vision_texto", l: "Párrafo", tipo: "parrafo", ancho: "entero", req: true, ej: "Un estilo contemporáneo y atemporal, con materiales naturales, espacios abiertos y una distribución que responde al estilo de vida actual." },
      vision(1), vision(2), vision(3), vision(4),
    ],
  },
  {
    k: "transforma",
    titulo: "Qué transforma esta oportunidad",
    nota: "La lista de vistos de la tarjeta clara. Una línea por viñeta.",
    campos: [
      { k: "transforma", l: "Viñetas", tipo: "lista", ancho: "entero", lineas: 6, ej: "Zona social integrada, con mayor amplitud y luz natural." },
    ],
  },
  {
    k: "propuesta",
    titulo: "Propuesta de transformación",
    nota: "La rejilla de cinco fotos con su rótulo. Son referenciales y así lo dice la ficha.",
    campos: [
      { k: "prop_1_r", l: "Rótulo · foto grande", tipo: "texto", ej: "Zona social" },
      { k: "prop_2_r", l: "Rótulo · foto 2", tipo: "texto", ej: "Cocina" },
      { k: "prop_3_r", l: "Rótulo · foto 3", tipo: "texto", ej: "Habitación principal" },
      { k: "prop_4_r", l: "Rótulo · foto 4", tipo: "texto", ej: "Baño principal" },
      { k: "prop_5_r", l: "Rótulo · foto 5", tipo: "texto", ej: "Estudio / Habitación" },
    ],
    fotos: [
      { k: "prop_1", l: "Foto grande", ratio: "3 / 2" },
      { k: "prop_2", l: "Foto 2", ratio: "7 / 3" },
      { k: "prop_3", l: "Foto 3", ratio: "7 / 3" },
      { k: "prop_4", l: "Foto 4", ratio: "7 / 3" },
      { k: "prop_5", l: "Foto 5", ratio: "7 / 3" },
    ],
  },
  {
    k: "alcance",
    titulo: "Alcance de la remodelación",
    nota: "La columna de la derecha, una línea por partida.",
    campos: [
      { k: "alcance", l: "Partidas", tipo: "lista", ancho: "entero", lineas: 8, ej: "Demolición y adecuaciones" },
      { k: "alcance_nota", l: "Aviso del pie", tipo: "parrafo", ancho: "entero", ej: "El alcance definitivo se define durante el proceso de negociación, ajustado a tus objetivos de inversión." },
    ],
  },
  {
    k: "distribucion",
    titulo: "Distribución",
    nota: "Los dos planos, el de hoy y el propuesto, con sus dos renglones de pie.",
    campos: [
      { k: "plano_actual_t", l: "Estado actual · pie", tipo: "texto", ej: "3 habitaciones + servicio" },
      { k: "plano_actual_s", l: "Estado actual · subtítulo", tipo: "texto", ej: "Espacios compartimentados" },
      { k: "plano_propuesta_t", l: "Propuesta · pie", tipo: "texto", ej: "3 habitaciones + servicio" },
      { k: "plano_propuesta_s", l: "Propuesta · subtítulo", tipo: "texto", ej: "Zona social integrada" },
    ],
    fotos: [
      { k: "plano_actual", l: "Plano · estado actual", ratio: "4 / 3" },
      { k: "plano_propuesta", l: "Plano · propuesta", ratio: "4 / 3" },
    ],
  },
  {
    k: "cronograma",
    titulo: "Cronograma estimado",
    nota: "Los cuatro hitos de la línea de tiempo y el total.",
    campos: [
      {
        k: "cronograma", l: "Hitos", tipo: "tabla", ancho: "entero",
        columnas: ["Etapa", "Duración"], filas: 4,
        ej: "1. Diseño · 2–3 semanas",
      },
      { k: "cronograma_total", l: "Tiempo total estimado", tipo: "texto", ej: "6 meses" },
      { k: "cronograma_nota", l: "Frase de la derecha", tipo: "parrafo", ancho: "entero", ej: "Nos enfocamos en cumplir tiempos y presupuesto sin sacrificar el estándar de calidad." },
    ],
  },
];

export const FICHA: PestanaFicha[] = [
  { k: "comun", l: "Cabecera", nota: "Lo que se repite en las tres pestañas de la ficha, y la tarjeta con la que el predio aparece en el listado.", bloques: [...COMUN, ...TARJETA] },
  { k: "oportunidad", l: "Oportunidad", nota: "La primera pestaña: por qué se seleccionó, qué valor hay y el entorno.", bloques: OPORTUNIDAD },
  { k: "finanzas", l: "Finanzas", nota: "La segunda: el resumen corto y la ficha técnica que se despliega.", bloques: FINANZAS },
  { k: "transformacion", l: "Transformación", nota: "La tercera: la visión, el alcance, los planos y el cronograma.", bloques: TRANSFORMACION },
];

/* ── Ayudas ──────────────────────────────────────────────────────────────── */

export const CAMPOS = FICHA.flatMap((p) => p.bloques.flatMap((b) => b.campos ?? []));
export const FOTOS = FICHA.flatMap((p) => p.bloques.flatMap((b) => b.fotos ?? []));

/** Lo que hay que tener escrito para poder publicar. */
export const OBLIGATORIOS = CAMPOS.filter((c) => c.req);
export const FOTOS_OBLIGATORIAS = FOTOS.filter((f) => f.req);

export type Valores = Record<string, unknown>;

/** Un campo se da por respondido cuando tiene algo que no es espacio en blanco. */
export function lleno(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.some((x) => lleno(x));
  if (typeof v === "string") return v.trim() !== "";
  return true;
}

/** De qué pestaña es cada clave. Para poder decir dónde está lo que falta. */
const PESTANA_DE = new Map<string, string>(
  FICHA.flatMap((p) => p.bloques.flatMap((b) => [
    ...(b.campos ?? []).map((c) => [c.k, p.l] as const),
    ...(b.fotos ?? []).map((f) => [f.k, p.l] as const),
  ])),
);

/**
 * Qué falta para publicar. Devuelve etiquetas y no claves —el aviso lo lee
 * una persona que está mirando el formulario, no el JSON— y cada una con su
 * pestaña delante: hay campos que se llaman igual en dos sitios («Titular»
 * está en Cabecera y en Transformación) y sin el prefijo el aviso manda a
 * buscar a ciegas.
 */
export function faltantes(valores: Valores, fotos: Record<string, string>): string[] {
  const donde = (k: string, l: string) => `${PESTANA_DE.get(k) ?? ""} · ${l}`;
  const falta = OBLIGATORIOS.filter((c) => !lleno(valores[c.k])).map((c) => donde(c.k, c.l));
  const sinFoto = FOTOS_OBLIGATORIAS.filter((f) => !fotos[f.k]).map((f) => donde(f.k, f.l));
  return [...falta, ...sinFoto];
}

/** Cuántos campos del total llevan respuesta, para la barra de avance. */
export function avance(valores: Valores, fotos: Record<string, string>) {
  const total = CAMPOS.length + FOTOS.length;
  const hechos =
    CAMPOS.filter((c) => lleno(valores[c.k])).length +
    FOTOS.filter((f) => !!fotos[f.k]).length;
  return { total, hechos, pct: total ? Math.round((hechos / total) * 100) : 0 };
}
