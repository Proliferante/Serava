/* ═══════════════════════════════════════════════════════════════════════════
   COOKIES — el consentimiento y la analítica.

   CÓMO FUNCIONA
     · Sin `NEXT_PUBLIC_GA_ID` no pasa nada: ni aviso, ni Google, ni enlace de
       preferencias, y la política sigue diciendo que no hay analítica. Es el
       interruptor: se pone la variable en Vercel, se redespliega, y aparecen
       a la vez el aviso, la analítica y el texto nuevo de la política.
     · Google Analytics NO se carga hasta que la persona pulsa «Aceptar». Es
       lo que promete la política (sección 13): pedir permiso antes.
     · La decisión se guarda en la cookie `zq_cookies` (6 meses). Si cambia
       `VERSION`, el aviso vuelve a salir para todos.
     · Retirar el permiso apaga Google y borra sus cookies.
     · Sólo en el sitio público: ni la consola ni las áreas con sesión.
   ═══════════════════════════════════════════════════════════════════════════ */

export const GA_ID = (process.env.NEXT_PUBLIC_GA_ID || "").trim();
export const ANALITICA = /^G-[A-Z0-9]+$/.test(GA_ID);

/** Súbela si cambia lo que se pide (otra herramienta, otra finalidad). */
const VERSION = "1";
const NOMBRE = "zq_cookies";
const DURACION_DIAS = 180;
/** Lo que dispara «Preferencias de cookies» para volver a abrir el aviso. */
export const EVENTO_ABRIR = "zq:cookies:abrir";

export type Decision = "si" | "no";

export function leerDecision(): Decision | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${NOMBRE}=([^;]*)`));
  if (!m) return null;
  const [v, d] = decodeURIComponent(m[1]).split(".");
  return v === VERSION && (d === "si" || d === "no") ? d : null;
}

export function guardarDecision(d: Decision) {
  const seguro = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NOMBRE}=${encodeURIComponent(`${VERSION}.${d}.${Date.now()}`)}; Max-Age=${DURACION_DIAS * 86400}; Path=/; SameSite=Lax${seguro}`;
}

/** Donde no se mide: la consola (su subdominio, o /admin en local) y las
    áreas con sesión. Ahí tampoco sale el aviso. */
const PRIVADAS = ["/admin", "/panel", "/cuenta", "/predios", "/login"];
export function esZonaPublica(): boolean {
  if (location.hostname.startsWith("admin.")) return false;
  return !PRIVADAS.some((r) => location.pathname === r || location.pathname.startsWith(r + "/"));
}

type ConGtag = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; __zqGA?: boolean } & Record<string, unknown>;

/** Carga Google Analytics. Sólo se llama con permiso. */
export function cargarAnalitica() {
  const w = window as unknown as ConGtag;
  if (!ANALITICA) return;
  w[`ga-disable-${GA_ID}`] = false;
  if (w.__zqGA) return;
  w.__zqGA = true;
  w.dataLayer = w.dataLayer || [];
  // gtag necesita `arguments`, no un array: así lo lee su librería.
  w.gtag = function gtag() { (w.dataLayer as unknown[]).push(arguments); };
  w.gtag("js", new Date());
  w.gtag("config", GA_ID, {
    // Nada de publicidad ni de cruzar con cuentas de Google.
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Apaga Google y borra sus cookies (_ga, _ga_XXXX), en el dominio y en el
    dominio padre, que es donde las suele poner. */
export function apagarAnalitica() {
  const w = window as unknown as ConGtag;
  if (ANALITICA) w[`ga-disable-${GA_ID}`] = true;
  const partes = location.hostname.split(".");
  const dominios = ["", location.hostname, ...partes.map((_, i) => "." + partes.slice(i).join(".")).filter((d) => d.split(".").length > 2)];
  for (const c of document.cookie.split("; ")) {
    const nombre = c.split("=")[0];
    if (nombre !== "_ga" && !nombre.startsWith("_ga_")) continue;
    for (const d of dominios) document.cookie = `${nombre}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
  }
}
