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

import os
import re

import psycopg2
import psycopg2.extras
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
    igual que en sqlite3.Connection, con filas tipo dict."""

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
        self._raw.close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()

    def __getattr__(self, nombre):
        return getattr(self._raw, nombre)


def conectar(_ignorado=None) -> _Conexion:
    """Reemplazo directo de sqlite3.connect(ruta) — el argumento de ruta ya
    no importa (una sola base Supabase), se acepta solo para no tener que
    tocar cada sitio que llamaba sqlite3.connect(ALGUNA_RUTA)."""
    return _Conexion(psycopg2.connect(_dsn()))


_engine = None


def engine():
    """Motor de SQLAlchemy, para pandas.read_sql()/to_sql()."""
    global _engine
    if _engine is None:
        _engine = create_engine(_dsn())
    return _engine


def tabla_existe(nombre: str) -> bool:
    con = conectar()
    try:
        fila = con.execute("SELECT to_regclass(?) IS NOT NULL AS existe", (nombre,)).fetchone()
        return bool(fila["existe"]) if fila else False
    finally:
        con.close()
