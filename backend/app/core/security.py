"""
core/security.py
================
Contraseñas. Es la única parte del backend donde se manejan credenciales, así
que aquí van todas las decisiones al respecto.

CONTRASEÑAS
    bcrypt, vía passlib. La contraseña en claro no se guarda, no se
    registra en la bitácora y no se devuelve en ninguna respuesta: sólo
    entra a `hashear()` y a `verificar()`.

    `verificar()` devuelve False ante cualquier hash corrupto o vacío en
    vez de lanzar. Un registro mal escrito en la tabla debe impedir entrar
    a ese usuario, no tumbar el endpoint de login para todos.

NO HAY TOKENS
    Hubo un JWT firmado, y se fue con razón. Un token firmado no se puede
    retirar: mientras no caduque, sirve, y con él el rol que llevaba dentro.
    La sesión es hoy un identificador al azar con su estado en la tabla
    `sesiones` (ver core/sesiones.py), así que cerrar sesión cierra de verdad,
    desactivar a alguien lo echa en la siguiente petición, y un cambio de rol
    tiene efecto ya.

    Las funciones `crear_token()` y `leer_token()` sobrevivieron sin que nadie
    las llamara hasta que esta limpieza las quitó. Con ellas se fue la
    dependencia de `python-jose` —y su `cryptography`, que son 40 MB de
    imagen— y el aviso de arranque por un `JWT_SECRET` que ya no servía para
    nada.

"""

from passlib.context import CryptContext

# bcrypt con el coste por defecto de passlib, que hoy son 12 rondas: unos
# 300 ms por comprobación en este servidor. Es lento a propósito —es lo que
# hace caro probar contraseñas a lo bruto— y sigue siendo imperceptible para
# quien entra una vez al día.
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
