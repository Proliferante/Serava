import type { ReactNode } from "react";
import ScaledCanvas from "@/components/ScaledCanvas";
import Shell, { type PanelKey } from "@/components/panel/Shell";
import { PAPER } from "@/components/panel/ui";

/**
 * Envoltorio de las páginas del panel: lienzo de 1920 px escalado al viewport
 * y el shell (sidebar + topbar) alrededor de la vista.
 *
 * A diferencia de la web pública, aquí no van Navbar ni Footer: el sidebar es
 * la navegación y el área privada no tiene pie.
 */
export default function PanelPage({
  active, h, children,
}: { active: PanelKey; h: number; children: ReactNode }) {
  return (
    <main style={{ background: PAPER }}>
      <ScaledCanvas width={1920} height={h}>
        <Shell active={active} h={h}>{children}</Shell>
      </ScaledCanvas>
    </main>
  );
}
