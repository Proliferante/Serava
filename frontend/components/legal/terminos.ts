import type { DocumentoLegal } from "@/components/legal/LegalPage";

/* ═══════════════════════════════════════════════════════════════════════════
   TÉRMINOS Y CONDICIONES DE USO — el texto, tal cual el PDF firmado.

   Fuente: `public/legal/zequara-terminos-y-condiciones.pdf` (septiembre de
   2026). Se transcribe sin reescribir: es un documento legal, y una coma
   cambiada aquí es una diferencia con el que revisó el abogado. Si cambia,
   se cambian los dos —el PDF y esto— y la fecha de `actualizado`.
   ═══════════════════════════════════════════════════════════════════════════ */

export const TERMINOS: DocumentoLegal = {
  titulo: "Términos y Condiciones de Uso",
  bajada: "Documento público para el sitio web y la plataforma privada de gestión de inversión en finca raíz.",
  empresa: "SAVVY BRIDGE S.A.S. · NIT 901786091-1",
  actualizado: "Septiembre de 2026",
  pdf: "/legal/zequara-terminos-y-condiciones.pdf",
  aviso: {
    titulo: "Importante",
    texto:
      "ZEQUARA es una plataforma de gestión de inversión en finca raíz. Los análisis, escenarios, retornos estimados, Score ZEQUARA y demás proyecciones dependen de supuestos y no constituyen garantía de resultados futuros.",
  },
  secciones: [
    {
      titulo: "Identificación y aceptación",
      parrafos: [
        "Estos Términos regulan el acceso y uso de los canales digitales y la plataforma ZEQUARA, operada por SAVVY BRIDGE S.A.S., NIT 901786091-1. Al registrarse, acceder a una cuenta o utilizar funcionalidades de la plataforma, el usuario declara haber leído y aceptado estos Términos, sin perjuicio de las condiciones específicas contenidas en contratos particulares.",
      ],
    },
    {
      titulo: "Objeto de ZEQUARA",
      parrafos: [
        "ZEQUARA es una plataforma orientada a la gestión de inversión en finca raíz y al seguimiento de oportunidades y activos inmobiliarios. Dependiendo del servicio contratado, podrá permitir al usuario consultar y gestionar información relacionada con oportunidades, análisis, adquisición, diseño, transformación, obra, renta, administración, seguimiento y eventual salida de activos.",
      ],
    },
    {
      titulo: "Alcance de la información",
      parrafos: [
        "La plataforma puede mostrar información proveniente de ZEQUARA, propietarios, proveedores, fuentes de mercado y otros terceros. ZEQUARA procurará mantener información razonablemente actualizada, pero determinados datos pueden cambiar o contener desfases temporales. Cuando exista contradicción entre un dato mostrado en la plataforma y un documento contractual o registro oficial aplicable, prevalecerá este último.",
      ],
    },
    {
      titulo: "Proyecciones, escenarios y Score ZEQUARA",
      parrafos: [
        "Las cifras de rentabilidad, TIR, CAP rate, valorización, arriendo esperado, precio de salida, costos, plazos y demás indicadores son estimaciones sujetas a supuestos y riesgos. No representan una promesa ni garantía de rentabilidad, valorización, liquidez, ocupación o resultado. El Score ZEQUARA es una metodología propia de análisis y no reemplaza avalúos, estudios de títulos, inspecciones técnicas, asesoría tributaria, jurídica o financiera independiente.",
      ],
    },
    {
      titulo: "Registro y creación de cuenta",
      parrafos: [
        "Algunas funcionalidades requieren una cuenta individual. El usuario deberá suministrar información verdadera, completa y actualizada. ZEQUARA podrá solicitar validaciones de identidad adicionales cuando sean necesarias para seguridad, prevención de fraude, acceso a información sensible o cumplimiento legal.",
      ],
    },
    {
      titulo: "Cuenta personal e intransferible",
      parrafos: [
        "La cuenta, credenciales y mecanismos de autenticación son personales e intransferibles. El usuario no podrá compartir sus credenciales, prestar su cuenta ni permitir que terceros ingresen usando su identidad digital. Cuando requiera acceso para un tercero autorizado, deberá solicitar un perfil o permiso independiente cuando la funcionalidad esté disponible.",
      ],
    },
    {
      titulo: "Seguridad y autenticación",
      lista: [
        "ZEQUARA podrá exigir autenticación multifactor, códigos de un solo uso, verificación de correo, teléfono, dispositivo u otros controles razonables.",
        "El usuario es responsable de proteger sus credenciales, dispositivos y correo asociado a la cuenta.",
        "El usuario deberá reportar de inmediato accesos no reconocidos, pérdida de dispositivos, posible suplantación o compromiso de credenciales.",
        "ZEQUARA podrá cerrar sesiones, exigir cambio de credenciales o aplicar verificaciones adicionales cuando detecte actividad inusual.",
      ],
    },
    {
      titulo: "Trazabilidad y registros electrónicos",
      parrafos: [
        "Por razones de seguridad, soporte, auditoría y resolución de controversias, ZEQUARA podrá conservar registros de autenticación, accesos, actividad, aceptaciones, solicitudes, documentos consultados o cargados y otros eventos relevantes dentro de la plataforma. Las actuaciones electrónicas podrán producir los efectos reconocidos por la legislación colombiana, sin perjuicio de formalidades especiales que resulten exigibles para ciertos actos.",
      ],
    },
    {
      titulo: "Permisos y acceso por proyecto o activo",
      parrafos: [
        "La existencia de una cuenta no otorga acceso a toda la información de ZEQUARA. Los permisos podrán limitarse según usuario, rol, activo, proyecto, servicio contratado y etapa de la relación. Está prohibido intentar acceder a información de otros usuarios, activos o proyectos no autorizados.",
      ],
    },
    {
      titulo: "Información confidencial",
      parrafos: [
        "La plataforma puede contener información confidencial sobre activos, propietarios, clientes, proveedores, precios, negociaciones, presupuestos, diseños, documentos jurídicos, modelos financieros, metodología y oportunidades no públicas. El usuario no podrá divulgar, comercializar, copiar masivamente ni utilizar esta información para fines diferentes a su relación autorizada con ZEQUARA.",
      ],
    },
    {
      titulo: "Descargas y documentos",
      parrafos: [
        "ZEQUARA podrá permitir o restringir descargas. Una vez descargado un documento, el usuario deberá protegerlo adecuadamente. ZEQUARA podrá aplicar marcas, identificadores u otros controles de trazabilidad cuando resulte razonable.",
      ],
    },
    {
      titulo: "Instrucciones y operaciones sensibles",
      parrafos: [
        "El registro de una solicitud dentro de la plataforma no implica necesariamente su ejecución inmediata. ZEQUARA podrá exigir confirmación adicional para operaciones sensibles, modificaciones de datos, instrucciones relacionadas con recursos, documentos contractuales, cambios de cuenta bancaria, venta de activos, autorizaciones a terceros u otras actuaciones relevantes.",
      ],
    },
    {
      titulo: "Suspensión o bloqueo preventivo",
      parrafos: [
        "ZEQUARA podrá limitar o suspender temporalmente una cuenta cuando exista una razón objetiva relacionada con seguridad, posible fraude, suplantación, incumplimiento de estos Términos, protección de terceros, requerimiento de autoridad o riesgo para la integridad de la plataforma. Cuando sea razonablemente posible, informará al usuario sobre los pasos requeridos para recuperar el acceso.",
      ],
    },
    {
      titulo: "Uso permitido y conductas prohibidas",
      lista: [
        "Utilizar la plataforma únicamente para fines lícitos y relacionados con los servicios autorizados.",
        "No realizar scraping, crawling, extracción automatizada, ingeniería inversa o acceso masivo no autorizado.",
        "No interferir con la seguridad, disponibilidad o funcionamiento de la plataforma.",
        "No cargar malware, código malicioso o contenido que infrinja derechos de terceros.",
        "No suplantar personas ni intentar eludir controles de autenticación o permisos.",
      ],
    },
    {
      titulo: "Integraciones y terceros",
      parrafos: [
        "ZEQUARA podrá integrarse con proveedores tecnológicos y servicios de terceros. Algunas funcionalidades pueden depender de dichos servicios y estar sujetas a disponibilidad externa. La utilización de terceros no modifica las obligaciones de protección de datos que correspondan a ZEQUARA como Responsable o a dichos terceros como Encargados cuando aplique.",
      ],
    },
    {
      titulo: "Disponibilidad y mantenimiento",
      parrafos: [
        "ZEQUARA procurará mantener la plataforma disponible, pero no garantiza operación ininterrumpida. Podrán existir mantenimientos, actualizaciones, fallas de infraestructura, incidentes de seguridad, indisponibilidad de terceros o eventos de fuerza mayor. El usuario no deberá asumir que una instrucción crítica fue ejecutada únicamente porque fue enviada: deberá verificar su estado en la plataforma o mediante los canales habilitados.",
      ],
    },
    {
      titulo: "Decisiones de inversión",
      parrafos: [
        "La visualización de una oportunidad o análisis no constituye por sí sola una orden de compra, venta, inversión, transferencia de recursos o aceptación contractual. Las decisiones que requieran consentimiento del cliente deberán completarse conforme al procedimiento contractual y de autorización aplicable a cada operación.",
      ],
    },
    {
      titulo: "Titularidad y estructura de las operaciones",
      parrafos: [
        "La titularidad, adquisición, financiación, transformación, administración y salida de cada activo se regirán por los documentos particulares de la operación. Salvo que se establezca expresamente otra estructura, la plataforma no sustituye los contratos, escrituras, autorizaciones ni formalidades necesarias para cada negocio inmobiliario.",
      ],
    },
    {
      titulo: "Propiedad intelectual",
      parrafos: [
        "La marca ZEQUARA, Score ZEQUARA, metodologías, contenidos, diseños, modelos, estructuras de información, fichas, gráficos, software y materiales propios son de titularidad de SAVVY BRIDGE S.A.S. o se utilizan con autorización. El acceso a la plataforma no transfiere derechos de propiedad intelectual.",
      ],
    },
    {
      titulo: "Responsabilidad del usuario",
      parrafos: [
        "El usuario es responsable de la información que suministra, del uso de su cuenta y del cumplimiento de las obligaciones derivadas de los contratos particulares. También deberá mantener medidas razonables de seguridad sobre sus dispositivos y credenciales.",
      ],
    },
    {
      titulo: "Limitación razonable de responsabilidad tecnológica",
      parrafos: [
        "ZEQUARA no será responsable por consecuencias directamente atribuibles a credenciales compartidas voluntariamente, dispositivos comprometidos bajo control del usuario, conectividad ajena a ZEQUARA, información falsa suministrada por el usuario o actos de terceros que no hubieran podido evitarse razonablemente mediante los controles implementados. Esta cláusula no excluye responsabilidades que legalmente no puedan limitarse.",
      ],
    },
    {
      titulo: "Protección de datos",
      parrafos: [
        "El tratamiento de datos personales se regirá por la Política de Tratamiento de Datos Personales de ZEQUARA y por la legislación colombiana aplicable.",
      ],
    },
    {
      titulo: "Terminación de acceso",
      parrafos: [
        "ZEQUARA podrá terminar o modificar accesos cuando termine la relación contractual, el usuario deje de estar autorizado sobre un proyecto, exista incumplimiento, riesgo de seguridad o requerimiento legal. La terminación del acceso no extingue obligaciones previamente causadas ni derechos derivados de contratos vigentes.",
      ],
    },
    {
      titulo: "Modificaciones",
      parrafos: [
        "ZEQUARA podrá modificar estos Términos por cambios normativos, tecnológicos, operativos o en sus servicios. La versión vigente se publicará indicando la fecha de actualización. Cuando un cambio sea material y resulte aplicable, podrá comunicarse por los canales disponibles.",
      ],
    },
    {
      titulo: "Ley aplicable y contacto",
      parrafos: ["Estos Términos se rigen por las leyes de la República de Colombia."],
      contacto: [
        { k: "Razón social", v: "SAVVY BRIDGE S.A.S. · NIT 901786091-1" },
        { k: "Marca", v: "ZEQUARA" },
        { k: "Sitio web", v: "www.zequara.com", href: "https://www.zequara.com" },
        { k: "Correo", v: "servicioalcliente@savvybridge.com.co", href: "mailto:servicioalcliente@savvybridge.com.co" },
      ],
    },
  ],
};
