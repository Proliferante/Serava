"use client";

import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useState,
  type ReactNode,
} from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   SESIÓN DE LA CONSOLA — quién entró, con qué rol, y el token para llamar.

   El token vive en `sessionStorage`, no en `localStorage`: una consola de
   operación no debe quedar abierta para siempre en el navegador de nadie. Al
   cerrar la pestaña hay que volver a entrar.

   Nada de esto es la seguridad: la seguridad está en el backend, que valida
   el token en cada petición y comprueba contra la base que el usuario siga
   activo. Lo de aquí es comodidad —no enseñar módulos que van a dar 403— y
   la conveniencia de no volver a teclear la contraseña en cada recarga.

   `pedir()` es la única forma de llamar a la API: pone el encabezado
   `Authorization` y, si el servidor responde 401, cierra la sesión sola. Sin
   eso, un token vencido dejaría la consola llena de errores silenciosos
   hasta que alguien recargara.
   ═══════════════════════════════════════════════════════════════════════════ */

export type Rol = "admin" | "arquitectura" | "data" | "comercial";

export type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  debe_cambiar_clave: boolean;
  /** Marca de tiempo ISO, o null si nunca entró. */
  ultimo_acceso?: string | null;
  creado_en?: string | null;
};

const CLAVE_TOKEN = "zq:admin:token";

/* `useLayoutEffect` avisa si se ejecuta en el servidor, donde no hay nada que
   medir. Mismo patrón que `ScaledCanvas`. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Ctx = {
  usuario: Usuario | null;
  /** `false` hasta que se comprobó el token guardado. Evita el parpadeo. */
  listo: boolean;
  entrar: (correo: string, clave: string) => Promise<void>;
  salir: () => void;
  /** Llamada autenticada a la API. Lanza `Error` con el mensaje del servidor. */
  pedir: <T>(ruta: string, init?: RequestInit) => Promise<T>;
  /** Refresca el usuario desde el servidor (tras cambiar la contraseña). */
  refrescar: () => Promise<void>;
};

const C = createContext<Ctx | null>(null);

export function useSesion() {
  const c = useContext(C);
  if (!c) throw new Error("useSesion fuera de <SesionProvider>");
  return c;
}

/** Saca el mensaje que manda FastAPI en `detail`, sea texto o lista. */
async function mensajeDeError(r: Response): Promise<string> {
  try {
    const cuerpo = await r.json();
    const d = cuerpo?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d.length) return d[0]?.msg || JSON.stringify(d[0]);
    return `Error ${r.status}`;
  } catch {
    return `Error ${r.status}`;
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const salir = useCallback(() => {
    try { window.sessionStorage.removeItem(CLAVE_TOKEN); } catch { /* da igual */ }
    setToken(null);
    setUsuario(null);
  }, []);

  /* Al montar: si hay token guardado se pregunta al servidor quién es. No se
     confía en nada que estuviera guardado junto al token —un usuario o un rol
     en sessionStorage se puede editar a mano desde el navegador—: la única
     fuente del rol es la respuesta de /yo.

     Va en `useLayoutEffect` y no en `useEffect` para el caso sin token, que
     es el de quien entra por primera vez: ahí `listo` pasa a true antes de
     que el navegador pinte, así que se ve el formulario de acceso
     directamente y no un hueco oscuro un fotograma. Cuando SÍ hay token no
     se puede evitar ese hueco —hay que preguntarle al servidor—, y es lo
     correcto: mejor un instante en blanco que un destello del formulario a
     quien ya tenía sesión. */
  useIsoLayoutEffect(() => {
    let vivo = true;
    let guardado: string | null = null;
    try { guardado = window.sessionStorage.getItem(CLAVE_TOKEN); } catch { /* nada */ }

    if (!guardado) { setListo(true); return; }

    fetch("/api/auth/yo", { headers: { Authorization: `Bearer ${guardado}` } })
      .then(async (r) => {
        if (!vivo) return;
        if (!r.ok) throw new Error("sesión inválida");
        setUsuario(await r.json());
        setToken(guardado);
      })
      .catch(() => { if (vivo) salir(); })
      .finally(() => { if (vivo) setListo(true); });

    return () => { vivo = false; };
  }, [salir]);

  const entrar = useCallback(async (correo: string, clave: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, clave }),
    });
    if (!r.ok) throw new Error(await mensajeDeError(r));

    const d = await r.json();
    try { window.sessionStorage.setItem(CLAVE_TOKEN, d.token); } catch { /* da igual */ }
    setToken(d.token);
    setUsuario(d.usuario);
  }, []);

  const pedir = useCallback(async <T,>(ruta: string, init: RequestInit = {}): Promise<T> => {
    const r = await fetch(ruta, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers || {}),
      },
    });
    if (r.status === 401) {
      salir();
      throw new Error("Tu sesión venció. Entra de nuevo.");
    }
    if (!r.ok) throw new Error(await mensajeDeError(r));
    return r.json() as Promise<T>;
  }, [token, salir]);

  const refrescar = useCallback(async () => {
    if (!token) return;
    try {
      setUsuario(await pedir<Usuario>("/api/auth/yo"));
    } catch { /* si falla, `pedir` ya cerró la sesión cuando tocaba */ }
  }, [token, pedir]);

  return (
    <C.Provider value={{ usuario, listo, entrar, salir, pedir, refrescar }}>
      {children}
    </C.Provider>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PERMISOS POR ROL

   El acuerdo de la reunión fue dejar los roles abiertos para habilitar este
   primer flujo, así que hoy todos los roles ven todos los módulos. Lo que ya
   está montado es el sitio donde se cierran: cambiar un `ROLES_TODOS` por la
   lista de roles que corresponda es todo lo que hay que tocar, aquí y en el
   endpoint equivalente del backend.

   `admin` está aparte porque sí se aplica desde hoy: crear usuarios es sólo
   suyo, y el backend lo exige.
   ═══════════════════════════════════════════════════════════════════════════ */

const ROLES_TODOS: Rol[] = ["admin", "arquitectura", "data", "comercial"];

/** Qué roles pueden ver cada módulo del menú. */
export const PERMISOS: Record<string, Rol[]> = {
  panel: ROLES_TODOS,
  predios: ROLES_TODOS,
  extraccion: ROLES_TODOS,
  flujo: ROLES_TODOS,
  nuevo: ROLES_TODOS,
  comite: ROLES_TODOS,
  arq: ROLES_TODOS,
  data: ROLES_TODOS,
  comercial: ROLES_TODOS,
  gestion: ROLES_TODOS,
  /* El único cerrado hoy: lo exige también el backend, así que esconderlo no
     es la protección, es no ofrecer una puerta que da 403. */
  equipo: ["admin"],
};

export const puedeVer = (modulo: string, rol: Rol | undefined) =>
  !!rol && (PERMISOS[modulo] ?? ROLES_TODOS).includes(rol);
