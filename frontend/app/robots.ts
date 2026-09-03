import type { MetadataRoute } from "next";

/**
 * robots.txt
 *
 * La web pública sí se indexa; lo que no, es nada que esté detrás de un
 * acceso: la consola interna del equipo y el área privada del inversionista.
 * No es seguridad —cualquiera puede ignorar este archivo, y lo que de verdad
 * protege es el login y el 401 del backend—, pero una URL de panel en un
 * índice público sólo sirve para que alguien pase por ahí a probar.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/panel", "/cuenta", "/hub", "/login", "/solicitud-acceso"],
      },
    ],
  };
}
