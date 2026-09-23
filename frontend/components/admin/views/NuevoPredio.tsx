"use client";

import { useCallback, useMemo, useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import { useSesion } from "@/components/admin/sesion";
import { BloqueCaja, cifraEnMillones } from "@/components/admin/ficha/Campos";
import {
  avance, faltantes, FICHA, type Valores,
} from "@/components/admin/ficha/esquema";
import { Btn, Card, Grid, Hint, IcoCheck, IcoExt, IcoPlus, SecTitle } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   NUEVO PREDIO — registrar a mano y publicar del tirón.

   POR QUÉ EXISTE
   El circuito nace del scraping: el pipeline trae anuncios y el equipo decide
   sobre ellos. Pero el predio bueno también llega por un contacto, una visita
   o un corredor, y entonces no hay anuncio que scrapear. Esta es su puerta.

   POR QUÉ ACABA PUBLICANDO Y NO EN UNA BANDEJA
   Un predio que alguien se sentó a teclear ya viene verificado: se registra
   porque se fue a verlo, no para decidir si se mira. Las etapas del flujo
   —preselección, visita— existen para cribar los miles de anuncios del
   scraping, y hacer pasar por ellas algo ya comprobado sería pedir dos veces
   la misma decisión. Así que el asistente lleva del alta a «Publicar» sin
   escalas: al final el predio sale en el sitio.

   POR QUÉ SON SEIS PASOS Y NO UN FORMULARIO
   Publicar exige la ficha entera: son ciento veintinueve campos y quince
   fotos repartidos en cuatro pestañas. En una sola página nadie sabe por
   dónde va. Los pasos 2 a 5 son exactamente esas cuatro pestañas, en su
   orden y con sus títulos.

   NO DIBUJA NINGÚN CAMPO
   Los recorre de `ficha/esquema.ts` con los mismos controles que «Armar la
   ficha» (`ficha/Campos.tsx`). Es lo que garantiza que un campo nuevo en el
   esquema se pida en las dos pantallas: si esta tuviera su propio
   formulario, el predio manual acabaría publicándose sin él.

   EL PREDIO SE CREA AL SALIR DEL PASO 1, NO AL FINAL
   Porque las fotos se suben a una ranura de UN predio: sin fila en la base
   no hay dónde ponerlas. Desde ahí el borrador se va guardando solo al
   cambiar de paso, así que salirse a media ficha no pierde lo escrito — el
   predio espera en el flujo, en Visita.
   ═══════════════════════════════════════════════════════════════════════════ */

type Respuesta = {
  ficha: Valores;
  fotos: Record<string, string>;
  sugeridos: Record<string, unknown>;
  almacen_listo: boolean;
};

const CARACTERISTICAS = [
  "Ascensor", "Balcón", "Vista", "Depósito", "Cuarto de servicio",
  "Terraza", "Vigilancia 24h", "Piscina", "Gimnasio",
];

const CIUDADES = ["Bogotá", "Medellín", "Cartagena", "Ciudad de Panamá"];

/* Lo que identifica al predio y NO está en la ficha: son columnas de la base
   —de ellas viven el flujo, las comparaciones de precio y la bitácora—.
   Los metros, las habitaciones y los baños no están aquí a propósito: son
   `spec_*` de la ficha y se piden una sola vez, en el paso 2. */
const IDENTIDAD: { k: string; l: string; ph: string; tipo?: string; ancho?: boolean }[] = [
  { k: "zona", l: "Zona / barrio", ph: "Ej.: La Cabrera" },
  { k: "estrato", l: "Estrato", ph: "6", tipo: "number" },
  { k: "antiguedad", l: "Antigüedad / año", ph: "2008" },
  { k: "precio", l: "Precio de venta (pesos)", ph: "2600000000", tipo: "number" },
];

/** Los seis pasos. Los cuatro de en medio son las pestañas de la ficha. */
const PASOS = ["El activo", ...FICHA.map((p) => p.l), "Revisión"];

export default function NuevoPredio() {
  const { av, go } = useConsola();
  const { pedir } = useSesion();

  const [paso, setPaso] = useState(0);

  /* Paso 1 · identidad */
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("Colombia");
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [feats, setFeats] = useState<Record<string, boolean>>({});

  /* Pasos 2-5 · la ficha, igual que en «Armar la ficha» */
  const [link, setLink] = useState("");
  const [valores, setValores] = useState<Valores>({});
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [sugeridos, setSugeridos] = useState<Record<string, unknown>>({});
  const [almacenListo, setAlmacenListo] = useState(true);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  const [ocupado, setOcupado] = useState(false);
  const [publicado, setPublicado] = useState<string | null>(null);

  const num = (k: string) => {
    const v = (datos[k] ?? "").trim();
    if (!v) return null;
    const n = Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const faltaIdentidad = !nombre.trim() || !ciudad;
  /* En cuanto existe la fila, el paso 1 pasa a ser un resumen. Se puede
     volver a él —para mirar lo que se puso— pero no se re-registra: pulsar
     otra vez crearía un segundo predio con los mismos datos. */
  const registrado = !!link;

  /* ── Paso 1 → registrar ──────────────────────────────────────────────── */

  const registrar = async () => {
    if (faltaIdentidad || ocupado) return;
    setOcupado(true);
    /* Lo que no tiene columna propia se apunta como nota de visita: perderlo
       sería peor que guardarlo escrito. */
    const marcadas = Object.keys(feats).filter((k) => feats[k]);
    const nota = [
      marcadas.length ? `Características: ${marcadas.join(", ")}.` : "",
      datos.estrato ? `Estrato ${datos.estrato}.` : "",
      datos.antiguedad ? `Antigüedad: ${datos.antiguedad}.` : "",
      "Registrado a mano, ya verificado.",
    ].filter(Boolean).join(" ");

    try {
      const r = await pedir<{ link: string }>("/api/admin/flujo/manual", {
        method: "POST",
        body: JSON.stringify({
          titulo: nombre.trim(), ciudad, pais,
          zona: datos.zona ?? "", notas: nota, precio: num("precio"),
        }),
      });
      setLink(r.link);

      /* La ficha arranca con lo que se acaba de teclear ya escrito, no como
         propuesta: quien registra un predio no debería volver a escribir su
         propio titular en el paso siguiente. El precio se pasa a cifra
         porque `costo_precio` se imprime, no se calcula. */
      const precio = num("precio");
      setValores({
        hero_titulo: nombre.trim(),
        hero_ubicacion: [datos.zona, ciudad].filter(Boolean).join(", "),
        ...(precio ? { costo_precio: cifraEnMillones(precio) } : {}),
      });

      /* Se lee la ficha recién creada para saber si el almacén de fotos está
         en pie: sin eso, las ranuras dirían «Subir foto» y fallarían una a
         una. */
      try {
        const d = await pedir<Respuesta>(`/api/admin/flujo/ficha?link=${encodeURIComponent(r.link)}`);
        setSugeridos(d.sugeridos ?? {});
        setAlmacenListo(d.almacen_listo);
      } catch { /* el formulario funciona igual */ }

      av("Registrado · ahora su ficha");
      setPaso(1);
    } catch (e) {
      av((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  /* ── La ficha ────────────────────────────────────────────────────────── */

  const set = useCallback((k: string, v: unknown) => {
    setValores((prev) => ({ ...prev, [k]: v }));
  }, []);

  /** Guarda el borrador. Silencioso al cambiar de paso, con aviso si lo pide
      la persona: en el primer caso no ha hecho nada que merezca respuesta. */
  const guardar = useCallback(async (callado = false) => {
    if (!link) return;
    try {
      await pedir("/api/admin/flujo/ficha", {
        method: "POST",
        body: JSON.stringify({ link, ficha: valores }),
      });
      if (!callado) av("Borrador guardado");
    } catch (e) {
      if (!callado) av((e as Error).message);
    }
  }, [link, valores, pedir, av]);

  const irA = async (n: number) => {
    if (n > 0 && !link) return;
    if (link) void guardar(true);
    setPaso(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  /* ── Publicar ────────────────────────────────────────────────────────── */

  const falta = useMemo(() => faltantes(valores, fotos), [valores, fotos]);
  const total = avance(valores, fotos);

  const publicar = async () => {
    if (ocupado || falta.length || !link) return;
    setOcupado(true);
    try {
      const r = await pedir<{ slug: string }>("/api/admin/flujo/completar", {
        method: "POST",
        body: JSON.stringify({
          link,
          /* Los que tienen columna propia viajan aparte además de dentro de
             la ficha: son los que el resto del flujo consulta y ordena. */
          titulo: (valores.hero_titulo as string) || null,
          habitaciones: Number(valores.spec_habitaciones) || null,
          banos: Number(valores.spec_banos) || null,
          area_confirmada_m2: Number(valores.spec_area) || null,
          tipo_transformacion: (valores.transformacion_tipo as string) || null,
          ficha: valores,
        }),
      });
      setPublicado(r.slug);
      av("Publicado · ya sale en el sitio");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      av((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  /* ── Pantalla ────────────────────────────────────────────────────────── */

  if (publicado) {
    return (
      <section className="view active">
        <div className="vhead">
          <div>
            <h1>Predio <b>publicado</b></h1>
            <p>Ya sale en el portafolio, con su ficha completa.</p>
          </div>
        </div>
        <Card>
          <SecTitle>{(valores.hero_titulo as string) || nombre}</SecTitle>
          <Hint>
            Quedó en etapa <b style={{ color: "var(--coffee)" }}>Publicado</b>. Para corregir
            cualquier cosa, entra por Flujo de inmuebles y vuelve a armar su ficha.
          </Hint>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <a
              className="btn btn-primary" href={`/predios/ficha/${publicado}`}
              target="_blank" rel="noopener noreferrer"
            >
              Ver la ficha publicada <IcoExt />
            </a>
            <Btn tono="ghost" onClick={() => go("flujo")}>Ir al flujo</Btn>
          </div>
        </Card>
      </section>
    );
  }

  const pestana = paso >= 1 && paso <= FICHA.length ? FICHA[paso - 1] : null;
  const enRevision = paso === PASOS.length - 1;

  return (
    <section className="view active">
      <div className="vhead">
        <div>
          <h1>Nuevo <b>predio</b></h1>
          <p>
            Un activo que no salió del scraping. Se registra con su ficha completa y se
            publica al terminar: ya viene verificado.
          </p>
        </div>
        <div className="fic-acciones">
          {link && !enRevision && (
            <Btn tono="ghost" onClick={() => void guardar()}>Guardar borrador</Btn>
          )}
          <Btn tono="ghost" onClick={() => go(link ? "flujo" : "predios")}>
            {link ? "Seguir luego" : "Cancelar"}
          </Btn>
        </div>
      </div>

      <Card className="mb">
        <div className="stepper">
          {PASOS.map((p, i) => (
            <button
              key={p} type="button"
              className={`stg${i === paso ? " current" : i < paso ? " done" : ""}`}
              /* Saltar a un paso sólo cuando el predio ya existe: antes de
                 eso no hay ficha que rellenar. */
              disabled={i > 0 && !link}
              onClick={() => void irA(i)}
            >
              <div className="bar" /><div className="l">{i + 1} · {p}</div>
            </button>
          ))}
        </div>
        {link && (
          <div className="fic-avance" style={{ marginTop: 12 }}>
            <span>{total.hechos} de {total.total} campos</span>
            <span className="barra"><span style={{ width: `${total.pct}%` }} /></span>
            <span className="pct">{total.pct}%</span>
          </div>
        )}
      </Card>

      {!almacenListo && link && (
        <div className="maqueta-note" style={{ marginBottom: 14 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
          <p>
            <b>Las fotos no se pueden subir todavía.</b> Falta configurar el almacén
            (<code>SUPABASE_URL</code> y <code>SUPABASE_SERVICE_KEY</code> en el backend).
            El resto del formulario funciona y se guarda con normalidad.
          </p>
        </div>
      )}

      {/* ── Paso 1 · el activo ─────────────────────────────────────────── */}
      {paso === 0 && (
        <Grid cols={2} className="mb">
          <Card>
            <SecTitle>Datos del predio</SecTitle>
            <div className="fgrid">
              <div className="full">
                <label htmlFor="np-name">Nombre / titular del activo</label>
                <input
                  className="t" id="np-name" value={nombre} onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej.: Apartamento de gran formato con potencial de reconversión"
                  disabled={registrado}
                />
              </div>
              <div>
                <label htmlFor="np-pais">País</label>
                <select className="t" id="np-pais" value={pais} disabled={registrado} onChange={(e) => setPais(e.target.value)}>
                  <option>Colombia</option><option>Panamá</option><option>México</option><option>Costa Rica</option>
                </select>
              </div>
              <div>
                <label htmlFor="np-ciudad">Ciudad</label>
                <select className="t" id="np-ciudad" value={ciudad} disabled={registrado} onChange={(e) => setCiudad(e.target.value)}>
                  <option value="">Selecciona…</option>
                  {CIUDADES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              {IDENTIDAD.map((c) => (
                <div key={c.k}>
                  <label htmlFor={`np-${c.k}`}>{c.l}</label>
                  <input
                    className="t" id={`np-${c.k}`} type={c.tipo} placeholder={c.ph}
                    value={datos[c.k] ?? ""} disabled={registrado}
                    onChange={(e) => setDatos((m) => ({ ...m, [c.k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <Hint>
              {registrado
                ? <>Ya quedó registrado con estos datos. El titular y la ubicación que ve el
                   inversionista se corrigen en el paso 2.</>
                : <>Los metros, las habitaciones y los baños se piden en el paso 2, con el resto
                   de la ficha: así no se teclean dos veces.</>}
            </Hint>
          </Card>

          <Card>
            <SecTitle>Características</SecTitle>
            <div className="chips">
              {CARACTERISTICAS.map((n) => (
                <button
                  key={n} type="button" className="chip" disabled={registrado}
                  aria-pressed={feats[n] ? "true" : "false"}
                  onClick={() => setFeats((f) => ({ ...f, [n]: !f[n] }))}
                >
                  {n}
                </button>
              ))}
            </div>
            <Hint>Quedan anotadas en la ficha interna del predio, junto al estrato y la antigüedad.</Hint>
          </Card>
        </Grid>
      )}

      {/* ── Pasos 2-5 · la ficha ───────────────────────────────────────── */}
      {pestana && (
        <>
          <Hint style={{ margin: "-4px 0 16px" }}>{pestana.nota}</Hint>
          {pestana.bloques.map((b) => (
            <BloqueCaja
              key={b.k} b={b} valores={valores} fotos={fotos} sugeridos={sugeridos}
              aMano subiendo={subiendo} almacenListo={almacenListo}
              onCampo={set} onSubir={subirFoto} onQuitar={quitarFoto}
            />
          ))}
        </>
      )}

      {/* ── Paso 6 · revisión ──────────────────────────────────────────── */}
      {enRevision && (
        <Card className="mb">
          <SecTitle>{falta.length ? "Falta para poder publicar" : "Todo listo"}</SecTitle>
          {falta.length ? (
            <>
              <p className="fic-nota">
                Sin esto la ficha saldría rota. El número entre paréntesis es el paso donde está.
              </p>
              <ul className="fic-falta">
                {falta.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </>
          ) : (
            <Hint style={{ margin: 0 }}>
              La ficha está completa. Al publicar, el predio pasa a etapa Publicado y aparece
              en el portafolio con su ficha.
            </Hint>
          )}
        </Card>
      )}

      {/* ── Pie de navegación ──────────────────────────────────────────── */}
      <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <Hint style={{ margin: 0 }}>
          {link
            ? <>Ya está registrado en el flujo, en <b style={{ color: "var(--coffee)" }}>Visita</b>. Si sales ahora, lo encuentras ahí para seguir.</>
            : <>Al continuar, el predio queda registrado y se abre su ficha. Se publica al final del asistente.</>}
        </Hint>
        <div style={{ display: "flex", gap: 10 }}>
          {paso > 0 && <Btn tono="ghost" onClick={() => void irA(paso - 1)}>Atrás</Btn>}
          {paso === 0 && (
            registrado
              ? <Btn tono="primary" onClick={() => void irA(1)}>Continuar</Btn>
              : (
                <Btn tono="primary" onClick={registrar} disabled={faltaIdentidad || ocupado}>
                  <IcoPlus />{ocupado ? "Registrando…" : "Registrar y seguir"}
                </Btn>
              )
          )}
          {paso > 0 && !enRevision && (
            <Btn tono="primary" onClick={() => void irA(paso + 1)}>Continuar</Btn>
          )}
          {enRevision && (
            <Btn
              tono="primary" onClick={publicar} disabled={ocupado || falta.length > 0}
              title={falta.length ? `Falta: ${falta.slice(0, 4).join(", ")}${falta.length > 4 ? "…" : ""}` : undefined}
            >
              <IcoCheck />{ocupado ? "Publicando…" : "Publicar el predio"}
            </Btn>
          )}
        </div>
      </Card>
    </section>
  );
}
