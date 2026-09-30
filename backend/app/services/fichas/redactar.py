"""
Del resultado del modelo a los campos de la ficha, escritos como se imprimen.

LAS CLAVES SON LAS DEL ESQUEMA
Cada clave de aquí es un campo de `frontend/components/admin/ficha/esquema.ts`
(«LAS CLAVES SON CONTRATO»). La consola las recibe como propuesta y quien arma
la ficha decide si las usa: nada se guarda sin que se pulse Guardar o Publicar.

EL FORMATO ES EL DE LA FICHA
Los campos «cifra» van como se leen en la página («$2.813M», «15,9%», «~1 mes»),
porque así los escribe una persona y así los lee `useFicha().n()` (primer
número, punto de miles y coma decimal). Los campos «numero» van como número
(8.1, no «8,1»): son `<input type="number">` y el termómetro los usa para
colocar la marca.

Solo se proponen los campos que salen del modelo. Los que son de diseño o de
arquitectura —titulares, fotos, «activo difícil de replicar», la propuesta de
transformación— no se tocan.
"""
from __future__ import annotations

TIPO_PLURAL = {"Apartamento": "apartamentos", "Casa": "casas"}


def num(x: float, dec: int = 0) -> str:
    s = f"{abs(x):,.{dec}f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return ("−" if x < 0 else "") + s


def M(v: float) -> str:
    """Millones de pesos: «$2.813M», «$20,9M»."""
    return ("−" if v < 0 else "") + "$" + num(abs(v) / 1e6, 0 if abs(v) >= 1e8 else 1) + "M"


def SM(v: float) -> str:
    return ("+" if v >= 0 else "") + M(v)


def M2(v: float) -> str:
    return "$" + num(v / 1e6, 1) + "M"


def P(v: float, dec: int = 1) -> str:
    return num(v * 100, dec) + "%"


def SP(v: float, dec: int = 1) -> str:
    return ("+" if v >= 0 else "") + P(v, dec)


def prima(v: float) -> str:
    return "0%" if not v else SP(v, 0)


def campos(r: dict, x: dict) -> dict:
    """
    r: resultado de modelo.calcular + «score» (o None) + «mercado» (segmento y fuente).
    x: lo que se sabe del predio (zona, tipo, área…) y de las variables macro.
    """
    co, re_, esc, sup = r["costo"], r["renta"], r["escenarios"], r["supuestos"]
    cons, base, alto = esc["conservador"], esc["base"], esc["alto"]
    seg, mer = r["mercado"]["segmento"], r["mercado"]
    venta = seg["venta"]
    # Sin arriendos en la fotografía, el canon se escribió a mano: no hay rango, solo ese valor.
    arr = seg.get("arriendo") or {"n": 0, "p10": re_["canon_m2"], "p50": re_["canon_m2"], "p90": re_["canon_m2"]}
    area = x["area"]
    plural = TIPO_PLURAL.get(x["tipo"], "inmuebles")
    vs = r["posicion"]["vs_mediana_compra"]
    vs_remod = co["allin_m2"] / base["post_m2"] - 1
    cdt, ipc = sup["cdt"], sup["ipc"]
    cdt_txt = f"CDT a 360 días, {P(cdt)} E.A. ({x['cdt_fuente']})"
    primas = " / ".join(prima(sup["prima_real"][k]) for k in ("conservador", "base", "alto"))
    ipc_txt = f"IPC {P(ipc)} constante ({x['ipc_fuente']})"

    v: dict = {}

    # ── Cabecera: termómetro y tarjeta de reserva ─────────────────────────
    v["termo_actual"] = round(co["compra_m2"] / 1e6, 1)
    # Si la compra cae por debajo del p10 del segmento (pasa: SN001 compra 47 % bajo la
    # mediana), el carril arranca en la compra; si no, la marca se pega al borde.
    v["termo_min"] = round(min(venta["p10"], co["compra_m2"]) / 1e6, 1)
    v["termo_max"] = round(venta["p90"] / 1e6, 1)
    v["termo_max_rotulo"] = f"Mercado p90 {M2(venta['p90'])}"
    v["termo_nota"] = (f"Compra a {M2(co['compra_m2'])}/m², {num(abs(vs) * 100)}% "
                       f"{'bajo' if vs < 0 else 'sobre'} la mediana de su segmento ({M2(venta['p50'])}/m²).")
    v["inversion_total"] = M(co["allin"])
    v["roi_estimado"] = f"~{P(base['multiplo'] - 1, 0)}"
    if r.get("score"):
        v["score"] = round(r["score"]["score"])  # la tarjeta de reserva lo pinta tal cual: «73/100», como el diseño
        v["prioridad"] = r["score"]["prioridad_publica"]
    v["card_horizonte"] = "Horizonte: 5 años"

    # ── Oportunidad ──────────────────────────────────────────────────────
    v["razon_1_t"] = "Entrada competitiva"
    v["razon_1_d"] = (f"Compra a {M2(co['compra_m2'])}/m², {num(abs(vs) * 100)}% "
                      f"{'bajo' if vs < 0 else 'sobre'} la mediana de su segmento.")
    v["razon_2_t"] = "Microzona con mercado"
    v["razon_2_d"] = (f"{num(venta['n'])} {plural} de {x['banda_rotulo']} en venta"
                      + (f" y {num(arr['n'])} en arriendo" if arr["n"] else "") + f" en {x['zona']}.")
    # La cuarta razón dice la verdad frente al CDT: con el CDT real (12 % a
    # sep-2026) no todo predio le gana en el escenario base.
    if base["tir"] >= cdt:
        v["razon_4_t"] = "Alineado con nuestra tesis"
        v["razon_4_d"] = (f"TIR base de {P(base['tir'])}, {num((base['tir'] - cdt) * 100, 1)} pp sobre un CDT a 360 días "
                          f"({P(cdt)}), y ×{num(base['multiplo'], 2)} a 5 años.")
    else:
        v["razon_4_t"] = "Retorno frente al CDT"
        v["razon_4_d"] = (f"TIR base de {P(base['tir'])}, por debajo de un CDT a 360 días ({P(cdt)}); "
                          f"el escenario alto da {P(alto['tir'])}. ×{num(base['multiplo'], 2)} a 5 años.")

    v["puente_allin"] = M(co["allin"])
    v["puente_allin_m2"] = f"{M2(co['allin_m2'])} / m²"
    v["puente_mercado"] = M(base["valor_post"])
    v["puente_mercado_m2"] = f"{M2(base['post_m2'])} / m²"
    v["costo_precio"] = M(co["negociado"])
    v["costo_remodelacion"] = M(co["remodelacion"])
    v["costo_otros"] = M(co["otros"])
    v["valor_creado"] = SM(base["valor_creado"])
    v["valor_creado_pct"] = SP(base["valor_creado_pct"], 0)
    v["valor_creado_chip"] = (f"~{num(abs(vs_remod) * 100)}% {'por debajo' if vs_remod < 0 else 'por encima'} "
                              f"del mercado remodelado")
    v["valor_creado_texto"] = (
        f"El proyecto completo (compra, obra y costos) sale a {M2(co['allin_m2'])}/m², y el mercado ya paga "
        f"{M2(base['post_m2'])}/m² por inmuebles de su tamaño en estado remodelado en {x['zona']}. Ese diferencial "
        f"es tu margen patrimonial desde la entrega. Es valor en papel: se hace real al vender o refinanciar.")
    v["kpi_retorno"] = P(base["multiplo"] - 1)
    v["kpi_renta_mensual"] = M(re_["mensual"])
    v["kpi_rentabilidad"] = P(re_["yield_"])

    # ── Finanzas · lo esencial ───────────────────────────────────────────
    v["fin_retorno"] = P(base["multiplo"] - 1)
    v["fin_retorno_nota"] = "a 5 años · escenario base"  # una línea: el múltiplo ya va en el ROI
    v["fin_tir"] = P(base["tir"])
    v["fin_cdt"] = P(cdt)
    v["fin_renta_mensual"] = M(re_["mensual"])
    v["fin_renta_nota"] = f"{num(re_['canon_m2'])} $/m² al mes, remodelado"  # cabe en la tarjeta (sin salto)
    v["fin_rentabilidad"] = P(re_["yield_"])
    v["fin_rentabilidad_nota"] = "renta neta ÷ inversión total (All-in)"
    v["fin_rango_inversion"] = f"{M(co['allin'])}–{M(co['allin_publicado'])}"
    v["fin_colocacion"] = f"~{sup['vacancia_meses']} mes"

    # ── Ficha técnica ────────────────────────────────────────────────────
    v["ft_gastos_anuales"] = M(re_["gastos_total"])
    v["ft_gastos_nota"] = "predial, administración, seguro y gestión"
    v["ft_tir_5"] = P(base["tir"])
    v["ft_arriendo_min"] = M(arr["p10"] * area)
    v["ft_arriendo_mediana"] = M(arr["p50"] * area)
    v["ft_arriendo_max"] = M(arr["p90"] * area)
    v["ft_vacancia"] = f"~{P(sup['vacancia_meses'] / 12, 0)}"
    v["ft_mercado_total"] = M(base["valor_post"])
    v["ft_spread"] = SP(base["valor_creado_pct"], 0)
    v["ft_composicion_nota"] = (
        f"Precio de compra {M(co['negociado'])} · Remodelación {M(co['remodelacion'])} ({M2(co['remodelacion_m2'])}/m²) · "
        f"Otros costos de la compra {M(co['otros'])} (2%). Mercado remodelado: mediana de "
        f"{num(seg['post_remodelacion']['n'])} anuncios de su segmento ({mer['texto_fecha']}).")
    v["ft_tir_conservador"] = P(cons["tir"])
    v["ft_tir_base"] = P(base["tir"])
    v["ft_tir_optimo"] = P(alto["tir"])
    v["ft_cdt_vigente"] = P(cdt)
    v["ft_cdt_referencia"] = f"Referencia: {cdt_txt}."
    v["ft_alternativas_nota"] = ("La TIR suma la renta y la venta del año 5, ya descontada la comisión. "
                                 "El CDT es renta fija sin riesgo.")
    v["ft_supuestos"] = (f"Supuesto: {ipc_txt} + prima real {primas} → valorización de "
                         f"{' / '.join(P(sup['valorizacion'][k]) for k in ('conservador', 'base', 'alto'))} al año "
                         f"(conservador / base / alto). Arriendo y gastos crecen con el IPC.")
    v["ft_proyeccion"] = [
        [str(p["anio"]), M(p["valor"]), M(p["renta_acum"]) if p["anio"] else "$0",
         M(p["valor"] + p["renta_acum"]), P(p["yield_"]) if p["yield_"] is not None else "—"]
        for p in base["proyeccion"]
    ]
    # Sin payback cuando la renta no cubre los gastos (ver `modelo.calcular`).
    v["ft_payback_renta"] = (f"~{num(re_['payback'])} años" if re_["payback"] is not None
                             else "No se recupera con la renta")
    pv = base["payback_valorizacion"]
    # «inmediato» = al entregar la obra, vender ya devuelve el All-in. Corto: la tarjeta no admite más.
    v["ft_payback_valorizacion"] = ("inmediato" if pv == 0 else f"~{pv} año{'s' if pv != 1 else ''}"
                                    if pv is not None else "más de 5 años")
    v["ft_comision_venta"] = f"~{M(base['comision'])}"
    v["ft_impuesto_venta"] = f"~{M(r['salida']['impuesto_ref'])}"
    v["ft_impuesto_nota"] = "referencia: 15% de ganancia ocasional; no se resta de la TIR"
    return v
