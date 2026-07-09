import ScaledCanvas from "@/components/ScaledCanvas";
import LoginScreen from "@/components/sections/login/LoginScreen";

/** LOGIN — frame de Figma 1920 × 1045, escalado al ancho del viewport. */
export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#2a1e14]">
      <ScaledCanvas width={1920} height={1045}>
        <LoginScreen />
      </ScaledCanvas>
    </main>
  );
}
