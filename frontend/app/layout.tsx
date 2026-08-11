import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import PageTransition from "@/components/PageTransition";
import BotonVistaMovil from "@/components/responsive/BotonVistaMovil";
import { GUION_VISTA } from "@/components/responsive/vista";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zequara — Inversión inmobiliaria gestionada de principio a fin",
  description:
    "Zequara encuentra el activo, lo remodela sin sobrecostos y lo administra. Tú sumas un inmueble a tu patrimonio, rentando y valorizándose.",
};

/**
 * Se declara explícito en vez de dejar el de Next por dos motivos: fijar el
 * color de la barra del navegador al marrón de la marca, y dejar el zoom
 * abierto —nada de `maximumScale`—, que en un sitio con tanto texto pequeño
 * es la diferencia entre poder leerlo o no.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#492100",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <head>
        {/* Fija `data-vista` antes del primer pintado. Puesto en un efecto, la
            primera imagen salía en móvil y saltaba a escritorio a la vista de
            quien hubiera aceptado esa opción en el panel. */}
        <script dangerouslySetInnerHTML={{ __html: GUION_VISTA }} />
      </head>
      <body className="font-sans antialiased">
        <PageTransition>{children}</PageTransition>
        <BotonVistaMovil />
      </body>
    </html>
  );
}
