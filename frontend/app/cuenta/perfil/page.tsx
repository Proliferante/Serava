import CuentaRoute from "@/components/cuenta/CuentaRoute";

/**
 * CUENTA · MI PERFIL — Figma 688:4032 (1920 × 1203.66).
 *
 * Los datos personales y de contacto del inversionista. Se entra por el avatar
 * de la barra del área privada, que es el `button#meBtn` del diseño.
 *
 * Comparte armazón con Configuración: `CuentaRoute` monta las dos y cambia
 * entre ellas sin recargar, pero cada una conserva su ruta.
 */
export default function PerfilPage() {
  return (
    <main style={{ background: "#492100" }}>
      <CuentaRoute tab="perfil" />
    </main>
  );
}
