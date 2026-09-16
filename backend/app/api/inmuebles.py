"""
api/inmuebles.py
================
Los predios publicados, para la web del inversionista. Montado en /api/predios.

    GET /api/predios          el portafolio publicado, en forma de tarjeta
    GET /api/predios/{slug}   la ficha completa de uno

ESTO NO EXIGE SESIÓN, Y ES A PROPÓSITO
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

# La web pide esto en cada visita y cambia cuando alguien publica, o sea
# rara vez. Un minuto de caché en el CDN y diez de "sirve lo viejo mientras
# revalidas" es lo que separa una página que responde al instante de una que
# espera a Supabase en cada carga.
CACHE = "public, s-maxage=60, stale-while-revalidate=600"


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
