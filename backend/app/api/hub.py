"""
api/hub.py
==========
El contenido del HUB: lo que el equipo sube y lo que la web enseña.

DOS ROUTERS EN UN ARCHIVO, Y ES A PROPÓSITO
    `router_admin` se monta en /api/admin/hub y exige sesión con rol admin o
    comercial: es quien escribe. `router_publico` se monta en /api/hub, no
    exige nada y sólo devuelve lo publicado: es lo que lee la página.

    Están juntos porque comparten la forma de los datos y separarlos en dos
    archivos obligaría a leer los dos para entender uno. Lo que no comparten
    —quién puede llamarlos— se ve de un vistazo en `main.py`.

POR QUÉ ADMIN Y COMERCIAL, Y NO CUALQUIERA
    Subir al HUB es publicar en la web pública con la voz de la empresa. Eso
    no es lo mismo que mover un inmueble de etapa. Arquitectura y Data
    trabajan hacia dentro; esto sale hacia fuera.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path, Response, UploadFile
from pydantic import BaseModel, Field

from app.api.auth import exige_rol
from app.core import config
from app.core.database import tabla_existe
from app.services import almacenamiento
from app.services import hub_service as svc

router_admin = APIRouter()
router_publico = APIRouter()

# Quien puede publicar en el HUB.
exige_editor = exige_rol("admin", "comercial")

LIMITE_TITULO = 160
LIMITE_TEXTO = 600


class Contenido(BaseModel):
    tipo: str = Field(max_length=20)
    categoria: str = Field(max_length=40)
    titulo: str = Field(min_length=3, max_length=LIMITE_TITULO)
    descripcion: str = Field(default="", max_length=LIMITE_TEXTO)
    meta: str = Field(default="", max_length=80)
    enlace: str = Field(default="", max_length=500)
    foto: str | None = Field(default=None, max_length=500)
    pie_foto: str = Field(default="", max_length=120)
    destacado: bool = False
    publicado: bool = False
    orden: int = 0


# ── Lo que lee la consola ───────────────────────────────────────────────────

@router_admin.get("/opciones")
def opciones(_: dict = Depends(exige_editor)):
    """Los tipos y las categorías, para que la consola no los repita a mano."""
    return {
        "tipos": [{"k": k, "l": v} for k, v in svc.TIPOS.items()],
        "categorias": svc.CATEGORIAS,
        "almacen_listo": almacenamiento.disponible(),
    }


@router_admin.get("")
def listar(_: dict = Depends(exige_editor)):
    svc.asegurar_tabla()
    return {"contenido": svc.listar()}


@router_admin.post("")
def crear(p: Contenido, u: dict = Depends(exige_editor)):
    svc.asegurar_tabla()
    try:
        return svc.crear(p.model_dump(), quien=f"{u['nombre']} ({u['rol']})")
    except ValueError as e:
        raise HTTPException(400, str(e)) from e


@router_admin.put("/{slug}")
def actualizar(p: Contenido, slug: str = Path(max_length=90),
               u: dict = Depends(exige_editor)):
    svc.asegurar_tabla()
    try:
        hecho = svc.actualizar(slug, p.model_dump(), quien=f"{u['nombre']} ({u['rol']})")
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    if hecho is None:
        raise HTTPException(404, "Ese contenido ya no existe.")
    return hecho


@router_admin.delete("/{slug}")
def borrar(slug: str = Path(max_length=90), _: dict = Depends(exige_editor)):
    svc.asegurar_tabla()
    if not svc.borrar(slug):
        raise HTTPException(404, "Ese contenido ya no existe.")
    return {"ok": True}


@router_admin.post("/foto")
def subir_foto(
    archivo: UploadFile = File(...),
    _: dict = Depends(exige_editor),
):
    """Sube la imagen de una tarjeta y devuelve su URL pública.

    No recibe el slug: la foto se elige antes de guardar, cuando el contenido
    todavía no existe. Va a su propia carpeta del bucket y el nombre lleva
    fecha y azar, como las de la ficha.
    """
    if not almacenamiento.disponible():
        raise HTTPException(
            503,
            "El almacén de fotos no está configurado. Falta SUPABASE_URL y/o "
            "SUPABASE_SERVICE_KEY en el backend.",
        )
    tipo = (archivo.content_type or "").lower()
    if tipo not in almacenamiento.TIPOS:
        raise HTTPException(415, "Formato no admitido. Se aceptan JPG, PNG, WebP y AVIF.")

    datos = archivo.file.read()
    tope = config.FOTO_MAXIMA_MB * 1024 * 1024
    if not datos:
        raise HTTPException(400, "El archivo llegó vacío.")
    if len(datos) > tope:
        raise HTTPException(
            413,
            f"La imagen pesa {len(datos) / 1048576:.1f} MB y el tope son "
            f"{config.FOTO_MAXIMA_MB} MB.",
        )

    ruta = almacenamiento.ruta_de("hub", "tarjeta", archivo.filename or "", tipo)
    try:
        url = almacenamiento.subir(datos, ruta, tipo)
    except almacenamiento.ErrorDeSubida as e:
        raise HTTPException(502, str(e)) from e
    return {"url": url}


# ── Lo que lee la web ───────────────────────────────────────────────────────

@router_publico.get("")
def publico(respuesta: Response):
    """El contenido publicado, para la página /hub.

    Igual que el portafolio: se cachea un minuto en el CDN, porque cambia
    cuando alguien publica y eso no pasa cada visita.
    """
    respuesta.headers["Cache-Control"] = "public, s-maxage=60, stale-while-revalidate=600"
    if not tabla_existe("hub_contenido"):
        return {"contenido": [], "total": 0}
    items = svc.listar(solo_publicados=True)
    return {"contenido": items, "total": len(items)}
