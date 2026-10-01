"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { AUTORIZACION, EnlacePolitica } from "@/components/legal/consentimiento";

/** PAGINA HUB · Newsletter (1048 × 243) — funcional */
export default function HubNewsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [autoriza, setAutoriza] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Sin endpoint todavía. El POST, cuando exista, lleva
    // `consentimiento: evidencia("boletin")` (ver `legal/consentimiento`).
    setSent(true);
    setEmail("");
    setAutoriza(false);
    window.setTimeout(() => setSent(false), 3500);
  };

  return (
    <div className="bg-[#687540] flex gap-[30px] items-center justify-center pb-[56px] pt-[55.415px] px-[56px] relative rounded-[24px] size-full" data-name="Newsletter">
      <div className="flex flex-col gap-[8.895px] items-start relative shrink-0 w-[459.38px]">
        <div className="[word-break:break-word] font-light leading-[0] not-italic text-cream-93 text-[32px] tracking-[-0.64px] w-full">
          <p className="leading-[35.84px] mb-0">Recibe nuestro criterio cada</p>
          <p className="leading-[35.84px]">mes.</p>
        </div>
        <div className="[word-break:break-word] font-light leading-[0] not-italic text-[16px] whitespace-nowrap" style={{ color: "rgba(247,241,229,0.85)" }}>
          <p className="leading-[24.8px] mb-0">Análisis de mercado, casos reales y aprendizajes del</p>
          <p className="leading-[24.8px]">método Zequara. Sin ruido.</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-[12px] relative shrink-0 w-[446.63px]">
        <div className="flex gap-[10px] items-start">
        <div className="bg-[rgba(247,241,229,0.1)] border border-[rgba(247,241,229,0.4)] border-solid flex flex-col justify-center min-w-[230px] grow overflow-clip px-[23px] py-[16px] rounded-[999px] self-stretch">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu correo"
            className="w-full bg-transparent border-0 outline-none font-normal text-[13.3px] text-cream-93 placeholder:text-[rgba(247,241,229,0.65)]"
          />
        </div>
        <button
          type="submit"
          className="ix-press bg-cream-93 flex flex-col items-center justify-center pb-[17px] pt-[16px] px-[26px] rounded-[999px] shrink-0"
        >
          <span className="font-semibold leading-[normal] not-italic text-[#2a1e14] text-[13.3px] text-center whitespace-nowrap">
            {sent ? "¡Listo!" : "Suscribirme"}
          </span>
        </button>
        </div>
        {/* Autorización aparte para lo comercial: sin marcar y obligatoria. */}
        <label className="flex cursor-pointer items-start gap-[9px] px-[6px]">
          <input
            type="checkbox" name="autorizacion_datos" required checked={autoriza} onChange={(e) => setAutoriza(e.target.checked)}
            className="mt-[2px] size-[16px] shrink-0" style={{ accentColor: "#f7f1e5" }}
          />
          <span className="font-light text-[12px] leading-[1.45]" style={{ color: "rgba(247,241,229,0.85)" }}>
            {AUTORIZACION.boletin} <EnlacePolitica className="text-cream-93" />. Puedes darte de baja cuando quieras.
          </span>
        </label>
      </form>

      <AnimatePresence>
        {sent && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-[16px] right-[56px] font-light text-[13px] text-cream-93"
          >
            Te avisaremos cada mes. Sin ruido.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
