import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";
import { TERMINOS } from "@/components/legal/terminos";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso — Zequara",
  description: "Condiciones de acceso y uso del sitio web y la plataforma de gestión de inversión en finca raíz ZEQUARA, operada por SAVVY BRIDGE S.A.S.",
};

export default function TerminosPage() {
  return <LegalPage doc={TERMINOS} />;
}
