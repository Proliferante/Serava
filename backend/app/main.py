import logging

import psycopg2
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.flujo import router as flujo_router
from app.core import config

log = logging.getLogger("zequora")

app = FastAPI(title="Zequora API")


# Sin base de datos, cualquier endpoint acababa en un 500 pelado —
# "Internal Server Error" y nada más—, que en pantalla es indistinguible de
# un error de programa. Estos dos manejadores lo convierten en un 503 con
# una razón legible, que es lo que la consola puede mostrar.
#
# 503 y no 500 a propósito: el servicio no está disponible ahora mismo, y
# reintentar después tiene sentido. Un 500 diría "hay un error en el código".

@app.exception_handler(psycopg2.OperationalError)
def _sin_conexion(_: Request, exc: psycopg2.OperationalError):
    log.error("Sin conexión con la base: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "No hay conexión con la base de datos. "
                           "Revisa DATABASE_URL y que Supabase esté accesible."},
    )


@app.exception_handler(RuntimeError)
def _mal_configurado(_: Request, exc: RuntimeError):
    """`db_admin` lanza RuntimeError cuando falta DATABASE_URL."""
    if "DATABASE_URL" not in str(exc):
        raise exc
    log.error("Configuración incompleta: %s", exc)
    return JSONResponse(
        status_code=503,
        content={"detail": "El servidor no tiene configurada la base de datos "
                           "(falta DATABASE_URL en backend/.env)."},
    )

# CORS: la lista de dominios permitidos sale del entorno (CORS_ORIGINS), y
# por defecto es sólo el localhost del frontend. Antes estaba en ["*"], que
# con `allow_credentials` es justo lo que no se debe hacer: cualquier página
# de cualquier dominio podía llamar a la API con la sesión del usuario.
# Al desplegar: CORS_ORIGINS=https://el-dominio-real
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sesión y usuarios internos.
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

# Consola interna del equipo (embudo/seguimiento/add-value), coordinada con
# David — ver app/api/admin.py y app/services/admin/.
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])

# Las cinco pantallas del flujo de inmuebles. Va con el prefijo de admin
# porque es parte de la consola interna, pero en su propio archivo: admin.py
# ya son 700 líneas.
app.include_router(flujo_router, prefix="/api/admin/flujo", tags=["flujo"])

# TODO (backend oficial): sumar aquí los routers de inmuebles, dashboard y
# notificaciones cuando estén — no reemplazar este archivo, sólo añadir.


@app.get("/api/salud")
def salud():
    """Para saber si el proceso está vivo sin tener sesión.

    No dice nada de la base a propósito: un endpoint público no debería
    revelar si la base responde o cómo se llama.
    """
    return {"ok": True}
