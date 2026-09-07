"use client";

import { useMemo, useState } from "react";
import { MARK } from "@/components/brand";
import AvisoPantalla from "@/components/responsive/AvisoPantalla";
import { ConsolaProvider } from "@/components/admin/ctx";
import { puedeVer, useSesion } from "@/components/admin/sesion";
import { PREDIOS_SEED, type Predio, type VistaKey } from "@/components/admin/data";
import Arquitectura from "@/components/admin/views/Arquitectura";
import Comercial from "@/components/admin/views/Comercial";
import Comite from "@/components/admin/views/Comite";
import DataScore from "@/components/admin/views/DataScore";
import Extraccion from "@/components/admin/views/Extraccion";
import FlujoInmuebles from "@/components/admin/views/FlujoInmuebles";
import GestionPredio from "@/components/admin/views/GestionPredio";
import NuevoPredio from "@/components/admin/views/NuevoPredio";
import PanelGeneral from "@/components/admin/views/PanelGeneral";
import Predios from "@/components/admin/views/Predios";
import MiCuenta from "@/components/admin/views/MiCuenta";
import Usuarios from "@/components/admin/views/Usuarios";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSOLA INTERNA — el marco: menú lateral, barra superior y las vistas.

   Por debajo de 900 px el menú se convierte en un cajón que entra desde la
   izquierda con su velo; el CSS de eso vive en `styles/admin.css`.

   MENÚ Y ROLES
   El menú sólo enseña los módulos que el rol puede ver (`puedeVer`), y si
   alguien llega a una vista que no le toca se le muestra el aviso de acceso
   en vez de la vista. Nada de esto es la seguridad: cada endpoint la
   comprueba por su cuenta. Es no ofrecer puertas que van a dar 403.

   Hoy los roles están abiertos salvo "Equipo & permisos", que es sólo de
   admin —así se acordó en la reunión, para habilitar el primer flujo—. Los
   permisos por módulo están en un solo sitio (`PERMISOS`, en sesion.tsx)
   para cerrarlos cuando toque.

   EL ORDEN DEL MENÚ ES EL DEL PROCESO
   "Captación" son las dos pantallas por las que pasa un inmueble para
   entrar: Extracción de predios (donde se corre el scraping y se elige) y
   Flujo de inmuebles (donde se revisa, se contacta, se visita y se
   publica). "Gestión" es todo lo que viene después.

   QUÉ ESTÁ CONTRA LA BASE Y QUÉ ES MUESTRA
   Reales: Panel general (sus cinco cifras), Extracción de predios, Flujo de
   inmuebles, Data & Score, Equipo & permisos y Mi cuenta.

   De muestra, y marcadas como tales en el menú y dentro de la pantalla:
   Predios, Nuevo predio, Comité, Arquitectura y Comercial. Sus datos salen
   de `PREDIOS_SEED` y de constantes dentro de cada vista; no hacen ni una
   llamada al servidor y nada de lo que se haga en ellas se guarda.

   La etiqueta no es cosmética. Sin ella son indistinguibles de las que sí
   funcionan: alguien de arquitectura entra a la pantalla que se llama
   "Arquitectura", ve cuatro predios con su score y se pone a trabajar sobre
   un ejemplo. Se quita en cuanto cada una tenga sus endpoints.
   ═══════════════════════════════════════════════════════════════════════════ */

type Item = {
  k: VistaKey; l: string; d: string; d2?: string;
  badge?: number; circulo?: boolean;
  /** Pantalla de muestra: sin backend, con datos escritos en el código. */
  muestra?: boolean;
};

const GRUPOS: { g: string; items: Item[] }[] = [
  {
    g: "General",
    items: [{ k: "panel", l: "Panel general", d: "M3 12l9-8 9 8M5 10v10h14V10" }],
  },
  {
    /* EL ORDEN ES EL DEL PROCESO, no el de cuándo se escribió cada pantalla.
       Se hace scraping en Extracción, lo que se acepta ahí entra al Flujo
       por Revisión general, y de ahí sale a Predios. Estaban al revés —el
       flujo antes de la extracción que lo alimenta— y el menú no dejaba
       adivinar por dónde se empieza. */
    g: "Captación",
    items: [
      { k: "extraccion", l: "Extracción de predios", d: "M12 3v12M8 11l4 4 4-4", d2: "M4 17v3h16v-3" },
      { k: "flujo", l: "Flujo de inmuebles", d: "M3 6h18M7 12h10M11 18h2" },
    ],
  },
  {
    /* Lo que pasa DESPUÉS de que un inmueble se publica en el flujo. Grupo
       aparte porque no es la misma tarea ni la hace la misma persona: la
       captación es diaria, esto es por predio. */
    g: "Gestión",
    items: [
      { k: "predios", l: "Predios", d: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" , muestra: true },
      { k: "nuevo", l: "Nuevo predio", d: "M12 5v14M5 12h14" , muestra: true },
      /* Sin badge: el "3" de antes era un número escrito a mano en el
         menú, no una cuenta de nada. Vuelve cuando el comité tenga
         endpoint y pueda decir cuántos hay de verdad. */
      { k: "comite", l: "Comité de aprobación", d: "M9 12l2 2 4-4", d2: "M21 12c0 5-9 9-9 9s-9-4-9-9a9 9 0 0 1 18 0z" , muestra: true },
      { k: "arq", l: "Arquitectura", d: "M12 3l9 6-9 6-9-6z", d2: "M3 15l9 6 9-6" , muestra: true },
      { k: "data", l: "Data & Score", d: "M3 12l4-4 4 4 4-6 6 8", d2: "M3 20h18" },
      { k: "comercial", l: "Comercial", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" , muestra: true },
    ],
  },
  {
    g: "Administración",
    items: [{ k: "equipo", l: "Equipo & permisos", d: "M4 21c0-4 4-6 8-6s8 2 8 6", circulo: true }],
  },
  {
    /* Grupo propio al final: no es operación ni administración del equipo, son
       los datos de quien está usando la consola. */
    g: "Tu cuenta",
    items: [{ k: "cuenta", l: "Mi cuenta", d: "M4 21c0-4 4-6 8-6s8 2 8 6", circulo: true }],
  },
];

/** Iniciales para el avatar de la barra: "Nati C." → "NC". */
function iniciales(nombre: string) {
  return nombre.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const ROL_ETIQUETA: Record<string, string> = {
  admin: "Administrador",
  arquitectura: "Arquitectura",
  data: "Data",
  comercial: "Comercial",
};

export default function AdminConsole() {
  const { usuario, salir } = useSesion();
  const [vista, setVista] = useState<VistaKey>("flujo");
  const [cajon, setCajon] = useState(false);
  const [predios, setPredios] = useState<Predio[]>(PREDIOS_SEED);

  const rol = usuario?.rol;
  const ir = (v: VistaKey) => { setVista(v); setCajon(false); };
  const abrirGestion = () => ir("gestion");

  /* Los grupos ya filtrados por rol. Un grupo cuyos módulos no puede ver
     nadie de este rol no se dibuja: un encabezado suelto sin nada debajo
     parece un error. */
  const grupos = useMemo(
    () => GRUPOS
      .map((g) => ({ ...g, items: g.items.filter((i) => puedeVer(i.k, rol)) }))
      .filter((g) => g.items.length > 0),
    [rol],
  );

  const permitida = puedeVer(vista, rol);

  return (
    <div className="adm">
      <ConsolaProvider vista={vista} setVista={ir}>
        <div className="app">
          {/* ══════════ MENÚ LATERAL ══════════ */}
          <aside className={`side${cajon ? " open" : ""}`}>
            {/* El monograma de verdad. Aquí había una casita genérica dibujada
                a mano en un cuadro con borde: la ranura del icono de la
                maqueta, de cuando el logotipo aún no existía. El resto de la
                aplicación —nav público, panel del inversionista, modales— ya
                usaba `MARK`; la consola era la única que no.

                El `alt` va vacío a propósito: el nombre lo dice el texto de
                al lado, y con los dos un lector de pantalla anunciaría
                "Zequara Zequara". */}
            <div className="brand">
              <div className="mark">
                <img src={MARK} alt="" decoding="async" />
              </div>
              <span className="name">ZEQUARA</span>
            </div>
            <span className="env">Consola interna</span>

            {grupos.map(({ g, items }) => (
              <div key={g}>
                <div className="nav-l">{g}</div>
                {items.map((i) => (
                  <button
                    key={i.k} type="button"
                    className={`nav-item${vista === i.k ? " active" : ""}`}
                    aria-current={vista === i.k ? "page" : undefined}
                    onClick={() => ir(i.k)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                      {i.circulo && <circle cx="12" cy="8" r="4" />}
                      <path d={i.d} />
                      {i.d2 && <path d={i.d2} />}
                    </svg>
                    {i.l}
                    {/* La etiqueta va en el menú y no sólo dentro de la
                        pantalla: así se sabe qué es real ANTES de entrar y de
                        ponerse a trabajar sobre datos de ejemplo. */}
                    {i.muestra && <span className="muestra">muestra</span>}
                    {i.badge != null && <span className="badge">{i.badge}</span>}
                  </button>
                ))}
              </div>
            ))}

            <div className="foot">
              ZEQUARA · v0.1 interna<br />Acceso restringido al equipo.
              <br />
              <button type="button" className="pnl-link" style={{ marginTop: 6, color: "var(--sand)" }} onClick={() => void salir()}>
                Cerrar sesión
              </button>
            </div>
          </aside>

          <div className={`scrim${cajon ? " show" : ""}`} onClick={() => setCajon(false)} />

          {/* ══════════ CONTENIDO ══════════ */}
          <div className="main">
            <div className="topbar">
              <button type="button" className="hamb" aria-label="Abrir el menú" onClick={() => setCajon(true)}>
                <svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
              </button>
              <div className="search">
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
                <input placeholder="Buscar predio, inversionista, documento…" aria-label="Buscar" />
              </div>
              <div className="tb-right">
                <div className="bell">
                  <svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
                  <span className="dot" />
                </div>
                <div className="who">
                  <div className="av">{usuario ? iniciales(usuario.nombre) : "··"}</div>
                  <div>
                    <div className="nm">{usuario?.nombre ?? "—"}</div>
                    <div className="rl">{rol ? ROL_ETIQUETA[rol] ?? rol : ""}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="content">
              {!permitida ? (
                <section className="view active">
                  <div className="card">
                    <div className="empty">
                      <b style={{ color: "var(--coffee)" }}>Este módulo no está disponible para tu rol.</b>
                      <br />
                      Tu rol es {rol ? ROL_ETIQUETA[rol] ?? rol : "—"}. Si necesitas entrar, pídeselo a
                      un administrador.
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  {vista === "panel" && <PanelGeneral />}
                  {vista === "flujo" && <FlujoInmuebles />}
                  {vista === "predios" && (
                    <Predios
                      predios={predios} abrirGestion={abrirGestion}
                      onPublicar={(id) => setPredios((ps) => ps.map((p) => p.id === id ? { ...p, publicado: !p.publicado } : p))}
                    />
                  )}
                  {vista === "extraccion" && <Extraccion />}
                  {vista === "nuevo" && <NuevoPredio onCrear={(p) => setPredios((ps) => [p, ...ps])} />}
                  {vista === "comite" && <Comite />}
                  {vista === "arq" && <Arquitectura abrirGestion={abrirGestion} />}
                  {vista === "data" && <DataScore />}
                  {vista === "comercial" && <Comercial abrirGestion={abrirGestion} />}
                  {vista === "equipo" && <Usuarios />}
                  {vista === "cuenta" && <MiCuenta />}
                  {vista === "gestion" && <GestionPredio />}
                </>
              )}
            </div>
          </div>
        </div>
      </ConsolaProvider>

      {/* El mismo aviso que sale en el panel del inversionista al entrar desde
          un móvil, con el texto de la consola: aquí hay tablas de once
          columnas y una bitácora de corrida, y en un computador se ve sin
          arrastrar. */}
      <AvisoPantalla
        clave="zq:aviso-admin"
        eyebrow="Consola interna"
        titulo={<>La consola completa, <span className="font-semibold">también aquí.</span></>}
      >
        Las pantallas están adaptadas a la columna: el menú se vuelve un cajón y las tablas se
        desplazan solas. Aun así, la extracción trabaja con once columnas por anuncio y desde un
        computador la revisas sin arrastrar.
      </AvisoPantalla>
    </div>
  );
}
