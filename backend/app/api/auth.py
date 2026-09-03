"""
api/auth.py
===========
Sesión y usuarios internos, montado en /api/auth.

    POST /api/auth/login          entrar; devuelve token + usuario
    GET  /api/auth/yo             quién soy (valida el token en cada llamada)
    POST /api/auth/cambiar-clave  cambiar la propia contraseña
    GET  /api/auth/usuarios       listar        (sólo admin)
    POST /api/auth/usuarios       crear         (sólo admin)
    POST /api/auth/usuarios/{id}/activo   dar de baja o alta (sólo admin)

CÓMO SE PROTEGE UN ENDPOINT
    `Depends(usuario_actual)` exige sesión válida y devuelve el usuario.
    `Depends(solo_admin)` exige además que el rol sea admin.
    Para un rol concreto: `Depends(exige_rol("arquitectura", "admin"))`.

    La comprobación de rol vive en el servidor, no en la pantalla. Que el
    menú de la consola esconda un módulo es comodidad; lo que impide
    entrar es esto.

SOBRE LOS ROLES, HOY
    El acuerdo de la reunión fue dejarlos abiertos para habilitar el primer
    flujo: los cuatro roles existen y el token los lleva, pero los
    endpoints del flujo sólo exigen sesión, no un rol determinado. Cuando
    haya que cerrarlos, se cambia `Depends(usuario_actual)` por
    `Depends(exige_rol(...))` en los de admin/flujo — un cambio por
    endpoint, sin tocar la lógica.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field

from app.core import config, intentos, security
from app.services import auth_service as svc

router = APIRouter()


# ---------------------------------------------------------------------------
# DEPENDENCIAS DE SESIÓN
# ---------------------------------------------------------------------------

def usuario_actual(authorization: str = Header(default="")) -> dict:
    """Valida el token del encabezado `Authorization: Bearer <token>`.

    Además de la firma se comprueba contra la base que el usuario siga
    existiendo y activo: si un admin da de baja a alguien, tiene que
    quedarse fuera en la petición siguiente, no cuando caduque su token.
    """
    esquema, _, token = (authorization or "").partition(" ")
    if esquema.lower() != "bearer" or not token.strip():
        raise HTTPException(401, "Falta la sesión.", {"WWW-Authenticate": "Bearer"})

    carga = security.leer_token(token.strip())
    if not carga:
        raise HTTPException(401, "Sesión inválida o vencida.", {"WWW-Authenticate": "Bearer"})

    u = svc.por_id(int(carga["sub"]))
    if not u:
        raise HTTPException(401, "El usuario de esta sesión ya no existe.")
    if not u["activo"]:
        raise HTTPException(403, "Esta cuenta está desactivada.")
    return u


def exige_rol(*roles: str):
    """Fábrica de dependencias: exige que el rol esté entre los dados."""
    def comprobar(u: dict = Depends(usuario_actual)) -> dict:
        if u["rol"] not in roles:
            raise HTTPException(403, f"Tu rol ({u['rol']}) no tiene acceso a esto.")
        return u
    return comprobar


solo_admin = exige_rol("admin")


# ---------------------------------------------------------------------------
# ENTRAR
# ---------------------------------------------------------------------------

class PeticionLogin(BaseModel):
    correo: str
    clave: str


@router.post("/login")
def login(p: PeticionLogin, peticion: Request):
    ip = intentos.ip_de(peticion)

    # El freno va ANTES de comprobar la contraseña: si no, cada intento
    # bloqueado seguiría costando un bcrypt, que es caro a propósito, y el
    # propio freno se convertiría en la forma de tumbar el servidor.
    motivo = intentos.bloqueado(p.correo, ip)
    if motivo:
        intentos.registrar(p.correo, ip, False, "bloqueado")
        # 429: no son credenciales malas, es que hay que esperar.
        raise HTTPException(429, motivo)

    try:
        u = svc.autenticar(p.correo, p.clave)
    except svc.ErrorAuth as e:
        intentos.registrar(p.correo, ip, False, str(e))
        # 401 y no 400: son credenciales, no un formulario mal armado.
        raise HTTPException(401, str(e)) from e

    intentos.registrar(p.correo, ip, True)
    return {
        "token": security.crear_token(u["id"], u["correo"], u["rol"]),
        "horas": config.JWT_HORAS,
        "usuario": u,
    }


@router.get("/yo")
def yo(u: dict = Depends(usuario_actual)):
    return u


class PeticionClave(BaseModel):
    clave_actual: str
    clave_nueva: str = Field(min_length=8)


@router.post("/cambiar-clave")
def cambiar_clave(p: PeticionClave, u: dict = Depends(usuario_actual)):
    try:
        svc.cambiar_clave(u["id"], p.clave_actual, p.clave_nueva)
    except svc.ErrorAuth as e:
        raise HTTPException(400, str(e)) from e
    return {"ok": True, "usuario": svc.por_id(u["id"])}


# ---------------------------------------------------------------------------
# USUARIOS (sólo admin)
# ---------------------------------------------------------------------------

class PeticionUsuario(BaseModel):
    nombre: str
    correo: str
    rol: str
    clave: str = Field(min_length=8)


@router.get("/usuarios")
def usuarios(_: dict = Depends(solo_admin)):
    return {"usuarios": svc.listar(), "roles": list(config.ROLES)}


@router.post("/usuarios")
def crear_usuario(p: PeticionUsuario, _: dict = Depends(solo_admin)):
    try:
        # Siempre con `debe_cambiar_clave`: la contraseña que pone el admin
        # viaja por chat o correo, así que es temporal por definición.
        return svc.crear(p.nombre, p.correo, p.rol, p.clave, debe_cambiar_clave=True)
    except svc.ErrorAuth as e:
        raise HTTPException(400, str(e)) from e


class PeticionActivo(BaseModel):
    activo: bool


@router.post("/usuarios/{usuario_id}/activo")
def cambiar_activo(usuario_id: int, p: PeticionActivo, admin: dict = Depends(solo_admin)):
    if usuario_id == admin["id"] and not p.activo:
        raise HTTPException(400, "No puedes desactivar tu propia cuenta.")
    try:
        return svc.activar(usuario_id, p.activo)
    except svc.ErrorAuth as e:
        raise HTTPException(404, str(e)) from e
