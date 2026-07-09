import type { CSSProperties } from "react";

type IconProps = { size?: number; className?: string; style?: CSSProperties };

/** Document / article icon. */
export function DocIcon({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

/** Play / video icon. */
export function PlayIcon({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Newspaper / noticia icon. */
export function NewsIcon({ size = 20, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <path d="M4 5h13v14H5a1 1 0 0 1-1-1z" />
      <path d="M17 8h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1" />
      <path d="M7 8h7M7 12h7M7 16h4" />
    </svg>
  );
}

/** Arrow → icon. */
export function ArrowIcon({ size = 18, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export type CardType = "article" | "video" | "noticia";

export function TypeIcon({ type, size, className, style }: IconProps & { type: CardType }) {
  if (type === "video") return <PlayIcon size={size} className={className} style={style} />;
  if (type === "noticia") return <NewsIcon size={size} className={className} style={style} />;
  return <DocIcon size={size} className={className} style={style} />;
}

export const TYPE_LABEL: Record<CardType, string> = {
  article: "Artículo",
  video: "Video",
  noticia: "Noticia",
};
