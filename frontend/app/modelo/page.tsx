import ScaledCanvas from "@/components/ScaledCanvas";
import ComoOperamosScreen from "@/components/sections/modelo/ComoOperamosScreen";
import Footer from "@/components/sections/Footer";

const CANVAS_W = 1920;
const COMO_H = 9500; // 12 secciones (hero → cierre)
const CANVAS_H = 9717; // altura exacta del frame de Figma (incluye footer)

/**
 * PAGINA MODELO — "Cómo operamos" (Figma 1920 × 9717): 12 secciones + footer.
 * La sección Antes/Después se conserva en AntesDespuesSection.tsx (fuera de esta
 * página) — pendiente de reubicar según indique el usuario.
 */
export default function ModeloPage() {
  return (
    <main className="bg-cream">
      <ScaledCanvas width={CANVAS_W} height={CANVAS_H}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: COMO_H }}>
          <ComoOperamosScreen />
        </div>
        <div style={{ position: "absolute", left: 0, top: 9353, width: 1922, height: 364 }}>
          <Footer />
        </div>
      </ScaledCanvas>
    </main>
  );
}
