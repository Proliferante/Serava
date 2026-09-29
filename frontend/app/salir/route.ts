import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { firma } from "@/lib/firma";
import { COOKIE_INVERSOR, cookieInversor } from "@/lib/inversor";

/* «Cerrar sesión» del área privada. Es un enlace (`/salir`) y no un botón que
   haga POST desde el navegador para que funcione igual desde el menú de
   cuenta, desde Configuración y desde cualquier sitio donde haya un `<a>`.

   Cierra la sesión en el backend —que es lo que de verdad la mata: la cookie
   sola se puede copiar— y borra la cookie del navegador. No hace falta
   protegerlo contra otros sitios: con `SameSite=Strict` la cookie no viaja
   en una petición que nazca fuera, así que desde fuera no se cierra nada. */

const BACKEND = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const galleta = cookieInversor();
  if (galleta.cookie) {
    try {
      await fetch(`${BACKEND}/api/inversor/salir`, {
        method: "POST",
        headers: { ...firma(), ...galleta },
        cache: "no-store",
      });
    } catch { /* sin backend se borra la cookie igual */ }
  }
  cookies().delete(COOKIE_INVERSOR);
  return NextResponse.redirect(new URL("/login", request.url));
}
