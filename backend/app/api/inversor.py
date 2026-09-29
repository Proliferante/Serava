"""
api/inversor.py
===============
Sesión del área privada de la web (inversionistas), montado en /api/inversor.

    POST /api/inversor/login   entrar; pone la cookie `zq_inversor`
    POST /api/inversor/salir   cerrar la sesión
    GET  /api/inversor/yo      quién soy (para la web: nombre y correo)

POR AHORA, CON LAS CUENTAS DEL EQUIPO
    Todavía no hay cuentas de inversionista: esto entra con las mismas de la
    consola (tabla `usuarios`), para cerrar el portafolio mientras se
    construye lo de verdad. Es una decisión temporal y acotada:

      · la sesión que se abre aquí es de ámbito `inversor` (ver
        core/sesiones.py) y va en su propia cookie. No sirve en la consola:
        `usuario_actual` sólo acepta sesiones de ámbito `consola`. Entrar al
        portafolio no da acceso a /api/admin.
      · las barreras del login de la consola valen igual aquí: freno por
        correo y por IP (core/intentos.py, que cuenta en la misma cubeta: cinco
        fallos entre los dos logins bloquean la cuenta), tope por minuto del
        middleware, bcrypt, mensaje genérico.

    El día que existan cuentas de inversionista, cambia `svc.autenticar` por
    el de esa tabla y todo lo demás se queda como está.

LA COOKIE
    `zq_inversor`, HttpOnly, SameSite=Strict y Secure en producción, como la de
    la consola. Se pone en www.zequara.com; la de la consola vive en
    admin.zequara.com. Ninguna de las dos viaja al otro dominio.
"""

from fastapi import APIRouter, Cookie, HTTPException, Request, Response
from pydantic import BaseModel, Field

from app.api.auth import LIMITE_CLAVE, LIMITE_CORREO
from app.core import bitacora, config, intentos, sesiones
from app.services import auth_service as svc

router = APIRouter()


def inversor_actual(zq_inversor: str | None = Cookie(default=None)) -> dict:
    """Exige una sesión de inversionista válida. La usa /api/predios."""
    if not sesiones.disponible():
        raise HTTPException(503, "El servidor no tiene la tabla de sesiones.")
    u = sesiones.validar(zq_inversor, sesiones.INVERSOR)
    if not u:
        raise HTTPException(401, "Inicia sesión para ver el portafolio.")
    if not u["activo"]:
        raise HTTPException(403, "Esta cuenta está desactivada.")
    u["_sesion"] = zq_inversor
    return u


class PeticionLogin(BaseModel):
    correo: str = Field(max_length=LIMITE_CORREO)
    clave: str = Field(max_length=LIMITE_CLAVE)


@router.post("/login")
def login(p: PeticionLogin, peticion: Request, respuesta: Response):
    ip = intentos.ip_de(peticion)

    # El freno antes del bcrypt, como en la consola: si no, cada intento
    # bloqueado seguiría costando la comprobación cara.
    motivo = intentos.bloqueado(p.correo, ip)
    if motivo:
        intentos.registrar(p.correo, ip, False, "bloqueado-inversor")
        raise HTTPException(429, motivo)

    try:
        u = svc.autenticar(p.correo, p.clave)
    except svc.ErrorAuth as e:
        intentos.registrar(p.correo, ip, False, f"inversor: {e}")
        raise HTTPException(401, str(e)) from e

    if not sesiones.disponible():
        raise HTTPException(503, "El servidor no tiene la tabla de sesiones.")

    intentos.registrar(p.correo, ip, True)
    sid = sesiones.crear(u["id"], ip, peticion.headers.get("user-agent"), sesiones.INVERSOR)
    sesiones.poner_cookie(respuesta, sid, sesiones.INVERSOR)
    bitacora.anotar(u, "entrar-portafolio", ip=ip)

    # Lo justo para saludar. Ni el rol ni el id: la web del inversionista no
    # los usa, y lo que no se manda no se puede leer con F12.
    return {"nombre": u["nombre"], "horas": config.SESION_HORAS}


@router.post("/salir")
def salir(respuesta: Response, zq_inversor: str | None = Cookie(default=None)):
    """Cierra la sesión. No exige que siga siendo válida: salir de una sesión
    ya caducada tiene que funcionar igual, y borrar la cookie siempre."""
    if zq_inversor:
        sesiones.revocar(zq_inversor)
    sesiones.quitar_cookie(respuesta, sesiones.INVERSOR)
    return {"ok": True}


@router.get("/yo")
def yo(zq_inversor: str | None = Cookie(default=None)):
    u = inversor_actual(zq_inversor)
    return {"nombre": u["nombre"], "correo": u["correo"]}
