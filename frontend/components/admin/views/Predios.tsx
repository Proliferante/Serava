"use client";

import { useMemo, useState } from "react";
import { useConsola } from "@/components/admin/ctx";
import { EST, type Predio } from "@/components/admin/data";
import {
  AreaChip, Card, Est, IcoDown, IcoEdit, IcoEye, IcoPlus, Tabla, Tgl, VHead,
} from "@/components/admin/ui";

/* ═══════════════════════════════════════════════════════════════════════════
   PREDIOS — el listado maestro. Publicar aquí controla lo que se ve en el
   sitio y en el portal privado.

   Va ordenado de mayor a menor Score, con los que aún no tienen ("—", los de
   Borrador o En evaluación sin score cargado) al final y no al principio: el
   arquitecto no puede revisar los 5.000+ predios habilitados uno por uno, así
   que las mejores oportunidades tienen que quedar arriba.
   ═══════════════════════════════════════════════════════════════════════════ */

const CIUDADES = ["Bogotá", "Medellín", "Cartagena", "Panamá"];

export default function Predios({
  predios, onPublicar, abrirGestion,
}: {
  predios: Predio[];
  onPublicar: (id: string) => void;
  abrirGestion: () => void;
}) {
  const { go } = useConsola();
  const [fEstado, setFEstado] = useState("");
  const [fCiudad, setFCiudad] = useState("");

  const filas = useMemo(() => {
    const num = (s: string) => (s === "—" ? -1 : parseFloat(s));
    return predios
      .filter((p) => (!fEstado || p.est === fEstado) && (!fCiudad || p.city === fCiudad))
      .slice()
      .sort((a, b) => num(b.score) - num(a.score));
  }, [predios, fEstado, fCiudad]);

  return (
    <section className="view active">
      <VHead
        titulo="Gestión de" fuerte="predios"
        acciones={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-ghost" onClick={() => go("extraccion")}><IcoDown />Extraer predios</button>
            <button type="button" className="btn btn-primary" onClick={() => go("nuevo")}><IcoPlus />Nuevo predio</button>
          </div>
        }
      >
        El listado maestro. Publicar aquí controla lo que se muestra en el sitio y en el portal privado.
      </VHead>

      <div className="filters">
        <select className="f" value={fEstado} onChange={(e) => setFEstado(e.target.value)} aria-label="Filtrar por estado">
          <option value="">Estado: todos</option>
          {Object.entries(EST).map(([k, v]) => <option key={k} value={k}>{v.t}</option>)}
        </select>
        <select className="f" value={fCiudad} onChange={(e) => setFCiudad(e.target.value)} aria-label="Filtrar por ciudad">
          <option value="">Ciudad: todas</option>
          {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="f" aria-label="Filtrar por área responsable" defaultValue="">
          <option value="">Área responsable</option>
          <option>Arquitectura</option><option>Data</option><option>Comercial</option>
        </select>
        <button type="button" className="btn btn-ghost ml-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>
          Más filtros
        </button>
      </div>

      <Card style={{ padding: "6px 6px 2px" }}>
        <Tabla ancho="lg">
          <thead>
            <tr>
              <th>Predio</th><th>Estado</th><th className="num">Score</th><th className="num">Inversión</th>
              <th>Responsable</th><th>Publicado</th><th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="pname">{p.nombre}</div>
                  <div className="pzone">{p.zona}</div>
                </td>
                <td><Est k={p.est} /></td>
                <td className="num">{p.score}</td>
                <td className="num">{p.inversion}</td>
                <td><AreaChip a={p.area} /></td>
                <td><Tgl on={p.publicado} onToggle={() => onPublicar(p.id)} label={`Publicar ${p.nombre}`} /></td>
                <td>
                  <div className="tacts">
                    <a className="iconbtn" href={p.link || "/predios/ficha"} target={p.link ? "_blank" : undefined} rel={p.link ? "noopener" : undefined} title={p.link ? "Anuncio original" : "Vista pública"}><IcoEye /></a>
                    <button type="button" className="iconbtn" onClick={abrirGestion} title="Gestionar"><IcoEdit /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!filas.length && (
              <tr><td colSpan={7}><div className="exempty">Ningún predio cumple estos filtros.</div></td></tr>
            )}
          </tbody>
        </Tabla>
      </Card>
    </section>
  );
}
