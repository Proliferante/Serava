"use client";

import { motion, MotionConfig } from "framer-motion";
import { WORDMARK, wordmarkH } from "@/components/brand";
import FormClave from "@/components/admin/FormClave";
import { useSesion } from "@/components/admin/sesion";
import { EASE, LASER } from "@/components/responsive/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   CAMBIO DE CONTRASEÑA OBLIGATORIO.

   Sale cuando alguien entra con una contraseña temporal —la que le puso un
   administrador desde la pantalla de usuarios—, y no se puede saltar:
   mientras `debe_cambiar_clave` esté encendido, `AdminGate` enseña esto y no
   la consola. La única salida sin cambiarla es cerrar sesión.

   Los usuarios que se siembran con `scripts/crear_usuarios.py` NO pasan por
   aquí: se crean con contraseña conocida y la bandera apagada, para que el
   equipo pueda entrar y trabajar sin fricción. Pueden cambiarla cuando
   quieran, desde el menú lateral de la consola.

   El formulario es el mismo de ese menú (`FormClave`), en su variante oscura.
   ═══════════════════════════════════════════════════════════════════════════ */

const LINEN = "#f7f1e5";
const BROWN = "#2a1e14";

export default function CambiarClave() {
  const { usuario, salir } = useSesion();
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
            <p className="mt-[12px] mb-[24px] text-[14.5px] font-light leading-[1.55]" style={{ color: "rgba(247,241,229,0.72)" }}>
              Entraste con la contraseña temporal que te dieron{usuario ? `, ${usuario.nombre.split(" ")[0]}` : ""}.
              Elige una propia antes de seguir: la temporal la conoce quien te la envió.
            </p>

            <FormClave
              estilo="oscuro" temporal
              pie={
                <button
                  type="button" onClick={salir}
                  className="ix-nav mt-[18px] block w-full text-center text-[13px] font-medium"
                  style={{ background: "none", border: 0, color: "rgba(247,241,229,0.5)", cursor: "pointer" }}
                >
                  Cerrar sesión
                </button>
              }
            />
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
