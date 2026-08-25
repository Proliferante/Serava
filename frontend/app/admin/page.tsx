export const metadata = { title: "Zequora · Admin" };

/**
 * Consola interna del equipo (embudo, seguimiento, add-value) — no es parte
 * del sistema de diseño de sections/responsive: es una herramienta propia,
 * autocontenida (public/admin-app/index.html), servida aquí vía iframe para
 * no reescribirla en React. Sus llamadas van a /api/admin/... (backend/app/
 * api/admin.py), no al backend de inversionistas.
 */
export default function AdminPage() {
  return (
    <iframe
      src="/admin-app/index.html"
      title="Zequora · consola interna"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
