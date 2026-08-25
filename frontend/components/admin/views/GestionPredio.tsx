"use client";

import { useState, type ReactNode } from "react";
import { useConsola } from "@/components/admin/ctx";
import { ESTADOS } from "@/components/admin/data";
import {
  Card, Frow, Grid, Hint, IcoEye, IcoPlus, IcoTrash, Ring, SecTitle, Tabla,
} from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   GESTIÓN DE PREDIO — la ficha interna, con sus siete pestañas.

   Es la única vista del original que no cuelga del menú lateral: se entra
   desde el lápiz de la tabla de predios, desde Arquitectura o desde
   Comercial, y se sale por la miga de pan. De ahí que la abra el marco con
   `abrirGestion()` y no un `nav-item`.

   Lo que era manipulación de DOM —`addFoto`, `addDoc`, `crearApr`,
   `sendNotif`, los deslizadores del score— pasó a estado: las listas se
   dibujan de un array y los botones lo modifican, en vez de insertar `<tr>`
   con `innerHTML`.
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS = [
  { k: "info", l: "Información", d: "M12 16v-4M12 8h.01", circulo: true },
  { k: "estado", l: "Estado y proceso", d: "M3 6h18M3 12h18M3 18h12" },
  { k: "fotos", l: "Fotos", rect: true, d: "M3 16l4-4 5 5" },
  { k: "docs", l: "Documentos", d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", d2: "M14 2v6h6" },
  { k: "apr", l: "Aprobaciones", d: "M9 12l2 2 4-4", circulo: true },
  { k: "score", l: "Proyección & Score", d: "M3 12l4-4 4 4 4-6 6 8" },
  { k: "notif", l: "Notificaciones", d: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" },
] as const;

type TabKey = (typeof TABS)[number]["k"];

const CARACTERISTICAS = [
  ["Ascensor", true], ["Balcón", true], ["Vista", true], ["Depósito", true],
  ["Cuarto de servicio", true], ["Terraza", false], ["Vigilancia 24h", true],
  ["Remodelado", true], ["Piscina", false], ["Gimnasio", false],
] as const;

const SCORE_EJES = [
  { l: "Ubicación", v: 20 }, { l: "Liquidez", v: 19 },
  { l: "Potencial valorización", v: 18 }, { l: "Riesgo jurídico", v: 20 },
  { l: "Potencial remodelación", v: 19 },
];

const PROYECCION: { k: string; v: string; color?: string }[] = [
  { k: "Compra", v: "$2.520M" },
  { k: "Remodelación (costo cerrado)", v: "$470M" },
  { k: "Legales + estructuración", v: "$110M" },
  { k: "Inversión total", v: "$3.100M" },
  { k: "Venta estimada", v: "$3.776M" },
  { k: "ROI estimado", v: "~22%", color: "var(--sage-deep)" },
];

type Doc = { n: string; vis: "pub" | "res" | "int"; act: string };
const DOCS_SEED: Doc[] = [
  { n: "Contrato de obra a costo cerrado.pdf", vis: "pub", act: "Hoy" },
  { n: "Presupuesto cerrado v3.pdf", vis: "pub", act: "Hoy" },
  { n: "Estudio de títulos.pdf", vis: "res", act: "Ayer" },
  { n: "Planos eléctricos.pdf", vis: "int", act: "3 días" },
];
const VIS: Record<Doc["vis"], string> = { pub: "Visible", res: "Al reservar", int: "Interno" };

type Log = { t: string; d: string; st: "ok" | "pend" | "sent" };
const APR_SEED: Log[] = [
  { t: "Cambio en diseño de cocina", d: "Impacto $0 · sin cambio de cronograma", st: "ok" },
  { t: "Paleta de acabados y pisos", d: "Enviado el 24 may", st: "ok" },
];
const NOTIF_SEED: Log[] = [
  { t: "Avance de obra · 78%", d: "Enviada a Natalia R. · plataforma + correo", st: "sent" },
  { t: "Documento nuevo · Presupuesto v3", d: "Hace 2 días · plataforma", st: "sent" },
];
const ST_TX: Record<Log["st"], string> = { ok: "Aprobado", pend: "Pendiente", sent: "Enviada" };

const FOTO_ICO = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 14l4-4 5 5" />
  </svg>
);
const CAMPANA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
  </svg>
);
const AVION = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
  </svg>
);
const VISTO = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4" /></svg>
);

/** Rejilla de fotos con su baldosa de subir al final. */
function Fotos({ titulo, fotos, onQuitar, onSubir, etiqueta, pie }: {
  titulo: string; fotos: string[]; onQuitar: (i: number) => void;
  onSubir: () => void; etiqueta: string; pie?: ReactNode;
}) {
  return (
    <Card className="mb">
      <SecTitle>{titulo}</SecTitle>
      <div className="photos">
        {fotos.map((c, i) => (
          <div className="pht" key={c + i}>
            {FOTO_ICO}
            <span className="cap">{c}</span>
            <button type="button" className="del" aria-label={`Quitar ${c}`} onClick={() => onQuitar(i)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        <button type="button" className="addtile" onClick={onSubir}><IcoPlus />{etiqueta}</button>
      </div>
      {pie}
    </Card>
  );
}

export default function GestionPredio() {
  const { go, av } = useConsola();
  const [tab, setTab] = useState<TabKey>("info");

  const [feats, setFeats] = useState<Record<string, boolean>>(
    Object.fromEntries(CARACTERISTICAS.map(([n, on]) => [n, on])),
  );
  const [canales, setCanales] = useState<Record<string, boolean>>({
    "En la plataforma": true, Correo: true, WhatsApp: false,
  });

  const [paso, setPaso] = useState(5);
  const [pregunta, setPregunta] = useState<string | null>(null);
  const [avance, setAvance] = useState(78);

  const [galeria, setGaleria] = useState(["Sala · 12 jun", "Cocina · 10 jun", "Baño · 08 jun"]);
  const [antes, setAntes] = useState(["ANTES · sala", "DESPUÉS · sala"]);
  const [docs, setDocs] = useState<Doc[]>(DOCS_SEED);
  const [aprs, setAprs] = useState<Log[]>(APR_SEED);
  const [notifs, setNotifs] = useState<Log[]>(NOTIF_SEED);

  const [aprT, setAprT] = useState("");
  const [aprD, setAprD] = useState("");
  const [aprC, setAprC] = useState("$0");
  const [aprCr, setAprCr] = useState("Sin cambio");
  const [ntType, setNtType] = useState("Cambio de estado del predio");
  const [ntMsg, setNtMsg] = useState("Tu obra avanzó al 78%. Ya subimos las fotos de la cocina terminada.");

  const [ejes, setEjes] = useState(SCORE_EJES.map((e) => e.v));
  const score = ejes.reduce((a, b) => a + b, 0);

  const cambiaPaso = (i: number) => {
    setPaso(i);
    setPregunta(`Estado cambiado a "${ESTADOS[i]}". ¿Notificar al inversionista?`);
  };

  return (
    <section className="view active">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="crumb">
          <button type="button" className="pnl-link" onClick={() => go("predios")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6" /></svg>
            Predios
          </button>
          <span className="sep">/</span>
          <span className="cur">La Cabrera</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <a className="btn btn-ghost" href="/predios/ficha" target="_blank" rel="noopener"><IcoEye />Vista previa</a>
          <button type="button" className="btn btn-primary" onClick={() => av("Cambios guardados")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /></svg>
            Guardar
          </button>
        </div>
      </div>

      <div className="phead">
        <div className="thumb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 9l9-6 9 6v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21V12h6v9" />
          </svg>
        </div>
        <div className="info">
          <div className="loc">La Cabrera · Bogotá · Colombia</div>
          <h1>Apartamento ultra lujo remodelado a costo cerrado</h1>
          <div className="sub">320 m² · Inversionista: Natalia R. · ID: ZQ-0142</div>
        </div>
        <div className="side-actions">
          <span className="est e-obra">{ESTADOS[paso]}{paso === 5 ? " · Semana 9/12" : ""}</span>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.k} type="button" className={`tab${tab === t.k ? " active" : ""}`} onClick={() => setTab(t.k)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {"rect" in t && t.rect && <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /></>}
              <path d={t.d} />
              {"d2" in t && t.d2 && <path d={t.d2} />}
              {"circulo" in t && t.circulo && <circle cx="12" cy="12" r="9" />}
            </svg>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ INFORMACIÓN ══════════ */}
      {tab === "info" && (
        <div className="panel active">
          <Grid cols={2}>
            <Card>
              <SecTitle>Datos del predio</SecTitle>
              <div className="fgrid">
                <div className="full">
                  <label htmlFor="g-nom">Nombre / titular del activo</label>
                  <input className="t" id="g-nom" defaultValue="Apartamento ultra lujo remodelado a costo cerrado" />
                </div>
                <div>
                  <label htmlFor="g-ciudad">Ciudad</label>
                  <select className="t" id="g-ciudad" defaultValue="Bogotá">
                    <option>Bogotá</option><option>Medellín</option><option>Cartagena</option><option>Ciudad de Panamá</option>
                  </select>
                </div>
                <div><label htmlFor="g-zona">Zona / barrio</label><input className="t" id="g-zona" defaultValue="La Cabrera" /></div>
                <div><label htmlFor="g-area">Área (m²)</label><input className="t" id="g-area" defaultValue="320" /></div>
                <div><label htmlFor="g-estrato">Estrato</label><input className="t" id="g-estrato" defaultValue="6" /></div>
                <div><label htmlFor="g-hab">Habitaciones</label><input className="t" id="g-hab" defaultValue="3" /></div>
                <div><label htmlFor="g-ban">Baños</label><input className="t" id="g-ban" defaultValue="3" /></div>
                <div><label htmlFor="g-parq">Parqueaderos</label><input className="t" id="g-parq" defaultValue="2" /></div>
                <div><label htmlFor="g-anos">Construido / Modernizado</label><input className="t" id="g-anos" defaultValue="2008 · 2024" /></div>
                <div className="full">
                  <label htmlFor="g-transf">Tipo de transformación</label>
                  <select className="t" id="g-transf" defaultValue="Reposicionamiento premium">
                    <option>Reposicionamiento premium</option><option>Remodelación completa</option>
                    <option>Cambio de distribución</option><option>División en dos unidades</option>
                  </select>
                </div>
                <div className="full">
                  <label htmlFor="g-op">La oportunidad (resumen para la ficha)</label>
                  <textarea
                    className="t" id="g-op"
                    defaultValue="Compramos por debajo del mercado en una de las zonas más demandadas de Bogotá. Remodelamos a costo cerrado con especificaciones premium y una estrategia de salida basada en comparables reales de la zona."
                  />
                </div>
              </div>
            </Card>

            <Card>
              <SecTitle>Características del inmueble</SecTitle>
              <div className="chips">
                {CARACTERISTICAS.map(([n]) => (
                  <button
                    key={n} type="button" className="chip"
                    aria-pressed={feats[n] ? "true" : "false"}
                    onClick={() => setFeats((f) => ({ ...f, [n]: !f[n] }))}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <Hint>Marca lo que aplica. Se muestran como íconos en la ficha del predio.</Hint>

              <SecTitle style={{ marginTop: 24 }}>Asignación</SecTitle>
              <div className="fgrid">
                <div>
                  <label htmlFor="g-area-resp">Área responsable</label>
                  <select className="t" id="g-area-resp" defaultValue="Arquitectura">
                    <option>Arquitectura</option><option>Data</option><option>Comercial</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="g-gestor">Gestor asignado</label>
                  <select className="t" id="g-gestor" defaultValue="Juan P. Restrepo">
                    <option>Juan P. Restrepo</option><option>Andrés Ruiz</option>
                  </select>
                </div>
                <div className="full">
                  <label htmlFor="g-inv">Inversionista asignado</label>
                  <select className="t" id="g-inv" defaultValue="Natalia R. (ZQ-0142)">
                    <option>Natalia R. (ZQ-0142)</option><option>Sin asignar</option>
                  </select>
                </div>
              </div>
            </Card>
          </Grid>

          <div className="saverow">
            <button type="button" className="btn btn-ghost">Descartar</button>
            <button type="button" className="btn btn-primary" onClick={() => av("Información del predio guardada")}>
              Guardar información
            </button>
          </div>
        </div>
      )}

      {/* ══════════ ESTADO Y PROCESO ══════════ */}
      {tab === "estado" && (
        <div className="panel active">
          <Card className="mb">
            <SecTitle>Estado del predio · confirma en qué proceso va</SecTitle>
            <div className="stepper">
              {ESTADOS.map((e, i) => (
                <button
                  key={e} type="button"
                  className={`stg${i < paso ? " done" : i === paso ? " current" : ""}`}
                  onClick={() => cambiaPaso(i)}
                >
                  <div className="bar" />
                  <div className="l">{e}</div>
                </button>
              ))}
            </div>
            {pregunta && (
              <div className="notify-prompt show">
                {CAMPANA}
                <div className="tx">{pregunta}</div>
                <button
                  type="button" className="btn btn-primary"
                  onClick={() => { setPregunta(null); av("Inversionista notificado del cambio de estado"); }}
                >
                  Notificar al inversionista
                </button>
              </div>
            )}
          </Card>

          <Grid cols={2}>
            <Card>
              <SecTitle>Avance de obra</SecTitle>
              <label htmlFor="g-sem">Semana actual</label>
              <input className="t" id="g-sem" type="number" defaultValue="9" min={1} max={12} style={{ marginBottom: 16 }} />
              <label htmlFor="g-av">Avance general: <b>{avance}</b>%</label>
              <div className="obarbar"><div className="fill" style={{ width: `${avance}%` }} /></div>
              <input
                type="range" id="g-av" min={0} max={100} value={avance}
                onChange={(e) => setAvance(Number(e.target.value))}
              />
              <label htmlFor="g-etapa" style={{ marginTop: 16 }}>Etapa actual</label>
              <select className="t" id="g-etapa" defaultValue="Carpintería y cocina">
                <option>Carpintería y cocina</option><option>Preliminares</option><option>Demolición</option>
                <option>Redes</option><option>Acabados</option><option>Entrega</option>
              </select>
            </Card>

            <Card>
              <SecTitle>Presupuesto (costo cerrado)</SecTitle>
              <div className="fgrid">
                <div><label htmlFor="g-pres">Presupuesto total</label><input className="t" id="g-pres" defaultValue="$1.350M" /></div>
                <div><label htmlFor="g-ejec">Ejecutado</label><input className="t" id="g-ejec" defaultValue="$1.240M" /></div>
              </div>
              <div style={{ marginTop: 14 }}><Frow k="% ejecutado" v="92%" /></div>
              <Frow k="Sobrecosto a cargo del inversionista" v="$0" vColor="var(--sage-deep)" />
              <Hint>El sobrecosto no estructural lo asume ZEQUARA. Cualquier cambio pasa por Aprobaciones.</Hint>
            </Card>
          </Grid>
        </div>
      )}

      {/* ══════════ FOTOS ══════════ */}
      {tab === "fotos" && (
        <div className="panel active">
          <Fotos
            titulo="Galería del avance" fotos={galeria} etiqueta="Subir foto"
            onQuitar={(i) => setGaleria((g) => g.filter((_, k) => k !== i))}
            onSubir={() => { setGaleria((g) => [...g, "Nueva · hoy"]); av("Foto subida"); }}
          />
          <Fotos
            titulo="Antes / Después (para la ficha y el portal)" fotos={antes} etiqueta="Subir par"
            onQuitar={(i) => setAntes((a) => a.filter((_, k) => k !== i))}
            onSubir={() => { setAntes((a) => [...a, "Nueva · hoy"]); av("Foto subida"); }}
            pie={<Hint>Sube el antes y el después con el mismo ángulo y encuadre; así el comparador del sitio funciona bien.</Hint>}
          />
        </div>
      )}

      {/* ══════════ DOCUMENTOS ══════════ */}
      {tab === "docs" && (
        <div className="panel active">
          <Card>
            <SecTitle>Subir documento</SecTitle>
            <button
              type="button" className="dropzone"
              onClick={() => { setDocs((d) => [{ n: "Documento nuevo.pdf", vis: "int", act: "Ahora" }, ...d]); av("Documento subido"); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
              <div className="t">Arrastra o selecciona archivos</div>
              <div className="s">PDF, XLSX, imágenes · máx. 25 MB</div>
            </button>

            <Tabla ancho="md">
              <thead>
                <tr><th>Documento</th><th>Visibilidad</th><th>Actualizado</th><th style={{ textAlign: "right" }}>Acción</th></tr>
              </thead>
              <tbody>
                {docs.map((d, i) => (
                  <tr key={d.n + i}>
                    <td>{d.n}</td>
                    <td><span className={`vis vis-${d.vis}`}>{VIS[d.vis]}</span></td>
                    <td>{d.act}</td>
                    <td style={{ textAlign: "right" }}>
                      <button type="button" className="iconbtn" aria-label={`Quitar ${d.n}`} onClick={() => setDocs((ds) => ds.filter((_, k) => k !== i))}>
                        <IcoTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
            <Hint>
              La visibilidad controla si el inversionista ve el documento siempre, solo al reservar, o si
              queda interno del equipo.
            </Hint>
          </Card>
        </div>
      )}

      {/* ══════════ APROBACIONES ══════════ */}
      {tab === "apr" && (
        <div className="panel active">
          <Grid cols={2}>
            <Card>
              <SecTitle>Enviar cambio para aprobación del inversionista</SecTitle>
              <label htmlFor="g-aprt">Título del cambio</label>
              <input className="t" id="g-aprt" placeholder="Ej.: Cambio en diseño de cocina" style={{ marginBottom: 14 }} value={aprT} onChange={(e) => setAprT(e.target.value)} />
              <label htmlFor="g-aprd">Descripción</label>
              <textarea className="t" id="g-aprd" placeholder="Explica el cambio y su justificación…" style={{ marginBottom: 14 }} value={aprD} onChange={(e) => setAprD(e.target.value)} />
              <div className="fgrid">
                <div><label htmlFor="g-aprc">Impacto en costo</label><input className="t" id="g-aprc" value={aprC} onChange={(e) => setAprC(e.target.value)} /></div>
                <div><label htmlFor="g-aprcr">Impacto en cronograma</label><input className="t" id="g-aprcr" value={aprCr} onChange={(e) => setAprCr(e.target.value)} /></div>
              </div>
              <div className="saverow">
                <button
                  type="button" className="btn btn-primary"
                  onClick={() => {
                    setAprs((l) => [{ t: aprT.trim() || "Cambio sin título", d: `Impacto ${aprC} · ${aprCr}`, st: "pend" }, ...l]);
                    setAprT(""); setAprD("");
                    av("Enviado al inversionista para aprobación");
                  }}
                >
                  {AVION}Enviar al inversionista
                </button>
              </div>
            </Card>

            <Card>
              <SecTitle>Aprobaciones enviadas</SecTitle>
              {aprs.map((l, i) => (
                <div className="logitem" key={l.t + i}>
                  <div className="mk">{VISTO}</div>
                  <div className="c"><div className="t">{l.t}</div><div className="d">{l.d}</div></div>
                  <span className={`st st-${l.st}`}>{ST_TX[l.st]}</span>
                </div>
              ))}
            </Card>
          </Grid>
        </div>
      )}

      {/* ══════════ PROYECCIÓN & SCORE ══════════ */}
      {tab === "score" && (
        <div className="panel active">
          <Grid cols={2}>
            <Card>
              <SecTitle>Score ZEQUARA</SecTitle>
              {SCORE_EJES.map((e, i) => (
                <div className="scorerow" key={e.l}>
                  <span className="lab">{e.l}</span>
                  <input
                    type="range" min={0} max={20} value={ejes[i]} aria-label={e.l}
                    onChange={(ev) => setEjes((xs) => xs.map((x, k) => k === i ? Number(ev.target.value) : x))}
                  />
                  <span className="val">{ejes[i]}</span>
                </div>
              ))}
              <div className="scoretotal">
                <Ring v={score}><i>{score}</i></Ring>
                <Hint style={{ margin: 0 }}>Score que se publica en la ficha y en el portal privado.</Hint>
              </div>
            </Card>

            <Card>
              <SecTitle>Proyección financiera</SecTitle>
              {PROYECCION.map((f) => <Frow key={f.k} k={f.k} v={f.v} vColor={f.color} />)}
              <Hint>Estas cifras alimentan la proyección de la ficha y de la plataforma del inversionista.</Hint>
            </Card>
          </Grid>
        </div>
      )}

      {/* ══════════ NOTIFICACIONES ══════════ */}
      {tab === "notif" && (
        <div className="panel active">
          <Grid cols={2}>
            <Card>
              <SecTitle>Notificar cambio al inversionista</SecTitle>
              <label htmlFor="g-nt">Tipo de notificación</label>
              <select className="t" id="g-nt" style={{ marginBottom: 14 }} value={ntType} onChange={(e) => setNtType(e.target.value)}>
                <option>Cambio de estado del predio</option><option>Avance de obra</option>
                <option>Documento nuevo disponible</option><option>Aprobación requerida</option>
                <option>Foto nueva</option><option>Mensaje del gestor</option>
              </select>
              <label htmlFor="g-ntmsg">Mensaje</label>
              <textarea
                className="t" id="g-ntmsg" style={{ marginBottom: 14 }}
                placeholder="Escribe el mensaje que verá el inversionista…"
                value={ntMsg} onChange={(e) => setNtMsg(e.target.value)}
              />
              <label>Canales</label>
              <div className="chips" style={{ marginBottom: 6 }}>
                {Object.keys(canales).map((c) => (
                  <button
                    key={c} type="button" className="chip"
                    aria-pressed={canales[c] ? "true" : "false"}
                    onClick={() => setCanales((x) => ({ ...x, [c]: !x[c] }))}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="saverow">
                <button
                  type="button" className="btn btn-primary"
                  onClick={() => {
                    setNotifs((l) => [{ t: ntType, d: "Enviada a Natalia R. · ahora", st: "sent" }, ...l]);
                    av("Notificación enviada al inversionista");
                  }}
                >
                  {AVION}Enviar notificación
                </button>
              </div>
            </Card>

            <Card>
              <SecTitle>Historial de notificaciones</SecTitle>
              {notifs.map((l, i) => (
                <div className="logitem" key={l.t + i}>
                  <div className="mk">{CAMPANA}</div>
                  <div className="c"><div className="t">{l.t}</div><div className="d">{l.d}</div></div>
                  <span className={`st st-${l.st}`}>{ST_TX[l.st]}</span>
                </div>
              ))}
            </Card>
          </Grid>
        </div>
      )}
    </section>
  );
}
