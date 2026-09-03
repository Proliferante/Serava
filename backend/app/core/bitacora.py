"""
core/bitacora.py
================
Registro de acciones sensibles: quién entró, quién creó o desactivó a quién,
quién cambió una contraseña.

No es para vigilar al equipo. Es para poder reconstruir qué pasó cuando algo
salga raro, que es justo cuando nadie recuerda nada. Un panel administrativo
sin esto sólo puede responder "no sé" a la pregunta de quién hizo el cambio.

QUÉ NO SE GUARDA
    Contraseñas, ni nuevas ni viejas ni intentadas. El detalle de una acción
    es un texto corto escrito por el código, nunca lo que tecleó nadie.

Nunca lanza: dejar constancia de una acción no puede ser el motivo de que la
acción falle. Si la tabla no está, se avisa una vez y se sigue.
"""

import logging

from app.core.database import escribir, tabla_existe

log = logging.getLogger("zequara.bitacora")

_avisado = False


def _hay_tabla() -> bool:
    global _avisado
    try:
        if tabla_existe("bitacora"):
            return True
    except Exception:
        return False
    if not _avisado:
        log.warning("No existe la tabla `bitacora`: las acciones no se registran. "
                    "Aplica database/seguridad.sql.")
        _avisado = True
    return False


def anotar(usuario: dict | None, accion: str, detalle: str = "", ip: str | None = None) -> None:
    if not _hay_tabla():
        return
    try:
        with escribir() as con:
            con.execute(
                "INSERT INTO bitacora (usuario_id, correo, accion, detalle, ip) "
                "VALUES (?, ?, ?, ?, ?)",
                ((usuario or {}).get("id"), (usuario or {}).get("correo"),
                 accion, detalle or None, ip),
            )
    except Exception as e:
        log.warning("No se pudo anotar en la bitácora (%s): %s", accion, e)
