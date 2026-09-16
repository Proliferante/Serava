"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   LOS DATOS DE LA FICHA — de la base a las tres pestañas.

   EL PROBLEMA
   Las tres pestañas de la ficha llevaban su contenido escrito dentro: «Un
   clásico con gran potencial de valor», «96/100», «+$326M». Eso está bien
   mientras el sitio es un prototipo de un predio, y deja de estarlo en cuanto
   hay predios de verdad, cada uno con lo suyo.

   POR QUÉ UN CONTEXTO Y NO PROPS
   El árbol es hondo: página → Oportunidad → HeroFicha → SidebarReserva. Pasar
   ciento veinte valores a mano por cada escalón sería media jornada de
   fontanería y un sitio nuevo donde equivocarse en cada componente que se
   añada.

   EL TRUCO: EL VALOR DE HOY ES EL RESPALDO
   Ninguna llamada de aquí obliga a que el dato exista. `d.t("hero_titulo",
   <>Un clásico…</>)` devuelve lo de la base si lo hay, y si no, exactamente
   lo que la ficha ya decía. Dos consecuencias buenas:

     · `/predios/ficha` sin slug —el prototipo, al que apuntan las tarjetas de
       muestra— sigue viéndose igual que siempre, sin tocar nada.
     · Una ficha real a medio llenar no sale rota: sale con el texto de
       referencia donde todavía no han escrito. Que es mejor que un hueco, y
       mucho mejor que un `undefined` pintado en pantalla.

   LAS CLAVES SON LAS DEL ESQUEMA
   Las mismas de `components/admin/ficha/esquema.ts`. Ese archivo dice qué se
   pregunta; éste, dónde se pinta. Si una clave no coincide, el dato se
   escribe en la consola y no aparece en la ficha — es el único error que este
   diseño permite, y por eso las claves se añaden pero no se renombran.
   ═══════════════════════════════════════════════════════════════════════════ */

export type ValoresFicha = Record<string, unknown>;

export type FichaDatos = {
  /** Lo que se escribió en la consola. Vacío = el prototipo. */
  valores: ValoresFicha;
  /** Ranura de foto → URL en Supabase. */
  fotos: Record<string, string>;
  /** El nombre del predio en la URL. Sin él, se está viendo el prototipo. */
  slug?: string;
};

const VACIO: FichaDatos = { valores: {}, fotos: {} };

const C = createContext<FichaDatos>(VACIO);

export function FichaProvider({ datos, children }: { datos: FichaDatos; children: ReactNode }) {
  return <C.Provider value={datos}>{children}</C.Provider>;
}

function limpio(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export type Lector = {
  /** Texto, o el del prototipo si no hay nada escrito. */
  t: (k: string, respaldo: string) => string;
  /** Igual, pero admite marcado como respaldo (titulares con `<br/>`). */
  nodo: (k: string, respaldo: ReactNode) => ReactNode;
  /** Número, para las cuentas y las barras. */
  n: (k: string, respaldo: number) => number;
  /** Lista de líneas: las viñetas. Se quitan las vacías. */
  lista: (k: string, respaldo: string[]) => string[];
  /** Rejilla de filas: la proyección año a año, el cronograma. */
  tabla: (k: string, respaldo: string[][]) => string[][];
  /** URL de una foto, o la del prototipo. */
  foto: (k: string, respaldo: string) => string;
  /** Si la foto es de Supabase, `next/image` no la puede optimizar sin más. */
  esRemota: (k: string) => boolean;
  /** true cuando se está viendo un predio real y no el prototipo. */
  real: boolean;
  slug?: string;
};

export function useFicha(): Lector {
  const { valores, fotos, slug } = useContext(C);

  return useMemo<Lector>(() => {
    const t = (k: string, respaldo: string) => limpio(valores[k]) ?? respaldo;

    return {
      t,
      nodo: (k, respaldo) => limpio(valores[k]) ?? respaldo,
      n: (k, respaldo) => {
        const s = limpio(valores[k]);
        if (s == null) return respaldo;
        /* Las cifras se escriben como se imprimen —«~12,5%», «$3.450M»— porque
           así es como las revisa quien las escribe. Aquí se saca el número:
           el punto es separador de miles y la coma, decimal. */
        const m = /-?\d+(?:[.,]\d+)?/.exec(s.replace(/\.(?=\d{3}\b)/g, ""));
        if (!m) return respaldo;
        const x = Number(m[0].replace(",", "."));
        return Number.isFinite(x) ? x : respaldo;
      },
      lista: (k, respaldo) => {
        const v = valores[k];
        if (!Array.isArray(v)) return respaldo;
        const lineas = v.map((x) => limpio(x)).filter((x): x is string => x != null);
        return lineas.length ? lineas : respaldo;
      },
      tabla: (k, respaldo) => {
        const v = valores[k];
        if (!Array.isArray(v)) return respaldo;
        /* Una fila cuenta si tiene algo escrito en alguna celda: la rejilla de
           la consola se enseña con filas de más para que se vea el hueco, y
           ésas no tienen que llegar a la ficha. */
        const filas = (v as unknown[][])
          .filter((f) => Array.isArray(f) && f.some((c) => limpio(c) != null))
          .map((f) => f.map((c) => limpio(c) ?? ""));
        return filas.length ? filas : respaldo;
      },
      foto: (k, respaldo) => fotos[k] || respaldo,
      esRemota: (k) => !!fotos[k],
      real: !!slug,
      slug,
    };
  }, [valores, fotos, slug]);
}

/** La dirección de cada pestaña. Con slug apunta al predio; sin él, al prototipo. */
export function rutas(slug?: string) {
  const base = slug ? `/predios/ficha/${slug}` : "/predios/ficha";
  return {
    oportunidad: base,
    finanzas: `${base}/finanzas`,
    transformacion: `${base}/transformacion`,
  };
}
