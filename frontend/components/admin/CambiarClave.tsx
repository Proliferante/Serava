"use client";

import { motion, MotionConfig } from "framer-motion";
import { useState } from "react";
import { WORDMARK, wordmarkH } from "@/components/brand";
import { useSesion } from "@/components/admin/sesion";
import { EASE, LASER } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   CAMBIO DE CONTRASEÑA OBLIGATORIO.

   Sale una sola vez: cuando el usuario entra con la contraseña temporal que
   le puso el administrador (`debe_cambiar_clave` en true). Sin esta pantalla,
   esa contraseña —que viaja por chat o por correo para repartirla— se
   quedaría puesta para siempre.

   No es un aviso que se pueda saltar: mientras la bandera esté encendida,
   `AdminGate` enseña esto y no la consola. La única salida sin cambiarla es
   cerrar sesión.

   El backend vuelve a exigir la contraseña actual (`POST /api/auth/cambiar-clave`),
   aunque el usuario ya tenga sesión válida: si alguien deja la pantalla
   abierta, que no pueda cambiarle la contraseña quien pase por ahí.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINEN = "#f7f1e5";
const BROWN = "#2a1e14";

const CAJA = "h-[54px] w-full rounded-[13px] border border-solid px-[16px] text-[16px] outline-none";
const CAJA_ST = { background: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)", color: LINEN } as const;
const ETIQUETA = "mb-[8px] block text-[13px] font-medium tracking-[0.5px]";
const ETIQUETA_ST = { color: "rgba(247,241,229,0.85)" } as const;

const MINIMO = 8;

export default function CambiarClave() {
  const { usuario, pedir, refrescar, salir } = useSesion();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetida, setRepetida] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    /* Las dos comprobaciones que se pueden hacer aquí sin ir al servidor: que
       la nueva tenga el largo mínimo y que las dos copias coincidan. El resto
       (que la actual sea correcta, que la nueva sea distinta) lo valida el
       backend, que es quien sabe. */
    if (nueva.length < MINIMO) {
      setError(`La contraseña nueva debe tener al menos ${MINIMO} caracteres.`);
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
      await refrescar();   // apaga `debe_cambiar_clave` y deja pasar
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const wm = 170;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen items-center justify-center px-[24px] py-[48px]" style={{ background: BROWN }}>
        <motion.div
          className="w-full max-w-[430px]"
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="ix-nav mx-auto block" style={{ width: wm, height: wordmarkH(wm) }}>
            <img src={WORDMARK} alt="Zequara" decoding="async" className="block size-full max-w-none" />
          </span>

          <div
            className="mt-[30px] rounded-[22px] p-[26px] sm:p-[30px]"
            style={{ background: "rgba(247,241,229,0.04)", border: "1px solid rgba(247,241,229,0.12)" }}
          >
            <div className="flex items-center gap-[12px]">
              <span className="block h-px w-[28px] opacity-80" style={{ background: LASER }} />
              <span className="text-[11px] font-semibold uppercase tracking-[3px]" style={{ color: LASER }}>Primera entrada</span>
            </div>

            <h1 className="mt-[14px] text-[clamp(1.5rem,6vw,1.95rem)] font-light leading-[1.15]" style={{ color: LINEN }}>
              Cambia tu <span className="font-semibold">contraseña.</span>
            </h1>
            <p className="mt-[12px] text-[14.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.72)" }}>
              Entraste con la contraseña temporal que te dieron{usuario ? `, ${usuario.nombre.split(" ")[0]}` : ""}.
              Elige una propia antes de seguir: la temporal la conoce quien te la envió.
            </p>

            <form className="mt-[24px]" onSubmit={enviar} noValidate>
              <label className={ETIQUETA} style={ETIQUETA_ST} htmlFor="cc-actual">Contraseña temporal</label>
              <input
                id="cc-actual" type="password" autoComplete="current-password"
                value={actual} onChange={(e) => setActual(e.target.value)} disabled={enviando}
                className={`ix-field ${CAJA}`} style={CAJA_ST}
              />

              <label className={`${ETIQUETA} mt-[16px]`} style={ETIQUETA_ST} htmlFor="cc-nueva">Contraseña nueva</label>
              <input
                id="cc-nueva" type="password" autoComplete="new-password" placeholder={`Al menos ${MINIMO} caracteres`}
                value={nueva} onChange={(e) => setNueva(e.target.value)} disabled={enviando}
                className={`ix-field ${CAJA} placeholder:text-[rgba(247,241,229,0.42)]`} style={CAJA_ST}
              />

              <label className={`${ETIQUETA} mt-[16px]`} style={ETIQUETA_ST} htmlFor="cc-rep">Repítela</label>
              <input
                id="cc-rep" type="password" autoComplete="new-password"
                value={repetida} onChange={(e) => setRepetida(e.target.value)} disabled={enviando}
                className={`ix-field ${CAJA}`} style={CAJA_ST}
              />

              {error && (
                <p role="alert" className="mt-[12px] text-[13.5px] font-medium" style={{ color: "#e39c82" }}>{error}</p>
              )}

              <button
                type="submit" disabled={enviando}
                className="ix-press mt-[22px] flex h-[54px] w-full items-center justify-center rounded-full text-[15.5px] font-semibold disabled:opacity-60"
                style={{ background: "#7f8b57", color: LINEN }}
              >
                {enviando ? "Guardando…" : "Guardar y entrar"}
              </button>
            </form>

            <button
              type="button" onClick={salir}
              className="ix-nav mt-[18px] block w-full text-center text-[13px] font-medium"
              style={{ background: "none", border: 0, color: "rgba(247,241,229,0.5)", cursor: "pointer" }}
            >
              Cerrar sesión
            </button>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
