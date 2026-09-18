/* ═══════════════════════════════════════════════════════════════════════════
   TEXTOS QUE SE REPITEN EN VARIAS PANTALLAS.

   POR QUÉ EXISTE ESTE ARCHIVO
   La llamada a la acción principal del sitio estaba escrita a mano en once
   sitios, y había derivado en cuatro textos distintos para el mismo botón:
   «Solicitar Entrevista» en el home, «Solicitar acceso» en Cómo operamos y
   Oportunidades, «Solicita acceso» en los dos pies de página y «Solicitar
   acceso a Zequara» en el login. Nadie lo hizo a propósito: pasa siempre que
   el mismo texto vive en once archivos.

   Las observaciones pedían unificarlo, así que el texto vive aquí y las
   pantallas lo importan. Cambiarlo es cambiar una línea.

   BOTÓN Y ENLACE NO LLEVAN EL MISMO TEXTO, Y ES A PROPÓSITO
   El botón grande dice la frase entera —es la promesa, y ahí hay sitio—. Los
   enlaces del menú y del pie son navegación: en una píldora del nav o en una
   columna del footer, «Quiero acceder al portafolio» no cabe sin partirse en
   tres renglones. Lo que estaba mal no era tener dos registros, era tener
   cuatro versiones del mismo botón.
   ═══════════════════════════════════════════════════════════════════════════ */

/** El botón principal. Hero, cierres de sección, cabeceras de pantalla. */
export const CTA_PORTAFOLIO = "Quiero acceder al portafolio";

/** El mismo destino, en formato de enlace de navegación. */
export const CTA_PORTAFOLIO_CORTO = "Solicitar acceso";

/** A dónde va, en los dos casos. */
export const CTA_PORTAFOLIO_HREF = "/solicitud-acceso";

/* ── Terminología ─────────────────────────────────────────────────────────
   El sitio se contradecía: «acceso sin membresía» en Cómo operamos,
   «inversionistas aprobados» en Login y Oportunidades, «sin membresía ni
   comisión» en Solicitud de acceso. Se eligió la narrativa de MEMBRESÍA
   (Opción A del plan de edición): lo que no se paga es la suscripción, no la
   membresía, y quien entra es miembro.

   Que estas palabras estén aquí y no sueltas en cada pantalla es lo que
   permite cambiar de narrativa sin volver a buscarlas una por una. */

/** Cómo se llama a quien ya tiene acceso. */
export const MIEMBROS = "inversionistas miembros";

/** Lo que de verdad no se cobra. Sustituye a «acceso sin membresía». */
export const SIN_SUSCRIPCION = "Sin pagos por suscripción";

/* ── El presupuesto ───────────────────────────────────────────────────────
   Tal y como estaba redactado —«los hallazgos técnicos se incorporan al
   presupuesto inicial»— se podía leer al revés de lo que pasa: como si la obra
   pudiera encarecerse sobre la marcha. El mensaje tiene que aparecer igual en
   Cómo operamos y en la ficha del predio, así que vive aquí. */

/** Qué protege el presupuesto: el alcance ya costeado. */
export const PRESUPUESTO_CERRADO_1 =
  "El presupuesto es cerrado: el alcance se costea antes de empezar y los "
  + "hallazgos de obra no lo modifican.";

/** Lo único que sí puede moverlo, y siempre con aprobación previa. */
export const PRESUPUESTO_CERRADO_2 =
  "Solo los cambios de diseño que tú solicites se cotizan y se aprueban antes "
  + "de ejecutarse.";

/** Las dos frases seguidas, para donde quepa el mensaje entero. */
export const PRESUPUESTO_CERRADO = `${PRESUPUESTO_CERRADO_1} ${PRESUPUESTO_CERRADO_2}`;

/* ── Aviso legal ──────────────────────────────────────────────────────────
   Va en el pie de todas las pantallas públicas y en la ficha del predio: es
   la frontera entre informar y recomendar, y conviene que esté donde se
   están mirando las cifras, no sólo en una página de términos. */

export const DISCLAIMER =
  "Zequara no recomienda compras puntuales: presenta datos y análisis para que "
  + "cada inversionista tome sus propias decisiones.";
