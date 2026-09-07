"use client";

import { useCallback, useEffect, useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import { useSesion } from "@/components/admin/sesion";
import {
  AreaChip, AvisoMaqueta, Card, FStage, Grid, IcoPlus, Kpi, SecTitle, Task, VHead,
} from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   PANEL GENERAL — el estado operativo de un vistazo.

   LOS CINCO NÚMEROS DE ARRIBA SON REALES. Salen de
   `GET /api/admin/flujo/conteos`, que es la misma consulta que alimenta las
   pestañas del flujo, así que el panel y el flujo no pueden discrepar.

   Estaban escritos a mano: "12 en pipeline", "3 en comité", "7 publicados",
   "3 reservas activas", "18 leads nuevos". En la base hay CERO publicados.
   Esta es la primera pantalla que ve alguien al entrar, y abría con cinco
   cifras inventadas presentadas como el estado de la operación — con el
   equipo empezando a usar la consola, eso no es una maqueta pendiente, es
   información falsa.

   Lo de abajo (el embudo por estado comercial, las tareas por área y la
   actividad reciente) sigue siendo de muestra y lo dice: son estados que el
   backend todavía no tiene —comité, reservas, obra—. Se marcan en vez de
   borrarse porque es el diseño acordado y sirve de referencia de lo que
   falta; el aviso ámbar está justo encima.
   ═══════════════════════════════════════════════════════════════════════════ */

type Conteos = {
  nuevo: number; revision: number; preseleccion: number;
  visita: number; publicado: number; descartado: number;
};

/* El embudo comercial: estados que no existen todavía en la base. */
const EMBUDO_MUESTRA = [
  { n: "2", l: "Borrador", pct: 40 },
  { n: "4", l: "En evaluación", pct: 70, color: "var(--amber)" },
  { n: "3", l: "En comité", pct: 55, color: "var(--blue)" },
  { n: "7", l: "Publicados", pct: 100 },
  { n: "3", l: "Reservados", pct: 45, color: "var(--coffee)" },
];

const ICO = {
  candidatos: "M12 3v12M8 11l4 4 4-4",
  revision: "M9 12l2 2 4-4",
  contacto: "M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.7 18.7 0 0 1-5.7-5.7 19 19 0 0 1-3-8.4A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z",
  visita: "M3 9h18M8 2v4M16 2v4",
  publicado: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z",
};

export default function PanelGeneral() {
  const { go } = useConsola();
  const { pedir } = useSesion();
  const [c, setC] = useState<Conteos | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setC(await pedir<Conteos>("/api/admin/flujo/conteos"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [pedir]);

  useEffect(() => { void cargar(); }, [cargar]);

  /* Mientras carga va un guion, no un cero: un cero es un dato y "todavía no
     lo sé" no lo es. Mismo criterio que el embudo de la extracción. */
  const n = (v: number | undefined) => (c == null ? "—" : (v ?? 0).toLocaleString("es-CO"));

  const KPIS = [
    { lbl: "Candidatos del scraping", v: n(c?.nuevo), h: "sin revisar todavía", d: ICO.candidatos, ir: "extraccion" as const },
    { lbl: "En revisión general", v: n(c?.revision), h: "aceptados, por decidir", d: ICO.revision, ir: "flujo" as const, alert: !!c?.revision },
    { lbl: "Preseleccionados", v: n(c?.preseleccion), h: "por contactar y agendar", d: ICO.contacto, ir: "flujo" as const },
    { lbl: "Visitas agendadas", v: n(c?.visita), h: "con cita puesta", d: ICO.visita, ir: "flujo" as const },
    { lbl: "Publicados", v: n(c?.publicado), h: "completados tras la visita", d: ICO.publicado, ir: "flujo" as const, punto: true },
  ];

  return (
    <section className="view active">
      <VHead
        titulo="Panel" fuerte="general"
        acciones={
          <button type="button" className="btn btn-primary" onClick={() => go("extraccion")}>
            <IcoPlus />Extraer predios
          </button>
        }
      >
        Estado operativo de ZEQUARA. Las cinco cifras de arriba salen de la base, en vivo.
      </VHead>

      {error && (
        <Card className="mb">
          <div className="empty">
            <b style={{ color: "var(--terra)" }}>No se pudieron leer los números del flujo.</b>
            <br />{error}
          </div>
        </Card>
      )}

      <Grid cols={5} className="mb">
        {KPIS.map((k) => (
          <div key={k.lbl} role="button" tabIndex={0} style={{ cursor: "pointer" }}
               onClick={() => go(k.ir)}
               onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") go(k.ir); }}>
            <Kpi
              lbl={k.lbl} v={k.v} h={k.h} alert={k.alert}
              ico={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d={k.d} />
                  {k.punto && <circle cx="12" cy="12" r="3" />}
                </svg>
              }
            />
          </div>
        ))}
      </Grid>

      <AvisoMaqueta>
        Aplica sólo a lo de <b>aquí abajo</b>: el embudo comercial, las tareas por área y la
        actividad reciente son un ejemplo del diseño acordado. Esos estados —comité, reservas,
        obra— todavía no existen en el backend.
      </AvisoMaqueta>

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
            {EMBUDO_MUESTRA.map((e) => <FStage key={e.l} n={e.n} l={e.l} pct={e.pct} color={e.color} />)}
          </div>

          <SecTitle style={{ marginTop: 22 }}>Actividad reciente</SecTitle>
          <Task color="var(--sage)" small="Comercial · hoy 9:12">Punta Pacífica publicado en el sitio{" "}</Task>
          <Task color="var(--data)" small="Data · ayer">Score de Chicó actualizado a 92{" "}</Task>
        </Card>
      </Grid>
    </section>
  );
}
