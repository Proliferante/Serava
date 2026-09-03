"""
db.py
=====
Conexión a Postgres (Supabase, proyecto "Project PGI") que reemplaza a
sqlite3 en todo el pipeline. Antes había tres archivos .db separados
(serava_raw.db, serava_clean.db, seguimiento.db); ahora son tres tablas
(raw_listings, clean_listings, seguimiento_propiedades) en la misma base
Postgres — Supabase es un solo proyecto, no hace falta separarlas.

La cadena de conexión NUNCA va en código: vive en DATABASE_URL, leída de
variables de entorno (o de un archivo .env local que no se sube al repo).

conectar() imita la interfaz de sqlite3.Connection que ya usaba el código
(con.execute(sql, params) -> cursor con .fetchone()/.fetchall(), filas como
dict) para no tener que reescribir cada llamada. Las diferencias reales con
sqlite3 que sí exigían tocar el código en cada archivo:
    - placeholders "?" -> "%s" (los traduce _traducir_sql)
    - "%" literal (por ejemplo en LIKE 'atipico%') hay que escaparlo como
      "%%" antes de esa traducción, porque psycopg2 siempre interpreta % al
      pasar parámetros
    - no hay PRAGMA ni AUTOINCREMENT: se usa information_schema/to_regclass
      y SERIAL
    - pandas.to_sql() con Postgres necesita un engine de SQLAlchemy, no una
      conexión DBAPI cruda -> usar engine() para eso, conectar() para el resto
"""

import contextlib
import os
import re
import threading
import time

import psycopg2
import psycopg2.extensions
import psycopg2.extras
import psycopg2.pool
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

_QMARK = re.compile(r"\?")


def _dsn() -> str:
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError(
            "Falta la variable de entorno DATABASE_URL (cadena de conexión de "
            "Supabase, proyecto Project PGI). Define un archivo .env local con "
            "DATABASE_URL=postgresql://..."
        )
    return dsn


def _traducir_sql(sql: str) -> str:
    sql_escapado = sql.replace("%", "%%")
    return _QMARK.sub("%s", sql_escapado)


class _Conexion:
    """Envuelve una conexión psycopg2 para que con.execute(...) funcione
    igual que en sqlite3.Connection, con filas tipo dict.

    `close()` no cierra: devuelve la conexión al pool (ver `conectar`). La
    interfaz es la misma, así que el código que ya llamaba `.close()` sigue
    valiendo — lo que cambia es que no se paga otro saludo de red la próxima
    vez.
    """

    def __init__(self, raw):
        self._raw = raw

    def execute(self, sql: str, params=()):
        # Siempre se pasa una tupla (nunca None): así psycopg2 aplica la
        # sustitución %% -> % aunque la consulta no tenga placeholders "?"
        # reales (ej. el "%" literal de un LIKE 'atipico%').
        cur = self._raw.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(_traducir_sql(sql), tuple(params))
        return cur

    def commit(self):
        self._raw.commit()

    def close(self):
        """Devuelve la conexión al pool en vez de cerrarla.

        Antes se hace rollback: si quien la usó no confirmó ni deshizo, la
        conexión volvería al pool con una transacción abierta y el siguiente
        en cogerla heredaría ese estado —y los candados sobre las filas
        tocadas—. El rollback no molesta a nadie: si hubo `commit()`, ya no
        queda nada que deshacer.
        """
        _devolver(self._raw)

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    def __getattr__(self, nombre):
        return getattr(self._raw, nombre)


# ---------------------------------------------------------------------------
# POOL DE CONEXIONES
# ---------------------------------------------------------------------------
# Antes, cada `conectar()` abría una conexión nueva. Contra una base local eso
# es gratis; contra Supabase, medido desde aquí, el saludo cuesta 1,9 s y la
# consulta 0,1 s. Y una petición autenticada de la consola abre TRES
# conexiones (comprobar tabla, validar sesión, leer usuario): 6,3 segundos por
# clic. Con el pool, esas tres consultas son 0,35 s.
#
# `ThreadedConnectionPool` porque uvicorn atiende en varios hilos y el
# pipeline corre en un hilo aparte (ver ESTADO en api/admin.py). El tope de 12
# da margen a las peticiones de la consola más la corrida del scraping, que
# retiene una conexión un buen rato.

_pool = None
_pool_lock = threading.Lock()

# Segundos que una conexión puede llevar parada antes de que valga la pena
# comprobar que sigue viva. Por debajo de esto se usa tal cual.
IDLE_COMPROBAR = 60


def _obtener_pool():
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:   # otro hilo pudo crearlo mientras esperábamos
                _pool = psycopg2.pool.ThreadedConnectionPool(1, 12, dsn=_dsn())
    return _pool


def _devolver(raw) -> None:
    try:
        # Deshace cualquier transacción a medias antes de que otro la herede.
        if raw.closed == 0 and raw.status != psycopg2.extensions.STATUS_READY:
            raw.rollback()
        # Cuándo se soltó, para saber luego si merece comprobarla.
        raw._devuelta_en = time.monotonic()
    except Exception:
        pass
    try:
        _obtener_pool().putconn(raw, close=bool(raw.closed))
    except Exception:
        # Si el pool ya no existe o la rechaza, se cierra a mano: perder una
        # conexión es preferible a dejarla colgando.
        with contextlib.suppress(Exception):
            raw.close()


def conectar(_ignorado=None, solo_lectura: bool = False) -> _Conexion:
    """Reemplazo directo de sqlite3.connect(ruta) — el argumento de ruta ya
    no importa (una sola base Supabase), se acepta solo para no tener que
    tocar cada sitio que llamaba sqlite3.connect(ALGUNA_RUTA).

    Ahora saca la conexión de un pool. Si la que toca está muerta (el servidor
    se reinició, la red se cayó), se descarta y se pide otra: una conexión
    guardada de hace media hora puede no servir, y eso no debe ser un error
    del usuario.

    `solo_lectura=True` la pone en autocommit. Suena raro para algo que no
    escribe, y por eso: psycopg2 abre una transacción implícita en cuanto
    haces un SELECT, así que al soltar la conexión había que deshacerla — otro
    viaje de ida y vuelta, y a un cuarto de segundo cada uno eso DUPLICA el
    coste de toda lectura. En autocommit no se abre nada y no hay nada que
    deshacer.

    Las escrituras siguen en transacción: `flujo.decidir` escribe varias filas
    en un bloque y tienen que entrar o no entrar juntas.
    """
    pool = _obtener_pool()
    for intento in (1, 2):
        raw = pool.getconn()
        try:
            if raw.closed != 0:
                raise psycopg2.OperationalError("conexión del pool ya cerrada")

            # La comprobación de que sigue viva cuesta un viaje de ida y vuelta
            # —aquí, un cuarto de segundo— así que NO se hace siempre. Una
            # conexión que se soltó hace un segundo está viva; la que lleva
            # minutos parada puede haberla cerrado el pooler de Supabase por su
            # lado, y ahí sí conviene mirar antes de empezar a escribir.
            parada = time.monotonic() - getattr(raw, "_devuelta_en", 0)
            if parada > IDLE_COMPROBAR:
                raw.cursor().execute("SELECT 1")
                raw.rollback()

            # Se fija en cada préstamo, no una vez: la misma conexión sirve
            # ratos de lectura y ratos de escritura. Es un ajuste local de
            # psycopg2, no cuesta red.
            raw.autocommit = solo_lectura
            return _Conexion(raw)
        except psycopg2.Error:
            with contextlib.suppress(Exception):
                pool.putconn(raw, close=True)
            if intento == 2:
                raise
    raise psycopg2.OperationalError("no se pudo obtener una conexión")


_engine = None


def engine():
    """Motor de SQLAlchemy, para pandas.read_sql()/to_sql()."""
    global _engine
    if _engine is None:
        _engine = create_engine(_dsn())
    return _engine


# Qué tablas se sabe que existen. Que una tabla exista es un hecho del
# esquema, no un dato: no cambia mientras el proceso vive. Sin esta caché,
# cada petición autenticada gastaba una consulta en preguntar si `sesiones`
# sigue ahí.
#
# Sólo se guarda el SÍ. El NO no se cachea a propósito: el caso normal es
# "alguien acaba de aplicar el esquema y reinició el frontend pero no el
# backend", y cachear el no obligaría a reiniciar para que se enterara.
_tablas_vistas: set[str] = set()


def tabla_existe(nombre: str) -> bool:
    if nombre in _tablas_vistas:
        return True
    con = conectar()
    try:
        fila = con.execute("SELECT to_regclass(?) IS NOT NULL AS existe", (nombre,)).fetchone()
        existe = bool(fila["existe"]) if fila else False
    finally:
        con.close()
    if existe:
        _tablas_vistas.add(nombre)
    return existe
