"""
core/intentos.py
================
Registro de intentos de entrada y freno a la fuerza bruta.

POR QUÉ HACE FALTA
    Sin esto, `POST /api/auth/login` acepta intentos ilimitados. Con seis
    cuentas cuyos correos son conocidos, probar contraseñas hasta acertar es
    cuestión de dejar un script corriendo. Es el agujero más barato de
    explotar que tiene un backend con login.

CÓMO FRENA
    Se cuentan los fallos recientes por dos vías, y basta que una se pase:

      · por correo — 5 fallos en 15 minutos bloquean ESA cuenta 15 minutos.
        Protege al usuario cuyo correo alguien está atacando.
      · por IP — 20 fallos en 15 minutos bloquean ESA dirección. Protege
        contra quien recorre muchos correos desde el mismo sitio, que por
        cuenta nunca llegaría a 5.

    El bloqueo es por ventana de tiempo, no un estado guardado: no hay que
    "desbloquear" nada a mano, y no se puede dejar a alguien fuera para
    siempre por error. Un acierto limpia los fallos de esa cuenta, así que
    quien se equivoca cuatro veces y acierta a la quinta no arrastra nada.

QUÉ NO SE GUARDA
    La contraseña probada, nunca — ni en los fallos. Un registro de
    contraseñas equivocadas es sobre todo un registro de las contraseñas de
    otras cuentas, escritas por error en el sitio equivocado.

SI LA TABLA NO EXISTE
    Todo esto degrada a "no frenar y no registrar" en vez de romper el login.
    Es una decisión: `database/seguridad.sql` puede no haberse aplicado
    todavía en un entorno recién montado, y quedarse sin poder entrar sería
    peor que quedarse sin el freno. Se avisa en la bitácora.
"""

import logging
from datetime import datetime, timedelta, timezone

from app.core.database import cursor, escribir, tabla_existe

log = logging.getLogger("zequara.intentos")

# Ventana en la que se cuentan los fallos, y los topes de cada vía.
VENTANA = timedelta(minutes=15)
TOPE_CORREO = 5
TOPE_IP = 20

_avisado = False


def _hay_tabla() -> bool:
    global _avisado
    try:
        if tabla_existe("intentos_acceso"):
            return True
    except Exception:
        return False
    if not _avisado:
        log.warning(
            "No existe la tabla `intentos_acceso`: el login funciona pero sin "
            "freno a la fuerza bruta ni registro. Aplica database/seguridad.sql."
        )
        _avisado = True
    return False


def registrar(correo: str | None, ip: str | None, exito: bool, motivo: str = "") -> None:
    """Deja constancia del intento. Nunca lanza: registrar no puede impedir entrar."""
    if not _hay_tabla():
        return
    try:
        with escribir() as con:
            con.execute(
                "INSERT INTO intentos_acceso (correo, ip, exito, motivo) VALUES (?, ?, ?, ?)",
                ((correo or "").strip().lower() or None, ip, exito, motivo or None),
            )
            # Un acierto borra los fallos previos de esa cuenta: si alguien se
            # equivocó cuatro veces y a la quinta entró, no debe quedar a un
            # fallo de bloquearse mañana.
            if exito and correo:
                con.execute(
                    "DELETE FROM intentos_acceso WHERE lower(correo) = ? AND exito = FALSE",
                    ((correo or "").strip().lower(),),
                )
    except Exception as e:
        log.warning("No se pudo registrar el intento de acceso: %s", e)


def bloqueado(correo: str | None, ip: str | None) -> str | None:
    """Devuelve el motivo del bloqueo, o None si puede intentar.

    Ante cualquier problema devuelve None —deja pasar—: un fallo al consultar
    la tabla no puede dejar al equipo fuera de su propia consola.
    """
    if not _hay_tabla():
        return None

    desde = datetime.now(timezone.utc) - VENTANA
    try:
        with cursor() as con:
            if correo:
                n = con.execute(
                    "SELECT count(*) AS n FROM intentos_acceso "
                    "WHERE lower(correo) = ? AND exito = FALSE AND momento > ?",
                    ((correo or "").strip().lower(), desde),
                ).fetchone()["n"]
                if n >= TOPE_CORREO:
                    return (f"Demasiados intentos fallidos con este correo. "
                            f"Espera {VENTANA.seconds // 60} minutos y vuelve a probar.")
            if ip:
                n = con.execute(
                    "SELECT count(*) AS n FROM intentos_acceso "
                    "WHERE ip = ? AND exito = FALSE AND momento > ?",
                    (ip, desde),
                ).fetchone()["n"]
                if n >= TOPE_IP:
                    return (f"Demasiados intentos fallidos desde esta conexión. "
                            f"Espera {VENTANA.seconds // 60} minutos y vuelve a probar.")
    except Exception as e:
        log.warning("No se pudo consultar los intentos de acceso: %s", e)
        return None
    return None


def ip_de(peticion) -> str | None:
    """La IP de quien llama, mirando primero el encabezado del proxy.

    En desarrollo la petición llega reescrita por Next, así que sin mirar
    `X-Forwarded-For` todas las peticiones parecerían venir de 127.0.0.1 y el
    tope por IP bloquearía a todo el equipo a la vez. Se toma la primera de la
    lista, que es el cliente original.

    OJO al desplegar: este encabezado lo puede poner cualquiera si el backend
    queda expuesto directamente. Sólo es de fiar detrás de un proxy que lo
    reescriba (Vercel, Nginx, Cloud Run lo hacen).
    """
    reenviada = (peticion.headers.get("x-forwarded-for") or "").split(",")[0].strip()
    if reenviada:
        return reenviada[:64]
    return getattr(getattr(peticion, "client", None), "host", None)
