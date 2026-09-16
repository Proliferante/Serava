"use client";

import { useState } from "react";
import ScaledCanvas from "@/components/ScaledCanvas";
import Finanzas, { ALTO_ABIERTA, ALTO_CERRADA } from "./Finanzas";

/**
 * El lienzo de la pestaña de Finanzas.
 *
 * La ficha técnica completa se despliega dentro de la página, así que el alto
 * del frame deja de ser una constante: pasa de 1847 a 4165. Como `ScaledCanvas`
 * reserva su hueco con `aspect-ratio`, el estado tiene que vivir por encima de
 * él —aquí— y no dentro de la ficha.
 */
export default function FinanzasCanvas() {
  const [abierta, setAbierta] = useState(false);

  return (
    <ScaledCanvas width={1920} height={abierta ? ALTO_ABIERTA : ALTO_CERRADA} animaAlto>
      <Finanzas abierta={abierta} onToggle={() => setAbierta((v) => !v)} />
    </ScaledCanvas>
  );
}
