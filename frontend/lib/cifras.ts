/* ═══════════════════════════════════════════════════════════════════════════
   LAS CIFRAS DE LA FICHA — qué unidad lleva cada campo y cómo se escribe.

   Lo comparten el formulario del panel (al salir de un campo, lo deja con su
   formato) y la ficha pública (al pintar, formatea lo que venga sin él).

   POR QUÉ HACE FALTA
   Los campos de cifra son texto libre: «$3.100M», «~12,5%». Pero nada obligaba
   a escribirlos así, y el primer predio real se publicó con «2775500000» en
   la inversión, «15» en la TIR y «1995000000» donde van millones por m². La
   ficha lo imprimía tal cual: «2775500000 COP», «$1.995.000.000M».

   QUÉ SE TOCA Y QUÉ NO
   Sólo un NÚMERO DESNUDO —dígitos, puntos, comas y a lo sumo un signo, «$»,
   «~» o «%»— se reescribe con el formato de su campo. Lo que ya trae letras
   se respeta tal cual: «~30 días», «1.93x», «Según ganancia». Y en la ficha
   pública se formatea al pintar, sin cambiar lo guardado: el dato del predio
   sigue siendo el que el equipo escribió.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Unidad =
  | "pesos"        // «$2.776M»
  | "pesos_m2"     // «$9,1M / m²»
  | "rango_pesos"  // «$3.100M–$3.450M»
  | "pct"          // «15,9%»
  | "anios"        // «~22 años»
  | "dias"         // «~30 días»
  | "millones_m2"; // el termómetro: 6,5 (número, en millones por m²)

/** Los campos con unidad. Las claves son las del esquema del panel. */
export const UNIDAD: Record<string, Unidad> = {
  inversion_total: "pesos", puente_allin: "pesos", puente_mercado: "pesos",
  costo_precio: "pesos", costo_remodelacion: "pesos", costo_otros: "pesos", valor_creado: "pesos",
  kpi_renta_mensual: "pesos", fin_renta_mensual: "pesos", ft_gastos_anuales: "pesos",
  ft_arriendo_min: "pesos", ft_arriendo_mediana: "pesos", ft_arriendo_max: "pesos",
  ft_mercado_total: "pesos", ft_comision_venta: "pesos",
  puente_allin_m2: "pesos_m2", puente_mercado_m2: "pesos_m2",
  fin_rango_inversion: "rango_pesos",
  roi_estimado: "pct", valor_creado_pct: "pct", kpi_retorno: "pct", kpi_rentabilidad: "pct",
  fin_retorno: "pct", fin_tir: "pct", fin_cdt: "pct", fin_rentabilidad: "pct",
  ft_tir_5: "pct", ft_vacancia: "pct", ft_spread: "pct",
  ft_tir_conservador: "pct", ft_tir_base: "pct", ft_tir_optimo: "pct", ft_cdt_vigente: "pct",
  ft_payback_renta: "anios", ft_payback_valorizacion: "anios",
  fin_colocacion: "dias",
  termo_actual: "millones_m2", termo_min: "millones_m2", termo_max: "millones_m2",
};

/** Los que llevan «+» delante cuando son positivos. */
const CON_SIGNO = new Set(["valor_creado", "valor_creado_pct", "ft_spread"]);

/* Un número desnudo: signo, «~», «$», dígitos con puntos o comas, «%». */
const DESNUDO = /^\s*([~≈]?)\s*([+\-−]?)\s*\$?\s*(\d[\d.,]*)\s*%?\s*$/;

/** «1.995.000.000» → 1995000000; «4.5» → 4.5; «15,9» → 15.9.
 *  El punto seguido de tres dígitos es de miles; si no, es decimal (hay quien
 *  escribe «4.5» por costumbre). La coma siempre es decimal. */
export function leerNumero(s: string): number | null {
  const sin = s.replace(/\.(?=\d{3}(?!\d))/g, "");
  const x = Number(sin.replace(",", "."));
  return Number.isFinite(x) ? x : null;
}

function miles(x: number, dec = 0): string {
  return x.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

/** Millones con el formato de la ficha: «$2.776M», «$16,8M». */
function enMillones(m: number): string {
  const a = Math.abs(m);
  return `$${miles(a, a >= 100 ? 0 : 1).replace(/,0$/, "")}M`;
}

/** Pesos o millones: una cifra de cien mil o más son pesos (nadie escribe
 *  «100.000» millones en una ficha de un predio); por debajo, ya viene en
 *  millones («2.600» → $2.600M, «18,6» → $18,6M). */
const aMillones = (x: number) => (Math.abs(x) >= 100_000 ? x / 1_000_000 : x);

/**
 * La cifra con el formato de su campo, o el mismo texto si no hay nada que
 * hacer (no es un campo con unidad, está vacío o ya trae letras).
 */
export function formatear(k: string, v: unknown, area?: number): string {
  const texto = typeof v === "number" ? String(v) : typeof v === "string" ? v : "";
  const u = UNIDAD[k];
  const m = u && DESNUDO.exec(texto);
  if (!u || !m) return texto;
  const [, aprox, signoTxt, cuerpo] = m;
  const n0 = leerNumero(cuerpo);
  if (n0 == null) return texto;
  const neg = signoTxt === "-" || signoTxt === "−";
  const n = neg ? -n0 : n0;
  const signo = n < 0 ? "−" : CON_SIGNO.has(k) && n > 0 ? "+" : "";
  const tilde = aprox ? "~" : "";

  switch (u) {
    case "pesos":
      return `${tilde}${signo}${enMillones(aMillones(n))}`;
    case "pesos_m2":
      return `${tilde}${signo}${enMillones(aMillones(n))} / m²`;
    case "rango_pesos":
      return `${tilde}${enMillones(aMillones(n))}`;
    case "pct":
      return `${tilde}${signo}${miles(Math.abs(n), Number.isInteger(n) ? 0 : 1)}%`;
    case "anios":
      return `~${miles(Math.abs(n), Number.isInteger(n) ? 0 : 1)} ${Math.abs(n) === 1 ? "año" : "años"}`;
    case "dias":
      return `~${miles(Math.abs(n))} ${Math.abs(n) === 1 ? "día" : "días"}`;
    case "millones_m2":
      return miles(termoEnMillones(n, area), 1);
  }
}

/**
 * El termómetro va en millones por m². Un valor de mil o más está en pesos
 * y se pasa a millones; si aun así pasa de 300 (ningún m² vale 300 millones),
 * es el precio TOTAL escrito donde va el del m², y con el área se divide.
 */
export function termoEnMillones(n: number, area?: number): number {
  let x = Math.abs(n) >= 1_000 ? n / 1_000_000 : n;
  if (Math.abs(x) > 300 && area && area > 0) x = x / area;
  return Math.round(x * 10) / 10;
}

/** Todos los valores de una ficha, formateados. Lo que no tiene unidad, igual. */
export function formatearFicha(valores: Record<string, unknown>): Record<string, unknown> {
  const area = leerNumero(String(valores.spec_area ?? "")) ?? undefined;
  const fuera: Record<string, unknown> = { ...valores };
  for (const k of Object.keys(UNIDAD)) {
    const v = valores[k];
    if (typeof v === "string" || typeof v === "number") {
      const f = formatear(k, v, area);
      if (f !== "") fuera[k] = f;
    }
  }
  return fuera;
}
