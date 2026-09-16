import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import PrediosCompact from "@/components/responsive/predios/PrediosCompact";
import Image from "next/image";
import PredioCard from "@/components/predios/PredioCard";
import PrediosNav from "@/components/predios/PrediosNav";
import { FILTERS, PREDIOS } from "@/components/predios/data";
import { conMuestra, fechaLarga, listaPredios, type PredioPublicado } from "@/lib/predios";

/* ═══════════════════════════════════════════════════════════════════════════
   PREDIOS — reproducción del frame de Figma 100:2349 (1920 × 2850).

   YA NO SON OCHO TARJETAS ESCRITAS A MANO
   El portafolio lo trae `GET /api/predios`: lo que el equipo publicó desde la
   consola, con su ficha armada. El lienzo crece por filas de tres, los
   contadores del encabezado salen de los datos y cada tarjeta lleva a SU
   ficha, no todas a la misma.

   MIENTRAS NO HAYA NADA PUBLICADO salen las ocho del diseño, que son de
   muestra. Se apagan con `NEXT_PUBLIC_PREDIOS_MUESTRA=0` y entonces la
   página dice la verdad: que todavía no hay oportunidades. Eso es lo que
   tiene que quedar encendido el día que esto se enseñe a un inversionista.

   Nav, encabezado sobre el degradado oscuro, la barra de seis filtros y la
   rejilla de ocho oportunidades (3 + 3 + 2).

   Las torres de fondo (image 9 e image 10) se pintan encima del encabezado y
   por debajo de la barra de filtros, como en el orden de capas del diseño.
   ═══════════════════════════════════════════════════════════════════════════ */

const A = "/figma";
const CANVAS_W = 1920;

/**
 * Rejilla de tarjetas (311:3742). Los valores van literales y no calculados a
 * partir del alto de la tarjeta: `PredioCard` es un componente de cliente, y
 * las constantes que exporta llegan a este server component como referencia,
 * no como número — al operar con ellas saldría `NaN`.
 */
const COLS = [380, 772, 1164];
/** Primera fila, salto entre filas y alto de tarjeta, del frame. */
const FILA_1 = 780.19;
const SALTO = 668.03;
const CARD_H = 644.03;
/** Lo que el frame deja por debajo de la última fila. */
const PIE = 89.72;

/** El lienzo crece con las filas. Con tres (las ocho del diseño) da 2850. */
function altoLienzo(n: number) {
  const filas = Math.max(1, Math.ceil(n / 3));
  return FILA_1 + (filas - 1) * SALTO + CARD_H + PIE;
}

const CREAM = "#f7f1e5";
const LASER = "#c9a877";
const LINE = "rgba(165,122,78,0.28)";

/* ── Datos ───────────────────────────────────────────────────────────────── */




/* ── Piezas ──────────────────────────────────────────────────────────────── */

const Chevron = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 9.5l6 6 6-6" />
  </svg>
);

/** Desplegable de la barra de filtros. Sin lógica todavía: no hay catálogo. */
function Select({ label, value, x, w }: (typeof FILTERS)[number]) {
  return (
    <div className="absolute" style={{ left: x, top: 589, width: w }}>
      <span className="block uppercase" style={{ fontSize: 11, lineHeight: "17px", fontWeight: 600, letterSpacing: "1.5px", color: "#fde8d3" }}>
        {label}
      </span>
      <button
        type="button"
        className="ix-press mt-[6px] flex h-[38px] w-full items-center justify-between rounded-[11px] border border-solid px-[15px]"
        style={{ borderColor: LINE, background: "#efe6d5" }}
      >
        <span className="truncate" style={{ fontSize: 14, color: "#2a1e14" }}>{value}</span>
        <span style={{ color: "#5b4332" }}><Chevron /></span>
      </button>
    </div>
  );
}

export const revalidate = 60;

export default async function PrediosPage() {
  const { predios, actualizado } = await listaPredios();

  /* Lo publicado manda. Si no hay nada, las de muestra — mientras el
     interruptor las deje pasar. */
  const reales = predios.length > 0;
  const lista: PredioPublicado[] = reales
    ? predios
    : conMuestra()
      ? (PREDIOS as PredioPublicado[])
      : [];

  const enReserva = lista.filter((x) => x.badge.label.startsWith("Reserva")).length;
  const disponibles = lista.length - enReserva;
  const fecha = fechaLarga(actualizado) ?? "14 de julio";
  const CANVAS_H = altoLienzo(lista.length);

  return (
    <main className="bg-cream">
      <Compact><PrediosCompact predios={lista} /></Compact>
      <Desk>
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        <div className="relative size-full" style={{ background: "linear-gradient(0deg, #E2CDAE 0.02%, #492100 82.77%), #FFF" }}>
          {/* ── Velo del encabezado (Header, 100:2351) ──
              La clave está en el alfa de la parada final: el degradado muere en
              `rgba(73,34,2,0.45)`, así que la mitad de abajo deja ver el
              degradado de la página y funde con él. Antes esto era un bloque
              opaco de 681 px con una base `#2a1e14` sólida: tapaba el degradado
              y cortaba en seco justo debajo de la barra de filtros. */}
          <div
            className="pointer-events-none absolute left-0 w-full"
            style={{ top: 81.81, height: 487.975, backgroundImage: "linear-gradient(180.016deg, #2a1e14 0%, rgba(73,34,2,0.45) 99.945%)" }}
          />

          {/* ── Encabezado (100:2351) ── */}
          <div className="absolute flex items-center gap-[12px]" style={{ left: 392, top: 152.39 }}>
            <span className="h-px w-[32px] opacity-80" style={{ background: LASER }} />
            <span className="uppercase" style={{ fontSize: 11, lineHeight: "18px", fontWeight: 600, letterSpacing: "3.2px", color: LASER }}>
              Oportunidades disponibles
            </span>
          </div>
          <h1
            className="absolute m-0"
            style={{ left: 392, top: 214.95, width: 560, fontSize: 48, lineHeight: "55px", letterSpacing: "-1.2px", fontWeight: 300, color: CREAM }}
          >
            Activos seleccionados<br />para <span style={{ fontWeight: 600 }}>crear valor.</span>
          </h1>
          <p
            className="absolute m-0"
            style={{ left: 392, top: 366.25, width: 580, fontSize: 16, lineHeight: "26.5px", fontWeight: 300, color: "rgba(247,241,229,0.78)" }}
          >
            Predios curados por Zequara en zonas consolidadas, con demanda activa, oferta limitada y potencial de transformación.
          </p>
          <span className="absolute" style={{ left: 392, top: 474.79, width: 1136, height: 1, background: "rgba(247,241,229,0.14)" }} />

          {/* Torres decorativas — image 9 e image 10 (207:1208 / 207:1210).
              Las dos tienen la misma estructura: una caja que recorta y, dentro,
              la imagen estirada muy por encima del ancho de la caja.

              En `image 9` estaba puesto como ancho de la caja el de la imagen
              interior (1986 px = 450,34 % de 441). Eso la convertía en una torre
              enorme cruzando el encabezado. No se notaba porque el bloque opaco
              que había antes la tapaba; al pasar el velo al alfa 0,45 del diseño,
              salió a la vista.
              Con la caja en sus 441 px reales la torre cae en x = −624…−183, o sea
              fuera del lienzo: en Figma tampoco se ve dentro del frame. Queda en
              el código, y no borrada, porque es una capa del diseño. */}
          <div className="pointer-events-none absolute overflow-hidden" style={{ left: -624, top: -140, width: 441, height: 2979 }}>
            <Image
              src={`${A}/1603eea0cdf422fdf4ee349b5d252c4253213488.webp`}
              alt=""
              width={1986}
              height={2979}
              sizes="103.44vw"
              className="absolute left-0 top-0 h-full max-w-none opacity-10"
              style={{ width: "450.34%" }}
            />
          </div>
          <div className="pointer-events-none absolute overflow-hidden" style={{ left: 996, top: 633, width: 931, height: 2217 }}>
            {/* Esta torre se estira al 158,84 % del ancho de su caja, así que no
                puede ir en modo `fill`: ese modo fija el ancho en línea y ganaría
                al de aquí. Con `width`/`height` normales Next los escribe como
                atributos, que el CSS sí sobreescribe. */}
            <Image
              src={`${A}/1603eea0cdf422fdf4ee349b5d252c4253213488.webp`}
              alt=""
              width={1479}
              height={2217}
              sizes="77.03vw"
              className="absolute left-0 top-0 h-full max-w-none opacity-10"
              style={{ width: "158.84%" }}
            />
          </div>

          {/* ── Barra de filtros (100:3062) ── */}
          <div
            className="absolute"
            style={{ left: 118, top: 570, width: 1739, height: 111, borderRadius: 24, background: "#3b2410", borderBottom: `1px solid ${LINE}` }}
          />
          {FILTERS.map((f) => <Select key={f.label} {...f} />)}
          <button
            type="button"
            className="ix-press absolute underline"
            style={{ left: 1704, top: 609, width: 99, height: 43, fontSize: 13.6, color: "#ffffff" }}
          >
            Limpiar filtros
          </button>

          {/* ── Nav (100:3121) — compartida con Mis propiedades ──
              La franja va aquí, y no con el velo del encabezado, porque en el
              diseño el nav queda por encima de las torres decorativas: la de la
              izquierda arranca en y = −140 y le pasaría por delante.
              `PrediosNav` no pinta fondo (lo comparte con Mis propiedades, que
              lo lleva distinto), así que el plano lo pone la página. */}
          <div className="absolute left-0 top-0 w-full" style={{ height: 81.81, backgroundColor: "#2a1e14" }} />
          <PrediosNav active="predios" geo="predios" />

          {/* ── Cifras del portafolio (311:4896 / 4902 / 4906) ── */}
          <span className="absolute" style={{ left: 393, top: 492.81, width: 9, height: 9, borderRadius: 999, background: "#7f8b57" }} />
          <p className="absolute m-0 whitespace-nowrap" style={{ left: 411, top: 486, fontSize: 14, lineHeight: "21px", color: "rgba(247,241,229,0.82)" }}>
            <b style={{ fontWeight: 600, color: LASER }}>{disponibles}</b> {disponibles === 1 ? "oportunidad disponible" : "oportunidades disponibles"}
          </p>
          <p className="absolute m-0 whitespace-nowrap" style={{ left: 660, top: 486, fontSize: 14, lineHeight: "21px", color: "rgba(247,241,229,0.82)" }}>
            <b style={{ fontWeight: 600, color: LASER }}>{enReserva}</b> en proceso de reserva
          </p>
          <p className="absolute m-0 whitespace-nowrap" style={{ left: 875, top: 486, fontSize: 14, lineHeight: "21px", color: "rgba(247,241,229,0.82)" }}>
            Portafolio actualizado el <b style={{ fontWeight: 600, color: LASER }}>{fecha}</b>
          </p>

          {/* ── Rejilla (311:3734) ── */}
          <p className="absolute m-0" style={{ left: 380, top: 728, fontSize: 16.5, lineHeight: "26px", fontWeight: 600, color: CREAM }}>
            {lista.length} {lista.length === 1 ? "oportunidad disponible" : "oportunidades disponibles"}
          </p>
          <p className="absolute m-0 whitespace-nowrap text-right" style={{ right: 388, top: 732, fontSize: 13.5, lineHeight: "20px", fontWeight: 300, color: "rgba(247,241,229,0.6)" }}>
            Portafolio limitado · actualización mensual
          </p>
          {lista.map((p, i) => (
            <PredioCard
              key={p.slug ?? p.title}
              x={COLS[i % 3]}
              y={FILA_1 + Math.floor(i / 3) * SALTO}
              data={p}
              delay={(i % 3) * 0.08}
              /* Sin slug es una tarjeta de muestra: lleva al prototipo. */
              href={p.slug ? `/predios/ficha/${p.slug}` : "/predios/ficha"}
            />
          ))}

          {/* Todavía no hay nada publicado, y las de muestra están apagadas. */}
          {lista.length === 0 && (
            <div
              className="absolute flex flex-col items-center justify-center text-center"
              style={{ left: 380, top: FILA_1, width: 1152, height: CARD_H, borderRadius: 18, border: `1px dashed ${LINE}`, background: "rgba(247,241,229,0.04)" }}
            >
              <p className="m-0" style={{ fontSize: 26, lineHeight: "34px", fontWeight: 300, color: CREAM }}>
                Todavía no hay oportunidades publicadas.
              </p>
              <p className="m-0" style={{ marginTop: 12, maxWidth: 560, fontSize: 15, lineHeight: "24px", fontWeight: 300, color: "rgba(247,241,229,0.7)" }}>
                El portafolio se actualiza cada mes. En cuanto entre un activo que cumpla los
                criterios de Zequara, aparecerá aquí con su ficha completa.
              </p>
            </div>
          )}
        </div>
      </ScaledCanvas>
      </Desk>
    </main>
  );
}
