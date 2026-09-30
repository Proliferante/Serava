"""
El modelo financiero de la ficha del predio: de unos pocos datos del predio y
la fotografía de mercado de su segmento, a todas las cifras de la pestaña
Finanzas (y las de «La oportunidad en una mirada»).

DE DÓNDE SALE
Es el mismo modelo de las fichas del evento de Medellín
(tarea_8dias/fichas_evento/calcular_fichas.py, David, sept-2026), portado sin
pandas ni lectura de archivos: recibe diccionarios y devuelve diccionarios. Las
reglas fijas son las del Excel de Paola (Ficha_zequara.xlsx) más las decisiones
que Laura dejó a criterio de David (27-sep) y los ajustes de Paola del 28-sep.
El test `tests/test_fichas_modelo.py` comprueba que con los datos de SN001–SN004
da las mismas cifras que las fichas locales.

QUÉ ENTRA
  · predio: área, precio publicado, precio negociado (si no, publicado − 10 %),
    costo de remodelación por m², administración mensual.
  · segmento: la fotografía de mercado de su zona × tipo × tamaño
    (mercado_referencia.json): venta, venta en estado remodelado y arriendo.
  · macro: CDT e IPC (macro.py).

LAS DECISIONES QUE NO SON OBVIAS (y por qué)
  · Inversión = All-in: compra negociada + remodelación + 2 % de costos de la
    compra (registro, beneficencia, notaría). Es la base del score de predio.
  · Valor remodelado = percentiles 25 / 50 / 75 del $/m² del segmento en estado
    equivalente a remodelado («Remodelado» y de 5 a 20 años): conservador /
    base / alto. Lo de más de 20 años es el estado de hoy del predio y lo de 0 a
    5 trae el sobreprecio de obra nueva.
  · Arriendo = mediana del canon por m² del segmento en estado remodelado: lo
    que se cobraría después de la obra.
  · Vacancia: 1 mes al año, hasta que el Motor mida el tiempo real de colocación.
  · Crecimiento (Paola, 28-sep): valorización = (1 + IPC)(1 + prima real) − 1,
    con primas −2 / 0 / +2 %; arriendo y gastos crecen con el IPC. Sustento de
    las primas: la vivienda usada (IPVU real del BanRep) subió 0,2 % real al año
    en 5 años y 0,8 % en 10.
  · La venta del año 5 descuenta la comisión del 3 %; el impuesto de ganancia
    ocasional NO se resta de la TIR (depende de cada inversionista): se muestra
    como referencia, 15 % sobre la utilidad (Ley 2277 de 2022).
"""
from __future__ import annotations

# ── Reglas fijas ─────────────────────────────────────────────────────────
PREDIAL = 0.01            # del precio de compra, al año
GESTION_ARRIENDO = 0.10   # de la renta cobrada
SEGURO = 0.0036           # del precio de compra, al año
OTROS_COSTOS = 0.02       # de la compra: registro, beneficencia, notaría
VACANCIA_MESES = 1
COMISION_VENTA = 0.03
GANANCIA_OCASIONAL = 0.15
HORIZONTE = 5
DESCUENTO_NEGOCIACION = 0.10  # Paola: «se tiene que negociar por lo menos un 10 %»
PRIMA_REAL = {"conservador": -0.02, "base": 0.0, "alto": 0.02}
# Costo de obra por ciudad. Medellín sigue PENDIENTE de arquitectura (27-sep):
# se usa el de Bogotá del Excel de Paola y se avisa. Se puede escribir otro en la consola.
REMODELACION_M2_CIUDAD = {"Bogotá": 3_100_000, "Medellín": 3_100_000}
REMODELACION_M2_DEFECTO = 3_100_000
REMODELACION_PENDIENTE = {"Medellín"}
IPVU_SUSTENTO = {"anual_5a": 0.002, "anual_10a": 0.008, "fecha": "2026-03-31"}

BANDAS = [60, 100, 200, 400]
ETIQUETAS = ["60-100", "100-200", "200-400", ">400"]
ROTULO_BANDA = {"60-100": "60–100 m²", "100-200": "100–200 m²", "200-400": "200–400 m²", ">400": "más de 400 m²"}


def banda(area: float) -> str | None:
    """La banda de tamaño de Paola (18-sep). Menos de 60 m² no tiene banda."""
    if area is None or area < BANDAS[0]:
        return None
    for corte, etiqueta in zip(BANDAS[1:], ETIQUETAS):
        if area < corte:
            return etiqueta
    return ETIQUETAS[-1]


def tir(flujos: list[float]) -> float:
    """TIR por bisección (los flujos tienen un solo cambio de signo)."""
    lo, hi = -0.99, 1.0
    for _ in range(200):
        mid = (lo + hi) / 2
        if sum(c / (1 + mid) ** t for t, c in enumerate(flujos)) > 0:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def calcular(predio: dict, segmento: dict, ipc: float, cdt: float,
             canon_m2: float | None = None, valor_remodelado_m2: dict | None = None) -> dict:
    """
    predio: area, publicado, negociado (opcional), remodelacion_m2 (opcional),
            administracion (mensual, opcional), ciudad.
    segmento: una banda de mercado_referencia.json.
    canon_m2 / valor_remodelado_m2: para escribirlos a mano cuando la
            fotografía no tiene arriendo o valor remodelado para el segmento.
    """
    area = float(predio["area"])
    publicado = float(predio["publicado"])
    negociado = float(predio.get("negociado") or round(publicado * (1 - DESCUENTO_NEGOCIACION), -6))
    remodelacion_m2 = float(predio.get("remodelacion_m2")
                            or REMODELACION_M2_CIUDAD.get(predio.get("ciudad"), REMODELACION_M2_DEFECTO))
    remodelacion = remodelacion_m2 * area
    otros = OTROS_COSTOS * negociado
    allin = negociado + remodelacion + otros
    admin = float(predio.get("administracion") or 0)

    # ── Renta → NOI ──────────────────────────────────────────────────────
    canon = canon_m2 if canon_m2 else segmento["arriendo"]["p50"]
    renta_bruta = canon * area * 12
    vacancia = renta_bruta * VACANCIA_MESES / 12
    renta_cobrada = renta_bruta - vacancia
    gastos = {
        "Predial": PREDIAL * negociado,
        "Gestión del arriendo": GESTION_ARRIENDO * renta_cobrada,
        "Seguro": SEGURO * negociado,
        "Administración": admin * 12,
    }
    noi1 = renta_cobrada - sum(gastos.values())

    # ── Escenarios ───────────────────────────────────────────────────────
    post = valor_remodelado_m2 or {k: segmento["post_remodelacion"][p] for k, p in
                                   (("conservador", "p25"), ("base", "p50"), ("alto", "p75"))}
    valorizacion = {k: (1 + ipc) * (1 + p) - 1 for k, p in PRIMA_REAL.items()}
    esc = {}
    for k, g in valorizacion.items():
        v0 = post[k] * area
        nois = [noi1 * (1 + ipc) ** t for t in range(HORIZONTE)]
        salida_bruta = v0 * (1 + g) ** HORIZONTE
        salida = salida_bruta * (1 - COMISION_VENTA)
        flujos = [-allin] + nois[:-1] + [nois[-1] + salida]
        proy = [dict(anio=t, valor=v0 * (1 + g) ** t, renta_acum=sum(nois[:t]),
                     yield_=(nois[t - 1] / allin) if t else None) for t in range(HORIZONTE + 1)]
        payback_val = next((r["anio"] for r in proy
                            if r["valor"] * (1 - COMISION_VENTA) + r["renta_acum"] >= allin), None)
        esc[k] = dict(post_m2=post[k], valor_post=v0, valor_creado=v0 - allin, valor_creado_pct=(v0 - allin) / allin,
                      valorizacion=g, prima_real=PRIMA_REAL[k], tir=tir(flujos),
                      multiplo=(sum(nois) + salida) / allin, salida_bruta=salida_bruta,
                      comision=salida_bruta * COMISION_VENTA, proyeccion=proy, payback_valorizacion=payback_val)

    base = esc["base"]
    utilidad_venta = base["salida_bruta"] - base["comision"] - allin
    venta = segmento["venta"]
    return dict(
        costo=dict(publicado=publicado, negociado=negociado, remodelacion=remodelacion, remodelacion_m2=remodelacion_m2,
                   otros=otros, allin=allin, compra_m2=negociado / area, publicado_m2=publicado / area,
                   allin_m2=allin / area, allin_publicado=publicado + remodelacion + OTROS_COSTOS * publicado,
                   descuento_negociacion=1 - negociado / publicado),
        renta=dict(canon_m2=canon, bruta=renta_bruta, mensual=renta_bruta / 12, vacancia=vacancia,
                   cobrada=renta_cobrada, gastos=gastos, gastos_total=sum(gastos.values()), noi=noi1,
                   yield_=noi1 / allin, carry=renta_bruta / allin,
                   # Con la renta sin cubrir los gastos no hay recuperación
                   # por renta: None, y no una división por cero.
                   payback=allin / noi1 if noi1 > 0 else None),
        escenarios=esc,
        supuestos=dict(ipc=ipc, cdt=cdt, prima_real=PRIMA_REAL, valorizacion=valorizacion,
                       vacancia_meses=VACANCIA_MESES, comision_venta=COMISION_VENTA),
        posicion=dict(vs_mediana_compra=(negociado / area) / venta["p50"] - 1,
                      vs_mediana_publicado=(publicado / area) / venta["p50"] - 1),
        salida=dict(utilidad_venta=utilidad_venta, impuesto_ref=GANANCIA_OCASIONAL * max(0.0, utilidad_venta),
                    tasa_go=GANANCIA_OCASIONAL),
    )
