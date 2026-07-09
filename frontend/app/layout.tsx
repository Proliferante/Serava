import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import PageTransition from "@/components/PageTransition";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Serava — Inversión inmobiliaria gestionada de principio a fin",
  description:
    "Serava encuentra el activo, lo remodela sin sobrecostos y lo administra. Tú sumas un inmueble a tu patrimonio, rentando y valorizándose.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-sans antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
