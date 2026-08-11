import type { ReactNode } from "react";
import ScaledCanvas from "@/components/ScaledCanvas";
import Shell, { type PanelKey } from "@/components/panel/Shell";
import { PAPER } from "@/components/panel/ui";
import { Compact, Desk } from "@/components/responsive/Adaptive";
import AvisoPantalla from "@/components/responsive/AvisoPantalla";
import PanelShellCompact from "@/components/responsive/panel/PanelShellCompact";

/**
 * Envoltorio de las páginas del panel.
 *
 * Por debajo de 1280 va la vista fluida: el mismo contenido apilado en una
 * columna, con el sidebar convertido en cajón. Por encima, el lienzo de 1920
 * escalado al viewport.
 *
 * A diferencia de la web pública, aquí no van Navbar ni Footer: la navegación
 * es el sidebar (o el cajón) y el área privada no tiene pie.
 */
export default function PanelPage({
  active, h, meta, state, compact, children,
}: {
  active: PanelKey; h: number; meta?: string; state?: string;
  /** La vista fluida de esta pantalla. */
  compact: ReactNode;
  children: ReactNode;
}) {
  return (
    <main style={{ background: PAPER }}>
      <Compact>
        <PanelShellCompact active={active} meta={meta} state={state}>{compact}</PanelShellCompact>
      </Compact>
      <Desk>
        <ScaledCanvas width={1920} height={h}>
          <Shell active={active} h={h} meta={meta} state={state}>{children}</Shell>
        </ScaledCanvas>
      </Desk>
      {/* Aviso de pantalla: sale una vez por sesión al entrar desde un móvil. */}
      <AvisoPantalla />
    </main>
  );
}
