import { WORDMARK } from "@/components/brand";
import { PreferenciasCookies } from "@/components/cookies/AvisoCookies";
import { CTA_PORTAFOLIO_CORTO, DISCLAIMER } from "@/components/copy";
const A = "/figma";

/** Footer (1922 × 364) */
export default function Footer() {
  return (
    <div className="bg-brown-dark overflow-clip relative rounded-tr-[150px] size-full" data-name="Footer">
      {/* Wordmark grande → inicio, con el ancho y el centro vertical anteriores. */}
      <a href="/" aria-label="Zequara — Inicio" className="ix-nav absolute h-[80.69px] left-[416px] top-[59.66px] w-[493.5px]">
        <img loading="lazy" decoding="async" alt="Zequara" className="absolute block inset-0 max-w-none size-full" src={WORDMARK} />
      </a>

      {/* Tagline */}
      <div className="[word-break:break-word] absolute font-normal leading-[0] left-[427px] not-italic text-[26px] text-white top-[182px] w-[560px] whitespace-pre-wrap">
        <p className="font-extrabold leading-[1.66] mb-0">Tú sumas un inmueble a tu patrimonio. </p>
        <p className="font-normal italic leading-[1.66] text-[#c1986c]">Nosotros hacemos el resto.</p>
      </div>

      {/* Aviso: la frontera entre informar y recomendar (OBS-61). */}
      <p className="absolute font-light leading-[1.5] left-[427px] top-[296px] w-[620px] text-[14px] text-[rgba(226,205,174,0.55)]">
        {DISCLAIMER}
      </p>

      {/* Navega column */}
      <p className="[word-break:break-word] absolute font-extralight leading-[1.137] left-[1125px] not-italic text-[#cd9a64] text-[26px] top-[78px] tracking-[9.36px] whitespace-nowrap">NAVEGA</p>
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[1125px] not-italic text-[20px] text-white top-[147px] w-[312px]">
        <p className="leading-[2.27] mb-0"><a href="/" className="hover:underline">Inicio</a></p>
        <p className="leading-[2.27] mb-0"><a href="/como-operamos" className="hover:underline">¿Cómo operamos?</a></p>
        <p className="leading-[2.27] mb-0"><a href="/proyectos" className="hover:underline">Proyectos realizados</a></p>
        <p className="leading-[2.27]"><a href="/hub" className="hover:underline">HUB</a></p>
      </div>

      {/* Legal, bajo CUENTA: es la única columna con hueco debajo (NAVEGA
          llega hasta abajo con sus cuatro enlaces). Un filete corto en el cobre de
          los antetítulos lo separa de los dos enlaces de cuenta, y el icono
          de documento dice qué es sin tener que subirle el tamaño. La
          política de datos va en la línea de abajo. */}
      <span aria-hidden className="absolute h-px left-[1460px] top-[256px] w-[36px] bg-[#cd9a64] opacity-60" />
      <p className="absolute leading-[1.5] left-[1460px] top-[272px] whitespace-nowrap">
        <a href="/terminos" className="group inline-flex items-center gap-[10px] font-light text-[16px] text-[rgba(226,205,174,0.82)] transition-colors hover:text-cream">
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#cd9a64" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </svg>
          <span className="underline decoration-[rgba(205,154,100,0.45)] decoration-1 underline-offset-[5px] group-hover:decoration-cream">Términos y condiciones</span>
        </a>
      </p>
      <p className="absolute leading-[1.5] left-[1460px] top-[306px] whitespace-nowrap">
        <a href="/privacidad" className="group inline-flex items-center gap-[10px] font-light text-[16px] text-[rgba(226,205,174,0.82)] transition-colors hover:text-cream">
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#cd9a64" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6l7-3z" />
            <path d="M9.5 12l2 2 3.5-4" />
          </svg>
          <span className="underline decoration-[rgba(205,154,100,0.45)] decoration-1 underline-offset-[5px] group-hover:decoration-cream">Política de datos</span>
        </a>
      </p>
      {/* Sólo existe con la analítica activa (ver lib/cookies). */}
      <p className="absolute leading-[1.5] left-[1672px] top-[306px] whitespace-nowrap">
        <PreferenciasCookies className="font-light text-[16px] text-[rgba(226,205,174,0.82)] underline decoration-[rgba(205,154,100,0.45)] decoration-1 underline-offset-[5px] transition-colors hover:text-cream hover:decoration-cream" />
      </p>

      {/* Cuenta column */}
      <p className="[word-break:break-word] absolute font-extralight leading-[1.137] left-[1460px] not-italic text-[#cd9a64] text-[26px] top-[78px] tracking-[9.36px] whitespace-nowrap">CUENTA</p>
      <div className="[word-break:break-word] absolute font-light leading-[0] left-[1459px] not-italic text-[20px] text-white top-[147px] whitespace-nowrap">
        <p className="leading-[2.27] mb-0"><a href="/login" className="hover:underline">Iniciar sesión</a></p>
        <p className="leading-[2.27]"><a href="/solicitud-acceso" className="hover:underline">{CTA_PORTAFOLIO_CORTO}</a></p>
      </div>
    </div>
  );
}
