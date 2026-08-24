"use client";

import { MotionConfig } from "framer-motion";
import { useState } from "react";
import { PrediosHead, PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { WRAP } from "@/components/responsive/kit";
import { AVISOS, CUENTA, IDIOMAS, MONEDAS } from "@/components/sections/cuenta/data";
import { IcoCheck, IcoLock, IcoSalir } from "@/components/sections/cuenta/ui";
import {
  ABtn, Acciones, AcctCard, AcctToast, BROWN, CuentaTabs, FField, FSelect,
  FToggleRow, Full, Grid,
} from "@/components/responsive/cuenta/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURACIÓN — vista fluida para móvil y tablet.

   El lienzo (688:4280) ya apila las cuatro tarjetas en una columna de 720, así
   que aquí la estructura es la misma y sólo cambian los anchos: los campos
   pasan a una columna —dos desde 640— y cada fila de avisos se convierte en
   zona de toque completa, con el interruptor a la derecha.
   ═══════════════════════════════════════════════════════════════════════════ */

export default function ConfiguracionCompact() {
  const [clave, setClave] = useState({ actual: "", nueva: "", confirmar: "" });
  const [prefs, setPrefs] = useState({ idioma: CUENTA.idioma, moneda: CUENTA.moneda });
  const [avisos, setAvisos] = useState(() => Object.fromEntries(AVISOS.map((a) => [a.id, a.activo])));
  const [acuse, setAcuse] = useState(false);

  const guardar = () => {
    setAcuse(true);
    window.setTimeout(() => setAcuse(false), 1800);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen" style={{ background: BROWN }}>
        <PrediosNavCompact cuenta="configuracion" />

        <section className={`${WRAP} pb-[46px] pt-[24px]`}>
          <PrediosHead eyebrow="Tu cuenta" title={<span className="font-semibold">Configuración</span>}>
            Seguridad, notificaciones y preferencias de tu cuenta.
          </PrediosHead>

          <CuentaTabs />

          {/* ══════════ CAMBIAR CONTRASEÑA ══════════ */}
          <AcctCard titulo="Cambiar contraseña" sub="Usa al menos 8 caracteres con mayúsculas, minúsculas y un número." delay={0.04}>
            <Grid>
              <Full>
                <FField
                  label="Contraseña actual" type="password" placeholder="••••••••" autoComplete="current-password"
                  value={clave.actual} onChange={(v) => setClave((c) => ({ ...c, actual: v }))}
                />
              </Full>
              <FField
                label="Nueva contraseña" type="password" placeholder="••••••••" autoComplete="new-password"
                value={clave.nueva} onChange={(v) => setClave((c) => ({ ...c, nueva: v }))}
              />
              <FField
                label="Confirmar nueva" type="password" placeholder="••••••••" autoComplete="new-password"
                value={clave.confirmar} onChange={(v) => setClave((c) => ({ ...c, confirmar: v }))}
              />
            </Grid>
            <Acciones>
              <ABtn icon={<IcoLock />} onClick={guardar}>Actualizar contraseña</ABtn>
            </Acciones>
          </AcctCard>

          {/* ══════════ NOTIFICACIONES ══════════ */}
          <AcctCard titulo="Notificaciones" sub="Elige sobre qué te avisamos." delay={0.08}>
            <div className="-mt-[14px]">
              {AVISOS.map((a, i) => (
                <FToggleRow
                  key={a.id}
                  titulo={a.titulo}
                  detalle={a.detalle}
                  on={avisos[a.id]}
                  onToggle={() => setAvisos((s) => ({ ...s, [a.id]: !s[a.id] }))}
                  ultima={i === AVISOS.length - 1}
                />
              ))}
            </div>
          </AcctCard>

          {/* ══════════ PREFERENCIAS ══════════ */}
          <AcctCard titulo="Preferencias" delay={0.12}>
            <Grid>
              <FSelect label="Idioma" value={prefs.idioma} onChange={(v) => setPrefs((p) => ({ ...p, idioma: v }))} options={IDIOMAS} />
              <FSelect label="Moneda" value={prefs.moneda} onChange={(v) => setPrefs((p) => ({ ...p, moneda: v }))} options={MONEDAS} />
            </Grid>
            <Acciones>
              <ABtn icon={<IcoCheck />} onClick={guardar}>Guardar</ABtn>
            </Acciones>
          </AcctCard>

          {/* ══════════ SESIÓN ══════════ */}
          <AcctCard titulo="Sesión" sub="Cierra tu sesión en este dispositivo." delay={0.16}>
            <ABtn tono="danger" href="/login" icon={<IcoSalir />}>Cerrar sesión</ABtn>
          </AcctCard>
        </section>

        <AcctToast visible={acuse} />
      </div>
    </MotionConfig>
  );
}
