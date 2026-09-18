import { DISCLAIMER } from "@/components/copy";

/**
 * Envoltura de las tres pestañas de la ficha (y de sus versiones por slug).
 *
 * Existe sólo para el aviso de OBS-61: la ficha es donde se miran las cifras
 * —TIR, proyección, escenarios— y es justo ahí donde hay que decir que esto
 * es información, no una recomendación de compra. Va por fuera del lienzo,
 * en flujo normal, para no tocar los altos fijos de los tres frames ni
 * repetirlo en seis archivos de página.
 */
export default function FichaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div style={{ background: "#e2cdae" }}>
        <p
          className="mx-auto max-w-[1100px] px-[24px] py-[26px] text-center text-[13px] font-light leading-[1.6]"
          style={{ color: "rgba(91,67,50,0.8)" }}
        >
          {DISCLAIMER}
        </p>
      </div>
    </>
  );
}
