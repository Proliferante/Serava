"""
api/auth.py
===========
Sesión y usuarios internos, montado en /api/auth.

    POST /api/auth/login          entrar; pone la cookie de sesión
    POST /api/auth/salir          cerrar la sesión actual
    POST /api/auth/salir-todas    cerrar todas las demás sesiones
    GET  /api/auth/yo             quién soy
    GET  /api/auth/sesiones       mis sesiones abiertas
    POST /api/auth/cambiar-clave  cambiar la propia contraseña
    GET  /api/auth/usuarios       listar        (sólo admin)
    POST /api/auth/usuarios       crear         (sólo admin)
    POST /api/auth/usuarios/{id}/activo   dar de baja o alta (sólo admin)

CÓMO VIAJA LA SESIÓN
    En una cookie `HttpOnly`, `SameSite=Strict` y —en producción— `Secure`.
    El navegador la manda sola; el JavaScript de la página no la puede leer,
    así que un XSS no se la puede llevar. Lo que hay dentro es un
    identificador al azar, no un JWT: quién es y qué rol tiene sale de la
    tabla `sesiones`, y por eso una sesión se puede retirar de verdad.

CÓMO SE PROTEGE UN ENDPOINT
    `Depends(usuario_actual)` exige sesión válida y devuelve el usuario.
    `Depends(solo_admin)` exige además que el rol sea admin.
    Para un rol concreto: `Depends(exige_rol("arquitectura", "admin"))`.

    La comprobación vive en el servidor. Que el menú de la consola esconda un
    módulo es comodidad; lo que impide entrar es esto.

SOBRE LOS ROLES, HOY
    El acuerdo de la reunión fue dejarlos abiertos para habilitar el primer
    flujo: los cuatro existen y la sesión los conoce, pero los endpoints del
    flujo sólo exigen sesión. Cuando haya que cerrarlos, se cambia
    `Depends(usuario_actual)` por `Depends(exige_rol(...))` — un cambio por
    endpoint, sin tocar la lógica.
"""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.core import bitacora, config, intentos, sesiones
from app.services import auth_service as svc

router = APIRouter()


# ---------------------------------------------------------------------------
# DEPENDENCIAS DE SESIÓN
# ---------------------------------------------------------------------------

def usuario_actual(zq_sesion: str | None = Cookie(default=None)) -> dict:
    """Valida la cookie de sesión y devuelve el usuario.

    Se comprueba contra la base que el usuario siga existiendo y activo, no
    sólo que la sesión valga: si un admin da de baja a alguien, tiene que
    quedarse fuera en la petición siguiente.
    """
    sin_sesion = HTTPException(401, "No has iniciado sesión.")

    if not sesiones.disponible():
        # No se deja pasar: una sesión que no se puede comprobar no es una
        # sesión. Se distingue del 401 para que se vea que falta el esquema.
        raise HTTPException(
            503, "El servidor no tiene la tabla de sesiones. Aplica database/seguridad.sql."
        )

    # `validar` devuelve ya el usuario: la sesión y su dueño vienen en la
    # misma consulta, porque a un cuarto de segundo por viaje de red no vale
    # la pena preguntar dos veces por algo que un JOIN resuelve.
    u = sesiones.validar(zq_sesion)
    if not u:
        raise sin_sesion
    if not u["activo"]:
        raise HTTPException(403, "Esta cuenta está desactivada.")

    # El id de la sesión viaja con el usuario para poder revocar "todas menos
    # esta" sin volver a leer la cookie más abajo.
    u["_sesion"] = zq_sesion
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
# ENTRAR Y SALIR
# ---------------------------------------------------------------------------

class PeticionLogin(BaseModel):
    correo: str
    clave: str


@router.post("/login")
def login(p: PeticionLogin, peticion: Request, respuesta: Response):
    ip = intentos.ip_de(peticion)

    # El freno va ANTES de comprobar la contraseña: si no, cada intento
    # bloqueado seguiría costando un bcrypt, que es caro a propósito, y el
    # propio freno se convertiría en la forma de tumbar el servidor.
    motivo = intentos.bloqueado(p.correo, ip)
    if motivo:
        intentos.registrar(p.correo, ip, False, "bloqueado")
        raise HTTPException(429, motivo)

    try:
        u = svc.autenticar(p.correo, p.clave)
    except svc.ErrorAuth as e:
        intentos.registrar(p.correo, ip, False, str(e))
        raise HTTPException(401, str(e)) from e

    if not sesiones.disponible():
        raise HTTPException(
            503, "El servidor no tiene la tabla de sesiones. Aplica database/seguridad.sql."
        )

    intentos.registrar(p.correo, ip, True)
    sid = sesiones.crear(u["id"], ip, peticion.headers.get("user-agent"))
    sesiones.poner_cookie(respuesta, sid)
    bitacora.anotar(u, "entrar", ip=ip)

    # El cuerpo NO lleva el identificador de la sesión: si lo llevara, el
    # JavaScript podría guardárselo y volveríamos al problema que la cookie
    # HttpOnly resuelve.
    return {"usuario": u, "horas": config.JWT_HORAS}


@router.post("/salir")
def salir(respuesta: Response, u: dict = Depends(usuario_actual)):
    sesiones.revocar(u["_sesion"])
    sesiones.quitar_cookie(respuesta)
    bitacora.anotar(u, "salir")
    return {"ok": True}


@router.post("/salir-todas")
def salir_todas(u: dict = Depends(usuario_actual)):
    """Cierra las demás sesiones y deja viva la actual.

    Para cuando alguien sospecha que dejó una sesión abierta en otro sitio.
    """
    n = sesiones.revocar_todas(u["id"], excepto=u["_sesion"])
    bitacora.anotar(u, "cerrar-otras-sesiones", f"{n} cerradas")
    return {"ok": True, "cerradas": n}


@router.get("/yo")
def yo(u: dict = Depends(usuario_actual)):
    return {k: v for k, v in u.items() if not k.startswith("_")}


@router.get("/politica")
def politica():
    """Las reglas de contraseña, para que la pantalla las diga bien.

    Va sin sesión a propósito: la necesita la pantalla de cambio obligatorio,
    que se usa antes de que nadie tenga una contraseña válida. No revela nada
    —son las mismas reglas que el formulario tendría que explicar de todas
    formas—.

    Existe porque el mínimo estaba escrito a mano en tres sitios: aquí, en el
    formulario de cambio y en el de crear usuario. Estaba en 12 en el backend
    y en 8 en los dos formularios, así que la pantalla aceptaba contraseñas
    que el servidor rechazaba con un error en inglés de Pydantic — y pasaba
    justo en la primera entrada de cada persona nueva, que es el peor momento
    para eso. Ahora el número vive en un solo lado.
    """
    return {
        "minima": config.CLAVE_MINIMA,
        "reglas": [
            f"Al menos {config.CLAVE_MINIMA} caracteres.",
            "No puede ser una contraseña común.",
            "No puede contener tu nombre ni tu correo.",
        ],
    }


@router.get("/sesiones")
def mis_sesiones(u: dict = Depends(usuario_actual)):
    lista = sesiones.activas(u["id"])
    for s in lista:
        s["actual"] = s["id"] == u["_sesion"]
        # El identificador completo no sale: enseñarlo sería repartir sesiones
        # válidas por la respuesta.
        s["id"] = s["id"][:6] + "…"
    return {"sesiones": lista}


class PeticionNombre(BaseModel):
    nombre: str


@router.post("/perfil/nombre")
def cambiar_nombre(p: PeticionNombre, peticion: Request, u: dict = Depends(usuario_actual)):
    """Cambia el nombre que se muestra. Sin contraseña: no es la identidad."""
    try:
        actualizado = svc.cambiar_nombre(u["id"], p.nombre)
    except svc.ErrorAuth as e:
        raise HTTPException(400, str(e)) from e
    bitacora.anotar(u, "cambiar-nombre", actualizado["nombre"], ip=intentos.ip_de(peticion))
    return {"ok": True, "usuario": actualizado}


class PeticionCorreo(BaseModel):
    correo: str
    clave_actual: str


@router.post("/perfil/correo")
def cambiar_correo(p: PeticionCorreo, peticion: Request, u: dict = Depends(usuario_actual)):
    """Cambia el correo de acceso. Pide la contraseña porque ES la identidad.

    Y cierra las demás sesiones: la cuenta se entra con otro correo desde
    ahora, así que las sesiones abiertas con el anterior no deberían seguir.
    """
    anterior = u["correo"]
    try:
        actualizado = svc.cambiar_correo(u["id"], p.correo, p.clave_actual)
    except svc.ErrorAuth as e:
        raise HTTPException(400, str(e)) from e

    n = sesiones.revocar_todas(u["id"], excepto=u["_sesion"])
    bitacora.anotar(u, "cambiar-correo", f"{anterior} → {actualizado['correo']}",
                    ip=intentos.ip_de(peticion))
    return {"ok": True, "usuario": actualizado, "sesiones_cerradas": n}


class PeticionClave(BaseModel):
    clave_actual: str
    clave_nueva: str = Field(min_length=config.CLAVE_MINIMA)


@router.post("/cambiar-clave")
def cambiar_clave(p: PeticionClave, peticion: Request, u: dict = Depends(usuario_actual)):
    try:
        svc.cambiar_clave(u["id"], p.clave_actual, p.clave_nueva, correo=u["correo"])
    except svc.ErrorAuth as e:
        raise HTTPException(400, str(e)) from e

    # Cambiar la contraseña cierra las demás sesiones. Es el motivo por el que
    # la mayoría de la gente la cambia: cree que alguien más tiene acceso.
    # Dejarle las otras sesiones abiertas haría el gesto inútil.
    n = sesiones.revocar_todas(u["id"], excepto=u["_sesion"])
    bitacora.anotar(u, "cambiar-clave", f"{n} sesiones cerradas", ip=intentos.ip_de(peticion))
    return {"ok": True, "usuario": svc.por_id(u["id"]), "sesiones_cerradas": n}


# ---------------------------------------------------------------------------
# USUARIOS (sólo admin)
# ---------------------------------------------------------------------------

class PeticionUsuario(BaseModel):
    nombre: str
    correo: str
    rol: str
    clave: str = Field(min_length=config.CLAVE_MINIMA)


@router.get("/usuarios")
def usuarios(_: dict = Depends(solo_admin)):
    return {"usuarios": svc.listar(), "roles": list(config.ROLES)}


@router.post("/usuarios")
def crear_usuario(p: PeticionUsuario, peticion: Request, admin: dict = Depends(solo_admin)):
    try:
        # La cuenta nace con contraseña normal, no temporal: su dueño entra y
        # trabaja, y la cambia cuando quiera desde «Mi cuenta». Antes se
        # creaba con `debe_cambiar_clave` y la consola le exigía cambiarla en
        # la primera entrada; era un paso de más para un equipo de seis
        # personas que recibe la contraseña de un administrador de confianza.
        #
        # La bandera sigue existiendo en la tabla y la usa
        # `scripts/crear_usuarios.py --azar`, que sí reparte contraseñas de un
        # solo uso — ahí forzar el cambio es lo correcto.
        nuevo = svc.crear(p.nombre, p.correo, p.rol, p.clave, debe_cambiar_clave=False)
    except svc.ErrorAuth as e:
        raise HTTPException(400, str(e)) from e

    bitacora.anotar(admin, "crear-usuario", f"{nuevo['correo']} ({nuevo['rol']})",
                    ip=intentos.ip_de(peticion))
    return nuevo


class PeticionActivo(BaseModel):
    activo: bool


@router.post("/usuarios/{usuario_id}/activo")
def cambiar_activo(usuario_id: int, p: PeticionActivo, peticion: Request,
                   admin: dict = Depends(solo_admin)):
    if usuario_id == admin["id"] and not p.activo:
        raise HTTPException(400, "No puedes desactivar tu propia cuenta.")
    try:
        u = svc.activar(usuario_id, p.activo)
    except svc.ErrorAuth as e:
        raise HTTPException(404, str(e)) from e

    # Dar de baja cierra sus sesiones al momento. Sin esto seguiría dentro
    # hasta que la suya caducara — `usuario_actual` lo pararía igual, pero
    # cerrarlas deja el estado limpio y visible en la tabla.
    if not p.activo:
        sesiones.revocar_todas(usuario_id)
    bitacora.anotar(admin, "activar-usuario" if p.activo else "desactivar-usuario",
                    u["correo"], ip=intentos.ip_de(peticion))
    return u
