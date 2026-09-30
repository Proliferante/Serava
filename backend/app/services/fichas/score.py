"""
Arma los insumos del Score Zequara de predio y lo calcula con score_modelo.py.

Es la parte de tarea_8dias/score_predio/calcular_scores.py que no depende de
archivos locales: toma el resultado del modelo financiero (modelo.py), la
fotografía de mercado del segmento y las notas de zona (zonas_score.json).

LO QUE TODAVÍA NO SE SABE EN LA CONSOLA, Y CÓMO SE TRATA
  · Características arquitectónicas (9 factores) y los dos gates (estructura y
    reglamento de PH): salen de la visita. Sin visita cada factor vale 0
    (neutro, 50 puntos) y los gates quedan «Por validar» → el score sale
    «Condicionado a la visita». Es lo mismo que en las fichas del evento.
  · Rasgos únicos del predio (vista, piso alto…): suman a la unicidad solo si
    se escriben.
  · Notas de zona (demanda, pipeline, liquidez, regulatorio, ESG): solo La
    Cabrera tiene oficiales; Chicó y El Poblado son estimadas por David con las
    rúbricas v9. Para las demás zonas NO se calcula score: se avisa, en vez de
    inventar una nota.
  · Ubicación: el veto por polígono usa `dentro_poligono_real` de
    clean_listings (sí = dentro, no = fuera → no publicar, vacío = sin
    coordenadas → verificar dirección).
"""
from __future__ import annotations

import json
from pathlib import Path

from app.services.fichas import score_modelo as M

AQUI = Path(__file__).resolve().parent
ZONAS = json.loads((AQUI / "zonas_score.json").read_text(encoding="utf-8"))


def percentil_area(area: float, cortes: dict) -> float:
    """En qué tramo de tamaño de la zona cae el predio: 0,9 / 0,75 / 0,5 / 0.

    La fotografía guarda solo los cortes p50 / p75 / p90 del área de la zona,
    que son justo los umbrales de la escala de unicidad.
    """
    for q, p in ((0.90, "p90"), (0.75, "p75"), (0.50, "p50")):
        if cortes.get(p) is not None and area > cortes[p]:
            return q
    return 0.0


def ubicacion(dentro_poligono, zona: str) -> dict:
    if dentro_poligono is True:
        return {"estado": "dentro", "distancia_m": None, "zona": zona}
    if dentro_poligono is False:
        return {"estado": "fuera", "distancia_m": None, "zona": zona}
    return {"estado": "sin coordenadas", "distancia_m": None, "zona": zona}


def insumos(resultado: dict, segmento: dict, area_cortes: dict, zona: str, area: float,
            rasgos: list[str] | None = None, factores: dict | None = None, gates: dict | None = None,
            dentro_poligono=None) -> dict | None:
    """None si la zona no tiene notas de zona (no se inventa un score)."""
    z = ZONAS["zonas"].get(zona)
    if not z:
        return None
    co, re_, esc = resultado["costo"], resultado["renta"], resultado["escenarios"]
    # Yield neto del mercado comparable EN ESTADO REMODELADO (celda de la matriz
    # tamaño × antigüedad), con la misma proporción NOI/renta bruta del predio.
    # Sin celda con muestra suficiente, el tamaño completo.
    ratio_neto = re_["noi"] / re_["bruta"]
    celda = segmento.get("celda_remodelada")
    if celda:
        canon_m, precio_m, base_ym = celda["arriendo_p50"], celda["venta_p50"], "estado remodelado"
    else:
        canon_m, precio_m, base_ym = segmento["arriendo"]["p50"], segmento["venta"]["p50"], "tamaño completo"
    return {
        "spread": (esc["base"]["post_m2"] - co["allin_m2"]) / co["allin_m2"],
        "valorizacion_anual": esc["base"]["valorizacion"],
        "carry_bruto": re_["bruta"] / co["allin"],
        "yield_neto": re_["yield_"],
        "yield_neto_mercado": canon_m * 12 * ratio_neto / precio_m,
        "yield_mercado_base": base_ym,
        "percentil_area": percentil_area(area, area_cortes),
        "rasgos": rasgos or [],
        "zona": {k: z[k] for k in ("demanda", "pipeline", "liquidez", "regulatorio", "esg")},
        "zona_origen": z["origen"],
        "descuento_pais": ZONAS["descuento_pais"]["Colombia"],
        "ojo_arquitecto": {f: {"valoracion": (factores or {}).get(f)} for f in M.FACTORES_ARQ},
        "gates": {"sistema_estructural": "Por validar", "reglamento_ph": "Por validar"} | (gates or {}),
        "ubicacion": ubicacion(dentro_poligono, zona),
    }


def calcular(x: dict) -> dict:
    r = M.score_predio(x)
    # La ficha pública dice alta / media / baja (umbrales 85 / 65), no los de decisión interna.
    s = r["score"]
    r["prioridad_publica"] = ("Prioridad alta" if s >= 85 else "Prioridad media" if s >= 65 else "Prioridad baja")
    return r
