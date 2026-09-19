/* ═══════════════════════════════════════════════════════════════════════════
   «VOLVER AL INICIO» PARA EL LIENZO DE ESCRITORIO.

   Las pantallas de acceso y de solicitud no llevan el menú: su única salida
   era el logotipo de la cabecera, y ahí no funciona como tal. En el lienzo
   mide 175 × 29 px de diseño, que en un portátil de 1440 se quedan en 131 × 21
   sobre una foto — nadie lee eso como un botón para volver.

   Es el hermano de `Volver` (components/responsive/kit.tsx), que hace lo mismo
   en la vista fluida. Aquí va en absoluto porque el lienzo es de medidas fijas.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function VolverAlInicio({
  x, y, tono = "oscuro",
}: {
  /** Coordenadas del lienzo de 1920. */
  x: number;
  y: number;
  /** `oscuro` = sobre fondo oscuro (texto claro). */
  tono?: "oscuro" | "claro";
}) {
  const color = tono === "oscuro" ? "rgba(247,241,229,0.72)" : "#5b4332";
  return (
    <a
      href="/"
      className="ix-nav absolute inline-flex items-center gap-[8px] whitespace-nowrap font-medium"
      style={{ left: x, top: y, fontSize: 15.7, lineHeight: "24px", color }}
    >
      <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      Volver al inicio
    </a>
  );
}
