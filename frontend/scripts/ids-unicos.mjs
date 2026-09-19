#!/usr/bin/env node
/**
 * COMPRUEBA QUE NINGÚN `id` SALGA DOS VECES EN LA MISMA PÁGINA.
 *
 * POR QUÉ HACE FALTA
 * Cada pantalla pública se monta DOS veces —el árbol compacto y el de
 * escritorio— y sólo el CSS decide cuál se ve (components/responsive/Adaptive.tsx).
 * Los dos llegan servidos en el HTML, así que cualquier `id` que esté en los
 * dos sale repetido en el documento.
 *
 * Y un id repetido no es un detalle de estilo: `getElementById` devuelve el
 * PRIMERO del documento, que aquí es siempre el del árbol compacto. En un PC
 * ese está en `display:none` y su rectángulo es todo ceros, así que cualquier
 * cosa que lo busque para medirlo se va al origen de la página. Eso fue el bug
 * de los botones «Completar mi perfil», que en vez de bajar al formulario
 * subían al principio de la página.
 *
 * Para los destinos de scroll ya no se usa `id` sino `data-ancla`, que se
 * puede repetir sin romper nada (ver components/IrA.tsx). Este script está
 * para que nadie vuelva a meter un `id` por ahí sin enterarse.
 *
 * DOS MODOS
 *   node scripts/ids-unicos.mjs
 *       Lee el código y avisa si un mismo `id` literal aparece en más de un
 *       archivo. No necesita nada levantado.
 *
 *   node scripts/ids-unicos.mjs --url http://127.0.0.1:3000
 *       El de verdad: pide las páginas al servidor y cuenta los ids del HTML
 *       que devuelve. Como los dos árboles se sirven siempre, los duplicados
 *       están ahí sin necesidad de abrir un navegador.
 *
 * Devuelve 1 si encuentra algo, para poder encadenarlo.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const CARPETAS = ["app", "components"];

/** Las rutas públicas, que son las que montan los dos árboles. */
const RUTAS = [
  "/", "/modelo", "/oportunidades", "/solicitud-acceso", "/login",
  "/predios", "/predios/ficha", "/predios/mis-propiedades", "/hub",
];

/* Los ids de los `<defs>` de un SVG son cosa suya y viven dentro de su propio
   archivo; se referencian con url(#…) y no estorban a nadie. */
const DEFS = /<(clipPath|linearGradient|radialGradient|filter|mask|pattern|symbol)\b/;

function archivos(dir) {
  const salida = [];
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) salida.push(...archivos(p));
    else if (/\.tsx?$/.test(n)) salida.push(p);
  }
  return salida;
}

function revisarCodigo() {
  const donde = new Map(); // id -> [archivo:línea]
  for (const carpeta of CARPETAS) {
    for (const p of archivos(join(RAIZ, carpeta))) {
      const lineas = readFileSync(p, "utf8").split("\n");
      lineas.forEach((linea, i) => {
        if (DEFS.test(linea)) return;
        if (linea.includes("ids-unicos: ignorar")) return;
        for (const m of linea.matchAll(/\bid="([^"{}]+)"/g)) {
          if (!donde.has(m[1])) donde.set(m[1], []);
          donde.get(m[1]).push(`${relative(RAIZ, p)}:${i + 1}`);
        }
      });
    }
  }

  const malos = [...donde].filter(([, sitios]) => new Set(sitios.map((s) => s.split(":")[0])).size > 1);
  if (!malos.length) {
    console.log(`  código: ${donde.size} ids literales, ninguno en dos archivos`);
    return 0;
  }
  console.log("  código: ids que viven en más de un archivo\n");
  for (const [id, sitios] of malos) console.log(`    #${id}\n      ${sitios.join("\n      ")}`);
  return 1;
}

async function revisarServidor(base) {
  let fallos = 0;
  for (const ruta of RUTAS) {
    let html;
    try {
      const r = await fetch(base + ruta);
      if (!r.ok) { console.log(`  ${ruta}: ${r.status}, me la salto`); continue; }
      html = await r.text();
    } catch (e) {
      console.log(`  ${ruta}: no responde (${e.message})`);
      continue;
    }
    const cuenta = new Map();
    for (const m of html.matchAll(/\sid="([^"]+)"/g)) {
      cuenta.set(m[1], (cuenta.get(m[1]) ?? 0) + 1);
    }
    const repes = [...cuenta].filter(([, n]) => n > 1);
    if (!repes.length) console.log(`  ${ruta}: limpio (${cuenta.size} ids)`);
    else {
      fallos = 1;
      console.log(`  ${ruta}: REPETIDOS`);
      for (const [id, n] of repes) console.log(`      #${id} ×${n}`);
    }
  }
  return fallos;
}

const i = process.argv.indexOf("--url");
const codigo = i === -1 ? revisarCodigo() : await revisarServidor(process.argv[i + 1].replace(/\/$/, ""));
if (codigo) {
  console.log("\n  Un id no puede salir dos veces en la misma página.");
  console.log("  Si es un destino de scroll, usa `data-ancla` (components/IrA.tsx).");
}
process.exit(codigo);
