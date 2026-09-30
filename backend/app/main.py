import logging
from contextlib import asynccontextmanager

import psycopg2
from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router, usuario_actual
from app.api.flujo import router as flujo_router
from app.api.hub import router_admin as hub_admin_router, router_publico as hub_publico_router
from app.api.inmuebles import router as inmuebles_router
from app.core import config, sesiones
from app.core.limites import Frenos
from app.services import manual_service

log = logging.getLogger("zequara")

@asynccontextmanager
async def _ciclo_de_vida(_: FastAPI):
    """Barre las sesiones muertas al arrancar. No hay tarea programada ni hace
    falta: con reiniciar de vez en cuando, la tabla no crece sin control.

    Con `lifespan` y no con `@app.on_event("startup")`, que FastAPI dio por
    obsoleto y avisaba en cada arranque y en cada corrida de pruebas.
    """
    try:
        n = sesiones.limpiar()
        if n:
            log.info("Sesiones vencidas borradas: %s", n)
    except Exception as e:
        log.warning("No se pudieron limpiar las sesiones: %s", e)

    # Las columnas que necesita un predio metido a mano (ubicación y precio,
    # que un predio de portal saca de `clean_listings`). Aquí y no en cada
    # petición: el listado público las lee y no tiene por qué poder alterar
    # tablas. `ADD COLUMN IF NOT EXISTS` hace que repetirlo no cueste nada.
    try:
        manual_service.asegurar_columnas()
    except Exception as e:
        log.error("No se pudieron asegurar las columnas de predio manual: %s", e)
    yield


# Sin documentación interactiva a menos que DOCS_ABIERTAS lo pida: ver la nota
# en `core/config.py`. `openapi_url=None` también, o `/openapi.json` seguiría
# sirviendo el esquema entero aunque `/docs` no lo pinte.
app = FastAPI(
    title="Zequara API",
    lifespan=_ciclo_de_vida,
    docs_url="/docs" if config.DOCS_ABIERTAS else None,
    redoc_url="/redoc" if config.DOCS_ABIERTAS else None,
    openapi_url="/openapi.json" if config.DOCS_ABIERTAS else None,
)


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

# SIN CORS, A PROPÓSITO.
# Todo lo que el navegador pide a esta API va por el mismo origen: Next lo
# reescribe (`/api/*` → backend) desde www o desde admin, así que ninguna
# llamada legítima necesita cabeceras CORS. Hubo un CORSMiddleware con
# `allow_credentials` y la lista CORS_ORIGINS, que tenía a la vez
# www.zequara.com y admin.zequara.com: con eso, un script que corriera en la
# web pública podía llamar a admin.zequara.com/api/admin con la cookie de la
# consola (los dos subdominios son «el mismo sitio» y SameSite=Strict no los
# separa) y LEER la respuesta, porque el backend le daba permiso CORS.
# Sin la cabecera, el navegador no le deja leer nada. CORS_ORIGINS se sigue
# usando, pero sólo para la comprobación de origen de abajo.

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
    ruta = peticion.url.path
    prohibido = JSONResponse(status_code=403, content={"detail": "Origen no permitido."})

    # SEC-FETCH-SITE: lo pone el navegador en cada petición y dice de dónde
    # nace. A la API sólo se llama desde su propia página («same-origin») o
    # escribiendo la dirección («none»); una petición que viene de otro
    # subdominio («same-site») o de otro sitio («cross-site») se corta aquí,
    # lecturas incluidas. Es lo que separa www de admin, que para SameSite
    # son el mismo sitio. Sin la cabecera (servidor a servidor, navegadores
    # viejos) quedan las comprobaciones de Origin de abajo.
    sitio = peticion.headers.get("sec-fetch-site")
    if ruta.startswith("/api/") and sitio and sitio not in ("same-origin", "none"):
        return prohibido

    if peticion.method in ("POST", "PUT", "PATCH", "DELETE"):
        origen = peticion.headers.get("origin")
        if origen and origen not in config.CORS_ORIGINS:
            return prohibido
        # Y cada API desde su subdominio: la consola sólo desde admin, el
        # portafolio sólo desde www. Si no hay subdominio de consola (local,
        # vistas previas), no se separa.
        admin = [o for o in config.CORS_ORIGINS if "://admin." in o]
        if origen and admin:
            es_consola = ruta.startswith(("/api/admin", "/api/auth"))
            if es_consola and origen not in admin:
                return prohibido
            if ruta.startswith("/api/inversor") and origen in admin:
                return prohibido

    r = await siguiente(peticion)
    # Nada de la API se guarda en una caché compartida salvo que el endpoint
    # lo pida (el HUB público lo hace). Las respuestas con sesión nunca.
    if ruta.startswith("/api/") and "cache-control" not in r.headers:
        r.headers["Cache-Control"] = "no-store"
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


# Los frenos (firma del frontend, tamaño del cuerpo, peticiones por minuto) van
# los PRIMEROS en recibir la petición, y por eso se añaden los últimos: en
# Starlette el último middleware añadido es el de fuera. Así una petición que
# no pasa ni llega a CORS ni a la base. Ver core/limites.py.
app.add_middleware(Frenos)


# Sesión y usuarios internos.
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

# TODO lo que va bajo /api/admin exige sesión, y se exige AQUÍ, en el
# include, no endpoint por endpoint.
#
# Es la corrección de un agujero real: `app/api/admin.py` se escribió antes de
# que hubiera login y ninguno de sus siete endpoints pedía nada. Con el backend
# ya publicado, eso significaba que cualquiera podía leer el listado completo
# del scraping (`GET /predios`), ver la configuración de zonas, y —peor—
# lanzar una extracción (`POST /extraer`) o escribir decisiones de descarte
# (`POST /seguimiento`) sin ser nadie. Comprobado contra el servicio antes de
# arreglarlo: 200 y datos, sin cookie.
#
# Puesto en el `include_router`, la protección no depende de que alguien se
# acuerde de añadir `Depends` al escribir el siguiente endpoint: cubre los que
# hay y los que vengan. Los que además necesitan saber QUIÉN llama siguen
# declarando `usuario_actual` en su firma, y eso no cuesta otra validación
# —FastAPI resuelve la misma dependencia una vez por petición—.
SESION = [Depends(usuario_actual)]

# Consola interna del equipo (embudo/seguimiento/add-value), coordinada con
# David — ver app/api/admin.py y app/services/admin/.
app.include_router(admin_router, prefix="/api/admin", tags=["admin"],
                   dependencies=SESION)

# Las cinco pantallas del flujo de inmuebles. Va con el prefijo de admin
# porque es parte de la consola interna, pero en su propio archivo: admin.py
# ya son 700 líneas.
app.include_router(flujo_router, prefix="/api/admin/flujo", tags=["flujo"],
                   dependencies=SESION)

# Los predios publicados, para la web del inversionista.
#
# VA SIN `SESION`, Y ESO ES UNA DECISIÓN, NO UN OLVIDO.
# La página `/predios` del sitio hoy no tiene nada delante: no hay
# middleware, y la autenticación de inversionista no existe todavía (la de
# `usuarios` es la del equipo). Cerrar la API mientras la página sigue
# abierta no protegería el portafolio y sólo dejaría la página en blanco.
#
# Lo que este router expone es únicamente lo publicado y sólo sus campos de
# portafolio — nunca el anuncio original, el contacto del vendedor ni lo que
# está a medio camino. Ver app/api/inmuebles.py.
#
# El día que haya acceso de inversionista, se cierra AQUÍ: se le añade
# `dependencies=` con la dependencia que toque y ni el router ni el servicio
# cambian.
app.include_router(inmuebles_router, prefix="/api/predios", tags=["predios"])

# El HUB va en dos mitades. La de escritura exige sesión Y rol —la dependencia
# vive dentro del router, en `exige_editor`, porque no es "hay sesión" sino
# "este rol concreto"—. La de lectura no exige nada: es lo que pinta la página
# pública, igual que el portafolio de arriba.
app.include_router(hub_admin_router, prefix="/api/admin/hub", tags=["hub"])
app.include_router(hub_publico_router, prefix="/api/hub", tags=["hub"])

# TODO (backend oficial): sumar aquí los routers de dashboard y
# notificaciones cuando estén — no reemplazar este archivo, sólo añadir.


@app.get("/api/salud")
def salud():
    """Para saber si el proceso está vivo sin tener sesión.

    No dice nada de la base a propósito: un endpoint público no debería
    revelar si la base responde o cómo se llama.
    """
    return {"ok": True}
