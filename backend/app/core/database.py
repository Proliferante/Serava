"""
core/database.py
================
Acceso a Postgres para el backend oficial (auth, usuarios, flujo).

No reimplementa la conexión: reutiliza la que ya usa el pipeline
(`app/services/admin/db_admin.py`), que envuelve psycopg2 para que
`con.execute(sql, params)` funcione con placeholders `?` y devuelva filas
como diccionarios. Dos capas de conexión distintas a la misma base sería
pedir problemas —dos pools, dos formas de escapar, dos sitios donde
arreglar el mismo bug—.

Lo que sí añade este módulo es la forma cómoda de usarla desde endpoints:

    with cursor() as con:
        fila = con.execute("SELECT ...", (x,)).fetchone()

`cursor()` cierra la conexión siempre, incluso si el endpoint lanza; y
`escribir()` hace además el commit.
"""

from contextlib import contextmanager, suppress

from app.services.admin import db_admin as _db


@contextmanager
def cursor():
    """Conexión de sólo lectura. Se devuelve al pool al salir del bloque.

    Va en autocommit (ver `db_admin.conectar`): sin eso, el SELECT abriría una
    transacción implícita que habría que deshacer al soltar la conexión, y ese
    rollback es otro viaje de ida y vuelta a Supabase. Con la latencia de
    aquí, era la mitad del coste de cada lectura.
    """
    con = _db.conectar(solo_lectura=True)
    try:
        yield con
    finally:
        con.close()


@contextmanager
def escribir():
    """Conexión que hace commit al salir bien, y rollback si algo lanza.

    Sin el rollback explícito, una excepción a mitad de una escritura
    dejaría la transacción abierta hasta que el recolector cerrara la
    conexión, y con ella un candado sobre las filas tocadas.
    """
    con = _db.conectar()
    try:
        yield con
        con.commit()
    except Exception:
        with suppress(Exception):
            con.rollback()
        raise
    finally:
        con.close()


def tabla_existe(nombre: str) -> bool:
    return _db.tabla_existe(nombre)
