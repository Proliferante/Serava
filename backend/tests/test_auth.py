"""
tests/test_auth.py
==================
Prueba de humo de la sesión y los permisos.

    cd backend
    python -m pytest tests -q

QUÉ SE PRUEBA Y QUÉ NO
    Se prueba lo que puede estar mal cableado y no se ve al arrancar: que un
    endpoint protegido rechace sin sesión, que la sesión de un rol no abra los
    endpoints de otro, que el login devuelva 401 con el mensaje genérico, que
    la cookie salga con sus tres marcas, y que la política de contraseñas
    rechace lo que tiene que rechazar.

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
from app.core import security, sesiones
from app.services import auth_service as svc


# Cumple la política: doce o más, no está en la lista de obvias y no contiene
# el nombre ni el correo de ninguno de los usuarios de prueba.
CLAVE_BUENA = "MareaAlta-6621"


# ---------------------------------------------------------------------------
# Base simulada: usuarios y sesiones, las dos en memoria
# ---------------------------------------------------------------------------

def _usuario(uid, correo, rol, clave=CLAVE_BUENA, activo=True, cambiar=False):
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

    def cambiar_clave(usuario_id, actual, nueva, correo="", nombre=""):
        """La de verdad, pero contra el diccionario. Se conserva lo que importa
        probar: que valide la política y que exija la contraseña actual."""
        svc.validar_clave(nueva, correo, nombre)
        u = usuarios[int(usuario_id)]
        if not security.verificar(actual, u["clave_hash"]):
            raise svc.ErrorAuth("La contraseña actual no es correcta.")
        u["clave_hash"] = security.hashear(nueva)
        u["debe_cambiar_clave"] = False

    monkeypatch.setattr(svc, "cambiar_clave", cambiar_clave)
    monkeypatch.setattr(api_auth.svc, "cambiar_clave", cambiar_clave)

    # Sesiones en memoria: {id: usuario_id}. Reproduce lo que hace la tabla
    # sin necesitar Postgres.
    abiertas: dict[str, int] = {}
    contador = {"n": 0}

    def crear(usuario_id, ip=None, agente=None):
        contador["n"] += 1
        sid = f"sesion-{contador['n']}"
        abiertas[sid] = usuario_id
        return sid

    def validar(sid):
        """Devuelve el usuario, no su id: `validar` trae los dos en un JOIN
        para no gastar dos viajes a la base por petición."""
        uid = abiertas.get(sid) if sid else None
        return por_id(uid) if uid else None

    def revocar(sid):
        abiertas.pop(sid, None)

    def revocar_todas(usuario_id, excepto=None):
        fuera = [k for k, v in abiertas.items() if v == usuario_id and k != excepto]
        for k in fuera:
            abiertas.pop(k)
        return len(fuera)

    monkeypatch.setattr(sesiones, "disponible", lambda: True)
    monkeypatch.setattr(sesiones, "crear", crear)
    monkeypatch.setattr(sesiones, "validar", validar)
    monkeypatch.setattr(sesiones, "revocar", revocar)
    monkeypatch.setattr(sesiones, "revocar_todas", revocar_todas)
    monkeypatch.setattr(sesiones, "activas", lambda uid: [])
    monkeypatch.setattr(api_auth.sesiones, "disponible", lambda: True)
    monkeypatch.setattr(api_auth.sesiones, "crear", crear)
    monkeypatch.setattr(api_auth.sesiones, "validar", validar)
    monkeypatch.setattr(api_auth.sesiones, "revocar", revocar)
    monkeypatch.setattr(api_auth.sesiones, "revocar_todas", revocar_todas)

    # Ni bitácora ni freno tocan la base en las pruebas.
    monkeypatch.setattr(api_auth.bitacora, "anotar", lambda *a, **k: None)
    monkeypatch.setattr(api_auth.intentos, "registrar", lambda *a, **k: None)
    monkeypatch.setattr(api_auth.intentos, "bloqueado", lambda *a, **k: None)

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


def entrar(cliente, correo, clave=CLAVE_BUENA):
    """Entra y deja la cookie puesta en el cliente. `TestClient` la conserva."""
    r = cliente.post("/api/auth/login", json={"correo": correo, "clave": clave})
    assert r.status_code == 200, r.text
    return r


def salir(cliente):
    cliente.cookies.clear()


# ---------------------------------------------------------------------------
# Contraseñas y política
# ---------------------------------------------------------------------------

def test_hash_no_es_la_clave_y_verifica():
    h = security.hashear(CLAVE_BUENA)
    assert h != CLAVE_BUENA
    assert security.verificar(CLAVE_BUENA, h)
    assert not security.verificar("otra", h)


def test_verificar_no_lanza_con_hash_invalido():
    """Un registro corrupto en la base debe impedir entrar a ese usuario,
    no tumbar el login de todos."""
    assert security.verificar("x", "") is False
    assert security.verificar("x", "no-es-un-hash") is False


@pytest.mark.parametrize("mala", [
    "corta1",              # no llega al mínimo
    "contrasena",          # está en la lista de obvias
    "Zequara2026!",        # obvia con año y signo pegados detrás
    "paola-2026-abcd",     # lleva dentro la parte local del correo
])
def test_politica_rechaza(mala):
    with pytest.raises(svc.ErrorAuth):
        svc.validar_clave(mala, correo="paola.a@proliferante.com", nombre="Paola A.")


def test_politica_acepta_una_razonable():
    svc.validar_clave(CLAVE_BUENA, correo="paola.a@proliferante.com", nombre="Paola A.")


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

def test_login_pone_la_cookie_y_no_devuelve_la_sesion(cliente):
    r = cliente.post("/api/auth/login",
                     json={"correo": "paola.a@proliferante.com", "clave": CLAVE_BUENA})
    assert r.status_code == 200
    d = r.json()
    assert d["usuario"]["rol"] == "admin"

    # Ni la contraseña ni la sesión pueden salir en el cuerpo: si la sesión
    # saliera, el JavaScript podría guardarla y la cookie HttpOnly no
    # serviría de nada.
    assert "clave_hash" not in d["usuario"]
    assert "token" not in d
    assert CLAVE_BUENA not in r.text

    galleta = r.headers.get("set-cookie", "").lower()
    assert "zq_sesion=" in galleta
    assert "httponly" in galleta
    assert "samesite=strict" in galleta.replace(" ", "")


def test_login_no_distingue_correo_inexistente_de_clave_mala(cliente):
    a = cliente.post("/api/auth/login", json={"correo": "nadie@x.com", "clave": CLAVE_BUENA})
    b = cliente.post("/api/auth/login",
                     json={"correo": "paola.a@proliferante.com", "clave": "equivocada"})
    assert a.status_code == b.status_code == 401
    assert a.json()["detail"] == b.json()["detail"]


def test_correo_no_distingue_mayusculas(cliente):
    """"Nati.C@..." y "nati.c@..." son la misma persona."""
    r = cliente.post("/api/auth/login",
                     json={"correo": "  PAOLA.A@Proliferante.COM ", "clave": CLAVE_BUENA})
    assert r.status_code == 200


def test_cuenta_desactivada_no_entra(cliente):
    r = cliente.post("/api/auth/login",
                     json={"correo": "baja@proliferante.com", "clave": CLAVE_BUENA})
    assert r.status_code == 401
    assert "desactivada" in r.json()["detail"]


# ---------------------------------------------------------------------------
# Protección de endpoints
# ---------------------------------------------------------------------------

def test_sin_sesion_no_pasa(cliente):
    assert cliente.get("/solo-sesion").status_code == 401


def test_cookie_basura_no_pasa(cliente):
    cliente.cookies.set("zq_sesion", "no-existe-esta-sesion")
    assert cliente.get("/solo-sesion").status_code == 401


def test_con_sesion_pasa(cliente):
    entrar(cliente, "paola.a@proliferante.com")
    r = cliente.get("/solo-sesion")
    assert r.status_code == 200 and r.json()["rol"] == "admin"


def test_rol_equivocado_da_403(cliente):
    """Un admin no entra a lo de arquitectura: el rol no es una jerarquía."""
    entrar(cliente, "paola.a@proliferante.com")
    assert cliente.get("/solo-arquitectura").status_code == 403

    salir(cliente)
    entrar(cliente, "christian.mejia@zequara.com")
    assert cliente.get("/solo-arquitectura").status_code == 200


def test_usuarios_es_solo_de_admin(cliente):
    entrar(cliente, "christian.mejia@zequara.com")
    assert cliente.get("/api/auth/usuarios").status_code == 403

    salir(cliente)
    entrar(cliente, "paola.a@proliferante.com")
    assert cliente.get("/api/auth/usuarios").status_code == 200


def test_desactivado_despues_de_entrar_queda_fuera(cliente, base):
    """La sesión sigue viva, pero la cuenta ya no: se comprueba contra la base
    en cada petición, no sólo al entrar."""
    entrar(cliente, "paola.a@proliferante.com")
    assert cliente.get("/solo-sesion").status_code == 200

    base[1]["activo"] = False
    assert cliente.get("/solo-sesion").status_code == 403


def test_salir_retira_la_sesion_de_verdad(cliente):
    """Lo que un JWT no podía hacer: tras salir, la misma cookie ya no vale."""
    entrar(cliente, "paola.a@proliferante.com")
    galleta = cliente.cookies.get("zq_sesion")
    assert cliente.post("/api/auth/salir").status_code == 200

    cliente.cookies.set("zq_sesion", galleta)
    assert cliente.get("/solo-sesion").status_code == 401


def test_cambiar_clave_cierra_las_demas_sesiones(cliente):
    """Quien cambia su contraseña suele hacerlo porque cree que se la vieron.
    Dejarle las otras sesiones abiertas haría el gesto inútil."""
    otro = TestClient(cliente.app)
    entrar(otro, "paola.a@proliferante.com")
    entrar(cliente, "paola.a@proliferante.com")

    r = cliente.post("/api/auth/cambiar-clave",
                     json={"clave_actual": CLAVE_BUENA, "clave_nueva": "OtraDistinta-4417"})
    assert r.status_code == 200
    assert r.json()["sesiones_cerradas"] == 1

    assert cliente.get("/solo-sesion").status_code == 200   # la que la cambió sigue
    assert otro.get("/solo-sesion").status_code == 401      # la otra, fuera


def test_yo_devuelve_al_usuario(cliente):
    entrar(cliente, "christian.mejia@zequara.com")
    r = cliente.get("/api/auth/yo")
    assert r.status_code == 200
    assert r.json()["correo"] == "christian.mejia@zequara.com"
    assert "clave_hash" not in r.json()
    # El identificador de la sesión tampoco sale.
    assert "_sesion" not in r.json()


# ---------------------------------------------------------------------------
# Validaciones del servicio
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("rol", ["superadmin", "", "ARQUITECTURA", "arq"])
def test_crear_rechaza_rol_invalido(base, rol):
    with pytest.raises(svc.ErrorAuth, match="Rol inválido"):
        svc.crear("X", "x@y.com", rol, CLAVE_BUENA)


def test_crear_rechaza_clave_corta(base):
    with pytest.raises(svc.ErrorAuth, match="al menos 12"):
        svc.crear("X", "x@y.com", "data", "corta")


def test_crear_rechaza_correo_repetido(base):
    with pytest.raises(svc.ErrorAuth, match="Ya existe"):
        svc.crear("X", "PAOLA.A@proliferante.com", "data", CLAVE_BUENA)


def test_crear_rechaza_correo_sin_arroba(base):
    with pytest.raises(svc.ErrorAuth, match="Correo inválido"):
        svc.crear("X", "sin-arroba", "data", CLAVE_BUENA)
