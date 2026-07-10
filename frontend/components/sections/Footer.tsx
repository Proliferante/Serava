import DiagnosticoTrigger from "@/components/DiagnosticoTrigger";

const A = "/figma";

/** Footer (1922 × 364) */
export default function Footer() {
  return (
    <div className="bg-brown-dark overflow-clip relative rounded-tr-[150px] size-full" data-name="Footer">
      {/* .serava. logo → inicio */}
      <a href="/" aria-label="Serava — Inicio" className="ix-nav absolute h-[86px] left-[416px] top-[57px] w-[493.5px]">
        <img loading="lazy" decoding="async" alt=".serava." className="absolute block inset-0 max-w-none size-full" src={`${A}/c9b9033affcd9b5dd0842d0881ff26a7b0031971.svg`} />
      </a>

      {/* Tagline */}
      <div className="[word-break:break-word] absolute font-normal leading-[0] left-[427px] not-italic text-[26px] text-white top-[182px] w-[405px] whitespace-pre-wrap">
        <p className="font-extrabold leading-[1.66] mb-0">Tú sumas un inmueble a tu patrimonio. </p>
        <p className="font-normal italic leading-[1.66] text-[#c1986c]">Nosotros hacemos el resto.</p>
      </div>

      {/* Navega column */}
      <p className="[word-break:break-word] absolute font-extralight leading-[1.137] left-[1125px] not-italic text-[#cd9a64] text-[26px] top-[78px] tracking-[9.36px] whitespace-nowrap">NAVEGA</p>
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[1125px] not-italic text-[20px] text-white top-[147px] w-[312px]">
        <p className="leading-[2.27] mb-0"><a href="/modelo" className="hover:underline">Modelo</a></p>
        <p className="leading-[2.27] mb-0"><a href="/hub" className="hover:underline">Hub</a></p>
        <p className="leading-[2.27]"><DiagnosticoTrigger className="hover:underline">Diagnostico patrimonial</DiagnosticoTrigger></p>
      </div>

      {/* Cuenta column */}
      <p className="[word-break:break-word] absolute font-extralight leading-[1.137] left-[1460px] not-italic text-[#cd9a64] text-[26px] top-[78px] tracking-[9.36px] whitespace-nowrap">CUENTA</p>
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[1459px] not-italic text-[20px] text-white top-[147px] whitespace-nowrap">
        <p className="leading-[2.27] mb-0"><a href="/login" className="hover:underline">Iniciar sesión</a></p>
        <p className="leading-[2.27]"><a href="/solicitud-acceso" className="hover:underline">Registrarme</a></p>
      </div>
    </div>
  );
}
