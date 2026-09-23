# -*- coding: utf-8 -*-
"""
scripts/mudanza.py
==================
Mudar Zequara del proyecto de Supabase «Project PGI» al suyo propio, «Zequara».

POR QUÉ HAY QUE MUDARSE
    PGI no es un proyecto de Zequara: es un proyecto compartido. Dentro
    conviven `wappa_whatsapp` (18 tablas), `admin`, `app`, `scheduler`,
    `system` y `notifications` — otro producto entero—, y Zequara vive de
    prestado en `public` y en un bucket. Eso significa una factura, una
    ventana de mantenimiento, un límite de conexiones y una contraseña de
    base de datos compartidos con algo que no tiene nada que ver, y un
    `DROP SCHEMA public` de cualquiera de los dos lados se lleva al otro.

LO QUE SE MUEVE, Y LO QUE NO
    Se mueve `public` entera —las 9 tablas de Zequara— y el bucket `Fichas`.
    No se toca ningún otro esquema: son de PGI y ahí se quedan.

    La separación es limpia y está comprobada: no hay ni una clave foránea
    que cruce de `public` a otro esquema ni al revés, ni vistas, ni
    triggers, ni funciones propias (las 78 de `public` son de las
    extensiones), ni políticas RLS. El único enredo real son las 16 URLs de
    fotos guardadas en `inmueble_detalle.ficha_fotos`, que llevan dentro el
    dominio del proyecto viejo y hay que reescribir.

POR QUÉ NO ES UN pg_dump
    Esta máquina no tiene cliente de Postgres ni Docker, así que el DDL se
    saca de los catálogos del propio Postgres —`pg_get_constraintdef` y
    `pg_get_indexdef` devuelven el SQL exacto— y los datos viajan con COPY
    de una conexión a la otra. Para 25 MB y 9 tablas sobra, y de paso queda
    un .sql legible que se puede revisar antes de aplicar nada.

CÓMO SE USA
    Las credenciales del destino van en `backend/.env.destino`, que está
    fuera del repo. Hace falta:

        DATABASE_URL=postgresql://postgres.<ref>:<clave>@aws-0-us-east-1.pooler.supabase.com:5432/postgres
        SUPABASE_URL=https://<ref>.supabase.co
        SUPABASE_SERVICE_KEY=sb_secret_...
        SUPABASE_BUCKET=Fichas

    Y luego, en este orden:

        python scripts/mudanza.py revisar    # qué hay a cada lado, sin tocar nada
        python scripts/mudanza.py esquema    # escribe database/mudanza_zequara.sql
        python scripts/mudanza.py crear      # aplica ese .sql en el destino
        python scripts/mudanza.py datos      # copia las filas
        python scripts/mudanza.py fotos      # copia el bucket y reescribe las URLs
        python scripts/mudanza.py verificar  # compara los dos lados

    Ninguno de los pasos borra nada del origen. PGI se queda intacto hasta
    que alguien decida, aparte y a mano, limpiar lo que ya está mudado.
"""
from __future__ import annotations

import io
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

import psycopg2
import psycopg2.extras

RAIZ = Path(__file__).resolve().parents[1]
SQL_SALIDA = RAIZ.parent / "database" / "mudanza_zequara.sql"

# Las que instala Supabase por su cuenta y no hay que pedir.
EXT_GESTIONADAS = {"plpgsql", "supabase_vault", "pg_stat_statements"}


# ── Configuración ────────────────────────────────────────────────────────

def _leer_env(ruta: Path) -> dict[str, str]:
    """Un .env plano. Sin dependencias: son cuatro líneas."""
    if not ruta.exists():
        raise SystemExit(f"Falta {ruta}. Mira la cabecera de este archivo.")
    fuera = {}
    for linea in ruta.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#") or "=" not in linea:
            continue
        k, v = linea.split("=", 1)
        fuera[k.strip()] = v.strip().strip('"').strip("'")
    return fuera


ORIGEN = _leer_env(RAIZ / ".env")
DESTINO = _leer_env(RAIZ / ".env.destino") if (RAIZ / ".env.destino").exists() else {}


def _exige_destino() -> dict[str, str]:
    if not DESTINO:
        raise SystemExit("Falta backend/.env.destino. Mira la cabecera de este archivo.")
    for k in ("DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_BUCKET"):
        if not DESTINO.get(k):
            raise SystemExit(f"Falta {k} en backend/.env.destino.")
    return DESTINO


def _ref(url: str) -> str:
    """El identificador del proyecto, que es lo único que hace falta enseñar."""
    return url.split("//")[-1].split(".")[0]


def conectar(url: str):
    c = psycopg2.connect(url, connect_timeout=20)
    c.cursor_factory = psycopg2.extras.RealDictCursor
    return c


def _filas(con, sql, args=()):
    with con.cursor() as cur:
        cur.execute(sql, args)
        return cur.fetchall()


# ── Qué hay a cada lado ──────────────────────────────────────────────────

CONSULTA_TABLAS = """
    SELECT c.relname AS tabla, pg_total_relation_size(c.oid) AS bytes
      FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relkind = 'r'
     ORDER BY c.relname
"""


def _inventario(con) -> list[tuple[str, int, int]]:
    """Nombre, filas contadas de verdad y bytes. Contadas y no estimadas:
    `reltuples` es una estimación del planificador y en una mudanza la
    pregunta es «¿están TODAS?»."""
    fuera = []
    for t in _filas(con, CONSULTA_TABLAS):
        n = _filas(con, f'SELECT count(*) AS n FROM public."{t["tabla"]}"')[0]["n"]
        fuera.append((t["tabla"], n, t["bytes"]))
    return fuera


def _objetos(con, bucket: str) -> list[dict]:
    return _filas(con, """
        SELECT o.name AS ruta,
               (o.metadata->>'size')::bigint AS bytes,
               o.metadata->>'mimetype' AS tipo
          FROM storage.objects o JOIN storage.buckets b ON b.id = o.bucket_id
         WHERE b.name = %s ORDER BY o.name""", (bucket,))


def revisar() -> None:
    print(f"ORIGEN  · proyecto {_ref(ORIGEN['SUPABASE_URL'])}")
    with conectar(ORIGEN["DATABASE_URL"]) as con:
        inv = _inventario(con)
        for t, n, b in inv:
            print(f"   {t:<28} {n:>7} filas  {b/1048576:>7.2f} MB")
        print(f"   {'TOTAL':<28} {sum(x[1] for x in inv):>7} filas  "
              f"{sum(x[2] for x in inv)/1048576:>7.2f} MB")
        fotos = _objetos(con, ORIGEN["SUPABASE_BUCKET"])
        print(f"   bucket {ORIGEN['SUPABASE_BUCKET']}: {len(fotos)} archivo(s), "
              f"{sum(f['bytes'] for f in fotos)/1048576:.2f} MB")

    if not DESTINO:
        print("\nDESTINO · sin backend/.env.destino todavía")
        return
    print(f"\nDESTINO · proyecto {_ref(DESTINO['SUPABASE_URL'])}")
    with conectar(DESTINO["DATABASE_URL"]) as con:
        inv = _inventario(con)
        if not inv:
            print("   public está vacía")
        for t, n, b in inv:
            print(f"   {t:<28} {n:>7} filas  {b/1048576:>7.2f} MB")
        fotos = _objetos(con, DESTINO["SUPABASE_BUCKET"])
        print(f"   bucket {DESTINO['SUPABASE_BUCKET']}: {len(fotos)} archivo(s)")


# ── El esquema, sacado de los catálogos ──────────────────────────────────

def _ddl_tabla(con, tabla: str) -> str:
    cols = _filas(con, """
        SELECT a.attname AS nombre,
               format_type(a.atttypid, a.atttypmod) AS tipo,
               a.attnotnull AS no_nulo,
               pg_get_expr(d.adbin, d.adrelid) AS predeterminado,
               a.attidentity AS identidad
          FROM pg_attribute a
          LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
         WHERE a.attrelid = %s::regclass AND a.attnum > 0 AND NOT a.attisdropped
         ORDER BY a.attnum""", (f'public."{tabla}"',))

    lineas = []
    for c in cols:
        pred = c["predeterminado"]
        # Una columna `serial` es un int con DEFAULT nextval de una secuencia
        # propia. Se vuelve a escribir como serial para que el destino cree
        # la secuencia él solo, con su dueño y sus permisos: copiar el
        # `nextval(...)` a pelo dejaría un DEFAULT apuntando a una secuencia
        # que todavía no existe.
        if pred and pred.startswith("nextval(") and c["tipo"] in ("integer", "bigint", "smallint"):
            tipo = {"integer": "serial", "bigint": "bigserial", "smallint": "smallserial"}[c["tipo"]]
            lineas.append(f'    "{c["nombre"]}" {tipo}')
            continue
        t = f'    "{c["nombre"]}" {c["tipo"]}'
        if c["identidad"] in ("a", "d"):
            siempre = "ALWAYS" if c["identidad"] == "a" else "BY DEFAULT"
            t += f" GENERATED {siempre} AS IDENTITY"
        elif pred:
            t += f" DEFAULT {pred}"
        if c["no_nulo"]:
            t += " NOT NULL"
        lineas.append(t)

    # Las restricciones de tabla —clave primaria, únicas, CHECK— van dentro
    # del CREATE. Las foráneas NO: se añaden al final del archivo, cuando ya
    # existen todas las tablas, o el orden de creación importaría.
    restr = _filas(con, """
        SELECT conname AS nombre, pg_get_constraintdef(oid) AS def, contype AS tipo
          FROM pg_constraint
         WHERE conrelid = %s::regclass AND contype IN ('p','u','c')
         ORDER BY contype, conname""", (f'public."{tabla}"',))
    for r in restr:
        lineas.append(f'    CONSTRAINT "{r["nombre"]}" {r["def"]}')

    return f'CREATE TABLE public."{tabla}" (\n' + ",\n".join(lineas) + "\n);"


def esquema() -> None:
    with conectar(ORIGEN["DATABASE_URL"]) as con:
        partes: list[str] = [
            "-- Generado por backend/scripts/mudanza.py a partir del proyecto",
            f"-- {_ref(ORIGEN['SUPABASE_URL'])}. No se edita a mano: se vuelve a generar.",
            "",
        ]

        ext = [e["extname"] for e in _filas(con, "SELECT extname FROM pg_extension ORDER BY 1")
               if e["extname"] not in EXT_GESTIONADAS]
        partes.append("-- Extensiones que usa el esquema.")
        partes += [f'CREATE EXTENSION IF NOT EXISTS "{e}";' for e in ext]
        partes.append("")

        tablas = [t["tabla"] for t in _filas(con, CONSULTA_TABLAS)]
        for t in tablas:
            partes.append(_ddl_tabla(con, t))
            partes.append("")

        partes.append("-- Índices que no vienen de una restricción.")
        for t in tablas:
            for i in _filas(con, """
                SELECT indexdef FROM pg_indexes
                 WHERE schemaname='public' AND tablename=%s
                   AND indexname NOT IN (
                       SELECT conname FROM pg_constraint WHERE conrelid = %s::regclass)
                 ORDER BY indexname""", (t, f'public."{t}"')):
                partes.append(i["indexdef"] + ";")
        partes.append("")

        partes.append("-- Claves foráneas, al final: necesitan todas las tablas creadas.")
        for t in tablas:
            for f in _filas(con, """
                SELECT conname AS nombre, pg_get_constraintdef(oid) AS def
                  FROM pg_constraint WHERE conrelid = %s::regclass AND contype='f'
                 ORDER BY conname""", (f'public."{t}"',)):
                partes.append(f'ALTER TABLE public."{t}" ADD CONSTRAINT "{f["nombre"]}" {f["def"]};')

    SQL_SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SQL_SALIDA.write_text("\n".join(partes) + "\n", encoding="utf-8")
    print(f"escrito: {SQL_SALIDA}")
    print(f"   {len(tablas)} tablas · {len(ext)} extensiones")
    print("   Léelo antes de aplicarlo.")


def crear() -> None:
    d = _exige_destino()
    if not SQL_SALIDA.exists():
        raise SystemExit("Primero: python scripts/mudanza.py esquema")
    sql = SQL_SALIDA.read_text(encoding="utf-8")
    with conectar(d["DATABASE_URL"]) as con:
        ya = _filas(con, CONSULTA_TABLAS)
        if ya:
            raise SystemExit(
                "El destino ya tiene tablas en public: "
                + ", ".join(t["tabla"] for t in ya)
                + ".\nSi es de un intento anterior, bórralas a mano antes de repetir.")
        # Todo el archivo en una sola transacción. En Postgres el DDL es
        # transaccional, así que si falla una línea no queda medio esquema
        # creado: el destino se queda exactamente como estaba y se puede
        # arreglar el .sql y repetir.
        with con.cursor() as cur:
            cur.execute(sql)
        con.commit()
    print(f"esquema aplicado en {_ref(d['SUPABASE_URL'])}")


# ── Los datos ────────────────────────────────────────────────────────────

def _orden_por_dependencias(con) -> list[str]:
    """Las tablas apuntadas primero: copiar `sesiones` antes que `usuarios`
    reventaría contra la clave foránea."""
    tablas = [t["tabla"] for t in _filas(con, CONSULTA_TABLAS)]
    deps: dict[str, set[str]] = {t: set() for t in tablas}
    for f in _filas(con, """
        SELECT cl.relname AS tabla, fcl.relname AS apunta_a
          FROM pg_constraint co
          JOIN pg_class cl ON cl.oid = co.conrelid
          JOIN pg_namespace n ON n.oid = cl.relnamespace
          JOIN pg_class fcl ON fcl.oid = co.confrelid
         WHERE co.contype='f' AND n.nspname='public'"""):
        if f["tabla"] != f["apunta_a"]:
            deps[f["tabla"]].add(f["apunta_a"])
    orden, puestas = [], set()
    while len(orden) < len(tablas):
        avance = False
        for t in tablas:
            if t not in puestas and deps[t] <= puestas:
                orden.append(t); puestas.add(t); avance = True
        if not avance:  # ciclo: no lo hay hoy, pero mejor fallar que colgarse
            orden += [t for t in tablas if t not in puestas]
            break
    return orden


def datos() -> None:
    d = _exige_destino()
    with conectar(ORIGEN["DATABASE_URL"]) as o, conectar(d["DATABASE_URL"]) as z:
        orden = _orden_por_dependencias(o)
        for t in orden:
            n = _filas(o, f'SELECT count(*) AS n FROM public."{t}"')[0]["n"]
            hay = _filas(z, f'SELECT count(*) AS n FROM public."{t}"')[0]["n"]
            if hay:
                print(f"   {t:<28} ya tiene {hay} filas · se salta")
                continue
            if not n:
                print(f"   {t:<28} vacía en el origen")
                continue
            # Por memoria: 17.000 filas de `raw_listings` con su HTML dentro
            # no caben cómodas en una lista de Python, pero sí pasan por un
            # buffer de texto en CSV.
            buf = io.StringIO()
            with o.cursor() as cur:
                cur.copy_expert(f'COPY public."{t}" TO STDOUT WITH (FORMAT csv)', buf)
            buf.seek(0)
            with z.cursor() as cur:
                cur.copy_expert(f'COPY public."{t}" FROM STDIN WITH (FORMAT csv)', buf)
            z.commit()
            print(f"   {t:<28} {n:>7} filas copiadas")

        # Las secuencias quedan en 1 después de un COPY —COPY no las toca—, y
        # el siguiente INSERT chocaría contra la clave primaria.
        print("\n   secuencias:")
        for s in _filas(o, """
            SELECT c.relname AS sec, a.attrelid::regclass::text AS tabla, a.attname AS col
              FROM pg_class c
              JOIN pg_depend dep ON dep.objid = c.oid AND dep.deptype IN ('a','i')
              JOIN pg_attribute a ON a.attrelid = dep.refobjid AND a.attnum = dep.refobjsubid
              JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE c.relkind='S' AND n.nspname='public'"""):
            with z.cursor() as cur:
                # El tercer argumento es `is_called`: en falso, la siguiente
                # llamada devuelve el valor dado en vez del siguiente. Sin eso
                # una tabla vacía empezaría en 2.
                cur.execute(
                    f'''SELECT setval(%s,
                               COALESCE((SELECT max("{s["col"]}") FROM {s["tabla"]}), 1),
                               (SELECT max("{s["col"]}") FROM {s["tabla"]}) IS NOT NULL)''',
                    (f'public."{s["sec"]}"',))
                v = cur.fetchone()["setval"]
            z.commit()
            print(f"      {s['sec']:<30} → {v}")


# ── Las fotos ────────────────────────────────────────────────────────────

def _cabeceras(clave: str, tipo: str | None = None) -> dict[str, str]:
    h = {"Authorization": f"Bearer {clave}", "apikey": clave}
    if tipo:
        h["Content-Type"] = tipo
        h["x-upsert"] = "true"
    return h


def _pedir(req: urllib.request.Request) -> bytes:
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{e.code} de Supabase: {e.read()[:300].decode('utf-8', 'replace')}") from e


def fotos() -> None:
    d = _exige_destino()
    bucket_o, bucket_d = ORIGEN["SUPABASE_BUCKET"], d["SUPABASE_BUCKET"]

    with conectar(ORIGEN["DATABASE_URL"]) as o:
        objetos = _objetos(o, bucket_o)
    if not objetos:
        raise SystemExit("No hay nada en el bucket de origen.")

    # El bucket, si no está. Público como el de origen: las fotos de la ficha
    # las sirve el sitio a cualquiera, no hay nada que proteger.
    crear_b = urllib.request.Request(
        f"{d['SUPABASE_URL']}/storage/v1/bucket",
        data=json.dumps({"id": bucket_d, "name": bucket_d, "public": True}).encode(),
        headers=_cabeceras(d["SUPABASE_SERVICE_KEY"], "application/json"), method="POST")
    try:
        urllib.request.urlopen(crear_b, timeout=30)
        print(f"bucket «{bucket_d}» creado")
    except urllib.error.HTTPError as e:
        cuerpo = e.read().decode("utf-8", "replace")
        if "already exists" in cuerpo or e.code == 409:
            print(f"bucket «{bucket_d}» ya existía")
        else:
            raise SystemExit(f"no se pudo crear el bucket: {e.code} {cuerpo[:200]}")

    for ob in objetos:
        origen_url = f"{ORIGEN['SUPABASE_URL']}/storage/v1/object/public/{bucket_o}/{ob['ruta']}"
        datos_bin = _pedir(urllib.request.Request(origen_url))
        subir = urllib.request.Request(
            f"{d['SUPABASE_URL']}/storage/v1/object/{bucket_d}/{ob['ruta']}",
            data=datos_bin,
            headers=_cabeceras(d["SUPABASE_SERVICE_KEY"], ob["tipo"] or "application/octet-stream"),
            method="POST")
        _pedir(subir)
        print(f"   {len(datos_bin)/1048576:>6.2f} MB  {ob['ruta']}")

    # Y lo que de verdad rompe si se olvida: las URLs guardadas dentro del
    # JSON de la ficha llevan el dominio del proyecto viejo. Mientras PGI
    # siga en pie las fotos se seguirían viendo —desde el proyecto de otro—,
    # y el día que se limpie, la ficha se queda sin imágenes.
    viejo, nuevo = ORIGEN["SUPABASE_URL"], d["SUPABASE_URL"]
    with conectar(d["DATABASE_URL"]) as z:
        with z.cursor() as cur:
            cur.execute("""
                UPDATE inmueble_detalle
                   SET ficha_fotos = replace(ficha_fotos::text, %s, %s)::jsonb
                 WHERE ficha_fotos::text LIKE %s""",
                (viejo, nuevo, f"%{viejo}%"))
            n1 = cur.rowcount
            cur.execute("""
                UPDATE hub_contenido SET foto = replace(foto, %s, %s)
                 WHERE foto LIKE %s""", (viejo, nuevo, f"%{viejo}%"))
            n2 = cur.rowcount
        z.commit()
    print(f"\nURLs reescritas: {n1} ficha(s), {n2} contenido(s) del HUB")


# ── Comprobar ────────────────────────────────────────────────────────────

def verificar() -> None:
    d = _exige_destino()
    with conectar(ORIGEN["DATABASE_URL"]) as o, conectar(d["DATABASE_URL"]) as z:
        inv_o = {t: n for t, n, _ in _inventario(o)}
        inv_z = {t: n for t, n, _ in _inventario(z)}
        mal = 0
        print(f"{'tabla':<28} {'origen':>8} {'destino':>8}")
        for t in sorted(set(inv_o) | set(inv_z)):
            a, b = inv_o.get(t, "—"), inv_z.get(t, "—")
            señal = "" if a == b else "   ← NO CUADRA"
            if a != b:
                mal += 1
            print(f"{t:<28} {a:>8} {b:>8}{señal}")

        fo, fz = _objetos(o, ORIGEN["SUPABASE_BUCKET"]), _objetos(z, d["SUPABASE_BUCKET"])
        rutas_o = {x["ruta"]: x["bytes"] for x in fo}
        rutas_z = {x["ruta"]: x["bytes"] for x in fz}
        print(f"\nfotos: origen {len(rutas_o)} · destino {len(rutas_z)}")
        for r, b in rutas_o.items():
            if rutas_z.get(r) != b:
                mal += 1
                print(f"   NO CUADRA {r}: {b} vs {rutas_z.get(r)}")

        pendientes = _filas(z, """
            SELECT count(*) AS n FROM inmueble_detalle
             WHERE ficha_fotos::text LIKE %s""", (f"%{_ref(ORIGEN['SUPABASE_URL'])}%",))[0]["n"]
        print(f"fichas que todavía apuntan al proyecto viejo: {pendientes}")
        mal += pendientes

    print("\n" + ("TODO CUADRA" if mal == 0 else f"{mal} cosa(s) que revisar"))


if __name__ == "__main__":
    ordenes = {
        "revisar": revisar, "esquema": esquema, "crear": crear,
        "datos": datos, "fotos": fotos, "verificar": verificar,
    }
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if len(sys.argv) != 2 or sys.argv[1] not in ordenes:
        raise SystemExit("uso: python scripts/mudanza.py " + " | ".join(ordenes))
    ordenes[sys.argv[1]]()
