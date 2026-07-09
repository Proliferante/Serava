import { TypeIcon, TYPE_LABEL, type CardType } from "./icons";

export type CardData = {
  type: CardType;
  imageLabel: string; // second line of the placeholder label
  category: string;
  title: [string, string];
  desc: string[];
  meta: string;
};

const IMAGE_PREFIX: Record<CardType, string> = {
  article: "Imagen artículo —",
  video: "Miniatura video —",
  noticia: "Imagen noticia —",
};

/** Content card (Component 4). */
export default function HubCard({ data }: { data: CardData }) {
  const { type, imageLabel, category, title, desc, meta } = data;
  return (
    <div className="group ix-lift bg-cream-93 border border-[rgba(165,122,78,0.28)] border-solid flex flex-col overflow-clip rounded-[20px] w-full">
      {/* Image placeholder */}
      <div className="relative w-full aspect-[331.33/207.08]" style={{ backgroundImage: "linear-gradient(155deg, #5b4332 0%, #3d2c1e 100%)" }}>
        <div className="ix-zoom absolute inset-0 flex flex-col gap-[8.195px] items-center justify-center p-[16px]">
          {type === "video" ? (
            <TypeIcon type="video" size={44} style={{ color: "rgba(247,241,229,0.7)" }} />
          ) : (
            <TypeIcon type={type} size={28} style={{ color: "rgba(247,241,229,0.6)" }} />
          )}
          <div className="[word-break:break-word] flex flex-col items-center font-semibold leading-[0] not-italic text-[9.6px] text-center tracking-[1.152px] uppercase whitespace-nowrap" style={{ color: "rgba(247,241,229,0.6)" }}>
            <p className="leading-[14.4px] mb-0">{IMAGE_PREFIX[type]}</p>
            <p className="leading-[14.4px]">{imageLabel}</p>
          </div>
        </div>
        {/* Type badge */}
        <div className="absolute bg-[rgba(201,168,119,0.22)] flex items-center gap-[7px] h-[28.36px] left-[14px] rounded-[999px] top-[14px] px-[12px]">
          <TypeIcon type={type} size={13} className="text-tan-63" />
          <p className="[word-break:break-word] font-semibold leading-[16.37px] not-italic text-tan-63 text-[10.6px] tracking-[1.69px] uppercase">{TYPE_LABEL[type]}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col grow px-[24px] pt-[24px] pb-[24px]">
        <p className="[word-break:break-word] font-semibold leading-[17.86px] not-italic text-[#a57a4e] text-[11.5px] tracking-[1.613px] uppercase">{category}</p>
        <div className="[word-break:break-word] font-semibold leading-[0] not-italic text-[#2a1e14] text-[17.9px] pt-[13px]">
          <p className="leading-[23.3px] mb-0">{title[0]}</p>
          <p className="leading-[23.3px]">{title[1]}</p>
        </div>
        <div className="[word-break:break-word] font-light leading-[0] not-italic text-[#5b4332] text-[14.4px] pt-[13px]">
          {desc.map((line, i) => (
            <p key={i} className="leading-[22.32px] mb-0">{line}</p>
          ))}
        </div>
        <p className="[word-break:break-word] font-light leading-[19.34px] not-italic text-[#5b4332] text-[12.5px] mt-auto pt-[16px]">{meta}</p>
      </div>
    </div>
  );
}
