"""
score_modelo.py — Score Zequara de predio (prototipo v0.2, 28-sep-2026)
=======================================================================
Copia sin cambios de tarea_8dias/score_predio/modelo_score.py. Si se cambia una
fórmula, se cambia en los dos lados (o se deja de usar la copia local).

El núcleo del cálculo, sin dependencias (ni pandas ni base de datos): recibe
un diccionario con los insumos de un predio y devuelve el score con todo su
desglose. Así Jesús lo puede llevar tal cual a un servicio del backend de
Zequara (FastAPI) y la infraestructura de datos queda aparte de la de
Proliferante, como pidió Paola.

DE DÓNDE SALE LA FÓRMULA
  · Estructura y pesos: nota técnica Serava Scoring v9 (bloques de retorno,
    mercado y riesgo), recalculando el bloque de retorno con los datos del
    predio (propuesta de unificación, 18-sep).
  · Costo: All-in (compra + obra + costos de compra), de la Propuesta B de
    arquitectura, que también da las escalas 0–100 del spread, la
    valorización y el yield neto.
  · Arquitectura: los 9 factores de «Características arquitectónicas»
    (antes «Ojo del arquitecto», Propuesta B) SÍ entran a la fórmula, como pidió Paola el 18-sep. Los dos factores
    críticos (sistema estructural y reglamento PH) además funcionan como veto.
  · Rentabilidad del arriendo (28-sep): carry bruto oficial del v9 (canon
    anual ÷ All-in, rúbrica 1–10 × 10), como recomienda el Motor de
    Inteligencia (variable 16). El yield neto frente al mercado (Propuesta B)
    solo pesa en el juego «arquitectura_55_45», que es la fórmula de la B.
  · Pesos: no están fijos («no los pongamos en piedra»). Hay tres juegos
    para comparar en PESOS; el recomendado es «unificado».

ESCALA: cada componente va de 0 a 100. Score = Σ peso × nota, luego ×
(1 − descuento país) y × factor de veto (0 si un gate crítico «No pasa»).
"""

# ── Juegos de pesos (cada uno suma 1) ──────────────────────────────────────
V9 = {  # nota técnica Serava Scoring v9, tal cual
    "spread": 0.25, "valorizacion": 0.20, "carry": 0.10,
    "demanda": 0.12, "unicidad": 0.10, "pipeline": 0.08,
    "liquidez": 0.06, "regulatorio": 0.05, "esg": 0.04,
}
PESOS = {
    "v9": dict(V9, arquitectura=0.0),
    # Propuesta B de arquitectura: 55 % valor patrimonial + 45 % arquitectura.
    "arquitectura_55_45": {"spread": 0.25, "valorizacion": 0.20, "yield": 0.10, "arquitectura": 0.45},
    # Recomendado: el v9 pesa el 75 % y la arquitectura el 25 %. Conserva las
    # proporciones oficiales entre variables y deja entrar la arquitectura.
    "unificado": dict({k: round(v * 0.75, 4) for k, v in V9.items()}, arquitectura=0.25),
}
PESOS_POR_DEFECTO = "unificado"

BLOQUES = {
    "Retorno": ["spread", "valorizacion", "carry", "yield"],
    "Mercado": ["demanda", "unicidad", "pipeline"],
    "Riesgo y salida": ["liquidez", "regulatorio", "esg"],
    "Arquitectura": ["arquitectura"],
}

NOMBRES = {
    "spread": "Spread de valor", "valorizacion": "Valorización a 5 años", "carry": "Carry de arriendo", "yield": "Yield neto vs. mercado",
    "demanda": "Demanda estructural", "unicidad": "Unicidad del activo", "pipeline": "Pipeline de oferta nueva",
    "liquidez": "Liquidez de salida", "regulatorio": "Riesgo regulatorio", "esg": "Riesgo ESG",
    "arquitectura": "Características arquitectónicas",  # antes «Ojo del arquitecto» (Paola, 28-sep: sonaba subjetivo)
}

# ── Características arquitectónicas (Propuesta B, hoja Ojo_Arquitecto) ─────────────────
FACTORES_ARQ = {  # factor: (peso, ¿gate crítico?)
    "sistema_estructural": (0.16, True),
    "reglamento_ph": (0.10, True),
    "orientacion": (0.09, False),
    "iluminacion": (0.13, False),
    "vista": (0.10, False),
    "ruido": (0.09, False),
    "altura_libre": (0.07, False),
    "posicionamiento_edificio": (0.16, False),
    "zonas_comunes_ascensores": (0.10, False),
}

# ── Umbrales de decisión (Propuesta B, hoja Score_ZEQUARA) ────────────────
def prioridad(score):
    if score >= 85:
        return "Prioridad alta"
    if score >= 75:
        return "Publicar"
    if score >= 65:
        return "Revisar"
    return "No pasa"


# ── Escalas 0–100 ─────────────────────────────────────────────────────────
def escalon(x, tramos, piso):
    """Primer tramo (umbral, nota) cuyo umbral se alcanza; si ninguno, el piso."""
    for umbral, nota in tramos:
        if x >= umbral:
            return nota
    return piso


def nota_spread(spread):
    """(m² remodelado − All-in/m²) ÷ All-in/m². Escala de la Propuesta B."""
    return escalon(spread, [(0.30, 100), (0.25, 90), (0.20, 80), (0.15, 70), (0.10, 60), (0.05, 45), (0.0, 30)], 10)


def nota_valorizacion(tasa_anual):
    """Valorización acumulada a 5 años. Escala de la Propuesta B (= rúbrica v9 en 0–100)."""
    acumulada = (1 + tasa_anual) ** 5 - 1
    return escalon(acumulada, [(0.60, 100), (0.40, 85), (0.25, 65), (0.15, 45)], 20)


def nota_carry(carry):
    """Canon anual ÷ All-in. Rúbrica oficial v9 (sección 4.3) × 10: ≥ 9 % = 10 · 7–8,9 % = 8 ·
    5–6,9 % = 6–7 · 3–4,9 % = 4–5 · < 3 % = 1–3. Los tramos «6–7» y «4–5» se parten en el punto medio."""
    return escalon(carry, [(0.09, 100), (0.07, 80), (0.06, 70), (0.05, 60), (0.04, 50), (0.03, 40)], 20)


def nota_yield(diferencia):
    """Yield neto del predio − yield neto medio del segmento. Escala de la Propuesta B."""
    return escalon(diferencia, [(0.02, 100), (0.015, 90), (0.01, 80), (0.005, 65), (0.0, 50), (-0.005, 30)], 10)


def nota_unicidad(percentil_area, rasgos):
    """Tamaño relativo del predio en su zona (variable 23) + rasgos que el mercado nuevo no replica."""
    base = escalon(percentil_area, [(0.90, 90), (0.75, 75), (0.50, 60)], 45)
    return min(100, base + 10 * min(2, len(rasgos)))


def score_arquitectura(ojo):
    """
    `ojo`: {factor: {"valoracion": -2..2 o None, ...}}. Sin valoración = 0
    (neutro, 50 puntos) y queda en la lista de pendientes.
    """
    total = peso = 0.0
    detalle, pendientes = {}, []
    for f, (w, _) in FACTORES_ARQ.items():
        v = (ojo.get(f) or {}).get("valoracion")
        if v is None:
            pendientes.append(f)
            v = 0
        nota = (v + 2) * 25
        detalle[f] = nota
        total += nota * w
        peso += w
    return total / peso, detalle, pendientes


def factor_gates(gates, ubicacion=None):
    """
    0 si algún gate crítico «No pasa» o si el predio está fuera del polígono de
    su zona (regla de Paola, 7-sep: «si está en polígono entra, si no, no»);
    1 si no. «Por validar» y un predio en el borde del polígono dejan el score
    condicionado: las coordenadas de un anuncio pueden desviarse unos metros.
    """
    u = (ubicacion or {}).get("estado", "dentro")
    if u == "fuera":
        return 0.0, f"NO PUBLICAR · fuera del polígono de {ubicacion['zona']}"
    estados = [gates.get("sistema_estructural", "Por validar"), gates.get("reglamento_ph", "Por validar")]
    if "No pasa" in estados:
        return 0.0, "NO PUBLICAR"
    if u in ("borde", "sin coordenadas"):
        return 1.0, f"Verificar dirección: {'a ' + str(round(ubicacion['distancia_m'])) + ' m del límite de ' + ubicacion['zona'] if u == 'borde' else 'sin coordenadas'}"
    if all(e == "Pasa" for e in estados):
        return 1.0, "OK"
    return 1.0, "Condicionado a la visita"


# ── Score del predio ──────────────────────────────────────────────────────
def score_predio(x, pesos=PESOS_POR_DEFECTO):
    """
    x (insumos, todos por predio salvo los marcados «zona»):
      spread, valorizacion_anual, carry_bruto, yield_neto, yield_neto_mercado,
      percentil_area, rasgos[],
      zona: {demanda, pipeline, liquidez, regulatorio, esg} en 1–10,
      descuento_pais, ojo_arquitecto{}, gates{}
    """
    w = PESOS[pesos] if isinstance(pesos, str) else pesos
    arq, arq_detalle, arq_pend = score_arquitectura(x["ojo_arquitecto"])
    notas = {
        "spread": nota_spread(x["spread"]),
        "valorizacion": nota_valorizacion(x["valorizacion_anual"]),
        "carry": nota_carry(x["carry_bruto"]),
        "yield": nota_yield(x["yield_neto"] - x["yield_neto_mercado"]),
        "unicidad": nota_unicidad(x["percentil_area"], x["rasgos"]),
        "arquitectura": arq,
        **{k: x["zona"][k] * 10 for k in ("demanda", "pipeline", "liquidez", "regulatorio", "esg")},
    }
    bruto = sum(w.get(k, 0) * n for k, n in notas.items())
    veto, estado_gates = factor_gates(x["gates"], x.get("ubicacion"))
    final = bruto * (1 - x["descuento_pais"]) * veto
    bloques = {}
    for b, ks in BLOQUES.items():
        wb = sum(w.get(k, 0) for k in ks)
        if wb:
            bloques[b] = {"peso": wb, "nota": sum(w.get(k, 0) * notas[k] for k in ks) / wb,
                          "aporte": sum(w.get(k, 0) * notas[k] for k in ks)}
    return {
        "score": round(final, 1), "bruto": round(bruto, 1), "prioridad": prioridad(final) if veto else "No publicar",
        "estado_gates": estado_gates, "ubicacion": x.get("ubicacion"), "notas": notas, "pesos": w, "bloques": bloques,
        "arquitectura": {"detalle": arq_detalle, "pendientes": arq_pend},
    }
