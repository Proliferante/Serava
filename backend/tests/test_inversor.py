"""
tests/test_inversor.py
======================
La sesión del portafolio (api/inversor.py) y la barrera con la consola.

Hoy el portafolio entra con las cuentas del equipo, así que lo que más
importa probar es que las dos sesiones no se puedan intercambiar: la del
portafolio no abre la consola y la de la consola no abre el portafolio.
"""

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.api import auth as api_auth
from app.api import inversor as api_inv
from app.core import sesiones
from tests.test_auth import CLAVE_BUENA, base  # noqa: F401  (fixture)


def _cliente(base, monkeypatch):  # noqa: F811
    for nombre in ("disponible", "crear", "validar", "revocar"):
        monkeypatch.setattr(api_inv.sesiones, nombre, getattr(sesiones, nombre))
    monkeypatch.setattr(api_inv.svc, "autenticar", api_auth.svc.autenticar)
    monkeypatch.setattr(api_inv.bitacora, "anotar", lambda *a, **k: None)
    monkeypatch.setattr(api_inv.intentos, "registrar", lambda *a, **k: None)
    monkeypatch.setattr(api_inv.intentos, "bloqueado", lambda *a, **k: None)

    app = FastAPI()
    app.include_router(api_auth.router, prefix="/api/auth")
    app.include_router(api_inv.router, prefix="/api/inversor")

    @app.get("/portafolio")
    def portafolio(u: dict = Depends(api_inv.inversor_actual)):
        return {"ok": True}

    @app.get("/consola")
    def consola(u: dict = Depends(api_auth.usuario_actual)):
        return {"ok": True}

    return TestClient(app)


def test_entrar_pone_su_cookie_y_abre_el_portafolio(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    r = c.post("/api/inversor/login", json={"correo": "paola.a@proliferante.com", "clave": CLAVE_BUENA})
    assert r.status_code == 200
    galleta = r.headers["set-cookie"]
    assert galleta.startswith("zq_inversor=")
    assert "HttpOnly" in galleta and "SameSite=strict" in galleta
    # Lo justo para saludar: ni rol ni id.
    assert set(r.json()) == {"nombre", "horas"}
    assert c.get("/portafolio").status_code == 200


def test_la_sesion_del_portafolio_no_abre_la_consola(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    c.post("/api/inversor/login", json={"correo": "paola.a@proliferante.com", "clave": CLAVE_BUENA})
    sid = c.cookies.get("zq_inversor")
    c.cookies.clear()
    # Ni con su cookie, ni copiando el identificador a la de la consola.
    assert c.get("/consola", cookies={"zq_inversor": sid}).status_code == 401
    assert c.get("/consola", cookies={"zq_sesion": sid}).status_code == 401


def test_la_sesion_de_la_consola_no_abre_el_portafolio(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    c.post("/api/auth/login", json={"correo": "paola.a@proliferante.com", "clave": CLAVE_BUENA})
    sid = c.cookies.get("zq_sesion")
    c.cookies.clear()
    assert c.get("/portafolio", cookies={"zq_sesion": sid}).status_code == 401
    assert c.get("/portafolio", cookies={"zq_inversor": sid}).status_code == 401


def test_sin_sesion_no_hay_portafolio(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    assert c.get("/portafolio").status_code == 401
    assert c.get("/api/inversor/yo").status_code == 401


def test_clave_mala_da_el_mensaje_generico(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    r = c.post("/api/inversor/login", json={"correo": "paola.a@proliferante.com", "clave": "otra-cualquiera-1"})
    assert r.status_code == 401
    assert r.json()["detail"] == "Correo o contraseña incorrectos."
    assert "zq_inversor" not in c.cookies


def test_salir_cierra_de_verdad(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    c.post("/api/inversor/login", json={"correo": "paola.a@proliferante.com", "clave": CLAVE_BUENA})
    sid = c.cookies.get("zq_inversor")
    assert c.post("/api/inversor/salir").status_code == 200
    # Aunque alguien se hubiera guardado el identificador, ya no sirve.
    assert c.get("/portafolio", cookies={"zq_inversor": sid}).status_code == 401


def test_cuenta_desactivada_no_entra(base, monkeypatch):  # noqa: F811
    c = _cliente(base, monkeypatch)
    r = c.post("/api/inversor/login", json={"correo": "baja@proliferante.com", "clave": CLAVE_BUENA})
    assert r.status_code == 401
