import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import "@/styles/globals.css";
import PageTransition from "@/components/PageTransition";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

/**
 * La serif sólo aparece en los números de paso de la ficha de predio ("01" a
 * "04"), así que entra con un único grosor para no cargar de más.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-cormorant",
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
    <html lang="es" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
