import ScaledCanvas from "@/components/ScaledCanvas";
import AddValue from "@/components/predios/AddValue";

/** ANÁLISIS ADD VALUE — reproducción exacta del frame de Figma (1920 × 2805). */
export default function AddValuePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#efe6d5" }}>
      <ScaledCanvas width={1920} height={2805}>
        <AddValue />
      </ScaledCanvas>
    </main>
  );
}
