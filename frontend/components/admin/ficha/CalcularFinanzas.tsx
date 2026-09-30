"use client";

import { useEffect, useMemo, useState } from "react";
import { lleno, type Valores } from "@/components/admin/ficha/esquema";
import { Btn, Card, Hint, IcoCheck, SecTitle } from "@/components/admin/ui";
import { conPuntos } from "@/lib/cifras";

/* ═══════════════════════════════════════════════════════════════════════════
   CALCULAR FINANZAS — las cifras de la ficha salen del modelo, no de la mano.

   QUÉ PROBLEMA RESUELVE
   Paola, 28-sep-2026: «la creación de fichas ya está, pero falta la parte
   financiera. ¿Cómo se logran estas tablas? ¿Con qué datos?». La pestaña
   Finanzas son unas cuarenta cifras —TIR por escenario, renta, rango de
   arriendo, proyección año a año, payback— que había que calcular aparte y
   copiar. Este panel las pide al backend (POST /flujo/ficha/calcular), que usa
   el modelo de las fichas del evento, y las pasa al formulario.

   PROPONE, NO GUARDA
   «Calcular» no escribe nada. «Pasar al formulario» llena los campos, y a
   partir de ahí es la ficha de siempre: se revisa, se corrige lo que haga
   falta y se guarda o se publica con los botones de arriba. Si algún campo ya
   tenía otra cosa escrita, se avisa antes de pisarlo.

   LO QUE SE PREGUNTA ES LO MÍNIMO
   El anuncio ya trae zona, tipo, área, precio y administración: el panel
   arranca con eso y solo hay que corregir lo que sepa distinto quien arma la
   ficha —sobre todo el precio negociado y el costo de obra—. Los precios van
   en millones porque así se piensan («1.830», no «1830000000»).
   ═══════════════════════════════════════════════════════════════════════════ */

export type CalculoBase = {
  zona: string | null; ciudad: string | null; tipo: string | null;
  area: number | null; publicado: number | null; administracion: number | null;
  dentro_poligono: boolean | null;
};
export type ZonasCalculo = Record<string, { fecha: string; con_antiguedad: boolean; tipos: Record<string, string[]> }>;

type Resultado = {
  valores: Valores;
  resumen: {
    allin: number; tir: { conservador: number; base: number; alto: number }; multiplo: number;
    renta_mensual: number; yield: number; score: number | null; prioridad: string | null; segmento: string;
  };
  avisos: string[];
  fuentes: { mercado: string; cdt: string; ipc: string };
};

type Pedir = <T>(ruta: string, init?: RequestInit) => Promise<T>;

/** «1.830,5» o «1830.5» → 1830.5. Punto de miles y coma decimal, como en la ficha. */
function numero(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const limpio = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/\.(?=\d{3}\b)/g, "");
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}
const millones = (n: number | null | undefined) =>
  n == null ? "" : (n / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 });
const pct = (x: number) => `${(x * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 })}%`;
const mm = (x: number) => `$${Math.round(x / 1e6).toLocaleString("es-CO")}M`;

export function CalcularFinanzas({ link, base, zonas, valores, pedir, onAplicar }: {
  link: string;
  base: CalculoBase | null;
  zonas: ZonasCalculo;
  valores: Valores;
  pedir: Pedir;
  onAplicar: (v: Valores) => void;
}) {
  const [abierto, setAbierto] = useState(true);
  const [f, setF] = useState({
    zona: "", tipo: "", area: "", publicado: "", negociado: "", remodelacion: "",
    administracion: "", canon: "", valorRemodelado: "", rasgos: "",
  });
  const [calculando, setCalculando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<Resultado | null>(null);

  /* El punto de partida es lo que dice el anuncio. Se recarga si cambia el
     predio, no cada vez que se escribe. */
  useEffect(() => {
    setF((p) => ({
      ...p,
      zona: base?.zona ?? "", tipo: base?.tipo ?? "",
      area: base?.area != null ? String(base.area).replace(".", ",") : "",
      publicado: millones(base?.publicado),
      administracion: base?.administracion != null ? Math.round(base.administracion).toLocaleString("es-CO") : "",
    }));
    setRes(null);
    setError(null);
  }, [base, link]);

  /* Las cifras llevan sus puntos de miles mientras se escriben («2.530.000»):
     un precio de diez dígitos no se lee sin contar ceros. `numero()` los lee
     igual. Ver `conPuntos` en lib/cifras.ts. */
  const CIFRAS = new Set<keyof typeof f>(["area", "publicado", "negociado", "remodelacion", "administracion", "canon", "valorRemodelado"]);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((p) => ({ ...p, [k]: CIFRAS.has(k) ? conPuntos(e.target.value) : e.target.value }));
  const tipos = useMemo(() => Object.keys(zonas[f.zona]?.tipos ?? {}), [zonas, f.zona]);

  const calcular = async () => {
    setCalculando(true);
    setError(null);
    try {
      const m = (s: string) => { const n = numero(s); return n == null ? null : n * 1e6; };
      const cuerpo = {
        link,
        zona: f.zona || null, tipo: f.tipo || null, area: numero(f.area),
        publicado: m(f.publicado), negociado: m(f.negociado), remodelacion_m2: m(f.remodelacion),
        administracion: numero(f.administracion), canon_m2: numero(f.canon), valor_remodelado_m2: m(f.valorRemodelado),
        rasgos: f.rasgos.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6),
      };
      setRes(await pedir<Resultado>("/api/admin/flujo/ficha/calcular", { method: "POST", body: JSON.stringify(cuerpo) }));
    } catch (e) {
      setRes(null);
      setError((e as Error).message);
    } finally {
      setCalculando(false);
    }
  };

  /* Cuántos campos ya tenían OTRA cosa escrita: es lo que se pisaría. */
  const pisa = useMemo(() => {
    if (!res) return 0;
    return Object.entries(res.valores).filter(([k, v]) =>
      lleno(valores[k]) && JSON.stringify(valores[k]) !== JSON.stringify(v)).length;
  }, [res, valores]);

  const aplicar = () => {
    if (!res) return;
    if (pisa && !window.confirm(
      `${pisa} campo${pisa === 1 ? " ya tiene" : "s ya tienen"} otra cifra escrita y se van a reemplazar por las del modelo. ¿Seguir?`)) return;
    onAplicar(res.valores);
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div className="fic-calc-cab">
        <div>
          <SecTitle style={{ marginBottom: 4 }}>Calcular finanzas con el modelo</SecTitle>
          <Hint>
            Llena las cifras de Finanzas (y las de «La oportunidad en una mirada», el termómetro y el score) con el
            modelo de Zequara: mercado de su segmento, CDT de la Superfinanciera e IPC del DANE. No guarda nada: pasa
            las cifras al formulario para revisarlas.
          </Hint>
        </div>
        <Btn tono="ghost" onClick={() => setAbierto((a) => !a)}>{abierto ? "Ocultar" : "Mostrar"}</Btn>
      </div>

      {abierto && (
        <>
          <div className="fic-campos" style={{ marginTop: 14 }}>
            <div className="fic-campo">
              <label htmlFor="calc-zona">Zona</label>
              <select className="t" id="calc-zona" value={f.zona} onChange={set("zona")}>
                <option value="">— elegir —</option>
                {Object.entries(zonas).map(([z, d]) => <option key={z} value={z}>{z} · datos del {d.fecha}</option>)}
              </select>
              {f.zona && !zonas[f.zona] && <p className="fic-ayuda">Sin fotografía de mercado para esta zona.</p>}
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-tipo">Tipo de inmueble</label>
              <select className="t" id="calc-tipo" value={f.tipo} onChange={set("tipo")}>
                <option value="">— elegir —</option>
                {(tipos.length ? tipos : ["Apartamento", "Casa"]).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-area">Área (m²)</label>
              <input className="t" id="calc-area" inputMode="decimal" value={f.area} onChange={set("area")} placeholder="305,35" />
              <p className="fic-ayuda">La construida confirmada en la visita, si ya la hay.</p>
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-pub">Precio publicado (millones)</label>
              <input className="t" id="calc-pub" inputMode="decimal" value={f.publicado} onChange={set("publicado")} placeholder="1.995" />
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-neg">Precio negociado (millones)</label>
              <input className="t" id="calc-neg" inputMode="decimal" value={f.negociado} onChange={set("negociado")} placeholder="vacío = publicado − 10 %" />
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-rem">Remodelación por m² (millones)</label>
              <input className="t" id="calc-rem" inputMode="decimal" value={f.remodelacion} onChange={set("remodelacion")} placeholder="vacío = 3,1 (Bogotá)" />
              <p className="fic-ayuda">Medellín sigue pendiente de arquitectura: si no se escribe, se usa el de Bogotá y se avisa.</p>
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-adm">Administración mensual ($)</label>
              <input className="t" id="calc-adm" inputMode="decimal" value={f.administracion} onChange={set("administracion")} placeholder="2.530.000" />
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-ras">Rasgos únicos (separados por coma)</label>
              <input className="t" id="calc-ras" value={f.rasgos} onChange={set("rasgos")} placeholder="vista panorámica, piso alto" />
              <p className="fic-ayuda">Suben la unicidad del score. Máximo dos cuentan.</p>
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-canon">Canon por m² al mes ($) · opcional</label>
              <input className="t" id="calc-canon" inputMode="decimal" value={f.canon} onChange={set("canon")} placeholder="vacío = mediana del segmento" />
            </div>
            <div className="fic-campo">
              <label htmlFor="calc-vr">Valor remodelado por m² (millones) · opcional</label>
              <input className="t" id="calc-vr" inputMode="decimal" value={f.valorRemodelado} onChange={set("valorRemodelado")} placeholder="vacío = percentiles del segmento" />
            </div>
          </div>

          <div className="fic-acciones" style={{ marginTop: 14 }}>
            <Btn tono="primary" onClick={calcular} disabled={calculando || !link}>
              {calculando ? "Calculando…" : res ? "Volver a calcular" : "Calcular"}
            </Btn>
            {res && <Btn tono="ghost" onClick={aplicar}><IcoCheck />Pasar al formulario ({Object.keys(res.valores).length} campos)</Btn>}
          </div>

          {error && <div className="maqueta-note" style={{ marginTop: 14, marginBottom: 0 }}><p><b>No se pudo calcular.</b> {error}</p></div>}

          {res && (
            <div className="fic-calc-res">
              <div className="fic-calc-kpis">
                <div><small>Inversión total</small><b>{mm(res.resumen.allin)}</b></div>
                <div><small>TIR cons. / base / alto</small><b>{pct(res.resumen.tir.conservador)} / {pct(res.resumen.tir.base)} / {pct(res.resumen.tir.alto)}</b></div>
                <div><small>Múltiplo a 5 años</small><b>×{res.resumen.multiplo.toLocaleString("es-CO", { maximumFractionDigits: 2 })}</b></div>
                <div><small>Renta mensual</small><b>{mm(res.resumen.renta_mensual)}</b></div>
                <div><small>Score Zequara</small><b>{res.resumen.score != null ? `${res.resumen.score.toLocaleString("es-CO")} · ${res.resumen.prioridad}` : "sin calcular"}</b></div>
              </div>
              <Hint style={{ marginTop: 8 }}>Segmento: {res.resumen.segmento}</Hint>
              {res.avisos.length > 0 && (
                <div className="maqueta-note" style={{ marginTop: 12, marginBottom: 0 }}>
                  <div>
                    <p><b>Revisar antes de publicar</b></p>
                    <ul className="fic-falta">{res.avisos.map((a) => <li key={a}>{a}</li>)}</ul>
                  </div>
                </div>
              )}
              <ul className="fic-calc-fuentes">
                <li><b>Mercado:</b> {res.fuentes.mercado}</li>
                <li><b>CDT:</b> {res.fuentes.cdt}</li>
                <li><b>IPC:</b> {res.fuentes.ipc}</li>
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
