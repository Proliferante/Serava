"""
api/flujo.py
============
Las pantallas del flujo de inmuebles, montado en /api/admin/flujo.

    GET  /api/admin/flujo?etapa=revision    listado de una etapa
    GET  /api/admin/flujo/conteos           cuántos hay en cada etapa
    POST /api/admin/flujo/decidir           continúa / no continúa / no disponible
    POST /api/admin/flujo/visita            agendar visita
    POST /api/admin/flujo/completar         completar tras la visita y publicar

DÓNDE EMPIEZA EL FLUJO
    No en el scraping: en la revisión general. El scraping deja miles de
    anuncios en `clean_listings` y ésos se miran en la pantalla de
    Extracción de predios, que es donde se corre. Lo que alguien acepta
    ahí —y sólo eso— entra al flujo con etapa 'revision'.

    Por eso la etapa 'nuevo' existe pero ninguna pantalla del flujo la
    muestra: 'nuevo' es "lo trajo el scraping y nadie lo ha mirado", que
    son 11.000 filas y no una bandeja de trabajo. El recorrido del flujo
    es revisión general → preselección → visita → publicado, y en
    cualquier punto se puede descartar.

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
    no un filtro sobre seguimiento. Las demás etapas sí son filas escritas
    por alguien, con nombre y fecha.

QUÉ QUEDA REGISTRADO
    Cada movimiento se anota en `bitacora` con quién lo hizo, cuándo y sobre
    qué inmueble, además de dejar el `responsable` en la propia fila.

    Hace falta porque la fila sólo guarda la ÚLTIMA mano: dice quién dejó el
    inmueble como está, no el recorrido. Preguntar "¿quién metió esto en el
    flujo?" no tenía respuesta —y se preguntó—: había tres inmuebles en
    revisión general sin autor, aceptados desde la extracción cuando ese
    endpoint no lo guardaba, y la única forma de saberlo habría sido un
    registro de las decisiones. Ahora existe.

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
from app.core import bitacora
from app.core.database import cursor, escribir, tabla_existe

router = APIRouter()

# Misma lista que el CHECK de database/schema.sql y que VALORES_VALIDOS_ETAPA
# en services/admin/seguimiento.py. Si se agrega una etapa, va en los tres.
#
# 'nuevo' se puede consultar (el CSV del universo lo usa) pero no es una
# pantalla del flujo: ver la cabecera del archivo.
ETAPAS = ("nuevo", "revision", "preseleccion", "visita", "publicado", "descartado")

# Los dos filtros del arquitecto: el flujo sólo trabaja sobre inmuebles que
# ya los cumplen, igual que el resto de la consola (ver admin.py). Están
# aquí repetidos y no importados para que este módulo no dependa del otro:
# si mañana el flujo tiene su propio criterio, se cambia sólo aquí.
# OJO CON EL TIPO: en Postgres estas cinco columnas son `boolean`, no 0/1.
# Las escribe pandas (`to_sql`) desde el dataframe de la limpieza, y una
# columna de bools de pandas se convierte en `boolean`. Comparar un boolean
# con 1 no es "falso": es un error de Postgres —«operator does not exist:
# boolean = integer»— que devuelve 500 y deja la pantalla vacía. Por eso van
# con IS TRUE / IS FALSE / IS NULL, que además distinguen los tres casos que
# pide la regla: dentro del polígono, fuera pero similar, o sin evaluar.
CRITERIOS = [
    "(c.dentro_poligono_real IS TRUE OR c.similar_a_zona IS TRUE OR c.dentro_poligono_real IS NULL)",
    "c.bajo_media_zona IS TRUE",
]

# Lo que necesitan las pantallas de cada inmueble.
#
# El enlace sale de `COALESCE(c.link, s.url_inmueble)` y no de `c.link` a
# secas: en la consulta de una etapa del flujo la tabla que manda es
# `seguimiento_propiedades`, y el anuncio puede haber desaparecido de
# `clean_listings`. Ver DESDE_ETAPA.
SELECCION = """
    COALESCE(c.link, s.url_inmueble) AS link,
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

# DOS CONSULTAS, PORQUE SON DOS PREGUNTAS DISTINTAS.
#
# `DESDE_NUEVO` — "qué trajo el scraping que nadie ha mirado". La tabla que
# manda es `clean_listings`, y los criterios del arquitecto se aplican: es
# una bandeja de candidatos, y de ella salen los 5.450 de la extracción.
DESDE_NUEVO = """
    FROM clean_listings c
    LEFT JOIN seguimiento_propiedades s ON s.url_inmueble = c.link
    LEFT JOIN inmueble_detalle       d ON d.url_inmueble = c.link
"""

# `DESDE_ETAPA` — "qué hay en esta etapa del flujo". La tabla que manda es
# `seguimiento_propiedades`, y NO se aplica ningún criterio del dato.
#
# POR QUÉ AL REVÉS, Y POR QUÉ SIN CRITERIOS
# El flujo era un `FROM clean_listings` con los criterios puestos, y eso
# hacía que una decisión humana dependiera de lo que dijera la última
# corrida del pipeline:
#
#   · La mediana de precio/m² de una zona se recalcula en cada corrida. Un
#     inmueble que alguien preseleccionó el martes podía quedar por encima
#     de la mediana el viernes y DESAPARECER de su pestaña, con su visita
#     agendada y su teléfono guardados. Pasó de verdad: antes de la limpieza
#     de hoy había un inmueble en Revisión general que la pantalla no
#     enseñaba.
#   · La deduplicación deja un solo representante por grupo de
#     republicaciones, y puede no ser el enlace que se seleccionó.
#   · Y si un anuncio sale de `clean_listings` por cualquier motivo, el
#     `FROM` lo perdía entero.
#
# Que el dato esconda una decisión de una persona es al revés de como debe
# ser. Los criterios deciden qué se le OFRECE al equipo; una vez alguien ha
# dicho "este sí", el inmueble es del flujo y ahí se queda hasta que otra
# persona lo mueva. Si el anuncio ya no está en la tabla limpia, la fila
# sale con lo que se guardó de él —título, contacto, cita— y las columnas
# del anuncio vacías, que es información honesta: "esto ya no está en el
# portal".
DESDE_ETAPA = """
    FROM seguimiento_propiedades s
    LEFT JOIN clean_listings   c ON c.link          = s.url_inmueble
    LEFT JOIN inmueble_detalle d ON d.url_inmueble  = s.url_inmueble
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


def _accionables(links: list[str]) -> set[str]:
    """Sobre cuáles de estos inmuebles se puede actuar hoy.

    Dos caminos, y basta con uno:

      1. YA ESTÁ EN EL FLUJO — tiene fila en `seguimiento_propiedades` con
         una etapa distinta de 'nuevo'. Alguien decidió sobre él, así que se
         puede seguir moviendo SIEMPRE: agendar, completar, descartar.
      2. ES UN CANDIDATO — está en `clean_listings` y cumple los criterios
         del arquitecto. Es la puerta de entrada.

    ANTES SÓLO VALÍA EL CAMINO 2, y eso dejaba inmuebles atascados: si la
    corrida del pipeline movía la mediana de su zona, un preseleccionado con
    su visita agendada dejaba de cumplir los criterios y el servidor
    rechazaba cualquier acción sobre él — «Ese inmueble no está disponible
    para agendar»— sin que nadie pudiera ni descartarlo para quitárselo de
    encima. Un criterio del dato no puede bloquear el trabajo sobre algo que
    ya está en manos de una persona.

    Se le pregunta a la base y no a la pantalla: que el HTML no ofreciera el
    botón no impide que alguien mande el link a mano.
    """
    if not links:
        return set()
    marcadores = ",".join("?" * len(links))
    with cursor() as con:
        en_flujo = con.execute(
            f"SELECT s.url_inmueble AS link FROM seguimiento_propiedades s "
            f"WHERE s.url_inmueble IN ({marcadores}) "
            f"AND s.etapa IS NOT NULL AND s.etapa <> 'nuevo'",
            links,
        ).fetchall()
        candidatos = con.execute(
            f"SELECT c.link FROM clean_listings c "
            f"WHERE c.link IN ({marcadores}) AND {' AND '.join(CRITERIOS)}",
            links,
        ).fetchall()
    return {f["link"] for f in en_flujo} | {f["link"] for f in candidatos}


# ---------------------------------------------------------------------------
# LECTURA
# ---------------------------------------------------------------------------

def _consulta_de_etapa(etapa: str) -> tuple[str, str, list]:
    """El (FROM, WHERE, parámetros) que le corresponde a una etapa.

    'nuevo' se lee desde `clean_listings` con los criterios puestos —es la
    bandeja de candidatos, e incluye lo que nunca tuvo fila de seguimiento—.
    El resto se lee desde `seguimiento_propiedades` y sin criterios: son
    decisiones de personas. Ver DESDE_NUEVO y DESDE_ETAPA.
    """
    if etapa not in ETAPAS:
        raise HTTPException(400, f"Etapa inválida. Válidas: {', '.join(ETAPAS)}")
    if etapa == "nuevo":
        return (
            DESDE_NUEVO,
            f"{' AND '.join(CRITERIOS)} AND (s.etapa IS NULL OR s.etapa = 'nuevo')",
            [],
        )
    return DESDE_ETAPA, "s.etapa = ?", [etapa]


@router.get("")
def listar(
    etapa: str = Query("revision", description="revision|preseleccion|visita|publicado|descartado|nuevo"),
    limite: int = Query(500, ge=1, le=2000),
    _: dict = Depends(usuario_actual),
):
    etapa_es_nuevo = etapa == "nuevo"
    # `nuevo` sale de clean_listings, así que sin tabla no hay nada que
    # enseñar. Las etapas del flujo, en cambio, viven en
    # `seguimiento_propiedades` y se pueden leer aunque el pipeline no haya
    # corrido nunca en esta base — o aunque su tabla se esté reconstruyendo.
    if etapa_es_nuevo:
        _exige_pipeline()
    desde, cond, params = _consulta_de_etapa(etapa)

    # Orden: lo más reciente primero. Antes iba por precio/m² ascendente, y el
    # efecto era el contrario del buscado — los precios más bajos del universo
    # son casi siempre errores de digitación del anuncio (hay registros a
    # US$5/m² cuando la mediana de Panamá es 1.692), así que la pantalla
    # "Resultado del último scraping" abría con la basura arriba y lo bueno
    # enterrado. Por fecha, la primera página es lo que de verdad trajo la
    # última corrida, que es lo que la pantalla dice ser.
    #
    # En las etapas del flujo el orden es el de la última decisión: es una
    # bandeja de trabajo de unas decenas de filas, y lo que interesa arriba
    # es lo que se acaba de mover. `fecha_extraccion` además puede venir
    # vacía si el anuncio ya no está en la tabla limpia.
    orden = ("c.fecha_extraccion DESC NULLS LAST, c.precio_m2 ASC"
             if etapa_es_nuevo else
             "s.fecha_actualizacion DESC NULLS LAST")

    with cursor() as con:
        filas = con.execute(
            f"SELECT {SELECCION} {desde} WHERE {cond} "
            f"ORDER BY {orden} LIMIT {int(limite)}",
            params,
        ).fetchall()

        # El total de la etapa, no el de la página: sin esto la pantalla decía
        # "500 inmuebles" cuando hay 5.444, que es el tope de la consulta
        # haciéndose pasar por un dato.
        total = con.execute(
            f"SELECT count(*) AS n {desde} WHERE {cond}", params,
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
    etapa: str = Query("revision", description="revision|preseleccion|visita|publicado|descartado|nuevo"),
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
    if etapa == "nuevo":
        _exige_pipeline()
    desde, cond, params = _consulta_de_etapa(etapa)
    orden = ("c.fecha_extraccion DESC NULLS LAST, c.precio_m2 ASC"
             if etapa == "nuevo" else
             "s.fecha_actualizacion DESC NULLS LAST")

    with cursor() as con:
        filas = con.execute(
            f"SELECT {SELECCION} {desde} WHERE {cond} ORDER BY {orden}",
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
    """Los números de las pestañas.

    Devuelve las seis etapas, incluida 'nuevo': el flujo no la pinta, pero
    es el contador de "lo que el scraping trajo y nadie ha mirado", que es
    dato útil para la pantalla de Extracción.

    Dos consultas, por lo mismo que hay dos `DESDE`: cada pestaña del flujo
    cuenta filas de `seguimiento_propiedades` sin aplicar criterios, y
    'nuevo' cuenta candidatos de `clean_listings` aplicándolos.

    Antes era una sola con los criterios puestos para todas, y el número de
    la pestaña no cuadraba con lo que había: un inmueble en preselección que
    dejara de estar bajo la mediana de su zona salía del contador y de la
    tabla a la vez, así que ni se veía ni se notaba que faltaba.

    Si la tabla limpia no existe —primera instalación, o una limpieza a
    medias— las etapas del flujo se cuentan igual y 'nuevo' va a cero: el
    equipo puede seguir trabajando su bandeja.
    """
    base = {e: 0 for e in ETAPAS}
    with cursor() as con:
        for f in con.execute(
            "SELECT etapa, COUNT(*) AS n FROM seguimiento_propiedades "
            "WHERE etapa IS NOT NULL AND etapa <> 'nuevo' GROUP BY etapa"
        ).fetchall():
            if f["etapa"] in base:
                base[f["etapa"]] = f["n"]

        if tabla_existe("clean_listings"):
            base["nuevo"] = con.execute(
                f"SELECT count(*) AS n {DESDE_NUEVO} "
                f"WHERE {' AND '.join(CRITERIOS)} "
                f"AND (s.etapa IS NULL OR s.etapa = 'nuevo')"
            ).fetchone()["n"]
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
    # continua        → revisión general: pasa a preseleccionados
    # no_continua     → revisión general o tras la visita: descartado, y no
    #                   vuelve a salir ni en el flujo ni en la extracción
    # no_disponible   → preseleccionados: el propietario ya no lo vende
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
    validos = _accionables(p.links)
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

    for link in validos:
        bitacora.anotar(u, f"flujo-{p.decision}",
                        f"{campos['etapa']} · {link}" + (f" · {motivo}" if motivo else ""))

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
    """Preseleccionados → visita. Guarda la cita y mueve la etapa."""
    _exige_pipeline()
    if p.link not in _accionables([p.link]):
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
                   -- El contacto se CONSERVA si esta peticion no lo trae, en
                   -- vez de sobrescribirse con vacio. Con `EXCLUDED` a secas,
                   -- agendar una visita sin reenviar el telefono lo borraba:
                   -- el dato mas caro de esta tabla —hay que abrir el anuncio
                   -- y copiarlo a mano— se perdia como efecto secundario de
                   -- poner una fecha. La pantalla lo reenvia porque el
                   -- formulario lo lleva precargado, asi que el borrado no se
                   -- veia; cualquier otra forma de llamar al endpoint (una
                   -- automatizacion del contacto, por ejemplo, que es lo
                   -- siguiente que toca) lo habria borrado en silencio.
                   contacto_nombre   = COALESCE(EXCLUDED.contacto_nombre,
                                                inmueble_detalle.contacto_nombre),
                   contacto_telefono = COALESCE(EXCLUDED.contacto_telefono,
                                                inmueble_detalle.contacto_telefono),
                   -- La cita si es de esta peticion: es lo que el formulario
                   -- de agendar posee. Una fecha vacia significa "por
                   -- confirmar" y tiene que poder guardarse.
                   visita_fecha      = EXCLUDED.visita_fecha,
                   visita_hora       = EXCLUDED.visita_hora,
                   visita_notas      = COALESCE(EXCLUDED.visita_notas,
                                                inmueble_detalle.visita_notas),
                   actualizado_en    = EXCLUDED.actualizado_en,
                   actualizado_por   = EXCLUDED.actualizado_por""",
            (p.link, p.contacto_nombre, p.contacto_telefono, fecha,
             (p.hora or "").strip() or None, p.notas, ahora, responsable),
        )
    bitacora.anotar(u, "flujo-visita",
                    f"{fecha or 'sin fecha'} {(p.hora or '').strip()} · {p.link}")
    return {"ok": True, "etapa": "visita"}


class PeticionContacto(BaseModel):
    link: str = Field(max_length=LIMITE_LINK)
    contacto_nombre: str | None = Field(default=None, max_length=LIMITE_NOMBRE)
    contacto_telefono: str | None = Field(default=None, max_length=64)


@router.post("/contacto")
def guardar_contacto(p: PeticionContacto, u: dict = Depends(usuario_actual)):
    """Guarda el teléfono de quien vende, SIN mover el inmueble de etapa.

    Falta porque el dato de contacto no lo trae el scraping: hay que abrir el
    anuncio y copiarlo. El único sitio donde se podía guardar era el
    formulario de agendar visita, y eso obligaba a agendar una cita que
    todavía no existe sólo para poder llamar. El correo pide justo lo
    contrario —primero se contacta, y de esa llamada sale si hay visita o si
    el inmueble ya no está—.

    Escribe en `inmueble_detalle`, que es de donde lo leerá cualquier
    automatización del contacto: la tabla es la misma con o sin persona
    delante, y por eso la pantalla no es el único camino.
    """
    _exige_pipeline()
    if p.link not in _accionables([p.link]):
        raise HTTPException(400, "Ese inmueble ya no está en el listado.")

    ahora = datetime.now(timezone.utc)
    responsable = f"{u['nombre']} ({u['rol']})"
    with escribir() as con:
        _asegura_seguimiento(con, p.link)
        con.execute(
            """INSERT INTO inmueble_detalle
                   (url_inmueble, contacto_nombre, contacto_telefono,
                    actualizado_en, actualizado_por)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT (url_inmueble) DO UPDATE SET
                   contacto_nombre   = COALESCE(EXCLUDED.contacto_nombre,
                                                inmueble_detalle.contacto_nombre),
                   contacto_telefono = COALESCE(EXCLUDED.contacto_telefono,
                                                inmueble_detalle.contacto_telefono),
                   actualizado_en    = EXCLUDED.actualizado_en,
                   actualizado_por   = EXCLUDED.actualizado_por""",
            (p.link, (p.contacto_nombre or "").strip() or None,
             (p.contacto_telefono or "").strip() or None, ahora, responsable),
        )
    # El teléfono NO va en el detalle: es un dato de una persona ajena al
    # equipo y la bitácora la leen todos los administradores. Basta con que
    # quede registrado que se guardó un contacto, y para qué inmueble.
    bitacora.anotar(u, "flujo-contacto", p.link)
    return {"ok": True}


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
    """Visita → publicado. Guarda lo que confirmó arquitectura y publica."""
    _exige_pipeline()
    if p.link not in _accionables([p.link]):
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
               -- Mismo criterio que en `visita`: lo que la peticion no
               -- trae, se conserva. Completar dos veces —para corregir el
               -- area, por ejemplo— no puede vaciar las notas de la visita
               -- ni el titulo que ya se habia escrito.
               ON CONFLICT (url_inmueble) DO UPDATE SET
                   titulo              = COALESCE(EXCLUDED.titulo,
                                                  inmueble_detalle.titulo),
                   habitaciones        = COALESCE(EXCLUDED.habitaciones,
                                                  inmueble_detalle.habitaciones),
                   banos               = COALESCE(EXCLUDED.banos,
                                                  inmueble_detalle.banos),
                   area_confirmada_m2  = COALESCE(EXCLUDED.area_confirmada_m2,
                                                  inmueble_detalle.area_confirmada_m2),
                   tipo_transformacion = COALESCE(EXCLUDED.tipo_transformacion,
                                                  inmueble_detalle.tipo_transformacion),
                   notas_visita        = COALESCE(EXCLUDED.notas_visita,
                                                  inmueble_detalle.notas_visita),
                   actualizado_en      = EXCLUDED.actualizado_en,
                   actualizado_por     = EXCLUDED.actualizado_por""",
            (p.link, p.titulo, p.habitaciones, p.banos, p.area_confirmada_m2,
             p.tipo_transformacion, p.notas_visita, ahora, responsable),
        )
    bitacora.anotar(u, "flujo-publicar",
                    f"{p.tipo_transformacion or 'sin tipo'} · {p.link}")
    return {"ok": True, "etapa": "publicado"}
