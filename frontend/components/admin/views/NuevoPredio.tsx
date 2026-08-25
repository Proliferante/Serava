"use client";

import { useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import type { Predio } from "@/components/admin/data";
import { Card, Grid, Hint, IcoPlus, SecTitle, Tabla } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   NUEVO PREDIO — registro de un activo.

   Entra como Borrador y avanza por evaluación y comité antes de publicarse:
   crearlo aquí no lo publica en ningún sitio, y el aviso al pie lo dice.
   ═══════════════════════════════════════════════════════════════════════════ */

const PASOS = ["1 · Datos", "2 · Comercial", "3 · Multimedia", "4 · Revisión"];

const CARACTERISTICAS = [
  "Ascensor", "Balcón", "Vista", "Depósito", "Cuarto de servicio",
  "Terraza", "Vigilancia 24h", "Piscina", "Gimnasio",
];

const CIUDADES = ["Bogotá", "Medellín", "Cartagena", "Ciudad de Panamá"];

const CAMPOS: { l: string; ph: string; tipo?: string }[] = [
  { l: "Zona / barrio", ph: "Ej.: La Cabrera" },
  { l: "Estrato", ph: "6", tipo: "number" },
  { l: "Área (m²)", ph: "320", tipo: "number" },
  { l: "Antigüedad / año", ph: "2008" },
  { l: "Habitaciones", ph: "3", tipo: "number" },
  { l: "Baños", ph: "3", tipo: "number" },
  { l: "Parqueaderos", ph: "2", tipo: "number" },
];

export default function NuevoPredio({ onCrear }: { onCrear: (p: Predio) => void }) {
  const { go, av } = useConsola();
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [feats, setFeats] = useState<Record<string, boolean>>({});
  const [fotos, setFotos] = useState<string[]>([]);
  const [docs, setDocs] = useState<string[]>([]);

  const crear = () => {
    const n = nombre.trim() || "Predio sin título";
    onCrear({
      id: "np_" + Date.now(),
      nombre: n.slice(0, 40),
      zona: "Nuevo · sin publicar",
      est: "bor", score: "—", inversion: "—",
      area: "data", city: ciudad === "Ciudad de Panamá" ? "Panamá" : ciudad,
      publicado: false,
    });
    av(`Predio "${n.slice(0, 24)}" creado como Borrador`);
    window.setTimeout(() => go("predios"), 650);
  };

  return (
    <section className="view active">
      <div className="vhead">
        <div>
          <h1>Nuevo <b>predio</b></h1>
          <p>Registra un activo. Entra como Borrador y avanza por evaluación y comité antes de publicarse.</p>
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
              <select className="t" id="np-pais" defaultValue="Colombia">
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
              <div key={c.l}>
                <label htmlFor={`np-${c.l}`}>{c.l}</label>
                <input className="t" id={`np-${c.l}`} type={c.tipo} placeholder={c.ph} />
              </div>
            ))}
            <div className="full">
              <label htmlFor="np-transf">Tipo de transformación</label>
              <select className="t" id="np-transf" defaultValue="">
                <option value="">Selecciona…</option>
                <option>Reposicionamiento premium</option><option>Remodelación completa</option>
                <option>Cambio de distribución</option><option>División en dos unidades</option>
              </select>
            </div>
            <div className="full">
              <label htmlFor="np-op">La oportunidad (resumen para la ficha)</label>
              <textarea className="t" id="np-op" placeholder="Compramos por debajo del mercado en… Remodelamos a costo cerrado con…" />
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
            <SecTitle>Comercial &amp; asignación</SecTitle>
            <div className="fgrid">
              <div><label htmlFor="np-inv">Inversión total estimada</label><input className="t" id="np-inv" placeholder="COP $3.100M" /></div>
              <div><label htmlFor="np-tir">TIR / ROI estimado</label><input className="t" id="np-tir" placeholder="~16% anual" /></div>
              <div><label htmlFor="np-hor">Horizonte</label><input className="t" id="np-hor" placeholder="5 años" /></div>
              <div>
                <label htmlFor="np-area">Área responsable</label>
                <select className="t" id="np-area" defaultValue="Arquitectura">
                  <option>Arquitectura</option><option>Data</option><option>Comercial</option>
                </select>
              </div>
              <div className="full">
                <label htmlFor="np-gestor">Gestor asignado</label>
                <select className="t" id="np-gestor" defaultValue="Sin asignar">
                  <option>Sin asignar</option><option>Juan P. Restrepo</option><option>Andrés Ruiz</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </Grid>

      <Grid cols={2} className="mb">
        <Card>
          <SecTitle>Fotos iniciales</SecTitle>
          <div className="photos">
            {fotos.map((f, i) => (
              <div className="pht" key={f + i}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 14l4-4 5 5" />
                </svg>
                <span className="cap">{f}</span>
                <button type="button" className="del" aria-label="Quitar foto" onClick={() => setFotos((xs) => xs.filter((_, k) => k !== i))}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <button type="button" className="addtile" onClick={() => { setFotos((f) => [...f, "Nueva · hoy"]); av("Foto agregada"); }}>
              <IcoPlus />Subir foto
            </button>
          </div>
          <Hint>Puedes subir la foto principal ahora y el resto (antes/después) desde la gestión del predio.</Hint>
        </Card>

        <Card>
          <SecTitle>Documentos iniciales</SecTitle>
          <button type="button" className="dropzone" onClick={() => { setDocs((d) => [...d, "Documento nuevo.pdf"]); av("Documento cargado"); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>
            <div className="t">Arrastra o selecciona archivos</div>
            <div className="s">Ficha técnica, estudio de títulos, plan de remodelación</div>
          </button>
          <Tabla ancho="auto">
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td style={{ color: "var(--mocha)", fontWeight: 300, fontSize: ".82rem", border: "none" }}>
                    Aún no has cargado documentos.
                  </td>
                </tr>
              ) : docs.map((d, i) => (
                <tr key={d + i}>
                  <td style={{ fontSize: ".83rem" }}>{d}</td>
                  <td style={{ textAlign: "right" }}>
                    <button type="button" className="iconbtn" aria-label={`Quitar ${d}`} onClick={() => setDocs((xs) => xs.filter((_, k) => k !== i))}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Card>
      </Grid>

      <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <Hint style={{ margin: 0 }}>
          Al crear, el predio entra como <b style={{ color: "var(--coffee)" }}>Borrador</b> y queda visible
          en la lista de Predios. No se publica en el sitio hasta pasar por el comité de las tres áreas.
        </Hint>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-ghost" onClick={() => go("predios")}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={crear}><IcoPlus />Crear predio</button>
        </div>
      </Card>
    </section>
  );
}
