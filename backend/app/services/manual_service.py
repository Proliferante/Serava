"""
services/manual_service.py
=========================
Meter un predio a mano, sin que venga del scraping.

POR QUÉ HACE FALTA
    El circuito entero nace de `clean_listings`: el pipeline trae anuncios de
    los portales y el equipo decide sobre ellos. Pero a veces el predio bueno
    aparece por otro lado —un contacto, una visita, un corredor— y no hay
    anuncio que scrapear. Hasta ahora eso no tenía puerta de entrada:
    «Nuevo predio» era una maqueta que se borraba al recargar.

LA CLAVE: UN IDENTIFICADOR QUE OCUPA EL LUGAR DE LA URL
    Las tres tablas del circuito cuelgan de `url_inmueble`. Un predio manual
    no tiene URL, así que se le fabrica una con el prefijo `manual:` —
    `manual:la-cabrera-1502`—. Con eso entra en `seguimiento_propiedades` y
    en `inmueble_detalle` sin tocar el esquema, y el prefijo deja ver de un
    vistazo de dónde salió cada uno.

POR QUÉ NO SE ESCRIBE EN `clean_listings`
    Esa tabla es «lo que encontró el scraper», y el pipeline la reescribe en
    cada corrida. Un predio manual ahí desaparecería a la siguiente, y de
    paso ensuciaría las medianas de precio por zona con un dato que no salió
    del mercado. Su ubicación y su precio viven en `inmueble_detalle`, que
    es la tabla que sobrevive.

POR QUÉ ENTRA EN 'visita' Y NO EN 'nuevo'
    'nuevo' significa «el scraping lo trajo y nadie lo ha mirado», y además
    `_accionables` sólo deja actuar sobre lo que tiene etapa distinta de
    'nuevo': entrar ahí lo dejaría bloqueado.

    Se elige 'visita' y no 'preseleccion' porque un predio que alguien se
    sentó a teclear ya está visto — se mete a mano justo porque se evaluó
    fuera del circuito—. 'visita' es la etapa desde la que el flujo ofrece
    «Completar y publicar», que es el paso que le queda: armarle la ficha y
    sacarlo. Dejarlo en 'preseleccion' le haría repetir una decisión que ya
    se tomó.
"""

from __future__ import annotations

import re
import unicodedata
from datetime import datetime, timezone

from app.core.database import cursor, escribir

PREFIJO = "manual:"

# Columnas que `inmueble_detalle` no tenía: un predio de portal saca la
# ubicación de `clean_listings`, y uno manual no tiene de dónde.
_COLUMNAS = {
    "zona": "TEXT",
    "ciudad": "TEXT",
    "pais": "TEXT",
    "precio_venta": "NUMERIC",
    "parqueaderos": "INTEGER",
    "origen": "TEXT",
}


def _sin_tildes(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn")


def asegurar_columnas() -> None:
    """Añade a `inmueble_detalle` lo que un predio manual necesita guardar.

    `ADD COLUMN IF NOT EXISTS` es idempotente, así que se puede llamar en
    cada arranque sin comprobar nada antes.
    """
    with escribir() as con:
        for nombre, tipo in _COLUMNAS.items():
            con.execute(
                f"ALTER TABLE inmueble_detalle ADD COLUMN IF NOT EXISTS {nombre} {tipo}"
            )


def clave_de(titulo: str, zona: str, ciudad: str, ocupadas: set[str]) -> str:
    """`manual:la-cabrera-1502`, único.

    Se arma con el titular y la zona porque es lo que alguien reconocería al
    verlo en una lista o en un registro de la bitácora.
    """
    trozos = []
    for t in (titulo, zona or ciudad):
        p = re.sub(r"[^a-z0-9]+", "-", _sin_tildes(t or "").lower()).strip("-")
        if p:
            trozos.append(p)
    base = "-".join(trozos)[:70].strip("-") or "predio"
    clave = PREFIJO + base
    if clave not in ocupadas:
        return clave
    n = 2
    while f"{clave}-{n}" in ocupadas:
        n += 1
    return f"{clave}-{n}"


def es_manual(link: str) -> bool:
    return (link or "").startswith(PREFIJO)


def crear(d: dict, responsable: str = "", etapa: str = "visita") -> dict:
    """Registra el predio y lo deja listo para armarle la ficha."""
    if not (d.get("titulo") or "").strip():
        raise ValueError("El nombre del activo no puede estar vacío.")
    if not (d.get("ciudad") or "").strip():
        raise ValueError("Hace falta la ciudad.")

    asegurar_columnas()
    with cursor() as con:
        ocupadas = {
            f["url_inmueble"] for f in con.execute(
                "SELECT url_inmueble FROM seguimiento_propiedades "
                "WHERE url_inmueble LIKE ?", (PREFIJO + "%",)
            ).fetchall()
        }
    link = clave_de(d["titulo"], d.get("zona", ""), d["ciudad"], ocupadas)
    ahora = datetime.now(timezone.utc)

    with escribir() as con:
        con.execute(
            "INSERT INTO seguimiento_propiedades "
            "(url_inmueble, etapa, responsable, estado_seguimiento, "
            " filtro_arquitectonico, disponible, fecha_actualizacion) "
            "VALUES (?,?,?,?,?,?,?)",
            (link, etapa, responsable, "Registrado a mano",
             "pasa", "disponible", ahora.isoformat()),
        )
        con.execute(
            "INSERT INTO inmueble_detalle "
            "(url_inmueble, titulo, habitaciones, banos, area_confirmada_m2, "
            " tipo_transformacion, notas_visita, zona, ciudad, pais, "
            " precio_venta, parqueaderos, origen, actualizado_en, actualizado_por) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (link, d["titulo"].strip(), d.get("habitaciones"), d.get("banos"),
             d.get("area"), (d.get("tipo_transformacion") or "").strip() or None,
             (d.get("notas") or "").strip() or None,
             (d.get("zona") or "").strip() or None, d["ciudad"].strip(),
             (d.get("pais") or "").strip() or None, d.get("precio"),
             d.get("parqueaderos"), "manual", ahora, responsable),
        )
    return {"link": link, "titulo": d["titulo"].strip(), "etapa": etapa}
