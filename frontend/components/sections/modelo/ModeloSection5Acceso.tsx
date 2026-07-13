const A = "/figma";

/** PAGINA MODELO · Seccion 5 — Nosotros operamos, tú decides (1920 × 1260) */
export default function ModeloSection5Acceso() {
  return (
    <div className="relative size-full" data-name="Seccion 5">
      {/* Background image */}
      <div className="absolute h-[1222px] left-[-104px] top-[-67px] w-[2170px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src={`${A}/00138f95093b0a47991feb180cf7939379993bde.webp`} />
      </div>
      {/* Overlay */}
      <div className="absolute bg-[rgba(73,33,0,0.4)] h-[1324px] left-0 top-[-23px] w-[1920px]" />
      {/* Glow ellipse */}
      <div className="absolute h-[809px] left-[516px] top-[143px] w-[888px]">
        <img loading="lazy" decoding="async" alt="" className="absolute block inset-0 max-w-none size-full" src={`${A}/f2ff362124986a869e4b8107e69abc9bdac912e6.svg`} />
      </div>

      {/* Centered content container */}
      <div className="absolute left-[550px] top-[304px] h-[488.8px] w-[820px]">
        {/* Eyebrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[7px] flex items-center gap-[12px] whitespace-nowrap">
          <span className="bg-tan-63 h-px opacity-80 w-[36px] inline-block" />
          <span className="font-semibold leading-[17.86px] not-italic text-tan-63 text-[11.5px] tracking-[3.456px] uppercase">El acceso es selectivo</span>
        </div>

        {/* Heading */}
        <div className="[word-break:break-word] absolute left-1/2 -translate-x-1/2 top-[51.42px] flex flex-col font-semibold justify-center leading-[0] not-italic text-[60px] text-cream-93 text-center tracking-[-1.52px] whitespace-nowrap w-[628px]">
          <p className="leading-[66.88px] mb-0">Nosotros operamos.</p>
          <p className="leading-[66.88px]">Tú decides.</p>
        </div>

        {/* Paragraph */}
        <div className="[word-break:break-word] absolute left-1/2 -translate-x-1/2 top-[213.17px] leading-[0] not-italic text-[0px] text-center whitespace-nowrap w-[628px]">
          <p className="mb-0 text-[20px]"><span className="font-light leading-[31px] text-[rgba(247,241,229,0.84)]">Veinte años de criterio operando para tu patrimonio, un</span></p>
          <p className="mb-0 text-[20px]">
            <span className="font-light leading-[31px] text-[rgba(247,241,229,0.84)]">equipo que lo sostiene, y el mando en cada paso. </span>
            <span className="font-medium leading-[31px] text-[#f7f1e5]">Esa es la</span>
          </p>
          <p className="mb-0 text-[20px]">
            <span className="font-medium leading-[31px] text-[#f7f1e5]">tranquilidad de invertir con Serava.</span>
            <span className="font-light leading-[31px] text-[rgba(247,241,229,0.84)]"> Si encaja, déjanos tus</span>
          </p>
          <p className="font-light leading-[31px] text-[20px] text-[rgba(247,241,229,0.84)]">datos.</p>
        </div>

        {/* CTA button */}
        <a href="/solicitud-acceso" className="ix-invert absolute bg-cream flex h-[57px] items-center justify-center left-[263px] overflow-clip px-[42px] py-[20px] rounded-[98px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)] top-[353px] w-[277px]">
          <p className="[word-break:break-word] font-semibold leading-[1.36] not-italic text-brown-dark text-[20px] text-center">Solicita el acceso</p>
        </a>

        {/* Sub-note */}
        <p className="[word-break:break-word] absolute left-1/2 -translate-x-1/2 top-[463.97px] font-light leading-[20.83px] not-italic text-[13.4px] text-center tracking-[0.269px] whitespace-nowrap" style={{ color: "rgba(255,255,255,0.6)" }}>El acceso a Serava es selectivo. Cada solicitud se evalúa.</p>
      </div>
    </div>
  );
}
