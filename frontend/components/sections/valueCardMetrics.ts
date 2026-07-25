/* ── Geometría de las tarjetas de valor (Figma · Home Sección 7) ────────────
   Módulo sin "use client" a propósito: `Section7Remodelamos` es un Server
   Component y necesita estos números para calcular las posiciones. Si se
   exportaran desde `ValueCard.tsx` (que sí es cliente), al cruzar la frontera
   llegarían como referencias de cliente en vez de números y la aritmética
   daría NaN.                                                                */

/** Tarjeta ("Rectangle 20"). */
export const CARD_W = 245.46;
export const CARD_H = 335;
export const CARD_TOP = 990;
export const CARD_RADIUS = 50;

/** Ancho del bloque de texto en Figma. */
export const COL_W = 171.62;
/** Margen lateral que deja el texto centrado exacto: 36.92 + 171.62 + 36.92 = 245.46. */
export const COL_X = (CARD_W - COL_W) / 2;

/**
 * Banda del título: alto de dos líneas (2 × 26.4). Los títulos de una línea se
 * centran ópticamente en la misma banda que los de dos, así que las cuatro
 * tarjetas comparten eje sin necesidad de un `top` por tarjeta.
 */
export const TITLE_TOP = 72;
export const TITLE_LH = 26.4;
export const TITLE_BAND_H = TITLE_LH * 2;

/** Inicio del cuerpo: mismo valor en las cuatro tarjetas. */
export const BODY_TOP = 147;

/* ── Fila de 4 tarjetas ────────────────────────────────────────────────────
   La separación se uniforma (en Figma variaba entre 26.46 y 26.62) y la fila
   se centra respecto al canvas real de 1920, no respecto a los 1922 de la
   sección: `app/page.tsx` la coloca en left = -2 para que el fondo sangre.   */
export const GAP = 26.5;
const CANVAS_W = 1920;
/** Desplazamiento de la sección respecto al canvas (left = -2 en page.tsx). */
const SECTION_OFFSET = 2;

export const ROW_W = 4 * CARD_W + 3 * GAP;
export const ROW_X = (CANVAS_W - ROW_W) / 2 + SECTION_OFFSET;

/** Posición horizontal de la tarjeta `i` dentro de la sección. */
export const cardX = (i: number) => Math.round((ROW_X + i * (CARD_W + GAP)) * 100) / 100;
