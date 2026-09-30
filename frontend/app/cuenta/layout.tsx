import type { ReactNode } from "react";

import { exigeInversor } from "@/lib/inversor";

/* Área privada: sin sesión de inversionista no se pinta (ver lib/inversor.ts). */
export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  await exigeInversor("/cuenta");
  return <>{children}</>;
}
