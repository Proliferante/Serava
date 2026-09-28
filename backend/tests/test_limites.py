"""
tests/test_limites.py
=====================
Los frenos de core/limites.py: firma del frontend, tamaño del cuerpo y
peticiones por minuto.

    cd backend
    python -m pytest tests/test_limites.py -q

Se monta una app mínima con el middleware delante, en vez de la de main.py,
para no depender de la base: lo que se prueba es el middleware, y los
endpoints de verdad sólo le añadirían consultas a Supabase.
"""

import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.core import config, intentos, limites

SECRETO = "secreto-de-prueba"


class Cuerpo(BaseModel):
    texto: str


def _app() -> FastAPI:
    app = FastAPI()

    @app.get("/api/salud")
    def salud():
        return {"ok": True}

    @app.get("/api/predios")
    def predios(peticion: Request):
        return {"ip": intentos.ip_de(peticion)}

    @app.post("/api/auth/login")
    def login(c: Cuerpo):
        return {"ok": True}

    @app.post("/api/admin/flujo/decidir")
    def decidir(c: Cuerpo):
        return {"ok": True}

    app.add_middleware(limites.Frenos)
    return app


@pytest.fixture
def cliente(monkeypatch):
    monkeypatch.setattr(config, "PROXY_SECRETO", "")
    limites.contador.vaciar()
    yield TestClient(_app())
    limites.contador.vaciar()


@pytest.fixture
def firmado(monkeypatch):
    monkeypatch.setattr(config, "PROXY_SECRETO", SECRETO)
    limites.contador.vaciar()
    yield TestClient(_app())
    limites.contador.vaciar()


# ---------------------------------------------------------------------------
# Tamaño
# ---------------------------------------------------------------------------

def test_cuerpo_declarado_grande_se_corta(cliente):
    r = cliente.post("/api/auth/login", content=b"x" * (limites.CUERPO_MAXIMO + 1),
                     headers={"content-type": "application/json"})
    assert r.status_code == 413


def test_cuerpo_por_trozos_que_miente_se_corta(cliente):
    # Sin Content-Length: el cliente lo manda a trozos. Tiene que saltar por
    # el contador, y con 413 —no el 400 genérico con que FastAPI envuelve
    # cualquier error al leer el cuerpo—.
    def trozos():
        for _ in range(20):
            yield b"x" * 100_000
    r = cliente.post("/api/auth/login", content=trozos(),
                     headers={"content-type": "application/json"})
    assert r.status_code == 413


def test_cuerpo_normal_pasa(cliente):
    assert cliente.post("/api/auth/login", json={"texto": "hola"}).status_code == 200


# ---------------------------------------------------------------------------
# Frecuencia
# ---------------------------------------------------------------------------

def test_lectura_publica_tiene_tope(cliente):
    for _ in range(limites.PUBLICO.peticiones):
        assert cliente.get("/api/predios").status_code == 200
    r = cliente.get("/api/predios")
    assert r.status_code == 429
    assert int(r.headers["retry-after"]) >= 1


def test_login_tiene_tope_propio_y_corto(cliente):
    for _ in range(limites.LOGIN.peticiones):
        assert cliente.post("/api/auth/login", json={"texto": "x"}).status_code == 200
    assert cliente.post("/api/auth/login", json={"texto": "x"}).status_code == 429
    # Frenar el login no frena el resto del sitio.
    assert cliente.get("/api/predios").status_code == 200


def test_la_salud_no_se_frena(cliente):
    for _ in range(limites.PUBLICO.peticiones + 5):
        assert cliente.get("/api/salud").status_code == 200


def test_escritura_se_cuenta_por_sesion(cliente):
    a, b = {"cookie": "zq_sesion=aaa"}, {"cookie": "zq_sesion=bbb"}
    for _ in range(limites.ESCRITURA.peticiones):
        cliente.post("/api/admin/flujo/decidir", json={"texto": "x"}, headers=a)
    assert cliente.post("/api/admin/flujo/decidir", json={"texto": "x"}, headers=a).status_code == 429
    # Otra sesión, aunque sea desde la misma IP, tiene su propia cubeta.
    assert cliente.post("/api/admin/flujo/decidir", json={"texto": "x"}, headers=b).status_code == 200


def test_estrenar_cookies_no_esquiva_el_techo_por_ip(cliente, monkeypatch):
    monkeypatch.setattr(limites, "TECHO_IP", limites.Tope("ip", 5, 60))
    for i in range(5):
        cliente.get("/api/predios", headers={"cookie": f"zq_sesion=falsa{i}"})
    assert cliente.get("/api/predios", headers={"cookie": "zq_sesion=otra"}).status_code == 429


# ---------------------------------------------------------------------------
# Firma del frontend e IP real
# ---------------------------------------------------------------------------

def test_sin_firma_no_entra(firmado):
    assert firmado.get("/api/predios").status_code == 404
    assert firmado.get("/api/predios", headers={"x-zq-proxy": "otra"}).status_code == 404


def test_con_firma_entra_y_la_salud_no_la_pide(firmado):
    assert firmado.get("/api/predios", headers={"x-zq-proxy": SECRETO}).status_code == 200
    assert firmado.get("/api/salud").status_code == 200


def test_la_ip_firmada_es_la_que_cuenta(firmado):
    r = firmado.get("/api/predios", headers={"x-zq-proxy": SECRETO, "x-zq-cliente": "198.51.100.7"})
    assert r.json()["ip"] == "198.51.100.7"


def test_sin_secreto_no_se_cree_la_ip_inventada(cliente):
    r = cliente.get("/api/predios", headers={"x-zq-cliente": "198.51.100.7"})
    assert r.json()["ip"] != "198.51.100.7"


def test_cada_visitante_tiene_su_cubeta(firmado):
    uno = {"x-zq-proxy": SECRETO, "x-zq-cliente": "198.51.100.1"}
    dos = {"x-zq-proxy": SECRETO, "x-zq-cliente": "198.51.100.2"}
    for _ in range(limites.PUBLICO.peticiones):
        firmado.get("/api/predios", headers=uno)
    assert firmado.get("/api/predios", headers=uno).status_code == 429
    # Que alguien se pase no deja fuera al resto: es justo lo que pasaba
    # cuando todos parecían la IP de Vercel.
    assert firmado.get("/api/predios", headers=dos).status_code == 200


def test_fetch_de_servidor_va_a_su_cubeta(firmado):
    srv = {"x-zq-proxy": SECRETO}
    for _ in range(limites.PUBLICO.peticiones + 10):
        assert firmado.get("/api/predios", headers=srv).status_code == 200
