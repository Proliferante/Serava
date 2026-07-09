"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

const A = "/figma";
const STAR = `${A}/7e5131393b4625a802d0322737dbeed0316933de.svg`;
const LOGO = `${A}/66b685e62ddc97e18461c8492896704f8b4eff9c.svg`;
const ARROW = `${A}/ae9998c9498fd99f82f96dbf74c3317cbd516587.svg`;

const SECTION_GRADIENT =
  "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 1920 1717.7' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(96 0 0 85.884 960 858.84)'><stop stop-color='rgba(201,168,119,0.16)' offset='0'/><stop stop-color='rgba(101,84,60,0.08)' offset='0.275'/><stop stop-color='rgba(0,0,0,0)' offset='0.55'/></radialGradient></defs></svg>\")";

/** Star bullet + text (right "Con Serava" column). */
function StarLine({ top, width, text, color }: { top: string; width: string; text: string; color: string }) {
  return (
    <div className="absolute h-[22.328px] left-[22px] w-[449px]" style={{ top }}>
      <div className="absolute left-0 size-[15px] top-[3px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={STAR} />
      </div>
      <p className="[word-break:break-word] absolute font-semibold leading-[22px] left-[24px] not-italic text-[14px] top-0" style={{ width, color }}>{text}</p>
    </div>
  );
}

/** Exact reproduction of the Figma frame "CON SERAVA/SIN SERAVA" (1920 × 1717.672). */
function ModalContent() {
  return (
    <div className="bg-cream overflow-clip relative rounded-[40px] size-full" data-name="CON SERAVA/SIN SERAVA">
      <div className="absolute h-[1717.672px] left-0 top-0 w-[1920px]" style={{ backgroundImage: SECTION_GRADIENT }}>
        <div className="absolute h-[1457.672px] left-[370px] top-[130px] w-[1180px]">
          {/* Header */}
          <div className="[word-break:break-word] absolute h-[319.125px] left-0 not-italic top-[13px] w-[820px]">
            <p className="absolute font-semibold h-[17px] leading-[17px] left-0 text-[#a57a4e] text-[11px] top-[7.58px] w-[285.953px]">El ciclo de tu inversión</p>
            <p className="absolute font-semibold leading-[0] left-0 text-[48px] text-black top-[40.42px] w-[809.406px]">
              <span className="font-light leading-[54px] text-[#3d2c1e]">En una inversión, cada etapa cuesta tiempo. Y el tiempo es </span>
              <span className="leading-[54px] text-[#2a1e14]">renta y es riesgo. </span>
              <span className="leading-[54px] text-[#5f6b3e]">Nosotros lo asumimos. </span>
            </p>
            <p className="absolute font-medium leading-[0] left-0 text-[18px] text-black top-[263px] w-[659px]">
              <span className="font-light leading-[28px] text-[#5b4332]">Invertir directo es posible. Pero cada mes que tardas en encontrar, remodelar o arrendar es </span>
              <span className="leading-[28px] text-[#3d2c1e]">renta que no entra y capital detenido. </span>
              <span className="leading-[28px] text-[#5b4332]">Serava elimina ese tiempo — y lo que ese tiempo te cuesta. </span>
            </p>
          </div>

          {/* Table */}
          <div className="absolute bg-[rgba(255,255,255,0)] border border-[rgba(165,122,78,0.28)] border-solid h-[918.391px] left-0 overflow-clip rounded-[20px] shadow-[36px_38px_60.3px_-40px_#130d05] top-[383.13px] w-[1180px]">
            {/* Header row */}
            <div className="absolute bg-[rgba(165,122,78,0.28)] h-[49.359px] left-0 top-0 w-[1178px]">
              <div className="absolute bg-[#3d2c1e] h-[49.359px] left-0 top-0 w-[190px]">
                <p className="[word-break:break-word] absolute font-bold h-[17px] leading-[17px] left-[22px] not-italic text-[#c9a877] text-[11px] top-[15.5px] w-[46.969px]">Etapa</p>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[49.359px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-bold h-[17px] leading-[17px] left-[22px] not-italic text-[#b5542f] text-[11px] top-[15.5px] w-[119.297px]">Por tu cuenta</p>
              </div>
              <div className="absolute bg-[#7f8b57] h-[49.359px] left-[685px] top-0 w-[493px]">
                <div className="absolute h-[27px] left-[51px] top-[10.88px] w-[134px]">
                  <img alt="serava" className="absolute block inset-0 max-w-none size-full" src={LOGO} />
                </div>
              </div>
            </div>

            {/* Row 01 */}
            <div className="absolute bg-[#7f8b57] h-[125.953px] left-0 top-[49.36px] w-[1178px]">
              <div className="[word-break:break-word] absolute bg-[#efe6d5] h-[125.953px] left-0 not-italic top-0 w-[190px]">
                <p className="absolute font-bold h-[19px] leading-[19px] left-[22px] text-[#a57a4e] text-[12px] top-[22px] w-[146px]">01</p>
                <p className="absolute font-semibold h-[20px] leading-[20px] left-[22px] text-[#2a1e14] text-[16px] top-[44.34px] w-[146px]">Elegir la zona</p>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[125.953px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light leading-[22px] left-[22px] not-italic text-[#5b4332] text-[14px] top-[23px] w-[433px]">Semanas investigando mercados para, aun así, decidir sin certeza.</p>
              </div>
              <div className="absolute bg-[rgba(127,139,87,0.07)] h-[125.953px] left-[685px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light h-[44px] leading-[0] left-[22px] not-italic text-[14px] text-white top-[21.52px] w-[362px] whitespace-pre-wrap">
                  <span className="leading-[22px]">Entras a zonas validadas por nuestros datos y el :  </span>
                  <span className="font-bold leading-[22px]">Serava Score </span>
                  <span className="leading-[22px]">demanda alta, oferta limitada.</span>
                </p>
                <StarLine top="81.63px" width="300px" text="Meses de investigación que te ahorras." color="#e2cdae" />
              </div>
            </div>

            {/* Row 02 */}
            <div className="absolute bg-[#7f8b57] h-[125.953px] left-0 top-[175.31px] w-[1178px]">
              <div className="[word-break:break-word] absolute bg-[#efe6d5] h-[125.953px] left-0 not-italic top-0 w-[190px]">
                <p className="absolute font-bold h-[19px] leading-[19px] left-[22px] text-[#a57a4e] text-[12px] top-[22px] w-[146px]">02</p>
                <p className="absolute font-semibold leading-[20px] left-[22px] text-[#2a1e14] text-[16px] top-[44.34px] w-[146px]">Encontrar el predio</p>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[125.953px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light leading-[22px] left-[22px] not-italic text-[#5b4332] text-[14px] top-[23px] w-[385px]">Meses de búsqueda, con riesgo de pagar de más o comprar el activo equivocado.</p>
              </div>
              <div className="absolute bg-[rgba(127,139,87,0.07)] h-[125.953px] left-[685px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light h-[22px] leading-[0] left-[22px] not-italic text-[14px] text-white top-[21.56px] w-[440px]">
                  <span className="leading-[22px]">Accedes a predios ya </span>
                  <span className="font-bold leading-[22px]">curados por arquitectos expertos </span>
                  <span className="leading-[22px]">, sustentados uno a uno.</span>
                </p>
                <StarLine top="81.63px" width="259px" text="La selección, hecha y sustentada." color="#e2cdae" />
              </div>
            </div>

            {/* Row 03 — highlighted */}
            <div className="absolute bg-[#7f8b57] h-[237.266px] left-0 top-[301.27px] w-[1178px]">
              <div className="absolute bg-[#7f8b57] h-[237.266px] left-0 top-0 w-[190px]">
                <p className="[word-break:break-word] absolute font-bold h-[19px] leading-[19px] left-[22px] not-italic text-[#f7f1e5] text-[12px] top-[22px] w-[146px]">03</p>
                <p className="[word-break:break-word] absolute font-semibold h-[20px] leading-[20px] left-[22px] not-italic text-[#f7f1e5] text-[16px] top-[44.34px] w-[146px]">Remodelar</p>
                <div className="absolute bg-[rgba(247,241,229,0.22)] h-[82px] left-[22px] rounded-[6px] top-[78.61px] w-[146px]">
                  <p className="[word-break:break-word] absolute font-bold leading-[24px] left-[9px] not-italic text-[#f7f1e5] text-[20px] top-[5px] w-[92.484px]">El núcleo del modelo</p>
                </div>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[237.266px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light leading-[22px] left-[22px] not-italic text-[#5b4332] text-[14px] top-[23px] w-[430px]">Meses coordinando obra, con sobrecostos y retrasos que salen de tu bolsillo.</p>
              </div>
              <div className="absolute bg-[rgba(127,139,87,0.14)] h-[237.266px] left-[685px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light h-[72px] leading-[0] left-[22px] not-italic text-[14px] text-white top-[16.61px] w-[395px] whitespace-pre-wrap">
                  <span className="leading-[22px]">Sistema de gestión de obra con  </span>
                  <span className="font-bold leading-[22px]">diseño e interventoría independientes </span>
                  <span className="leading-[22px]">de quien ejecuta —control real, no juez y parte— y materiales de alta calidad. </span>
                  <span className="font-bold leading-[22px]">Sin sobrecostos.</span>
                </p>
                <div className="absolute bg-[#3d2c1e] h-[27.344px] left-[22px] rounded-[7px] top-[102.44px] w-[235px]">
                  <p className="[word-break:break-word] absolute font-bold h-[19px] leading-[19px] left-[11px] not-italic text-[#c9a877] text-[12px] top-[4px] w-[213px]">95% cumplimiento de tiempos</p>
                </div>
                <StarLine top="143.78px" width="371px" text="Cada mes de obra que no se pierde es renta que empieza antes." color="#e2cdae" />
                <p className="[word-break:break-word] absolute font-light h-[18px] leading-[18px] left-[22px] not-italic text-[#5b4332] text-[12px] top-[196.44px] w-[449px]">Salvo imprevistos ajenos a Serava.</p>
              </div>
            </div>

            {/* Row 04 */}
            <div className="absolute bg-[#7f8b57] h-[125.953px] left-0 top-[538.53px] w-[1178px]">
              <div className="[word-break:break-word] absolute bg-[#efe6d5] h-[125.953px] left-0 not-italic top-0 w-[190px]">
                <p className="absolute font-bold h-[19px] leading-[19px] left-[22px] text-[#a57a4e] text-[12px] top-[22px] w-[146px]">04</p>
                <p className="absolute font-semibold h-[20px] leading-[20px] left-[22px] text-[#2a1e14] text-[16px] top-[44.34px] w-[146px]">Arrendar</p>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[125.953px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light leading-[22px] left-[22px] not-italic text-[#5b4332] text-[14px] top-[23px] w-[445px]">Buscas inquilino y gestionas el contrato. Cada mes vacío es renta que no entra.</p>
              </div>
              <div className="absolute bg-[rgba(127,139,87,0.07)] h-[125.953px] left-[685px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-bold h-[22px] leading-[0] left-[22px] not-italic text-[14px] text-white top-[22px] w-[435px]">
                  <span className="leading-[22px]">Colocamos al arrendatario y administramos el arriendo </span>
                  <span className="font-normal leading-[22px]">de principio a fin.</span>
                </p>
                <StarLine top="81.63px" width="298px" text="El activo empieza a rentar, sin demora." color="#5f6b3e" />
              </div>
            </div>

            {/* Row 05 */}
            <div className="absolute bg-[#7f8b57] h-[125.953px] left-0 top-[664.48px] w-[1178px]">
              <div className="[word-break:break-word] absolute bg-[#efe6d5] h-[125.953px] left-0 not-italic top-0 w-[190px]">
                <p className="absolute font-bold h-[19px] leading-[19px] left-[22px] text-[#a57a4e] text-[12px] top-[22px] w-[146px]">05</p>
                <p className="absolute font-semibold h-[20px] leading-[20px] left-[22px] text-[#2a1e14] text-[16px] top-[44.34px] w-[146px]">Administrar</p>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[125.953px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light leading-[22px] left-[22px] not-italic text-[#5b4332] text-[14px] top-[23px] w-[378px]">Tu tiempo se va en mantenimiento, reparaciones y propiedad horizontal. Sin fecha de fin.</p>
              </div>
              <div className="absolute bg-[rgba(127,139,87,0.07)] h-[125.953px] left-[685px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-bold leading-[0] left-[22px] not-italic text-[14px] text-white top-[-0.61px] w-[417px]">
                  <span className="font-normal leading-[22px]">Sostenemos el activo: </span>
                  <span className="leading-[22px]">mantenimiento, reparaciones y propiedad horizontal</span>
                </p>
                <p className="[word-break:break-word] absolute font-light h-[22px] leading-[22px] left-[186px] not-italic text-[#3d2c1e] text-[14px] top-[44.81px] w-[3px]">.</p>
                <StarLine top="81.63px" width="324px" text="Tu atención queda libre. Indefinidamente." color="#5f6b3e" />
              </div>
            </div>

            {/* Row 06 */}
            <div className="absolute bg-[#7f8b57] h-[125.953px] left-0 top-[790.44px] w-[1178px]">
              <div className="[word-break:break-word] absolute bg-[#efe6d5] h-[125.953px] left-0 not-italic top-0 w-[190px]">
                <p className="absolute font-bold h-[19px] leading-[19px] left-[22px] text-[#a57a4e] text-[12px] top-[22px] w-[146px]">06</p>
                <p className="absolute font-semibold leading-[20px] left-[22px] text-[#2a1e14] text-[16px] top-[44.34px] w-[146px]">Seguir la inversión</p>
              </div>
              <div className="absolute bg-[#f7f1e5] h-[125.953px] left-[191px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-light leading-[22px] left-[22px] not-italic text-[#5b4332] text-[14px] top-[23px] w-[441px]">Armas tu propio control para no perder de vista el activo, la renta y el valor.</p>
              </div>
              <div className="absolute bg-[rgba(127,139,87,0.07)] h-[125.953px] left-[685px] top-0 w-[493px]">
                <p className="[word-break:break-word] absolute font-bold h-[16px] leading-[0] left-[22px] not-italic text-[14px] text-white top-[22.44px] w-[401px]">
                  <span className="leading-[22px]">Apruebas y sigues cada etapa </span>
                  <span className="font-normal leading-[22px]">—datos, obra y zona— sin ejecutar nada.</span>
                </p>
                <StarLine top="81.63px" width="199px" text="Control total, en minutos." color="#5f6b3e" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute h-[104.156px] left-0 top-[1353.52px] w-[1180px]">
            <p className="[word-break:break-word] absolute font-normal leading-[0] left-0 not-italic text-[22px] text-black top-px w-[300px]">
              <span className="font-light leading-[34px] text-[#3d2c1e]">Tú sumas un inmueble a tu patrimonio. </span>
              <span className="leading-[34px] text-[#5f6b3e]">Nosotros hacemos el resto. </span>
            </p>
            <a
              href="/solicitud-acceso"
              className="absolute bg-[#7f8b57] h-[58.797px] left-[841px] rounded-[999px] top-[22.67px] w-[339px] cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-95 block"
              style={{ filter: "drop-shadow(0px 16px 16px rgba(47,55,30,0.6))" }}
            >
              <p className="[word-break:break-word] absolute font-semibold h-[24px] leading-[24px] left-[32px] not-italic text-cream-93 text-[16px] top-[16.5px] w-[246px] text-left">Conoce el proceso de acceso</p>
              <div className="absolute left-[289px] size-[18px] top-[20.39px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={ARROW} />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Popup overlay: scales the 1920-wide design to the viewport WIDTH (never
 *  upscaling past native) so the content stays large and readable, and lets
 *  the dialog scroll vertically when it's taller than the viewport. */
export default function ComparativaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const W = 1920;
  const H = 1717.672;
  const [scale, setScale] = useState(0.5);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const update = () => setScale(Math.min((window.innerWidth - 48) / W, 1));
    update();
    window.addEventListener("resize", update);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="Comparativa: por tu cuenta vs. con Serava"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop — fixed to the viewport so it always covers while scrolling */}
          <div className="fixed inset-0 bg-black/60" aria-hidden />

          {/* Scroll layout: horizontally centered, top-aligned so a tall modal scrolls */}
          <div className="relative flex min-h-full justify-center items-start p-6" onClick={onClose}>
            <motion.div
              className="relative shrink-0 overflow-hidden rounded-[40px] shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
              style={{ width: W * scale, height: H * scale }}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Native-size design scaled from the top-left; the wrapper above is
                  sized to the scaled dimensions so the scroll area is correct. */}
              <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
                {/* Close button (scales with the design) */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="ix-press absolute right-[40px] top-[40px] z-10 flex size-[52px] items-center justify-center rounded-full bg-[#3d2c1e] text-cream-93 text-[28px] leading-none hover:bg-black transition-colors"
                >
                  ×
                </button>
                <ModalContent />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
