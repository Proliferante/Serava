"""
services/auth_service.py
========================
Las operaciones sobre usuarios internos, separadas de los endpoints: aquí
está el qué, en api/auth.py el cómo se expone por HTTP. Así el script que
siembra los seis usuarios del equipo puede reutilizar exactamente la misma
función que usa el endpoint de crear, sin duplicar reglas.

Regla que se aplica en todas las funciones: el correo es la identidad, y se
normaliza a minúsculas y sin espacios antes de tocar la base. Da igual que
alguien escriba "Nati.C@proliferante.com " al crear y "nati.c@proliferante.com"
al entrar: es la misma persona. El índice único de la tabla va sobre
lower(correo), así que la base lo garantiza aunque este módulo se equivoque.
"""

from datetime import datetime, timezone

from app.core import config, security
from app.core.database import cursor, escribir

# Lo que se devuelve de un usuario. `clave_hash` no está en la lista a
# propósito: no debe salir de aquí en ninguna respuesta.
CAMPOS = "id, nombre, correo, rol, activo, debe_cambiar_clave, creado_en, ultimo_acceso"


class ErrorAuth(Exception):
    """Fallo esperado (correo repetido, rol inválido…), no un error de programa."""


def normalizar_correo(correo: str) -> str:
    return (correo or "").strip().lower()


def por_correo(correo: str) -> dict | None:
    """Busca por correo sin distinguir mayúsculas."""
    with cursor() as con:
        fila = con.execute(
            f"SELECT {CAMPOS}, clave_hash FROM usuarios WHERE lower(correo) = ?",
            (normalizar_correo(correo),),
        ).fetchone()
    return dict(fila) if fila else None


def por_id(usuario_id: int) -> dict | None:
    with cursor() as con:
        fila = con.execute(
            f"SELECT {CAMPOS} FROM usuarios WHERE id = ?", (usuario_id,)
        ).fetchone()
    return dict(fila) if fila else None


def listar() -> list[dict]:
    with cursor() as con:
        filas = con.execute(
            f"SELECT {CAMPOS} FROM usuarios ORDER BY rol, nombre"
        ).fetchall()
    return [dict(f) for f in filas]


def crear(nombre: str, correo: str, rol: str, clave: str,
          debe_cambiar_clave: bool = True) -> dict:
    """Crea un usuario interno. Sólo lo llama un admin (o el script de siembra)."""
    correo = normalizar_correo(correo)
    nombre = (nombre or "").strip()

    if not nombre:
        raise ErrorAuth("El nombre no puede estar vacío.")
    if "@" not in correo:
        raise ErrorAuth(f"Correo inválido: {correo!r}")
    if rol not in config.ROLES:
        raise ErrorAuth(f"Rol inválido: {rol!r}. Válidos: {', '.join(config.ROLES)}")
    if len(clave or "") < 8:
        raise ErrorAuth("La contraseña debe tener al menos 8 caracteres.")
    if por_correo(correo):
        raise ErrorAuth(f"Ya existe un usuario con el correo {correo}.")

    with escribir() as con:
        fila = con.execute(
            f"""INSERT INTO usuarios (nombre, correo, clave_hash, rol, debe_cambiar_clave)
                VALUES (?, ?, ?, ?, ?) RETURNING {CAMPOS}""",
            (nombre, correo, security.hashear(clave), rol, debe_cambiar_clave),
        ).fetchone()
    return dict(fila)


def autenticar(correo: str, clave: str) -> dict:
    """Comprueba credenciales y devuelve el usuario. Lanza ErrorAuth si no.

    El mensaje de error es el mismo para "no existe" y para "contraseña
    equivocada", a propósito: distinguirlos le diría a cualquiera qué
    correos tienen cuenta.
    """
    u = por_correo(correo)
    generico = "Correo o contraseña incorrectos."

    if not u or not security.verificar(clave, u.get("clave_hash", "")):
        raise ErrorAuth(generico)
    if not u["activo"]:
        raise ErrorAuth("Esta cuenta está desactivada. Habla con un administrador.")

    with escribir() as con:
        con.execute(
            "UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?",
            (datetime.now(timezone.utc), u["id"]),
        )

    u.pop("clave_hash", None)
    return u


def cambiar_clave(usuario_id: int, clave_actual: str, clave_nueva: str) -> None:
    """Cambia la contraseña del propio usuario, verificando la anterior.

    Al cambiarla se apaga `debe_cambiar_clave`: es justo lo que la bandera
    estaba esperando.
    """
    if len(clave_nueva or "") < 8:
        raise ErrorAuth("La contraseña nueva debe tener al menos 8 caracteres.")
    if clave_nueva == clave_actual:
        raise ErrorAuth("La contraseña nueva debe ser distinta de la actual.")

    with cursor() as con:
        fila = con.execute(
            "SELECT clave_hash FROM usuarios WHERE id = ?", (usuario_id,)
        ).fetchone()
    if not fila or not security.verificar(clave_actual, fila["clave_hash"]):
        raise ErrorAuth("La contraseña actual no es correcta.")

    with escribir() as con:
        con.execute(
            "UPDATE usuarios SET clave_hash = ?, debe_cambiar_clave = FALSE WHERE id = ?",
            (security.hashear(clave_nueva), usuario_id),
        )


def activar(usuario_id: int, activo: bool) -> dict:
    """Da de baja o vuelve a habilitar a alguien. No se borra el registro:
    su rastro en el seguimiento (quién descartó qué) tiene que sobrevivir."""
    with escribir() as con:
        fila = con.execute(
            f"UPDATE usuarios SET activo = ? WHERE id = ? RETURNING {CAMPOS}",
            (activo, usuario_id),
        ).fetchone()
    if not fila:
        raise ErrorAuth("No existe ese usuario.")
    return dict(fila)
