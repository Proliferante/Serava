"""
api/flujo.py
============
Las cinco pantallas del flujo de inmuebles, montado en /api/admin/flujo.

    GET  /api/admin/flujo?etapa=nuevo       listado de una etapa
    GET  /api/admin/flujo/conteos           cuántos hay en cada etapa
    POST /api/admin/flujo/decidir           continúa / no continúa / no disponible
    POST /api/admin/flujo/visita            agendar visita
    POST /api/admin/flujo/completar         completar tras la visita y publicar

DE DÓNDE SALEN LOS DATOS
    El inmueble vive en `clean_listings`, que el pipeline reconstruye en
    cada corrida. Su estado —en qué etapa va, quién lo decidió y por qué—
    vive en `seguimiento_propiedades`, que el pipeline nunca toca. Y lo que
    el equipo completa tras la visita, en `inmueble_detalle`.

    Las tres se unen por la URL del anuncio, que es lo único estable entre
    corridas: los ids de fila de clean_listings cambian cada vez que se
    vuelve a escribir la tabla.

    Un inmueble que el scraping trae por primera vez no tiene fila en
    seguimiento: se considera etapa 'nuevo'. Por eso la consulta de la
    etapa 'nuevo' es un LEFT JOIN con `etapa IS NULL OR etapa = 'nuevo'`, y
    no un filtro sobre seguimiento.

POR QUÉ LA ETAPA NO SE DEDUCE, SE GUARDA
    Se podría inferir de los otros campos (filtro_arquitectonico, disponible,
    si hay cita…), pero entonces cada pantalla tendría que repetir esa
    lógica y bastaría una discrepancia para que un inmueble apareciera en
    dos etapas a la vez o en ninguna. Con la columna `etapa`, cada
    transición es una escritura explícita y auditable.

    Los campos de detalle se siguen escribiendo igual —`filtro_arquitectonico`,
    `disponible`, `motivo_*`— porque de ellos depende el cruce del pipeline
    y el "no vuelve a entrar". La etapa es el resumen, no el sustituto.
"""

import csv
import io
import re
from datetime import datetime, timezone
from urllib.parse import unquote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel, Field

from app.api.auth import usuario_actual
from app.core.database import cursor, escribir, tabla_existe

router = APIRouter()

ETAPAS = ("nuevo", "preseleccion", "visita", "publicado", "descartado")

# Los dos filtros del arquitecto: el flujo sólo trabaja sobre inmuebles que
# ya los cumplen, igual que el resto de la consola (ver admin.py). Están
# aquí repetidos y no importados para que este módulo no dependa del otro:
# si mañana el flujo tiene su propio criterio, se cambia sólo aquí.
CRITERIOS = [
    "(c.dentro_poligono_real = 1 OR c.similar_a_zona = 1 OR c.dentro_poligono_real IS NULL)",
    "c.bajo_media_zona = 1",
]

# Lo que necesitan las cinco pantallas de cada inmueble.
SELECCION = """
    c.link,
    -- El título que confirmó arquitectura al completar (d.titulo) gana sobre
    -- el que traía el anuncio (c.titulo). Antes sólo se leía el del anuncio,
    -- así que lo que se escribía en "completar" no volvía a verse nunca — y en
    -- Panamá muchos anuncios vienen sin título, con lo que la pantalla 5
    -- quedaba en "(sin título)" después de haberlo escrito a mano.
    COALESCE(d.titulo, c.titulo) AS titulo,
    c.titulo AS titulo_anuncio,
    c.zona, c.ciudad, c.pais, c.moneda, c.portal,
    c.tipo_inmueble, c.precio_venta, c.area_m2, c.precio_m2,
    c.mediana_precio_m2_zona, c.habitaciones, c.banos,
    c.precio_m2_clasificacion, c.fecha_extraccion,
    COALESCE(s.etapa, 'nuevo')             AS etapa,
    s.filtro_arquitectonico, s.motivo_no_pasa,
    s.disponible, s.motivo_no_disponible,
    s.estado_seguimiento, s.responsable, s.fecha_actualizacion,
    d.contacto_nombre, d.contacto_telefono,
    d.visita_fecha, d.visita_hora, d.visita_notas,
    d.habitaciones           AS habitaciones_confirmadas,
    d.banos                  AS banos_confirmados,
    d.area_confirmada_m2, d.tipo_transformacion, d.notas_visita
"""

DESDE = """
    FROM clean_listings c
    LEFT JOIN seguimiento_propiedades s ON s.url_inmueble = c.link
    LEFT JOIN inmueble_detalle       d ON d.url_inmueble = c.link
"""


def _titulo_del_enlace(link: str | None) -> str | None:
    """El título que el portal dejó en la ruta del enlace.

    Muchos anuncios de encuentra24 llegan sin `titulo`, y la ruta lleva su
    descripción: `.../venta-de-apartamento-en-marbella/30971715`. Mismo
    criterio que `tituloDelEnlace` en el frontend, para que el CSV y la
    pantalla digan lo mismo.
    """
    if not link:
        return None
    tramos = [t for t in link.split("?")[0].split("#")[0].split("/") if t]
    for tramo in reversed(tramos):
        if "-" in tramo and re.search(r"[a-zA-Z]{3}", tramo):
            texto = unquote(tramo).replace("-", " ").strip()
            if len(texto) >= 8:
                return texto[0].upper() + texto[1:]
    return None


def _exige_pipeline():
    if not tabla_existe("clean_listings"):
        raise HTTPException(
            404, "Todavía no existe clean_listings. Corre una extracción primero."
        )


def _asegura_seguimiento(con, link: str):
    """Crea la fila de seguimiento si el inmueble aún no tenía ninguna.

    Hace falta porque `inmueble_detalle` apunta a `seguimiento_propiedades`
    con una clave ajena: sin la fila padre, guardar una visita fallaría.
    """
    con.execute(
        """INSERT INTO seguimiento_propiedades (url_inmueble)
           VALUES (?) ON CONFLICT (url_inmueble) DO NOTHING""",
        (link,),
    )


def _existe_y_cumple(links: list[str]) -> set[str]:
    """Cuáles de estos links existen hoy y cumplen los criterios.

    Se le pregunta a la base, no a la pantalla: que el HTML no ofreciera el
    botón no impide que alguien mande el link a mano.
    """
    if not links:
        return set()
    with cursor() as con:
        marcadores = ",".join("?" * len(links))
        filas = con.execute(
            f"SELECT c.link FROM clean_listings c "
            f"WHERE c.link IN ({marcadores}) AND {' AND '.join(CRITERIOS)}",
            links,
        ).fetchall()
    return {f["link"] for f in filas}


# ---------------------------------------------------------------------------
# LECTURA
# ---------------------------------------------------------------------------

def _condicion_de_etapa(etapa: str) -> tuple[str, list]:
    """El WHERE de una etapa. 'nuevo' incluye lo que nunca tuvo seguimiento."""
    if etapa not in ETAPAS:
        raise HTTPException(400, f"Etapa inválida. Válidas: {', '.join(ETAPAS)}")
    if etapa == "nuevo":
        return "(s.etapa IS NULL OR s.etapa = 'nuevo')", []
    return "s.etapa = ?", [etapa]


@router.get("")
def listar(
    etapa: str = Query("nuevo", description="nuevo|preseleccion|visita|publicado|descartado"),
    limite: int = Query(500, ge=1, le=2000),
    _: dict = Depends(usuario_actual),
):
    _exige_pipeline()
    cond, params = _condicion_de_etapa(etapa)

    # Orden: lo más reciente primero. Antes iba por precio/m² ascendente, y el
    # efecto era el contrario del buscado — los precios más bajos del universo
    # son casi siempre errores de digitación del anuncio (hay registros a
    # US$5/m² cuando la mediana de Panamá es 1.692), así que la pantalla
    # "Resultado del último scraping" abría con la basura arriba y lo bueno
    # enterrado. Por fecha, la primera página es lo que de verdad trajo la
    # última corrida, que es lo que la pantalla dice ser.
    with cursor() as con:
        filas = con.execute(
            f"SELECT {SELECCION} {DESDE} "
            f"WHERE {' AND '.join(CRITERIOS)} AND {cond} "
            f"ORDER BY c.fecha_extraccion DESC NULLS LAST, c.precio_m2 ASC "
            f"LIMIT {int(limite)}",
            params,
        ).fetchall()

        # El total de la etapa, no el de la página: sin esto la pantalla decía
        # "500 inmuebles" cuando hay 5.444, que es el tope de la consulta
        # haciéndose pasar por un dato.
        total = con.execute(
            f"SELECT count(*) AS n {DESDE} WHERE {' AND '.join(CRITERIOS)} AND {cond}",
            params,
        ).fetchone()["n"]

    return {
        "etapa": etapa,
        "filas": [dict(f) for f in filas],
        "total": total,
        "truncado": total > len(filas),
    }


# Las columnas del CSV, en el orden en que salen. Son las que el correo pide
# para revisar el listado por fuera: identificar el inmueble, su precio y su
# enlace. Nada de estado interno.
CSV_CABECERA = ("Titulo", "Zona", "Ciudad", "Precio", "Area m2",
                "Precio m2", "Publicacion")


@router.get("/csv")
def csv_de_etapa(
    etapa: str = Query("nuevo", description="nuevo|preseleccion|visita|publicado|descartado"),
    _: dict = Depends(usuario_actual),
):
    """El listado COMPLETO de una etapa, en CSV.

    Existe porque la descarga se hacía en el navegador con lo que la pantalla
    ya tenía cargado —500 filas— y el correo pide "el listado general": son
    5.444. Un CSV que dice ser el listado y trae el 9% es peor que no tenerlo.

    Aquí no hay LIMIT. Se puede porque un CSV de todo el universo son unos
    cientos de miles de bytes —siete columnas de texto, no las cuarenta del
    JSON— y porque se pide a mano, no en cada carga de pantalla.

    El título se resuelve igual que en pantalla: el del anuncio, y si viene
    vacío, el que se saca de la ruta del enlace (ver `tituloDelEnlace` en el
    frontend). Aquí se hace en Python para que el archivo no salga con una
    columna de "(sin titulo)".
    """
    _exige_pipeline()
    cond, params = _condicion_de_etapa(etapa)

    with cursor() as con:
        filas = con.execute(
            f"SELECT {SELECCION} {DESDE} "
            f"WHERE {' AND '.join(CRITERIOS)} AND {cond} "
            f"ORDER BY c.fecha_extraccion DESC NULLS LAST, c.precio_m2 ASC",
            params,
        ).fetchall()

    salida = io.StringIO()
    # `lineterminator` explícito: el csv de Python termina las líneas con
    # CRLF por defecto, y eso dentro de una respuesta HTTP deja una línea en
    # blanco entre filas al abrirlo en Excel.
    escritor = csv.writer(salida, lineterminator="\n")
    escritor.writerow(CSV_CABECERA)
    for f in filas:
        escritor.writerow([
            f["titulo"] or _titulo_del_enlace(f["link"]) or "",
            f["zona"] or "", f["ciudad"] or "",
            f["precio_venta"] if f["precio_venta"] is not None else "",
            f["area_m2"] if f["area_m2"] is not None else "",
            f["precio_m2"] if f["precio_m2"] is not None else "",
            f["link"] or "",
        ])

    nombre = f"zequara_{etapa}.csv"
    return Response(
        # El BOM va a propósito: sin él, Excel en Windows abre el archivo en
        # su codificación local y los acentos salen rotos.
        content="\ufeff" + salida.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre}"',
            # Cuántos van, para que la consola pueda decirlo sin contar líneas.
            "X-Filas": str(len(filas)),
        },
    )


@router.get("/conteos")
def conteos(_: dict = Depends(usuario_actual)):
    """Los números de las pestañas, en una sola consulta.

    Las pantallas 1 y 2 miran las dos la etapa 'nuevo' —lo que llegó y lo
    que hay que decidir son la misma bandeja—, así que el frontend usa el
    mismo conteo para ambas.
    """
    _exige_pipeline()
    with cursor() as con:
        filas = con.execute(
            f"SELECT COALESCE(s.etapa, 'nuevo') AS etapa, COUNT(*) AS n {DESDE} "
            f"WHERE {' AND '.join(CRITERIOS)} "
            f"GROUP BY COALESCE(s.etapa, 'nuevo')"
        ).fetchall()
    base = {e: 0 for e in ETAPAS}
    for f in filas:
        base[f["etapa"]] = f["n"]
    return base


# ---------------------------------------------------------------------------
# DECISIONES
# ---------------------------------------------------------------------------

# Los topes de tamaño de aquí abajo no son burocracia: sin ellos, una
# petición con cien mil links o con un `motivo` de diez megas la acepta
# Pydantic tal cual y el servidor se pelea con ella hasta agotarse. Ahora
# hace falta una sesión para llegar, así que el riesgo es de dentro, pero un
# límite claro también evita el accidente de pegar un archivo entero en un
# campo de texto. Los números son holgados respecto a lo que la consola manda:
# selecciona de a lote, no de a cien mil.
LIMITE_LINK = 600         # las URLs de los portales rondan los 120
LIMITE_LOTE = 500         # links por decisión
LIMITE_TEXTO = 2000       # motivo, notas
LIMITE_NOMBRE = 120       # títulos, nombres de contacto


class PeticionDecidir(BaseModel):
    links: list[str] = Field(min_length=1, max_length=LIMITE_LOTE)
    # continua        → pantalla 2: pasa a preseleccionados
    # no_continua     → pantalla 2 o 4: descartado, no vuelve a entrar
    # no_disponible   → pantalla 3: el propietario ya no lo vende
    decision: str = Field(max_length=32)
    motivo: str | None = Field(default=None, max_length=LIMITE_TEXTO)


@router.post("/decidir")
def decidir(p: PeticionDecidir, u: dict = Depends(usuario_actual)):
    """Las tres decisiones que mueven un inmueble de etapa.

    `no_continua` y `no_disponible` exigen motivo: son las dos que hacen
    que el inmueble no vuelva a aparecer, y un descarte sin razón escrita
    es imposible de auditar tres meses después.
    """
    if p.decision not in ("continua", "no_continua", "no_disponible"):
        raise HTTPException(400, "decision debe ser continua, no_continua o no_disponible")
    motivo = (p.motivo or "").strip()
    if p.decision != "continua" and not motivo:
        raise HTTPException(400, "Un descarte necesita motivo.")

    _exige_pipeline()
    validos = _existe_y_cumple(p.links)
    if not validos:
        raise HTTPException(400, "Ninguno de esos inmuebles está disponible para decidir.")

    ahora = datetime.now(timezone.utc).isoformat(timespec="seconds")
    responsable = f"{u['nombre']} ({u['rol']})"

    if p.decision == "continua":
        campos = dict(etapa="preseleccion", filtro_arquitectonico="pasa",
                      motivo_no_pasa=None, estado_seguimiento="preseleccionado")
    elif p.decision == "no_continua":
        campos = dict(etapa="descartado", filtro_arquitectonico="no_pasa",
                      motivo_no_pasa=motivo, estado_seguimiento="descartado")
    else:
        campos = dict(etapa="descartado", disponible="no_disponible",
                      motivo_no_disponible=motivo, estado_seguimiento="no disponible")

    columnas = list(campos) + ["responsable", "fecha_actualizacion"]
    valores = list(campos.values()) + [responsable, ahora]
    asignaciones = ", ".join(f"{c} = ?" for c in columnas)

    with escribir() as con:
        for link in validos:
            _asegura_seguimiento(con, link)
            con.execute(
                f"UPDATE seguimiento_propiedades SET {asignaciones} WHERE url_inmueble = ?",
                valores + [link],
            )

    ignorados = [l for l in p.links if l not in validos]
    return {"guardados": len(validos), "ignorados": ignorados, "decision": p.decision}


class PeticionVisita(BaseModel):
    link: str = Field(max_length=LIMITE_LINK)
    fecha: str | None = Field(default=None, max_length=32)
    hora: str | None = Field(default=None, max_length=32)
    contacto_nombre: str | None = Field(default=None, max_length=LIMITE_NOMBRE)
    contacto_telefono: str | None = Field(default=None, max_length=64)
    notas: str | None = Field(default=None, max_length=LIMITE_TEXTO)


@router.post("/visita")
def agendar_visita(p: PeticionVisita, u: dict = Depends(usuario_actual)):
    """Pantalla 3 → 4. Guarda la cita y mueve el inmueble a 'visita'."""
    _exige_pipeline()
    if p.link not in _existe_y_cumple([p.link]):
        raise HTTPException(400, "Ese inmueble no está disponible para agendar.")

    ahora = datetime.now(timezone.utc)
    responsable = f"{u['nombre']} ({u['rol']})"
    # `fecha` llega vacía cuando la cita está "por confirmar": se guarda NULL
    # en vez de una fecha inventada.
    fecha = (p.fecha or "").strip() or None

    with escribir() as con:
        _asegura_seguimiento(con, p.link)
        con.execute(
            """UPDATE seguimiento_propiedades
               SET etapa = 'visita', disponible = 'disponible',
                   estado_seguimiento = 'visita agendada',
                   responsable = ?, fecha_actualizacion = ?
               WHERE url_inmueble = ?""",
            (responsable, ahora.isoformat(timespec="seconds"), p.link),
        )
        con.execute(
            """INSERT INTO inmueble_detalle
                   (url_inmueble, contacto_nombre, contacto_telefono,
                    visita_fecha, visita_hora, visita_notas,
                    actualizado_en, actualizado_por)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT (url_inmueble) DO UPDATE SET
                   contacto_nombre   = EXCLUDED.contacto_nombre,
                   contacto_telefono = EXCLUDED.contacto_telefono,
                   visita_fecha      = EXCLUDED.visita_fecha,
                   visita_hora       = EXCLUDED.visita_hora,
                   visita_notas      = EXCLUDED.visita_notas,
                   actualizado_en    = EXCLUDED.actualizado_en,
                   actualizado_por   = EXCLUDED.actualizado_por""",
            (p.link, p.contacto_nombre, p.contacto_telefono, fecha,
             (p.hora or "").strip() or None, p.notas, ahora, responsable),
        )
    return {"ok": True, "etapa": "visita"}


class PeticionCompletar(BaseModel):
    link: str = Field(max_length=LIMITE_LINK)
    titulo: str | None = Field(default=None, max_length=LIMITE_NOMBRE)
    # Los topes de habitaciones, baños y metros no son por seguridad sino
    # porque un dedo de más al teclear («300» baños) queda guardado y luego
    # nadie sabe si era un error o el dato.
    habitaciones: int | None = Field(default=None, ge=0, le=99)
    banos: int | None = Field(default=None, ge=0, le=99)
    area_confirmada_m2: float | None = Field(default=None, ge=0, le=100_000)
    tipo_transformacion: str | None = Field(default=None, max_length=LIMITE_NOMBRE)
    notas_visita: str | None = Field(default=None, max_length=LIMITE_TEXTO)


@router.post("/completar")
def completar(p: PeticionCompletar, u: dict = Depends(usuario_actual)):
    """Pantalla 4 → 5. Guarda lo que confirmó arquitectura y publica."""
    _exige_pipeline()
    if p.link not in _existe_y_cumple([p.link]):
        raise HTTPException(400, "Ese inmueble no está disponible para completar.")

    ahora = datetime.now(timezone.utc)
    responsable = f"{u['nombre']} ({u['rol']})"

    with escribir() as con:
        _asegura_seguimiento(con, p.link)
        con.execute(
            """UPDATE seguimiento_propiedades
               SET etapa = 'publicado', filtro_arquitectonico = 'pasa',
                   estado_seguimiento = 'publicado',
                   responsable = ?, fecha_actualizacion = ?
               WHERE url_inmueble = ?""",
            (responsable, ahora.isoformat(timespec="seconds"), p.link),
        )
        con.execute(
            """INSERT INTO inmueble_detalle
                   (url_inmueble, titulo, habitaciones, banos,
                    area_confirmada_m2, tipo_transformacion, notas_visita,
                    actualizado_en, actualizado_por)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT (url_inmueble) DO UPDATE SET
                   titulo              = EXCLUDED.titulo,
                   habitaciones        = EXCLUDED.habitaciones,
                   banos               = EXCLUDED.banos,
                   area_confirmada_m2  = EXCLUDED.area_confirmada_m2,
                   tipo_transformacion = EXCLUDED.tipo_transformacion,
                   notas_visita        = EXCLUDED.notas_visita,
                   actualizado_en      = EXCLUDED.actualizado_en,
                   actualizado_por     = EXCLUDED.actualizado_por""",
            (p.link, p.titulo, p.habitaciones, p.banos, p.area_confirmada_m2,
             p.tipo_transformacion, p.notas_visita, ahora, responsable),
        )
    return {"ok": True, "etapa": "publicado"}
