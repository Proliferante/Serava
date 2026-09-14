"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import ScaledCanvas from "@/components/ScaledCanvas";
import PrediosNav from "@/components/predios/PrediosNav";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import { BROWN, CREAM, EASE, FichaTabsCtx, TAB_HREF, TAB_INDEX, TabsFicha, TABS_H, tabDeRuta, type TabKey } from "./kit";
import Oportunidad from "./Oportunidad";
import Finanzas from "./Finanzas";
import Transformacion from "./Transformacion";
import { FichaShellCompact, TabsCompact } from "@/components/responsive/predios/ficha/kit";
import OportunidadCompact, { OportunidadHeroCompact } from "@/components/responsive/predios/ficha/OportunidadCompact";
import FinanzasCompact, { FinanzasHeroCompact } from "@/components/responsive/predios/ficha/FinanzasCompact";
import TransformacionCompact, { TransformacionHeroCompact } from "@/components/responsive/predios/ficha/TransformacionCompact";

/* ═══════════════════════════════════════════════════════════════════════════
   FICHA DE PREDIO — el armazón de las tres pestañas.

   Las tres siguen siendo tres rutas: `/predios/ficha`, `/finanzas` y
   `/transformacion` se pueden abrir, compartir e indexar por separado, y sin
   JavaScript los enlaces de la barra navegan como siempre. Lo que cambia es
   que, ya en el cliente, las tres pestañas están montadas en el mismo árbol:
   pulsar una no pide una página nueva, cambia un estado.

   Eso permite animar el cambio, que es lo que se ve:

   · La barra de pestañas no pertenece a ninguna de las tres. La monta este
     componente una sola vez y se queda; la píldora se desliza hasta su nuevo
     sitio y los dos rótulos se apartan. Como las tres pestañas no la ponen a
     la misma altura —Transformación la lleva encima del hero, las otras dos
     debajo—, la franja entera también viaja.
   · El contenido sale hacia un lado y el nuevo entra por el otro, según qué
     pestaña quede a la izquierda o a la derecha en la barra.
   · El lienzo pasa de 4745 a 3947 o a 2705 px de alto. El alto se transiciona
     para que la página no dé un tirón a mitad de la animación.

   La franja va por debajo de la capa de contenido a propósito: así el hero,
   que es opaco, le tapa el borde de arriba exactamente como en el frame.

   Coste: las tres pestañas viajan en el bundle de cada una de las tres rutas.
   Son marcado y datos, no lógica, y a cambio el cambio de pestaña no pide nada
   a la red. Las imágenes de las pestañas que no se ven no se descargan: sólo
   se monta la activa.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Alto del frame de cada pestaña. */
const CANVAS_H: Record<TabKey, number> = { oportunidad: 4745, finanzas: 3947, transformacion: 2705 };

/** Dónde cuelga la franja de pestañas en cada frame. */
const BAR_TOP: Record<TabKey, number> = { oportunidad: 568, finanzas: 568, transformacion: 45 };

/**
 * La barra del área privada también se queda fija. Es la misma en las tres
 * pestañas salvo por los 7 px que Finanzas la sube; eso se transiciona igual
 * que la franja de pestañas, en vez de dejar que parpadee con el contenido.
 */
const NAV: Record<TabKey, { h: number; y: number }> = {
  oportunidad: { h: 81.81, y: 0 },
  finanzas: { h: 74.81, y: -7 },
  transformacion: { h: 81.81, y: 0 },
};

const DESK: Record<TabKey, () => JSX.Element> = {
  oportunidad: Oportunidad,
  finanzas: Finanzas,
  transformacion: Transformacion,
};

const HERO_COMPACT: Record<TabKey, () => JSX.Element> = {
  oportunidad: OportunidadHeroCompact,
  finanzas: FinanzasHeroCompact,
  transformacion: TransformacionHeroCompact,
};

const BODY_COMPACT: Record<TabKey, () => JSX.Element> = {
  oportunidad: OportunidadCompact,
  finanzas: FinanzasCompact,
  transformacion: TransformacionCompact,
};

/**
 * Entrada y salida del contenido. `dir` es la distancia con signo entre la
 * pestaña que se va y la que llega, así que ir de Oportunidad a Transformación
 * empuja hacia el mismo lado que ir de Oportunidad a Finanzas, sólo que se
 * salta una. Las distancias van en píxeles del lienzo de 1920 en escritorio y
 * en píxeles de pantalla en la vista fluida; quien lo usa pasa `x`.
 *
 * Las dos pestañas se cruzan en vez de turnarse: esperar a que la vieja
 * termine de irse dejaba medio segundo de página vacía, que se notaba más que
 * el propio cambio. La que se va deja de recibir clics mientras se desvanece.
 */
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

const V_DESK = variantes(96);
const V_COMPACT = variantes(44);

/** Una celda de rejilla donde las dos pestañas se apilan mientras se cruzan. */
function Capa({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 [&>*]:col-start-1 [&>*]:row-start-1">{children}</div>;
}

/**
 * Cambia la barra de direcciones sin avisar al router.
 *
 * Next parchea `window.history.pushState` —como propiedad propia del objeto
 * `history`, el del prototipo sigue siendo el nativo— para enterarse de los
 * cambios de URL. Pasarle una ruta distinta a la que sirvió desmonta y vuelve
 * a montar el árbol de la ruta, y con él el estado de la pestaña: la URL
 * cambiaba pero la ficha se quedaba en la de antes.
 *
 * Aquí la URL es sólo el nombre de lo que ya está en pantalla, así que se
 * escribe con el método nativo. Se conserva el `state` que tenía puesto Next
 * para que su propio manejador de `popstate` siga reconociendo la entrada y el
 * botón atrás no acabe en una recarga.
 */
let yaMontada = false;

function urlSilenciosa(href: string) {
  History.prototype.pushState.call(window.history, window.history.state, "", href);
}

export default function FichaRoute({ tab }: { tab: TabKey }) {
  /* Atrás y adelante sí pasan por el router de Next, que vuelve a montar este
     árbol con la pestaña que sirvió el servidor —siempre la misma, sea cual
     sea la entrada del historial a la que se vuelva—. Del segundo montaje en
     adelante la pestaña buena es la de la URL, no la de la prop; leerla ya en
     el primer render evita que se vea un fotograma de la pestaña equivocada.
     En el primero manda la prop, que es lo que hay en el HTML del servidor. */
  const [activa, setActiva] = useState<TabKey>(() =>
    (yaMontada && typeof window !== "undefined" ? tabDeRuta(window.location.pathname) : null) ?? tab);
  const [dir, setDir] = useState(0);
  /* El estado se lee dentro de un manejador, no en el render: un ref evita
     tener que recrear `cambia` en cada cambio de pestaña. */
  const ref = useRef(activa);

  useEffect(() => { yaMontada = true; }, []);

  const mueve = useCallback((k: TabKey) => {
    const antes = ref.current;
    if (antes === k) return;
    ref.current = k;
    setDir(TAB_INDEX[k] - TAB_INDEX[antes]);
    setActiva(k);
  }, []);

  const cambia = useCallback((k: TabKey) => {
    if (ref.current === k) return;
    mueve(k);
    urlSilenciosa(TAB_HREF[k]);
    /* En el lienzo la franja va justo debajo del hero, así que sólo se puede
       pulsar desde arriba del todo; si el lector había bajado un poco, se
       vuelve al principio de la pestaña nueva. En la vista fluida la franja
       está a una pantalla de scroll: llevarlo arriba sería arrancarlo de
       donde estaba, así que ahí se respeta la posición. */
    if (window.matchMedia("(min-width: 1280px)").matches && window.scrollY > 40) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [mueve]);

  /* Atrás y adelante del navegador. */
  useEffect(() => {
    const atras = () => {
      const k = tabDeRuta(window.location.pathname);
      if (k) mueve(k);
    };
    window.addEventListener("popstate", atras);
    return () => window.removeEventListener("popstate", atras);
  }, [mueve]);

  const Desktop = DESK[activa];
  const HeroC = HERO_COMPACT[activa];
  const BodyC = BODY_COMPACT[activa];

  return (
    <MotionConfig reducedMotion="user">
      <FichaTabsCtx.Provider value={cambia}>
        <Compact>
          <FichaShellCompact>
            {/* La franja de pestañas se queda entre el hero y el cuerpo,
                montada una sola vez: la píldora se desliza de una a otra en vez
                de desaparecer con la pestaña que se va. Hero y cuerpo se cruzan
                cada uno en su propia celda de rejilla, donde la pestaña que
                entra y la que sale se apilan mientras dura el cambio. */}
            <Capa>
              <AnimatePresence initial={false} custom={dir}>
                <motion.div key={activa} custom={dir} variants={V_COMPACT} initial="entra" animate="centro" exit="sale">
                  <HeroC />
                </motion.div>
              </AnimatePresence>
            </Capa>

            <TabsCompact active={activa} />

            <Capa>
              <AnimatePresence initial={false} custom={dir}>
                <motion.div key={activa} custom={dir} variants={V_COMPACT} initial="entra" animate="centro" exit="sale">
                  <BodyC />
                </motion.div>
              </AnimatePresence>
            </Capa>
          </FichaShellCompact>
        </Compact>

        <Desk>
          <ScaledCanvas width={1920} height={CANVAS_H[activa]} animateHeight>
            <div className="relative size-full" style={{ backgroundColor: CREAM }}>
              {/* La franja de pestañas, por debajo del contenido. */}
              <motion.div
                className="absolute left-0 w-full"
                style={{ height: TABS_H }}
                initial={false}
                animate={{ top: BAR_TOP[activa] }}
                transition={{ duration: 0.48, ease: EASE }}
              >
                <TabsFicha active={activa} />
              </motion.div>

              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={activa}
                  className="absolute inset-x-0 top-0"
                  style={{ height: CANVAS_H[activa], zIndex: 1 }}
                  custom={dir}
                  variants={V_DESK}
                  initial="entra"
                  animate="centro"
                  exit="sale"
                >
                  <Desktop />
                </motion.div>
              </AnimatePresence>

              {/* El nav, por encima de todo, como en los tres frames. */}
              <motion.div
                className="absolute left-0 top-0 w-full overflow-hidden"
                style={{ backgroundColor: BROWN, zIndex: 2 }}
                initial={false}
                animate={{ height: NAV[activa].h }}
                transition={{ duration: 0.48, ease: EASE }}
              >
                <motion.div className="absolute left-0 w-full" initial={false} animate={{ top: NAV[activa].y }} transition={{ duration: 0.48, ease: EASE }}>
                  <PrediosNav active="predios" geo="ficha" />
                </motion.div>
              </motion.div>
            </div>
          </ScaledCanvas>
        </Desk>
      </FichaTabsCtx.Provider>
    </MotionConfig>
  );
}
