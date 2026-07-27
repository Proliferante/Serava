import CompararButton from "@/components/CompararButton";
import Section3Timeline from "@/components/motion/Section3Timeline";

const A = "/figma";

/**
 * Un paso del timeline. Solo el tope del bloque es absoluto: label/título/cuerpo
 * fluyen, así el bloque se adapta si el título ocupa una o dos líneas.
 */
function Paso({ top, label, title, body }: { top: number; label: string; title: string; body: string }) {
  return (
    <div className="absolute left-[1291px] w-[520px]" style={{ top }}>
      <p className="[word-break:break-word] font-semibold leading-[1.32] not-italic text-cream text-[20px]">{label}</p>
      <p className="[word-break:break-word] mt-[6px] font-medium leading-[1.15] not-italic text-cream text-[30px]">{title}</p>
      <p className="[word-break:break-word] mt-[16px] font-light leading-[1.25] not-italic text-[21px] text-white">{body}</p>
    </div>
  );
}

/** Seccion 3 — De principio a fin (1920 × 1345) */
export default function Section3Proceso() {
  return (
    <div className="bg-brown-dark overflow-clip relative rounded-tr-[150px] size-full" data-name="Seccion 3">
      {/* Background image */}
      <div className="absolute h-[1320px] left-[-258px] top-[35px] w-[1552px]">
        <img loading="lazy" decoding="async" alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={`${A}/c711c71d04448a3a0e845fd9b958b2015dfbf6aa.webp`} />
      </div>

      {/* Headings */}
      <p className="[word-break:break-word] absolute font-normal leading-[normal] left-[413px] not-italic text-cream text-[25px] top-[78px] w-[791px]">Así funciona tu inversión</p>
      <p className="[word-break:break-word] absolute font-black leading-[normal] left-[413px] not-italic text-[60px] text-white top-[108px] w-[753px]">De principio a fin</p>
      <p className="[word-break:break-word] absolute font-light leading-[1.35] left-[413px] not-italic text-cream text-[25px] top-[196px] w-[700px]">
        Tú eliges la oportunidad. Serava se encarga de convertirla en una propiedad de mayor valor.
      </p>

      {/* Timeline — line fills + dots light up tied to scroll */}
      <Section3Timeline />

      <Paso
        top={241}
        label="PASO 01"
        title="Accedes a oportunidades con potencial real"
        body="Serava busca y filtra propiedades con fundamentos arquitectónicos, financieros y legales para aumentar su valor mediante remodelación."
      />
      <Paso
        top={511}
        label="PASO 02"
        title="Aumentas el valor de tu propiedad"
        body="La experiencia arquitectónica de Serava optimiza la remodelación para aumentar el valor del inmueble sin invertir de más y con el presupuesto controlado."
      />
      <Paso
        top={781}
        label="PASO 03"
        title="Generas retorno sin operarla"
        body="Serava administra la renta y te acompaña en la venta, para que la propiedad produzca sin convertirse en otra operación para ti."
      />

      {/* CTA — abre la ventana emergente comparativa */}
      <CompararButton />
    </div>
  );
}
