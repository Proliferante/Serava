function CtrlCard({ left, top, h, title, body }: { left: number; top: number; h: number; title: string; body: React.ReactNode }) {
  return (
    <>
      <div className="absolute bg-cream-93 rounded-[20px] w-[515px]" style={{ left, top, height: h }} />
      <p className="[word-break:break-word] absolute font-semibold leading-[26.4px] not-italic text-brown-dark text-[24px] tracking-[-0.6px] w-[360px]" style={{ left: left + 65, top: top + 35.75 }}>{title}</p>
      <p className="[word-break:break-word] absolute font-light leading-[22.82px] not-italic text-brown-dark text-[15px] w-[360px]" style={{ left: left + 65, top: top + 81.6 }}>{body}</p>
    </>
  );
}

/** PAGINA MODELO · Seccion 4 — Tu patrimonio, tu control (1920 × 966) */
export default function ModeloSection4Control() {
  return (
    <div className="bg-brown-dark overflow-clip relative rounded-bl-[150px] size-full" data-name="Seccion 4">
      {/* Eyebrow */}
      <div className="absolute bg-[#a57a4e] h-px left-[436px] opacity-80 top-[243px] w-[36px]" />
      <p className="[word-break:break-word] absolute font-semibold leading-[17.86px] left-[484px] not-italic text-tan-63 text-[11.5px] top-[234px] tracking-[3.456px] uppercase w-[251.11px]">Tu patrimonio, tu control</p>

      {/* Heading */}
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[436px] not-italic text-[#e2cdae] text-[0px] top-[277px] tracking-[-1.28px] w-[760px]">
        <p className="mb-0 text-[51.2px]">
          <span className="font-light leading-[56.32px] text-[#e2cdae]">Tu patrimonio crece. </span>
          <span className="font-semibold leading-[56.32px] text-[#e2cdae]">El mando</span>
        </p>
        <p className="font-semibold leading-[56.32px] text-[#e2cdae] text-[51.2px]">sigue siendo tuyo.</p>
      </div>

      {/* Body */}
      <p className="[word-break:break-word] absolute font-light leading-[28.52px] left-[436px] not-italic text-[#e2cdae] text-[18.4px] top-[409px] whitespace-nowrap">
        Amplías tu patrimonio en finca raíz sin operar nada. Pero cada<br />
        decisión pasa por ti: el trabajo es nuestro, la última palabra es<br />
        tuya.
      </p>

      {/* Cards 2×2 */}
      <CtrlCard left={436} top={504} h={145} title="A tu nombre" body="El activo se incorpora directo a tu patrimonio." />
      <CtrlCard left={969} top={504} h={145} title="Capital propio" body="Serava origina y remodela con capital propio." />
      <CtrlCard left={436} top={688} h={146} title="Costo garantizado" body="El presupuesto se cierra antes de empezar. El sobrecosto no estructural lo asume Serava." />
      <CtrlCard left={969} top={688} h={145.58} title="Acceso y decisión" body="Apruebas cada hito del proceso. Tu al mando, sin ejecutar." />
    </div>
  );
}
