/* ═══════════════════════════════════════════════════════════════════════════
   La vista de escritorio en pantalla pequeña: la parte que no es de cliente.

   Vive aparte de `vistaEscritorio.ts` porque el layout —que es un componente
   de servidor— necesita el guion de <head>, y todo lo que se importa de un
   módulo `"use client"` llega al servidor como referencia, no como valor.
   ═══════════════════════════════════════════════════════════════════════════ */

export const CLAVE_VISTA = "zq:vista";

/**
 * Rutas donde la vista de escritorio tiene sentido y está ofrecida: sólo el
 * panel.
 *
 * El aviso aparece únicamente al entrar al panel —diez pantallas de tablas y
 * cronogramas que piden ancho—, así que la preferencia se queda ahí. Antes
 * valía para todo el sitio, y quien la aceptaba se encontraba la portada en
 * versión de escritorio sin haberlo pedido.
 */
export function esPrivada(ruta: string): boolean {
  return ruta.startsWith("/panel");
}

/**
 * Guion que corre en `<head>`, antes del primer pintado.
 *
 * Va como cadena y no como componente porque tiene que ejecutarse síncrono
 * antes de que el navegador pinte: aplicado desde un efecto, el primer
 * fotograma salía con el árbol de móvil y saltaba al de escritorio a la vista.
 */
export const GUION_VISTA = `try{
  var priv=location.pathname.indexOf('/panel')===0;
  var v=priv&&localStorage.getItem('${CLAVE_VISTA}')==='escritorio'?'escritorio':'movil';
  document.documentElement.dataset.vista=v;
}catch(e){document.documentElement.dataset.vista='movil'}`;
