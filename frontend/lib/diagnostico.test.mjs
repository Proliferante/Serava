/* Pruebas del diagnóstico del inversionista (lib/diagnostico.ts).
 *
 *     cd frontend && node --test lib/diagnostico.test.mjs
 *
 * Node 22.6+ quita los tipos de los .ts al importarlos, así que no hace falta
 * compilar ni instalar nada. Es .mjs y no .ts para que `tsc` no se queje del
 * import con extensión.
 *
 * Cada caso es una persona que se reconoce: si alguien cambia los puntos o las
 * reglas y uno de estos sale con otro perfil, la prueba lo dice. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calcular, PREGUNTAS, PERFILES, vacias, enDolares } from "./diagnostico.ts";

/** Arma las respuestas por id de pregunta y texto de opción: se lee como la persona. */
function respuestas(r) {
  return PREGUNTAS.map((p) => {
    const v = r[p.id];
    const idx = (t) => {
      const i = p.opciones.findIndex((o) => o.t === t);
      assert.notEqual(i, -1, `«${t}» no es una opción de «${p.id}»`);
      return i;
    };
    return p.multiple ? v.map(idx) : idx(v);
  });
}

const BASE = {
  objetivo: "Que mi inversión valga más con el tiempo",
  renta: "No necesito renta: busco que el inmueble se valorice",
  horizonte: "Entre 2 y 5 años",
  caida: "Esperaría a que se recupere",
  peso: "Entre el 10 % y el 30 %",
  experiencia: "He comprado mi vivienda",
  involucramiento: "Revisar las decisiones clave",
  capital: "Entre 1.000 y 2.000 millones",
  mercados: ["Bogotá"],
  momento: "Ya tengo el capital disponible",
};

test("el inversionista típico de Zequara sale en «Transformación y valor», con afinidad alta", () => {
  const r = calcular(respuestas(BASE));
  assert.equal(r.perfil, "valor");
  assert.equal(r.riesgo, "Moderado");
  assert.equal(r.afinidad, "Alta");
  assert.ok(r.compatibilidad >= 75, `compatibilidad ${r.compatibilidad}`);
  assert.equal(r.prioridad, "Alta");
  assert.ok(r.zonas.every((z) => z.endsWith("(Bogotá)")), r.zonas.join(", "));
});

test("quien quiere proteger su patrimonio y vendería ante una caída es conservador, nunca oportunista", () => {
  const r = calcular(respuestas({ ...BASE,
    objetivo: "Proteger mi patrimonio", renta: "Arriendo tradicional, con contrato largo",
    horizonte: "En más de 10 años", caida: "Lo vendería para no perder más", peso: "Más del 30 %",
    involucramiento: "Poco: prefiero delegar todo", capital: "Entre 500 y 1.000 millones", momento: "Este año" }));
  assert.equal(r.perfil, "patrimonio");
  assert.equal(r.riesgo, "Conservador");
  assert.notEqual(r.secundario, "oportunidad");
});

test("la renta corta tiene su perfil, y Cartagena aparece en sus zonas", () => {
  const r = calcular(respuestas({ ...BASE,
    objetivo: "Generar una renta mensual", renta: "Renta corta o turística", horizonte: "Entre 5 y 10 años",
    peso: "Menos del 10 %", experiencia: "Tengo inmuebles en arriendo",
    involucramiento: "Mucho: quiero participar activamente", mercados: ["Cartagena", "Medellín"] }));
  assert.equal(r.perfil, "turistica");
  assert.ok(r.etiquetas.renta_corta);
  assert.ok(r.zonas.some((z) => z.includes("Cartagena")), r.zonas.join(", "));
});

test("un profesional con poco peso en su patrimonio y apetito por comprar en la caída es agresivo", () => {
  const r = calcular(respuestas({ ...BASE,
    caida: "Aprovecharía para comprar más", peso: "Menos del 10 %",
    experiencia: "Invierto en finca raíz de forma profesional", involucramiento: "Mucho: quiero participar activamente",
    capital: "Más de 3.500 millones", mercados: ["Abierto a recomendaciones"], momento: "Ya tengo un inmueble en mente" }));
  assert.equal(r.riesgo, "Agresivo");
  assert.ok(["oportunidad", "valor"].includes(r.perfil), r.perfil);
  assert.equal(r.ciudades.length, 4);  // «abierto» = todas las ciudades
});

test("mucha capacidad no hace agresivo a quien solo esperaría ante una caída", () => {
  const r = calcular(respuestas({ ...BASE,
    caida: "Esperaría a que se recupere", peso: "Menos del 10 %", horizonte: "Entre 5 y 10 años",
    experiencia: "Tengo inmuebles en arriendo" }));
  assert.equal(r.riesgo, "Moderado");
});

test("la capacidad manda sobre las ganas: con menos de 2 años no hay perfil de riesgo alto", () => {
  const r = calcular(respuestas({ ...BASE,
    caida: "Aprovecharía para comprar más", peso: "Menos del 10 %", horizonte: "En menos de 2 años",
    experiencia: "Invierto en finca raíz de forma profesional" }));
  assert.equal(r.riesgo, "Conservador");
  assert.notEqual(r.perfil, "oportunidad");
  assert.ok(r.motivos.some((m) => m.includes("menor a 2 años")));
});

test("con menos de 500 millones no se promete acceso: afinidad baja y se explica por qué", () => {
  const r = calcular(respuestas({ ...BASE, capital: "Menos de 500 millones" }));
  assert.equal(r.capitalSuficiente, false);
  assert.ok(r.compatibilidad <= 40);
  assert.equal(r.afinidad, "Baja");
  assert.equal(r.prioridad, "Baja");
  assert.ok(r.motivos.some((m) => m.includes("500 millones")));
});

test("quien eligió renta corta la ve al menos como estrategia secundaria", () => {
  const r = calcular(respuestas({ ...BASE, renta: "Renta corta o turística" }));
  assert.ok(r.perfil === "turistica" || r.secundario === "turistica");
});

test("ya no sale siempre lo mismo: los cinco perfiles y los tres niveles de riesgo aparecen", () => {
  // Combinaciones al azar con semilla fija (mulberry32), para que sea repetible.
  // No sirve un generador congruencial simple con `% n`: sus bits bajos se
  // repiten en ciclos cortos y deja combinaciones enteras sin visitar (con él
  // esta prueba nunca veía «valor» ni «oportunidad»). Recorriendo TODAS las
  // combinaciones (691.200, un mercado) salen: valor 38,9 %, patrimonio 26,3 %,
  // renta 22,8 %, turística 10,8 %, oportunidad 1,2 %.
  let semilla = 42;
  const azar = (n) => {
    semilla = (semilla + 0x6d2b79f5) | 0;
    let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * n);
  };
  const perfiles = new Set(), riesgos = new Set();
  for (let k = 0; k < 5000; k++) {
    const r = PREGUNTAS.map((p) => (p.multiple ? [azar(p.opciones.length)] : azar(p.opciones.length)));
    const x = calcular(r);
    assert.ok(x.perfil in PERFILES && x.secundario in PERFILES && x.perfil !== x.secundario);
    assert.ok(x.compatibilidad >= 0 && x.compatibilidad <= 100);
    perfiles.add(x.perfil); riesgos.add(x.riesgo);
  }
  assert.deepEqual([...perfiles].sort(), Object.keys(PERFILES).sort());
  assert.equal(riesgos.size, 3);
});

test("sin todas las respuestas no calcula", () => {
  assert.throws(() => calcular(vacias()), /Falta responder/);
});

test("las opciones de capital llevan su equivalente en dólares con la TRM de referencia", () => {
  assert.equal(enDolares(500e6), "USD 151 mil");
  assert.match(PREGUNTAS.find((p) => p.id === "capital").opciones[4].sub, /millones/);
});

test("cada perfil cierra con una propuesta en positivo, sin decir si encaja o no", () => {
  for (const per of Object.values(PERFILES)) {
    assert.ok(per.propuesta.startsWith("Con tu perfil, podríamos"), per.id);
    assert.ok(!/encaja|compatib|no alcanza/i.test(per.propuesta), per.id);
  }
});
