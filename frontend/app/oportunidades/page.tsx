import ScaledCanvas from "@/components/ScaledCanvas";
import OportunidadesScreen from "@/components/sections/oportunidades/OportunidadesScreen";
import Footer from "@/components/sections/Footer";

const CANVAS_W = 1920;
const CANVAS_H = 5701; // altura exacta del frame de Figma (incluye footer)
const SCREEN_H = 5550; // hero → acceso (antes del footer)

/**
 * PÁGINA OPORTUNIDADES — Figma 1920 × 5701: Hero, comparador antes/después,
 * ficha de oportunidad, experiencia del inversionista, acceso + footer.
 */
export default function OportunidadesPage() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: SCREEN_H }}>
          <OportunidadesScreen />
        </div>
        <div style={{ position: "absolute", left: -2, top: 5337, width: 1922, height: 364 }}>
          <Footer />
        </div>
      </ScaledCanvas>
    </main>
  );
}
