import Cargando from "@/components/Cargando";

/* Lo que se ve mientras llegan del servidor el portafolio o una ficha. Next
   lo pinta solo durante la espera: sin esto, al abrir un predio la pantalla
   se quedaba como estaba hasta que llegaba la página nueva, y parecía que el
   clic no había hecho nada. */
export default function CargandoPredios() {
  return (
    <main style={{ backgroundColor: "#e2cdae" }}>
      <Cargando pantalla texto="Cargando el portafolio…" />
    </main>
  );
}
