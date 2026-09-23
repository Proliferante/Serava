"""
services/hub_service.py
=======================
El contenido del HUB: artículos, videos y noticias.

QUÉ ES EL HUB
    La página pública `/hub` enseña una rejilla de tarjetas con tres tipos de
    contenido —artículo, video y noticia— clasificadas en cinco categorías:
    Patrimonio, Mercado, Remodelación, Zonas y Legal. Hasta ahora esas ocho
    tarjetas estaban escritas a mano en el código, con `href="#"`: se veían
    bien y no llevaban a ninguna parte.

    Esto es lo que las convierte en contenido de verdad, que el equipo sube
    desde la consola.

POR QUÉ EL TÍTULO Y LA DESCRIPCIÓN SON UNA SOLA CADENA
    El diseño las parte en renglones (`title: ["Zonas donde la demanda",
    "defiende el valor por sí sola"]`) porque el lienzo es de medidas fijas.
    Pedirle eso a quien escribe sería absurdo: aquí se guarda el texto
    entero y es la tarjeta la que lo reparte. Lo que el diseño necesita se
    calcula, no se teclea.

QUÉ NO HACE
    No guarda el cuerpo del artículo. Una tarjeta lleva a `enlace`, que hoy
    es una URL externa —un PDF, un YouTube, una nota en otro sitio—. Cuando
    haga falta publicar el texto completo dentro de la web, esta tabla gana
    una columna y la tarjeta deja de salir fuera.
"""

from __future__ import annotations

import re
import unicodedata
from datetime import datetime, timezone

from app.core.database import cursor, escribir

# Los tres tipos del diseño. La clave es la que usa el frontend; el valor, lo
# que se lee en la consola.
TIPOS = {
    "article": "Artículo",
    "video": "Video",
    "noticia": "Noticia",
}

# Las cinco categorías son las que filtran la página. No se dejan libres a
# propósito: son los chips del hero, y una sexta escrita a mano saldría en la
# rejilla sin filtro que la encuentre.
CATEGORIAS = ["Patrimonio", "Mercado", "Remodelación", "Zonas", "Legal"]


def _sin_tildes(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn")


def slug_de(titulo: str, ocupados: set[str]) -> str:
    """El nombre en la URL, a partir del título. Único."""
    base = re.sub(r"[^a-z0-9]+", "-", _sin_tildes(titulo or "").lower()).strip("-")
    base = (base[:70].strip("-") or "contenido")
    if base not in ocupados:
        return base
    n = 2
    while f"{base}-{n}" in ocupados:
        n += 1
    return f"{base}-{n}"


def asegurar_tabla() -> None:
    """Crea la tabla si no está. Se llama al arrancar."""
    with escribir() as con:
        con.execute(
            """
            CREATE TABLE IF NOT EXISTS hub_contenido (
                id            SERIAL PRIMARY KEY,
                slug          TEXT UNIQUE NOT NULL,
                tipo          TEXT NOT NULL,
                categoria     TEXT NOT NULL,
                titulo        TEXT NOT NULL,
                descripcion   TEXT NOT NULL DEFAULT '',
                meta          TEXT NOT NULL DEFAULT '',
                enlace        TEXT NOT NULL DEFAULT '',
                foto          TEXT,
                pie_foto      TEXT NOT NULL DEFAULT '',
                destacado     BOOLEAN NOT NULL DEFAULT FALSE,
                publicado     BOOLEAN NOT NULL DEFAULT FALSE,
                orden         INTEGER NOT NULL DEFAULT 0,
                creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),
                actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
                creado_por    TEXT NOT NULL DEFAULT ''
            )
            """
        )


_CAMPOS = ("slug, tipo, categoria, titulo, descripcion, meta, enlace, foto, "
           "pie_foto, destacado, publicado, orden, creado_en, actualizado_en, "
           "creado_por, id")


def _fila(f: dict) -> dict:
    d = dict(f)
    for k in ("creado_en", "actualizado_en"):
        if d.get(k):
            d[k] = d[k].isoformat()
    return d


def listar(solo_publicados: bool = False) -> list[dict]:
    """Todo el contenido. El destacado primero, luego por orden y fecha."""
    donde = "WHERE publicado IS TRUE" if solo_publicados else ""
    with cursor() as con:
        filas = con.execute(
            f"SELECT {_CAMPOS} FROM hub_contenido {donde} "
            "ORDER BY destacado DESC, orden ASC, creado_en DESC"
        ).fetchall()
    return [_fila(f) for f in filas]


def por_slug(slug: str) -> dict | None:
    with cursor() as con:
        f = con.execute(
            f"SELECT {_CAMPOS} FROM hub_contenido WHERE slug = ?", (slug,)
        ).fetchone()
    return _fila(f) if f else None


def _validar(d: dict) -> None:
    if d.get("tipo") not in TIPOS:
        raise ValueError(f"Tipo inválido. Válidos: {', '.join(TIPOS)}")
    if d.get("categoria") not in CATEGORIAS:
        raise ValueError(f"Categoría inválida. Válidas: {', '.join(CATEGORIAS)}")
    if not (d.get("titulo") or "").strip():
        raise ValueError("El título no puede estar vacío.")


def crear(d: dict, quien: str = "") -> dict:
    _validar(d)
    with cursor() as con:
        ocupados = {f["slug"] for f in con.execute("SELECT slug FROM hub_contenido").fetchall()}
    slug = slug_de(d["titulo"], ocupados)
    with escribir() as con:
        con.execute(
            "INSERT INTO hub_contenido (slug, tipo, categoria, titulo, descripcion, "
            "meta, enlace, foto, pie_foto, destacado, publicado, orden, creado_por) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (slug, d["tipo"], d["categoria"], d["titulo"].strip(),
             (d.get("descripcion") or "").strip(), (d.get("meta") or "").strip(),
             (d.get("enlace") or "").strip(), d.get("foto"),
             (d.get("pie_foto") or "").strip(), bool(d.get("destacado")),
             bool(d.get("publicado")), int(d.get("orden") or 0), quien),
        )
    if d.get("destacado"):
        _solo_un_destacado(slug)
    return por_slug(slug)


def actualizar(slug: str, d: dict, quien: str = "") -> dict | None:
    if por_slug(slug) is None:
        return None
    _validar(d)
    with escribir() as con:
        con.execute(
            "UPDATE hub_contenido SET tipo = ?, categoria = ?, titulo = ?, "
            "descripcion = ?, meta = ?, enlace = ?, foto = ?, pie_foto = ?, "
            "destacado = ?, publicado = ?, orden = ?, actualizado_en = ?, "
            "creado_por = ? WHERE slug = ?",
            (d["tipo"], d["categoria"], d["titulo"].strip(),
             (d.get("descripcion") or "").strip(), (d.get("meta") or "").strip(),
             (d.get("enlace") or "").strip(), d.get("foto"),
             (d.get("pie_foto") or "").strip(), bool(d.get("destacado")),
             bool(d.get("publicado")), int(d.get("orden") or 0),
             datetime.now(timezone.utc), quien, slug),
        )
    if d.get("destacado"):
        _solo_un_destacado(slug)
    return por_slug(slug)


def borrar(slug: str) -> bool:
    if por_slug(slug) is None:
        return False
    with escribir() as con:
        con.execute("DELETE FROM hub_contenido WHERE slug = ?", (slug,))
    return True


def _solo_un_destacado(slug: str) -> None:
    """El hero del HUB enseña UN artículo destacado, no una lista.

    Marcar uno nuevo desmarca el anterior en vez de dar un error: quien lo
    pulsa quiere que sea ése, y obligarle a ir a buscar el viejo para
    desmarcarlo es trabajo que la máquina puede hacer sola.
    """
    with escribir() as con:
        con.execute(
            "UPDATE hub_contenido SET destacado = FALSE WHERE slug <> ?", (slug,)
        )
