"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { VistaKey } from "@/components/admin/data";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSOLA INTERNA — lo que comparten las diez vistas: navegar, avisar y abrir
   un modal.

   En el archivo original eran tres funciones globales (`go`, `toast`,
   `openModal`) que el marcado llamaba desde atributos `onclick`, y el modal se
   llenaba con cadenas de HTML. Aquí es un contexto: `go` cambia la vista, `av`
   muestra el aviso al pie y `modal` recibe nodos de React, así que un
   formulario dentro del modal puede tener su propio estado en vez de leerse
   con `document.getElementById` al pulsar Guardar.
   ═══════════════════════════════════════════════════════════════════════════ */

type Ctx = {
  /** Vista visible. */
  vista: VistaKey;
  /** Cambia de vista y sube el scroll, como el `go()` original. */
  go: (v: VistaKey) => void;
  /** Aviso al pie, 2,6 s. Era `toast()`. */
  av: (m: string) => void;
  /** Abre el modal. El nodo se dibuja dentro; `cierra` lo cierra. */
  modal: (titulo: string, contenido: (cierra: () => void) => ReactNode) => void;
  cierraModal: () => void;
};

const C = createContext<Ctx | null>(null);

export function useConsola() {
  const c = useContext(C);
  if (!c) throw new Error("useConsola fuera de <ConsolaProvider>");
  return c;
}

/** Cuerpo del modal. Va antes de `<MPie>`, que es su hermano. */
export function MCuerpo({ children }: { children: ReactNode }) {
  return <div className="mb">{children}</div>;
}

/** Pie del modal, con los botones alineados a la derecha. */
export function MPie({ children }: { children: ReactNode }) {
  return <div className="mf">{children}</div>;
}

export function ConsolaProvider({
  vista, setVista, children,
}: {
  vista: VistaKey;
  setVista: (v: VistaKey) => void;
  children: ReactNode;
}) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [modalCfg, setModalCfg] = useState<{ titulo: string; render: (c: () => void) => ReactNode } | null>(null);
  const reloj = useRef<number | null>(null);

  const av = useCallback((m: string) => {
    setAviso(m);
    if (reloj.current) window.clearTimeout(reloj.current);
    reloj.current = window.setTimeout(() => setAviso(null), 2600);
  }, []);

  useEffect(() => () => { if (reloj.current) window.clearTimeout(reloj.current); }, []);

  const go = useCallback((v: VistaKey) => {
    setVista(v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setVista]);

  const cierraModal = useCallback(() => setModalCfg(null), []);
  const modal = useCallback((titulo: string, render: (c: () => void) => ReactNode) => {
    setModalCfg({ titulo, render });
  }, []);

  /* Escape cierra el modal, que en el original solo se cerraba con la X o
     pulsando el velo. */
  useEffect(() => {
    if (!modalCfg) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") cierraModal(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [modalCfg, cierraModal]);

  return (
    <C.Provider value={{ vista, go, av, modal, cierraModal }}>
      {children}

      {modalCfg && (
        <div
          className="modal-scrim show"
          role="dialog" aria-modal="true" aria-label={modalCfg.titulo}
          onClick={(e) => { if (e.target === e.currentTarget) cierraModal(); }}
        >
          <div className="modal">
            <div className="mh">
              <span className="t">{modalCfg.titulo}</span>
              <button type="button" className="x" aria-label="Cerrar" onClick={cierraModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            {modalCfg.render(cierraModal)}
          </div>
        </div>
      )}

      <div className={`toast${aviso ? " show" : ""}`} role="status" aria-live="polite">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3}><path d="M20 6L9 17l-5-5" /></svg>
        <span>{aviso}</span>
      </div>
    </C.Provider>
  );
}
