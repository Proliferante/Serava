"""
services/inmueble_service.py
============================
Los predios publicados, tal y como los pide la web del inversionista.

DE DÓNDE SALE ESTO
    De `inmueble_detalle.ficha`, el JSON que el equipo arma en la consola
    antes de publicar (ver `app/api/flujo.py` y el esquema del frontend en
    `components/admin/ficha/esquema.ts`). Un predio aparece aquí cuando su
    seguimiento está en etapa 'publicado' Y su ficha está marcada como
    publicada: las dos cosas, porque son dos hechos distintos —el inmueble
    avanzó de etapa, y alguien terminó de escribir su contenido— y ninguno
    implica al otro.

LO QUE SE DEVUELVE NO ES LA FILA
    El listado devuelve la forma que dibuja la tarjeta, no el JSON crudo:
    etiqueta, Score, título, metros compuestos, precio, TIR. Armarlo aquí y
    no en la página es lo que permite que mañana la ficha cambie de campos
    sin que /predios se entere.

QUÉ NO HACE
    No filtra por quién pregunta. Esta es información de portafolio y hoy la
    página que la consume está abierta a cualquiera con la URL; cuando eso
    cambie, se cierra en el `include_router` de main.py y aquí no hay nada
    que tocar.
"""

from __future__ import annotations

import re
import unicodedata

from app.core.database import cursor

# Etiqueta de la tarjeta → tono con el que la pinta el diseño. Las claves son
# las opciones del esquema; si llegara una que no está, se pinta neutra en vez
# de reventar: el contenido lo escribe una persona y puede corregirlo luego.
TONOS = {
    "Disponible": "green",
    "Nueva oportunidad": "gold",
    "Alta actividad": "amber",
    "Reserva en curso": "steel",
    "Reserva liberada": "green",
    "Reservada": "dark",
}


def _sin_tildes(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn")


def _pedazo(t: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", _sin_tildes(t or "").lower()).strip("-")


def slug_de(titulo: str | None, zona: str | None, ciudad: str | None,
            ocupados: set[str]) -> str:
    """El nombre del predio en la URL, único y estable.

    Título y zona, porque es lo que alguien reconocería al ver el enlace
    pegado en un chat. Se corta a ~70 caracteres: más largo no aporta y
    algunos clientes de correo parten las URLs largas por la mitad.

    `ocupados` son los slugs que ya existen. Si el que sale está cogido, se
    le pone un número — dos "apartamento en el poblado" es lo más normal del
    mundo en un portafolio.
    """
    base = "-".join(p for p in (_pedazo(titulo or ""), _pedazo(zona or ciudad or "")) if p)
    base = (base[:70].strip("-") or "predio")
    if base not in ocupados:
        return base
    n = 2
    while f"{base}-{n}" in ocupados:
        n += 1
    return f"{base}-{n}"


def slugs_ocupados(con) -> set[str]:
    filas = con.execute(
        "SELECT slug FROM inmueble_detalle WHERE slug IS NOT NULL"
    ).fetchall()
    return {f["slug"] for f in filas}


# Lo que hace falta para la tarjeta y para la ficha. `c.*` puede venir a nulo:
# el anuncio del portal desaparece y el predio publicado sigue existiendo, con
# lo que escribió el equipo, que es lo que de verdad se enseña.
_SELECCION = """
    d.slug, d.ficha, d.ficha_fotos,
    d.titulo, d.habitaciones, d.banos, d.area_confirmada_m2, d.tipo_transformacion,
    d.ficha_guardada_en,
    c.zona, c.ciudad, c.pais
"""

_DESDE = """
    FROM seguimiento_propiedades s
    JOIN inmueble_detalle d ON d.url_inmueble = s.url_inmueble
    LEFT JOIN clean_listings c ON c.link = s.url_inmueble
   WHERE s.etapa = 'publicado'
     AND d.ficha_publicada IS TRUE
     AND d.slug IS NOT NULL
"""


def _txt(ficha: dict, k: str) -> str | None:
    v = ficha.get(k)
    if v is None:
        return None
    v = str(v).strip()
    return v or None


def _numero(v) -> float | None:
    """El número que hay dentro de una cifra escrita a mano.

    Las cifras de la ficha se escriben como se imprimen —«~12,5%», «54,4%»—
    porque así es como las revisa quien las escribe. La tarjeta, en cambio,
    necesita el número para animar la cuenta. Se saca el primero que
    aparezca y se respeta la coma decimal del español.
    """
    if v is None:
        return None
    m = re.search(r"-?\d+(?:[.,]\d+)?", str(v))
    if not m:
        return None
    try:
        return float(m.group(0).replace(".", "").replace(",", "."))
    except ValueError:
        return None


def _specs(ficha: dict) -> str:
    """«320 m² · 3 hab · 3 baños · 4 parq», saltándose lo que falte."""
    partes = []
    area = _numero(ficha.get("spec_area"))
    if area:
        partes.append(f"{area:g} m²")
    for k, sing, plur in (("spec_habitaciones", "hab", "hab"),
                          ("spec_banos", "baño", "baños"),
                          ("spec_parqueaderos", "parq", "parq")):
        n = _numero(ficha.get(k))
        if n:
            partes.append(f"{n:g} {sing if n == 1 else plur}")
    return " · ".join(partes)


def _tarjeta(fila: dict) -> dict:
    ficha = fila.get("ficha") or {}
    fotos = fila.get("ficha_fotos") or {}
    etiqueta = _txt(ficha, "card_badge") or "Disponible"
    ubicacion = (_txt(ficha, "hero_ubicacion")
                 or " · ".join(x for x in (fila.get("zona"), fila.get("ciudad")) if x))

    return {
        "slug": fila["slug"],
        "badge": {"label": etiqueta, "tone": TONOS.get(etiqueta, "green")},
        "score": _numero(ficha.get("score")) or 0,
        # La foto del hero hace de portada. Si aún no hay, la tarjeta pinta su
        # hueco con el pie, que es lo que ya hacía el prototipo.
        "foto": fotos.get("hero"),
        "photo": ubicacion,
        "city": ubicacion,
        "title": _txt(ficha, "hero_titulo") or fila.get("titulo") or "Oportunidad",
        "chip": _txt(ficha, "transformacion_tipo") or fila.get("tipo_transformacion") or "",
        "specs": _specs(ficha),
        "price": _txt(ficha, "inversion_total") or "",
        "priceNote": "Compra + remodelación",
        "tir": _numero(ficha.get("fin_tir")) or 0,
        "horizon": _txt(ficha, "card_horizonte") or "",
        "status": _txt(ficha, "card_estado") or "",
    }


def listado() -> dict:
    """Los predios publicados, en forma de tarjeta, el más reciente primero."""
    with cursor() as con:
        filas = con.execute(
            f"SELECT {_SELECCION} {_DESDE} ORDER BY d.ficha_guardada_en DESC NULLS LAST"
        ).fetchall()

    predios = [_tarjeta(dict(f)) for f in filas]
    ultima = next((f["ficha_guardada_en"] for f in filas if f["ficha_guardada_en"]), None)
    return {
        "predios": predios,
        "total": len(predios),
        "actualizado": ultima.isoformat() if ultima else None,
    }


def ficha(slug: str) -> dict | None:
    """El contenido completo de una ficha publicada, por su slug."""
    with cursor() as con:
        fila = con.execute(
            f"SELECT {_SELECCION} {_DESDE} AND d.slug = ?", (slug,)
        ).fetchone()
    if not fila:
        return None
    f = dict(fila)
    return {
        "slug": f["slug"],
        "ficha": f.get("ficha") or {},
        "fotos": f.get("ficha_fotos") or {},
        "tarjeta": _tarjeta(f),
    }
