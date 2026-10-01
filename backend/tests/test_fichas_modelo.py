"""
El modelo financiero de la ficha en el backend tiene que dar las MISMAS cifras
que las fichas del evento (tarea_8dias/fichas_evento, 29-sep-2026), que son las
que Paola revisó y aprobó el 28-sep. Si alguien cambia una regla del modelo,
este test lo dice.

Corre sin red ni base: FICHAS_MACRO_EN_VIVO=0 hace que el CDT y el IPC salgan del
respaldo (12,03 % y 6,24 %, los mismos de las fichas locales).
"""
import json
import os
from pathlib import Path

import pytest

os.environ["FICHAS_MACRO_EN_VIVO"] = "0"

from app.services import fichas  # noqa: E402
from app.services.fichas import macro  # noqa: E402

CASOS = json.loads((Path(__file__).parent / "fixtures" / "fichas_evento.json").read_text(encoding="utf-8"))
SN = [k for k in CASOS if not k.startswith("_")]


@pytest.fixture(autouse=True)
def sin_cache(tmp_path, monkeypatch):
    # Cada prueba arranca sin caché: si no, un CDT consultado en vivo en otra
    # corrida cambiaría las cifras esperadas.
    monkeypatch.setattr(macro, "CACHE_DISCO", tmp_path / "macro.json")
    macro._memoria.clear()


@pytest.mark.parametrize("sn", SN)
def test_reproduce_las_fichas_del_evento(sn):
    caso = CASOS[sn]
    r = fichas.calcular_ficha(caso["entradas"])
    esp = caso["esperado"]
    res = r["resumen"]
    assert res["allin"] == pytest.approx(esp["allin"], rel=1e-9)
    for k in ("conservador", "base", "alto"):
        assert res["tir"][k] == pytest.approx(esp["tir"][k], abs=1e-6), k
    assert res["multiplo"] == pytest.approx(esp["multiplo"], rel=1e-9)
    assert res["renta_mensual"] == pytest.approx(esp["mensual"], rel=1e-9)
    assert res["score"] == pytest.approx(esp["score"], abs=0.05)


def test_campos_con_el_formato_de_la_ficha():
    v = fichas.calcular_ficha(CASOS["SN001"]["entradas"])["valores"]
    assert v["fin_tir"] == "15,9%"
    assert v["fin_cdt"] == "12,0%"
    assert v["puente_allin"] == "$2.813M"
    assert v["ft_tir_conservador"] == "10,1%" and v["ft_tir_optimo"] == "21,5%"
    assert v["termo_actual"] == 6.0  # número, no texto: es un <input type="number">
    assert v["ft_proyeccion"][0][0] == "0" and len(v["ft_proyeccion"]) == 6
    assert v["ft_cdt_referencia"].startswith("Referencia: CDT a 360 días, 12,0% E.A.")
    assert "IPC 6,2% constante" in v["ft_supuestos"]
    assert v["razon_4_t"] == "Alineado con nuestra tesis"


def test_bajo_el_cdt_lo_dice():
    e = dict(CASOS["SN003"]["entradas"], negociado=640_000_000)  # comprar caro
    r = fichas.calcular_ficha(e)
    assert r["resumen"]["tir"]["base"] < 0.1203
    assert r["valores"]["razon_4_t"] == "Retorno frente al CDT"
    assert any("por debajo del CDT" in a for a in r["avisos"])


def test_zona_sin_datos_explica_que_falta():
    with pytest.raises(fichas.DatosInsuficientes, match="No hay fotografía de mercado"):
        fichas.calcular_ficha({"zona": "Casco Viejo", "tipo": "Apartamento", "area": 120, "publicado": 5e8})


def test_sin_notas_de_zona_no_inventa_score():
    r = fichas.calcular_ficha({"zona": "Laureles", "tipo": "Apartamento", "area": 150, "publicado": 7e8})
    assert r["resumen"]["score"] is None and "score" not in r["valores"]
    assert any("Sin notas de zona" in a for a in r["avisos"])
    # Laureles viene de la corrida del 13-sep, sin antigüedad: tiene que avisarlo.
    assert any("Valor remodelado con todas las antigüedades" in a for a in r["avisos"])


def test_fuera_del_poligono_veta_el_score():
    e = dict(CASOS["SN002"]["entradas"], dentro_poligono=False)
    r = fichas.calcular_ficha(e)
    assert r["resumen"]["score"] == 0
    assert any("fuera del polígono" in a for a in r["avisos"])


def test_cdt_ponderado_por_monto_y_ultimos_cortes():
    filas = [{"fechacorte": f"2026-09-0{d}T00", "nombreentidad": "A", "tasa": "10", "monto": "100"} for d in range(1, 7)]
    filas.append({"fechacorte": "2026-09-06T00", "nombreentidad": "B", "tasa": "20", "monto": "300"})
    r = macro.calcular_cdt(filas)
    assert r["fecha_desde"] == "2026-09-02"  # 5 cortes: el 1 queda fuera
    assert r["valor"] == pytest.approx((10 * 500 + 20 * 300) / 800 / 100, abs=1e-4)


def test_sin_red_usa_el_respaldo_y_lo_avisa():
    r = fichas.calcular_ficha(CASOS["SN001"]["entradas"])
    assert any(a.startswith("CDT: no se pudo consultar en vivo (respaldo fijo)") for a in r["avisos"])


def test_negociado_que_no_cuadra_con_el_publicado_se_avisa():
    # 1,8 M frente a 1.995 M publicados: una cifra mal escrita, no una ganga.
    r = fichas.calcular_ficha(dict(CASOS["SN001"]["entradas"], negociado=1_800_000))
    assert any(a.startswith("Revisa el precio negociado") for a in r["avisos"])
    # El negociado real de SN001 (Excel de Paola) no avisa.
    r = fichas.calcular_ficha(CASOS["SN001"]["entradas"])
    assert not any(a.startswith("Revisa el precio negociado") for a in r["avisos"])
