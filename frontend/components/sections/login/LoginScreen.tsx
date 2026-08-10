"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WORDMARK, wordmarkH } from "@/components/brand";
import CanvasImage from "@/components/CanvasImage";

const A = "/figma";

function UserIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* Caja del campo, igual para los dos (99:415 / 657:3143). El `pl-51` deja
   sitio al icono, que va en 18. */
const INPUT_BOX = "absolute h-[60px] w-[430px] rounded-[13px] border border-solid overflow-clip flex items-center";
const INPUT_ST = { backgroundColor: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)" } as const;
const INPUT_TXT = "w-full bg-transparent border-0 outline-none pl-[51px] pr-[19px] font-normal text-[16px] text-cream-93 placeholder:text-[rgba(247,241,229,0.45)]";
/* Etiqueta del campo (99:411 / 657:3147). Figma las reporta en Bold, pero en
   el render son de peso medio: el Bold sale de la instancia variable. */
const LABEL = "[word-break:break-word] absolute left-[241px] font-medium leading-[20.34px] not-italic text-[13.1px] tracking-[0.525px]";
const LABEL_ST = { color: "rgba(247,241,229,0.85)" } as const;

/**
 * LOGIN — reproducción del frame de Figma 99:365 (1920 × 1045).
 *
 * El diseño pasó del enlace por correo a usuario + contraseña: son dos campos
 * (657:3143 y 99:415), el botón dice "Ingresar" y el texto de arriba explica
 * que las credenciales llegan por correo.
 *
 * Las piezas van en coordenadas del propio lado del formulario, que es una caja
 * fija de 912 × 1045. Antes el bloque de arriba —eyebrow, titular y subtítulo—
 * colgaba del contenedor centrado de los campos, y en el frame son hermanos
 * suyos con posición propia: por eso salía 86 px más abajo de lo que toca.
 */
export default function LoginScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");

  /** Todavía no hay backend: el prototipo entra directo al área privada. */
  const submit = () => {
    if (!usuario.trim() || !clave) return;
    router.push("/predios");
  };

  return (
    <div className="relative size-full" style={{ background: "#2a1e14" }} data-name="LOGIN">
      {/* ── Lado visual (izquierda) ── */}
      <div
        className="absolute left-0 top-0 h-[1045px] w-[1008px] overflow-clip"
        style={{ backgroundImage: "linear-gradient(162.41deg, #5b4332 0%, #2a1e14 100%)" }}
      >
        {/* Image (50% opacity, blends into gradient) */}
        <div className="absolute inset-0 opacity-50">
          <div className="absolute h-[1082px] left-[-108px] top-[-19px] w-[1442px]">
            <CanvasImage src={`${A}/1d104ea194ca7ae5b0f84b1328433a3a584b589f.webp`} w={1442} className="pointer-events-none" />
          </div>
        </div>

        {/* Logo → inicio (99:452). El frame usa el wordmark completo, en una
            caja de 175.276 × 29.797; se conserva el ancho y el centro vertical
            y el alto sale de la proporción del wordmark de Zequara. */}
        <a href="/" aria-label="Zequara — Inicio" className="ix-nav absolute left-[32px] top-[39.0px]" style={{ width: 175.276, height: wordmarkH(175.276) }}>
          <img loading="lazy" decoding="async" alt="Zequara" className="absolute block inset-0 max-w-none size-full" src={WORDMARK} />
        </a>

        {/* Bottom text */}
        <div className="absolute left-[44px] top-[724px] w-[920px]">
          <div className="[word-break:break-word] font-light leading-[0] not-italic text-cream-93 text-[38.4px] tracking-[-0.768px]">
            <p className="leading-[43px] mb-0">El acceso a Zequara</p>
            <p className="leading-[43px]">es selectivo.</p>
          </div>
          <div className="[word-break:break-word] font-light leading-[0] not-italic text-[15.7px] mt-[15px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.75)" }}>
            <p className="leading-[24.3px] mb-0">Cada operación pasa por un criterio técnico</p>
            <p className="leading-[24.3px] mb-0">de veinte años. Entra para ver las</p>
            <p className="leading-[24.3px]">oportunidades disponibles hoy.</p>
          </div>
        </div>
      </div>

      {/* ── Lado formulario (derecha) ── */}
      <div
        className="absolute left-[1008px] top-0 h-[1045px] w-[912px]"
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(42,30,20,0) 0%, rgba(67,32,4,0.81) 59.945%, #492100 100%)" }}
      >
        {/* Eyebrow (99:396) */}
        <div className="absolute left-[241px] top-[134px] flex h-[17.84px] items-center gap-[12px]">
          <span className="bg-tan-63 h-px opacity-80 w-[32px] inline-block" />
          <span className="font-semibold leading-[17.86px] not-italic text-tan-63 text-[11.5px] tracking-[3.456px] uppercase">Acceso inversionistas</span>
        </div>

        {/* Heading 1 (99:399): bloque de 96.76 centrado en 226.34 */}
        <div className="[word-break:break-word] absolute left-[241px] top-[177.96px] font-semibold leading-[0] not-italic text-cream-93 text-[43.2px] tracking-[-0.864px]">
          <p className="leading-[48.38px] mb-0">Bienvenido de</p>
          <p className="leading-[48.38px]">vuelta.</p>
        </div>

        {/* Subtítulo (99:406). Parte solo en los 430 de la caja, como el frame. */}
        <p className="[word-break:break-word] absolute left-[241px] top-[287.94px] w-[430px] font-light leading-[24.8px] not-italic text-[16px]" style={{ color: "rgba(247,241,229,0.72)" }}>
          Ingresa el usuario y contraseña que fueron enviados a tu correo electrónico
        </p>

        {/* Nombre de usuario (657:3147 + 657:3143) */}
        <p className={`${LABEL} top-[356.33px]`} style={LABEL_ST}>Nombre de usuario</p>
        <div className={`${INPUT_BOX} left-[241px] top-[384px]`} style={INPUT_ST}>
          <span className="absolute left-[18px]" style={{ color: "rgba(247,241,229,0.45)" }}><UserIcon /></span>
          <input
            type="text" autoComplete="username" aria-label="Nombre de usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="@usuario"
            className={INPUT_TXT}
          />
        </div>

        {/* Contraseña (99:410 + 99:415) */}
        <p className={`${LABEL} top-[459.76px]`} style={LABEL_ST}>Contraseña</p>
        <div className={`${INPUT_BOX} left-[241px] top-[489.76px]`} style={INPUT_ST}>
          <span className="absolute left-[18px]" style={{ color: "rgba(247,241,229,0.45)" }}><KeyIcon /></span>
          <input
            type="password" autoComplete="current-password" aria-label="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••••••"
            className={INPUT_TXT}
          />
        </div>

        {/* Ingresar (100:516) */}
        <button type="button" onClick={submit} className="ix-press ix-pulse-green absolute left-[241px] top-[572px] w-[430px] bg-[#687540] flex gap-[11px] items-center justify-center px-[28px] py-[18px] rounded-[999px]">
          <span className="font-semibold leading-[normal] not-italic text-cream-93 text-[16px] text-center whitespace-nowrap">Ingresar</span>
          <span className="text-cream-93"><ArrowIcon /></span>
        </button>

        {/* Divisor "¿Aún no tienes acceso?" (99:430) */}
        <div className="absolute left-[241px] top-[644.66px] h-[49.7px] w-[430px]">
          <span className="absolute left-0 top-[24.1px] h-px w-[125.5px]" style={{ backgroundColor: "rgba(247,241,229,0.18)" }} />
          <p className="absolute left-[139.5px] top-[14.6px] font-normal leading-[19.84px] not-italic text-[12.8px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.4)" }}>¿Aún no tienes acceso?</p>
          <span className="absolute left-[304.5px] top-[24.1px] h-px w-[125.5px]" style={{ backgroundColor: "rgba(247,241,229,0.18)" }} />
        </div>

        {/* Solicitar acceso (100:533) */}
        <a href="/solicitud-acceso" className="ix-press absolute left-[241px] top-[702px] w-[430px] border border-solid flex items-center justify-center p-[16px] rounded-[999px]" style={{ borderColor: "rgba(247,241,229,0.18)" }}>
          <span className="font-medium leading-[23.56px] not-italic text-cream-93 text-[15.2px] text-center whitespace-nowrap">Solicitar acceso a Zequara</span>
        </a>

        {/* Nota al pie (99:440) */}
        <div className="absolute left-[241px] top-[776.16px] w-[430px] flex flex-col gap-[2px] items-center pt-[13.1px]">
          <div className="flex gap-[6px] items-center" style={{ color: "rgba(247,241,229,0.5)" }}>
            <LockIcon />
            <p className="font-light leading-[20.99px] not-italic text-[13.1px] text-center whitespace-nowrap">Acceso cerrado y verificado.</p>
          </div>
          <p className="font-light leading-[20.99px] not-italic text-[13.1px] text-center whitespace-nowrap" style={{ color: "rgba(247,241,229,0.5)" }}>Solo inversionistas aprobados pueden ver las oportunidades.</p>
        </div>
      </div>
    </div>
  );
}
