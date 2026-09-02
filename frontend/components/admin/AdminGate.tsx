"use client";

import AdminConsole from "@/components/admin/AdminConsole";
import AdminLogin from "@/components/admin/AdminLogin";
import CambiarClave from "@/components/admin/CambiarClave";
import { SesionProvider, useSesion } from "@/components/admin/sesion";

/* ═══════════════════════════════════════════════════════════════════════════
   PUERTA DE /admin — decide qué de las tres se ve.

       sin sesión            → el acceso
       sesión + clave temporal → el cambio obligatorio de contraseña
       sesión normal         → la consola

   `listo` evita el parpadeo: mientras se comprueba el token guardado no se
   pinta nada. Sin eso, quien ya tenía sesión vería el formulario de acceso
   durante un instante en cada recarga.

   El HTML que sale del servidor es el hueco, no el formulario: `sessionStorage`
   no existe allí, así que el servidor no puede saber cuál de las tres toca. La
   decisión se toma en el cliente, y para quien llega sin sesión se toma antes
   de pintar (ver el `useLayoutEffect` de `SesionProvider`), de modo que el
   hueco sólo se ve mientras se valida un token que sí existía.
   ═══════════════════════════════════════════════════════════════════════════ */

function Puerta() {
  const { usuario, listo } = useSesion();

  if (!listo) return <div style={{ minHeight: "100vh", background: "#2a1e14" }} />;
  if (!usuario) return <AdminLogin />;
  if (usuario.debe_cambiar_clave) return <CambiarClave />;
  return <AdminConsole />;
}

export default function AdminGate() {
  return (
    <SesionProvider>
      <Puerta />
    </SesionProvider>
  );
}
