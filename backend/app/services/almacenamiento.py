"""
services/almacenamiento.py
==========================
Las fotos de la ficha del predio, guardadas en Supabase Storage.

POR QUÉ NO EN LA BASE Y POR QUÉ NO EN EL DISCO
    En la base no, porque una foto de hero son 3-8 MB y meterlos en una
    columna convierte cada `SELECT *` del detalle en una descarga: la
    pantalla del flujo lee ese detalle para pintar una tabla de quinientas
    filas.

    En el disco del servidor tampoco: el backend se despliega en un
    contenedor cuyo sistema de archivos se rehace en cada despliegue. Las
    fotos durarían hasta el siguiente `git push`.

    Queda el almacén de objetos, y ya hay uno pagado: el proyecto vive en
    Supabase, que trae Storage con el mismo proyecto y la misma clave.

POR QUÉ PASA POR EL BACKEND Y NO SUBE EL NAVEGADOR DIRECTO
    Subir al bucket exige la clave `service_role`, que puede leer y escribir
    cualquier tabla saltándose las políticas de fila. Esa clave no puede
    salir al navegador. Subir desde el frontend obligaría a montar URLs
    firmadas, que es otra pieza más; con el volumen de esto —unas quince
    fotos por predio, unos pocos predios al mes— pasar los bytes por el
    backend cuesta menos de mantener.

SI NO ESTÁ CONFIGURADO
    `disponible()` dice que no y la subida responde con un mensaje que
    explica qué falta. El resto de la consola no se entera: no se tumba el
    arranque por unas fotos que puede que todavía no se usen.
"""

from __future__ import annotations

import mimetypes
import re
import unicodedata
import uuid
from datetime import datetime, timezone

import requests

from app.core import config

# Sólo imágenes, y sólo las que un navegador pinta sin ayuda. El PDF y el
# HEIC de un iPhone se rechazan aquí y no en el `<input accept>`: el atributo
# del formulario es una sugerencia que cualquiera se salta arrastrando.
TIPOS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
}

TIEMPO_ESPERA = 30


class AlmacenNoConfigurado(RuntimeError):
    """Faltan las variables de Supabase Storage."""


class ErrorDeSubida(RuntimeError):
    """Supabase rechazó la subida o no respondió."""


def disponible() -> bool:
    return bool(config.SUPABASE_URL and config.SUPABASE_SERVICE_KEY)


def _exige_configuracion() -> None:
    if not disponible():
        raise AlmacenNoConfigurado(
            "El almacén de fotos no está configurado. Faltan SUPABASE_URL y/o "
            "SUPABASE_SERVICE_KEY en el entorno del backend (ver "
            "backend/.env.example)."
        )


def _cabeceras(tipo: str | None = None) -> dict[str, str]:
    h = {
        "Authorization": f"Bearer {config.SUPABASE_SERVICE_KEY}",
        # Supabase pide las dos: la cabecera propia y la de OAuth.
        "apikey": config.SUPABASE_SERVICE_KEY,
    }
    if tipo:
        h["Content-Type"] = tipo
        # Subir la misma ranura dos veces reemplaza, no falla: cambiar la foto
        # del hero es lo más normal del mundo y no tiene por qué dejar basura.
        h["x-upsert"] = "true"
    return h


def _sin_tildes(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto)
        if unicodedata.category(c) != "Mn"
    )


def _tajada(texto: str, tope: int = 40) -> str:
    """Un trozo de texto convertido en algo que puede ir en una ruta.

    Sin tildes, sin espacios y sin nada que no sea letra, número o guión: el
    nombre acaba dentro de una URL, y un `ñ` o un `%20` ahí es una fuente
    inagotable de enlaces que funcionan en un sitio y no en otro.
    """
    limpio = re.sub(r"[^a-zA-Z0-9]+", "-", _sin_tildes(texto)).strip("-").lower()
    return (limpio[:tope].strip("-") or "predio")


def ruta_de(link: str, ranura: str, nombre_original: str, tipo: str) -> str:
    """Dónde vive el archivo dentro del bucket.

    `fichas/<predio>/<ranura>-<sello>.<ext>`

    El predio sale de la URL del anuncio, que es la clave del inmueble en
    todo el flujo. El sello con la fecha y un trozo al azar hace que subir
    otra foto a la misma ranura no reutilice el nombre: si lo reutilizara,
    la CDN de Supabase seguiría sirviendo la anterior durante horas y el
    equipo juraría que la subida no funciona.
    """
    ext = TIPOS.get(tipo) or mimetypes.guess_extension(tipo) or ".bin"
    sello = datetime.now(timezone.utc).strftime("%Y%m%d") + "-" + uuid.uuid4().hex[:8]
    return f"{_tajada(link, 60)}/{_tajada(ranura)}-{sello}{ext}"


def url_publica(ruta: str) -> str:
    return f"{config.SUPABASE_URL}/storage/v1/object/public/{config.SUPABASE_BUCKET}/{ruta}"


def subir(datos: bytes, ruta: str, tipo: str) -> str:
    """Sube los bytes y devuelve la URL pública. Lanza si algo falla."""
    _exige_configuracion()
    destino = f"{config.SUPABASE_URL}/storage/v1/object/{config.SUPABASE_BUCKET}/{ruta}"
    try:
        r = requests.post(destino, headers=_cabeceras(tipo), data=datos,
                          timeout=TIEMPO_ESPERA)
    except requests.RequestException as e:
        raise ErrorDeSubida(f"No se pudo hablar con el almacén: {e}") from e

    if r.status_code >= 400:
        # El cuerpo de Supabase trae el motivo real ("Bucket not found",
        # "new row violates row-level security policy"…). Sin él, el equipo
        # sólo vería un 500 y no sabría si falta el bucket o la clave.
        detalle = (r.text or "").strip()[:300]
        # Se nombra el bucket que se intentó: "Bucket not found" a secas no
        # dice si el que falta es el que crees. Supabase distingue mayúsculas,
        # y ese ha sido el fallo real más de una vez.
        raise ErrorDeSubida(
            f"El almacén respondió {r.status_code} al subir a "
            f"'{config.SUPABASE_BUCKET}': {detalle}"
        )

    return url_publica(ruta)


def borrar(ruta: str) -> None:
    """Quita un archivo del bucket. No lanza si ya no estaba.

    Que no lance es a propósito: se llama al reemplazar una foto, y si la
    anterior ya no está —porque alguien la borró desde Supabase, o porque la
    ranura nunca llegó a tener nada— eso no es un fallo del que haya que
    avisar a nadie.
    """
    if not disponible() or not ruta:
        return
    destino = f"{config.SUPABASE_URL}/storage/v1/object/{config.SUPABASE_BUCKET}/{ruta}"
    try:
        requests.delete(destino, headers=_cabeceras(), timeout=TIEMPO_ESPERA)
    except requests.RequestException:
        pass


def ruta_de_url(url: str) -> str | None:
    """De la URL pública de vuelta a la ruta dentro del bucket.

    Hace falta para borrar: lo que se guarda en la base es la URL —es lo que
    el navegador necesita— y borrar pide la ruta. Si la URL no es de este
    bucket, devuelve None y no se toca nada: puede ser una foto que alguien
    pegó de otro sitio.
    """
    marca = f"/storage/v1/object/public/{config.SUPABASE_BUCKET}/"
    i = url.find(marca)
    return url[i + len(marca):] if i != -1 else None
