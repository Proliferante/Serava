import { leerNumero, termoEnMillones, UNIDAD } from "@/lib/cifras";

/* ═══════════════════════════════════════════════════════════════════════════
   LO QUE NO CUADRA EN UNA FICHA — avisos para el formulario del panel.

   No bloquean nada: se enseñan bajo el campo y se repiten antes de publicar,
   y quien arma la ficha decide. Hay cifras que no cuadran a propósito (un
   escenario raro, una nota de más), y un formulario que no deja guardar lo
   que la persona sabe que está bien es peor que uno que avisa.

   Cada regla sale de un fallo del primer predio publicado: un mínimo del
   rango de precio mayor que su máximo, «na» en el CDT, un tramo de compra de
   $31,9M dentro de una inversión de $2.776M.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Avisos = Record<string, string>;

const texto = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v).trim() : "");

/** El número de un campo en su unidad «natural»: millones para pesos, el
 *  porcentaje tal cual. Lee también lo escrito sin formato. */
function cifra(valores: Record<string, unknown>, k: string): number | null {
  const s = texto(valores[k]);
  if (!s) return null;
  const m = /[-−]?\d[\d.,]*/.exec(s.replace(/\$/g, ""));
  if (!m) return null;
  const x = leerNumero(m[0].replace("−", "-"));
  if (x == null) return null;
  const u = UNIDAD[k];
  if (u === "pesos" || u === "pesos_m2" || u === "rango_pesos") return Math.abs(x) >= 100_000 ? x / 1_000_000 : x;
  if (u === "millones_m2") return termoEnMillones(x, cifra(valores, "spec_area") ?? undefined);
  return x;
}

const M = (x: number) => `$${Math.round(x).toLocaleString("es-CO")}M`;

export function revisarFicha(valores: Record<string, unknown>): Avisos {
  const a: Avisos = {};

  // 1. Una cifra que no es una cifra: «na», «n/a», «-», «pendiente».
  for (const k of Object.keys(UNIDAD)) {
    const s = texto(valores[k]).toLowerCase();
    if (s && /^(n\/?a|na|-|—|–|pendiente|x|\?)$/.test(s)) {
      a[k] = "Esto sale tal cual en la ficha. Escribe la cifra o deja el campo vacío.";
    }
  }

  // 2. El termómetro: en millones por m², con el mínimo por debajo del máximo.
  const [act, min, max] = ["termo_actual", "termo_min", "termo_max"].map((k) => cifra(valores, k));
  for (const k of ["termo_actual", "termo_min", "termo_max"]) {
    const bruto = leerNumero(texto(valores[k]).replace(/[^\d.,]/g, ""));
    if (bruto != null && bruto >= 1_000) {
      a[k] = `Va en millones por m². Se leerá como ${cifra(valores, k)?.toLocaleString("es-CO")}.`;
    }
  }
  if (min != null && max != null && min >= max) {
    a.termo_min = `El mínimo (${min.toLocaleString("es-CO")}) tiene que ser menor que el máximo (${max.toLocaleString("es-CO")}).`;
  } else if (act != null && max != null && act > max) {
    a.termo_actual = `El precio de este activo (${act.toLocaleString("es-CO")}) queda por encima del máximo del rango.`;
  }

  // 3. Los tramos del gráfico de costos tienen que sumar el All-in.
  const [precio, remod, otros, allin] = ["costo_precio", "costo_remodelacion", "costo_otros", "puente_allin"].map((k) => cifra(valores, k));
  if (precio != null && remod != null && allin != null && allin > 0) {
    const suma = precio + remod + (otros ?? 0);
    if (Math.abs(suma - allin) / allin > 0.1) {
      a.costo_precio = `Compra + remodelación + otros suman ${M(suma)}, y el All-in dice ${M(allin)}: el gráfico no cuadrará.`;
    }
  }

  // 4. Rangos que tienen que ir en orden.
  const orden = (claves: string[], frase: string) => {
    const xs = claves.map((k) => cifra(valores, k));
    for (let i = 1; i < xs.length; i++) {
      const [p, q] = [xs[i - 1], xs[i]];
      if (p != null && q != null && p > q) { a[claves[i]] = frase; return; }
    }
  };
  orden(["ft_arriendo_min", "ft_arriendo_mediana", "ft_arriendo_max"], "El arriendo va de menor a mayor: mínimo, mediana, máximo.");
  orden(["ft_tir_conservador", "ft_tir_base", "ft_tir_optimo"], "Los escenarios van de menor a mayor: conservador, base, alto.");

  return a;
}
