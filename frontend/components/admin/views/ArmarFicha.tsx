"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useConsola } from "@/components/admin/ctx";
import { useSesion } from "@/components/admin/sesion";
import {
  avance, faltantes, FICHA, lleno,
  type Bloque, type Campo, type Foto, type PestanaFicha, type Valores,
} from "@/components/admin/ficha/esquema";
import { Btn, Card, Hint, IcoBack, IcoCheck, IcoExt, IcoTrash, SecTitle } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   ARMAR LA FICHA — el paso que faltaba antes de publicar.

   QUÉ PROBLEMA RESUELVE
   El flujo llevaba un inmueble de la preselección a "publicado" con un modal
   de seis campos, y publicar no era más que cambiar la etapa en la base: la
   ficha que ve el inversionista —sus tres pestañas, sus ciento veinte datos,
   sus quince fotos— estaba escrita a mano en el código del sitio. No existía
   sitio donde poner la información real de un predio.

   Esta pantalla es ese sitio. No inventa una estructura nueva: repite la de
   la ficha. Los bloques llevan el título que llevan en la página, van en el
   orden en que se leen ahí, y cada campo dice dónde sale. Quien la rellena
   tiene la ficha en la cabeza, no un modelo de datos.

   NO DIBUJA EL FORMULARIO A MANO
   Lo recorre de `ficha/esquema.ts`. Eso es lo que hace que añadir un campo
   sea una línea en el esquema y no una visita a este archivo — y va a hacer
   falta, porque el diseño se mueve.

   GUARDAR Y PUBLICAR SON DOS COSAS
   Armar una ficha no se hace de una sentada: las cifras las pone Data, el
   alcance lo pone Arquitectura, y las fotos llegan cuando llegan. "Guardar
   borrador" deja el trabajo hecho sin mover el inmueble de etapa. "Publicar"
   es lo que lo mueve, y exige lo mínimo — lo que la ficha no puede enseñar
   vacío sin quedar rota.

   LAS FOTOS SE SUBEN SOLAS
   En cuanto se elige el archivo, no al guardar. Una foto de hero son varios
   megas y esperar a "Guardar" significaría una barra de progreso de treinta
   segundos al final de todo, con el riesgo de perderlo si se cierra antes.
   Cada foto viaja a su ranura y queda escrita ahí sola.
   ═══════════════════════════════════════════════════════════════════════════ */

type Respuesta = {
  ficha: Valores;
  fotos: Record<string, string>;
  publicada: boolean;
  guardada_en: string | null;
  guardada_por: string | null;
  sugeridos: Record<string, unknown>;
  almacen_listo: boolean;
};

const trazo = {
  fill: "none", stroke: "currentColor", strokeWidth: 1.9,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
};
const IcoFoto = () => <svg viewBox="0 0 24 24" {...trazo}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M3 17l5-5 4 4 3-3 4 4" /></svg>;
const IcoGuardar = () => <svg viewBox="0 0 24 24" {...trazo}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></svg>;
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

/** Un campo con su etiqueta, su ayuda y —si la hay— la propuesta del anuncio. */
function CampoCaja({ c, v, sugerido, aMano, onChange }: {
  c: Campo; v: unknown; sugerido: unknown; aMano: boolean; onChange: (x: unknown) => void;
}) {
  const ancho = c.ancho === "entero" || c.tipo === "lista" || c.tipo === "tabla" || c.tipo === "parrafo";
  /* La propuesta sólo se ofrece si el campo está vacío. Rellenarlo solo
     borraría lo que alguien escribió, y ofrecerlo sobre algo ya escrito es
     invitar a un clic que deshace trabajo. */
  const ofrecer = !lleno(v) && lleno(sugerido);

  return (
    <div className={`fic-campo${ancho ? " ancho" : ""}`}>
      <label htmlFor={`f-${c.k}`}>
        {c.l}
        {c.req && <span className="fic-req" title="Hace falta para publicar"> ·  obligatorio</span>}
      </label>
      <Control c={c} v={v} onChange={onChange} />
      {c.ayuda && <p className="fic-ayuda">{c.ayuda}</p>}
      {ofrecer && (
        <button type="button" className="fic-sug" onClick={() => onChange(String(sugerido))}>
          {/* Un predio metido a mano no tiene anuncio del que copiar: lo que
              se propone es lo que alguien tecleó al registrarlo. */}
          {aMano ? "Usar lo registrado" : "Usar lo del anuncio"}: <b>{String(sugerido)}</b>
        </button>
      )}
    </div>
  );
}

/* ── Fotos ───────────────────────────────────────────────────────────────── */

function Ranura({ f, url, ocupado, listo, onElegir, onQuitar }: {
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

/* ── Vista ───────────────────────────────────────────────────────────────── */

export default function ArmarFicha() {
  const { av, go, fichaAbierta } = useConsola();
  const { pedir } = useSesion();

  const link = fichaAbierta?.link ?? "";
  const nombre = fichaAbierta?.titulo ?? "";

  const [pestana, setPestana] = useState<PestanaFicha["k"]>("comun");
  const [valores, setValores] = useState<Valores>({});
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [sugeridos, setSugeridos] = useState<Record<string, unknown>>({});
  const [almacenListo, setAlmacenListo] = useState(true);
  const [publicada, setPublicada] = useState(false);
  const [guardadaPor, setGuardadaPor] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [sucio, setSucio] = useState(false);

  useEffect(() => {
    if (!link) { setCargando(false); return; }
    let vivo = true;
    setCargando(true);
    setError(null);
    pedir<Respuesta>(`/api/admin/flujo/ficha?link=${encodeURIComponent(link)}`)
      .then((d) => {
        if (!vivo) return;
        setValores(d.ficha ?? {});
        setFotos(d.fotos ?? {});
        setSugeridos(d.sugeridos ?? {});
        setAlmacenListo(d.almacen_listo);
        setPublicada(d.publicada);
        setGuardadaPor(d.guardada_por);
        setSucio(false);
      })
      .catch((e) => { if (vivo) setError((e as Error).message); })
      .finally(() => { if (vivo) setCargando(false); });
    return () => { vivo = false; };
  }, [link, pedir]);

  /* Aviso del navegador al cerrar con cambios sin guardar. Es lo único que
     puede hacerse: no hay enrutado, así que no hay navegación que interceptar
     dentro de la propia consola — de eso se encarga el botón de volver. */
  useEffect(() => {
    if (!sucio) return;
    const antes = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", antes);
    return () => window.removeEventListener("beforeunload", antes);
  }, [sucio]);

  const set = useCallback((k: string, v: unknown) => {
    setValores((prev) => ({ ...prev, [k]: v }));
    setSucio(true);
  }, []);

  const guardar = async () => {
    if (guardando) return;
    setGuardando(true);
    try {
      const d = await pedir<{ guardada_en: string }>("/api/admin/flujo/ficha", {
        method: "POST",
        body: JSON.stringify({ link, ficha: valores }),
      });
      setSucio(false);
      av("Borrador guardado · " + new Date(d.guardada_en).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      av((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const falta = useMemo(() => faltantes(valores, fotos), [valores, fotos]);

  const publicar = async () => {
    if (guardando || falta.length) return;
    setGuardando(true);
    try {
      await pedir("/api/admin/flujo/completar", {
        method: "POST",
        body: JSON.stringify({
          link,
          /* Los cuatro que tienen columna propia viajan aparte además de
             dentro de la ficha: son los que el resto del flujo consulta y
             ordena, y no pueden vivir sólo dentro de un JSON. */
          titulo: (valores.hero_titulo as string) || null,
          habitaciones: Number(valores.spec_habitaciones) || null,
          banos: Number(valores.spec_banos) || null,
          area_confirmada_m2: Number(valores.spec_area) || null,
          tipo_transformacion: (valores.transformacion_tipo as string) || null,
          ficha: valores,
        }),
      });
      setSucio(false);
      setPublicada(true);
      av("Inmueble publicado con su ficha");
      go("flujo");
    } catch (e) {
      av((e as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  const subirFoto = async (ranura: string, archivo: File) => {
    setSubiendo(ranura);
    try {
      const cuerpo = new FormData();
      cuerpo.append("link", link);
      cuerpo.append("ranura", ranura);
      cuerpo.append("archivo", archivo);
      const d = await pedir<{ url: string }>("/api/admin/flujo/ficha/foto", { method: "POST", body: cuerpo });
      setFotos((prev) => ({ ...prev, [ranura]: d.url }));
      av("Foto subida");
    } catch (e) {
      av((e as Error).message);
    } finally {
      setSubiendo(null);
    }
  };

  const quitarFoto = async (ranura: string) => {
    setSubiendo(ranura);
    try {
      await pedir("/api/admin/flujo/ficha/foto/quitar", {
        method: "POST",
        body: JSON.stringify({ link, ranura }),
      });
      setFotos((prev) => {
        const c = { ...prev };
        delete c[ranura];
        return c;
      });
      av("Foto quitada");
    } catch (e) {
      av((e as Error).message);
    } finally {
      setSubiendo(null);
    }
  };

  const volver = () => {
    if (sucio && !window.confirm("Hay cambios sin guardar en la ficha. ¿Salir de todos modos?")) return;
    go("flujo");
  };

  /** Cuántos campos de cada pestaña llevan respuesta, para las pestañas. */
  const porPestana = useMemo(() => {
    const cuenta = (p: PestanaFicha) => {
      const campos = p.bloques.flatMap((b) => b.campos ?? []);
      const imgs = p.bloques.flatMap((b) => b.fotos ?? []);
      const hechos = campos.filter((c) => lleno(valores[c.k])).length + imgs.filter((f) => !!fotos[f.k]).length;
      return { hechos, total: campos.length + imgs.length };
    };
    return Object.fromEntries(FICHA.map((p) => [p.k, cuenta(p)])) as Record<
      PestanaFicha["k"], { hechos: number; total: number }
    >;
  }, [valores, fotos]);

  const total = avance(valores, fotos);
  const actual = FICHA.find((p) => p.k === pestana)!;

  if (!link) {
    return (
      <section className="view active">
        <Card><div className="empty">Entra desde el flujo de inmuebles: hay que elegir sobre qué predio se arma la ficha.</div></Card>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="crumb" style={{ marginBottom: 14 }}>
        <button type="button" className="fic-volver" onClick={volver}><IcoBack />Flujo de inmuebles</button>
        <span className="sep">/</span>
        <span className="cur">Armar la ficha</span>
      </div>

      <div className="vhead">
        <div>
          <h1>Armar la <b>ficha</b></h1>
          <p>
            Lo que se escriba aquí es lo que verá el inversionista en las tres pestañas de la ficha.
            Los bloques van en el mismo orden que la página y con su mismo título.
          </p>
        </div>
        <div className="fic-acciones">
          <Btn tono="ghost" onClick={guardar} disabled={guardando || cargando}>
            <IcoGuardar />{guardando ? "Guardando…" : "Guardar borrador"}
          </Btn>
          <Btn
            tono="primary" onClick={publicar} disabled={guardando || cargando || falta.length > 0}
            title={falta.length ? `Falta: ${falta.slice(0, 4).join(", ")}${falta.length > 4 ? "…" : ""}` : undefined}
          >
            <IcoCheck />{publicada ? "Volver a publicar" : "Publicar"}
          </Btn>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div className="fic-cab">
          <div>
            <b>{nombre || "(sin título)"}</b>
            <a className="urllink" href={link} target="_blank" rel="noopener">Ver publicación <IcoExt /></a>
          </div>
          <div className="fic-avance">
            <span>{total.hechos} de {total.total} campos</span>
            <span className="barra"><span style={{ width: `${total.pct}%` }} /></span>
            <span className="pct">{total.pct}%</span>
          </div>
        </div>
        {guardadaPor && <Hint style={{ marginTop: 10 }}>Última edición: {guardadaPor}.</Hint>}
        {!almacenListo && (
          <div className="maqueta-note" style={{ marginTop: 12, marginBottom: 0 }}>
            <svg viewBox="0 0 24 24" {...trazo}><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
            <p>
              <b>Las fotos no se pueden subir todavía.</b> Falta configurar el almacén
              (<code>SUPABASE_URL</code> y <code>SUPABASE_SERVICE_KEY</code> en el backend).
              El resto del formulario funciona y se guarda con normalidad.
            </p>
          </div>
        )}
      </Card>

      <div className="flow-tabs">
        {FICHA.map((p) => (
          <button
            key={p.k} type="button"
            className={`flow-tab${pestana === p.k ? " active" : ""}`}
            onClick={() => setPestana(p.k)}
          >
            {p.l} <span className="cnt">{porPestana[p.k].hechos}/{porPestana[p.k].total}</span>
          </button>
        ))}
      </div>

      {cargando && <Card><div className="empty">Cargando la ficha…</div></Card>}

      {!cargando && error && (
        <Card>
          <div className="empty">
            <b style={{ color: "var(--terra)" }}>No se pudo leer la ficha.</b><br />{error}
          </div>
        </Card>
      )}

      {!cargando && !error && (
        <>
          <Hint style={{ margin: "-4px 0 16px" }}>{actual.nota}</Hint>

          {actual.bloques.map((b) => (
            <BloqueCaja
              key={b.k} b={b} valores={valores} fotos={fotos} sugeridos={sugeridos}
              aMano={link.startsWith("manual:")}
              subiendo={subiendo} almacenListo={almacenListo}
              onCampo={set}
              onSubir={subirFoto} onQuitar={quitarFoto}
            />
          ))}

          {falta.length > 0 && (
            <Card>
              <SecTitle>Falta para poder publicar</SecTitle>
              <ul className="fic-falta">
                {falta.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </Card>
          )}
        </>
      )}
    </section>
  );
}

function BloqueCaja({
  b, valores, fotos, sugeridos, aMano, subiendo, almacenListo, onCampo, onSubir, onQuitar,
}: {
  b: Bloque;
  valores: Valores;
  fotos: Record<string, string>;
  sugeridos: Record<string, unknown>;
  /** Predio metido a mano: no hay anuncio del que "usar" nada. */
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
