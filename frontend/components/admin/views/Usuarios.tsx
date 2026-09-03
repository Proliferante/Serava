"use client";

import { useCallback, useEffect, useState } from "react";
import { MCuerpo, MPie, useConsola } from "@/components/admin/ctx";
import { useSesion, type Rol, type Usuario } from "@/components/admin/sesion";
import { AREA_DESC } from "@/components/admin/data";
import { AreaChip, Card, EstLibre, Grid, IcoPlus, SecTitle, Tabla, VHead } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   EQUIPO & PERMISOS — los usuarios internos, contra la base.

   Sustituye a la lista de maqueta que tenía la consola. Sólo entra un
   administrador: lo esconde el menú y, sobre todo, lo exige el backend
   (`Depends(solo_admin)` en /api/auth/usuarios). Esconder el módulo es
   comodidad; lo que protege es el 403 del servidor.

   La contraseña que se pone al crear es TEMPORAL por definición: viaja por
   chat o correo hasta su dueño, así que el usuario nuevo entra con ella y la
   consola le exige cambiarla antes de dejarlo trabajar (ver CambiarClave).
   Por eso el formulario la muestra en claro mientras se escribe —hay que
   poder copiarla para enviarla— y por eso se avisa de que es de un solo uso.

   Dar de baja no borra: el rastro de quién descartó qué inmueble tiene que
   sobrevivir a la salida de la persona.
   ═══════════════════════════════════════════════════════════════════════════ */

const ROL_ETIQUETA: Record<Rol, string> = {
  admin: "Administrador",
  arquitectura: "Arquitectura",
  data: "Data",
  comercial: "Comercial",
};

/** Contraseña temporal legible: sin caracteres que se confundan al dictarla. */
const ALFABETO = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function claveAlAzar(n = 14) {
  const buf = new Uint32Array(n);
  crypto.getRandomValues(buf);
  return Array.from(buf, (v) => ALFABETO[v % ALFABETO.length]).join("");
}

function FormCrear({ minima, onCrear, onCancelar }: {
  /** El mínimo que exige el servidor. Ver `politica` en sesion.tsx. */
  minima: number;
  onCrear: (d: { nombre: string; correo: string; rol: Rol; clave: string }) => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<Rol>("arquitectura");
  const [clave, setClave] = useState(() => claveAlAzar());
  const [error, setError] = useState<string | null>(null);

  const enviar = () => {
    if (!nombre.trim()) { setError("Escribe el nombre."); return; }
    if (!correo.includes("@")) { setError("El correo no es válido."); return; }
    if (clave.length < minima) { setError(`La contraseña temporal necesita ${minima} caracteres o más.`); return; }
    setError(null);
    onCrear({ nombre: nombre.trim(), correo: correo.trim(), rol, clave });
  };

  return (
    <>
      <MCuerpo>
        <label htmlFor="u-nombre">Nombre</label>
        <input className="t" id="u-nombre" placeholder="Nombre y apellido" value={nombre} onChange={(e) => setNombre(e.target.value)} />

        <label htmlFor="u-correo">Correo</label>
        <input className="t" id="u-correo" type="email" placeholder="persona@zequara.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />

        <label htmlFor="u-rol">Rol</label>
        <select className="t" id="u-rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
          {(Object.keys(ROL_ETIQUETA) as Rol[]).map((r) => (
            <option key={r} value={r}>{ROL_ETIQUETA[r]}</option>
          ))}
        </select>

        <label htmlFor="u-clave">Contraseña temporal</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="t" id="u-clave" value={clave} onChange={(e) => setClave(e.target.value)} style={{ fontFamily: "monospace" }} />
          <button type="button" className="btn btn-ghost btn-mini" onClick={() => setClave(claveAlAzar())}>Otra</button>
        </div>
        <div className="hint" style={{ marginTop: 8 }}>
          Cópiala y mándasela por un canal privado. Al entrar, la consola le pedirá cambiarla
          antes de dejarlo trabajar.
        </div>

        {error && (
          <p role="alert" style={{ marginTop: 12, color: "var(--terra)", fontSize: ".85rem", fontWeight: 500 }}>{error}</p>
        )}
      </MCuerpo>
      <MPie>
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={enviar}>Crear usuario</button>
      </MPie>
    </>
  );
}

export default function Usuarios() {
  const { modal, av } = useConsola();
  const { pedir, usuario: yo, politica } = useSesion();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const d = await pedir<{ usuarios: Usuario[] }>("/api/auth/usuarios");
      setUsuarios(d.usuarios);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCargando(false);
    }
  }, [pedir]);

  useEffect(() => { void cargar(); }, [cargar]);

  const crear = () => {
    modal("Crear usuario interno", (cierra) => (
      <FormCrear
        minima={politica.minima}
        onCancelar={cierra}
        onCrear={async (d) => {
          try {
            await pedir("/api/auth/usuarios", { method: "POST", body: JSON.stringify(d) });
            cierra();
            av(`${d.correo} creado · mándale la contraseña temporal`);
            await cargar();
          } catch (err) {
            av((err as Error).message);
          }
        }}
      />
    ));
  };

  const cambiarActivo = async (u: Usuario) => {
    try {
      await pedir(`/api/auth/usuarios/${u.id}/activo`, {
        method: "POST",
        body: JSON.stringify({ activo: !u.activo }),
      });
      av(u.activo ? `${u.correo} desactivado` : `${u.correo} reactivado`);
      await cargar();
    } catch (err) {
      av((err as Error).message);
    }
  };

  return (
    <section className="view active">
      <VHead
        titulo="Equipo &" fuerte="permisos"
        acciones={<button type="button" className="btn btn-primary" onClick={crear}><IcoPlus />Crear usuario</button>}
      >
        Las cuentas internas de ZEQUARA y qué puede hacer cada rol en la consola.
      </VHead>

      <Grid cols={3} className="mb">
        {AREA_DESC.map(({ k, d }) => (
          <Card key={k}>
            <SecTitle><AreaChip a={k} /></SecTitle>
            <p style={{ fontSize: ".84rem", color: "var(--mocha)", fontWeight: 300 }}>{d}</p>
          </Card>
        ))}
      </Grid>

      <Card style={{ padding: "6px 6px 2px" }}>
        <div style={{ padding: "14px 12px 0" }}><SecTitle>Usuarios</SecTitle></div>

        {cargando ? <div className="empty">Cargando…</div>
          : error ? (
            <div className="empty">
              <b style={{ color: "var(--terra)" }}>No se pudo leer la lista.</b><br />{error}
            </div>
          ) : (
            <Tabla ancho="md">
              <thead>
                <tr>
                  <th>Usuario</th><th>Rol</th><th>Estado</th><th>Último acceso</th>
                  <th style={{ textAlign: "right" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="pname">{u.nombre}</div>
                      <div className="pzone">{u.correo}</div>
                    </td>
                    <td>
                      {u.rol === "admin"
                        ? <EstLibre c="e-pub">Administrador</EstLibre>
                        : <AreaChip a={u.rol === "arquitectura" ? "arq" : u.rol === "data" ? "data" : "com"} />}
                    </td>
                    <td>
                      {!u.activo ? <EstLibre c="e-desc">Desactivado</EstLibre>
                        : u.debe_cambiar_clave ? <EstLibre c="e-nuevo">Clave temporal</EstLibre>
                        : <EstLibre c="e-res">Activo</EstLibre>}
                    </td>
                    <td className="pzone">
                      {u.ultimo_acceso ? String(u.ultimo_acceso).slice(0, 16).replace("T", " ") : "nunca"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {u.id === yo?.id
                        ? <span className="pzone">tú</span>
                        : (
                          <button type="button" className="btn btn-ghost btn-mini" onClick={() => cambiarActivo(u)}>
                            {u.activo ? "Desactivar" : "Reactivar"}
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tabla>
          )}
      </Card>
    </section>
  );
}
