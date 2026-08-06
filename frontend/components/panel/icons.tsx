/* ═══════════════════════════════════════════════════════════════════════════
   Iconos del panel — trazo de 1.7 px sobre una rejilla de 24, dibujados a mano
   porque en Figma llegan como instancias (`Component 1`) y el design context
   no se puede leer en este archivo.

   `Ico` normaliza tamaño y color: el trazo hereda `currentColor`, así que el
   color se define en el contenedor y los estados de hover no tienen que tocar
   el SVG.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { SVGProps } from "react";

export type IconName =
  | "home" | "progress" | "budget" | "approvals" | "audit"
  | "photos" | "value" | "docs" | "manager"
  | "bell" | "calendar" | "clock" | "pin" | "arrow" | "download"
  | "check" | "alert" | "chevronL" | "chevronR" | "message" | "phone"
  | "plus" | "help" | "image" | "user" | "dot" | "key";

/** Trazos por icono, en el viewBox 0 0 24 24. */
const P: Record<IconName, React.ReactNode> = {
  home: <><path d="M3.5 10.2 12 3.5l8.5 6.7V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" /><path d="M9.2 21v-6.6h5.6V21" /></>,
  progress: <><path d="M3.5 6.5h17" /><path d="M3.5 12h11" /><path d="M3.5 17.5h6.5" /></>,
  budget: <><circle cx="12" cy="12" r="8.6" /><path d="M12 7.4v9.2" /><path d="M14.4 9.6c0-1.1-1.1-1.8-2.4-1.8s-2.4.7-2.4 1.8c0 2.9 4.8 1.5 4.8 4.6 0 1.2-1.1 1.9-2.4 1.9s-2.4-.7-2.4-1.9" /></>,
  approvals: <><circle cx="12" cy="12" r="8.6" /><path d="M8.4 12.3l2.5 2.5 4.7-5.3" /></>,
  audit: <><path d="M8 4.6H6.4a1.4 1.4 0 0 0-1.4 1.4V19a1.4 1.4 0 0 0 1.4 1.4h11.2A1.4 1.4 0 0 0 19 19V6a1.4 1.4 0 0 0-1.4-1.4H16" /><rect x="8" y="2.9" width="8" height="3.6" rx="1.1" /><path d="M8.8 13.1l2.2 2.2 4.2-4.7" /></>,
  photos: <><rect x="3.2" y="4.8" width="17.6" height="14.4" rx="2" /><circle cx="8.6" cy="10.1" r="1.7" /><path d="M3.6 17.4l4.6-4.3a1.6 1.6 0 0 1 2.2 0l3.4 3.2" /><path d="M13.2 14.4l2.3-2.2a1.6 1.6 0 0 1 2.2 0l2.8 2.7" /></>,
  value: <><path d="M3.5 20.5h17" /><path d="M4.4 15.6l4.4-4.9 3.6 3 4-5.4 3.2 3.6" /></>,
  docs: <><path d="M14 3.2H7.2a1.6 1.6 0 0 0-1.6 1.6v14.4a1.6 1.6 0 0 0 1.6 1.6h9.6a1.6 1.6 0 0 0 1.6-1.6V7.7z" /><path d="M14 3.2v4.5h4.4" /></>,
  manager: <><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20.6c0-3.6 3.2-5.8 7.2-5.8s7.2 2.2 7.2 5.8" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.8 20.6c0-3.6 3.2-5.8 7.2-5.8s7.2 2.2 7.2 5.8" /></>,
  bell: <><path d="M18.2 9.4a6.2 6.2 0 1 0-12.4 0c0 5-2 6.5-2 6.5h16.4s-2-1.5-2-6.5" /><path d="M13.9 19.4a2.1 2.1 0 0 1-3.8 0" /></>,
  calendar: <><rect x="3.6" y="5.4" width="16.8" height="15" rx="2" /><path d="M3.6 10.4h16.8" /><path d="M8.4 3.4v3.4M15.6 3.4v3.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.6" /><path d="M12 7.6V12l3.2 2" /></>,
  pin: <><path d="M19 10.4c0 5.3-7 10.5-7 10.5s-7-5.2-7-10.5a7 7 0 0 1 14 0z" /><circle cx="12" cy="10.2" r="2.5" /></>,
  arrow: <><path d="M4.5 12h15" /><path d="M13.6 6.2 19.5 12l-5.9 5.8" /></>,
  download: <><path d="M12 3.6v11.5" /><path d="M7.4 10.9 12 15.4l4.6-4.5" /><path d="M4.4 19.8h15.2" /></>,
  check: <><path d="M5.6 12.6l4 4 8.8-9.6" /></>,
  alert: <><circle cx="12" cy="12" r="8.6" /><path d="M12 7.8v5" /><path d="M12 16.1h.01" /></>,
  chevronL: <><path d="M14.4 6.4 8.8 12l5.6 5.6" /></>,
  chevronR: <><path d="M9.6 6.4 15.2 12l-5.6 5.6" /></>,
  message: <><path d="M20.4 11.4a7.4 7.4 0 0 1-8 7.4L6 20.8l1.4-4a7.4 7.4 0 1 1 13-5.4z" /></>,
  phone: <><path d="M20.4 16.9v2.5a1.6 1.6 0 0 1-1.8 1.6 16.4 16.4 0 0 1-7.1-2.5 16 16 0 0 1-4.9-4.9A16.4 16.4 0 0 1 4.1 6.4 1.6 1.6 0 0 1 5.7 4.6h2.5a1.6 1.6 0 0 1 1.6 1.4c.1.9.3 1.7.6 2.5a1.6 1.6 0 0 1-.4 1.7l-1 1a13 13 0 0 0 4.4 4.4l1-1a1.6 1.6 0 0 1 1.7-.4c.8.3 1.6.5 2.5.6a1.6 1.6 0 0 1 1.4 1.6z" /></>,
  plus: <><path d="M12 5.4v13.2M5.4 12h13.2" /></>,
  help: <><circle cx="12" cy="12" r="8.6" /><path d="M9.7 9.4a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1 1-1.1 1.8v.3" /><path d="M12 17.2h.01" /></>,
  image: <><rect x="3.2" y="4.8" width="17.6" height="14.4" rx="2" /><circle cx="8.6" cy="10.1" r="1.7" /><path d="M3.6 17.4l4.6-4.3a1.6 1.6 0 0 1 2.2 0l5.6 5.3" /></>,
  dot: <circle cx="12" cy="12" r="4.6" fill="currentColor" stroke="none" />,
  key: <><circle cx="8.4" cy="8.4" r="4.4" /><path d="M11.6 11.6 20 20" /><path d="M17 17l-2.2 2.2" /></>,
};

/**
 * Icono de línea del panel. El grosor de trazo se escala con el tamaño para
 * que un icono de 13 px no se vea más grueso que uno de 34 px.
 */
export function Ico({
  name, size = 18, sw, className, style, ...rest
}: { name: IconName; size?: number; sw?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  // El viewBox mide 24 pase lo que pase, así que para que el trazo se vea igual
  // de fino a 13 px y a 34 px hay que compensarlo por el tamaño de render.
  const stroke = sw ?? Math.min(2.6, Math.max(0.9, (1.45 * 24) / size));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      {...rest}
    >
      {P[name]}
    </svg>
  );
}
