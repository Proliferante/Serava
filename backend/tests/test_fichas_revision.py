"""
tests/test_fichas_revision.py
=============================
Lo que se corrigió en la revisión de `feat/fichas-finanzas-automaticas`
(30-sep-2026). Cada prueba es un fallo que existía:

  · el intermedio del BanRep se descargaba por http y se agregaba como
    autoridad de confianza;
  · con la API caída, cada «Calcular» esperaba el tiempo máximo entero;
  · un NOI de cero dividía por cero (500);
  · un número absurdo llevaba las cuentas a infinito (500 al pasarlo a JSON).
"""
import json
import os
import ssl
from pathlib import Path

os.environ["FICHAS_MACRO_EN_VIVO"] = "0"

import pytest  # noqa: E402

from app.services import fichas  # noqa: E402
from app.services.fichas import macro  # noqa: E402
from tests.test_fichas_endpoint import LINK, cliente  # noqa: E402,F401  (fixture)

CASOS = json.loads((Path(__file__).parent / "fixtures" / "fichas_evento.json").read_text(encoding="utf-8"))
SN001 = CASOS["SN001"]["entradas"]


@pytest.fixture(autouse=True)
def limpio(tmp_path, monkeypatch):
    monkeypatch.setattr(macro, "CACHE_DISCO", tmp_path / "macro.json")
    macro._memoria.clear()
    macro._fallos.clear()
    yield
    macro._fallos.clear()


def test_el_intermedio_va_en_el_repo_y_no_se_descarga():
    assert isinstance(macro.INTERMEDIO_BANREP, Path) and macro.INTERMEDIO_BANREP.exists()
    ctx = ssl.create_default_context()
    ctx.load_verify_locations(cafile=str(macro.INTERMEDIO_BANREP))
    # Nada de http en el código de la consulta del IPC.
    assert "http://" not in Path(macro.__file__).read_text(encoding="utf-8").split("def _consultar_ipc")[1].split("def ")[0]


def test_tras_un_fallo_no_se_reintenta_en_cada_clic(monkeypatch):
    monkeypatch.setattr(macro, "en_vivo", lambda: True)
    llamadas = []

    def caida():
        llamadas.append(1)
        raise TimeoutError("la API no contesta")

    primero = macro._obtener("cdt", caida)
    segundo = macro._obtener("cdt", caida)
    assert len(llamadas) == 1
    assert primero["origen"] == segundo["origen"] == "respaldo fijo"
    assert "no contesta" in segundo["aviso"]


def test_noi_de_cero_o_negativo_no_revienta():
    # Una administración que se come toda la renta.
    e = dict(SN001, administracion=1e9)
    r = fichas.calcular_ficha(e)
    assert r["valores"]["ft_payback_renta"] == "No se recupera con la renta"


@pytest.mark.parametrize("campo", ["publicado", "negociado", "remodelacion_m2", "administracion",
                                   "canon_m2", "valor_remodelado_m2"])
def test_numero_absurdo_es_422_y_no_500(cliente, campo):  # noqa: F811
    r = cliente.post("/api/admin/flujo/ficha/calcular", json={"link": LINK, campo: 1e300})
    assert r.status_code == 422


def test_rasgo_larguisimo_es_422(cliente):  # noqa: F811
    r = cliente.post("/api/admin/flujo/ficha/calcular", json={"link": LINK, "rasgos": ["x" * 5000]})
    assert r.status_code == 422
