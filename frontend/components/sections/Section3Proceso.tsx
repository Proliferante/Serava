import CompararButton from "@/components/CompararButton";
import Section3Timeline from "@/components/motion/Section3Timeline";

const A = "/figma";

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

      {/* Timeline — line fills + dots light up tied to scroll */}
      <Section3Timeline />

      {/* Step 01 */}
      <p className="[word-break:break-word] absolute font-semibold leading-[1.32] left-[1291px] not-italic text-cream text-[20px] top-[241px] w-[369px]">PASO 01</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1291px] not-italic text-cream text-[35px] top-[264px] w-[353px]">Adquieres</p>
      <p className="[word-break:break-word] absolute font-light leading-[1.137] left-[1291px] not-italic text-[23px] text-white top-[327px] w-[469px]">
        Compras un mueble ya analizado y filtrado. La propiedad es tuya desde el primer día.
      </p>

      {/* Step 02 */}
      <p className="[word-break:break-word] absolute font-semibold leading-[1.32] left-[1291px] not-italic text-cream text-[20px] top-[497px] w-[369px]">PASO 02</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1291px] not-italic text-cream text-[35px] top-[517px] w-[352px]">Lo remodelamos</p>
      <p className="[word-break:break-word] absolute font-light leading-[1.137] left-[1291px] not-italic text-[23px] text-white top-[577px] w-[469px]">
        Intervenimos el inmueble para que valga más. Si la obra se pasa del presupuesto, lo asumimos nosotros.
      </p>

      {/* Step 03 */}
      <p className="[word-break:break-word] absolute font-semibold leading-[1.32] left-[1291px] not-italic text-cream text-[20px] top-[778px] w-[369px]">PASO 03</p>
      <p className="[word-break:break-word] absolute font-medium leading-[normal] left-[1289px] not-italic text-cream text-[35px] top-[801px] w-[373px]">Genera retorno</p>
      <p className="[word-break:break-word] absolute font-light leading-[1.137] left-[1291px] not-italic text-[23px] text-white top-[861px] w-[487px]">
        El inmueble renta cada mes sin que tengas que administrarlo. Cuando decidas vender, te acompañamos.
      </p>

      {/* CTA — abre la ventana emergente comparativa */}
      <CompararButton />
    </div>
  );
}
