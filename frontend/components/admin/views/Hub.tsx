"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import { useSesion } from "@/components/admin/sesion";
import {
  Btn, Card, EstLibre, Grid, Hint, IcoEdit, IcoExt, IcoPlus, IcoTrash,
  SecTitle, Tabla, VHead,
} from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENIDO DEL HUB — lo que se publica en la página /hub.

   El HUB enseña una rejilla de tarjetas de tres tipos —artículo, video y
   noticia— en cinco categorías. Hasta ahora esas ocho tarjetas estaban
   escritas a mano en el código y con `href="#"`: se veían bien y no llevaban
   a ninguna parte. Esto es lo que las convierte en contenido de verdad.

   SÓLO ADMIN Y COMERCIAL
   Publicar aquí es hablar en la web pública con la voz de la empresa, que no
   es lo mismo que mover un inmueble de etapa. El menú lo esconde para los
   demás roles y el backend lo exige con `exige_rol("admin", "comercial")` —
   esconderlo es comodidad, lo que protege es el 403.

   EL TÍTULO SE ESCRIBE ENTERO
   El diseño parte el titular y la descripción en renglones porque el lienzo
   es de medidas fijas. Pedirle eso a quien escribe sería absurdo: aquí se
   teclea el texto seguido y es la tarjeta la que lo reparte.

   BORRADOR Y PUBLICADO SON DOS COSAS
   Guardar no publica. Un contenido a medias se guarda y no sale en la web
   hasta que alguien marca «publicado», igual que la ficha del predio.
   ═══════════════════════════════════════════════════════════════════════════ */

type Item = {
  slug: string;
  tipo: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  meta: string;
  enlace: string;
  foto: string | null;
  pie_foto: string;
  destacado: boolean;
  publicado: boolean;
  orden: number;
  creado_en?: string;
  creado_por?: string;
};

type Opciones = {
  tipos: { k: string; l: string }[];
  categorias: string[];
  almacen_listo: boolean;
};

const VACIO: Item = {
  slug: "", tipo: "article", categoria: "Patrimonio", titulo: "",
  descripcion: "", meta: "", enlace: "", foto: null, pie_foto: "",
  destacado: false, publicado: false, orden: 0,
};

/** El color del chip de cada tipo, para distinguirlos de un vistazo. */
const TONO: Record<string, string> = {
  article: "#5b7c99", video: "#8a5a9e", noticia: "#a8794a",
};

/** «Video · 4:20», «6 min de lectura», «Noticia · Jun 2026». */
const EJEMPLO_META: Record<string, string> = {
  article: "6 min de lectura",
  video: "Video · 4:20",
  noticia: "Noticia · Jun 2026",
};

function Formulario({ inicial, opciones, subir, onGuardar, onCancelar }: {
  inicial: Item;
  opciones: Opciones;
  subir: (a: File) => Promise<string>;
  onGuardar: (d: Item) => void;
  onCancelar: () => void;
}) {
  const [d, setD] = useState<Item>(inicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const campo = <K extends keyof Item>(k: K, v: Item[K]) => setD((x) => ({ ...x, [k]: v }));

  const elegirFoto = async (a: File) => {
    setSubiendo(true);
    setError(null);
    try {
      campo("foto", await subir(a));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubiendo(false);
    }
  };

  const falta = !d.titulo.trim();

  return (
    <>
      <MCuerpo>
        <Grid cols={2}>
          <div>
            <label htmlFor="hb-tipo">Tipo</label>
            <select
              className="t" id="hb-tipo" value={d.tipo}
              onChange={(e) => {
                const t = e.target.value;
                setD((x) => ({ ...x, tipo: t, meta: x.meta || EJEMPLO_META[t] || "" }));
              }}
            >
              {opciones.tipos.map((t) => <option key={t.k} value={t.k}>{t.l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hb-cat">Categoría</label>
            <select className="t" id="hb-cat" value={d.categoria}
                    onChange={(e) => campo("categoria", e.target.value)}>
              {opciones.categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Grid>

        <label htmlFor="hb-tit" style={{ marginTop: 14, display: "block" }}>Título</label>
        <input
          className="t" id="hb-tit" value={d.titulo} maxLength={160}
          placeholder="Zonas donde la demanda defiende el valor por sí sola"
          onChange={(e) => campo("titulo", e.target.value)}
        />
        <Hint>Escríbelo seguido. La tarjeta lo reparte en renglones sola.</Hint>

        <label htmlFor="hb-desc" style={{ marginTop: 14, display: "block" }}>Descripción</label>
        <textarea
          className="t" id="hb-desc" value={d.descripcion} maxLength={600} rows={3}
          placeholder="Qué hace que un terreno sostenga su precio sin depender de la moda."
          onChange={(e) => campo("descripcion", e.target.value)}
        />

        <Grid cols={2} style={{ marginTop: 14 }}>
          <div>
            <label htmlFor="hb-meta">Pie de la tarjeta</label>
            <input
              className="t" id="hb-meta" value={d.meta} maxLength={80}
              placeholder={EJEMPLO_META[d.tipo]}
              onChange={(e) => campo("meta", e.target.value)}
            />
            <Hint>Lo que va abajo del todo: duración, minutos de lectura o fecha.</Hint>
          </div>
          <div>
            <label htmlFor="hb-ord">Orden</label>
            <input
              className="t" id="hb-ord" type="number" value={d.orden}
              onChange={(e) => campo("orden", Number(e.target.value) || 0)}
            />
            <Hint>Más bajo, más arriba en la rejilla.</Hint>
          </div>
        </Grid>

        <label htmlFor="hb-url" style={{ marginTop: 14, display: "block" }}>Enlace</label>
        <input
          className="t" id="hb-url" value={d.enlace} maxLength={500}
          placeholder="https://… (el artículo, el video o la nota)"
          onChange={(e) => campo("enlace", e.target.value)}
        />
        <Hint>A dónde lleva al pulsarla. Sin esto la tarjeta no acciona nada.</Hint>

        {/* ── Imagen ── */}
        <SecTitle style={{ marginTop: 20 }}>Imagen</SecTitle>
        {!opciones.almacen_listo && (
          <Hint style={{ marginTop: 6 }}>
            El almacén de fotos no está configurado, así que no se pueden subir
            imágenes. El resto del formulario funciona.
          </Hint>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 8 }}>
          <div
            style={{
              width: 168, height: 105, borderRadius: 10, overflow: "hidden",
              background: d.foto ? `center/cover url(${d.foto})` : "rgba(91,67,50,.08)",
              border: "1px solid var(--line)", flexShrink: 0,
              display: "grid", placeItems: "center", fontSize: ".72rem", color: "var(--mocha)",
            }}
          >
            {!d.foto && "Sin imagen"}
          </div>
          <div style={{ flex: 1 }}>
            <input
              ref={input} type="file" hidden
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => { const a = e.target.files?.[0]; if (a) void elegirFoto(a); e.target.value = ""; }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn tono="ghost" className="btn-mini"
                   disabled={!opciones.almacen_listo || subiendo}
                   onClick={() => input.current?.click()}>
                {subiendo ? "Subiendo…" : d.foto ? "Cambiar" : "Subir imagen"}
              </Btn>
              {d.foto && (
                <Btn tono="ghost" className="btn-mini" disabled={subiendo}
                     onClick={() => campo("foto", null)}><IcoTrash />Quitar</Btn>
              )}
            </div>
            <label htmlFor="hb-pie" style={{ marginTop: 12, display: "block" }}>Pie de la imagen</label>
            <input
              className="t" id="hb-pie" value={d.pie_foto} maxLength={120}
              placeholder="mercado, remodelación, Panamá…"
              onChange={(e) => campo("pie_foto", e.target.value)}
            />
            <Hint>Se enseña mientras no haya imagen, y sirve de texto alternativo.</Hint>
          </div>
        </div>

        {/* ── Estado ── */}
        <SecTitle style={{ marginTop: 20 }}>Publicación</SecTitle>
        <label style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 8 }}>
          <input type="checkbox" checked={d.publicado}
                 onChange={(e) => campo("publicado", e.target.checked)} />
          <span>Publicado — sale en la página /hub</span>
        </label>
        <label style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 8 }}>
          <input type="checkbox" checked={d.destacado}
                 onChange={(e) => campo("destacado", e.target.checked)} />
          <span>Destacado — ocupa el bloque grande de arriba</span>
        </label>
        <Hint>Sólo puede haber un destacado: marcar éste desmarca el anterior.</Hint>

        {error && <p style={{ color: "#b5542f", marginTop: 12, fontSize: ".85rem" }}>{error}</p>}
      </MCuerpo>
      <MPie>
        <Btn tono="ghost" onClick={onCancelar}>Cancelar</Btn>
        <Btn tono="primary" disabled={falta || subiendo} onClick={() => onGuardar(d)}>
          {inicial.slug ? "Guardar cambios" : "Crear"}
        </Btn>
      </MPie>
    </>
  );
}

export default function Hub() {
  const { pedir } = useSesion();
  const { modal, av } = useConsola();
  const [items, setItems] = useState<Item[]>([]);
  const [opciones, setOpciones] = useState<Opciones | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [lista, op] = await Promise.all([
        pedir<{ contenido: Item[] }>("/api/admin/hub"),
        pedir<Opciones>("/api/admin/hub/opciones"),
      ]);
      setItems(lista.contenido);
      setOpciones(op);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }, [pedir]);

  useEffect(() => { void cargar(); }, [cargar]);

  const subir = useCallback(async (a: File) => {
    const fd = new FormData();
    fd.append("archivo", a);
    const r = await pedir<{ url: string }>("/api/admin/hub/foto", { method: "POST", body: fd });
    return r.url;
  }, [pedir]);

  const editar = (it: Item) => {
    if (!opciones) return;
    modal(it.slug ? "Editar contenido" : "Nuevo contenido", (cierra) => (
      <Formulario
        inicial={it} opciones={opciones} subir={subir}
        onCancelar={cierra}
        onGuardar={async (d) => {
          try {
            await pedir(it.slug ? `/api/admin/hub/${it.slug}` : "/api/admin/hub", {
              method: it.slug ? "PUT" : "POST",
              body: JSON.stringify(d),
            });
            cierra();
            av(it.slug ? "Contenido actualizado" : "Contenido creado");
            void cargar();
          } catch (e) {
            av((e as Error).message);
          }
        }}
      />
    ));
  };

  const borrar = (it: Item) => {
    modal("Quitar del HUB", (cierra) => (
      <>
        <MCuerpo>
          <p>Se va a borrar «{it.titulo}». Esto no se puede deshacer.</p>
        </MCuerpo>
        <MPie>
          <Btn tono="ghost" onClick={cierra}>Cancelar</Btn>
          {/* `Btn` sólo tiene primary y ghost; el rojo del borrado se pone
              aquí, que es el único sitio de esta vista que lo necesita. */}
          <Btn tono="ghost" style={{ color: "#b5542f", borderColor: "#b5542f" }} onClick={async () => {
            try {
              await pedir(`/api/admin/hub/${it.slug}`, { method: "DELETE" });
              cierra(); av("Contenido borrado"); void cargar();
            } catch (e) { av((e as Error).message); }
          }}>Borrar</Btn>
        </MPie>
      </>
    ));
  };

  const publicados = items.filter((i) => i.publicado).length;

  return (
    <>
      <VHead
        titulo="Contenido del HUB"
        fuerte={`${items.length} pieza${items.length === 1 ? "" : "s"}`}
        acciones={
          <Btn tono="primary" disabled={!opciones} onClick={() => editar(VACIO)}>
            <IcoPlus />Nuevo contenido
          </Btn>
        }
      >
        Artículos, videos y noticias de la página pública. {publicados} publicado
        {publicados === 1 ? "" : "s"} de {items.length}.
      </VHead>

      {error && <Card style={{ marginBottom: 16 }}><p style={{ color: "#b5542f" }}>{error}</p></Card>}

      <Card>
        {cargando ? (
          <p style={{ color: "var(--mocha)" }}>Cargando…</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <p style={{ fontWeight: 600 }}>Todavía no hay contenido.</p>
            <Hint>Mientras esté vacío, el HUB sigue enseñando las tarjetas de muestra del diseño.</Hint>
          </div>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Orden</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.slug}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {it.foto && (
                        <span style={{
                          width: 44, height: 30, borderRadius: 6, flexShrink: 0,
                          background: `center/cover url(${it.foto})`,
                        }} />
                      )}
                      <span>
                        <b>{it.titulo}</b>
                        {it.destacado && <EstLibre c="#8a5a9e" style={{ marginLeft: 8 }}>Destacado</EstLibre>}
                        {!it.enlace && (
                          <Hint style={{ margin: 0 }}>Sin enlace: la tarjeta no lleva a ninguna parte.</Hint>
                        )}
                      </span>
                    </div>
                  </td>
                  <td><EstLibre c={TONO[it.tipo] || "#5b4332"}>
                    {opciones?.tipos.find((t) => t.k === it.tipo)?.l || it.tipo}
                  </EstLibre></td>
                  <td>{it.categoria}</td>
                  <td>
                    <EstLibre c={it.publicado ? "#5f6b3e" : "#a8794a"}>
                      {it.publicado ? "Publicado" : "Borrador"}
                    </EstLibre>
                  </td>
                  <td>{it.orden}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {it.enlace && (
                      <Btn tono="ghost" className="btn-mini" title="Abrir el enlace"
                           onClick={() => window.open(it.enlace, "_blank", "noopener")}>
                        <IcoExt />
                      </Btn>
                    )}
                    <Btn tono="ghost" className="btn-mini" onClick={() => editar(it)}><IcoEdit /></Btn>
                    <Btn tono="ghost" className="btn-mini" onClick={() => borrar(it)}><IcoTrash /></Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Card>
    </>
  );
}
