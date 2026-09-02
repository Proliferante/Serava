"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import { useSesion } from "@/components/admin/sesion";
import { CSV_SCRAPING, TRANSFORMACIONES } from "@/components/admin/data";
import { Card, Hint, IcoCheck, IcoDown, IcoExt, SecTitle, Tabla } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   FLUJO DE INMUEBLES — del scraping a la publicación.

   Seis pestañas que son una sola bandeja vista por etapas. El dato tiene
   cinco estados, no seis: las pestañas 1 y 2 miran las dos la etapa `nuevo`,
   porque son dos lecturas de lo mismo —lo que trajo el scraping, y lo que
   hay que decidir uno por uno—. Los contadores de esas dos coinciden a
   propósito.

   El recorrido: nuevo → preselección (continúa) → visita (agendada) →
   publicado (completado tras la visita). En cualquier punto se puede
   descartar, y el descarte queda con su motivo en la pestaña de registro.
   Eso es lo que hace que un inmueble descartado no vuelva a entrar en los
   scrapings siguientes: el estado vive en `seguimiento_propiedades`, que el
   pipeline lee pero nunca reconstruye.

   DE DÓNDE SALEN LOS DATOS
   Del backend: `GET /api/admin/flujo?etapa=` para el listado y
   `/flujo/conteos` para los números de las pestañas. Las tres acciones
   —decidir, agendar, completar— son peticiones que escriben en la base y
   devuelven; después se recarga la etapa. No hay estado optimista a
   propósito: si el servidor rechaza una decisión (porque el inmueble ya no
   cumple los criterios, por ejemplo), la pantalla no debe haber mentido
   antes de saberlo.
   ═══════════════════════════════════════════════════════════════════════════ */

type PanelKey = "p1" | "p2" | "p3" | "p4" | "p5" | "p6";
type Etapa = "nuevo" | "preseleccion" | "visita" | "publicado" | "descartado";

/** Qué etapa del dato alimenta cada pestaña. */
const FUENTE: Record<PanelKey, Etapa> = {
  p1: "nuevo", p2: "nuevo", p3: "preseleccion",
  p4: "visita", p5: "publicado", p6: "descartado",
};

const PESTANAS: { k: PanelKey; l: string }[] = [
  { k: "p1", l: "1 · Del scraping" },
  { k: "p2", l: "2 · Revisión inicial" },
  { k: "p3", l: "3 · Preseleccionados" },
  { k: "p4", l: "4 · Visita agendada" },
  { k: "p5", l: "5 · Publicados" },
  { k: "p6", l: "Descartados" },
];

/** Un inmueble como lo devuelve el backend (clean_listings + estado). */
type Inmueble = {
  link: string;
  titulo: string | null;
  zona: string;
  ciudad: string;
  pais: string;
  moneda: string;
  portal: string;
  tipo_inmueble: string | null;
  precio_venta: number | null;
  area_m2: number | null;
  precio_m2: number | null;
  mediana_precio_m2_zona: number | null;
  habitaciones: number | null;
  banos: number | null;
  precio_m2_clasificacion: string | null;
  fecha_extraccion: string | null;
  etapa: Etapa;
  motivo_no_pasa: string | null;
  motivo_no_disponible: string | null;
  contacto_nombre: string | null;
  contacto_telefono: string | null;
  visita_fecha: string | null;
  visita_hora: string | null;
  area_confirmada_m2: number | null;
};

const trazo = {
  fill: "none", stroke: "currentColor", strokeWidth: 1.9,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};

const IcoInfo = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M12 16v-4M12 8h.01" /><circle cx="12" cy="12" r="9" /></svg>;
const IcoReloj = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></svg>;
const IcoVisto = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>;
const IcoWa = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.3A8.5 8.5 0 1 1 21 11.5z" /></svg>;
const IcoTel = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.7 18.7 0 0 1-5.7-5.7 19 19 0 0 1-3-8.4A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" /></svg>;
const IcoCal = () => <svg viewBox="0 0 24 24" {...trazo}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>;
const IcoFlecha = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

function Nota({ ico, children }: { ico: ReactNode; children: ReactNode }) {
  return <div className="auto-note">{ico}<p>{children}</p></div>;
}

function Vacio({ children }: { children: ReactNode }) {
  return <Card><div className="empty">{children}</div></Card>;
}

function Info({ x }: { x: Inmueble }) {
  return (
    <>
      <div className="pname">{x.titulo || "(sin título)"}</div>
      <div className="pzone">{x.zona} · {x.ciudad}</div>
    </>
  );
}

function Url({ x, texto = "Ver publicación" }: { x: Inmueble; texto?: string }) {
  return (
    <a className="urllink" href={x.link} target="_blank" rel="noopener">
      {texto} <IcoExt />
    </a>
  );
}

/* Precio en millones cuando es peso, entero cuando es dólar: los dos números
   con la misma notación harían que $1.400M y US$1.400 se leyeran igual. */
const precio = (x: Inmueble) => {
  if (x.precio_venta == null) return "—";
  return x.moneda === "COP"
    ? "$" + (x.precio_venta / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 0 }) + "M"
    : "US$" + Math.round(x.precio_venta).toLocaleString("es-CO");
};

const pm2 = (v: number | null, moneda: string) => {
  if (v == null) return "—";
  return moneda === "COP"
    ? "$" + (v / 1e6).toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "M"
    : "US$" + Math.round(v).toLocaleString("es-CO");
};

/* ── Modales ─────────────────────────────────────────────────────────────── */

function FormVisita({ x, onGuardar, onCancelar }: {
  x: Inmueble;
  onGuardar: (d: { fecha: string; hora: string; contacto_nombre: string; contacto_telefono: string; notas: string }) => void;
  onCancelar: () => void;
}) {
  const [fecha, setFecha] = useState(x.visita_fecha ?? "");
  const [hora, setHora] = useState(x.visita_hora ?? "");
  const [contacto, setContacto] = useState(x.contacto_nombre ?? "");
  const [tel, setTel] = useState(x.contacto_telefono ?? "");
  const [notas, setNotas] = useState("");
  return (
    <>
      <MCuerpo>
        <label htmlFor="v-fecha">Fecha</label>
        <input className="t" id="v-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <label htmlFor="v-hora">Hora</label>
        <input className="t" id="v-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        <label htmlFor="v-cont">Contacto (nombre)</label>
        <input className="t" id="v-cont" placeholder="Propietario / inmobiliaria" value={contacto} onChange={(e) => setContacto(e.target.value)} />
        <label htmlFor="v-tel">Teléfono</label>
        <input className="t" id="v-tel" placeholder="300 123 4567" value={tel} onChange={(e) => setTel(e.target.value)} />
        <label htmlFor="v-notas">Notas</label>
        <textarea className="t" id="v-notas" placeholder="Qué revisar en la visita…" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button
          type="button" className="btn btn-primary"
          onClick={() => onGuardar({ fecha, hora, contacto_nombre: contacto, contacto_telefono: tel, notas })}
        >
          Agendar
        </button>
      </MPie>
    </>
  );
}

function FormCompletar({ x, onPublicar, onCancelar }: {
  x: Inmueble;
  onPublicar: (d: { titulo: string; habitaciones: string; banos: string; area: string; tipo: string; notas: string }) => void;
  onCancelar: () => void;
}) {
  const [titulo, setTitulo] = useState(x.titulo ?? "");
  const [hab, setHab] = useState(x.habitaciones != null ? String(x.habitaciones) : "");
  const [ban, setBan] = useState(x.banos != null ? String(x.banos) : "");
  const [area, setArea] = useState(
    x.area_confirmada_m2 != null ? String(x.area_confirmada_m2)
    : x.area_m2 != null ? String(x.area_m2) : "",
  );
  const [tipo, setTipo] = useState(TRANSFORMACIONES[0]);
  const [notas, setNotas] = useState("");
  return (
    <>
      <MCuerpo>
        <label htmlFor="c-t">Título del inmueble</label>
        <input className="t" id="c-t" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <label htmlFor="c-hab">Habitaciones</label>
        <input className="t" id="c-hab" type="number" placeholder="3" value={hab} onChange={(e) => setHab(e.target.value)} />
        <label htmlFor="c-ban">Baños</label>
        <input className="t" id="c-ban" type="number" placeholder="3" value={ban} onChange={(e) => setBan(e.target.value)} />
        <label htmlFor="c-m2">Área confirmada (m²)</label>
        <input className="t" id="c-m2" type="number" value={area} onChange={(e) => setArea(e.target.value)} />
        <label htmlFor="c-tr">Tipo de transformación</label>
        <select className="t" id="c-tr" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TRANSFORMACIONES.map((o) => <option key={o}>{o}</option>)}
        </select>
        <label htmlFor="c-notas">Notas de la visita</label>
        <textarea className="t" id="c-notas" placeholder="Estado, hallazgos, potencial…" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button
          type="button" className="btn btn-primary"
          onClick={() => onPublicar({ titulo, habitaciones: hab, banos: ban, area, tipo, notas })}
        >
          <IcoCheck />Publicar
        </button>
      </MPie>
    </>
  );
}

/** Modal de descarte: el motivo es obligatorio y queda en la base. */
function FormDescartar({ x, etiqueta, onConfirmar, onCancelar }: {
  x: Inmueble; etiqueta: string;
  onConfirmar: (motivo: string) => void; onCancelar: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  return (
    <>
      <MCuerpo>
        <p style={{ fontSize: ".88rem", color: "var(--mocha)", fontWeight: 300 }}>
          <b style={{ color: "var(--coffee)" }}>{x.titulo || x.zona}</b> deja el flujo y queda
          registrado: no volverá a aparecer en futuros scrapings.
        </p>
        <label htmlFor="d-motivo">Motivo (obligatorio)</label>
        <textarea
          className="t" id="d-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}
          placeholder="Por qué no continúa. Queda guardado junto al descarte."
        />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button
          type="button" className="btn btn-primary" disabled={!motivo.trim()}
          onClick={() => onConfirmar(motivo.trim())}
        >
          {etiqueta}
        </button>
      </MPie>
    </>
  );
}

/* ── Vista ───────────────────────────────────────────────────────────────── */

export default function FlujoInmuebles() {
  const { av, modal } = useConsola();
  const { pedir } = useSesion();

  const [panel, setPanel] = useState<PanelKey>("p1");
  const [filas, setFilas] = useState<Inmueble[]>([]);
  const [conteos, setConteos] = useState<Record<Etapa, number> | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const etapa = FUENTE[panel];

  const cargar = useCallback(async (e: Etapa) => {
    setCargando(true);
    setError(null);
    try {
      const [lista, n] = await Promise.all([
        pedir<{ filas: Inmueble[] }>(`/api/admin/flujo?etapa=${e}`),
        pedir<Record<Etapa, number>>("/api/admin/flujo/conteos"),
      ]);
      setFilas(lista.filas);
      setConteos(n);
    } catch (err) {
      setFilas([]);
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }, [pedir]);

  useEffect(() => { void cargar(etapa); }, [etapa, cargar]);

  /** Cualquier acción: la ejecuta, avisa y recarga la etapa visible. */
  const accion = async (ruta: string, cuerpo: object, aviso: string, irA?: PanelKey) => {
    try {
      await pedir(ruta, { method: "POST", body: JSON.stringify(cuerpo) });
      av(aviso);
      if (irA) setPanel(irA); else await cargar(etapa);
    } catch (err) {
      av((err as Error).message);
    }
  };

  const decidir = (x: Inmueble, decision: string, motivo: string | null, aviso: string) =>
    accion("/api/admin/flujo/decidir", { links: [x.link], decision, motivo }, aviso);

  const descartar = (x: Inmueble, decision: "no_continua" | "no_disponible", titulo: string, etiqueta: string) => {
    modal(titulo, (cierra) => (
      <FormDescartar
        x={x} etiqueta={etiqueta} onCancelar={cierra}
        onConfirmar={async (motivo) => {
          cierra();
          await decidir(x, decision, motivo, "Registrado · no reingresará");
        }}
      />
    ));
  };

  const soloDigitos = (t: string | null) => (t || "").replace(/\D/g, "");

  const whatsapp = (x: Inmueble) => {
    const tel = soloDigitos(x.contacto_telefono);
    if (!tel) {
      av("Este inmueble no tiene teléfono guardado. Agrégalo al agendar la visita.");
      return;
    }
    const texto = `Hola, le contacto de ZEQUARA por el inmueble en ${x.zona}, ${x.ciudad}.`;
    window.open(`https://wa.me/57${tel}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  };

  const agendar = (x: Inmueble) => {
    modal("Agendar visita · " + x.zona, (cierra) => (
      <FormVisita
        x={x} onCancelar={cierra}
        onGuardar={async (d) => {
          cierra();
          await accion("/api/admin/flujo/visita", { link: x.link, ...d }, "Visita agendada", "p4");
        }}
      />
    ));
  };

  const completar = (x: Inmueble) => {
    modal("Completar información · " + x.zona, (cierra) => (
      <FormCompletar
        x={x} onCancelar={cierra}
        onPublicar={async (d) => {
          cierra();
          await accion("/api/admin/flujo/completar", {
            link: x.link,
            titulo: d.titulo || null,
            habitaciones: d.habitaciones ? Number(d.habitaciones) : null,
            banos: d.banos ? Number(d.banos) : null,
            area_confirmada_m2: d.area ? Number(d.area) : null,
            tipo_transformacion: d.tipo,
            notas_visita: d.notas || null,
          }, "Inmueble publicado", "p5");
        }}
      />
    ));
  };

  const automatizar = () => {
    modal("Automatización de contacto", (cierra) => (
      <>
        <MCuerpo>
          <p style={{ fontSize: ".86rem", color: "var(--mocha)", fontWeight: 300 }}>
            El contacto y la validación de preseleccionados podrán automatizarse: envío de mensajes
            de WhatsApp con plantilla, registro de respuestas y agendamiento asistido.
          </p>
          <label htmlFor="au-est" style={{ marginTop: 14 }}>Estado</label>
          <input className="t" id="au-est" value="En diseño · disponible próximamente" disabled style={{ opacity: .6 }} />
          <label htmlFor="au-pl" style={{ marginTop: 12 }}>Plantilla de primer contacto</label>
          <textarea
            className="t" id="au-pl" disabled style={{ opacity: .7 }}
            value="Hola, le escribimos de ZEQUARA. Estamos interesados en su inmueble en {zona}. ¿Podríamos coordinar una visita?"
          />
        </MCuerpo>
        <MPie>
          <button type="button" className="btn btn-ghost" onClick={cierra}>Cerrar</button>
        </MPie>
      </>
    ));
  };

  /** CSV de lo que trajo el scraping — pantalla 1 del correo. */
  const descargar = () => {
    if (!filas.length) { av("No hay inmuebles para descargar"); return; }
    const cita = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const lineas = [CSV_SCRAPING.join(",")].concat(
      filas.map((r) => [
        r.titulo, r.zona, r.ciudad, r.precio_venta, r.area_m2, r.precio_m2, r.link,
      ].map(cita).join(",")),
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + lineas.join("\n")], { type: "text/csv;charset=utf-8;" }));
    a.download = "zequara_scraping_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    av(`Listado descargado (${filas.length} inmuebles)`);
  };

  /* Resumen de la pestaña 1, calculado sobre lo que se está viendo. */
  const conPm2 = filas.filter((x) => x.precio_m2 != null);
  const medio = conPm2.length
    ? conPm2.reduce((a, x) => a + (x.precio_m2 as number), 0) / conPm2.length
    : null;
  const ciudades = new Set(filas.map((x) => x.ciudad)).size;

  /** Cabecera de estado compartida por las seis pestañas. */
  const estado = () => {
    if (cargando) return <Vacio>Cargando…</Vacio>;
    if (error) {
      return (
        <Card>
          <div className="empty">
            <b style={{ color: "var(--terra)" }}>No se pudo leer el flujo.</b>
            <br />{error}
          </div>
        </Card>
      );
    }
    return null;
  };

  return (
    <section className="view active">
      <div className="vhead">
        <div>
          <h1>Flujo de <b>inmuebles</b></h1>
          <p>
            Del scraping a la publicación. Cada inmueble avanza por etapas; lo que se descarta queda
            registrado para no reingresar en futuros scrapings.
          </p>
        </div>
      </div>

      <div className="flow-tabs">
        {PESTANAS.map((p) => (
          <button
            key={p.k} type="button"
            className={`flow-tab${panel === p.k ? " active" : ""}`}
            onClick={() => setPanel(p.k)}
          >
            {p.l} <span className="cnt">{conteos ? conteos[FUENTE[p.k]] ?? 0 : "—"}</span>
          </button>
        ))}
      </div>

      {/* ══════════ 1 · DEL SCRAPING ══════════ */}
      {panel === "p1" && (
        <div className="flow-panel active">
          {estado() ?? (!filas.length ? <Vacio>No hay inmuebles nuevos del scraping.</Vacio> : (
            <Card>
              <SecTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Resultado del último scraping
                <button type="button" className="btn btn-primary btn-mini" onClick={descargar}>
                  <IcoDown />Descargar listado (CSV)
                </button>
              </SecTitle>

              <div className="flow-sum">
                <div className="it"><div className="k">Inmuebles</div><div className="v">{filas.length}</div></div>
                <div className="it">
                  <div className="k">$/m² medio</div>
                  <div className="v">{medio != null ? pm2(medio, filas[0].moneda) : "—"}</div>
                </div>
                <div className="it"><div className="k">Ciudades</div><div className="v">{ciudades}</div></div>
              </div>

              <Tabla ancho="md">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">Precio</th><th className="num">m²</th>
                    <th className="num">$/m²</th><th>Scraping</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((x) => (
                    <tr key={x.link}>
                      <td><Info x={x} /></td>
                      <td className="num">{precio(x)}</td>
                      <td className="num">{x.area_m2 ?? "—"}</td>
                      <td className="num">{pm2(x.precio_m2, x.moneda)}</td>
                      <td>{(x.fecha_extraccion || "").slice(0, 10) || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ 2 · REVISIÓN INICIAL ══════════ */}
      {panel === "p2" && (
        <div className="flow-panel active">
          <Nota ico={<IcoInfo />}>
            Abre la publicación original para revisar las variables y decide. Lo que marques como{" "}
            <b>No continúa</b> queda registrado para no reingresar en futuros scrapings.
          </Nota>

          {estado() ?? (!filas.length ? <Vacio>Nada por revisar.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">$/m²</th><th>Publicación</th>
                    <th style={{ textAlign: "right" }}>Decisión</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((x) => (
                    <tr key={x.link}>
                      <td><Info x={x} /></td>
                      <td className="num">{pm2(x.precio_m2, x.moneda)}</td>
                      <td><Url x={x} /></td>
                      <td>
                        <div className="tacts-wrap">
                          <button
                            type="button" className="btn btn-primary btn-mini"
                            onClick={() => decidir(x, "continua", null, "Pasa a preseleccionados")}
                          >
                            <IcoCheck />Continúa
                          </button>
                          <button
                            type="button" className="btn btn-ghost btn-mini"
                            onClick={() => descartar(x, "no_continua", "No continúa en revisión inicial", "Registrar descarte")}
                          >
                            No continúa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ 3 · PRESELECCIONADOS ══════════ */}
      {panel === "p3" && (
        <div className="flow-panel active">
          <Nota ico={<IcoReloj />}>
            Contacta por WhatsApp o teléfono y agenda la visita.{" "}
            <b>Este contacto y validación se automatizará;</b> por ahora es manual.{" "}
            <button
              type="button" className="pnl-link"
              style={{ color: "var(--blue)", fontWeight: 600 }}
              onClick={automatizar}
            >
              Ver automatización
            </button>
          </Nota>

          {estado() ?? (!filas.length ? <Vacio>No hay inmuebles preseleccionados.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="lg">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">Precio</th><th>Contacto</th>
                    <th style={{ textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((x) => {
                    const tel = soloDigitos(x.contacto_telefono);
                    return (
                      <tr key={x.link}>
                        <td><Info x={x} /></td>
                        <td className="num">{precio(x)}</td>
                        <td>
                          <div className="tacts-wrap">
                            <button type="button" className="btn btn-wa btn-mini" onClick={() => whatsapp(x)}>
                              <IcoWa />WhatsApp
                            </button>
                            {tel
                              ? <a className="btn btn-ghost btn-mini" href={`tel:+57${tel}`}><IcoTel />Llamar</a>
                              : <span className="pzone">Sin teléfono</span>}
                          </div>
                        </td>
                        <td>
                          <div className="tacts-wrap">
                            <button type="button" className="btn btn-primary btn-mini" onClick={() => agendar(x)}>
                              <IcoCal />Agendar visita
                            </button>
                            <button
                              type="button" className="btn btn-ghost btn-mini"
                              onClick={() => descartar(x, "no_disponible", "Marcar como no disponible", "Registrar")}
                            >
                              No disponible
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tabla>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ 4 · VISITA AGENDADA ══════════ */}
      {panel === "p4" && (
        <div className="flow-panel active">
          {estado() ?? (!filas.length ? <Vacio>No hay visitas agendadas.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr><th>Inmueble</th><th>Visita</th><th style={{ textAlign: "right" }}>Tras la visita</th></tr>
                </thead>
                <tbody>
                  {filas.map((x) => (
                    <tr key={x.link}>
                      <td><Info x={x} /></td>
                      <td>
                        <span className="est e-vis">
                          {x.visita_fecha
                            ? `${x.visita_fecha}${x.visita_hora ? " · " + x.visita_hora : ""}`
                            : "Por confirmar"}
                        </span>
                      </td>
                      <td>
                        <div className="tacts-wrap">
                          <button type="button" className="btn btn-primary btn-mini" onClick={() => completar(x)}>
                            <IcoCheck />Continúa · completar
                          </button>
                          <button
                            type="button" className="btn btn-ghost btn-mini"
                            onClick={() => descartar(x, "no_continua", "Descartado tras la visita", "Registrar descarte")}
                          >
                            No continúa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ 5 · PUBLICADOS ══════════ */}
      {panel === "p5" && (
        <div className="flow-panel active">
          {estado() ?? (!filas.length ? <Vacio>Aún no hay inmuebles publicados.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">Precio</th><th className="num">m²</th>
                    <th>Estado</th><th style={{ textAlign: "right" }}>Publicación</th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((x) => (
                    <tr key={x.link}>
                      <td><Info x={x} /></td>
                      <td className="num">{precio(x)}</td>
                      <td className="num">{x.area_confirmada_m2 ?? x.area_m2 ?? "—"}</td>
                      <td><span className="est e-pub">Publicado</span></td>
                      <td style={{ textAlign: "right" }}>
                        <Url x={x} texto="Ver original" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
              <Hint>
                Desde aquí se conectan con el proceso de clientes y con el resto de la plataforma,
                que es el siguiente paso del backend. <IcoFlecha />
              </Hint>
            </Card>
          ))}
        </div>
      )}

      {/* ══════════ DESCARTADOS ══════════ */}
      {panel === "p6" && (
        <div className="flow-panel active">
          <Nota ico={<IcoVisto />}>
            Registro de descartados. Estos inmuebles <b>no volverán a aparecer</b> en futuros scrapings.
          </Nota>

          {estado() ?? (!filas.length ? <Vacio>No hay inmuebles descartados.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr><th>Inmueble</th><th>Motivo</th><th>Publicación</th></tr>
                </thead>
                <tbody>
                  {filas.map((x) => (
                    <tr key={x.link}>
                      <td><Info x={x} /></td>
                      <td>
                        <span className="est e-desc">
                          {x.motivo_no_pasa || x.motivo_no_disponible || "Descartado"}
                        </span>
                      </td>
                      <td><Url x={x} texto="Ver" /></td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
