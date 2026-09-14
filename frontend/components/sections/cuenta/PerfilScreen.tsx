"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { EASE } from "@/components/motion/Kinetics";
import PrediosNav from "@/components/predios/PrediosNav";
import { CANALES, CUENTA, HORARIOS, PAISES, RESUMEN } from "@/components/sections/cuenta/data";
import {
  AVATAR_BG, BROWN, Btn, Card, Field, Head, IcoCheck, L04, L06, L12, LINEN, Motif,
  OLIVE, Select, SecTitle, T, TAG_BG, Toast,
} from "@/components/sections/cuenta/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   MI PERFIL — Figma 688:4032 (1920 × 1203.66).

   Los datos personales del inversionista. A la izquierda, la ficha con el
   avatar, el nombre y las dos cifras del portafolio; a la derecha, las dos
   secciones editables: información personal y preferencias de contacto.

   La columna útil son 1012 px en x=454, la misma retícula que Configuración.
   Las coordenadas son las de `get_metadata`, con sus decimales: la fila de
   campos avanza de 82.844 en 82.844 porque en el diseño el hueco entre filas
   sale de un `gap` y no de un número redondo. Los campos van dentro de su
   tarjeta, en coordenadas relativas a ella, para que entren con ella.
   ═══════════════════════════════════════════════════════════════════════════ */

export const PERFIL_H = 1203.66;

const FICHA = { x: 454, y: 255.39, w: 320, h: 337.17 };
const CARD_A = { x: 796, y: 255.39, w: 670, h: 554.22 };
const CARD_B = { x: 796, y: 831.61, w: 670, h: 295.68 };

/** Margen interior de las tarjetas y ancho de la retícula de campos. */
const PAD = 25;
const GRID_W = 620;
/** Media columna de la retícula, y el salto a la columna derecha. */
const HALF = 301;
const COL2 = 319;
/** Alto de la etiqueta más su hueco: es el paso de una fila de campos. */
const FILA = 82.844;

/** Los valores con los que arranca el formulario, y a los que vuelve al descartar. */
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

export default function PerfilScreen() {
  const quieto = useReducedMotion();
  const [datos, setDatos] = useState(INICIAL);
  const [contacto, setContacto] = useState({ canal: CUENTA.canal, horario: CUENTA.horario });
  const [aviso, setAviso] = useState(false);

  /** El guardado es de maqueta: enseña el acuse y lo retira solo. */
  const guardar = () => {
    setAviso(true);
    window.setTimeout(() => setAviso(false), 1800);
  };

  const set = (k: keyof typeof INICIAL) => (v: string) => setDatos((d) => ({ ...d, [k]: v }));

  return (
    <div className="relative size-full overflow-hidden" style={{ background: BROWN }} data-name="MI PERFIL">
      <Motif h={PERFIL_H} />

      <Head
        y={94.39}
        lead="Tus datos personales y de contacto en ZEQUARA."
        title={<><span style={{ fontWeight: 300 }}>Mi </span><span style={{ fontWeight: 700 }}>perfil</span></>}
      />

      {/* ══════════ FICHA (688:4061) ══════════ */}
      <motion.div
        className="absolute"
        style={{
          left: FICHA.x, top: FICHA.y, width: FICHA.w, height: FICHA.h,
          borderRadius: 16, background: L04, border: `1px solid ${L12}`,
        }}
        {...(quieto ? {} : {
          initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay: 0.24, ease: EASE },
        })}
      >
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: 112, top: 25, width: 96, height: 96, borderRadius: 999,
            background: AVATAR_BG, color: LINEN, fontSize: 33, fontWeight: 600, letterSpacing: 0.5,
          }}
        >
          {CUENTA.iniciales}
        </div>

        <p className="absolute m-0 text-center" style={{ left: PAD, top: 137, width: 270, fontSize: 23, lineHeight: "30px", fontWeight: 600, color: LINEN }}>
          {CUENTA.nombre} {CUENTA.apellido}
        </p>
        <p className="absolute m-0 text-center" style={{ left: PAD, top: 169, width: 270, fontSize: 13.8, lineHeight: "20px", fontWeight: 300, color: "rgba(247,241,229,0.55)" }}>
          {CUENTA.correo}
        </p>

        <p
          className="absolute m-0 flex items-center justify-center"
          style={{ left: 80.36, top: 200.69, width: 160, height: 26, borderRadius: 999, background: TAG_BG, color: OLIVE, fontSize: 11, fontWeight: 600 }}
        >
          {CUENTA.desde}
        </p>

        {/* Las dos cifras, con el filete que las separa del resto de la ficha. */}
        <div className="absolute" style={{ left: PAD, top: 246.53, width: 270, height: 65.64, borderTop: `1px solid ${L06}` }}>
          {RESUMEN.map((r, i) => (
            <div key={r.etiqueta} className="absolute" style={{ left: i === 0 ? 33.28 : 174.2, top: 19, width: i === 0 ? 74.36 : 62.52 }}>
              <p className="m-0 text-center" style={{ fontSize: 25.5, lineHeight: "29.8px", fontWeight: 600, color: LINEN }}>{r.valor}</p>
              <p className="m-0 mt-px text-center" style={T.label}>{r.etiqueta}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══════════ INFORMACIÓN PERSONAL (688:4085) ══════════ */}
      <Card {...CARD_A} delay={0.3}>
        <SecTitle x={PAD} y={24} w={GRID_W}>Información personal</SecTitle>

        <Field x={PAD} y={58} w={HALF} label="Nombre" value={datos.nombre} onChange={set("nombre")} autoComplete="given-name" />
        <Field x={PAD + COL2} y={58} w={HALF} label="Apellido" value={datos.apellido} onChange={set("apellido")} autoComplete="family-name" />
        <Field x={PAD} y={58 + FILA} w={HALF} type="email" label="Correo electrónico" value={datos.correo} onChange={set("correo")} autoComplete="email" />
        <Field x={PAD + COL2} y={58 + FILA} w={HALF} type="tel" label="Teléfono" value={datos.telefono} onChange={set("telefono")} autoComplete="tel" />
        <Field x={PAD} y={58 + FILA * 2} w={HALF} label="Documento de identidad" value={datos.documento} onChange={set("documento")} />
        <Field x={PAD + COL2} y={58 + FILA * 2} w={HALF} h={51} type="date" label="Fecha de nacimiento" value={datos.nacimiento} onChange={set("nacimiento")} />
        <Field x={PAD} y={58 + 250.531} w={HALF} label="Ciudad" value={datos.ciudad} onChange={set("ciudad")} />
        <Select x={PAD + COL2} y={58 + 250.531} w={HALF} label="País" value={datos.pais} onChange={set("pais")} options={PAISES} />
        <Field x={PAD} y={58 + 333.375} w={GRID_W} label="Dirección" value={datos.direccion} onChange={set("direccion")} autoComplete="street-address" />

        <Btn x={317} y={480.22} w={119} h={49} tono="ghost" onClick={() => setDatos(INICIAL)}>Descartar</Btn>
        <Btn x={446} y={480.22} w={199} h={49} icon={<IcoCheck />} onClick={guardar}>Guardar cambios</Btn>
      </Card>

      {/* ══════════ PREFERENCIAS DE CONTACTO (688:4163) ══════════ */}
      <Card {...CARD_B} delay={0.38}>
        <SecTitle x={PAD} y={24} w={GRID_W}>Preferencias de contacto</SecTitle>

        <Select x={PAD} y={58} w={HALF} label="Canal preferido" value={contacto.canal} onChange={(v) => setContacto((c) => ({ ...c, canal: v }))} options={CANALES} />
        <Select x={PAD + COL2} y={58} w={HALF} label="Horario de contacto" value={contacto.horario} onChange={(v) => setContacto((c) => ({ ...c, horario: v }))} options={HORARIOS} />
        <Field x={PAD} y={58 + 76.844} w={GRID_W} label="Gestor asignado" value={CUENTA.gestor} readOnly />

        <Btn x={514} y={223.69} w={131} h={47} icon={<IcoCheck />} onClick={guardar}>Guardar</Btn>
      </Card>

      <Toast y={1155} visible={aviso} />

      {/* El nav va al final para quedar sobre el velo, como en el diseño. */}
      <PrediosNav active="none" geo="cuenta" cuenta="perfil" />
    </div>
  );
}
