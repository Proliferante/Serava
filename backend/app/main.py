import logging

import psycopg2
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.flujo import router as flujo_router
from app.core import config, sesiones

log = logging.getLogger("zequara")

app = FastAPI(title="Zequara API")


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
        # Sin mencionar `backend/.env`: desplegado, el sitio donde falta la
        # variable son las del proveedor (Railway, Render), y mandar a alguien
        # a un archivo que no existe en el servidor cuesta un rato de más.
        content={"detail": "El servidor no tiene configurada la base de datos: "
                           "falta la variable DATABASE_URL."},
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

@app.middleware("http")
async def _cabeceras_y_origen(peticion: Request, siguiente):
    """Dos cosas en una pasada: comprobar el origen y poner las cabeceras.

    COMPROBACIÓN DE ORIGEN
        La cookie de sesión va con `SameSite=Strict`, así que el navegador no
        la manda en peticiones que nazcan en otro sitio: eso ya cierra el CSRF.
        Esto es el segundo cerrojo, para el caso de un navegador viejo o de una
        configuración rara: si una petición que escribe trae un `Origin` que no
        está en la lista permitida, se rechaza sin llegar al endpoint.

        Sólo se mira en los métodos que escriben. Un GET no cambia nada, y
        exigir `Origin` en las lecturas rompería `curl` y la documentación
        interactiva de /docs.

    CABECERAS
        `X-Frame-Options` impide que la consola se cargue dentro de un iframe
        ajeno, que es como se monta un clickjacking: la víctima cree que pulsa
        un botón inocente y en realidad pulsa "Desactivar usuario".
        `X-Content-Type-Options` evita que el navegador adivine el tipo de una
        respuesta y acabe ejecutando como script algo que no lo es.
        `Referrer-Policy` impide que la URL de la consola viaje a sitios
        externos.
        HSTS sólo se manda si la cookie va en modo seguro: mandarla en
        localhost dejaría el dominio marcado como "sólo HTTPS" en el navegador
        del equipo, y a partir de ahí `http://localhost` deja de funcionar.
    """
    if peticion.method in ("POST", "PUT", "PATCH", "DELETE"):
        origen = peticion.headers.get("origin")
        if origen and origen not in config.CORS_ORIGINS:
            return JSONResponse(
                status_code=403,
                content={"detail": "Origen no permitido."},
            )

    r = await siguiente(peticion)
    r.headers["X-Frame-Options"] = "DENY"
    r.headers["X-Content-Type-Options"] = "nosniff"
    r.headers["Referrer-Policy"] = "same-origin"
    r.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    # La API sólo devuelve JSON: nada que ejecutar, así que la política puede
    # ser la más estricta posible.
    r.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    if config.COOKIE_SEGURA:
        r.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return r


@app.on_event("startup")
def _al_arrancar():
    """Barre las sesiones muertas. No hay tarea programada ni hace falta:
    con reiniciar de vez en cuando, la tabla no crece sin control."""
    try:
        n = sesiones.limpiar()
        if n:
            log.info("Sesiones vencidas borradas: %s", n)
    except Exception as e:
        log.warning("No se pudieron limpiar las sesiones: %s", e)


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
