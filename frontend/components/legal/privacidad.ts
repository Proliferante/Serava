import type { DocumentoLegal } from "@/components/legal/LegalPage";

/* ═══════════════════════════════════════════════════════════════════════════
   POLÍTICA DE TRATAMIENTO DE DATOS PERSONALES — el texto, tal cual el Word.

   Fuente: `ZEQUARA_01_Politica_Tratamiento_Datos_Personales.docx` (septiembre
   de 2026). Igual que los términos, se transcribe sin reescribir. Si cambia,
   se cambia aquí, la fecha de `actualizado` y `POLITICA_VERSION` en
   `consentimiento.ts`: las autorizaciones guardan la versión que se aceptó.

   Lo único que no es del Word es la `nota` de la sección de cookies: el Word
   habla de lo que el sitio *podrá* usar, y la nota dice lo que usa hoy. Si se
   añade analítica o un píxel, hay que cambiar la nota (y poner el aviso de
   cookies con su gestión de preferencias, que hoy no hace falta).
   ═══════════════════════════════════════════════════════════════════════════ */

/** Los dos datos que el Word dejó en blanco, confirmados aparte (octubre de
    2026). Si cambian, cambian aquí y en el Word. */
export const DIRECCION = "Carrera 56 # 152 - 77, Bogotá";
export const CORREO_PRIVACIDAD = "servicioalcliente@savvybridge.com.co";

const correo = { v: CORREO_PRIVACIDAD, href: CORREO_PRIVACIDAD.includes("@") ? `mailto:${CORREO_PRIVACIDAD}` : undefined };

export const PRIVACIDAD: DocumentoLegal = {
  titulo: "Política de Tratamiento de Datos Personales",
  destacado: "Datos Personales",
  bajada: "Documento público para sitio web, formularios y usuarios de la plataforma.",
  empresa: "SAVVY BRIDGE S.A.S. · NIT 901786091-1",
  actualizado: "Septiembre de 2026",
  aviso: {
    titulo: "Objeto",
    texto:
      "Informar de forma clara cómo SAVVY BRIDGE S.A.S., a través de ZEQUARA, recolecta, usa, conserva, comparte y protege los datos personales de titulares relacionados con la plataforma y sus servicios.",
  },
  secciones: [
    {
      titulo: "Responsable del tratamiento",
      parrafos: ["El Responsable del Tratamiento es SAVVY BRIDGE S.A.S., identificada con NIT 901786091-1, operadora de la marca ZEQUARA."],
      lista: [
        "Sitio web: www.zequara.com",
        `Dirección: ${DIRECCION}`,
        `Correo para asuntos de privacidad y habeas data: ${CORREO_PRIVACIDAD}`,
      ],
    },
    {
      titulo: "Marco normativo",
      tabla: [
        { k: "Ley 1581 de 2012", v: "Régimen general de protección de datos personales en Colombia." },
        { k: "Decreto 1074 de 2015", v: "Reglamentación aplicable al tratamiento, autorizaciones, políticas, avisos y relaciones responsable-encargado." },
        { k: "Ley 527 de 1999", v: "Reconocimiento jurídico de mensajes de datos y actuaciones electrónicas." },
        { k: "Normas complementarias", v: "Las que modifiquen, adicionen o sustituyan las anteriores y las instrucciones de la SIC que resulten aplicables." },
      ],
    },
    {
      titulo: "Alcance",
      parrafos: [
        "Esta política aplica a los datos personales tratados por ZEQUARA en su sitio web, formularios, plataforma privada, procesos comerciales, relaciones contractuales, actividades de servicio al cliente, gestión de activos inmobiliarios y comunicaciones relacionadas con sus servicios.",
      ],
    },
    {
      titulo: "Datos que podemos tratar",
      lista: [
        "Datos de identificación y contacto: nombre, documento de identidad, correo, teléfono, ciudad y país.",
        "Datos profesionales y de vinculación: empresa, cargo, actividad económica y demás información suministrada por el titular.",
        "Datos relacionados con intereses y operaciones inmobiliarias: preferencias, inmuebles de interés, características de activos, solicitudes, documentos y datos necesarios para gestionar la relación con ZEQUARA.",
        "Datos contractuales, transaccionales, contables y de facturación cuando exista una relación de servicio.",
        "Datos de uso de la plataforma: fecha y hora de acceso, actividad de cuenta, eventos de autenticación, registros técnicos, dispositivo, dirección IP y trazabilidad necesaria para seguridad, auditoría y soporte.",
        "Información que el titular entregue voluntariamente en reuniones, formularios, solicitudes o comunicaciones.",
      ],
      cierre: ["ZEQUARA procurará recolectar únicamente la información necesaria, pertinente y adecuada para las finalidades autorizadas."],
    },
    {
      titulo: "Finalidades del tratamiento",
      lista: [
        "Atender solicitudes de información, contacto, registro y soporte.",
        "Crear, administrar y autenticar cuentas de usuario en la plataforma ZEQUARA.",
        "Validar identidad y prevenir fraude, suplantación, accesos no autorizados y otros incidentes de seguridad.",
        "Presentar oportunidades, análisis, contenidos o servicios inmobiliarios coherentes con la relación del titular con ZEQUARA.",
        "Gestionar procesos de vinculación, contratación, adquisición, transformación, administración, seguimiento o salida de activos cuando corresponda.",
        "Gestionar documentos, solicitudes, autorizaciones y comunicaciones asociadas a proyectos inmobiliarios.",
        "Realizar facturación, contabilidad, recaudo, cumplimiento contractual y gestión administrativa.",
        "Mantener trazabilidad de accesos, cambios, aceptaciones, documentos y acciones relevantes realizadas dentro de la plataforma.",
        "Realizar análisis estadísticos, de producto, uso, experiencia y mejora de servicios, preferiblemente de manera agregada cuando sea posible.",
        "Enviar información comercial, educativa o promocional cuando exista autorización o una base legal aplicable.",
        "Cumplir obligaciones legales, contractuales, regulatorias y requerimientos de autoridades competentes.",
      ],
    },
    {
      titulo: "Autorización y tratamiento",
      parrafos: [
        "Cuando la ley exija autorización, ZEQUARA solicitará al titular una manifestación previa, expresa e informada y conservará evidencia razonable de dicha autorización. El titular podrá abstenerse de autorizar finalidades comerciales no necesarias para la prestación del servicio.",
      ],
    },
    {
      titulo: "Datos sensibles y datos de menores",
      parrafos: [
        "ZEQUARA no busca recolectar datos sensibles salvo cuando sean estrictamente necesarios y exista fundamento legal para su tratamiento. En esos casos informará el carácter facultativo de su entrega y solicitará autorización explícita cuando corresponda. ZEQUARA no dirige sus servicios a menores de edad y evitará recolectar sus datos salvo que exista una necesidad legítima, autorización válida y observancia de las reglas especiales aplicables.",
      ],
    },
    {
      titulo: "Derechos de los titulares",
      lista: [
        "Conocer, actualizar y rectificar sus datos personales.",
        "Solicitar prueba de la autorización cuando sea procedente.",
        "Ser informado sobre el uso dado a sus datos.",
        "Presentar consultas, solicitudes y reclamos.",
        "Solicitar la supresión de datos y/o revocar la autorización cuando legalmente proceda.",
        "Acceder gratuitamente a sus datos personales en los términos previstos por la ley.",
        "Presentar quejas ante la Superintendencia de Industria y Comercio una vez agotado el trámite correspondiente ante el Responsable, cuando ello sea exigible.",
      ],
    },
    {
      titulo: "Procedimiento para consultas y reclamos",
      parrafos: [
        `Las solicitudes relacionadas con datos personales deberán enviarse a ${CORREO_PRIVACIDAD}. La solicitud deberá identificar al titular, describir claramente lo solicitado y aportar la información razonablemente necesaria para validar identidad y atender la petición.`,
        "ZEQUARA atenderá consultas y reclamos dentro de los términos establecidos por la legislación colombiana aplicable. Cuando una solicitud esté incompleta, podrá requerir al titular para que la complete.",
      ],
    },
    {
      titulo: "Encargados, proveedores y terceros",
      parrafos: [
        "ZEQUARA podrá apoyarse en proveedores de tecnología, infraestructura, almacenamiento, comunicaciones, CRM, analítica, servicios profesionales, administración inmobiliaria y otros servicios necesarios para su operación. Cuando dichos terceros actúen como Encargados del Tratamiento deberán tratar la información conforme a las instrucciones de ZEQUARA y las obligaciones legales aplicables.",
      ],
    },
    {
      titulo: "Transmisiones y transferencias internacionales",
      parrafos: [
        "Algunos proveedores tecnológicos pueden procesar o almacenar información fuera de Colombia. ZEQUARA adoptará los mecanismos legales y contractuales que correspondan según la naturaleza de la operación y la normativa aplicable.",
      ],
    },
    {
      titulo: "Seguridad de la información",
      parrafos: [
        "ZEQUARA adopta medidas administrativas, técnicas y organizacionales razonables para proteger los datos contra pérdida, adulteración, consulta, uso o acceso no autorizado o fraudulento. Estas medidas pueden incluir controles de acceso, autenticación, registros de actividad, gestión de permisos, respaldo y procedimientos de respuesta a incidentes.",
      ],
    },
    {
      titulo: "Cookies y tecnologías similares",
      parrafos: [
        "Los canales digitales de ZEQUARA podrán utilizar cookies y tecnologías similares para funciones esenciales, seguridad, analítica y mejora de experiencia. Cuando resulte exigible, se habilitarán mecanismos para informar y gestionar preferencias.",
      ],
      nota: {
        titulo: "Lo que usa este sitio hoy",
        lista: [
          "Una cookie de sesión (zq_sesion), sólo si inicias sesión en la plataforma. Es esencial: sin ella no se puede mantener la sesión abierta. No la puede leer ningún script de la página, viaja sólo a nuestro servidor y caduca a las 12 horas, o antes si sales o pasan dos horas sin actividad.",
          "Una marca en el almacenamiento de la pestaña (sessionStorage) para no repetirte el aviso de tamaño de pantalla. No contiene datos personales y se borra al cerrar la pestaña.",
          "No usamos cookies de analítica, de publicidad ni píxeles de terceros. Si eso cambia, lo diremos aquí y te pediremos permiso antes de activarlas.",
        ],
      },
    },
    {
      titulo: "Vigencia y conservación",
      parrafos: [
        "Los datos se conservarán durante el tiempo razonablemente necesario para cumplir las finalidades autorizadas, obligaciones contractuales, deberes legales, defensa de derechos y necesidades de seguridad o auditoría. Posteriormente serán eliminados, anonimizados o conservados de acuerdo con la base legal aplicable.",
      ],
    },
    {
      titulo: "Cambios a esta política",
      parrafos: [
        "ZEQUARA podrá actualizar esta política para reflejar cambios normativos, tecnológicos u operativos. La versión vigente se publicará en el sitio web indicando su fecha de actualización.",
      ],
    },
    {
      titulo: "Contacto",
      contacto: [
        { k: "Razón social", v: "SAVVY BRIDGE S.A.S. · NIT 901786091-1" },
        { k: "Marca", v: "ZEQUARA" },
        { k: "Sitio web", v: "www.zequara.com", href: "https://www.zequara.com" },
        { k: "Dirección", v: DIRECCION },
        { k: "Correo de privacidad", ...correo },
      ],
    },
  ],
};
