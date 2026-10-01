/* ═══════════════════════════════════════════════════════════════════════════
   AUTORIZACIÓN DE DATOS — lo que dicen los formularios, en un solo sitio.

   Tres piezas, como pidió la revisión legal:
     · el aviso breve (quién recoge, para qué, y el enlace a la política);
     · la casilla de autorización, sin premarcar y obligatoria. Es una casilla
       aparte: aceptar términos o haber leído la política no la sustituye;
     · la evidencia: qué texto se aceptó, de qué versión de la política y
       cuándo. `evidencia()` arma ese registro.

   OJO: hoy los formularios no envían nada (no hay endpoint). Cuando exista el
   POST, tiene que llevar `consentimiento: evidencia(...)` y el backend guardar
   eso junto con la IP y la hora del servidor. Sin eso no hay prueba de la
   autorización, que es lo que la ley pide conservar.
   ═══════════════════════════════════════════════════════════════════════════ */

export const POLITICA_URL = "/privacidad";
/** Sube cuando cambie el texto de `privacidad.ts`. */
export const POLITICA_VERSION = "2026-09";

const POLITICA_NOMBRE = "Política de Tratamiento de Datos Personales";

export const AUTORIZACION = {
  solicitud:
    "Autorizo a SAVVY BRIDGE S.A.S. (Zequara) a tratar mis datos personales para evaluar mi perfil de inversión y contactarme durante este proceso, según la",
  boletin: "Autorizo a Zequara (SAVVY BRIDGE S.A.S.) a usar mi correo para enviarme su boletín mensual, según la",
} as const;

export type Finalidad = keyof typeof AUTORIZACION;

/** Aviso breve de privacidad: quién, para qué y qué puedes hacer. */
export const AVISO_SOLICITUD =
  "SAVVY BRIDGE S.A.S. (Zequara), NIT 901786091-1, es responsable de estos datos. Los usamos sólo para evaluar tu perfil y contactarte. Puedes conocerlos, actualizarlos, rectificarlos o pedir que los borremos cuando quieras.";

/** Lo que se guarda como prueba de que la persona autorizó. */
export function evidencia(finalidad: Finalidad) {
  return {
    finalidad,
    texto: `${AUTORIZACION[finalidad]} ${POLITICA_NOMBRE}.`,
    politica_version: POLITICA_VERSION,
    aceptado_en: new Date().toISOString(),
  };
}

/** El enlace a la política, para dentro del texto de la casilla. Abre en otra
    pestaña: quien lo pulsa está a medio formulario. */
export function EnlacePolitica({ className, style, children = POLITICA_NOMBRE }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode }) {
  return (
    <a
      href={POLITICA_URL}
      target="_blank"
      rel="noopener"
      className={`underline underline-offset-[3px] ${className ?? ""}`}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  );
}
