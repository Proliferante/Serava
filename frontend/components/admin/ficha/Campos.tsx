"use client";

import { useRef, type ReactNode } from "react";
import {
  lleno, type Bloque, type Campo, type Foto, type Valores,
} from "@/components/admin/ficha/esquema";
import { Btn, Card, IcoTrash, SecTitle } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   LOS CONTROLES DE LA FICHA — un bloque del esquema, dibujado.

   POR QUÉ ESTÁN AQUÍ Y NO DENTRO DE «ARMAR FICHA»
   Ahora hay dos pantallas que piden los mismos ciento veintinueve campos:
   «Armar la ficha», para el predio que vino del scraping y ya está en el
   flujo, y «Nuevo predio», para el que se registra a mano y se publica de
   una vez porque ya viene verificado.

   Si cada una dibujara su formulario, el esquema dejaría de ser la única
   fuente: añadir un campo obligatorio a la ficha lo dejaría pedido en una
   pantalla y olvidado en la otra, y el predio manual se publicaría sin él.
   Aquí no hay lógica de pantalla —ni guardado, ni pestañas, ni avance—:
   sólo cómo se ve un campo y cómo se ve una ranura de foto.
   ═══════════════════════════════════════════════════════════════════════════ */

const trazo = {
  fill: "none", stroke: "currentColor", strokeWidth: 1.9,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};
const IcoFoto = () => <svg viewBox="0 0 24 24" {...trazo}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M3 17l5-5 4 4 3-3 4 4" /></svg>;
const IcoMas = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M12 5v14M5 12h14" /></svg>;

/* ── Controles ───────────────────────────────────────────────────────────── */

/** Lista de líneas: las viñetas de la ficha. */
function Lineas({ v, lineas, onChange }: {
  v: unknown; lineas: number; onChange: (x: string[]) => void;
}) {
  /* Se completa hasta el número que propone el esquema para que el hueco se
     vea: una lista de ocho partidas que empieza con un solo campo parece un
     campo suelto, no una lista. */
  const base = Array.isArray(v) ? (v as string[]) : [];
  const filas = base.length >= lineas ? base : [...base, ...Array(lineas - base.length).fill("")];

  const set = (i: number, x: string) => {
    const c = [...filas];
    c[i] = x;
    onChange(c);
  };

  return (
    <div className="fic-lineas">
      {filas.map((x, i) => (
        <div key={i} className="fic-linea">
          <span className="n">{i + 1}</span>
          <input className="t" value={x} onChange={(e) => set(i, e.target.value)} />
          <button
            type="button" className="fic-quita" aria-label={`Quitar la línea ${i + 1}`}
            onClick={() => onChange(filas.filter((_, j) => j !== i))}
          >
            <IcoTrash />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-mini" onClick={() => onChange([...filas, ""])}>
        <IcoMas />Añadir línea
      </button>
    </div>
  );
}

/** Rejilla: la proyección año a año, el cronograma. */
function Rejilla({ v, columnas, filas, onChange }: {
  v: unknown; columnas: string[]; filas: number; onChange: (x: string[][]) => void;
}) {
  const base = Array.isArray(v) ? (v as string[][]) : [];
  const vacia = () => Array(columnas.length).fill("");
  const datos = base.length >= filas
    ? base
    : [...base, ...Array(filas - base.length).fill(null).map(vacia)];

  const set = (f: number, c: number, x: string) => {
    const copia = datos.map((fila) => [...fila]);
    while (copia[f].length < columnas.length) copia[f].push("");
    copia[f][c] = x;
    onChange(copia);
  };

  return (
    <div className="fic-rejilla" style={{ gridTemplateColumns: `repeat(${columnas.length}, minmax(0,1fr)) auto` }}>
      {columnas.map((c) => <span key={c} className="th">{c}</span>)}
      <span className="th" />
      {datos.map((fila, f) => (
        <FilaRejilla
          key={f} fila={fila} columnas={columnas} f={f}
          onSet={set} onQuitar={() => onChange(datos.filter((_, j) => j !== f))}
        />
      ))}
      <button
        type="button" className="btn btn-ghost btn-mini fic-rejilla-mas"
        onClick={() => onChange([...datos, vacia()])}
      >
        <IcoMas />Añadir fila
      </button>
    </div>
  );
}

function FilaRejilla({ fila, columnas, f, onSet, onQuitar }: {
  fila: string[]; columnas: string[]; f: number;
  onSet: (f: number, c: number, x: string) => void; onQuitar: () => void;
}) {
  return (
    <>
      {columnas.map((c, i) => (
        <input
          key={c} className="t" value={fila[i] ?? ""} aria-label={`${c}, fila ${f + 1}`}
          onChange={(e) => onSet(f, i, e.target.value)}
        />
      ))}
      <button type="button" className="fic-quita" aria-label={`Quitar la fila ${f + 1}`} onClick={onQuitar}>
        <IcoTrash />
      </button>
    </>
  );
}

function Control({ c, v, onChange }: { c: Campo; v: unknown; onChange: (x: unknown) => void }) {
  const id = `f-${c.k}`;
  const texto = typeof v === "string" || typeof v === "number" ? String(v) : "";

  if (c.tipo === "lista") return <Lineas v={v} lineas={c.lineas ?? 4} onChange={onChange} />;
  if (c.tipo === "tabla") {
    return <Rejilla v={v} columnas={c.columnas ?? []} filas={c.filas ?? 3} onChange={onChange} />;
  }
  if (c.tipo === "parrafo") {
    return <textarea className="t" id={id} value={texto} placeholder={c.ej} onChange={(e) => onChange(e.target.value)} />;
  }
  if (c.tipo === "opcion") {
    return (
      <select className="t" id={id} value={texto} onChange={(e) => onChange(e.target.value)}>
        <option value="">— sin elegir —</option>
        {(c.opciones ?? []).map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input
      className="t" id={id} type={c.tipo === "numero" ? "number" : "text"}
      value={texto} placeholder={c.ej}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * La propuesta, escrita como se imprime en ese campo.
 *
 * El backend propone NÚMEROS —el precio del anuncio son 2600000000 pesos— y
 * hay campos de la ficha que no llevan números, llevan cifras ya escritas:
 * «$2.600M». Aceptar la propuesta tal cual metía los diez dígitos en un sitio
 * donde el diseño enseña cuatro, y quien la aceptaba tenía que volver a
 * escribirla. Dos reglas, y las dos salen del propio esquema:
 *
 *   · un campo `cifra` con una propuesta numérica → millones, «$2.600M»;
 *   · el termómetro pide su número YA en millones («8,1»), así que una
 *     propuesta en pesos se divide.
 */
export function cifraEnMillones(n: number): string {
  return `$${Math.round(n / 1_000_000).toLocaleString("es-CO")}M`;
}

export function comoPropuesta(c: Campo, sug: unknown): string {
  const n = typeof sug === "number" ? sug : Number(sug);
  const esNumero = sug !== "" && sug != null && Number.isFinite(n);

  if (c.tipo === "cifra" && esNumero) return cifraEnMillones(n);
  if (c.tipo === "numero" && c.k.startsWith("termo_") && esNumero && n >= 1_000) {
    return (n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 });
  }
  return String(sug);
}

/** Un campo con su etiqueta, su ayuda y —si la hay— la propuesta. */
export function CampoCaja({ c, v, sugerido, aMano, onChange }: {
  c: Campo; v: unknown; sugerido: unknown;
  /** Predio metido a mano: no hay anuncio del que "usar" nada. */
  aMano: boolean;
  onChange: (x: unknown) => void;
}) {
  const ancho = c.ancho === "entero" || c.tipo === "lista" || c.tipo === "tabla" || c.tipo === "parrafo";
  /* La propuesta sólo se ofrece si el campo está vacío. Rellenarlo solo
     borraría lo que alguien escribió, y ofrecerlo sobre algo ya escrito es
     invitar a un clic que deshace trabajo. */
  const ofrecer = !lleno(v) && lleno(sugerido);
  const propuesta = ofrecer ? comoPropuesta(c, sugerido) : "";

  return (
    <div className={`fic-campo${ancho ? " ancho" : ""}`}>
      <label htmlFor={`f-${c.k}`}>
        {c.l}
        {c.req && <span className="fic-req" title="Hace falta para publicar"> ·  obligatorio</span>}
      </label>
      <Control c={c} v={v} onChange={onChange} />
      {c.ayuda && <p className="fic-ayuda">{c.ayuda}</p>}
      {ofrecer && (
        <button type="button" className="fic-sug" onClick={() => onChange(propuesta)}>
          {/* Un predio metido a mano no tiene anuncio del que copiar: lo que
              se propone es lo que alguien tecleó al registrarlo. */}
          {aMano ? "Usar lo registrado" : "Usar lo del anuncio"}: <b>{propuesta}</b>
        </button>
      )}
    </div>
  );
}

/* ── Fotos ───────────────────────────────────────────────────────────────── */

export function Ranura({ f, url, ocupado, listo, onElegir, onQuitar }: {
  f: Foto; url?: string; ocupado: boolean; listo: boolean;
  onElegir: (archivo: File) => void; onQuitar: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="fic-foto">
      <div className="fic-foto-marco" style={{ aspectRatio: f.ratio ?? "4 / 3" }}>
        {url
          /* `<img>` y no `next/image`: la foto vive en Supabase y el
             optimizador de Next exige declarar cada dominio remoto. Aquí es
             una miniatura de la consola interna, no una imagen del sitio. */
          ? <img src={url} alt="" loading="lazy" decoding="async" />
          : <span className="fic-foto-vacia"><IcoFoto />{ocupado ? "Subiendo…" : "Sin foto"}</span>}
        {ocupado && url && <span className="fic-foto-velo">Subiendo…</span>}
      </div>

      <div className="fic-foto-pie">
        <b>{f.l}{f.req && <span className="fic-req"> · obligatoria</span>}</b>
        {f.nota && <small>{f.nota}</small>}
      </div>

      <div className="fic-foto-acc">
        <input
          ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden
          onChange={(e) => {
            const a = e.target.files?.[0];
            /* Se limpia el input después de leer el archivo: sin esto, elegir
               la misma foto dos veces seguidas no dispara `change` y parece
               que el botón dejó de funcionar. */
            e.target.value = "";
            if (a) onElegir(a);
          }}
        />
        <Btn tono="ghost" className="btn-mini" disabled={!listo || ocupado} onClick={() => input.current?.click()}>
          {url ? "Cambiar" : "Subir foto"}
        </Btn>
        {url && <Btn tono="ghost" className="btn-mini" disabled={ocupado} onClick={onQuitar}><IcoTrash />Quitar</Btn>}
      </div>
    </div>
  );
}

/* ── Un bloque entero ────────────────────────────────────────────────────── */

export function BloqueCaja({
  b, valores, fotos, sugeridos, aMano, subiendo, almacenListo, onCampo, onSubir, onQuitar,
}: {
  b: Bloque;
  valores: Valores;
  fotos: Record<string, string>;
  sugeridos: Record<string, unknown>;
  aMano: boolean;
  subiendo: string | null;
  almacenListo: boolean;
  onCampo: (k: string, v: unknown) => void;
  onSubir: (ranura: string, archivo: File) => void;
  onQuitar: (ranura: string) => void;
}): ReactNode {
  return (
    <Card style={{ marginBottom: 14 }}>
      <SecTitle>{b.titulo}</SecTitle>
      {b.nota && <p className="fic-nota">{b.nota}</p>}

      {b.campos && b.campos.length > 0 && (
        <div className="fic-campos">
          {b.campos.map((c) => (
            <CampoCaja
              key={c.k} c={c} v={valores[c.k]}
              sugerido={c.sug ? sugeridos[c.sug] : undefined}
              aMano={aMano}
              onChange={(v) => onCampo(c.k, v)}
            />
          ))}
        </div>
      )}

      {b.fotos && b.fotos.length > 0 && (
        <div className="fic-fotos">
          {b.fotos.map((f) => (
            <Ranura
              key={f.k} f={f} url={fotos[f.k]} ocupado={subiendo === f.k} listo={almacenListo}
              onElegir={(a) => onSubir(f.k, a)} onQuitar={() => onQuitar(f.k)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
