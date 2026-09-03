"use client";

import { useCallback, useEffect, useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import FormClave from "@/components/admin/FormClave";
import { useSesion, type Rol } from "@/components/admin/sesion";
import { Card, Frow, Grid, Hint, SecTitle, VHead } from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   MI CUENTA — quién soy, qué puedo hacer, y las tres cosas que puedo cambiar.

   Antes esto no existía: el nombre y el rol sólo se veían en la esquina de la
   barra, y para cambiar la contraseña había un enlace perdido al pie del menú.
   Aquí está todo junto y todo funciona contra el backend.

   TRES CAMBIOS, TRES NIVELES DE EXIGENCIA, Y NO ES ARBITRARIO
     · El nombre es una etiqueta: se cambia y ya.
     · El correo ES la identidad con la que se entra, así que pide la
       contraseña. Si alguien se deja la consola abierta, que no pueda
       quedarse con la cuenta cambiándole el correo. Al cambiarlo se cierran
       las demás sesiones.
     · La contraseña pide la actual, por lo mismo, y también cierra las demás
       sesiones: quien la cambia normalmente lo hace porque cree que se la
       vieron.

   EL ROL NO SE CAMBIA AQUÍ, A PROPÓSITO. Nadie se asciende a sí mismo. Eso lo
   hace un administrador desde «Equipo & permisos», y el backend lo exige
   —`/api/auth/usuarios` es sólo de admin—, así que esconder el control no es
   la protección: es no ofrecer una puerta que da 403.
   ═══════════════════════════════════════════════════════════════════════════ */

const ROL_ETIQUETA: Record<Rol, string> = {
  admin: "Administrador",
  arquitectura: "Arquitectura",
  data: "Data",
  comercial: "Comercial",
};

/** Qué puede hacer cada rol, en una línea. Es lo mismo que dice el backend. */
const ROL_PUEDE: Record<Rol, string> = {
  admin: "Acceso a todos los módulos, y es el único que crea usuarios y da de baja cuentas.",
  arquitectura: "Evalúa técnicamente, define alcance y presupuesto cerrado, gestiona obra e interventoría. Aprueba en comité.",
  data: "Calcula el Score, valoración y comparables. Publica cifras de la ficha. Aprueba en comité.",
  comercial: "Gestiona leads, sesiones, reservas e inversionistas. Publica el predio tras el comité.",
};

/** Clase de la píldora de rol, la misma que usa el resto de la consola. */
const ROL_CLASE: Record<Rol, string> = {
  admin: "e-pub", arquitectura: "a-arq", data: "a-data", comercial: "a-com",
};

const fecha = (iso?: string | null) =>
  iso ? String(iso).slice(0, 16).replace("T", " ") : "—";

function iniciales(nombre: string) {
  return nombre.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

type Sesion = {
  id: string;
  creada: string;
  ultima_actividad: string;
  ip: string | null;
  agente: string | null;
  actual: boolean;
};

/** Del user-agent, lo único que le sirve a una persona: navegador y sistema. */
function navegador(agente: string | null) {
  if (!agente) return "desconocido";
  const nav = /Edg\//.test(agente) ? "Edge"
    : /Chrome\//.test(agente) ? "Chrome"
    : /Firefox\//.test(agente) ? "Firefox"
    : /Safari\//.test(agente) ? "Safari"
    : "otro navegador";
  const so = /Windows/.test(agente) ? "Windows"
    : /Mac OS/.test(agente) ? "macOS"
    : /Android/.test(agente) ? "Android"
    : /iPhone|iPad/.test(agente) ? "iOS"
    : /Linux/.test(agente) ? "Linux"
    : "";
  return so ? `${nav} · ${so}` : nav;
}

/** "1 sesión" / "3 sesiones", sin el "(s)" que queda de aviso a medio escribir. */
function cuentaSesiones(n: number) {
  return `${n} ${n === 1 ? "sesión" : "sesiones"}`;
}

export default function MiCuenta() {
  const { usuario, pedir, refrescar } = useSesion();
  const { av, modal } = useConsola();

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [sesiones, setSesiones] = useState<Sesion[] | null>(null);

  /* Si el usuario se refresca desde el servidor (tras un cambio), el campo
     tiene que seguirlo: si no, queda con lo que se tecleó antes. */
  useEffect(() => { setNombre(usuario?.nombre ?? ""); }, [usuario?.nombre]);

  const cargarSesiones = useCallback(async () => {
    try {
      const d = await pedir<{ sesiones: Sesion[] }>("/api/auth/sesiones");
      setSesiones(d.sesiones);
    } catch {
      setSesiones([]);
    }
  }, [pedir]);

  useEffect(() => { void cargarSesiones(); }, [cargarSesiones]);

  if (!usuario) return null;
  const rol = usuario.rol;

  const guardarNombre = async () => {
    const limpio = nombre.trim();
    if (limpio === usuario.nombre) { av("El nombre no cambió"); return; }
    setGuardandoNombre(true);
    try {
      await pedir("/api/auth/perfil/nombre", { method: "POST", body: JSON.stringify({ nombre: limpio }) });
      await refrescar();
      av("Nombre actualizado");
    } catch (err) {
      av((err as Error).message);
    } finally {
      setGuardandoNombre(false);
    }
  };

  const cambiarCorreo = () => {
    modal("Cambiar tu correo de acceso", (cierra) => (
      <FormCorreo
        actual={usuario.correo}
        onGuardar={async (correo, clave) => {
          try {
            const r = await pedir<{ sesiones_cerradas: number }>("/api/auth/perfil/correo", {
              method: "POST",
              body: JSON.stringify({ correo, clave_actual: clave }),
            });
            await refrescar();
            await cargarSesiones();
            cierra();
            av(r.sesiones_cerradas
              ? `Correo cambiado · ${cuentaSesiones(r.sesiones_cerradas)} cerrada${r.sesiones_cerradas === 1 ? "" : "s"}`
              : "Correo cambiado · desde ahora entras con el nuevo");
          } catch (err) {
            throw err;   // el formulario lo enseña
          }
        }}
        onCancelar={cierra}
      />
    ));
  };

  const cambiarClave = () => {
    modal("Cambiar tu contraseña", (cierra) => (
      <div className="mb">
        <FormClave
          estilo="claro"
          onHecho={() => { cierra(); void cargarSesiones(); av("Contraseña cambiada"); }}
          pie={<button type="button" className="btn btn-ghost" onClick={cierra}>Cancelar</button>}
        />
      </div>
    ));
  };

  const cerrarOtras = async () => {
    try {
      const r = await pedir<{ cerradas: number }>("/api/auth/salir-todas", { method: "POST" });
      await cargarSesiones();
      av(r.cerradas
        ? `${cuentaSesiones(r.cerradas)} cerrada${r.cerradas === 1 ? "" : "s"}. Sólo queda esta.`
        : "No había otras sesiones abiertas.");
    } catch (err) {
      av((err as Error).message);
    }
  };

  const otras = (sesiones ?? []).filter((s) => !s.actual).length;

  return (
    <section className="view active">
      <VHead titulo="Mi" fuerte="cuenta">
        Tus datos, tu rol y lo que puedes cambiar tú mismo.
      </VHead>

      {/* ══════════ QUIÉN SOY ══════════ */}
      <Card className="mb">
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div
            style={{
              width: 62, height: 62, borderRadius: 999, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--caramel)", color: "#fff",
              fontSize: "1.35rem", fontWeight: 600, letterSpacing: ".02em",
            }}
          >
            {iniciales(usuario.nombre)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "1.28rem", fontWeight: 600, color: "var(--espresso2)" }}>
              {usuario.nombre}
            </div>
            <div style={{ fontSize: ".88rem", color: "var(--mocha)", fontWeight: 300 }}>
              {usuario.correo}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={rol === "admin" ? "est e-pub" : `area-chip ${ROL_CLASE[rol]}`}>
                {ROL_ETIQUETA[rol]}
              </span>
            </div>
          </div>
        </div>

        <Hint style={{ marginTop: 16 }}>{ROL_PUEDE[rol]}</Hint>

        <div style={{ marginTop: 14 }}>
          <Frow k="Cuenta creada" v={fecha(usuario.creado_en)} />
          <Frow k="Último acceso" v={fecha(usuario.ultimo_acceso)} />
          <Frow
            k="Rol"
            v={
              <>
                {ROL_ETIQUETA[rol]}
                <span className="pzone" style={{ display: "block" }}>
                  lo cambia un administrador
                </span>
              </>
            }
          />
        </div>
      </Card>

      <Grid cols={2}>
        {/* ══════════ DATOS ══════════ */}
        <Card>
          <SecTitle>Tus datos</SecTitle>

          <label htmlFor="mc-nombre">Nombre</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="t" id="mc-nombre" value={nombre}
              onChange={(e) => setNombre(e.target.value)} disabled={guardandoNombre}
            />
            <button
              type="button" className="btn btn-primary btn-mini"
              onClick={guardarNombre}
              disabled={guardandoNombre || !nombre.trim() || nombre.trim() === usuario.nombre}
            >
              {guardandoNombre ? "…" : "Guardar"}
            </button>
          </div>
          <Hint style={{ marginTop: 8 }}>
            Es el nombre que se ve en la barra y el que queda como responsable de cada decisión
            que tomes. Lo ya decidido conserva el nombre de entonces.
          </Hint>

          <SecTitle style={{ marginTop: 22 }}>Correo de acceso</SecTitle>
          <div className="frow">
            <span className="k">{usuario.correo}</span>
            <span className="v">
              <button type="button" className="btn btn-ghost btn-mini" onClick={cambiarCorreo}>
                Cambiar
              </button>
            </span>
          </div>
          <Hint>
            Es con lo que entras, así que cambiarlo pide tu contraseña y cierra tus otras
            sesiones.
          </Hint>
        </Card>

        {/* ══════════ SEGURIDAD ══════════ */}
        <Card>
          <SecTitle>Seguridad</SecTitle>

          <div className="frow">
            <span className="k">Contraseña</span>
            <span className="v">
              <button type="button" className="btn btn-primary btn-mini" onClick={cambiarClave}>
                Cambiar contraseña
              </button>
            </span>
          </div>

          <SecTitle style={{ marginTop: 22 }}>
            Sesiones abiertas
            {otras > 0 && (
              <button type="button" className="see" onClick={cerrarOtras}>Cerrar las demás</button>
            )}
          </SecTitle>

          {sesiones === null ? (
            <Hint style={{ margin: 0 }}>Cargando…</Hint>
          ) : sesiones.length === 0 ? (
            <Hint style={{ margin: 0 }}>No se pudieron leer tus sesiones.</Hint>
          ) : (
            sesiones.map((s) => (
              <div className="task" key={s.id}>
                <span
                  className="dot"
                  style={{ background: s.actual ? "var(--sage)" : "var(--caramel)" }}
                />
                <div className="tx">
                  {navegador(s.agente)}{s.actual && " · esta"}
                  <small>
                    {s.ip || "sin IP"} · última actividad {fecha(s.ultima_actividad)}
                  </small>
                </div>
              </div>
            ))
          )}

          <Hint>
            Cada entrada tuya abre una sesión. Se cierran solas a las 12 horas, o a las 2 sin
            actividad. Si ves una que no reconoces, cambia tu contraseña: eso las cierra todas
            menos esta.
          </Hint>
        </Card>
      </Grid>
    </section>
  );
}

/* ── Modal de cambio de correo ────────────────────────────────────────────── */

function FormCorreo({ actual, onGuardar, onCancelar }: {
  actual: string;
  onGuardar: (correo: string, clave: string) => Promise<void>;
  onCancelar: () => void;
}) {
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async () => {
    if (!correo.includes("@")) { setError("Escribe un correo válido."); return; }
    if (correo.trim().toLowerCase() === actual) { setError("Ese ya es tu correo."); return; }
    if (!clave) { setError("Escribe tu contraseña para confirmar."); return; }
    setError(null);
    setEnviando(true);
    try {
      await onGuardar(correo.trim(), clave);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="mb">
        <p style={{ fontSize: ".88rem", color: "var(--mocha)", fontWeight: 300 }}>
          Ahora entras con <b style={{ color: "var(--coffee)" }}>{actual}</b>. Desde que
          confirmes, entrarás con el nuevo.
        </p>

        <label htmlFor="mc-correo">Correo nuevo</label>
        <input
          className="t" id="mc-correo" type="email" placeholder="persona@zequara.com"
          value={correo} onChange={(e) => setCorreo(e.target.value)} disabled={enviando}
        />

        <label htmlFor="mc-clave">Tu contraseña</label>
        <input
          className="t" id="mc-clave" type="password" autoComplete="current-password"
          value={clave} onChange={(e) => setClave(e.target.value)} disabled={enviando}
        />
        <div className="hint" style={{ marginTop: 8 }}>
          Se pide porque el correo es tu identidad. Tus otras sesiones se cerrarán.
        </div>

        {error && (
          <p role="alert" style={{ marginTop: 12, color: "var(--terra)", fontSize: ".85rem", fontWeight: 500 }}>
            {error}
          </p>
        )}
      </div>
      <div className="mf">
        <button type="button" className="btn btn-ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn btn-primary" onClick={enviar} disabled={enviando}>
          {enviando ? "Guardando…" : "Cambiar correo"}
        </button>
      </div>
    </>
  );
}
