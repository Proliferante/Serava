"use client";

import { useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import { AREAS, COMITE_SEED, type AreaKey, type CasoComite } from "@/components/admin/data";
import { AreaChip, Est, IcoCheck, IcoEye, VHead } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   COMITÉ DE APROBACIÓN — un predio se publica solo con el visto bueno de las
   tres áreas.

   El caso bloqueado no se puede firmar ni publicar aunque solo falte una
   firma: una observación de Data sobre la valoración es una parada, no un
   pendiente. Por eso `bloqueado` gana sobre el conteo de firmas.
   ═══════════════════════════════════════════════════════════════════════════ */

const RELOJ = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" />
  </svg>
);
const ALERTA = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 9v4M12 17h.01M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
  </svg>
);

export default function Comite() {
  const { av } = useConsola();
  const [casos, setCasos] = useState<CasoComite[]>(COMITE_SEED);
  const [publicados, setPublicados] = useState<Record<string, boolean>>({});

  const firmar = (caso: string, area: AreaKey) => {
    setCasos((cs) => cs.map((c) => c.id !== caso ? c : {
      ...c,
      firmas: c.firmas.map((f) => f.area === area ? { ...f, estado: "ok" as const } : f),
    }));
    av(`${AREAS[area]} aprobó`);
  };

  return (
    <section className="view active">
      <VHead titulo="Comité de" fuerte="aprobación">
        Un predio se publica solo con el visto bueno de las tres áreas: Arquitectura, Data y Comercial.
      </VHead>

      {casos.map((c) => {
        const faltan = c.firmas.filter((f) => f.estado === "pend").length;
        const listo = !c.bloqueado && faltan === 0;
        const pubHecho = publicados[c.id];

        return (
          <div className="committee" key={c.id}>
            <div className="ch">
              <div>
                <div className="t">{c.titulo}</div>
                <div className="m">{c.meta}</div>
              </div>
              <Est k="com" />
            </div>

            <div className="signoff">
              {c.firmas.map((f) => (
                <div className={`so ${f.estado}`} key={f.area}>
                  <div className="h">
                    <AreaChip a={f.area} />
                    <span className="who">{f.quien}</span>
                  </div>
                  <div className="status">
                    {f.estado === "ok" ? <><IcoCheck />Aprobado</>
                      : f.estado === "obs" ? <>{ALERTA}{f.nota || "Con observación"}</>
                      : <>{RELOJ}Pendiente</>}
                  </div>
                  {f.estado === "pend" && !c.bloqueado && (
                    <button type="button" className="btn btn-ghost" onClick={() => firmar(c.id, f.area)}>Aprobar</button>
                  )}
                </div>
              ))}
            </div>

            <div className="publishbar">
              <span className="st" style={listo ? { color: "var(--sage-deep)" } : undefined}>
                {c.bloqueado ? c.bloqueado
                  : listo ? "Las tres áreas aprobaron. Listo para publicar."
                  : `Falta${faltan > 1 ? "n" : ""} ${faltan} área${faltan > 1 ? "s" : ""} por aprobar.`}
              </span>
              <button
                type="button"
                className={`btn ${listo && !pubHecho ? "btn-primary" : "btn-ghost"}`}
                disabled={!listo || pubHecho}
                onClick={() => { setPublicados((p) => ({ ...p, [c.id]: true })); av("Publicado en el sitio"); }}
              >
                {pubHecho ? <><IcoCheck />Publicado en el sitio</> : <><IcoEye />Publicar en el sitio</>}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
