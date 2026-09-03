import AdminGate from "@/components/admin/AdminGate";
import "@/styles/admin.css";

export const metadata = {
  title: "Zequara · Consola interna",
  /* Fuera de los buscadores. No es una medida de seguridad —lo que protege es
     el login y el 401 del servidor— pero una consola interna no tiene nada
     que hacer en los resultados de Google, y su URL en un índice público es
     una invitación a probar contraseñas. */
  robots: { index: false, follow: false },
};

/**
 * CONSOLA INTERNA DEL EQUIPO — embudo de predios, extracción, comité,
 * seguimiento y gestión de un activo.
 *
 * Antes era un `index.html` de 1.900 líneas en `public/admin-app/`, servido
 * dentro de un iframe a pantalla completa. Ahora está integrada: el marcado y
 * la lógica son componentes en `components/admin/`, la hoja de estilo original
 * vive en `styles/admin.css` acotada bajo `.adm`, la fuente sale del
 * `next/font` del layout y las llamadas van a `/api/admin` (ver
 * `backend/app/api/admin.py`), no al backend de inversionistas.
 *
 * Se entra por `AdminGate`, que enseña el acceso del equipo antes de la
 * consola. Autentica de verdad contra `POST /api/auth/login`: sesión en
 * cookie HttpOnly con estado en la tabla `sesiones`, y todo lo que hay bajo
 * `/api/admin` exige esa sesión en el servidor (ver `backend/app/main.py`).
 * Esconder un módulo del menú es comodidad; lo que protege es el 401.
 */
export default function AdminPage() {
  return <AdminGate />;
}
