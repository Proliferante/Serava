"""
tests/test_origen.py
====================
La separación entre www y admin (revisión de seguridad del 30-sep-2026).

Los dos subdominios son «el mismo sitio» para el navegador, así que la cookie
SameSite=Strict de la consola viaja también en las peticiones que salen de la
web pública. Lo que los separa es esto:

  · sin cabeceras CORS: un script de www no puede leer respuestas de admin;
  · Sec-Fetch-Site: una petición que nace en otro subdominio se corta;
  · cada API sólo acepta escrituras desde su subdominio;
  · las respuestas de la API no se guardan en cachés compartidas;
  · con la contraseña temporal sólo se puede cambiarla.
"""

import pytest
from fastapi.testclient import TestClient

from app.core import config, sesiones
from tests.test_auth import CLAVE_BUENA, base, cliente, entrar  # noqa: F401  (fixtures)

WWW = "https://www.zequara.com"
ADMIN = "https://admin.zequara.com"


@pytest.fixture
def app_real(monkeypatch):
    monkeypatch.setattr(config, "CORS_ORIGINS", [WWW, ADMIN])
    monkeypatch.setattr(config, "PROXY_SECRETO", "")
    monkeypatch.setattr(sesiones, "disponible", lambda: True)
    from app.core import limites
    limites.contador.vaciar()
    from app.main import app
    return TestClient(app)


@pytest.mark.parametrize("sitio", ["same-site", "cross-site"])
def test_peticion_de_otro_subdominio_se_corta(app_real, sitio):
    assert app_real.get("/api/salud", headers={"sec-fetch-site": sitio}).status_code == 403


@pytest.mark.parametrize("sitio", ["same-origin", "none", None])
def test_peticion_del_mismo_origen_pasa(app_real, sitio):
    h = {"sec-fetch-site": sitio} if sitio else {}
    assert app_real.get("/api/salud", headers=h).status_code == 200


def test_sin_cabeceras_cors_aunque_el_origen_este_en_la_lista(app_real):
    r = app_real.get("/api/salud", headers={"origin": WWW})
    assert "access-control-allow-origin" not in r.headers
    r = app_real.options("/api/auth/login", headers={"origin": WWW, "access-control-request-method": "POST"})
    assert "access-control-allow-origin" not in r.headers


def test_la_consola_solo_escribe_desde_admin(app_real):
    cuerpo = {"correo": "x@ejemplo.invalid", "clave": "y"}
    assert app_real.post("/api/auth/login", json=cuerpo, headers={"origin": WWW}).status_code == 403
    # Desde admin pasa la comprobación de origen (y luego falla el login, que
    # es lo que toca con un correo inventado: no es un 403).
    assert app_real.post("/api/auth/login", json=cuerpo, headers={"origin": ADMIN}).status_code != 403


def test_las_respuestas_de_la_api_no_se_cachean(app_real):
    assert app_real.get("/api/salud").headers["cache-control"] == "no-store"


def test_con_clave_temporal_solo_se_puede_cambiarla(base, cliente):  # noqa: F811
    base[2]["debe_cambiar_clave"] = True
    entrar(cliente, "christian.mejia@zequara.com")
    assert cliente.get("/api/auth/yo").status_code == 200
    assert cliente.get("/solo-sesion").status_code == 403
