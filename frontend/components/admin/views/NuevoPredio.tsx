"use client";

import { useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import { useSesion } from "@/components/admin/sesion";
import { Card, Grid, Hint, IcoPlus, SecTitle } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   NUEVO PREDIO — registro de un activo a mano, contra la base.

   POR QUÉ EXISTE
   El circuito nace del scraping: el pipeline trae anuncios y el equipo decide
   sobre ellos. Pero el predio bueno también llega por un contacto, una visita
   o un corredor, y entonces no hay anuncio que scrapear. Esta es su puerta.

   Antes era una maqueta: lo que se creaba aquí se borraba al recargar. Ahora
   va contra `POST /api/admin/flujo/manual`, que lo mete en el circuito con
   una clave propia (`manual:la-cabrera-1502`) en lugar de la URL del portal.

   DE AQUÍ SE SALE ARMANDO LA FICHA
   Este formulario recoge lo que IDENTIFICA al predio: qué es, dónde está y
   sus medidas. Lo que hace falta para publicarlo —termómetro, score, puente
   de valor, cifras, antes y después— son otros veinte campos, y ya tienen su
   formulario: «Armar ficha», generado desde `esquema.ts`. Duplicarlos aquí
   daría dos formularios para los mismos datos, que es exactamente como se
   separan las cosas sin que nadie se entere. Así que al crear se salta allí.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Los pasos REALES del registro a mano. Antes ponía «3 · Multimedia», y ese
   paso no existía: los dos recuadros de fotos y documentos no subían nada —
   pulsar «Subir foto» añadía el texto «Nueva · hoy» a una lista y ya—. Las
   fotos se suben de verdad en «Armar ficha», que es a donde se salta de aquí
   y donde hay un almacén detrás. */
const PASOS = ["1 · Datos", "2 · Comercial", "3 · Ficha", "4 · Publicación"];

const CARACTERISTICAS = [
  "Ascensor", "Balcón", "Vista", "Depósito", "Cuarto de servicio",
  "Terraza", "Vigilancia 24h", "Piscina", "Gimnasio",
];

const CIUDADES = ["Bogotá", "Medellín", "Cartagena", "Ciudad de Panamá"];

/* Las medidas del predio. `k` es la clave que viaja al backend; las que van
   a `null` se guardan igual pero todavía no tienen columna donde vivir. */
const CAMPOS: { k: string; l: string; ph: string; tipo?: string }[] = [
  { k: "zona", l: "Zona / barrio", ph: "Ej.: La Cabrera" },
  { k: "estrato", l: "Estrato", ph: "6", tipo: "number" },
  { k: "area", l: "Área (m²)", ph: "320", tipo: "number" },
  { k: "antiguedad", l: "Antigüedad / año", ph: "2008" },
  { k: "habitaciones", l: "Habitaciones", ph: "3", tipo: "number" },
  { k: "banos", l: "Baños", ph: "3", tipo: "number" },
  { k: "parqueaderos", l: "Parqueaderos", ph: "2", tipo: "number" },
  { k: "precio", l: "Precio de venta", ph: "3100000000", tipo: "number" },
];

/* Lo comercial. No son columnas: son campos de la ficha, y por eso se
   guardan como borrador al crear en vez de viajar en el alta. */
const COMERCIAL: { k: string; l: string; ph: string; ancho?: string }[] = [
  { k: "inversion", l: "Inversión total estimada", ph: "COP $3.100M", ancho: "full" },
  { k: "tir", l: "TIR / ROI estimado", ph: "~16% anual" },
  { k: "horizonte", l: "Horizonte", ph: "5 años" },
];

export default function NuevoPredio() {
  const { av, go, abrirFicha } = useConsola();
  const { pedir } = useSesion();
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("Colombia");
  const [transf, setTransf] = useState("");
  const [notas, setNotas] = useState("");
  /* Las medidas van en un solo objeto: son ocho y todas se tratan igual. */
  const [medidas, setMedidas] = useState<Record<string, string>>({});
  const [feats, setFeats] = useState<Record<string, boolean>>({});
  /* Las tres cifras comerciales no tienen columna propia: son campos de la
     ficha (`inversion_total`, `fin_tir`, `card_horizonte`). Se recogen aquí
     porque quien registra el predio suele saberlas, y se guardan como
     borrador de la ficha nada más crearlo, para no tener que teclearlas otra
     vez en la pantalla siguiente. */
  const [comercial, setComercial] = useState<Record<string, string>>({});
  const [creando, setCreando] = useState(false);

  const num = (k: string) => {
    const v = (medidas[k] ?? "").trim();
    if (!v) return null;
    const n = Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const falta = !nombre.trim() || !ciudad;

  const crear = async () => {
    if (falta || creando) return;
    setCreando(true);
    /* Las características marcadas se guardan como nota: no tienen columna
       propia, y perderlas al crear sería peor que apuntarlas aquí. */
    const marcadas = Object.keys(feats).filter((k) => feats[k]);
    const notaCompleta = [
      notas.trim(),
      marcadas.length ? `Características: ${marcadas.join(", ")}.` : "",
      medidas.estrato ? `Estrato ${medidas.estrato}.` : "",
      medidas.antiguedad ? `Antigüedad: ${medidas.antiguedad}.` : "",
    ].filter(Boolean).join(" ");

    try {
      const r = await pedir<{ link: string; titulo: string }>("/api/admin/flujo/manual", {
        method: "POST",
        body: JSON.stringify({
          titulo: nombre.trim(), ciudad, pais,
          zona: medidas.zona ?? "", tipo_transformacion: transf,
          notas: notaCompleta,
          area: num("area"), habitaciones: num("habitaciones"),
          banos: num("banos"), parqueaderos: num("parqueaderos"),
          precio: num("precio"),
        }),
      });
      /* Lo comercial viaja como borrador de la ficha. Si falla, el predio ya
         está creado y no se pierde nada: son tres campos que se pueden
         escribir en la pantalla siguiente. */
      const borrador = Object.fromEntries(
        Object.entries({
          inversion_total: comercial.inversion,
          fin_tir: comercial.tir,
          card_horizonte: comercial.horizonte,
        }).filter(([, v]) => (v ?? "").trim())
      );
      if (Object.keys(borrador).length) {
        try {
          await pedir("/api/admin/flujo/ficha", {
            method: "POST",
            body: JSON.stringify({ link: r.link, ficha: borrador }),
          });
        } catch { /* se escribe en la ficha */ }
      }

      av(`«${r.titulo.slice(0, 28)}» registrado · ahora su ficha`);
      /* Directo a armar la ficha: es el único camino a publicarlo, y
         mandarle a buscarlo en una lista sería hacerle dar un rodeo. */
      window.setTimeout(() => abrirFicha(r.link, r.titulo), 500);
    } catch (e) {
      av((e as Error).message);
      setCreando(false);
    }
  };

  return (
    <section className="view active">
      <div className="vhead">
        <div>
          <h1>Nuevo <b>predio</b></h1>
          <p>Registra un activo que no salió del scraping. Entra en el flujo, en Visita, y de aquí se pasa a armar su ficha.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => go("predios")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6" /></svg>
          Cancelar
        </button>
      </div>

      <Card className="mb">
        <div className="stepper">
          {PASOS.map((p, i) => (
            <div className={`stg${i === 0 ? " current" : ""}`} key={p}>
              <div className="bar" /><div className="l">{p}</div>
            </div>
          ))}
        </div>
      </Card>

      <Grid cols={2} className="mb">
        <Card>
          <SecTitle>Datos del predio</SecTitle>
          <div className="fgrid">
            <div className="full">
              <label htmlFor="np-name">Nombre / titular del activo</label>
              <input
                className="t" id="np-name" value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej.: Apartamento de gran formato con potencial de reconversión"
              />
            </div>
            <div>
              <label htmlFor="np-pais">País</label>
              <select className="t" id="np-pais" value={pais} onChange={(e) => setPais(e.target.value)}>
                <option>Colombia</option><option>Panamá</option><option>México</option><option>Costa Rica</option>
              </select>
            </div>
            <div>
              <label htmlFor="np-ciudad">Ciudad</label>
              <select className="t" id="np-ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
                <option value="">Selecciona…</option>
                {CIUDADES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {CAMPOS.map((c) => (
              <div key={c.k}>
                <label htmlFor={`np-${c.k}`}>{c.l}</label>
                <input
                  className="t" id={`np-${c.k}`} type={c.tipo} placeholder={c.ph}
                  value={medidas[c.k] ?? ""}
                  onChange={(e) => setMedidas((m) => ({ ...m, [c.k]: e.target.value }))}
                />
              </div>
            ))}
            <div className="full">
              <label htmlFor="np-transf">Tipo de transformación</label>
              <select className="t" id="np-transf" value={transf} onChange={(e) => setTransf(e.target.value)}>
                <option value="">Selecciona…</option>
                <option>Reposicionamiento premium</option><option>Remodelación completa</option>
                <option>Cambio de distribución</option><option>División en dos unidades</option>
              </select>
            </div>
            <div className="full">
              <label htmlFor="np-op">La oportunidad (resumen para la ficha)</label>
              <textarea className="t" id="np-op" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Compramos por debajo del mercado en… Remodelamos a costo cerrado con…" />
            </div>
          </div>
        </Card>

        <div>
          <Card className="mb">
            <SecTitle>Características</SecTitle>
            <div className="chips">
              {CARACTERISTICAS.map((n) => (
                <button
                  key={n} type="button" className="chip"
                  aria-pressed={feats[n] ? "true" : "false"}
                  onClick={() => setFeats((f) => ({ ...f, [n]: !f[n] }))}
                >
                  {n}
                </button>
              ))}
            </div>
            <Hint>Marca lo que aplica; se mostrarán como íconos en la ficha.</Hint>
          </Card>

          <Card>
            <SecTitle>Comercial</SecTitle>
            <div className="fgrid">
              {COMERCIAL.map((c) => (
                <div key={c.k} className={c.ancho}>
                  <label htmlFor={`np-${c.k}`}>{c.l}</label>
                  <input
                    className="t" id={`np-${c.k}`} placeholder={c.ph}
                    value={comercial[c.k] ?? ""}
                    onChange={(e) => setComercial((x) => ({ ...x, [c.k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {/* El responsable no se elige: lo pone el servidor con quien tiene
                la sesión abierta, que es el dato que de verdad queda escrito
                en `seguimiento_propiedades` y en la bitácora. Había aquí dos
                desplegables —«Área responsable» y «Gestor asignado», con dos
                nombres escritos a mano— que no viajaban a ninguna parte. */}
            <Hint>Queda a tu nombre. Estas tres cifras pasan directas a la ficha.</Hint>
          </Card>
        </div>
      </Grid>


      <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <Hint style={{ margin: 0 }}>
          Al crear, el predio entra en el flujo en <b style={{ color: "var(--coffee)" }}>Visita</b> y se abre su ficha.
          No sale en el sitio hasta que alguien la complete y pulse Publicar.
        </Hint>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => go("predios")}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={crear}><IcoPlus />Crear predio</button>
        </div>
      </Card>
    </section>
  );
}
