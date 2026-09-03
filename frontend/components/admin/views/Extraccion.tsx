"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import {
  filaApi, filaLocal, fmtPm2, fmtPrecio, getConfig, getEstadoCorrida, getPredios,
  miles, muestra, postExtraer, postSeguimiento,
  type AggZona, type Fila, type Resumen, type ZonaMuestra,
} from "@/components/admin/api";
import { CSV_COLS, MOTIVOS_DESCARTE, tituloDelEnlace, type Predio } from "@/components/admin/data";
import { Btn, Card, Hint, IcoBack, IcoCheck, IcoDown, IcoExt, MkChip, SecTitle, Tabla, VHead } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   EXTRACCIÓN DE PREDIOS — conectada al pipeline real.

   Funciona en dos modos, y lo dice en pantalla:

   1. CONECTADA (`uvicorn app.main:app` corriendo): habla con el pipeline de
      verdad. "Ejecutar extracción" dispara `script_extract_serava.py` +
      `script_transform_serava.py`, la bitácora es la salida real de esos
      scripts, la tabla sale de `serava_clean.db` y las decisiones se guardan
      en `seguimiento.db` con `seguimiento.py`.
   2. LOCAL (sin servidor): usa la muestra de datos reales exportada de
      `serava_clean.db`. Los contadores del embudo son los totales reales; la
      tabla es una muestra, y se avisa arriba y debajo de ella.

   TRES CRITERIOS QUE NO SON DE PANTALLA (van por dentro, siempre):
     · tipo de inmueble → apartamento y casa
     · portal → lo determina la zona, no la persona (CONFIG_ZONAS)
     · criterio de precio → precio_m2 < mediana de la zona, por zona y moneda.
       La pantalla solo puede pedir ver además el resto del universo; no puede
       cambiar el criterio.
   ═══════════════════════════════════════════════════════════════════════════ */

const CRITERIOS_FIJOS = [
  { k: "Tipo de inmueble", v: "Apartamento y casa" },
  { k: "Portales", v: "Metrocuadrado · Encuentra24" },
  { k: "Criterio de precio", v: "Bajo la mediana de su zona" },
  { k: "Frecuencia", v: "Mensual" },
];

type Linea = { t?: string; m: string; n?: string };

/** Modal de descarte: el motivo es obligatorio y queda en `seguimiento.db`. */
function FormDescartar({ n, onConfirmar, onCancelar }: {
  n: number; onConfirmar: (motivo: string) => void; onCancelar: () => void;
}) {
  const [m, setM] = useState(MOTIVOS_DESCARTE[0]);
  const [nota, setNota] = useState("");
  return (
    <>
      <MCuerpo>
        <label htmlFor="ex-mot">Motivo del descarte (obligatorio)</label>
        <select className="t" id="ex-mot" value={m} onChange={(e) => setM(e.target.value)}>
          {MOTIVOS_DESCARTE.map((x) => <option key={x}>{x}</option>)}
        </select>
        <label htmlFor="ex-nota">Nota</label>
        <textarea
          className="t" id="ex-nota" value={nota} onChange={(e) => setNota(e.target.value)}
          placeholder="Queda registrada junto al descarte en seguimiento.db"
        />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={() => onConfirmar(m + (nota ? " — " + nota : ""))}>
          Descartar {n} predio(s)
        </button>
      </MPie>
    </>
  );
}

export default function Extraccion({ onEnviarARevision }: { onEnviarARevision: (p: Predio[]) => void }) {
  const { go, av, modal } = useConsola();

  /* ── conexión y catálogo de zonas ─────────────────────────────────────── */
  const [api, setApi] = useState<boolean | null>(null);
  const [corridaSrv, setCorridaSrv] = useState<string | undefined>();
  const [fijos, setFijos] = useState(CRITERIOS_FIJOS);
  const [zonas, setZonas] = useState<ZonaMuestra[]>([]);
  const [agg, setAgg] = useState<Record<string, AggZona>>({});
  const [totales, setTotales] = useState<Record<string, number>>({});
  const [nMuestra, setNMuestra] = useState(0);

  /* ── filtros de configuración y de tabla ──────────────────────────────── */
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});
  const [fPais, setFPais] = useState("");
  const [fCiudad, setFCiudad] = useState("");
  const [fZona, setFZona] = useState("");

  /* ── corrida y resultados ─────────────────────────────────────────────── */
  const [rows, setRows] = useState<Fila[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [esMuestra, setEsMuestra] = useState(true);
  const [truncado, setTruncado] = useState(false);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [corriendo, setCorriendo] = useState(false);
  const [log, setLog] = useState<Linea[]>([]);
  const [fill, setFill] = useState(0);
  const [verResultados, setVerResultados] = useState(false);
  const [verCorrida, setVerCorrida] = useState(false);
  const [iniciada, setIniciada] = useState("");
  const [yaCorrio, setYaCorrio] = useState(false);

  const poll = useRef<number | null>(null);
  const cajaLog = useRef<HTMLDivElement>(null);

  /* La muestra se pide siempre: de ella sale el catálogo de zonas activas, que
     es lo que se puede marcar arriba, tanto conectado como sin servidor. */
  useEffect(() => {
    let vivo = true;
    muestra().then((d) => {
      if (!vivo) return;
      setZonas(d.zonas);
      setAgg(d.agg);
      setTotales(d.totales);
      setNMuestra(d.rows.length);
      setMarcadas(Object.fromEntries(d.zonas.map((z) => [z.z, true])));
    }).catch(() => { /* sin muestra la pantalla queda vacía pero no rota */ });
    return () => { vivo = false; };
  }, []);

  useEffect(() => {
    let vivo = true;
    getConfig()
      .then((cfg) => {
        if (!vivo) return;
        setApi(true);
        setCorridaSrv(cfg.ultima_corrida);
        /* Los criterios fijos se leen del backend en vez de estar escritos a
           mano: si mañana cambian en el script, la pantalla lo refleja. */
        const f = cfg.criterios_fijos;
        if (f) setFijos((prev) => prev.map((c, i) =>
          i === 0 ? { ...c, v: f.tipo_inmueble.join(" y ") }
          : i === 1 ? { ...c, v: f.portales.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" · ") }
          : c));
      })
      .catch(() => { if (vivo) setApi(false); });
    return () => { vivo = false; };
  }, []);

  useEffect(() => () => { if (poll.current) window.clearInterval(poll.current); }, []);

  useEffect(() => {
    const el = cajaLog.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  /* ── derivados de los filtros ─────────────────────────────────────────── */
  const paises = [...new Set(zonas.map((z) => z.p))];
  const ciudadesDe = (p: string) => [...new Set(zonas.filter((z) => !p || z.p === p).map((z) => z.c))];
  /* Las zonas visibles dependen del país y la ciudad: elegir "Panamá" no debe
     seguir mostrando La Cabrera como opción marcable. */
  const visibles = zonas.filter((z) => (!pais || z.p === pais) && (!ciudad || z.c === ciudad));
  const zonasSel = () => visibles.filter((z) => marcadas[z.z]).map((z) => z.z);
  const zonasFiltro = zonas.filter((z) => (!fPais || z.p === fPais) && (!fCiudad || z.c === fCiudad)).map((z) => z.z);

  /* ── carga de datos ───────────────────────────────────────────────────── */
  const cargar = useCallback(async (elegidas: string[], p: string, c: string, z: string) => {
    if (api) {
      try {
        const d = await getPredios({
          paises: p, ciudades: c, zonas: z || elegidas.join(","),
        });
        setRows((d.filas || []).map(filaApi));
        setResumen(d.resumen);
        setTruncado(!!d.truncado);
        setEsMuestra(false);
        setSel({});
      } catch (e) {
        av("No pude leer del servidor: " + (e as Error).message);
      }
      return;
    }
    /* Modo local: se filtra la muestra con los mismos tres criterios del
       arquitecto que aplica el servidor —deduplicado, validación geográfica a
       favor, bajo mediana—, para que la demo sin servidor no muestre nada que
       la versión real no mostraría. */
    const d = await muestra();
    const filas = d.rows.map((a) => filaLocal(a, d.zonas, d.agg)).filter((r) => {
      if (elegidas.length && !elegidas.includes(r.zona)) return false;
      if (p && r.pais !== p) return false;
      if (c && r.ciudad !== c) return false;
      if (z && r.zona !== z) return false;
      if (r.dup) return false;
      if (!(r.po === 1 || r.si === 1 || r.po === -1)) return false;
      if (!r.bajo) return false;
      return true;
    });
    setRows(filas);
    setResumen(resumenLocal(d.zonas, d.agg, elegidas, p, c, z));
    setEsMuestra(true);
    setTruncado(false);
    setSel({});
  }, [api, av]);

  /* En modo local los CONTADORES son los totales reales de la base, no los de
     la muestra: mentir en el embudo sería peor que no tenerlo. La tabla avisa
     aparte que es una muestra. */
  function resumenLocal(
    zs: ZonaMuestra[], ag: Record<string, AggZona>,
    elegidas: string[], p: string, c: string, z: string,
  ): Resumen {
    const acc: Resumen = { extraidos: 0, en_scope: 0, clean: 0, bajo: 0, atipicos: 0, fuera: 0, sin_evaluar: 0, similares: 0 };
    zs.forEach((o) => {
      if (elegidas.length && !elegidas.includes(o.z)) return;
      if (p && o.p !== p) return;
      if (c && o.c !== c) return;
      if (z && o.z !== z) return;
      const a = ag[o.z];
      if (!a) return;
      acc.extraidos += a.raw || 0; acc.en_scope += a.scope || 0; acc.clean += a.n || 0;
      acc.bajo += a.bajo || 0; acc.atipicos += a.atip || 0; acc.fuera += a.fuera || 0;
      acc.sin_evaluar += a.sineval || 0; acc.similares += a.sim || 0;
    });
    return acc;
  }

  /* ── corrida ──────────────────────────────────────────────────────────── */
  const anota = (m: string, n?: string, t?: string) => setLog((l) => [...l, { m, n, t }]);

  const arrancar = (soloTransformar: boolean) => {
    const elegidas = zonasSel();
    setCorriendo(true);
    setYaCorrio(true);
    setVerCorrida(true);
    setVerResultados(false);
    setIniciada(new Date().toLocaleString("es-CO"));
    setLog([]);
    setFill(0);
    /* Los filtros de la tabla arrancan alineados con lo que se extrajo. */
    setFPais(pais); setFCiudad(ciudad); setFZona("");
    if (api) correrReal(elegidas, soloTransformar); else correrLocal(elegidas);
  };

  const terminar = (msg: string | null) => {
    setCorriendo(false);
    setFill(100);
    setVerResultados(true);
    void cargar(zonasSel(), pais, ciudad, "");
    if (msg) av(msg);
  };

  const correrReal = (elegidas: string[], soloTransformar: boolean) => {
    postExtraer(elegidas, soloTransformar)
      .then(() => {
        anota(soloTransformar
          ? "Rehaciendo solo la limpieza · no se contacta ningún portal"
          : `Corrida lanzada en el servidor · ${elegidas.length} zona(s)`);
        let visto = 0;
        poll.current = window.setInterval(() => {
          getEstadoCorrida(visto).then((s) => {
            s.log.forEach((l) => anota(l.m, l.n, l.t));
            visto = s.n_log;
            if (s.total) setFill(Math.min(99, Math.round((s.paso ?? 0) / s.total * 100)));
            if (!s.corriendo) {
              if (poll.current) { window.clearInterval(poll.current); poll.current = null; }
              terminar(s.error ? "La corrida falló: " + s.error : "Corrida terminada");
            }
          }).catch(() => {
            if (poll.current) { window.clearInterval(poll.current); poll.current = null; }
            terminar("Se perdió la conexión con el servidor");
          });
        }, 900);
      })
      .catch((e) => { anota("No se pudo lanzar la corrida: " + e.message, "error"); terminar(null); });
  };

  /* Modo local: no inventa datos, narra con los números reales de la última
     corrida guardada en la base. */
  const correrLocal = (elegidas: string[]) => {
    const zi = Object.fromEntries(zonas.map((z) => [z.z, z]));
    const pasos: string[] = [];
    const portales = [...new Set(elegidas.map((z) => zi[z]?.portal).filter(Boolean))];
    portales.forEach((p) => pasos.push(
      `robots.txt de ${p === "metrocuadrado" ? "metrocuadrado.com" : "encuentra24.com"} → permitido (descargado con sesión y user-agent propios)`,
    ));
    elegidas.forEach((z) => {
      const a = agg[z] || {};
      const m = zi[z]?.portal === "metrocuadrado"
        ? "API rest-search/search · from/size · tipo=[apartamento, casa]"
        : "listado HTML · sufijo numérico por página";
      pasos.push(`${z} · ${zi[z]?.portal} (${m}) → ${a.raw || 0} anuncios`);
    });
    const r = resumenLocal(zonas, agg, elegidas, "", "", "");
    pasos.push(`Filtro de barrio real → ${r.extraidos - r.en_scope} descartados (única eliminación de esta etapa)`);
    pasos.push(`Deduplicación de grupos chicos → ${r.en_scope - r.clean} republicaciones eliminadas · grupos de 4+ conservados como unidades distintas`);
    pasos.push(`Atípicos por rango intercuartílico (por zona y moneda) → ${r.atipicos} marcados, no eliminados`);
    pasos.push("Mediana de precio/m² recalculada por zona sobre datos limpios");
    pasos.push(`Validación contra polígono real → ${r.fuera} fuera del límite · ${r.sin_evaluar} sin coordenadas (sin evaluar, no excluidos)`);
    pasos.push(`Similitud robusta (MCD / k-NN) para los que quedaron fuera → ${r.similares} similares a su zona`);
    pasos.push("Cruce con seguimiento.db (solo lectura) → no se sobrescribe ninguna decisión humana");
    pasos.push("Sin servidor conectado: no se scrapeó nada. Lo anterior es el resumen real de la última corrida guardada.");

    let i = 0;
    const paso = () => {
      if (i >= pasos.length) { terminar(null); return; }
      anota(pasos[i]);
      i += 1;
      setFill(Math.round(i / pasos.length * 100));
      window.setTimeout(paso, 170);
    };
    paso();
  };

  const ejecutar = (soloTransformar = false) => {
    if (corriendo) return;
    const elegidas = zonasSel();
    if (!elegidas.length) { av("Selecciona al menos una zona"); return; }
    /* Conectado, "Ejecutar extracción" sale de verdad a los portales: con 2 a
       4,5 s de espera entre peticiones, las 10 zonas son decenas de minutos.
       Se pide confirmación explícita para que nadie lo dispare sin querer. */
    if (api && !soloTransformar) {
      modal("Correr la extracción de verdad", (cierra) => (
        <>
          <MCuerpo>
            <div style={{ fontSize: ".88rem", lineHeight: 1.6, color: "var(--coffee)" }}>
              Esto va a contactar <b>Metrocuadrado</b> y <b>Encuentra24</b> para {elegidas.length} zona(s),
              respetando la espera entre peticiones del script (2 a 4,5 s). Las 10 zonas completas son
              decenas de minutos.<br /><br />
              La limpieza posterior recalcula <b>todas</b> las zonas, no solo las elegidas: la mediana
              de una zona no depende de qué se scrapeó hoy.
            </div>
          </MCuerpo>
          <MPie>
            <button type="button" className="btn btn-ghost" onClick={cierra}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={() => { cierra(); arrancar(false); }}>Sí, extraer ahora</button>
          </MPie>
        </>
      ));
      return;
    }
    arrancar(soloTransformar);
  };

  /* ── selección y decisiones ───────────────────────────────────────────── */
  const seleccionados = rows.filter((r) => sel[r.id] && !r.sent && !r.desc);
  const nSel = Object.keys(sel).length;

  const guardarDecision = async (filas: Fila[], decision: string, motivo: string | null) => {
    if (!api) return { ok: true, nota: "(sin servidor: la decisión no se guardó en seguimiento.db)" };
    try {
      const d = await postSeguimiento(filas.map((r) => r.link), decision, motivo);
      return { ok: true, nota: d.errores?.length ? `· ${d.errores.length} con error` : "· guardado en seguimiento.db" };
    } catch (e) {
      return { ok: false, nota: "· no se pudo guardar: " + (e as Error).message };
    }
  };

  const enviar = async () => {
    const filas = seleccionados;
    if (!filas.length) { av("No has seleccionado ningún predio"); return; }
    const { ok, nota } = await guardarDecision(filas, "pasa", null);
    if (!ok) { av("No se guardó: " + nota); return; }
    setRows((rs) => rs.map((r) => filas.some((f) => f.id === r.id) ? { ...r, sent: true } : r));
    onEnviarARevision(filas.map((r) => ({
      id: "ex_" + r.id,
      nombre: (r.titulo || tituloDelEnlace(r.link) || "Predio sin título").slice(0, 60),
      zona: `${r.zona} · ${r.ciudad} · desde ${r.portal}`,
      est: "bor", score: "—", inversion: fmtPrecio(r.precio, r.mon),
      area: "arq" as const,
      city: r.ciudad === "Ciudad de Panamá" ? "Panamá" : r.ciudad,
      publicado: false, link: r.link,
    })));
    setSel({});
    av(`${filas.length} predio(s) enviado(s) a revisión como Borrador ${nota}`);
  };

  const descartar = () => {
    const filas = seleccionados;
    if (!filas.length) { av("No has seleccionado ningún predio"); return; }
    modal(`Descartar ${filas.length} predio(s)`, (cierra) => (
      <FormDescartar
        n={filas.length} onCancelar={cierra}
        onConfirmar={async (motivo) => {
          const { ok, nota } = await guardarDecision(filas, "no_pasa", motivo);
          if (!ok) { av("No se guardó: " + nota); return; }
          /* No se toca `bajo`: "estaba por debajo de la mediana" es un hecho
             del dato, no una opinión. El descarte se registra aparte. */
          setRows((rs) => rs.map((r) => filas.some((f) => f.id === r.id) ? { ...r, desc: "manual", motivo } : r));
          setSel({});
          cierra();
          av(`${filas.length} predio(s) descartado(s) ${nota}`);
        }}
      />
    ));
  };

  const csv = () => {
    if (!rows.length) { av("No hay filas para exportar"); return; }
    const geo = (r: Fila) => r.po === 1 ? "dentro" : r.po === 0 ? "fuera" : "sin_evaluar";
    const cuerpo = rows.map((r) => [
      r.pais, r.ciudad, r.zona, r.portal, r.tipo,
      '"' + (r.titulo || "").replace(/"/g, "'") + '"', r.link, r.area, r.precio, r.mon,
      Math.round(r.pm2), Math.round(r.med), r.bajo ? "si" : "no", geo(r),
      r.si === 1 ? "si" : r.si === 0 ? "no" : "", r.atip ? "si" : "no",
      r.dup ? "si" : "no", r.modelo ? "si" : "no", r.desc ? "si" : "no",
      '"' + (r.motivo || "") + '"',
    ].join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + CSV_COLS.join(",") + "\n" + cuerpo.join("\n")], { type: "text/csv;charset=utf-8;" }));
    a.download = "zequara_extraccion_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    av(`CSV descargado (${rows.length} filas)`);
  };

  /* ── embudo ───────────────────────────────────────────────────────────── */
  const r = resumen;
  const etapas = r ? [
    { n: miles(r.extraidos), l: "Anuncios extraídos", s: "universo completo" },
    { n: miles(r.en_scope), l: "En la zona real", s: `−${miles(r.extraidos - r.en_scope)} barrio no coincidente` },
    { n: miles(r.clean), l: "Tras deduplicación", s: `−${miles(r.en_scope - r.clean)} republicaciones` },
    { n: miles(r.bajo), l: "Bajo la mediana de su zona", s: `−${miles(r.clean - r.bajo)} sobre la mediana` },
    /* `habilitados` solo lo calcula el servidor. Sin él va un guion, no un
       cero: un cero al lado de los otros cuatro números se lee como "ninguno
       pasó", que es falso. */
    { n: r.habilitados != null ? miles(r.habilitados) : "—", l: "Habilitados para el arquitecto", s: r.habilitados != null ? `−${miles(r.bajo - r.habilitados)} descartados a mano` : "solo con servidor", hi: true },
  ] : [];

  const atipVis = rows.filter((x) => x.atip).length;

  return (
    <section className="view active">
      <VHead
        titulo="Extracción de" fuerte="predios"
        acciones={<Btn onClick={() => go("predios")}><IcoBack />Volver a predios</Btn>}
      >
        Trae desde los portales públicos los inmuebles en venta de las zonas activas cuyo precio por m²
        está por debajo de la mediana de su zona. Desde aquí no se publica nada: lo que se acepta entra
        a Predios como borrador.
      </VHead>

      <div className={`conn ${api === null ? "" : api ? "on" : "off"}`}>
        <span className="dot" />
        <span>
          {api === null ? "Verificando conexión con el pipeline…"
            : api ? <>Conectado al pipeline · <b>serava_clean.db</b>{corridaSrv ? ` · última corrida ${corridaSrv}` : ""}</>
            : <>Sin servidor · muestra local de <b>{nMuestra}</b> registros reales exportados de serava_clean.db
              ({miles(totales.clean)} en total). Para correr el pipeline de verdad: <b>uvicorn app.main:app</b>.</>}
        </span>
      </div>

      {/* 1 · configuración */}
      <Card className="mb">
        <SecTitle>1 · Qué se va a extraer</SecTitle>

        <div className="fixed-crit">
          {fijos.map((c) => (
            <div className="fc" key={c.k}><span className="k">{c.k}</span><span className="v">{c.v}</span></div>
          ))}
        </div>
        <Hint style={{ margin: "10px 0 18px" }}>
          Estos cuatro criterios son fijos y se aplican por dentro: el tipo va en la propia consulta al
          portal, el portal lo determina la zona, y el precio se compara contra la mediana de cada zona
          por separado. No se eligen desde aquí para que dos corridas nunca sean distintas por accidente.
        </Hint>

        <div className="ex-config mb">
          <div>
            <label htmlFor="ex-pais">País</label>
            <select className="t" id="ex-pais" value={pais} onChange={(e) => { setPais(e.target.value); setCiudad(""); }}>
              <option value="">Todos</option>
              {paises.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="ex-ciudad">Ciudad</label>
            <select className="t" id="ex-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              <option value="">Todas</option>
              {ciudadesDe(pais).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <label>Zonas activas · resultado vigente del Score de Zonas</label>
        <div className="zonegrid">
          {visibles.length ? visibles.map((z) => (
            <label className="zchk" key={z.z}>
              <input
                type="checkbox" className="exz" checked={!!marcadas[z.z]}
                onChange={(e) => setMarcadas((m) => ({ ...m, [z.z]: e.target.checked }))}
              />
              <span className="zn">{z.z}</span>
              <span className="zc">{z.c} · {z.mon}</span>
            </label>
          )) : <Hint style={{ margin: 0 }}>No hay zonas activas para esa combinación.</Hint>}
        </div>
        <Hint>
          El Score de Zonas corre por separado y decide <b style={{ color: "var(--coffee)" }}>qué zonas</b> entran
          a esta lista. Esta pantalla no evalúa zonas: solo busca predios dentro de las que ya fueron aprobadas.
        </Hint>

        <div className="saverow">
          <Btn onClick={() => {
            const todas = visibles.every((z) => marcadas[z.z]);
            setMarcadas((m) => ({ ...m, ...Object.fromEntries(visibles.map((z) => [z.z, !todas])) }));
          }}>
            Marcar / desmarcar todas
          </Btn>
          <Btn
            disabled={corriendo} onClick={() => ejecutar(true)}
            title="Vuelve a correr limpieza y validación sobre lo ya extraído, sin contactar los portales"
          >
            Rehacer solo la limpieza
          </Btn>
          <Btn tono="primary" disabled={corriendo} onClick={() => ejecutar(false)}>
            {corriendo ? "Trabajando…" : <><IcoDown />{yaCorrio ? "Volver a extraer" : "Ejecutar extracción"}</>}
          </Btn>
        </div>
      </Card>

      {/* 2 · corrida */}
      {verCorrida && (
        <Card className="mb">
          <SecTitle>
            2 · Corrida{" "}
            <span style={{ color: "var(--mocha)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              {iniciada && `· iniciada ${iniciada}`}
            </span>
          </SecTitle>
          <div className="runbar"><div className="fill" style={{ width: `${fill}%` }} /></div>
          <div className="runlog" ref={cajaLog}>
            {log.map((l, i) => (
              <div key={i}>
                › {l.t && <span style={{ opacity: .6 }}>{l.t} </span>}
                {l.n === "error" || l.n === "warn" ? <i>{l.m}</i> : l.m}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 3 · resultados */}
      {verResultados && (
        <>
          <Card className="mb">
            <SecTitle>3 · Qué pasó con los anuncios extraídos</SecTitle>
            <div className="stagerow">
              {etapas.map((e) => (
                <div className={`stg2${e.hi ? " hi" : ""}`} key={e.l}>
                  <div className="n">{e.n}</div>
                  <div className="l">{e.l}</div>
                  <div className="s">{e.s}</div>
                </div>
              ))}
            </div>
            <Hint>
              Salvo dos excepciones deliberadas —el filtro de barrio real y los duplicados confirmados
              de grupo chico— <b style={{ color: "var(--coffee)" }}>nada se elimina</b>: lo cuestionable
              queda marcado en la base, no borrado. Este listado ya viene deduplicado desde la limpieza
              y solo muestra los predios <b style={{ color: "var(--coffee)" }}>habilitados para gestión
              manual</b>: precio/m² bajo la mediana de su zona, con validación geográfica a favor
              (dentro del polígono, similar estadístico MCD, o sin evaluar por falta de coordenadas).
              Las únicas marcas visibles por predio son si tiene coordenadas evaluadas y si su
              precio/m² es atípico para su zona; los totales del embudo arriba sí reflejan el universo
              completo. El listado se ordena de mayor a menor Score Zequara — con miles de predios
              habilitados, así se ve primero cuáles conviene revisar antes.
            </Hint>
          </Card>

          {/* Los tres filtros recargan al cambiar, como el `onchange` original:
              cambiar de zona y tener que pulsar otro botón sobra. */}
          <div className="filters">
            <select
              className="f" value={fPais} aria-label="País"
              onChange={(e) => { const v = e.target.value; setFPais(v); setFCiudad(""); setFZona(""); void cargar(zonasSel(), v, "", ""); }}
            >
              <option value="">País: todos</option>
              {paises.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              className="f" value={fCiudad} aria-label="Ciudad"
              onChange={(e) => { const v = e.target.value; setFCiudad(v); setFZona(""); void cargar(zonasSel(), fPais, v, ""); }}
            >
              <option value="">Ciudad: todas</option>
              {ciudadesDe(fPais).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="f" value={fZona} aria-label="Zona"
              onChange={(e) => { const v = e.target.value; setFZona(v); void cargar(zonasSel(), fPais, fCiudad, v); }}
            >
              <option value="">Zona: todas</option>
              {zonasFiltro.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <Btn className="ml-auto" onClick={csv}><IcoDown />Descargar CSV</Btn>
          </div>

          <div className="bulkbar">
            <span className="c">Seleccionados: <b>{nSel}</b></span>
            <Btn tono="primary" onClick={enviar}><IcoCheck />Enviar a revisión arquitectónica</Btn>
            <Btn onClick={descartar}>Descartar con motivo</Btn>
            <span className="c" style={{ marginLeft: "auto", fontWeight: 300, fontSize: ".78rem", opacity: .75 }}>
              La decisión queda en <b>seguimiento.db</b> y sobrevive a las corridas siguientes.
            </span>
          </div>

          <Card style={{ padding: "6px 6px 2px" }}>
            <Tabla ancho="lg">
              <thead>
                <tr>
                  <th style={{ width: 34 }}>
                    <input
                      type="checkbox" aria-label="Seleccionar todo"
                      checked={rows.length > 0 && rows.every((x) => x.desc || x.sent || sel[x.id])}
                      onChange={(e) => setSel(e.target.checked
                        ? Object.fromEntries(rows.filter((x) => !x.desc && !x.sent).map((x) => [x.id, true]))
                        : {})}
                    />
                  </th>
                  <th className="num">Score</th>
                  <th>Anuncio</th><th>Zona</th><th>Portal</th>
                  <th className="num">Área</th><th className="num">Precio</th><th className="num">Precio / m²</th>
                  <th className="num">Mediana zona</th><th>Marcas</th><th style={{ textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={11}><div className="exempty">Ningún anuncio cumple estos filtros.</div></td></tr>
                )}
                {rows.map((x) => (
                  <tr key={x.id} className={`exrow${x.sent ? " sent" : ""}${x.desc ? " desc" : ""}`}>
                    <td>
                      {!(x.desc || x.sent) && (
                        <input
                          type="checkbox" aria-label={`Seleccionar ${x.titulo}`} checked={!!sel[x.id]}
                          onChange={(e) => setSel((s) => {
                            const n = { ...s };
                            if (e.target.checked) n[x.id] = true; else delete n[x.id];
                            return n;
                          })}
                        />
                      )}
                    </td>
                    {x.score != null
                      ? <td className="num" title={x.prioridad || ""}><b>{x.score}</b></td>
                      : <td className="num hint">—</td>}
                    <td>
                      <div className="pname">{x.titulo || tituloDelEnlace(x.link) || "(sin título)"}</div>
                      <div className="pzone">{x.tipo} · {x.hab} hab · {x.ban} baños</div>
                    </td>
                    <td>
                      <div style={{ fontSize: ".83rem" }}>{x.zona}</div>
                      <div className="pzone">{x.ciudad} · {x.pais}</div>
                    </td>
                    <td><span className="src">{x.portal}</span></td>
                    <td className="num">{x.area} m²</td>
                    <td className="num">{fmtPrecio(x.precio, x.mon)}</td>
                    <td className={`num ${x.bajo ? "below" : "above"}`}>{fmtPm2(x.pm2, x.mon)}</td>
                    <td className="num" style={{ color: "var(--mocha)" }}>{x.med ? fmtPm2(x.med, x.mon) : "—"}</td>
                    <td>
                      <div className="mklist">
                        {/* Única marca geográfica que se muestra: si el predio tenía coordenadas
                            para evaluar o si no se pudo evaluar por falta de ellas. Ya no se
                            distingue dentro/similar en pantalla. */}
                        {x.po === -1
                          ? <MkChip t="na">Sin evaluar · sin coordenadas</MkChip>
                          : <MkChip t="in">Con coordenadas evaluadas</MkChip>}
                        {x.atip && <MkChip t="atip">Precio atípico</MkChip>}
                        {x.desc === "manual" && (
                          <MkChip t="desc" title={x.motivo || ""}>
                            Descartado · {(x.motivo || "sin motivo").slice(0, 26)}
                          </MkChip>
                        )}
                        {x.sent && <MkChip t="in">Enviado a revisión</MkChip>}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="tacts">
                        <a className="iconbtn" href={x.link || "#"} target="_blank" rel="noopener" title="Ver anuncio original"><IcoExt /></a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          </Card>

          <Hint style={{ margin: "12px 2px 0" }}>
            {esMuestra
              ? <>Muestra local: <b>{rows.length}</b> de <b>{miles(r?.bajo)}</b> candidatos reales. Con el servidor corriendo se ven todos.</>
              : <>Mostrando <b>{rows.length}</b> registros{truncado ? " (tope de 1.500 por consulta — afina el filtro de zona)" : ""}.</>}
            {atipVis > 0 && <> <b>{atipVis}</b> con precio atípico: casi siempre es un error de digitación del anuncio, conviene abrirlos antes de contactar.</>}
          </Hint>
        </>
      )}

      {!verResultados && !verCorrida && (
        <Card>
          <div className="exempty">
            Todavía no has corrido la extracción.<br />
            Elige las zonas arriba y pulsa <b style={{ color: "var(--coffee)" }}>Ejecutar extracción</b>,
            o mira lo que ya está en la base con <b style={{ color: "var(--coffee)" }}>Ver lo extraído</b>.
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Btn onClick={() => { setVerResultados(true); setFPais(pais); setFCiudad(ciudad); void cargar(zonasSel(), pais, ciudad, ""); }}>
              Ver lo extraído en la última corrida
            </Btn>
          </div>
        </Card>
      )}
    </section>
  );
}
