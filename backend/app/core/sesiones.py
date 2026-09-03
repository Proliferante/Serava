"""
core/sesiones.py
================
Sesiones con estado en la base, y la cookie que las transporta.

POR QUÉ NO UN JWT
    Un JWT firmado no se puede retirar: mientras no caduque, sirve. Eso está
    mal en los tres casos que ocurren de verdad en un panel administrativo —
    cerrar sesión y que muera de verdad, cambiar la contraseña y que se caigan
    las sesiones abiertas, dar de baja a alguien y que salga ya—. Con la
    sesión en tabla, retirarla es un UPDATE.

POR QUÉ COOKIE Y NO `sessionStorage`
    El token que guarda JavaScript lo lee JavaScript, y por tanto lo lee
    cualquier script inyectado. Una cookie `HttpOnly` no la puede leer el
    JavaScript de la página: un XSS podría hacer peticiones en nombre del
    usuario mientras la pestaña esté abierta, pero no llevarse la sesión para
    usarla desde otro sitio y otro día. Es la diferencia entre un problema y
    un desastre.

    Las tres marcas de la cookie hacen tres cosas distintas:
      · HttpOnly  — JavaScript no la ve.
      · SameSite  — el navegador no la manda en peticiones que salgan de otro
                    sitio. Es lo que cierra el CSRF de raíz.
      · Secure    — sólo viaja por HTTPS. Se activa con `COOKIE_SEGURA=1`; en
                    localhost va apagada porque si no, el navegador no la
                    manda por http y no se puede entrar.

DOS RELOJES
    `expira`           tope absoluto. Doce horas, se usen o no.
    `ultima_actividad` cierre por inactividad. Dos horas sin tocar nada y la
                       sesión se cae, aunque el tope absoluto esté lejos.
    Los dos hacen falta: sólo el absoluto deja una sesión viva doce horas en
    un portátil abandonado; sólo el de inactividad deja una sesión viva para
    siempre mientras alguien la use.
"""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from app.core import config
from app.core.database import cursor, escribir, tabla_existe

log = logging.getLogger("zequara.sesiones")

COOKIE = "zq_sesion"

# Tope absoluto y cierre por inactividad.
DURACION = timedelta(hours=config.JWT_HORAS)
INACTIVIDAD = timedelta(hours=2)


def _ahora():
    return datetime.now(timezone.utc)


def disponible() -> bool:
    """Si no existe la tabla, quien llama debe fallar de forma clara.

    Aquí no se degrada a "dejar pasar", al revés que en el registro de
    intentos: una sesión que no se puede comprobar no es una sesión.

    Los errores de CONEXIÓN se dejan subir a propósito. Antes se capturaba
    todo y se devolvía False, así que una base inalcanzable se presentaba como
    "el servidor no tiene la tabla de sesiones" — un mensaje que manda a
    aplicar un esquema que ya estaba aplicado. Ahora la excepción llega al
    manejador de `main.py`, que responde 503 diciendo lo que de verdad pasa:
    que no hay conexión.
    """
    return tabla_existe("sesiones")


def crear(usuario_id: int, ip: str | None, agente: str | None) -> str:
    """Abre una sesión y devuelve su identificador, que es lo que va en la cookie.

    32 bytes de `secrets.token_urlsafe` — no es adivinable, y de la cookie no
    se puede deducir ni quién es ni qué rol tiene.
    """
    sid = secrets.token_urlsafe(32)
    with escribir() as con:
        con.execute(
            "INSERT INTO sesiones (id, usuario_id, expira, ip, agente) VALUES (?, ?, ?, ?, ?)",
            (sid, usuario_id, _ahora() + DURACION, ip, (agente or "")[:200] or None),
        )
    return sid


# Lo que se devuelve del usuario al validar. Coincide con `CAMPOS` de
# auth_service, sin `clave_hash`: la sesión no necesita el hash para nada.
_CAMPOS_USUARIO = ("u.id, u.nombre, u.correo, u.rol, u.activo, "
                   "u.debe_cambiar_clave, u.creado_en, u.ultimo_acceso")


def validar(sid: str | None) -> dict | None:
    """Devuelve el usuario si la sesión sirve, o None.

    UNA sola consulta, no dos. Antes se leía la sesión aquí y el usuario
    aparte, en `auth_service.por_id`: dos viajes de ida y vuelta a Supabase
    por cada petición, y desde aquí cada viaje cuesta un cuarto de segundo.
    Como la sesión ya apunta al usuario, un JOIN los trae juntos.

    Refresca `ultima_actividad` de paso: es lo que hace que la sesión se
    mantenga mientras se trabaja y se caiga cuando no.
    """
    if not sid:
        return None
    ahora = _ahora()
    with cursor() as con:
        fila = con.execute(
            f"SELECT s.expira, s.ultima_actividad, s.revocada, {_CAMPOS_USUARIO} "
            "FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id WHERE s.id = ?",
            (sid,),
        ).fetchone()

    if not fila or fila["revocada"] is not None:
        return None
    if fila["expira"] <= ahora:
        return None
    if fila["ultima_actividad"] + INACTIVIDAD <= ahora:
        return None

    # No se escribe en cada petición: con seis personas dando clics, serían
    # muchas escrituras para mover el reloj unos segundos. Se refresca cuando
    # ya pasó un minuto desde la última.
    if fila["ultima_actividad"] + timedelta(minutes=1) < ahora:
        try:
            with escribir() as con:
                con.execute("UPDATE sesiones SET ultima_actividad = ? WHERE id = ?", (ahora, sid))
        except Exception as e:
            log.warning("No se pudo refrescar la sesión: %s", e)

    return {k: v for k, v in dict(fila).items()
            if k not in ("expira", "ultima_actividad", "revocada")}


def revocar(sid: str) -> None:
    with escribir() as con:
        con.execute("UPDATE sesiones SET revocada = ? WHERE id = ? AND revocada IS NULL",
                    (_ahora(), sid))


def revocar_todas(usuario_id: int, excepto: str | None = None) -> int:
    """Cierra todas las sesiones de alguien. Devuelve cuántas cerró.

    `excepto` deja viva la actual: al cambiar la contraseña se cierran las
    demás, pero no se echa a quien la está cambiando.
    """
    with escribir() as con:
        cur = con.execute(
            "UPDATE sesiones SET revocada = ? "
            "WHERE usuario_id = ? AND revocada IS NULL AND id <> COALESCE(?, '')",
            (_ahora(), usuario_id, excepto),
        )
        return cur.rowcount or 0


def activas(usuario_id: int) -> list[dict]:
    """Las sesiones abiertas de alguien, para poder enseñárselas."""
    ahora = _ahora()
    with cursor() as con:
        filas = con.execute(
            "SELECT id, creada, ultima_actividad, ip, agente FROM sesiones "
            "WHERE usuario_id = ? AND revocada IS NULL AND expira > ? "
            "AND ultima_actividad > ? ORDER BY ultima_actividad DESC",
            (usuario_id, ahora, ahora - INACTIVIDAD),
        ).fetchall()
    return [dict(f) for f in filas]


def limpiar() -> int:
    """Borra sesiones muertas. Se llama al arrancar; no hace falta más."""
    try:
        with escribir() as con:
            cur = con.execute(
                "DELETE FROM sesiones WHERE expira < ? OR revocada < ?",
                (_ahora(), _ahora() - timedelta(days=7)),
            )
            return cur.rowcount or 0
    except Exception as e:
        log.warning("No se pudieron limpiar las sesiones viejas: %s", e)
        return 0


# ---------------------------------------------------------------------------
# LA COOKIE
# ---------------------------------------------------------------------------

def poner_cookie(respuesta, sid: str) -> None:
    respuesta.set_cookie(
        key=COOKIE,
        value=sid,
        max_age=int(DURACION.total_seconds()),
        httponly=True,               # JavaScript no la ve
        samesite="strict",           # no viaja desde otro sitio: cierra el CSRF
        secure=config.COOKIE_SEGURA,  # sólo HTTPS (apagado en localhost)
        path="/",
    )


def quitar_cookie(respuesta) -> None:
    respuesta.delete_cookie(
        key=COOKIE, httponly=True, samesite="strict",
        secure=config.COOKIE_SEGURA, path="/",
    )
