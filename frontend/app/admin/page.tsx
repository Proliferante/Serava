import AdminGate from "@/components/admin/AdminGate";
import "@/styles/admin.css";

export const metadata = { title: "Zequara · Consola interna" };

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
 * consola. Ese acceso todavía no autentica de verdad —falta la fase F1 del
 * backend—; está explicado en `components/admin/AdminLogin.tsx`.
 */
export default function AdminPage() {
  return <AdminGate />;
}
