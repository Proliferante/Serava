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

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

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

@router.get("")
def listar(
    etapa: str = Query("nuevo", description="nuevo|preseleccion|visita|publicado|descartado"),
    limite: int = Query(500, le=2000),
    _: dict = Depends(usuario_actual),
):
    if etapa not in ETAPAS:
        raise HTTPException(400, f"Etapa inválida. Válidas: {', '.join(ETAPAS)}")
    _exige_pipeline()

    # 'nuevo' incluye lo que nunca tuvo fila de seguimiento.
    cond = ("(s.etapa IS NULL OR s.etapa = 'nuevo')" if etapa == "nuevo"
            else "s.etapa = ?")
    params: list = [] if etapa == "nuevo" else [etapa]

    with cursor() as con:
        filas = con.execute(
            f"SELECT {SELECCION} {DESDE} "
            f"WHERE {' AND '.join(CRITERIOS)} AND {cond} "
            f"ORDER BY c.precio_m2 ASC LIMIT {int(limite)}",
            params,
        ).fetchall()

    return {"etapa": etapa, "filas": [dict(f) for f in filas]}


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

class PeticionDecidir(BaseModel):
    links: list[str]
    # continua        → pantalla 2: pasa a preseleccionados
    # no_continua     → pantalla 2 o 4: descartado, no vuelve a entrar
    # no_disponible   → pantalla 3: el propietario ya no lo vende
    decision: str
    motivo: str | None = None


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
    link: str
    fecha: str | None = None
    hora: str | None = None
    contacto_nombre: str | None = None
    contacto_telefono: str | None = None
    notas: str | None = None


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
    link: str
    titulo: str | None = None
    habitaciones: int | None = None
    banos: int | None = None
    area_confirmada_m2: float | None = None
    tipo_transformacion: str | None = None
    notas_visita: str | None = None


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
