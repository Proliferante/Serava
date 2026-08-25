"use client";

import { useState } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import {
  AGENDA_SEED, LEADS_SEED, RESERVAS_SEED, STAGES, STAGE_EST,
  type Lead, type Reserva, type Sesion,
} from "@/components/admin/data";
import { Card, EstLibre, FStage, Grid, SecTitle, Tabla, Task, VHead } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   COMERCIAL — leads del formulario de acceso, reservas e inversionistas.

   El embudo cuenta acumulado: en la etapa 2 entran todos los que van por la 2
   o más adelante, no solo los que están parados ahí. Avanzar un lead recalcula
   el embudo, que es la razón de que las dos cosas vivan en el mismo estado.
   ═══════════════════════════════════════════════════════════════════════════ */

const COLORES = ["var(--blue)", "var(--blue)", "var(--caramel)", "var(--sage)", "var(--sage-deep)"];

/** Modal de validación de una reserva. */
function FormValidar({ r, onConfirmar, onCancelar }: {
  r: Reserva; onConfirmar: () => void; onCancelar: () => void;
}) {
  const [check, setCheck] = useState("Documentos en regla");
  const [nota, setNota] = useState("");
  return (
    <>
      <MCuerpo>
        <p style={{ fontSize: ".88rem", color: "var(--mocha)", fontWeight: 300 }}>
          Vas a validar la reserva de <b style={{ color: "var(--coffee)" }}>{r.predio}</b> ({r.inv}).
        </p>
        <label htmlFor="rv-check">Verificación</label>
        <select className="t" id="rv-check" value={check} onChange={(e) => setCheck(e.target.value)}>
          <option>Documentos en regla</option>
          <option>Pago de reserva confirmado</option>
          <option>Ambos confirmados</option>
        </select>
        <label htmlFor="rv-nota">Nota interna</label>
        <textarea className="t" id="rv-nota" placeholder="Observaciones…" value={nota} onChange={(e) => setNota(e.target.value)} />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={onConfirmar}>Validar y avanzar</button>
      </MPie>
    </>
  );
}

/** Modal de agendar sesión de conocimiento. */
function FormAgendar({ leads, onGuardar, onCancelar }: {
  leads: Lead[]; onGuardar: (s: Sesion) => void; onCancelar: () => void;
}) {
  const [inv, setInv] = useState(leads[0]?.n ?? "Otro / nuevo");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [canal, setCanal] = useState("Videollamada");
  const [notas, setNotas] = useState("");
  return (
    <>
      <MCuerpo>
        <label htmlFor="ag-inv">Inversionista / lead</label>
        <select className="t" id="ag-inv" value={inv} onChange={(e) => setInv(e.target.value)}>
          {leads.map((l) => <option key={l.n}>{l.n}</option>)}
          <option>Otro / nuevo</option>
        </select>
        <label htmlFor="ag-fecha">Fecha</label>
        <input className="t" id="ag-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <label htmlFor="ag-hora">Hora</label>
        <input className="t" id="ag-hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
        <label htmlFor="ag-canal">Canal</label>
        <select className="t" id="ag-canal" value={canal} onChange={(e) => setCanal(e.target.value)}>
          <option>Videollamada</option><option>Presencial</option><option>Teléfono</option>
        </select>
        <label htmlFor="ag-notas">Notas / objetivo</label>
        <textarea className="t" id="ag-notas" placeholder="Qué se busca en la sesión…" value={notas} onChange={(e) => setNotas(e.target.value)} />
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button
          type="button" className="btn btn-primary"
          onClick={() => onGuardar({ inv, fecha: (fecha || "Por definir") + (hora ? " " + hora : ""), canal, notas })}
        >
          Agendar sesión
        </button>
      </MPie>
    </>
  );
}

export default function Comercial({ abrirGestion }: { abrirGestion: () => void }) {
  const { modal, av } = useConsola();
  const [leads, setLeads] = useState<Lead[]>(LEADS_SEED);
  const [reservas, setReservas] = useState<Reserva[]>(RESERVAS_SEED);
  const [agenda, setAgenda] = useState<Sesion[]>(AGENDA_SEED);

  const avanzar = (i: number) => {
    setLeads((ls) => ls.map((l, k) => k === i && l.s < STAGES.length - 1 ? { ...l, s: l.s + 1 } : l));
    const s = Math.min(leads[i].s + 1, STAGES.length - 1);
    av(`${leads[i].n} → ${STAGES[s]}`);
  };

  const agendar = () => {
    modal("Agendar sesión de conocimiento", (cierra) => (
      <FormAgendar
        leads={leads} onCancelar={cierra}
        onGuardar={(s) => { setAgenda((a) => [s, ...a]); cierra(); av("Sesión agendada con " + s.inv); }}
      />
    ));
  };

  const validar = (i: number) => {
    const r = reservas[i];
    modal("Validar reserva", (cierra) => (
      <FormValidar
        r={r} onCancelar={cierra}
        onConfirmar={() => {
          setReservas((rs) => rs.map((x, k) => k === i ? { ...x, validada: true } : x));
          cierra(); av("Reserva de " + r.predio + " validada");
        }}
      />
    ));
  };

  const pendientes = reservas.filter((r) => !r.validada);

  return (
    <section className="view active">
      <VHead
        fuerte="Comercial"
        acciones={
          <button type="button" className="btn btn-primary" onClick={agendar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
            Agendar sesión
          </button>
        }
      >
        Leads del formulario de acceso, reservas e inversionistas — todo accionable.
      </VHead>

      <Card className="mb">
        <SecTitle>Embudo de captación</SecTitle>
        <div className="funnel">
          {STAGES.map((st, i) => (
            <FStage
              key={st} l={st} pct={100 - i * 15} color={COLORES[i]}
              n={leads.filter((l) => l.s >= i).length}
            />
          ))}
        </div>
      </Card>

      <Grid cols={2}>
        <Card style={{ padding: "6px 6px 2px" }}>
          <div style={{ padding: "14px 12px 0" }}><SecTitle>Leads</SecTitle></div>
          <Tabla ancho="md">
            <thead>
              <tr><th>Lead</th><th>Capital</th><th>Etapa</th><th style={{ textAlign: "right" }}>Acción</th></tr>
            </thead>
            <tbody>
              {leads.map((l, i) => (
                <tr key={l.n}>
                  <td className="pname">{l.n}</td>
                  <td>{l.cap}</td>
                  <td><EstLibre c={STAGE_EST[l.s]}>{STAGES[l.s]}</EstLibre></td>
                  <td style={{ textAlign: "right" }}>
                    {l.s < STAGES.length - 1
                      ? <button type="button" className="btn btn-ghost" style={{ padding: "7px 12px", fontSize: ".78rem" }} onClick={() => avanzar(i)}>Avanzar →</button>
                      : <EstLibre c="e-res">Reservó</EstLibre>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        </Card>

        <div>
          <Card className="mb">
            <SecTitle>Reservas por validar</SecTitle>
            {pendientes.length === 0
              ? <div className="hint" style={{ margin: 0 }}>No hay reservas por validar.</div>
              : reservas.map((r, i) => r.validada ? null : (
                  <Task
                    key={r.predio} color="var(--amber)" small={r.nota}
                    accion={<span className="go" onClick={() => validar(i)}>Validar →</span>}
                  >
                    {r.predio} · {r.inv}{" "}
                  </Task>
                ))}
          </Card>

          <Card className="mb">
            <SecTitle>Próximas sesiones <span className="see" onClick={agendar}>+ Agendar</span></SecTitle>
            {agenda.length === 0
              ? <div className="hint" style={{ margin: 0 }}>Sin sesiones agendadas.</div>
              : agenda.map((a, i) => (
                  <Task key={a.inv + i} color="var(--blue)" small={`${a.fecha} · ${a.canal}${a.notas ? " · " + a.notas : ""}`}>
                    {a.inv}{" "}
                  </Task>
                ))}
          </Card>

          <Card>
            <SecTitle>Inversionistas activos</SecTitle>
            <Task color="var(--sage)" small="1 en obra · 2 arrendadas" accion={<span className="go" onClick={abrirGestion}>Ver →</span>}>
              Natalia R. · 3 propiedades{" "}
            </Task>
            <Task color="var(--sage)" small="arrendada" accion={<span className="go" onClick={abrirGestion}>Ver →</span>}>
              Carlos M. · 1 propiedad{" "}
            </Task>
          </Card>
        </div>
      </Grid>
    </section>
  );
}
