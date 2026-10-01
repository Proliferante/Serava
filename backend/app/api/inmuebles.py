"""
api/inmuebles.py
================
Los predios publicados, para la web del inversionista. Montado en /api/predios.

    GET /api/predios          el portafolio publicado, en forma de tarjeta
    GET /api/predios/{slug}   la ficha completa de uno

ESTO EXIGE SESIÓN DE INVERSIONISTA (desde el 29 de septiembre de 2026)
    La dependencia se pone en el `include_router` de main.py. Lo de abajo es
    la historia de por qué estuvo abierto.

ESTUVO SIN SESIÓN, Y FUE A PROPÓSITO
    La página `/predios` del sitio hoy la ve cualquiera con la URL: no hay
    middleware delante ni autenticación de inversionista construida. Este
    router refleja eso y no inventa una protección que la página no tiene
    —una API cerrada delante de una página abierta no protege nada y sólo
    rompe la página—.

    Cuando exista el acceso de inversionista, se cierra en un sitio: el
    `include_router` de main.py, añadiéndole la dependencia. Ni este archivo
    ni el servicio cambian.

    Lo que sí hace es no devolver nada que no sea del portafolio: ni la URL
    del anuncio original, ni el contacto del vendedor, ni las notas de la
    visita, ni en qué etapa está lo que aún no se publicó. Eso vive en
    `/api/admin` y ahí se queda.

POR QUÉ 404 Y NO 403 CUANDO NO ESTÁ PUBLICADO
    Un predio que existe pero está en visita no debe distinguirse de uno que
    no existe. Si respondiera distinto, probar slugs diría qué está a punto de
    salir al mercado.
"""

from fastapi import APIRouter, HTTPException, Path, Response

from app.core.database import tabla_existe
from app.services import inmueble_service as svc

router = APIRouter()

# Sin caché compartida. Hubo un minuto de caché en el CDN
# (`public, s-maxage=60`), que tenía sentido mientras esto era público.
# Desde que exige sesión, con `public` el CDN de Vercel guardaría la
# respuesta de un inversionista con sesión y se la serviría al siguiente que
# llegara sin ella, saltándose el login entero.
CACHE = "private, no-store"


@router.get("")
def listado(respuesta: Response):
    """El portafolio publicado.

    Si todavía no hay pipeline —base recién montada— devuelve una lista
    vacía en vez de un error: la página tiene que poder decir "aún no hay
    oportunidades publicadas", que es verdad, y no "algo falló".
    """
    respuesta.headers["Cache-Control"] = CACHE
    if not tabla_existe("inmueble_detalle"):
        return {"predios": [], "total": 0, "actualizado": None}
    return svc.listado()


@router.get("/{slug}")
def una(respuesta: Response,
        slug: str = Path(min_length=1, max_length=120, pattern=r"^[a-z0-9-]+$")):
    """La ficha completa de un predio publicado."""
    respuesta.headers["Cache-Control"] = CACHE
    if not tabla_existe("inmueble_detalle"):
        raise HTTPException(404, "No existe ese predio.")
    d = svc.ficha(slug)
    if not d:
        raise HTTPException(404, "No existe ese predio.")
    return d
