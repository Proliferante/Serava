"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const A = "/figma";

const PAISES = ["Colombia", "México", "Estados Unidos", "España", "Costa Rica", "Panamá", "Otro"];
const CAPITALES = ["Menos de $500M", "$500M – $1.000M", "$1.000M – $3.000M", "Más de $3.000M"];
const OBJETIVOS = ["Renta mensual", "Valorización", "Renta + valorización", "Diversificar patrimonio"];
const MERCADOS = ["Bogotá", "Medellín", "Barranquilla", "Panamá", "Internacional"];
const RIESGOS = ["Conservador", "Moderado", "Agresivo"];
const HORIZONTES = ["1 – 3 años", "3 – 5 años", "5+ años"];

function Chevron() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2a1e14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="flex gap-[12px] h-[19px] items-center w-full">
      <p className="font-semibold leading-[18.35px] not-italic text-[#a57a4e] text-[11.8px] tracking-[2.368px] uppercase whitespace-nowrap">{title}</p>
      <span className="grow h-px min-w-px" style={{ backgroundColor: "rgba(165,122,78,0.28)" }} />
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-medium leading-[20.34px] not-italic text-[#3d2c1e] text-[13.1px] w-full">{children}</p>;
}

function TextField({ label, placeholder, type = "text", value, onChange }: { label: string; placeholder: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-[8px] items-start w-full">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#efe6d5] border border-solid border-[rgba(165,122,78,0.28)] rounded-[12px] px-[17px] py-[15px] font-normal text-[15.7px] text-[#2a1e14] placeholder:text-[#757575] outline-none transition-shadow focus:border-[#a57a4e] focus:shadow-[0_0_0_3px_rgba(165,122,78,0.18)]"
      />
    </div>
  );
}

function SelectField({ label, placeholder, options, value, onChange }: { label: string; placeholder: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-[8px] items-start w-full">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-[#efe6d5] border border-solid border-[rgba(165,122,78,0.28)] rounded-[12px] pl-[17px] pr-[45px] py-[15px] font-normal text-[15.7px] outline-none cursor-pointer transition-shadow focus:border-[#a57a4e] focus:shadow-[0_0_0_3px_rgba(165,122,78,0.18)] ${value ? "text-[#2a1e14]" : "text-[#757575]"}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o} className="text-[#2a1e14]">{o}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-[17px] top-1/2 -translate-y-1/2"><Chevron /></span>
      </div>
    </div>
  );
}

function Choice({ text, active, onClick }: { text: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`grow min-w-[110px] border border-solid rounded-[12px] pt-[14.5px] pb-[14.83px] px-[11px] flex items-center justify-center cursor-pointer transition-colors ${
        active ? "bg-[#687540] border-[#7f8b57]" : "bg-[#efe6d5] border-[rgba(165,122,78,0.28)] hover:border-[#a57a4e]"
      }`}
    >
      <span className={`leading-[22.32px] not-italic text-[14.4px] text-center whitespace-nowrap transition-colors ${active ? "font-semibold text-cream-93" : "font-medium text-[#5b4332]"}`}>{text}</span>
    </motion.button>
  );
}

/** SOLICITUD ACCESO — reproducción exacta del frame de Figma (1920 × 1466.53), funcional */
export default function SolicitudAccesoScreen() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pais, setPais] = useState("");
  const [capital, setCapital] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [mercado, setMercado] = useState("");
  const [riesgo, setRiesgo] = useState("Conservador");
  const [horizonte, setHorizonte] = useState("1 – 3 años");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div
      className="relative size-full overflow-hidden"
      style={{ backgroundImage: "linear-gradient(0deg, #e2cdae 10.878%, #492100 61.951%)" }}
      data-name="SOLICITUD ACCESO"
    >
      {/* Fondo topográfico (ChatGPT Image / Fondo_Solicitud_Acceso) — node 208:1213 */}
      <img
        aria-hidden
        loading="lazy"
        decoding="async"
        alt=""
        src={`${A}/Fondo_Solicitud_Acceso.png`}
        className="pointer-events-none absolute object-cover"
        style={{ left: "-18.31px", top: "165.54px", width: "1957.834px", height: "1307.345px", opacity: 0.15 }}
      />

      {/* Header */}
      <div className="absolute left-0 top-0 h-[79px] w-full" style={{ background: "#2a1e14" }}>
        <a href="/" className="ix-nav absolute h-[29.8px] left-[50px] top-[25px] w-[175.28px]">
          <img loading="lazy" decoding="async" alt="Serava" className="absolute block inset-0 max-w-none size-full" src={`${A}/1b2273ed06fc7bc3062eb64ec237623cefb6a7f9.svg`} />
        </a>
      </div>

      {/* Title band */}
      <div className="absolute left-0 top-[78.72px] h-[437.41px] w-full" style={{ backgroundImage: "linear-gradient(180.43deg, #2a1e14 1.6%, #462102 98.4%)" }}>
        <div className="absolute left-[510px] top-[80px] w-[900px]">
          <div className="flex items-center gap-[12px]">
            <span className="bg-tan-63 h-px opacity-80 w-[32px] inline-block" />
            <span className="font-semibold leading-[17.86px] not-italic text-tan-63 text-[11.5px] tracking-[3.456px] uppercase">Solicitar acceso</span>
          </div>
          <div className="[word-break:break-word] font-semibold leading-[0] not-italic text-cream-93 text-[50px] tracking-[-1.024px] mt-[28px]">
            <p className="leading-[57.34px] mb-0">Postúlate para invertir</p>
            <p className="leading-[57.34px]">con Serava.</p>
          </div>
          <div className="[word-break:break-word] font-light leading-[0] not-italic text-[17.9px] mt-[24px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.78)" }}>
            <p className="leading-[27.78px] mb-0">El acceso es selectivo: cada solicitud se evalúa. Cuéntanos tu perfil</p>
            <p className="leading-[27.78px] mb-0">para asignarte las oportunidades que mejor se ajustan a tu</p>
            <p className="leading-[27.78px]">patrimonio.</p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={submit}
        className="absolute left-[582px] top-[460.13px] w-[756px] rounded-[24px] border border-solid border-[rgba(165,122,78,0.28)] shadow-[0px_34px_70px_-40px_rgba(42,30,20,0.45)] p-[52px]"
        style={{ background: "#f7f1e5" }}
      >
        <div className="flex flex-col gap-[34px] w-[650px]">
          {/* Tus datos */}
          <section className="flex flex-col gap-[18px]">
            <SectionHead title="Tus datos" />
            <div className="grid grid-cols-2 gap-[18px]">
              <TextField label="Nombre completo" placeholder="Nombre y apellido" value={nombre} onChange={setNombre} />
              <TextField label="Correo electrónico" placeholder="nombre@correo.com" type="email" value={correo} onChange={setCorreo} />
            </div>
            <div className="grid grid-cols-2 gap-[18px]">
              <TextField label="Teléfono / WhatsApp" placeholder="+57 300 000 0000" value={telefono} onChange={setTelefono} />
              <SelectField label="País de residencia" placeholder="Selecciona…" options={PAISES} value={pais} onChange={setPais} />
            </div>
          </section>

          {/* Perfil de inversión */}
          <section className="flex flex-col gap-[18px]">
            <SectionHead title="Tu perfil de inversión" />
            <div className="grid grid-cols-2 gap-[18px]">
              <SelectField label="Capital disponible para invertir" placeholder="Selecciona un rango…" options={CAPITALES} value={capital} onChange={setCapital} />
              <SelectField label="Objetivo principal" placeholder="Selecciona…" options={OBJETIVOS} value={objetivo} onChange={setObjetivo} />
            </div>
            <SelectField label="Mercados de interés" placeholder="¿Dónde te gustaría invertir?" options={MERCADOS} value={mercado} onChange={setMercado} />
          </section>

          {/* Tolerancia al riesgo */}
          <section className="flex flex-col gap-[20px]">
            <SectionHead title="Tolerancia al riesgo" />
            <div className="flex gap-[8px]">
              {RIESGOS.map((r) => (
                <Choice key={r} text={r} active={riesgo === r} onClick={() => setRiesgo(r)} />
              ))}
            </div>
          </section>

          {/* Horizonte de inversión */}
          <section className="flex flex-col gap-[20px]">
            <SectionHead title="Horizonte de inversión" />
            <div className="flex gap-[8px]">
              {HORIZONTES.map((h) => (
                <Choice key={h} text={h} active={horizonte === h} onClick={() => setHorizonte(h)} />
              ))}
            </div>
          </section>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <div className="[word-break:break-word] font-light leading-[0] not-italic text-[12.8px] whitespace-nowrap" style={{ color: "#5b4332" }}>
              <p className="leading-[19.84px] mb-0">Al enviar, aceptas que Serava evalúe tu</p>
              <p className="leading-[19.84px]">solicitud. Te contactaremos por correo.</p>
            </div>
            <button type="submit" className="ix-press ix-pulse-green bg-[#687540] flex gap-[11px] items-center px-[34px] py-[18px] rounded-[999px]">
              <span className="font-semibold leading-[normal] not-italic text-cream-93 text-[16px] text-center whitespace-nowrap">{sent ? "Solicitud enviada ✓" : "Enviar solicitud"}</span>
              {!sent && <span className="text-cream-93"><Arrow /></span>}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {sent && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-[18px] text-center font-medium text-[14px] text-[#5f6b3e]"
            >
              ¡Gracias{nombre ? `, ${nombre.split(" ")[0]}` : ""}! Recibimos tu solicitud y te contactaremos pronto.
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
