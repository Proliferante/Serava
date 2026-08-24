"use client";

import { useState } from "react";
import PrediosNav from "@/components/predios/PrediosNav";
import { AVISOS, CUENTA, IDIOMAS, MONEDAS } from "@/components/sections/cuenta/data";
import {
  BROWN, Btn, Card, Field, Head, IcoCheck, IcoLock, IcoSalir, L10, LINEN, Motif,
  SecSub, SecTitle, Select, Toast, Toggle,
} from "@/components/sections/cuenta/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURACIÓN — Figma 688:4280 (1920 × 1581).

   Seguridad, avisos y preferencias. A diferencia de Mi perfil, aquí no hay dos
   columnas: las cuatro tarjetas se apilan en una sola de 720 px, así que la
   mitad derecha del lienzo queda para el velo.

   El bloque de avisos es el único con filas: cada una lleva título, detalle e
   interruptor, y un filete al pie salvo la última —de ahí que mida un píxel
   menos que las otras cuatro en el diseño—.
   ═══════════════════════════════════════════════════════════════════════════ */

export const CONFIG_H = 1581;

const X = 454;
const W = 720;
const PAD = 25;
/** Ancho útil dentro de la tarjeta: 720 − 25 × 2. */
const GRID_W = 670;
/** Media columna del formulario, y el salto a la columna derecha. */
const HALF = 326;
const COL2 = 344;

const C1 = { x: X, y: 255.39, w: W, h: 327.69 };
const C2 = { x: X, y: 603.08, w: W, h: 454.19 };
const C3 = { x: X, y: 1077.27, w: W, h: 201 };
const C4 = { x: X, y: 1298.27, w: W, h: 159.99 };

/** Alto de una fila de avisos. Las cinco arrancan a 85.99 del filo. */
const ROW_H = 68.84;
const ROW_Y = 85.99;

export default function ConfiguracionScreen() {
  const [clave, setClave] = useState({ actual: "", nueva: "", confirmar: "" });
  const [prefs, setPrefs] = useState({ idioma: CUENTA.idioma, moneda: CUENTA.moneda });
  const [avisos, setAvisos] = useState(() => Object.fromEntries(AVISOS.map((a) => [a.id, a.activo])));
  const [acuse, setAcuse] = useState(false);

  /** El guardado es de maqueta: enseña el acuse y lo retira solo. */
  const guardar = () => {
    setAcuse(true);
    window.setTimeout(() => setAcuse(false), 1800);
  };

  return (
    <div className="relative size-full overflow-hidden" style={{ background: BROWN }} data-name="CONFIGURACION">
      <Motif h={CONFIG_H} />

      <Head
        y={94.39}
        lead="Seguridad, notificaciones y preferencias de tu cuenta."
        title={<span style={{ fontWeight: 600 }}>Configuración</span>}
      />

      {/* ══════════ CAMBIAR CONTRASEÑA (688:4308) ══════════ */}
      <Card {...C1} delay={0.24}>
        <SecTitle x={PAD} y={24} w={GRID_W}>Cambiar contraseña</SecTitle>
        <SecSub x={PAD} y={48} w={GRID_W}>Usa al menos 8 caracteres con mayúsculas, minúsculas y un número.</SecSub>

        <Field
          x={PAD} y={86} w={GRID_W} type="password" placeholder="••••••••" autoComplete="current-password"
          label="Contraseña actual" value={clave.actual} onChange={(v) => setClave((c) => ({ ...c, actual: v }))}
        />
        <Field
          x={PAD} y={168.844} w={HALF} type="password" placeholder="••••••••" autoComplete="new-password"
          label="Nueva contraseña" value={clave.nueva} onChange={(v) => setClave((c) => ({ ...c, nueva: v }))}
        />
        <Field
          x={PAD + COL2} y={168.844} w={HALF} type="password" placeholder="••••••••" autoComplete="new-password"
          label="Confirmar nueva" value={clave.confirmar} onChange={(v) => setClave((c) => ({ ...c, confirmar: v }))}
        />

        <Btn x={463} y={255.69} w={232} h={47} icon={<IcoLock />} onClick={guardar}>Actualizar contraseña</Btn>
      </Card>

      {/* ══════════ NOTIFICACIONES (688:4363) ══════════ */}
      <Card {...C2} delay={0.3}>
        <SecTitle x={PAD} y={24} w={GRID_W}>Notificaciones</SecTitle>
        <SecSub x={PAD} y={48} w={GRID_W}>Elige sobre qué te avisamos.</SecSub>

        {AVISOS.map((a, i) => {
          const ultima = i === AVISOS.length - 1;
          return (
            <div
              key={a.id}
              className="absolute"
              style={{
                left: PAD, top: ROW_Y + ROW_H * i, width: GRID_W, height: ultima ? ROW_H - 1 : ROW_H,
                borderBottom: ultima ? undefined : `1px solid ${L10}`,
              }}
            >
              <p className="absolute m-0" style={{ left: 0, top: 13, fontSize: 16, lineHeight: "22.61px", fontWeight: 400, color: LINEN }}>{a.titulo}</p>
              <p className="absolute m-0" style={{ left: 0, top: 33.61, fontSize: 14, lineHeight: "19px", fontWeight: 300, color: "rgba(247,241,229,0.4)" }}>{a.detalle}</p>
              <Toggle
                x={626} y={21.92} label={a.titulo}
                on={avisos[a.id]}
                onToggle={() => setAvisos((s) => ({ ...s, [a.id]: !s[a.id] }))}
              />
            </div>
          );
        })}
      </Card>

      {/* ══════════ PREFERENCIAS (688:4413) ══════════ */}
      <Card {...C3} delay={0.36}>
        <SecTitle x={PAD} y={24} w={GRID_W}>Preferencias</SecTitle>

        <Select x={PAD} y={48} w={HALF} label="Idioma" value={prefs.idioma} onChange={(v) => setPrefs((p) => ({ ...p, idioma: v }))} options={IDIOMAS} />
        <Select x={PAD + COL2} y={48} w={HALF} label="Moneda" value={prefs.moneda} onChange={(v) => setPrefs((p) => ({ ...p, moneda: v }))} options={MONEDAS} />

        <Btn x={564} y={129} w={131} h={47} icon={<IcoCheck />} onClick={guardar}>Guardar</Btn>
      </Card>

      {/* ══════════ SESIÓN (688:4440) ══════════ */}
      <Card {...C4} delay={0.42}>
        <SecTitle x={PAD} y={24} w={GRID_W}>Sesión</SecTitle>
        <SecSub x={PAD} y={48} w={GRID_W}>Cierra tu sesión en este dispositivo.</SecSub>
        <Btn x={PAD} y={85.99} w={169} h={49} tono="danger" href="/login" icon={<IcoSalir />}>Cerrar sesión</Btn>
      </Card>

      <Toast y={1529.7} visible={acuse} />

      <PrediosNav active="none" geo="cuenta" cuenta="configuracion" />
    </div>
  );
}
