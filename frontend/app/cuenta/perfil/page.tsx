import ScaledCanvas from "@/components/ScaledCanvas";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import PerfilCompact from "@/components/responsive/cuenta/PerfilCompact";
import PerfilScreen, { PERFIL_H } from "@/components/sections/cuenta/PerfilScreen";

/**
 * CUENTA · MI PERFIL — Figma 688:4032 (1920 × 1203.66).
 *
 * Los datos personales y de contacto del inversionista. Se entra por el avatar
 * de la barra del área privada, que es el `button#meBtn` del diseño.
 */
export default function PerfilPage() {
  return (
    <main style={{ background: "#492100" }}>
      <Compact><PerfilCompact /></Compact>
      <Desk>
        <ScaledCanvas width={1920} height={PERFIL_H}>
          <PerfilScreen />
        </ScaledCanvas>
      </Desk>
    </main>
  );
}
