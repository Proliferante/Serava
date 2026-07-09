"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const A = "/figma";

function MailIcon() {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M4 7l8 6 8-6" />
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

/** LOGIN — reproducción exacta del frame de Figma (1920 × 1045) */
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  // Prototype flow: entering the access link takes you into the logged-in area.
  const submit = () => {
    if (!email.trim()) return;
    setSent(true);
    window.setTimeout(() => router.push("/predios"), 650);
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
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${A}/1d104ea194ca7ae5b0f84b1328433a3a584b589f.png`} />
          </div>
        </div>

        {/* Logo → inicio */}
        <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute h-[29.8px] left-[32px] top-[38.43px] w-[175.28px]">
          <img alt="Serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
        </a>

        {/* Bottom text */}
        <div className="absolute left-[44px] top-[724px] w-[920px]">
          <div className="[word-break:break-word] font-light leading-[0] not-italic text-cream-93 text-[38.4px] tracking-[-0.768px]">
            <p className="leading-[43px] mb-0">El acceso a Serava</p>
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
        {/* Centered form container (430 wide) */}
        <div className="absolute left-[241px] top-[calc(50%+0.5px)] -translate-y-1/2 h-[620.52px] w-[430px]">
          {/* Eyebrow */}
          <div className="absolute left-0 top-[7.58px] flex items-center gap-[12px]">
            <span className="bg-tan-63 h-px opacity-80 w-[32px] inline-block" />
            <span className="font-semibold leading-[17.86px] not-italic text-tan-63 text-[11.5px] tracking-[3.456px] uppercase">Acceso inversionistas</span>
          </div>

          {/* Heading */}
          <div className="[word-break:break-word] absolute left-0 top-[51.42px] font-semibold leading-[0] not-italic text-cream-93 text-[43.2px] tracking-[-0.864px]">
            <p className="leading-[48.38px] mb-0">Bienvenido de</p>
            <p className="leading-[48.38px]">vuelta.</p>
          </div>

          {/* Subtext */}
          <div className="[word-break:break-word] absolute left-0 top-[161.32px] font-light leading-[0] not-italic text-[16px]" style={{ color: "rgba(247,241,229,0.72)" }}>
            <p className="leading-[24.8px] mb-0">Ingresa el correo con el que fuiste aprobado. Te</p>
            <p className="leading-[24.8px]">enviaremos un enlace de acceso seguro.</p>
          </div>

          {/* Form */}
          {/* Label */}
          <p className="[word-break:break-word] absolute left-0 top-[247.02px] font-medium leading-[20.34px] not-italic text-[13.1px] tracking-[0.525px]" style={{ color: "rgba(247,241,229,0.85)" }}>Correo electrónico</p>
          {/* Input */}
          <div className="absolute left-0 top-[277.02px] h-[60px] w-[430px] rounded-[13px] border border-solid overflow-clip flex items-center" style={{ backgroundColor: "rgba(247,241,229,0.06)", borderColor: "rgba(247,241,229,0.18)" }}>
            <span className="absolute left-[18px]" style={{ color: "rgba(247,241,229,0.45)" }}><MailIcon /></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="nombre@correo.com"
              className="w-full bg-transparent border-0 outline-none pl-[51px] pr-[19px] font-normal text-[16px] text-cream-93 placeholder:text-[rgba(247,241,229,0.45)]"
            />
          </div>
          {/* Submit */}
          <button type="button" onClick={submit} className="ix-press ix-pulse-green absolute left-0 top-[359.26px] w-[430px] bg-[#687540] flex gap-[11px] items-center justify-center px-[28px] py-[18px] rounded-[999px]">
            <span className="font-semibold leading-[normal] not-italic text-cream-93 text-[16px] text-center whitespace-nowrap">{sent ? "Enlace enviado ✓" : "Enviar enlace de acceso"}</span>
            {!sent && <span className="text-cream-93"><ArrowIcon /></span>}
          </button>

          {/* Divider "¿Aún no tienes acceso?" */}
          <div className="absolute left-0 top-[431.92px] h-[49.7px] w-[430px]">
            <span className="absolute left-0 top-[24.1px] h-px w-[125.5px]" style={{ backgroundColor: "rgba(247,241,229,0.18)" }} />
            <p className="absolute left-[139.5px] top-[14.6px] font-normal leading-[19.84px] not-italic text-[12.8px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.4)" }}>¿Aún no tienes acceso?</p>
            <span className="absolute left-[304.5px] top-[24.1px] h-px w-[125.5px]" style={{ backgroundColor: "rgba(247,241,229,0.18)" }} />
          </div>

          {/* Solicitar acceso (outline) */}
          <a href="/solicitud-acceso" className="ix-press absolute left-0 top-[489.26px] w-[430px] border border-solid flex items-center justify-center p-[16px] rounded-[999px]" style={{ borderColor: "rgba(247,241,229,0.18)" }}>
            <span className="font-medium leading-[23.56px] not-italic text-cream-93 text-[15.2px] text-center whitespace-nowrap">Solicitar acceso a Serava</span>
          </a>

          {/* Bottom note */}
          <div className="absolute left-0 top-[563.42px] w-[430px] flex flex-col gap-[2px] items-center pt-[13.1px]">
            <div className="flex gap-[6px] items-center" style={{ color: "rgba(247,241,229,0.5)" }}>
              <LockIcon />
              <p className="font-light leading-[20.99px] not-italic text-[13.1px] text-center whitespace-nowrap">Acceso cerrado y verificado.</p>
            </div>
            <p className="font-light leading-[20.99px] not-italic text-[13.1px] text-center whitespace-nowrap" style={{ color: "rgba(247,241,229,0.5)" }}>Solo inversionistas aprobados pueden ver las oportunidades.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
