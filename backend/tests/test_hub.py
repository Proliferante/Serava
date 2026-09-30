"""
tests/test_hub.py
=================
Lo que el HUB acepta en `enlace` y `foto`, y lo que la página pública no ve.
Van a la página pública como `href` y `<img src>`: ahí es donde un valor
malicioso hace daño.
"""

import pytest

from app.core import config
from app.services import hub_service as svc

BASE = "https://proyecto.supabase.co"


@pytest.mark.parametrize("enlace", [
    "javascript:alert(1)", "JavaScript:alert(1)", " javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>", "vbscript:x", "//otro.com/x",
    "https://", "ftp://x.com",
])
def test_enlace_peligroso_se_rechaza(enlace):
    with pytest.raises(ValueError):
        svc._enlace_seguro(enlace)


@pytest.mark.parametrize("enlace", ["", "https://zequara.com/x", "http://a.co", "/predios"])
def test_enlace_normal_pasa(enlace):
    assert svc._enlace_seguro(enlace) == enlace


def test_foto_solo_del_almacen_propio(monkeypatch):
    monkeypatch.setattr(config, "SUPABASE_URL", BASE)
    buena = f"{BASE}/storage/v1/object/public/Fichas/hub/a.webp"
    assert svc._foto_segura(buena) == buena
    assert svc._foto_segura("") is None
    for mala in ("https://rastreo.com/pixel.gif", f"{BASE}.evil.com/storage/v1/object/public/x",
                 "javascript:x"):
        with pytest.raises(ValueError):
            svc._foto_segura(mala)


def test_lo_publico_no_lleva_autor_ni_id():
    item = {"slug": "a", "titulo": "T", "creado_por": "Ana (comercial)", "id": 7, "publicado": True}
    assert svc.publico(item) == {"slug": "a", "titulo": "T"}
