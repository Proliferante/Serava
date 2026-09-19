"use client";

import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MARK } from "@/components/brand";
import { ENLACES } from "@/components/nav";

/* ═══════════════════════════════════════════════════════════════════════════
   BARRA FLOTANTE DE ESCRITORIO — la isla translúcida que aparece al bajar.

   EL PROBLEMA QUE RESUELVE
   La barra de la página (`Navbar`) vive DENTRO del lienzo de 1920, en
   `position: absolute`. O sea: se va con el primer scroll y no vuelve hasta
   que subas del todo. En un portátil de 1440×900 la home mide 7.080 px —ocho
   pantallas— y Cómo operamos 7.212. Durante siete de cada ocho pantallas no
   había ninguna forma de navegar.

   CUÁNDO APARECE
   En cuanto la barra de la página sale de pantalla, y ya no se va. No se
   retira al bajar como la de móvil: en un móvil la cabecera se come una
   franja valiosa de una pantalla pequeña y compensa esconderla, pero en un
   portátil 56 px de 900 no estorban, y tener que volver a subir para que
   aparezca el menú es exactamente el problema que esto venía a quitar.

   El umbral no es un número fijo: la barra de la página mide 173 px DE
   LIENZO, y el lienzo se escala al ancho de la ventana. En un portátil de
   1440 son 130 px reales; en un monitor de 2560, 231. Así que se calcula.

   POR QUÉ ES UN COMPONENTE APARTE Y NO LA MISMA BARRA CON `fixed`
   Dos razones. La primera es de tamaño: la de la página mide 173 px de lienzo
   con enlaces de 30; flotando se comería un quinto de la pantalla. Ésta es la
   variante compacta —56 px, enlaces de 15—.

   La segunda es técnica y no tiene vuelta: `position: fixed` dentro de un
   ancestro con `transform` deja de referirse a la ventana y pasa a referirse
   al ancestro. El lienzo va escalado con `transform`, así que una barra fija
   metida ahí dentro se desplazaría con la página. Tiene que vivir fuera del
   `ScaledCanvas`.

   POR QUÉ LA LÍNEA NO VA DENTRO DE LA ISLA
   Porque la isla se esconde al bajar, y es justo mientras bajas cuando
   interesa ver cuánto queda. Va suelta, al filo de la pantalla, igual que en
   móvil.
   ═══════════════════════════════════════════════════════════════════════════ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** Alto de la barra de la página, en coordenadas del lienzo de 1920. */
const NAVBAR_LIENZO = 173;

/** A partir de qué scroll aparece: cuando la barra de la página ya salió. */
function umbral() {
  if (typeof window === "undefined") return NAVBAR_LIENZO;
  return (NAVBAR_LIENZO * window.innerWidth) / 1920 + 12;
}

export default function NavFlotante() {
  const [escondida, setEscondida] = useState(true);
  const pathname = usePathname();

  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setEscondida(y < umbral()));

  const progreso = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });

  return (
    <>
      <motion.nav
        aria-label="Navegación flotante"
        className="fixed inset-x-0 top-[14px] z-[70] flex justify-center px-[24px]"
        initial={false}
        /* `visibility` además de la opacidad: con opacidad 0 a secas los
           enlaces siguen siendo enfocables con el tabulador, y se tabula a una
           barra que no se ve. Se apaga al terminar la animación de salida y se
           enciende al empezar la de entrada. */
        animate={escondida
          ? { y: -96, opacity: 0, transitionEnd: { visibility: "hidden" } }
          : { y: 0, opacity: 1, visibility: "visible" }}
        transition={{ duration: 0.34, ease: EASE }}
        style={{ pointerEvents: escondida ? "none" : "auto" }}
      >
        <div
          className="flex h-[56px] max-w-[1100px] flex-1 items-center gap-[10px] rounded-full pl-[20px] pr-[10px]"
          style={{
            // Translúcida: el marrón de marca al 70 % con desenfoque detrás,
            // para que se lea encima de la foto del hero y de las secciones
            // claras sin taparlas.
            background: "rgba(56,25,0,0.7)",
            backdropFilter: "blur(18px) saturate(140%)",
            WebkitBackdropFilter: "blur(18px) saturate(140%)",
            border: "1px solid rgba(247,241,229,0.14)",
            boxShadow: "0 18px 40px -22px rgba(0,0,0,0.75)",
          }}
        >
          <a href="/" aria-label="Zequara — Inicio" className="ix-nav block h-[28px] w-[30.7px] shrink-0">
            <img src={MARK} alt="" decoding="async" className="block size-full max-w-none" />
          </a>

          <div className="ml-[18px] flex flex-1 items-center gap-[26px]">
            {ENLACES.map((l) => {
              const aqui = pathname === l.href;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  aria-current={aqui ? "page" : undefined}
                  className="ix-navlink whitespace-nowrap text-[15px] font-medium"
                  style={{ color: aqui ? "#c9a877" : "rgba(247,241,229,0.88)" }}
                >
                  {l.label}
                </a>
              );
            })}
          </div>

          <a
            href="/login"
            className="ix-press flex h-[38px] shrink-0 items-center rounded-full border border-solid px-[20px] text-[14px] font-semibold"
            style={{ borderColor: "rgba(226,205,174,0.55)", color: "#e2cdae" }}
          >
            Iniciar sesión
          </a>
        </div>
      </motion.nav>

      {/* Progreso de lectura. Siempre visible, aunque la isla se haya ido. */}
      <motion.span
        aria-hidden
        className="fixed inset-x-0 top-0 z-[71] block h-[3px] origin-left"
        style={{ scaleX: progreso, background: "linear-gradient(90deg, #a57a4e 0%, #c9a877 100%)" }}
      />
    </>
  );
}
