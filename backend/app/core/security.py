"""
core/security.py
================
Contraseñas y tokens de sesión. Es la única parte del backend donde se
manejan credenciales, así que aquí van todas las decisiones al respecto.

CONTRASEÑAS
    bcrypt, vía passlib. La contraseña en claro no se guarda, no se
    registra en la bitácora y no se devuelve en ninguna respuesta: sólo
    entra a `hashear()` y a `verificar()`.

    `verificar()` devuelve False ante cualquier hash corrupto o vacío en
    vez de lanzar. Un registro mal escrito en la tabla debe impedir entrar
    a ese usuario, no tumbar el endpoint de login para todos.

TOKENS
    JWT firmado con HS256 y el secreto de `config`. Lleva dentro el id, el
    correo y el rol, de modo que autorizar por rol no necesita ir a la base
    en cada petición.

    El precio de eso es que un cambio de rol no tiene efecto hasta que la
    sesión caduca. Es aceptable con sesiones de 12 horas y un equipo de
    seis personas; si algún día hay que revocar al instante, la respuesta
    no es alargar el token sino guardar las sesiones en tabla.

    `activo` sí se comprueba contra la base en cada petición (ver
    `usuario_actual` en api/auth.py): desactivar a alguien tiene que
    echarlo ya, no en doce horas.
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core import config

_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear(clave: str) -> str:
    return _ctx.hash(clave)


def verificar(clave: str, hash_guardado: str) -> bool:
    if not clave or not hash_guardado:
        return False
    try:
        return _ctx.verify(clave, hash_guardado)
    except Exception:
        # Hash con formato inválido en la base. No es motivo para un 500.
        return False


def crear_token(usuario_id: int, correo: str, rol: str) -> str:
    ahora = datetime.now(timezone.utc)
    carga = {
        "sub": str(usuario_id),
        "correo": correo,
        "rol": rol,
        "iat": ahora,
        "exp": ahora + timedelta(hours=config.JWT_HORAS),
    }
    return jwt.encode(carga, config.JWT_SECRET, algorithm=config.JWT_ALGORITMO)


def leer_token(token: str) -> dict | None:
    """Devuelve la carga del token, o None si es inválido o caducó."""
    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITMO])
    except JWTError:
        return None
