"""
POST /api/diagnostico y GET /api/admin/diagnostico.

Como en test_auth.py, no se prueba el SQL contra Postgres: `escribir` se
sustituye por una conexión falsa que anota lo que se habría insertado. Lo que
se prueba es lo que no se ve al arrancar: que sin consentimiento no se guarde
nada, que un correo o un WhatsApp mal escritos se rechacen con un mensaje en
español, que sin la tabla responda 503 y no un 500, y que el listado del
equipo exija sesión.
"""
import warnings
from contextlib import contextmanager

warnings.filterwarnings("ignore")

import pytest  # noqa: E402
from fastapi import Depends, FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.api import diagnostico  # noqa: E402
from app.api.auth import usuario_actual  # noqa: E402

BUENA = {
    "version": "2026-10-01",
    "respuestas": [2, 2, 1, 1, 1, 1, 1, 2, [0], 2],
    "resultado": {"perfil": "valor", "riesgo": "Moderado", "compatibilidad": 95, "prioridad": "Alta"},
    "contacto": {"nombre": "Ana", "apellido": "Ruiz", "correo": "Ana@Correo.com", "whatsapp": "+57 300 123 4567",
                 "ciudad": "Bogotá", "pais": "Colombia"},
    "consentimiento": True,
    "consentimiento_texto": "Autorizo el tratamiento de mis datos personales conforme a la política de privacidad.",
    "origen": "portada",
}


class _Con:
    def __init__(self, log):
        self.log = log

    def execute(self, sql, params=()):
        self.log.append((sql, params))
        return self

    def fetchone(self):
        return {"id": 7}


@pytest.fixture
def cliente(monkeypatch):
    log = []

    @contextmanager
    def escribir():
        yield _Con(log)

    monkeypatch.setattr(diagnostico, "escribir", escribir)
    monkeypatch.setattr(diagnostico, "tabla_existe", lambda t: True)
    app = FastAPI()
    app.include_router(diagnostico.router_publico, prefix="/api/diagnostico")
    app.include_router(diagnostico.router_admin, prefix="/api/admin/diagnostico", dependencies=[Depends(usuario_actual)])
    c = TestClient(app)
    c.log = log
    return c


def test_guarda_la_solicitud_con_el_correo_normalizado(cliente):
    r = cliente.post("/api/diagnostico", json=BUENA)
    assert r.status_code == 200, r.text
    assert r.json() == {"ok": True, "id": 7}
    sql, params = cliente.log[0]
    assert "INSERT INTO solicitudes_acceso" in sql
    assert "ana@correo.com" in params and "valor" in params and 95 in params


def test_sin_consentimiento_no_se_guarda_nada(cliente):
    r = cliente.post("/api/diagnostico", json=BUENA | {"consentimiento": False})
    assert r.status_code == 400 and "autorización" in r.json()["detail"]
    assert cliente.log == []


@pytest.mark.parametrize("campo,valor,mensaje", [
    ("correo", "ana-sin-arroba", "correo"),
    ("whatsapp", "300-12", "WhatsApp"),
])
def test_contacto_mal_escrito_se_rechaza_en_espanol(cliente, campo, valor, mensaje):
    r = cliente.post("/api/diagnostico", json=BUENA | {"contacto": BUENA["contacto"] | {campo: valor}})
    assert r.status_code == 422
    assert mensaje in str(r.json()["detail"])
    assert cliente.log == []


def test_sin_la_tabla_responde_503_y_no_un_500(cliente, monkeypatch):
    monkeypatch.setattr(diagnostico, "tabla_existe", lambda t: False)
    r = cliente.post("/api/diagnostico", json=BUENA)
    assert r.status_code == 503 and "Escríbenos" in r.json()["detail"]


def test_un_resultado_inflado_se_corta(cliente):
    r = cliente.post("/api/diagnostico", json=BUENA | {"resultado": {"perfil": "valor", "relleno": "x" * 30_000}})
    assert r.status_code == 413
    assert cliente.log == []


def test_la_compatibilidad_se_acota_a_0_100():
    assert diagnostico._entero(250) == 100 and diagnostico._entero(-5) == 0 and diagnostico._entero("x") is None


def test_el_listado_del_equipo_exige_sesion(cliente):
    assert cliente.get("/api/admin/diagnostico").status_code == 401
