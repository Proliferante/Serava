"""
tests/test_auth.py
==================
Prueba de humo de la sesión y los permisos.

    cd backend
    python -m pytest tests -q

QUÉ SE PRUEBA Y QUÉ NO
    Se prueba lo que puede estar mal cableado y no se ve al arrancar: que un
    endpoint protegido rechace sin token, que el token de un rol no abra los
    endpoints de otro, que el login devuelva 401 con el mensaje genérico, y
    que hashear/verificar y firmar/leer un token cierren el círculo.

    NO se prueba el SQL contra Postgres: la capa de datos se sustituye por un
    diccionario en memoria. Las consultas usan cosas propias de Postgres
    (RETURNING, ON CONFLICT, índice sobre lower(correo)) que sólo se pueden
    verificar contra la base real; eso queda comprobado al correr el script
    de siembra contra Supabase.
"""

import warnings

warnings.filterwarnings("ignore")

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.api import auth as api_auth
from app.core import security
from app.services import auth_service as svc


# ---------------------------------------------------------------------------
# Base simulada: un diccionario de usuarios por id
# ---------------------------------------------------------------------------

def _usuario(uid, correo, rol, clave="claveSegura1", activo=True, cambiar=False):
    return {
        "id": uid, "nombre": f"Usuario {uid}", "correo": correo, "rol": rol,
        "activo": activo, "debe_cambiar_clave": cambiar,
        "creado_en": None, "ultimo_acceso": None,
        "clave_hash": security.hashear(clave),
    }


@pytest.fixture
def base(monkeypatch):
    usuarios = {
        1: _usuario(1, "paola.a@proliferante.com", "admin"),
        2: _usuario(2, "christian.mejia@zequara.com", "arquitectura"),
        3: _usuario(3, "baja@proliferante.com", "data", activo=False),
    }

    def por_id(uid):
        u = usuarios.get(int(uid))
        if not u:
            return None
        return {k: v for k, v in u.items() if k != "clave_hash"}

    def por_correo(correo):
        c = svc.normalizar_correo(correo)
        for u in usuarios.values():
            if u["correo"] == c:
                return dict(u)
        return None

    def autenticar(correo, clave):
        u = por_correo(correo)
        if not u or not security.verificar(clave, u["clave_hash"]):
            raise svc.ErrorAuth("Correo o contraseña incorrectos.")
        if not u["activo"]:
            raise svc.ErrorAuth("Esta cuenta está desactivada. Habla con un administrador.")
        u.pop("clave_hash")
        return u

    monkeypatch.setattr(svc, "por_id", por_id)
    monkeypatch.setattr(svc, "por_correo", por_correo)
    monkeypatch.setattr(svc, "autenticar", autenticar)
    monkeypatch.setattr(svc, "listar", lambda: [por_id(i) for i in usuarios])
    monkeypatch.setattr(api_auth.svc, "por_id", por_id)
    monkeypatch.setattr(api_auth.svc, "autenticar", autenticar)
    monkeypatch.setattr(api_auth.svc, "listar", lambda: [por_id(i) for i in usuarios])
    return usuarios


@pytest.fixture
def cliente(base):
    """App con sólo el router de auth y un endpoint de prueba por rol.

    No se monta `app.main` a propósito: importarla arrastra todo el pipeline
    (pandas, scipy, shapely) y aquí no hace falta.
    """
    app = FastAPI()
    app.include_router(api_auth.router, prefix="/api/auth")

    @app.get("/solo-sesion")
    def solo_sesion(u: dict = Depends(api_auth.usuario_actual)):
        return {"rol": u["rol"]}

    @app.get("/solo-arquitectura")
    def solo_arq(u: dict = Depends(api_auth.exige_rol("arquitectura"))):
        return {"ok": True}

    return TestClient(app)


def _token(cliente, correo, clave="claveSegura1"):
    r = cliente.post("/api/auth/login", json={"correo": correo, "clave": clave})
    assert r.status_code == 200, r.text
    return r.json()["token"]


def cab(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Contraseñas y tokens
# ---------------------------------------------------------------------------

def test_hash_no_es_la_clave_y_verifica():
    h = security.hashear("claveSegura1")
    assert h != "claveSegura1"
    assert security.verificar("claveSegura1", h)
    assert not security.verificar("otra", h)


def test_verificar_no_lanza_con_hash_invalido():
    """Un registro corrupto en la base debe impedir entrar a ese usuario,
    no tumbar el login de todos."""
    assert security.verificar("x", "") is False
    assert security.verificar("x", "no-es-un-hash") is False


def test_token_cierra_el_circulo():
    t = security.crear_token(7, "a@b.com", "admin")
    carga = security.leer_token(t)
    assert carga["sub"] == "7"
    assert carga["rol"] == "admin"
    assert security.leer_token("basura.no.valida") is None


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_correcto_devuelve_token_sin_hash(cliente):
    r = cliente.post("/api/auth/login",
                     json={"correo": "paola.a@proliferante.com", "clave": "claveSegura1"})
    assert r.status_code == 200
    d = r.json()
    assert d["usuario"]["rol"] == "admin"
    # La contraseña no puede salir en ninguna forma.
    assert "clave_hash" not in d["usuario"]
    assert "claveSegura1" not in r.text


def test_login_no_distingue_correo_inexistente_de_clave_mala(cliente):
    a = cliente.post("/api/auth/login", json={"correo": "nadie@x.com", "clave": "claveSegura1"})
    b = cliente.post("/api/auth/login",
                     json={"correo": "paola.a@proliferante.com", "clave": "equivocada"})
    assert a.status_code == b.status_code == 401
    assert a.json()["detail"] == b.json()["detail"]


def test_correo_no_distingue_mayusculas(cliente):
    """"Nati.C@..." y "nati.c@..." son la misma persona."""
    r = cliente.post("/api/auth/login",
                     json={"correo": "  PAOLA.A@Proliferante.COM ", "clave": "claveSegura1"})
    assert r.status_code == 200


def test_cuenta_desactivada_no_entra(cliente):
    r = cliente.post("/api/auth/login",
                     json={"correo": "baja@proliferante.com", "clave": "claveSegura1"})
    assert r.status_code == 401
    assert "desactivada" in r.json()["detail"]


# ---------------------------------------------------------------------------
# Protección de endpoints
# ---------------------------------------------------------------------------

def test_sin_token_no_pasa(cliente):
    assert cliente.get("/solo-sesion").status_code == 401


def test_token_basura_no_pasa(cliente):
    assert cliente.get("/solo-sesion", headers=cab("basura")).status_code == 401


def test_encabezado_mal_formado_no_pasa(cliente):
    r = cliente.get("/solo-sesion", headers={"Authorization": _token(cliente, "paola.a@proliferante.com")})
    assert r.status_code == 401   # falta el "Bearer "


def test_con_token_pasa(cliente):
    t = _token(cliente, "paola.a@proliferante.com")
    r = cliente.get("/solo-sesion", headers=cab(t))
    assert r.status_code == 200 and r.json()["rol"] == "admin"


def test_rol_equivocado_da_403(cliente):
    """Un admin no entra a lo de arquitectura: el rol no es una jerarquía."""
    t = _token(cliente, "paola.a@proliferante.com")
    assert cliente.get("/solo-arquitectura", headers=cab(t)).status_code == 403

    t2 = _token(cliente, "christian.mejia@zequara.com")
    assert cliente.get("/solo-arquitectura", headers=cab(t2)).status_code == 200


def test_usuarios_es_solo_de_admin(cliente):
    assert cliente.get("/api/auth/usuarios",
                       headers=cab(_token(cliente, "christian.mejia@zequara.com"))).status_code == 403
    assert cliente.get("/api/auth/usuarios",
                       headers=cab(_token(cliente, "paola.a@proliferante.com"))).status_code == 200


def test_desactivado_despues_de_entrar_queda_fuera(cliente, base):
    """El token sigue siendo válido, pero la cuenta ya no: se comprueba
    contra la base en cada petición, no sólo al firmar."""
    t = _token(cliente, "paola.a@proliferante.com")
    assert cliente.get("/solo-sesion", headers=cab(t)).status_code == 200

    base[1]["activo"] = False
    assert cliente.get("/solo-sesion", headers=cab(t)).status_code == 403


def test_yo_devuelve_al_usuario(cliente):
    t = _token(cliente, "christian.mejia@zequara.com")
    r = cliente.get("/api/auth/yo", headers=cab(t))
    assert r.status_code == 200
    assert r.json()["correo"] == "christian.mejia@zequara.com"
    assert "clave_hash" not in r.json()


# ---------------------------------------------------------------------------
# Validaciones del servicio
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("rol", ["superadmin", "", "ARQUITECTURA", "arq"])
def test_crear_rechaza_rol_invalido(base, rol):
    with pytest.raises(svc.ErrorAuth, match="Rol inválido"):
        svc.crear("X", "x@y.com", rol, "claveSegura1")


def test_crear_rechaza_clave_corta(base):
    with pytest.raises(svc.ErrorAuth, match="al menos 8"):
        svc.crear("X", "x@y.com", "data", "corta")


def test_crear_rechaza_correo_repetido(base):
    with pytest.raises(svc.ErrorAuth, match="Ya existe"):
        svc.crear("X", "PAOLA.A@proliferante.com", "data", "claveSegura1")


def test_crear_rechaza_correo_sin_arroba(base):
    with pytest.raises(svc.ErrorAuth, match="Correo inválido"):
        svc.crear("X", "sin-arroba", "data", "claveSegura1")
