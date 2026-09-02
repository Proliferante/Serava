"use client";

import { useState, type ReactNode } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import {
  CSV_SCRAPING, INMUEBLES_SEED, TRANSFORMACIONES,
  type FlujoStage, type Inmueble, type Predio,
} from "@/components/admin/data";
import { Card, IcoCheck, IcoDown, IcoExt, SecTitle, Tabla } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   FLUJO DE INMUEBLES — del scraping a la publicación.

   Seis pestañas que son una sola bandeja vista por etapas. El dato tiene cinco
   estados, no seis: las pestañas 1 y 2 miran las dos el estado `nuevo`, porque
   son dos lecturas de lo mismo —lo que trajo el scraping, y lo que hay que
   decidir uno por uno—. Los contadores de esas dos pestañas coinciden a
   propósito.

   El recorrido: nuevo → preselección (continúa) → visita (agendada) →
   publicado (completado tras la visita). En cualquier punto se puede descartar,
   y el descarte queda con su motivo en la pestaña de registro. Eso es lo que
   promete la nota: un inmueble descartado no vuelve a entrar en los scrapings
   siguientes.

   Hoy los ocho inmuebles son de maqueta y viven en memoria. Cuando el backend
   exponga el flujo, `INMUEBLES_SEED` se reemplaza por la llamada y las cinco
   acciones pasan a ser peticiones; la estructura de la pantalla no cambia.
   ═══════════════════════════════════════════════════════════════════════════ */

type PanelKey = "p1" | "p2" | "p3" | "p4" | "p5" | "p6";

/** Qué estado del dato alimenta cada pestaña. */
const FUENTE: Record<PanelKey, FlujoStage> = {
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

/** Nota azul de contexto que encabeza tres de las pestañas. */
function Nota({ ico, children }: { ico: ReactNode; children: ReactNode }) {
  return <div className="auto-note">{ico}<p>{children}</p></div>;
}

function Vacio({ children }: { children: string }) {
  return <Card><div className="empty">{children}</div></Card>;
}

/** Nombre del inmueble con su zona y ciudad debajo, en la primera columna. */
function Info({ x }: { x: Inmueble }) {
  return (
    <>
      <div className="pname">{x.t}</div>
      <div className="pzone">{x.zona} · {x.city}</div>
    </>
  );
}

function Url({ x, texto = "Ver publicación" }: { x: Inmueble; texto?: string }) {
  return (
    <a className="urllink" href={x.url} target="_blank" rel="noopener">
      {texto} <IcoExt />
    </a>
  );
}

const precio = (x: Inmueble) => "$" + x.precio.toLocaleString("es-CO") + "M";

/* ── Modales ─────────────────────────────────────────────────────────────── */

/** Agendar la visita. La cita y el teléfono vuelven al inmueble. */
function FormVisita({ x, onGuardar, onCancelar }: {
  x: Inmueble; onGuardar: (cita: string, tel: string) => void; onCancelar: () => void;
}) {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [contacto, setContacto] = useState("");
  const [tel, setTel] = useState(x.tel ?? "");
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
          onClick={() => onGuardar((fecha || "Por confirmar") + (hora ? " · " + hora : ""), tel)}
        >
          Agendar
        </button>
      </MPie>
    </>
  );
}

/** Completar la información tras la visita y publicar. */
function FormCompletar({ x, onPublicar, onCancelar }: {
  x: Inmueble; onPublicar: (titulo: string, m2: number) => void; onCancelar: () => void;
}) {
  const [t, setT] = useState(x.t);
  const [hab, setHab] = useState("");
  const [ban, setBan] = useState("");
  const [m2, setM2] = useState(String(x.m2));
  const [tr, setTr] = useState(TRANSFORMACIONES[0]);
  const [notas, setNotas] = useState("");
  return (
    <>
      <MCuerpo>
        <label htmlFor="c-t">Título del inmueble</label>
        <input className="t" id="c-t" value={t} onChange={(e) => setT(e.target.value)} />
        <label htmlFor="c-hab">Habitaciones</label>
        <input className="t" id="c-hab" type="number" placeholder="3" value={hab} onChange={(e) => setHab(e.target.value)} />
        <label htmlFor="c-ban">Baños</label>
        <input className="t" id="c-ban" type="number" placeholder="3" value={ban} onChange={(e) => setBan(e.target.value)} />
        <label htmlFor="c-m2">Área confirmada (m²)</label>
        <input className="t" id="c-m2" type="number" value={m2} onChange={(e) => setM2(e.target.value)} />
        <label htmlFor="c-tr">Tipo de transformación</label>
        <select className="t" id="c-tr" value={tr} onChange={(e) => setTr(e.target.value)}>
          {TRANSFORMACIONES.map((o) => <option key={o}>{o}</option>)}
        </select>
        <label htmlFor="c-notas">Notas de la visita</label>
        <textarea className="t" id="c-notas" placeholder="Estado, hallazgos, potencial…" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={() => onPublicar(t, Number(m2) || x.m2)}>
          <IcoCheck />Publicar
        </button>
      </MPie>
    </>
  );
}

export default function FlujoInmuebles({ onCrearFicha }: { onCrearFicha: (p: Predio) => void }) {
  const { go, av, modal } = useConsola();
  const [panel, setPanel] = useState<PanelKey>("p1");
  const [inm, setInm] = useState<Inmueble[]>(INMUEBLES_SEED);

  const de = (s: FlujoStage) => inm.filter((x) => x.stage === s);
  const nuevos = de("nuevo");

  const cambia = (id: string, parche: Partial<Inmueble>) =>
    setInm((xs) => xs.map((x) => x.id === id ? { ...x, ...parche } : x));

  const descartar = (x: Inmueble, motivo: string) => {
    cambia(x.id, { stage: "descartado", motivo });
    av("Registrado como descartado · no reingresará");
  };

  /** El teléfono va sin formato al enlace; el prefijo de país lo pone `wa.me`. */
  const soloDigitos = (t?: string) => (t || "3001234567").replace(/\D/g, "");

  const whatsapp = (x: Inmueble) => {
    const texto = `Hola, le contacto de ZEQUARA por el inmueble en ${x.zona}, ${x.city}.`;
    window.open(`https://wa.me/57${soloDigitos(x.tel)}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  };

  const agendar = (x: Inmueble) => {
    modal("Agendar visita · " + x.zona, (cierra) => (
      <FormVisita
        x={x} onCancelar={cierra}
        onGuardar={(cita, tel) => {
          cambia(x.id, { stage: "visita", cita, ...(tel ? { tel } : {}) });
          cierra();
          setPanel("p4");
          av("Visita agendada");
        }}
      />
    ));
  };

  const completar = (x: Inmueble) => {
    modal("Completar información · " + x.zona, (cierra) => (
      <FormCompletar
        x={x} onCancelar={cierra}
        onPublicar={(t, m2) => {
          cambia(x.id, { stage: "publicado", t, m2 });
          cierra();
          setPanel("p5");
          av("Inmueble publicado");
        }}
      />
    ));
  };

  /** Manda el inmueble a Predios como borrador y salta allá. */
  const crearFicha = (x: Inmueble) => {
    onCrearFicha({
      id: "fl_" + x.id,
      nombre: x.t.slice(0, 40),
      zona: `${x.zona} · ${x.city}`,
      est: "bor", score: "—", inversion: precio(x),
      area: "arq", city: x.city, publicado: false, link: x.url,
    });
    av(`"${x.zona}" enviado a Predios como borrador`);
    window.setTimeout(() => go("predios"), 700);
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

  const descargar = () => {
    if (!nuevos.length) { av("No hay inmuebles para descargar"); return; }
    const cita = (v: string | number) => '"' + String(v).replace(/"/g, '""') + '"';
    const lineas = [CSV_SCRAPING.join(",")].concat(
      nuevos.map((r) => [r.t, r.zona, r.city, r.precio, r.m2, r.ppm, r.url].map(cita).join(",")),
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + lineas.join("\n")], { type: "text/csv;charset=utf-8;" }));
    a.download = "zequara_scraping_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    av(`Listado descargado (${nuevos.length} inmuebles)`);
  };

  /* $/m² medio de lo que trajo el scraping, para la tira de resumen. */
  const medio = nuevos.length
    ? (nuevos.reduce((a, x) => a + x.ppm, 0) / nuevos.length).toFixed(1)
    : "0";
  const ciudades = new Set(nuevos.map((x) => x.city)).size;

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
            {p.l} <span className="cnt">{de(FUENTE[p.k]).length}</span>
          </button>
        ))}
      </div>

      {/* ══════════ 1 · DEL SCRAPING ══════════ */}
      {panel === "p1" && (
        <div className="flow-panel active">
          {!nuevos.length ? <Vacio>No hay inmuebles nuevos del scraping.</Vacio> : (
            <Card>
              <SecTitle style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Resultado del último scraping
                <button type="button" className="btn btn-primary btn-mini" onClick={descargar}>
                  <IcoDown />Descargar listado (CSV)
                </button>
              </SecTitle>

              <div className="flow-sum">
                <div className="it"><div className="k">Inmuebles</div><div className="v">{nuevos.length}</div></div>
                <div className="it"><div className="k">$/m² medio</div><div className="v">${medio}M</div></div>
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
                  {nuevos.map((x) => (
                    <tr key={x.id}>
                      <td><Info x={x} /></td>
                      <td className="num">{precio(x)}</td>
                      <td className="num">{x.m2}</td>
                      <td className="num">${x.ppm}M</td>
                      <td>{x.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          )}
        </div>
      )}

      {/* ══════════ 2 · REVISIÓN INICIAL ══════════ */}
      {panel === "p2" && (
        <div className="flow-panel active">
          <Nota ico={<IcoInfo />}>
            Abre la publicación original para revisar las variables y decide. Lo que marques como{" "}
            <b>No continúa</b> queda registrado para no reingresar en futuros scrapings.
          </Nota>

          {!nuevos.length ? <Vacio>Nada por revisar.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">$/m²</th><th>Publicación</th>
                    <th style={{ textAlign: "right" }}>Decisión</th>
                  </tr>
                </thead>
                <tbody>
                  {nuevos.map((x) => (
                    <tr key={x.id}>
                      <td><Info x={x} /></td>
                      <td className="num">${x.ppm}M</td>
                      <td><Url x={x} /></td>
                      <td>
                        <div className="tacts-wrap">
                          <button
                            type="button" className="btn btn-primary btn-mini"
                            onClick={() => { cambia(x.id, { stage: "preseleccion" }); av("Pasa a preseleccionados"); }}
                          >
                            <IcoCheck />Continúa
                          </button>
                          <button
                            type="button" className="btn btn-ghost btn-mini"
                            onClick={() => descartar(x, "No continúa en revisión inicial")}
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
          )}
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

          {!de("preseleccion").length ? <Vacio>No hay inmuebles preseleccionados.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="lg">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">Precio</th><th>Contacto</th>
                    <th style={{ textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {de("preseleccion").map((x) => (
                    <tr key={x.id}>
                      <td><Info x={x} /></td>
                      <td className="num">{precio(x)}</td>
                      <td>
                        <div className="tacts-wrap">
                          <button type="button" className="btn btn-wa btn-mini" onClick={() => whatsapp(x)}>
                            <IcoWa />WhatsApp
                          </button>
                          <a className="btn btn-ghost btn-mini" href={`tel:+57${soloDigitos(x.tel)}`}>
                            <IcoTel />Llamar
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="tacts-wrap">
                          <button type="button" className="btn btn-primary btn-mini" onClick={() => agendar(x)}>
                            <IcoCal />Agendar visita
                          </button>
                          <button type="button" className="btn btn-ghost btn-mini" onClick={() => descartar(x, "No disponible")}>
                            No disponible
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          )}
        </div>
      )}

      {/* ══════════ 4 · VISITA AGENDADA ══════════ */}
      {panel === "p4" && (
        <div className="flow-panel active">
          {!de("visita").length ? <Vacio>No hay visitas agendadas.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr><th>Inmueble</th><th>Visita</th><th style={{ textAlign: "right" }}>Tras la visita</th></tr>
                </thead>
                <tbody>
                  {de("visita").map((x) => (
                    <tr key={x.id}>
                      <td><Info x={x} /></td>
                      <td><span className="est e-vis">{x.cita || "Por confirmar"}</span></td>
                      <td>
                        <div className="tacts-wrap">
                          <button type="button" className="btn btn-primary btn-mini" onClick={() => completar(x)}>
                            <IcoCheck />Continúa · completar
                          </button>
                          <button type="button" className="btn btn-ghost btn-mini" onClick={() => descartar(x, "Descartado tras la visita")}>
                            No continúa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          )}
        </div>
      )}

      {/* ══════════ 5 · PUBLICADOS ══════════ */}
      {panel === "p5" && (
        <div className="flow-panel active">
          {!de("publicado").length ? <Vacio>Aún no hay inmuebles publicados.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr>
                    <th>Inmueble</th><th className="num">Precio</th><th className="num">m²</th>
                    <th>Estado</th><th style={{ textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {de("publicado").map((x) => (
                    <tr key={x.id}>
                      <td><Info x={x} /></td>
                      <td className="num">{precio(x)}</td>
                      <td className="num">{x.m2}</td>
                      <td><span className="est e-pub">Publicado</span></td>
                      <td style={{ textAlign: "right" }}>
                        <button type="button" className="btn btn-ghost btn-mini" onClick={() => crearFicha(x)}>
                          <IcoFlecha />Crear ficha en Predios
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          )}
        </div>
      )}

      {/* ══════════ DESCARTADOS ══════════ */}
      {panel === "p6" && (
        <div className="flow-panel active">
          <Nota ico={<IcoVisto />}>
            Registro de descartados. Estos inmuebles <b>no volverán a aparecer</b> en futuros scrapings.
          </Nota>

          {!de("descartado").length ? <Vacio>No hay inmuebles descartados.</Vacio> : (
            <Card style={{ padding: "6px 6px 2px" }}>
              <Tabla ancho="md">
                <thead>
                  <tr><th>Inmueble</th><th>Motivo</th><th>Publicación</th></tr>
                </thead>
                <tbody>
                  {de("descartado").map((x) => (
                    <tr key={x.id}>
                      <td><Info x={x} /></td>
                      <td><span className="est e-desc">{x.motivo || "Descartado"}</span></td>
                      <td><Url x={x} texto="Ver" /></td>
                    </tr>
                  ))}
                </tbody>
              </Tabla>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
