/* ═══════════════════════════════════════════════════════════════════════════
   ÁREA DE CUENTA — el contenido de "Mi perfil" (688:4032) y "Configuración"
   (688:4280).

   Vive aparte porque las dos pantallas se dibujan dos veces: el lienzo de
   1920 y la vista fluida de móvil y tablet. Los textos, los valores de
   ejemplo y las opciones de cada desplegable salen del diseño, así que si
   cambian allí se cambian aquí una sola vez y las dos vistas siguen iguales.
   ═══════════════════════════════════════════════════════════════════════════ */

/** El inversionista de la maqueta. El avatar son sus iniciales. */
export const CUENTA = {
  iniciales: "NR",
  nombre: "Natalia",
  apellido: "Restrepo",
  correo: "natalia@ejemplo.com",
  telefono: "+57 300 123 4567",
  documento: "CC 1.234.567.890",
  /** `yyyy-mm-dd` porque va en un `<input type="date">`. */
  nacimiento: "1988-05-14",
  ciudad: "Bogotá",
  pais: "Colombia",
  direccion: "Cra. 7 #79-00, Bogotá",
  desde: "Inversionista desde 2024",
  canal: "Correo electrónico",
  horario: "Mañana (8–12)",
  gestor: "Juan P. Restrepo · Gestor ZEQUARA",
  idioma: "Español",
  moneda: "COP — Peso colombiano",
};

/** Las dos cifras del pie de la tarjeta de perfil. */
export const RESUMEN: { valor: string; etiqueta: string }[] = [
  { valor: "3", etiqueta: "Propiedades" },
  { valor: "$21M", etiqueta: "Renta/mes" },
];

export const PAISES = ["Colombia", "México", "Perú", "Chile", "España", "Estados Unidos"];
export const CANALES = ["Correo electrónico", "WhatsApp", "Llamada"];
export const HORARIOS = ["Mañana (8–12)", "Tarde (12–18)", "Cualquiera"];
export const IDIOMAS = ["Español", "English"];
export const MONEDAS = ["COP — Peso colombiano", "USD — Dólar"];

/** Los cinco avisos de Configuración, en el orden y con el estado del diseño. */
export const AVISOS: { id: string; titulo: string; detalle: string; activo: boolean }[] = [
  { id: "obra", titulo: "Avance de obra", detalle: "Cambios de estado y porcentaje de avance", activo: true },
  { id: "docs", titulo: "Documentos nuevos", detalle: "Contratos, presupuestos, actas", activo: true },
  { id: "aprob", titulo: "Aprobaciones requeridas", detalle: "Cuando un cambio necesita tu visto bueno", activo: true },
  { id: "asambleas", titulo: "Asambleas y operación", detalle: "Reuniones, mantenimiento y arriendo", activo: false },
  { id: "oportunidades", titulo: "Nuevas oportunidades", detalle: "Predios que encajan con tu perfil", activo: true },
];

/** Los dos destinos del menú del avatar, para no repetir las rutas. */
export const CUENTA_LINKS = [
  { href: "/cuenta/perfil", label: "Mi perfil" },
  { href: "/cuenta/configuracion", label: "Configuración" },
];
