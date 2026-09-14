"use client";

import { MotionConfig } from "framer-motion";
import { useState } from "react";
import { PrediosHead, PrediosNavCompact } from "@/components/responsive/predios/PrediosShell";
import { In, WRAP } from "@/components/responsive/kit";
import { CANALES, CUENTA, HORARIOS, PAISES, RESUMEN } from "@/components/sections/cuenta/data";
import { IcoCheck } from "@/components/sections/cuenta/ui";
import {
  ABtn, Acciones, AcctCard, AcctToast, AVATAR_BG, BROWN, CuentaTabs, FField,
  FSelect, Full, Grid, L04, L06, L12, L60, LINEN, OLIVE, TAG_BG,
} from "@/components/responsive/cuenta/kit";

/* ═══════════════════════════════════════════════════════════════════════════
   MI PERFIL — vista fluida para móvil y tablet.

   El lienzo (688:4032) reparte la pantalla en dos: la ficha del inversionista
   en una columna de 320 px y el formulario en otra de 670. Aquí va todo en
   una: la ficha primero, en fila para no gastar media pantalla, y debajo las
   dos secciones editables con la retícula de campos a una columna —dos desde
   640—.
   ═══════════════════════════════════════════════════════════════════════════ */

const INICIAL = {
  nombre: CUENTA.nombre,
  apellido: CUENTA.apellido,
  correo: CUENTA.correo,
  telefono: CUENTA.telefono,
  documento: CUENTA.documento,
  nacimiento: CUENTA.nacimiento,
  ciudad: CUENTA.ciudad,
  pais: CUENTA.pais,
  direccion: CUENTA.direccion,
};

export default function PerfilCompact() {
  const [datos, setDatos] = useState(INICIAL);
  const [contacto, setContacto] = useState({ canal: CUENTA.canal, horario: CUENTA.horario });
  const [acuse, setAcuse] = useState(false);

  const guardar = () => {
    setAcuse(true);
    window.setTimeout(() => setAcuse(false), 1800);
  };

  const set = (k: keyof typeof INICIAL) => (v: string) => setDatos((d) => ({ ...d, [k]: v }));

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen" style={{ background: BROWN }}>
        <PrediosNavCompact cuenta="perfil" />

        <section className={`${WRAP} pb-[46px] pt-[24px]`}>
          <PrediosHead eyebrow="Tu cuenta" title={<>Mi <span className="font-semibold">perfil</span></>}>
            Tus datos personales y de contacto en ZEQUARA.
          </PrediosHead>

          <CuentaTabs />

          {/* ══════════ FICHA ══════════ */}
          <In y={18} className="mt-[18px] rounded-[18px] p-[18px]" style={{ background: L04, border: `1px solid ${L12}` }}>
            <div className="flex items-center gap-[14px]">
              <span
                className="flex size-[64px] shrink-0 items-center justify-center rounded-full text-[22px] font-semibold"
                style={{ background: AVATAR_BG, color: LINEN }}
              >
                {CUENTA.iniciales}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[19px] font-semibold leading-[26px]" style={{ color: LINEN }}>
                  {CUENTA.nombre} {CUENTA.apellido}
                </span>
                <span className="mt-[2px] block truncate text-[13.5px] font-light leading-[19px]" style={{ color: "rgba(247,241,229,0.55)" }}>
                  {CUENTA.correo}
                </span>
                <span
                  className="mt-[8px] inline-flex items-center rounded-full px-[11px] py-[4px] text-[11px] font-semibold"
                  style={{ background: TAG_BG, color: OLIVE }}
                >
                  {CUENTA.desde}
                </span>
              </span>
            </div>

            <div className="mt-[16px] flex pt-[14px]" style={{ borderTop: `1px solid ${L06}` }}>
              {RESUMEN.map((r) => (
                <div key={r.etiqueta} className="flex-1 text-center">
                  <p className="m-0 text-[24px] font-semibold leading-[30px]" style={{ color: LINEN }}>{r.valor}</p>
                  <p className="m-0 text-[10.5px] font-medium uppercase leading-[16px] tracking-[1.2px]" style={{ color: L60 }}>{r.etiqueta}</p>
                </div>
              ))}
            </div>
          </In>

          {/* ══════════ INFORMACIÓN PERSONAL ══════════ */}
          <AcctCard titulo="Información personal" delay={0.06}>
            <Grid>
              <FField label="Nombre" value={datos.nombre} onChange={set("nombre")} autoComplete="given-name" />
              <FField label="Apellido" value={datos.apellido} onChange={set("apellido")} autoComplete="family-name" />
              <FField label="Correo electrónico" type="email" value={datos.correo} onChange={set("correo")} autoComplete="email" />
              <FField label="Teléfono" type="tel" value={datos.telefono} onChange={set("telefono")} autoComplete="tel" />
              <FField label="Documento de identidad" value={datos.documento} onChange={set("documento")} />
              <FField label="Fecha de nacimiento" type="date" value={datos.nacimiento} onChange={set("nacimiento")} />
              <FField label="Ciudad" value={datos.ciudad} onChange={set("ciudad")} />
              <FSelect label="País" value={datos.pais} onChange={set("pais")} options={PAISES} />
              <Full>
                <FField label="Dirección" value={datos.direccion} onChange={set("direccion")} autoComplete="street-address" />
              </Full>
            </Grid>
            <Acciones>
              <ABtn tono="ghost" onClick={() => setDatos(INICIAL)}>Descartar</ABtn>
              <ABtn icon={<IcoCheck />} onClick={guardar}>Guardar cambios</ABtn>
            </Acciones>
          </AcctCard>

          {/* ══════════ PREFERENCIAS DE CONTACTO ══════════ */}
          <AcctCard titulo="Preferencias de contacto" delay={0.1}>
            <Grid>
              <FSelect label="Canal preferido" value={contacto.canal} onChange={(v) => setContacto((c) => ({ ...c, canal: v }))} options={CANALES} />
              <FSelect label="Horario de contacto" value={contacto.horario} onChange={(v) => setContacto((c) => ({ ...c, horario: v }))} options={HORARIOS} />
              <Full>
                <FField label="Gestor asignado" value={CUENTA.gestor} readOnly />
              </Full>
            </Grid>
            <Acciones>
              <ABtn icon={<IcoCheck />} onClick={guardar}>Guardar</ABtn>
            </Acciones>
          </AcctCard>
        </section>

        <AcctToast visible={acuse} />
      </div>
    </MotionConfig>
  );
}
