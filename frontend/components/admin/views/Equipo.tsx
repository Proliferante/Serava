"use client";

import { useState } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import { AREA_DESC, MIEMBROS_SEED, type AreaKey, type Miembro } from "@/components/admin/data";
import { AreaChip, Card, EstLibre, Grid, IcoPlus, SecTitle, VHead } from "@/components/admin/ui";

/* EQUIPO & PERMISOS — las tres áreas y qué puede hacer cada una. */

/** Formulario del modal de invitación. Su estado vive aquí, no en el DOM. */
function FormInvitar({ onGuardar, onCancelar }: {
  onGuardar: (m: { n: string; e: string; area: string }) => void;
  onCancelar: () => void;
}) {
  const [n, setN] = useState("");
  const [e, setE] = useState("");
  const [area, setArea] = useState("Arquitectura");

  return (
    <>
      <MCuerpo>
        <label htmlFor="iv-n">Nombre</label>
        <input className="t" id="iv-n" placeholder="Nombre y apellido" value={n} onChange={(ev) => setN(ev.target.value)} />
        <label htmlFor="iv-e">Correo</label>
        <input className="t" id="iv-e" placeholder="persona@zequara.com" value={e} onChange={(ev) => setE(ev.target.value)} />
        <label htmlFor="iv-a">Área</label>
        <select className="t" id="iv-a" value={area} onChange={(ev) => setArea(ev.target.value)}>
          <option>Arquitectura</option><option>Data</option><option>Comercial</option><option>Administrador</option>
        </select>
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={() => onGuardar({ n, e, area })}>Enviar invitación</button>
      </MPie>
    </>
  );
}

const CLAVE: Record<string, AreaKey | "admin"> = {
  Arquitectura: "arq", Data: "data", Comercial: "com", Administrador: "admin",
};

export default function Equipo() {
  const { modal, av } = useConsola();
  const [miembros, setMiembros] = useState<Miembro[]>(MIEMBROS_SEED);

  const invitar = () => {
    modal("Invitar miembro", (cierra) => (
      <FormInvitar
        onCancelar={cierra}
        onGuardar={({ n, e, area }) => {
          const nombre = n.trim() || "Nuevo miembro";
          const ini = nombre.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();
          setMiembros((ms) => [...ms, {
            ini, n: nombre, e: e.trim() || "—",
            area: CLAVE[area] ?? "admin",
            perms: "Invitación enviada · pendiente de aceptar",
          }]);
          cierra();
          av("Invitación enviada a " + (e.trim() || nombre));
        }}
      />
    ));
  };

  return (
    <section className="view active">
      <VHead
        titulo="Equipo &" fuerte="permisos"
        acciones={<button type="button" className="btn btn-primary" onClick={invitar}><IcoPlus />Invitar miembro</button>}
      >
        Las tres áreas de ZEQUARA y qué puede hacer cada una en la consola.
      </VHead>

      <Grid cols={3} className="mb">
        {AREA_DESC.map(({ k, d }) => (
          <Card key={k}>
            <SecTitle><AreaChip a={k} /></SecTitle>
            <p style={{ fontSize: ".84rem", color: "var(--mocha)", fontWeight: 300 }}>{d}</p>
          </Card>
        ))}
      </Grid>

      <Card>
        <SecTitle>Miembros</SecTitle>
        {miembros.map((m) => (
          <div className="member" key={m.e + m.n}>
            <div className="av">{m.ini}</div>
            <div className="info">
              <div className="n">{m.n}</div>
              <div className="e">{m.e}</div>
            </div>
            {m.area === "admin"
              ? <EstLibre c="e-pub" style={{ marginRight: 12 }}>Admin</EstLibre>
              : <AreaChip a={m.area} style={{ marginRight: 12 }} />}
            <span className="perms">{m.perms}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}
