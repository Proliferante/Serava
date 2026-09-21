"use client";

import { useState } from "react";
import { useSesion } from "@/components/admin/sesion";

/* ═══════════════════════════════════════════════════════════════════════════
   FORMULARIO DE CAMBIO DE CONTRASEÑA.

   Uno solo, usado en dos sitios:

     · a pantalla completa, cuando alguien entra con una contraseña temporal y
       la consola le exige cambiarla antes de dejarlo trabajar
       (`CambiarClave.tsx`);
     · en un modal, desde el menú lateral, para quien quiera cambiarla cuando
       le parezca (`BotonCambiarClave`, en la consola).

   `estilo="oscuro"` es el de la pantalla completa, que va sobre el marrón de
   la marca; `"claro"` es el del modal, que va sobre el blanco de la consola y
   usa sus propias clases (`.t`, `.btn`).

   El backend vuelve a pedir la contraseña actual aunque haya sesión válida: si
   alguien deja la pantalla abierta, que no pueda cambiarla quien pase por ahí.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINEN = "#f7f1e5";
const CAJA_OSCURA = "h-[54px] w-full rounded-[13px] border border-solid px-[16px] text-[16px] outline-none";
const CAJA_OSCURA_ST = { background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)", color: LINEN } as const;
const ETIQUETA_OSCURA = "mb-[8px] block text-[13px] font-medium tracking-[0.5px]";

const trazoOjo = {
  fill: "none", stroke: "currentColor", strokeWidth: 1.7,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};
const IcoOjo = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...trazoOjo} aria-hidden>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IcoOjoTachado = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...trazoOjo} aria-hidden>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M3 21 21 3" />
  </svg>
);

export default function FormClave({
  estilo, temporal, onHecho, pie,
}: {
  estilo: "oscuro" | "claro";
  /** true cuando se llega aquí obligado, con la contraseña que dio el admin. */
  temporal?: boolean;
  onHecho?: () => void;
  /** Se dibuja debajo del botón: el "Cerrar sesión" o el "Cancelar". */
  pie?: React.ReactNode;
}) {
  const { pedir, refrescar, politica } = useSesion();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  /* Un ojo por campo, no uno para los tres: aquí se escriben dos contraseñas
     distintas —la actual y la nueva— y enseñar las dos a la vez no hace
     falta. Arrancan las tres ocultas. */
  const [visibles, setVisibles] = useState<Record<string, boolean>>({});

  const oscuro = estilo === "oscuro";

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    /* Las dos comprobaciones que se pueden hacer sin ir al servidor. El resto
       —que la actual sea correcta, que la nueva sea distinta— lo valida el
       backend, que es quien sabe. */
    if (nueva.length < politica.minima) {
      setError(`La contraseña nueva debe tener al menos ${politica.minima} caracteres.`);
      return;
    }
    if (nueva !== repetida) {
      setError("Las dos contraseñas nuevas no coinciden.");
      return;
    }
    setError(null);
    setEnviando(true);
    try {
      await pedir("/api/auth/cambiar-clave", {
        method: "POST",
        body: JSON.stringify({ clave_actual: actual, clave_nueva: nueva }),
      });
      await refrescar();
      onHecho?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  /** Un campo. `primero` sólo evita el margen superior del primero de los tres. */
  const campo = (
    id: string, etiqueta: string, valor: string, set: (v: string) => void,
    autocompletar: string, opciones: { primero?: boolean; marcador?: string } = {},
  ) => (
    <>
      {oscuro ? (
        <label
          htmlFor={id} style={{ color: "rgba(247,241,229,0.85)" }}
          className={`${ETIQUETA_OSCURA}${opciones.primero ? "" : " mt-[16px]"}`}
        >
          {etiqueta}
        </label>
      ) : (
        <label htmlFor={id}>{etiqueta}</label>
      )}
      <div className="relative">
        <input
          id={id} type={visibles[id] ? "text" : "password"} autoComplete={autocompletar}
          placeholder={opciones.marcador}
          value={valor} onChange={(e) => set(e.target.value)} disabled={enviando}
          className={oscuro ? `ix-field ${CAJA_OSCURA}` : "t"}
          /* Hueco a la derecha para el ojo: sin él, una contraseña larga se
             mete por debajo del icono. */
          style={oscuro ? { ...CAJA_OSCURA_ST, paddingRight: 46 } : { paddingRight: 46 }}
        />
        <button
          type="button"
          onClick={() => setVisibles((v) => ({ ...v, [id]: !v[id] }))}
          disabled={enviando}
          /* Fuera del recorrido del tabulador: al tabular entre los tres
             campos no se espera tropezar con un interruptor de vista. */
          tabIndex={-1}
          aria-pressed={!!visibles[id]}
          aria-label={visibles[id] ? `Ocultar ${etiqueta.toLowerCase()}` : `Ver ${etiqueta.toLowerCase()}`}
          title={visibles[id] ? "Ocultar" : "Ver"}
          className="ix-nav absolute right-[14px] top-1/2 flex size-[26px] -translate-y-1/2 items-center justify-center"
          style={{
            color: oscuro
              ? (visibles[id] ? LINEN : "rgba(247,241,229,0.45)")
              : (visibles[id] ? "#2a1e14" : "#8a7a68"),
          }}
        >
          {visibles[id] ? <IcoOjoTachado /> : <IcoOjo />}
        </button>
      </div>
    </>
  );

  return (
    <form onSubmit={enviar} noValidate>
      {campo("cc-actual", temporal ? "Contraseña temporal" : "Contraseña actual",
             actual, setActual, "current-password", { primero: true })}
      {campo("cc-nueva", "Contraseña nueva", nueva, setNueva, "new-password",
             { marcador: `Al menos ${politica.minima} caracteres` })}
      {campo("cc-rep", "Repítela", repetida, setRepetida, "new-password")}

      {/* Las reglas se enseñan antes, no después de un error. Las tres las
          aplica el servidor; venir de él evita que la pantalla prometa algo
          distinto de lo que se va a aceptar. */}
      <ul
        className={oscuro ? "mt-[14px] list-none p-0" : "hint"}
        style={oscuro ? { color: "rgba(247,241,229,0.5)", fontSize: 12.5, lineHeight: 1.5 } : { marginTop: 10 }}
      >
        {politica.reglas.map((r) => <li key={r}>· {r}</li>)}
      </ul>

      {error && (
        <p role="alert"
          className={oscuro ? "mt-[12px] text-[13.5px] font-medium" : ""}
          style={{ color: "#e39c82", ...(oscuro ? {} : { marginTop: 12, fontSize: ".85rem", fontWeight: 500 }) }}>
          {error}
        </p>
      )}

      {oscuro ? (
        <button
          type="submit" disabled={enviando}
          className="ix-press mt-[22px] flex h-[54px] w-full items-center justify-center rounded-full text-[15.5px] font-semibold disabled:opacity-60"
          style={{ background: "#7f8b57", color: LINEN }}
        >
          {enviando ? "Guardando…" : "Guardar y entrar"}
        </button>
      ) : (
        <div className="saverow">
          {pie}
          <button type="submit" className="btn btn-primary" disabled={enviando}>
            {enviando ? "Guardando…" : "Cambiar contraseña"}
          </button>
        </div>
      )}

      {oscuro && pie}
    </form>
  );
}
