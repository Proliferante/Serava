import { MARK, tinted } from "@/components/brand";

/* ═══════════════════════════════════════════════════════════════════════════
   «CARGANDO» — lo que se ve mientras llega algo del servidor.

   Antes era la palabra «Cargando…» sola, o una pantalla vacía: con la red
   lenta no se sabía si la página estaba esperando o se había quedado
   colgada. Aquí el monograma late dentro de un anillo que gira, y el texto
   dice qué se está esperando.

   Una sola pieza para la consola y la web: `tono` elige el color según el
   fondo. Con «reducir movimiento» del sistema, el anillo no gira y el
   monograma no late (ver `.zq-cargando` en styles/globals.css): queda el
   texto, que es lo que importa.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function Cargando({
  texto = "Cargando…",
  tono = "claro",
  pantalla = false,
}: {
  texto?: string;
  /** `claro` = sobre fondo claro (anillo café). `oscuro` = sobre fondo oscuro. */
  tono?: "claro" | "oscuro";
  /** Ocupa la pantalla entera, centrado: para la espera antes de que haya página. */
  pantalla?: boolean;
}) {
  const color = tono === "claro" ? "#8b5e34" : "#dfc59f";
  return (
    <div
      className={`zq-cargando${pantalla ? " zq-cargando-pantalla" : ""}`}
      role="status"
      aria-live="polite"
      style={{ color }}
    >
      <span className="zq-cargando-marca" aria-hidden>
        <span className="zq-cargando-anillo" style={{ borderColor: `${color}33`, borderTopColor: color }} />
        <span className="zq-cargando-mono" style={tinted(MARK, color)} />
      </span>
      <span className="zq-cargando-texto">{texto}</span>
    </div>
  );
}
