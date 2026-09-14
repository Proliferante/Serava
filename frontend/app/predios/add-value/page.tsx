import { redirect } from "next/navigation";

/**
 * El análisis Add Value dejó de ser una página suelta: el rediseño de la ficha
 * se lo llevó a su pestaña de Finanzas. La ruta se queda viva y redirige para
 * no romper los enlaces que ya andan por ahí.
 */
export default function AddValuePage() {
  redirect("/predios/ficha/finanzas");
}
