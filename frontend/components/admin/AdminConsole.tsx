"use client";

import { useMemo, useState } from "react";
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

   EL LISTADO DE PREDIOS
   Sigue siendo de maqueta: es la parte de la consola que el correo dejó "en
   espera" (remodelación, administración, data y comercial). Lo que sí está
   contra la base es el flujo de inmuebles y los usuarios.
   ═══════════════════════════════════════════════════════════════════════════ */

type Item = { k: VistaKey; l: string; d: string; d2?: string; badge?: number; circulo?: boolean };

const GRUPOS: { g: string; items: Item[] }[] = [
  {
    g: "General",
    items: [{ k: "panel", l: "Panel general", d: "M3 12l9-8 9 8M5 10v10h14V10" }],
  },
  {
    g: "Operación",
    items: [
      { k: "flujo", l: "Flujo de inmuebles", d: "M3 6h18M7 12h10M11 18h2" },
      { k: "predios", l: "Predios", d: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" },
      { k: "extraccion", l: "Extracción de predios", d: "M12 3v12M8 11l4 4 4-4", d2: "M4 17v3h16v-3" },
      { k: "nuevo", l: "Nuevo predio", d: "M12 5v14M5 12h14" },
      { k: "comite", l: "Comité de aprobación", d: "M9 12l2 2 4-4", d2: "M21 12c0 5-9 9-9 9s-9-4-9-9a9 9 0 0 1 18 0z", badge: 3 },
      { k: "arq", l: "Arquitectura", d: "M12 3l9 6-9 6-9-6z", d2: "M3 15l9 6 9-6" },
      { k: "data", l: "Data & Score", d: "M3 12l4-4 4 4 4-6 6 8", d2: "M3 20h18" },
      { k: "comercial", l: "Comercial", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
    ],
  },
  {
    g: "Administración",
    items: [{ k: "equipo", l: "Equipo & permisos", d: "M4 21c0-4 4-6 8-6s8 2 8 6", circulo: true }],
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
            <div className="brand">
              <div className="mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
                  <path d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" />
                </svg>
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
                    {i.badge != null && <span className="badge">{i.badge}</span>}
                  </button>
                ))}
              </div>
            ))}

            <div className="foot">
              ZEQUARA · v0.1 interna<br />Acceso restringido al equipo.
              <br />
              <button type="button" className="pnl-link" style={{ marginTop: 8, color: "var(--sand)" }} onClick={salir}>
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
                  {vista === "extraccion" && (
                    <Extraccion onEnviarARevision={(nuevos) => setPredios((ps) => [...nuevos, ...ps])} />
                  )}
                  {vista === "nuevo" && <NuevoPredio onCrear={(p) => setPredios((ps) => [p, ...ps])} />}
                  {vista === "comite" && <Comite />}
                  {vista === "arq" && <Arquitectura abrirGestion={abrirGestion} />}
                  {vista === "data" && <DataScore />}
                  {vista === "comercial" && <Comercial abrirGestion={abrirGestion} />}
                  {vista === "equipo" && <Usuarios />}
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
