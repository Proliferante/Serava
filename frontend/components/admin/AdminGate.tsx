"use client";

import Cargando from "@/components/Cargando";
import AdminConsole from "@/components/admin/AdminConsole";
import AdminLogin from "@/components/admin/AdminLogin";
import CambiarClave from "@/components/admin/CambiarClave";
import Instalable from "@/components/admin/Instalable";
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

  /* Mientras se pregunta al servidor por la sesión. Antes era un fondo
     vacío: con la red lenta parecía que la consola no cargaba. */
  if (!listo) {
    return (
      <div style={{ minHeight: "100vh", background: "#2a1e14" }}>
        <Cargando pantalla tono="oscuro" texto="Comprobando la sesión…" />
      </div>
    );
  }
  if (!usuario) return <AdminLogin />;
  if (usuario.debe_cambiar_clave) return <CambiarClave />;
  /* `Instalable` va sólo aquí, con la sesión dentro: en el login no se
     ofrece instalar nada. */
  return (
    <>
      <Instalable />
      <AdminConsole />
    </>
  );
}

export default function AdminGate() {
  return (
    <SesionProvider>
      <Puerta />
    </SesionProvider>
  );
}
