import CompararButton from "@/components/CompararButton";
import Section3Timeline from "@/components/motion/Section3Timeline";

const A = "/figma";

/**
 * Un paso del timeline. Solo el tope del bloque es absoluto: label/título/cuerpo
 * fluyen, así el bloque se adapta si el título ocupa una o dos líneas.
 */
function Paso({ top, label, title, body }: { top: number; label: string; title: string; body: string }) {
  return (
    <div className="absolute left-[1291px] w-[580px]" style={{ top }}>
      <p className="[word-break:break-word] font-semibold leading-[1.32] not-italic text-cream text-[20px]">{label}</p>
      <p className="[word-break:break-word] mt-[6px] font-medium leading-[1.15] not-italic text-cream text-[28px]">{title}</p>
      <p className="[word-break:break-word] mt-[14px] font-light leading-[1.25] not-italic text-[19px] text-white">{body}</p>
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
        Tú eliges la oportunidad. Zequara se encarga de convertirla en una propiedad de mayor valor.
      </p>

      {/* Timeline — line fills + dots light up tied to scroll */}
      <Section3Timeline />

      <Paso
        top={200}
        label="PASO 01"
        title="Accedes a inmuebles previamente evaluados"
        body="Cada inmueble publicado ha sido revisado arquitectónica y financieramente y cuenta con un modelo de inversión."
      />
      {/* El paso que faltaba, y el que más importa: aquí es donde se dice que
          la propiedad queda a nombre de quien invierte. */}
      <Paso
        top={400}
        label="PASO 02"
        title="Compras con un rango definido"
        body="Definimos el precio de compra según el modelo de inversión y negociamos bajo ese criterio. El inmueble queda a tu nombre."
      />
      <Paso
        top={600}
        label="PASO 03"
        title="Transformas con una inversión planificada"
        body="Diseñamos, presupuestamos y ejecutamos la remodelación de acuerdo con el alcance definido para el inmueble."
      />
      <Paso
        top={800}
        label="PASO 04"
        title="Gestionamos el plan de valorización"
        body="Después de la transformación, te acompañamos en la renta o venta del inmueble según la estrategia definida."
      />

      {/* CTA — abre la ventana emergente comparativa */}
      <CompararButton />
    </div>
  );
}
