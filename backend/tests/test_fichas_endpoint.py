"""
POST /api/admin/flujo/ficha/calcular y el `calculo_base` de GET /ficha.

Como en test_auth.py, no se prueba el SQL contra Postgres: la lectura del
predio (`_lee_detalle`) se sustituye por un diccionario con las columnas que
devuelve la consulta real. Lo que se prueba es el cableado: que lo del anuncio
sirva de punto de partida, que lo escrito en la consola lo corrija, que no se
escriba nada en la base y que un segmento sin datos responda 422 con el motivo.
"""
import json
import os
from pathlib import Path

os.environ["FICHAS_MACRO_EN_VIVO"] = "0"

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.api import flujo  # noqa: E402
from app.api.auth import usuario_actual  # noqa: E402
from app.services.fichas import macro  # noqa: E402

CASOS = json.loads((Path(__file__).parent / "fixtures" / "fichas_evento.json").read_text(encoding="utf-8"))
SN001 = CASOS["SN001"]["entradas"]
LINK = "https://www.metrocuadrado.com/inmueble/venta-apartamento-bogota-la-cabrera/X-1"

# Lo que devuelve _lee_detalle para SN001 (columnas de clean_listings + detalle).
FILA = {
    "zona": "La Cabrera", "ciudad": "Bogotá", "tipo_inmueble": "Apartamento",
    "area_m2": SN001["area"], "area_confirmada_m2": None, "precio_venta": SN001["publicado"],
    "administracion": SN001["administracion"], "dentro_poligono_real": True,
}


@pytest.fixture
def cliente(monkeypatch, tmp_path):
    monkeypatch.setattr(macro, "CACHE_DISCO", tmp_path / "macro.json")
    macro._memoria.clear()
    escrituras = []
    monkeypatch.setattr(flujo, "_exige_pipeline", lambda: None)
    monkeypatch.setattr(flujo, "_lee_detalle", lambda link: dict(FILA) if link == LINK else {})
    def no_escribir():
        escrituras.append("escribir")
        raise AssertionError("calcular no debe escribir en la base")

    monkeypatch.setattr(flujo, "escribir", no_escribir)
    monkeypatch.setattr(flujo.bitacora, "anotar", lambda *a, **k: None)
    app = FastAPI()
    app.include_router(flujo.router, prefix="/api/admin/flujo")
    app.dependency_overrides[usuario_actual] = lambda: {"nombre": "Prueba", "rol": "admin"}
    c = TestClient(app)
    c.escrituras = escrituras
    return c


def test_calcula_desde_el_anuncio_y_con_lo_que_se_corrige(cliente):
    # Solo el negociado viene de la consola; lo demás, del anuncio.
    r = cliente.post("/api/admin/flujo/ficha/calcular", json={"link": LINK, "negociado": SN001["negociado"],
                                                               "rasgos": SN001["rasgos"]})
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["entradas"]["zona"] == "La Cabrera" and d["entradas"]["negociado"] == SN001["negociado"]
    assert d["resumen"]["tir"]["base"] == pytest.approx(CASOS["SN001"]["esperado"]["tir"]["base"], abs=1e-6)
    assert d["valores"]["fin_tir"] == "15,9%"
    assert cliente.escrituras == []  # calcular no guarda nada


def test_segmento_sin_datos_responde_422_con_el_motivo(cliente):
    r = cliente.post("/api/admin/flujo/ficha/calcular", json={"link": LINK, "zona": "Casco Viejo"})
    assert r.status_code == 422
    assert "No hay fotografía de mercado" in r.json()["detail"]


def test_predio_fuera_del_flujo_es_404(cliente):
    r = cliente.post("/api/admin/flujo/ficha/calcular", json={"link": "otro"})
    assert r.status_code == 404


def test_calculo_base_sale_del_anuncio():
    b = flujo._calculo_base(FILA)
    assert b == {"zona": "La Cabrera", "ciudad": "Bogotá", "tipo": "Apartamento", "area": SN001["area"],
                 "publicado": SN001["publicado"], "administracion": SN001["administracion"], "dentro_poligono": True}
