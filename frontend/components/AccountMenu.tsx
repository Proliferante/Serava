"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EASE } from "@/components/motion/Kinetics";
import { CUENTA, CUENTA_LINKS } from "@/components/sections/cuenta/data";

/* ═══════════════════════════════════════════════════════════════════════════
   MENÚ DEL AVATAR — lo que hay detrás del `button#meBtn` del diseño.

   Las pantallas de cuenta (688:4032 y 688:4280) traen el avatar de iniciales
   en la barra, con id de botón y sin nada colgando: es el único sitio del
   diseño por donde se entra a "Mi perfil" y "Configuración". Aquí se le pone
   el desplegable, con los dos destinos y el cierre de sesión.

   Vive fuera de las barras porque lo usan las dos: la de escritorio, dentro
   del lienzo de 1920, y la fluida de móvil y tablet. De ahí que el tamaño y
   los colores del avatar entren por props —en el lienzo son los 38 px
   literales del diseño; en móvil, 36—.
   ═══════════════════════════════════════════════════════════════════════════ */

const BROWN = "#492100";
const LINEN = "#f7f1e5";
const DANGER_FG = "#e39c82";

export type CuentaKey = "perfil" | "configuracion";

/** Cuál de los dos destinos corresponde a cada ruta del menú. */
const CLAVE: Record<string, CuentaKey> = {
  "/cuenta/perfil": "perfil",
  "/cuenta/configuracion": "configuracion",
};

export default function AccountMenu({
  size = 38, fontSize = 13.1, bg, borderColor, color, activo, align = "right",
}: {
  size?: number;
  fontSize?: number;
  bg: string;
  borderColor: string;
  color: string;
  /** El destino en el que ya estás, para marcarlo en la lista. */
  activo?: CuentaKey;
  /** De qué lado cuelga el panel respecto del avatar. */
  align?: "right" | "left";
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  /**
   * Se cierra al pulsar fuera y con Escape. El `pointerdown` va en captura
   * para que el clic en un enlace de fuera no se quede a medias: primero se
   * cierra el menú, después navega.
   */
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("pointerdown", fuera, true);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera, true);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div ref={caja} className="relative" style={{ width: size, height: size }}>
      <button
        type="button"
        id="meBtn"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label="Tu cuenta"
        onClick={() => setAbierto((v) => !v)}
        className="ix-nav flex cursor-pointer items-center justify-center rounded-full border border-solid"
        style={{ width: size, height: size, background: bg, borderColor, color, fontSize, fontWeight: 600 }}
      >
        {CUENTA.iniciales}
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            role="menu"
            className="absolute z-50 overflow-hidden"
            style={{
              top: size + 8, [align]: 0, width: 186,
              borderRadius: 12, background: BROWN,
              border: "1px solid rgba(247,241,229,0.12)",
              boxShadow: "0 22px 44px -22px rgba(0,0,0,0.7)",
            }}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <p className="m-0 px-[14px] pb-[6px] pt-[12px] text-[10px] font-semibold uppercase tracking-[1.8px]" style={{ color: "rgba(247,241,229,0.45)" }}>
              {CUENTA.nombre} {CUENTA.apellido}
            </p>

            {CUENTA_LINKS.map((l) => {
              const aqui = activo === CLAVE[l.href];
              return (
                <a
                  key={l.href}
                  href={l.href}
                  role="menuitem"
                  aria-current={aqui ? "page" : undefined}
                  className="ix-menuitem block px-[14px] py-[9px] text-[13.5px] font-medium"
                  style={{ color: aqui ? "#c9a877" : LINEN }}
                >
                  {l.label}
                </a>
              );
            })}

            <a
              href="/login"
              role="menuitem"
              className="ix-menuitem block px-[14px] py-[9px] text-[13.5px] font-medium"
              style={{ color: DANGER_FG, borderTop: "1px solid rgba(247,241,229,0.1)" }}
            >
              Cerrar sesión
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
