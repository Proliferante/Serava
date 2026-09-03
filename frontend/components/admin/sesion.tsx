"use client";

import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useState,
  type ReactNode,
} from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   SESIÓN DE LA CONSOLA — quién entró y con qué rol.

   AQUÍ NO HAY NINGÚN TOKEN, Y ESO ES EL PUNTO.

   La sesión viaja en una cookie `HttpOnly` que pone el backend y que este
   código no puede leer ni escribir. Antes se guardaba un token en
   `sessionStorage`, y lo que guarda JavaScript lo lee JavaScript: cualquier
   script inyectado podía llevárselo y usar la sesión desde otro sitio y otro
   día. Con la cookie, un XSS podría hacer peticiones mientras la pestaña está
   abierta, pero no robar la sesión para después.

   Lo único que se guarda aquí es quién eres, en memoria, para no enseñar
   módulos que van a dar 403. Al recargar se vuelve a preguntar a `/yo`.

   `pedir()` es la única forma de llamar a la API: manda la cookie y, si el
   servidor responde 401, olvida al usuario y la consola vuelve al acceso.
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

/* `useLayoutEffect` avisa si se ejecuta en el servidor, donde no hay nada que
   medir. Mismo patrón que `ScaledCanvas`. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Las reglas de contraseña, tal como las manda el backend. */
export type Politica = { minima: number; reglas: string[] };

/* Sólo se usa mientras la respuesta del servidor está en camino, o si esa
   llamada falla. Tiene que coincidir con `CLAVE_MINIMA` de
   `backend/app/core/config.py`; si algún día no coincide, el servidor manda
   —él es quien valida— y el formulario se corrige solo en cuanto responde
   `/api/auth/politica`. */
const POLITICA_POR_DEFECTO: Politica = {
  minima: 12,
  reglas: [
    "Al menos 12 caracteres.",
    "No puede ser una contraseña común.",
    "No puede contener tu nombre ni tu correo.",
  ],
};

type Ctx = {
  usuario: Usuario | null;
  /** Las reglas que aplica el servidor, para no contradecirlo en pantalla. */
  politica: Politica;
  /** `false` hasta que se preguntó a `/yo`. Evita el parpadeo. */
  listo: boolean;
  entrar: (correo: string, clave: string) => Promise<void>;
  salir: () => Promise<void>;
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

/**
 * Saca el mensaje que manda FastAPI en `detail`, sea texto o lista.
 *
 * Y si el cuerpo no es JSON, dice qué significa eso en vez de un "Error 404"
 * pelado. Un 404 con HTML dentro no viene del backend: viene de quien sirve
 * el frontend, porque `/api/*` no está reescrito hacia ningún backend y Next
 * atiende la ruta él mismo. Pasó al desplegar en Vercel sin `BACKEND_URL`, y
 * el mensaje que salía en pantalla no daba ninguna pista de por dónde buscar.
 */
async function mensajeDeError(r: Response): Promise<string> {
  const texto = await r.text().catch(() => "");
  try {
    const d = JSON.parse(texto)?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d) && d.length) return d[0]?.msg || JSON.stringify(d[0]);
    return `Error ${r.status}`;
  } catch {
    if (r.status === 404) {
      return "No hay backend detrás de /api: la web respondió por él (404). "
        + "Revisa BACKEND_URL en el despliegue, o que el servidor esté corriendo.";
    }
    if (r.status >= 502 && r.status <= 504) {
      return "El servidor no responde ahora mismo. Inténtalo de nuevo en un momento.";
    }
    return `Error ${r.status}`;
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [politica, setPolitica] = useState<Politica>(POLITICA_POR_DEFECTO);
  const [listo, setListo] = useState(false);

  /**
   * Le pide al servidor que retire la sesión, y olvida al usuario.
   *
   * La llamada va primero: sin ella la cookie seguiría viva y volver atrás en
   * el navegador dejaría entrar. Si falla porque no hay red, se olvida al
   * usuario igual — al menos esta pestaña deja de estar dentro.
   */
  const salir = useCallback(async () => {
    try {
      await fetch("/api/auth/salir", { method: "POST", credentials: "same-origin" });
    } catch { /* sin red, se cierra en local igual */ }
    setUsuario(null);
  }, []);

  /* Al montar se pregunta a `/yo`. No se puede saber de antemano si hay
     sesión —la cookie es HttpOnly, este código no la ve—, así que siempre hay
     una consulta. Es una sola, al cargar, y devuelve 401 enseguida cuando no
     hay nada.

     La única fuente del usuario y del rol es esa respuesta: nada de lo que
     hubiera guardado el navegador serviría, porque se puede editar a mano. */
  useIsoLayoutEffect(() => {
    let vivo = true;

    /* Restos de la versión anterior, que guardaba el token aquí. Ya no sirve
       para nada —el backend no acepta ese formato—, pero dejarlo en el
       navegador de todo el equipo es basura con pinta de credencial. Se borra
       la primera vez que cada quien entra con la versión nueva. */
    try { window.sessionStorage.removeItem("zq:admin:token"); } catch { /* da igual */ }

    /* La política se pide sin sesión, porque la necesita la pantalla de cambio
       obligatorio: ahí el usuario está dentro pero aún no tiene contraseña
       propia. Si falla, se queda el valor por defecto. */
    fetch("/api/auth/politica")
      .then(async (r) => { if (vivo && r.ok) setPolitica(await r.json()); })
      .catch(() => { /* se queda el valor por defecto */ });

    fetch("/api/auth/yo", { credentials: "same-origin" })
      .then(async (r) => {
        if (!vivo) return;
        if (r.ok) setUsuario(await r.json());
      })
      .catch(() => { /* sin sesión, o sin backend: se enseña el acceso */ })
      .finally(() => { if (vivo) setListo(true); });
    return () => { vivo = false; };
  }, []);

  const entrar = useCallback(async (correo: string, clave: string) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, clave }),
    });
    if (!r.ok) throw new Error(await mensajeDeError(r));

    /* La respuesta trae el usuario, no la sesión: esa la puso el servidor en
       una cookie que este código no puede leer, y así debe ser. */
    const d = await r.json();
    setUsuario(d.usuario);
  }, []);

  const pedir = useCallback(async <T,>(ruta: string, init: RequestInit = {}): Promise<T> => {
    const r = await fetch(ruta, {
      ...init,
      credentials: "same-origin",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(init.headers || {}),
      },
    });
    if (r.status === 401) {
      /* Vencida, o retirada desde otro sitio. Se olvida al usuario y la
         consola vuelve al acceso sola. No se llama a `salir()`: no hay sesión
         que cerrar y ese POST daría otro 401. */
      setUsuario(null);
      throw new Error("Tu sesión venció. Entra de nuevo.");
    }
    if (!r.ok) throw new Error(await mensajeDeError(r));
    return r.json() as Promise<T>;
  }, []);

  const refrescar = useCallback(async () => {
    try {
      setUsuario(await pedir<Usuario>("/api/auth/yo"));
    } catch { /* si falla, `pedir` ya devolvió al acceso cuando tocaba */ }
  }, [pedir]);

  return (
    <C.Provider value={{ usuario, politica, listo, entrar, salir, pedir, refrescar }}>
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
  /* Su propia cuenta la ve cualquiera: son sus datos. */
  cuenta: ROLES_TODOS,
  /* El único cerrado hoy: lo exige también el backend, así que esconderlo no
     es la protección, es no ofrecer una puerta que da 403. */
  equipo: ["admin"],
};

export const puedeVer = (modulo: string, rol: Rol | undefined) =>
  !!rol && (PERMISOS[modulo] ?? ROLES_TODOS).includes(rol);
