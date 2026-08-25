"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fmtMoneda, getPredioAnalisis, getPredios, getZonasResumen, miles,
} from "@/components/admin/api";
import { CIUDADES_DATA } from "@/components/admin/data";
import { Card, Grid, Hint, Kpi, MkChip, Ring, SecTitle, Tabla, VHead } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   DATA & SCORE — estadísticas reales de `serava_clean.db`, por zona (macro) y
   por predio (micro).

   Todo lo de esta pantalla baja del servidor. Lo que el pipeline todavía no
   captura —canon de arriendo, costo de remodelación, score de zona fuera de La
   Cabrera— llega marcado `sintetico: true` y aquí solo se pinta esa marca: no
   se rellena ningún hueco del lado del cliente.

   Sin servidor no hay muestra local para esta vista, y se dice en la barra en
   lugar de dejar las tarjetas en cero.
   ═══════════════════════════════════════════════════════════════════════════ */

type ScoreZona = { score: number; fase: string; sintetico?: boolean };
type Zona = {
  zona: string; sin_datos?: boolean; moneda: string;
  inventario_activo: number; publicaciones_ultima_corrida: number;
  precio_mediana_m2: number | null; precio_p25_m2: number | null; precio_p75_m2: number | null;
  antiguedad_anuncio_dias_promedio: number | null;
  score_zona: ScoreZona;
};
type FilaPredio = {
  link: string; titulo?: string; zona?: string; area_m2?: number; moneda?: string;
  precio_m2: number; mediana_precio_m2_zona?: number; precio_m2_clasificacion?: string;
  score_zequara?: number;
};
type Componente = { nombre: string; peso: number; valor: number; sintetico?: boolean };
type Analisis = {
  moneda?: string; area_m2?: number; precio_venta?: number;
  pct_bajo_mediana?: number | null; percentil_precio_zona?: number | null; percentil_area_zona?: number | null;
  precio_m2_clasificacion?: string;
  similitud: { dentro_poligono_real?: number; similar_a_zona?: number; distancia_similitud?: number | null };
  add_value_estimado?: {
    capex_m2_estimado?: number; canon_estimado_mensual?: number;
    spread_pct?: number | null; carry_pct?: number | null; venta_estimada_total?: number; nota?: string;
  };
  score_zequara?: { valor: number; prioridad: string; componentes: Componente[]; nota?: string };
};

export default function DataScore() {
  const [ciudad, setCiudad] = useState(CIUDADES_DATA[0]);
  const [conectado, setConectado] = useState(true);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [corrida, setCorrida] = useState<string>("—");
  const [filas, setFilas] = useState<FilaPredio[]>([]);
  const [link, setLink] = useState("");
  const [p, setP] = useState<Analisis | null>(null);

  /* ── macro: zonas de la ciudad ────────────────────────────────────────── */
  useEffect(() => {
    let vivo = true;
    getZonasResumen(ciudad)
      .then((d: { zonas?: Zona[]; fecha_ultima_corrida?: string }) => {
        if (!vivo) return;
        setConectado(true);
        setZonas(d.zonas || []);
        setCorrida(d.fecha_ultima_corrida || "—");
      })
      .catch(() => { if (vivo) { setConectado(false); setZonas([]); } });
    return () => { vivo = false; };
  }, [ciudad]);

  /* ── micro: predios de la ciudad para el selector ─────────────────────── */
  useEffect(() => {
    let vivo = true;
    getPredios({ ciudades: ciudad, limite: "300" })
      .then((d) => {
        if (!vivo) return;
        const f = ((d.filas || []) as unknown as FilaPredio[]).filter((x) => x.precio_m2);
        setFilas(f);
        setLink(f.length ? encodeURIComponent(f[0].link) : "");
      })
      .catch(() => { if (vivo) setFilas([]); });
    return () => { vivo = false; };
  }, [ciudad]);

  const cargarPredio = useCallback((l: string) => {
    if (!l) { setP(null); return; }
    getPredioAnalisis(l).then(setP).catch(() => setP(null));
  }, []);

  useEffect(() => { cargarPredio(link); }, [link, cargarPredio]);

  const totalInv = zonas.reduce((a, z) => a + (z.sin_datos ? 0 : z.inventario_activo), 0);
  const totalPub = zonas.reduce((a, z) => a + (z.sin_datos ? 0 : z.publicaciones_ultima_corrida), 0);

  /* "Predios más baratos" es exactamente eso: precio/m² ascendente, con los
     atípicos —casi siempre un error de digitación— al final. */
  const baratos = filas.slice().sort((a, b) => {
    const at = (x: FilaPredio) => ((x.precio_m2_clasificacion || "").indexOf("atipico") === 0 ? 1 : 0);
    return (at(a) - at(b)) || (a.precio_m2 - b.precio_m2);
  }).slice(0, 3);

  const av = p?.add_value_estimado || {};
  const sc = p?.score_zequara;
  const sim = p?.similitud;
  const simTx = sim?.dentro_poligono_real === 1 ? "Dentro del polígono real"
    : sim?.similar_a_zona === 1 ? "Fuera del polígono, similar (MCD)"
    : sim?.similar_a_zona === 0 ? "Fuera del polígono, no similar"
    : "Sin evaluar · sin coordenadas";
  const atip = (p?.precio_m2_clasificacion || "").indexOf("atipico") === 0;
  const util = (av.venta_estimada_total || 0) - (p?.precio_venta || 0);

  return (
    <section className="view active">
      <VHead titulo="Data &" fuerte="Score">
        Estadísticas reales de <code>serava_clean.db</code> por zona (macro) y por predio (micro).
        Lo que el pipeline todavía no captura se marca <MkChip t="na">Estimado</MkChip>.
      </VHead>

      <div className="citybar">
        {CIUDADES_DATA.map((c) => (
          <button
            key={c} type="button"
            className={`citychip${c === ciudad ? " active" : ""}`}
            onClick={() => setCiudad(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {!conectado && (
        <Card className="mb" style={{ background: "rgba(181,84,47,.08)" }}>
          <Hint style={{ margin: 0 }}>
            Sin servidor: conecta con <b>uvicorn app.main:app</b> para ver las estadísticas reales de
            esta página (no hay muestra local para Data &amp; Score todavía).
          </Hint>
        </Card>
      )}

      <Grid cols={4} className="mb">
        <Kpi lbl="Zonas monitoreadas" v={zonas.length} h={"en " + ciudad} vSize={1.4} />
        <Kpi lbl="Inventario activo total" v={miles(totalInv)} h="suma de las zonas" vSize={1.4} />
        <Kpi lbl="Publicaciones · última corrida" v={miles(totalPub)} h="" vSize={1.4} />
        <Kpi lbl="Última corrida" v={corrida} h="" vSize={1.4} />
      </Grid>

      <Grid cols={2} className="mb">
        <Card>
          <SecTitle>Zonas monitoreadas · nivel macro</SecTitle>
          <Tabla ancho="lg">
            <thead>
              <tr>
                <th>Zona</th><th className="num">Inventario</th><th className="num">$/m² mediana</th>
                <th className="num">Rango p25–p75</th><th className="num">Antigüedad anuncio</th><th>Score de zona</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((z) => z.sin_datos ? (
                <tr key={z.zona}>
                  <td className="pname">{z.zona}</td>
                  <td colSpan={5} className="hint" style={{ margin: 0 }}>Sin predios en la corrida actual</td>
                </tr>
              ) : (
                <tr key={z.zona}>
                  <td className="pname">{z.zona}</td>
                  <td className="num">{miles(z.inventario_activo)}</td>
                  <td className="num">{fmtMoneda(z.precio_mediana_m2, z.moneda)}</td>
                  <td className="num">{fmtMoneda(z.precio_p25_m2, z.moneda)} – {fmtMoneda(z.precio_p75_m2, z.moneda)}</td>
                  <td className="num">{z.antiguedad_anuncio_dias_promedio != null ? z.antiguedad_anuncio_dias_promedio + " d" : "—"}</td>
                  <td>
                    {z.score_zona.score.toFixed(1)} · {z.score_zona.fase}
                    {z.score_zona.sintetico && <> <MkChip t="na">Estimado</MkChip></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
          <Hint>
            Inventario, precio y antigüedad del anuncio son datos reales de la corrida más reciente
            (no es «días para vender»: el pipeline no rastrea cuándo se retira un anuncio). El score
            de zona es real solo para La Cabrera; el resto va estimado.
          </Hint>
        </Card>

        <Card>
          <SecTitle>Predios más baratos de la zona <MkChip t="na">Real</MkChip></SecTitle>
          <Tabla ancho="md">
            <thead>
              <tr><th>Predio</th><th className="num">$/m²</th><th className="num">vs. mediana</th></tr>
            </thead>
            <tbody>
              {baratos.map((f) => {
                const pct = f.mediana_precio_m2_zona
                  ? Math.round((f.precio_m2 - f.mediana_precio_m2_zona) / f.mediana_precio_m2_zona * 100)
                  : null;
                const a = (f.precio_m2_clasificacion || "").indexOf("atipico") === 0;
                return (
                  <tr key={f.link}>
                    <td>
                      {(f.titulo || f.zona || "").slice(0, 42)}
                      {a && <> <MkChip t="atip">Atípico</MkChip></>}
                    </td>
                    <td className="num">{fmtMoneda(f.precio_m2, f.moneda)}</td>
                    <td className="num" style={{ color: "var(--sage-deep)" }}>{pct != null ? pct + "%" : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </Tabla>
          <Hint>
            Los 3 predios de menor precio/m² que ya cumplen el criterio de calidad del arquitecto —
            los mismos que aparecerían en Predios.
          </Hint>
        </Card>
      </Grid>

      <Card>
        <SecTitle>Score y valoración por predio · nivel micro</SecTitle>
        <label htmlFor="d-predio">Selecciona el predio</label>
        <select
          className="t" id="d-predio" style={{ maxWidth: 460, marginBottom: 20 }}
          value={link} onChange={(e) => setLink(e.target.value)}
        >
          {filas.slice(0, 80).map((f) => (
            <option key={f.link} value={encodeURIComponent(f.link)}>
              {(f.zona || "—")} · {(f.area_m2 || "?")} m² · {fmtMoneda(f.precio_m2, f.moneda)}/m² · score {f.score_zequara}
            </option>
          ))}
          {!filas.length && <option value="">Sin predios para esta ciudad</option>}
        </select>

        <SecTitle style={{ marginTop: 4 }}>Contexto real del predio dentro de su zona</SecTitle>
        <Grid cols={4} className="mb">
          <Kpi
            lbl="% vs. mediana de zona" vSize={1.28}
            v={p?.pct_bajo_mediana != null ? p.pct_bajo_mediana + "%" : "—"}
            h={atip ? <MkChip t="atip">Precio atípico</MkChip> : "real"}
          />
          <Kpi
            lbl="Percentil de precio en zona" vSize={1.28}
            v={p?.percentil_precio_zona != null ? "p" + p.percentil_precio_zona : "—"}
            h={"más barato que ~" + (p?.percentil_precio_zona != null ? (100 - p.percentil_precio_zona).toFixed(0) : "?") + "% de la zona"}
          />
          <Kpi
            lbl="Percentil de tamaño en zona" vSize={1.28}
            v={p?.percentil_area_zona != null ? "p" + p.percentil_area_zona : "—"}
            h={(p?.area_m2 || "—") + " m²"}
          />
          <Kpi
            lbl="Similitud de zona" v={simTx} vSize={1.28}
            h={sim?.distancia_similitud != null ? "distancia " + sim.distancia_similitud.toFixed(2) : "real"}
          />
        </Grid>

        <SecTitle>Add-value estimado <MkChip t="na">Estimado</MkChip></SecTitle>
        <Grid cols={4} className="mb">
          <Kpi lbl="CAPEX/m² estimado" v={fmtMoneda(av.capex_m2_estimado, p?.moneda)} vSize={1.28} h="" />
          <Kpi lbl="Canon mensual estimado" v={fmtMoneda(av.canon_estimado_mensual, p?.moneda)} vSize={1.28} h="" />
          <Kpi lbl="Spread de arbitraje" v={av.spread_pct != null ? av.spread_pct + "%" : "—"} vSize={1.28} h="" />
          <Kpi lbl="Carry de arriendo" v={av.carry_pct != null ? av.carry_pct + "%" : "—"} vSize={1.28} h="" />
        </Grid>

        <SecTitle>Score Zequara del predio <MkChip t="na">Índice sintético</MkChip></SecTitle>
        <p className="hint" style={{ margin: "0 0 16px" }}>
          Combina todo lo de arriba en un solo número para que el arquitecto sepa qué predio revisar
          primero — con más de 5.000 predios habilitados hoy, no se pueden revisar todos. No
          reemplaza su criterio: lo ordena.
        </p>

        <Grid cols={2}>
          <div className="scoretotal" style={{ alignItems: "center", height: "100%" }}>
            <Ring v={sc?.valor ?? 0}><i>{sc?.valor ?? 0}</i></Ring>
            <div>
              <div className="tx" style={{ fontWeight: 600, color: "var(--espresso2)", fontSize: ".95rem" }}>
                {sc?.prioridad ?? "—"}
              </div>
              <div className="hint" style={{ margin: "4px 0 0" }}>
                Entre más alto, mejor candidato para revisión prioritaria.
              </div>
            </div>
          </div>
          <div>
            {(sc?.componentes ?? []).map((c) => (
              <div className="frow" key={c.nombre}>
                <span className="k">
                  {c.nombre} ({c.peso}%)
                  {c.sintetico && <> <MkChip t="na">Estimado</MkChip></>}
                </span>
                <span className="v">{c.valor}/100</span>
              </div>
            ))}
          </div>
        </Grid>

        <div className="result-band" style={{ marginTop: 16 }}>
          <div>
            <div className="k">Plusvalía estimada (venta − inversión)</div>
            <div className="v">${miles(Math.round(util / 1e6))}M</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="k" style={{ opacity: .85 }}>ROI estimado</div>
            <div className="v">~{p?.precio_venta ? Math.round(util / p.precio_venta * 100) : 0}%</div>
          </div>
        </div>
        <Hint>{(av.nota || "") + " " + (sc?.nota || "")}</Hint>
      </Card>
    </section>
  );
}
