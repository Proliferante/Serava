"use client";

import { useConsola } from "@/components/admin/ctx";
import { AreaChip, Card, FStage, Grid, IcoPlus, Kpi, SecTitle, Task, VHead } from "@/components/admin/ui";

/* PANEL GENERAL — el estado operativo de un vistazo. */

const KPIS = [
  { lbl: "En pipeline", v: "12", h: "predios en gestión", d: "M3 21h18M5 21V8l7-5 7 5v13" },
  { lbl: "En comité", v: "3", h: "esperan aprobación", alert: true, d: "M12 8v5M12 16h.01", circulo: true },
  { lbl: "Publicados", v: "7", h: "visibles en el sitio", d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z", punto: true },
  { lbl: "Reservas activas", v: "3", h: "2 por validar", d: "M5 3h14v18l-7-4-7 4z" },
  { lbl: "Leads nuevos (7d)", v: "18", h: "del formulario de acceso", d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

const EMBUDO = [
  { n: "2", l: "Borrador", pct: 40 },
  { n: "4", l: "En evaluación", pct: 70, color: "var(--amber)" },
  { n: "3", l: "En comité", pct: 55, color: "var(--blue)" },
  { n: "7", l: "Publicados", pct: 100 },
  { n: "3", l: "Reservados", pct: 45, color: "var(--coffee)" },
];

export default function PanelGeneral() {
  const { go } = useConsola();

  return (
    <section className="view active">
      <VHead
        titulo="Panel" fuerte="general"
        acciones={<button type="button" className="btn btn-primary" onClick={() => go("nuevo")}><IcoPlus />Nuevo predio</button>}
      >
        Estado operativo de ZEQUARA: predios, aprobaciones, obra y comercial.
      </VHead>

      <Grid cols={5} className="mb">
        {KPIS.map((k) => (
          <Kpi
            key={k.lbl} lbl={k.lbl} v={k.v} h={k.h} alert={k.alert}
            ico={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d={k.d} />
                {k.circulo && <circle cx="12" cy="12" r="9" />}
                {k.punto && <circle cx="12" cy="12" r="3" />}
              </svg>
            }
          />
        ))}
      </Grid>

      <Grid cols={2}>
        <Card>
          <SecTitle>Requiere atención por área</SecTitle>
          <Task color="var(--arq)" small={<AreaChip a="arq" />} accion={<span className="go" onClick={() => go("arq")}>Revisar →</span>}>
            La Cabrera · sobrecosto en baño para revisar{" "}
          </Task>
          <Task color="var(--data)" small={<AreaChip a="data" />} accion={<span className="go" onClick={() => go("data")}>Revisar →</span>}>
            Laureles · falta cerrar valoración y Score{" "}
          </Task>
          <Task color="var(--com)" small={<AreaChip a="com" />} accion={<span className="go" onClick={() => go("comercial")}>Revisar →</span>}>
            2 reservas por validar antes de publicar{" "}
          </Task>
          <Task color="var(--terra)" small="requieren visto bueno de las 3 áreas" accion={<span className="go" onClick={() => go("comite")}>Ir al comité →</span>}>
            3 predios listos para comité de aprobación{" "}
          </Task>
        </Card>

        <Card>
          <SecTitle>Embudo de predios</SecTitle>
          <div className="funnel">
            {EMBUDO.map((e) => <FStage key={e.l} n={e.n} l={e.l} pct={e.pct} color={e.color} />)}
          </div>

          <SecTitle style={{ marginTop: 22 }}>Actividad reciente</SecTitle>
          <Task color="var(--sage)" small="Comercial · hoy 9:12">Punta Pacífica publicado en el sitio{" "}</Task>
          <Task color="var(--data)" small="Data · ayer">Score de Chicó actualizado a 92{" "}</Task>
        </Card>
      </Grid>
    </section>
  );
}
