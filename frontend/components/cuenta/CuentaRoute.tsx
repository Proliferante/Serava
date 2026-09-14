"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { CuentaKey } from "@/components/AccountMenu";
import PrediosNav from "@/components/predios/PrediosNav";
import ScaledCanvas from "@/components/ScaledCanvas";
import { urlSilenciosa } from "@/components/pestanas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import { CUENTA_HREF, CuentaTabsCtx, cuentaDeRuta } from "@/components/cuenta/contexto";
import { CuentaTabs } from "@/components/responsive/cuenta/kit";
import { PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { WRAP } from "@/components/responsive/kit";
import PerfilCompact, { PerfilHeadCompact } from "@/components/responsive/cuenta/PerfilCompact";
import ConfiguracionCompact, { ConfiguracionHeadCompact } from "@/components/responsive/cuenta/ConfiguracionCompact";
import PerfilScreen, { PERFIL_H } from "@/components/sections/cuenta/PerfilScreen";
import ConfiguracionScreen, { CONFIG_H } from "@/components/sections/cuenta/ConfiguracionScreen";

/* ═══════════════════════════════════════════════════════════════════════════
   ÁREA DE CUENTA — el armazón de las dos pantallas.

   Mismo planteamiento que la ficha de predio: `/cuenta/perfil` y
   `/cuenta/configuracion` siguen siendo dos rutas que se abren y se comparten
   por separado, pero en el cliente las dos están montadas aquí y pasar de una
   a otra es un cambio de estado, no una página nueva.

   Lo que se queda quieto mientras el contenido se cruza: el fondo, la barra
   —con el menú del avatar abierto o cerrado— y, en la vista fluida, el par de
   pestañas, cuya píldora se desliza de una a otra. Lo que entra y sale: el
   encabezado, que cambia de titular, y el cuerpo.

   De propina, un formulario a medio rellenar en Mi perfil sigue ahí al volver
   de Configuración: antes cada salto lo tiraba.
   ═══════════════════════════════════════════════════════════════════════════ */

const CANVAS_H: Record<CuentaKey, number> = { perfil: PERFIL_H, configuracion: CONFIG_H };

const DESK: Record<CuentaKey, () => JSX.Element> = {
  perfil: PerfilScreen,
  configuracion: ConfiguracionScreen,
};

const HEAD_COMPACT: Record<CuentaKey, () => JSX.Element> = {
  perfil: PerfilHeadCompact,
  configuracion: ConfiguracionHeadCompact,
};

const BODY_COMPACT: Record<CuentaKey, () => JSX.Element> = {
  perfil: PerfilCompact,
  configuracion: ConfiguracionCompact,
};

const ORDEN: Record<CuentaKey, number> = { perfil: 0, configuracion: 1 };

const EASE = [0.22, 1, 0.36, 1] as const;

/** Igual que en la ficha: se cruzan, no se turnan. */
function variantes(x: number) {
  return {
    entra: (dir: number) => ({ opacity: 0, x: dir > 0 ? x : -x }),
    centro: { opacity: 1, x: 0, transition: { duration: 0.46, ease: EASE } },
    sale: (dir: number) => ({
      opacity: 0, x: dir > 0 ? -x * 0.7 : x * 0.7, pointerEvents: "none" as const,
      transition: { duration: 0.3, ease: "easeIn" as const },
    }),
  };
}

const V_DESK = variantes(80);
const V_COMPACT = variantes(40);

/** Una celda de rejilla donde las dos pantallas se apilan mientras se cruzan. */
function Capa({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 [&>*]:col-start-1 [&>*]:row-start-1">{children}</div>;
}

let yaMontada = false;

export default function CuentaRoute({ tab }: { tab: CuentaKey }) {
  /* Ver la nota de `FichaRoute`: atrás y adelante sí pasan por el router, que
     vuelve a montar con la pantalla que sirvió el servidor; del segundo montaje
     en adelante manda la URL. Y el `if`, también por lo mismo: con un ternario
     colgado de un `??` webpack se come el lado derecho al compilar para el
     servidor. */
  const [activa, setActiva] = useState<CuentaKey>(() => {
    if (!yaMontada || typeof window === "undefined") return tab;
    return cuentaDeRuta(window.location.pathname) ?? tab;
  });
  const [dir, setDir] = useState(0);
  const ref = useRef(activa);

  useEffect(() => { yaMontada = true; }, []);

  const mueve = useCallback((k: CuentaKey) => {
    const antes = ref.current;
    if (antes === k) return;
    ref.current = k;
    setDir(ORDEN[k] - ORDEN[antes]);
    setActiva(k);
  }, []);

  const cambia = useCallback((k: CuentaKey) => {
    if (ref.current === k) return;
    mueve(k);
    urlSilenciosa(CUENTA_HREF[k]);
    /* Las dos pantallas empiezan por el encabezado; quedarse a media página de
       la anterior sería aterrizar en mitad de un formulario que ya no es. */
    if (window.scrollY > 40) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [mueve]);

  useEffect(() => {
    const atras = () => {
      const k = cuentaDeRuta(window.location.pathname);
      if (k) mueve(k);
    };
    window.addEventListener("popstate", atras);
    return () => window.removeEventListener("popstate", atras);
  }, [mueve]);

  const Escritorio = DESK[activa];
  const HeadC = HEAD_COMPACT[activa];
  const BodyC = BODY_COMPACT[activa];

  return (
    <MotionConfig reducedMotion="user">
      <CuentaTabsCtx.Provider value={cambia}>
        <Compact>
          <div className="min-h-screen" style={{ background: "#492100" }}>
            <PrediosNavCompact cuenta={activa} />

            <section className={`${WRAP} pb-[46px] pt-[24px]`}>
              <Capa>
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div key={activa} custom={dir} variants={V_COMPACT} initial="entra" animate="centro" exit="sale">
                    <HeadC />
                  </motion.div>
                </AnimatePresence>
              </Capa>

              <CuentaTabs active={activa} />

              <Capa>
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div key={activa} custom={dir} variants={V_COMPACT} initial="entra" animate="centro" exit="sale">
                    <BodyC />
                  </motion.div>
                </AnimatePresence>
              </Capa>
            </section>
          </div>
        </Compact>

        <Desk>
          <ScaledCanvas width={1920} height={CANVAS_H[activa]} animateHeight>
            <div className="relative size-full overflow-hidden" style={{ background: "#492100" }}>
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={activa}
                  className="absolute inset-x-0 top-0"
                  style={{ height: CANVAS_H[activa] }}
                  custom={dir}
                  variants={V_DESK}
                  initial="entra"
                  animate="centro"
                  exit="sale"
                >
                  <Escritorio />
                </motion.div>
              </AnimatePresence>

              {/* La barra se queda: es la misma en las dos y el menú del avatar,
                  que es desde donde se salta, cuelga de ella. */}
              <div className="absolute inset-x-0 top-0" style={{ zIndex: 20 }}>
                <PrediosNav active="none" geo="cuenta" cuenta={activa} />
              </div>
            </div>
          </ScaledCanvas>
        </Desk>
      </CuentaTabsCtx.Provider>
    </MotionConfig>
  );
}
