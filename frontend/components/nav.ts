/* ═══════════════════════════════════════════════════════════════════════════
   LOS ENLACES DEL MENÚ, EN UN SOLO SITIO.

   Estaban escritos a mano en la barra de escritorio, en la de móvil y en los
   dos pies de página. Cuando «Oportunidades» pasó a «Proyectos realizados»
   hubo que cambiarlo en cuatro archivos, y ese es el tipo de cosa que se
   queda a medias sin que nadie se entere.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Enlace = { href: string; label: string };

export const ENLACES: Enlace[] = [
  { href: "/", label: "Inicio" },
  { href: "/modelo", label: "¿Cómo operamos?" },
  { href: "/oportunidades", label: "Proyectos realizados" },
  { href: "/hub", label: "HUB" },
];
