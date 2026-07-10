const A = "/figma";

/** PAGINA MODELO · Seccion 2 — Christian Mejía (1920 × 1135) */
export default function ModeloSection2Christian() {
  return (
    <div className="bg-cream overflow-clip relative rounded-tr-[150px] size-full" data-name="Seccion 2">
      {/* Left text column */}
      <div className="absolute flex flex-col gap-[15px] items-start left-[340px] pt-[7.58px] right-[1107.8px] top-[233px]">
        {/* Eyebrow */}
        <div className="h-[17.84px] relative shrink-0 w-[298.69px]">
          <div className="-translate-y-1/2 absolute bg-[#a57a4e] h-px left-0 opacity-80 top-1/2 w-[36px]" />
          <p className="[word-break:break-word] absolute font-semibold leading-[17.86px] left-[48px] not-italic text-[#a57a4e] text-[11.5px] top-[calc(50%-0.92px)] -translate-y-1/2 tracking-[3.456px] uppercase w-[248.103px]">De dónde viene el criterio</p>
        </div>
        {/* Name */}
        <div className="flex flex-col items-start pt-[18px] relative shrink-0 w-full">
          <p className="[word-break:break-word] font-light leading-[56.32px] not-italic text-[#3d2c1e] text-[55px] tracking-[-1.28px] w-full">Christian Mejía</p>
        </div>
        {/* Role */}
        <p className="[word-break:break-word] font-medium leading-[23.56px] not-italic text-[#5f6b3e] text-[15.2px] tracking-[1.824px] uppercase w-full">Dirección de diseño</p>
        {/* Body */}
        <div className="flex flex-col items-start max-w-[529.45px] pb-[25.99px] pt-[22.01px] relative shrink-0 w-full">
          <p className="[word-break:break-word] font-light leading-[27.78px] not-italic text-[#5b4332] text-[20px] whitespace-nowrap">
            Veinte años en proyectos de alta exigencia técnica:<br />
            plantas industriales, laboratorios, reconversiones. De<br />
            esa experiencia nace el criterio que gobierna cada<br />
            remodelación Serava, donde una inversión<br />
            inmobiliaria se hace bien.
          </p>
        </div>
        {/* Blockquote */}
        <div className="border-[#7f8b57] border-l-[3px] border-solid flex flex-col items-start max-w-[378.38px] pl-[27px] relative shrink-0 w-[378.38px]">
          <p className="[word-break:break-word] font-light italic leading-[34.56px] text-[#3d2c1e] text-[25.6px] whitespace-nowrap">
            Esa experiencia respalda tu<br />
            inversión. Y hoy la sostiene<br />
            un equipo.
          </p>
        </div>
      </div>

      {/* Right image cards */}
      <div className="absolute h-[648px] left-[899px] rounded-[50px] overflow-clip shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[147px] w-[367px]">
        <img loading="lazy" decoding="async" alt="Christian Mejía" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src={`${A}/b198b86126bf89fe31acbd329c43b0c3be2ad9d8.webp`} />
      </div>
      <div className="absolute h-[342px] left-[1295px] rounded-[50px] overflow-clip shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[147px] w-[298px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src={`${A}/ae09f9b0135a2fc49c8959c70cc2f2943a689759.webp`} />
      </div>
      <div className="absolute h-[294px] left-[1295px] rounded-[50px] overflow-clip shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[501px] w-[298px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 size-full max-w-none object-cover pointer-events-none" src={`${A}/241d626f43991fe806f109bff5e5c9db45c204a8.webp`} />
      </div>
    </div>
  );
}
