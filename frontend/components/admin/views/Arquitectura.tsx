"use client";

import { useConsola } from "@/components/admin/ctx";
import { Card, Frow, Grid, Kpi, SecTitle, Task, VHead } from "@/components/admin/ui";

/* ARQUITECTURA — dossier técnico, obra en curso y evaluaciones pendientes. */

const KPIS = [
  { lbl: "En evaluación técnica", v: "4", h: "predios por dictaminar" },
  { lbl: "Obras en curso", v: "1", h: "La Cabrera · 78%" },
  { lbl: "Presupuesto cerrado", v: "$1.350M", h: "obra activa" },
  { lbl: "Hallazgos abiertos", v: "1", h: "requiere aprobación", alert: true },
];

const DOSSIER: { k: string; v: string; color?: string }[] = [
  { k: "Inspección de inmueble", v: "Completa", color: "var(--sage-deep)" },
  { k: "Tipo de transformación", v: "Reposicionamiento premium" },
  { k: "Alcance de remodelación", v: "Aprobado" },
  { k: "Presupuesto a costo cerrado", v: "$1.350M" },
  { k: "Cronograma", v: "12 semanas" },
  { k: "Interventoría independiente", v: "Asignada", color: "var(--sage-deep)" },
];

export default function Arquitectura({ abrirGestion }: { abrirGestion: () => void }) {
  const { go } = useConsola();

  return (
    <section className="view active">
      <VHead fuerte="Arquitectura">
        Evaluación técnica, alcance de remodelación a costo cerrado, cronograma y obra en curso.
      </VHead>

      <Grid cols={4} className="mb">
        {KPIS.map((k) => <Kpi key={k.lbl} lbl={k.lbl} v={k.v} h={k.h} alert={k.alert} />)}
      </Grid>

      <Grid cols={2}>
        <Card>
          <SecTitle>Dossier técnico · La Cabrera</SecTitle>
          {DOSSIER.map((f) => <Frow key={f.k} k={f.k} v={f.v} vColor={f.color} />)}
        </Card>

        <Card>
          <SecTitle>Obra en curso</SecTitle>
          <Task
            color="var(--amber)" small="Carpintería en ejecución"
            accion={<span className="go" onClick={abrirGestion}>Abrir →</span>}
          >
            La Cabrera · avance 78%, semana 9/12{" "}
          </Task>
          <Task
            color="var(--terra)" small="Cotizado $0 a cargo del inversionista · espera aprobación"
            accion={<span className="go" onClick={() => go("comite")}>Comité →</span>}
          >
            Hallazgo: humedad en baño principal{" "}
          </Task>

          <SecTitle style={{ marginTop: 20 }}>Evaluaciones pendientes</SecTitle>
          <Task color="var(--blue)" small="15 jul">Laureles · inspección agendada{" "}</Task>
          <Task color="var(--blue)" small="borrador">Rosales · alcance por definir{" "}</Task>
        </Card>
      </Grid>
    </section>
  );
}
