"""
seguimiento.py
===============
Columnas de estado/seguimiento que pidio Paola en la reunion de revision,
pensando ya hacia la Pieza 2 (revision del equipo de arquitectura):

    - filtro_arquitectonico: pendiente / pasa / no_pasa
    - disponible: pendiente / disponible / no_disponible
    - estado_seguimiento: texto libre corto (ej. "contactado", "visita
      agendada", "visitado") para que el equipo deje notas de en que va
      cada predio.

LO IMPORTANTE DE ESTE ARCHIVO (por que no es solo "agregar columnas"):
    Estas columnas son ESTADO HUMANO, no datos que el scraper calcule. Un
    predio que el arquitecto marco "no_pasa" el mes pasado debe SEGUIR
    marcado "no_pasa" este mes, aunque el scraping se vuelva a correr
    desde cero - si no, el equipo de arquitectura tendria que revisar los
    mismos predios descartados una y otra vez, para siempre.

    Por eso este estado vive en una tabla APARTE (seguimiento.db,
    tabla seguimiento_propiedades) que el pipeline de transformacion
    NUNCA reconstruye ni borra - solo la lee y la cruza (LEFT JOIN, por
    url_inmueble) con los datos frescos de cada corrida. Un predio nuevo
    aparece con estado "pendiente"; un predio que ya se habia marcado
    conserva su estado tal como quedo.

    "Descartado no se vuelve a traer": el registro NUNCA se borra -- mismo
    principio de siempre, alguien podria querer auditar por que se
    descarto -- pero el predio deja de ofrecerse para trabajar. Un predio
    con etapa 'descartado' (o con no_pasa / no_disponible) ya no sale en la
    pantalla de Extraccion: GET /api/admin/predios lo excluye leyendo esta
    tabla EN VIVO. Solo queda visible en la pestana Descartados del flujo,
    con su motivo.

    Ojo con el matiz tecnico: el scraping en si SI vuelve a bajar estos
    predios de los portales en cada corrida (no hay forma de saber que URLs
    va a devolver una zona antes de pedirla). Lo que no vuelve a pasar es
    que se le MUESTREN al equipo.

    Por que en vivo y no por la copia que el pipeline deja en
    clean_listings: esa copia es una foto del momento de la corrida, asi
    que una decision tomada hoy no aparecia ahi hasta la corrida siguiente
    -- y hasta entonces el predio descartado volvia a la tabla como si
    nadie lo hubiera mirado.

    `requiere_revision` se sigue calculando igual (False apenas hay
    CUALQUIER decision sobre el filtro arquitectonico) para lo que ya lo
    usaba: los conteos del pipeline.

USO EN EL PIPELINE (ya integrado en script_transform_serava.py):
    from seguimiento import cruzar_seguimiento
    df = cruzar_seguimiento(df)  # requiere columna 'link' (o url_inmueble)

USO PARA ACTUALIZAR EL ESTADO DE UN PREDIO (desde el tablero o a mano):
    from seguimiento import actualizar_seguimiento
    actualizar_seguimiento(
        url_inmueble="https://www.metrocuadrado.com/inmueble/...",
        filtro_arquitectonico="no_pasa",
        motivo="Muros estructurales no se pueden tocar, no permite remodelacion",
        responsable="Arquitecto - Juan Perez",
    )
"""

from datetime import datetime

import pandas as pd

from . import db_admin as db

SEGUIMIENTO_DB_PATH = "seguimiento.db"

VALORES_VALIDOS_FILTRO = {"pendiente", "pasa", "no_pasa"}
VALORES_VALIDOS_DISPONIBLE = {"pendiente", "disponible", "no_disponible"}

# En que etapa del flujo va el predio. Es la misma lista que el CHECK de
# database/schema.sql y que ETAPAS en api/flujo.py: si se agrega una etapa,
# se agrega en los tres sitios o la base rechaza la escritura.
#
#   nuevo -> lo trajo el scraping, nadie lo ha mirado (no esta en el flujo)
#   preseleccion -> aceptado en Extraccion: entra al flujo listo para llamar
#
# Hubo una etapa 'revision' entre las dos y se quito: era decidir dos veces
# lo mismo. Si aparece una fila con ese valor es de antes de la migracion.
VALORES_VALIDOS_ETAPA = {
    "nuevo", "preseleccion", "visita", "publicado", "descartado",
}


def _conectar():
    conn = db.conectar(SEGUIMIENTO_DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS seguimiento_propiedades (
            url_inmueble TEXT PRIMARY KEY,
            filtro_arquitectonico TEXT DEFAULT 'pendiente',
            motivo_no_pasa TEXT,
            disponible TEXT DEFAULT 'pendiente',
            motivo_no_disponible TEXT,
            estado_seguimiento TEXT,
            responsable TEXT,
            fecha_actualizacion TEXT,
            etapa TEXT DEFAULT 'nuevo'
        )
        """
    )
    conn.commit()
    return conn


def actualizar_seguimiento(
    url_inmueble: str,
    filtro_arquitectonico: str = None,
    motivo_no_pasa: str = None,
    disponible: str = None,
    motivo_no_disponible: str = None,
    estado_seguimiento: str = None,
    responsable: str = None,
    etapa: str = None,
):
    """
    Crea o actualiza el registro de seguimiento de UN predio. Solo cambia
    los campos que se le pasan (los que se dejan en None no se tocan).
    Valida que filtro_arquitectonico/disponible/etapa sean uno de los
    valores esperados, y que si se marca 'no_pasa' o 'no_disponible' venga
    acompanado de un motivo (mismo principio que embudo_propiedades en el
    diseno de arquitectura: nunca un descarte sin explicar por que).

    `etapa` es en que pantalla del flujo queda el predio. Quien decide
    desde Extraccion la manda explicitamente ('preseleccion' al aceptar,
    'descartado' al descartar): sin ella, el predio guardaba el veredicto
    pero se quedaba en 'nuevo', o sea fuera de todas las pantallas del
    flujo. Si no se pasa, la etapa que ya tenia no se toca.
    """
    if filtro_arquitectonico is not None:
        if filtro_arquitectonico not in VALORES_VALIDOS_FILTRO:
            raise ValueError(f"filtro_arquitectonico debe ser uno de {VALORES_VALIDOS_FILTRO}")
        if filtro_arquitectonico == "no_pasa" and not motivo_no_pasa:
            raise ValueError("Si filtro_arquitectonico='no_pasa', hay que indicar motivo_no_pasa")

    if etapa is not None and etapa not in VALORES_VALIDOS_ETAPA:
        raise ValueError(f"etapa debe ser una de {VALORES_VALIDOS_ETAPA}")

    if disponible is not None:
        if disponible not in VALORES_VALIDOS_DISPONIBLE:
            raise ValueError(f"disponible debe ser uno de {VALORES_VALIDOS_DISPONIBLE}")
        if disponible == "no_disponible" and not motivo_no_disponible:
            raise ValueError("Si disponible='no_disponible', hay que indicar motivo_no_disponible")

    conn = _conectar()
    existente = conn.execute(
        "SELECT * FROM seguimiento_propiedades WHERE url_inmueble = ?", (url_inmueble,)
    ).fetchone()

    valores_actuales = {
        "filtro_arquitectonico": "pendiente", "motivo_no_pasa": None,
        "disponible": "pendiente", "motivo_no_disponible": None,
        "estado_seguimiento": None, "responsable": None,
        "etapa": "nuevo",
    }
    if existente:
        valores_actuales = dict(existente)

    nuevos_valores = {
        "filtro_arquitectonico": filtro_arquitectonico if filtro_arquitectonico is not None else valores_actuales["filtro_arquitectonico"],
        "motivo_no_pasa": motivo_no_pasa if motivo_no_pasa is not None else valores_actuales["motivo_no_pasa"],
        "disponible": disponible if disponible is not None else valores_actuales["disponible"],
        "motivo_no_disponible": motivo_no_disponible if motivo_no_disponible is not None else valores_actuales["motivo_no_disponible"],
        "estado_seguimiento": estado_seguimiento if estado_seguimiento is not None else valores_actuales["estado_seguimiento"],
        "responsable": responsable if responsable is not None else valores_actuales["responsable"],
        "etapa": etapa if etapa is not None else (valores_actuales.get("etapa") or "nuevo"),
        "fecha_actualizacion": datetime.now().isoformat(timespec="seconds"),
    }

    conn.execute(
        """
        INSERT INTO seguimiento_propiedades
            (url_inmueble, filtro_arquitectonico, motivo_no_pasa, disponible,
             motivo_no_disponible, estado_seguimiento, responsable, fecha_actualizacion,
             etapa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(url_inmueble) DO UPDATE SET
            filtro_arquitectonico = excluded.filtro_arquitectonico,
            motivo_no_pasa = excluded.motivo_no_pasa,
            disponible = excluded.disponible,
            motivo_no_disponible = excluded.motivo_no_disponible,
            estado_seguimiento = excluded.estado_seguimiento,
            responsable = excluded.responsable,
            fecha_actualizacion = excluded.fecha_actualizacion,
            etapa = excluded.etapa
        """,
        (
            url_inmueble, nuevos_valores["filtro_arquitectonico"], nuevos_valores["motivo_no_pasa"],
            nuevos_valores["disponible"], nuevos_valores["motivo_no_disponible"],
            nuevos_valores["estado_seguimiento"], nuevos_valores["responsable"],
            nuevos_valores["fecha_actualizacion"], nuevos_valores["etapa"],
        ),
    )
    conn.commit()
    conn.close()


def cruzar_seguimiento(df: pd.DataFrame, columna_url: str = "url_inmueble") -> pd.DataFrame:
    """
    Cruza (LEFT JOIN) el estado de seguimiento persistente con los datos
    frescos de la corrida actual. Los predios nuevos (nunca vistos en
    seguimiento_propiedades) quedan con los valores por defecto
    ('pendiente'). Agrega tambien 'requiere_revision': False para los que
    ya quedaron descartados (no_pasa) o confirmados no disponibles
    (no_disponible) - asi el equipo puede filtrar facilmente a lo que
    todavia necesita atencion, sin que el predio desaparezca del dataset.
    """
    _conectar().close()  # asegura que la tabla exista antes de leerla
    seguimiento = pd.read_sql("SELECT * FROM seguimiento_propiedades", db.engine())

    df = df.copy()
    if len(seguimiento) > 0:
        df = df.merge(
            seguimiento, how="left", left_on=columna_url, right_on="url_inmueble",
            suffixes=("", "_seguimiento"),
        )
        if "url_inmueble" in df.columns and columna_url != "url_inmueble":
            df = df.drop(columns=["url_inmueble"])
    else:
        for col in ["filtro_arquitectonico", "motivo_no_pasa", "disponible",
                     "motivo_no_disponible", "estado_seguimiento", "responsable", "fecha_actualizacion"]:
            df[col] = None

    df["filtro_arquitectonico"] = df["filtro_arquitectonico"].fillna("pendiente")
    df["disponible"] = df["disponible"].fillna("pendiente")

    # Corregido (05/08): antes solo se apagaba con "no_pasa" o "no_disponible",
    # asi que un predio marcado "pasa" (aprobado) seguia apareciendo como
    # pendiente para siempre. Ahora: apenas el arquitecto toma CUALQUIER
    # decision sobre el filtro arquitectonico, deja de "requerir revision"
    # - que es justo lo que se pidio: que la siguiente corrida no vuelva a
    # traer/mostrar los predios ya revisados, sin importar el resultado.
    df["requiere_revision"] = df["filtro_arquitectonico"] == "pendiente"

    return df


if __name__ == "__main__":
    conn = _conectar()
    n = conn.execute("SELECT COUNT(*) FROM seguimiento_propiedades").fetchone()[0]
    conn.close()
    print(f"seguimiento.db listo. {n} predios con seguimiento registrado hasta ahora.")
