import type { Metadata } from "next";

import LegalPage from "@/components/legal/LegalPage";
import { PRIVACIDAD } from "@/components/legal/privacidad";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales — Zequara",
  description: "Cómo SAVVY BRIDGE S.A.S., a través de ZEQUARA, recolecta, usa, conserva, comparte y protege los datos personales.",
};

export default function PrivacidadPage() {
  return <LegalPage doc={PRIVACIDAD} />;
}
