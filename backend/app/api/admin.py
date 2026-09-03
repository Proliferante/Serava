"""
api/admin.py
============
Consola interna de Zequara (embudo, seguimiento, add-value) montada como
router de FastAPI en /api/admin, dentro del mismo backend oficial.

Es la versión "router" de api_zequora.py (repo local del pipeline, ver
contexto/LEEME_integracion.md ahí): mismo código, sin reimplementar nada —
importa y llama a los scripts que ya existen en app/services/admin/. Los
únicos cambios frente al original:
    - FastAPI() -> APIRouter() (el proceso y el CORS los define main.py,
      compartidos con el resto del backend oficial).
    - Las rutas ya no llevan el prefijo "/api": lo agrega main.py al montar
      este router con prefix="/api/admin".
    - Se quitó "GET /" (servía el HTML) porque ahora el HTML lo sirve el
      frontend Next.js en /admin (ver frontend/app/admin/page.tsx).

CRITERIOS FIJOS (ya no son opciones de pantalla, van por dentro)
    · Tipo de inmueble : apartamento y casa, siempre.
      Metrocuadrado    → realEstateTypeList=["apartamento","casa"] en el
                         propio script de extracción.
      Encuentra24      → las URLs de las 3 zonas de Panamá.
    · Portal           : no lo elige nadie, lo determina la zona
                         (CONFIG_ZONAS ya dice qué portal le corresponde).
    · Criterio precio  : precio/m² por debajo de la MEDIANA de su zona,
                         calculado por zona y por moneda por separado.
    · Criterio calidad : (dentro del polígono real, o similar estadístico
                         MCD, o sin evaluar por falta de coordenadas) y
                         bajo la mediana de su zona — ver
                         CRITERIOS_ARQUITECTO. No hace falta filtrar
                         duplicados aparte: clean_listings ya sale
                         deduplicada de la limpieza.
"""

import io
import bisect
import logging
import threading
import contextlib
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

# --- el pipeline real -------------------------------------------------------
from app.services.admin import db_admin as db
from app.services.admin import script_extract_serava as extract
from app.services.admin import script_transform_serava as transform
from app.services.admin import seguimiento

router = APIRouter()


# ---------------------------------------------------------------------------
# 1. ESTADO DE LA CORRIDA
# ---------------------------------------------------------------------------
# Una sola corrida a la vez, a propósito: dos procesos escribiendo
# raw_listings al tiempo es la forma más fácil de corromper los datos.

ESTADO = {
    "corriendo": False,
    "paso": 0,
    "total": 0,
    "log": [],
    "inicio": None,
    "fin": None,
    "error": None,
    "zonas": [],
}
_LOCK = threading.Lock()


def _log(msg: str, nivel: str = "info"):
    ESTADO["log"].append({"t": datetime.now().strftime("%H:%M:%S"), "m": msg, "n": nivel})


class _HandlerBitacora(logging.Handler):
    """Reenvía a la pantalla lo que los scripts ya escriben con logging,
    en vez de inventar mensajes nuevos: lo que ve el equipo en la consola
    web es literalmente lo que dice el pipeline."""

    def emit(self, record):
        try:
            _log(record.getMessage(), "warn" if record.levelno >= logging.WARNING else "info")
        except Exception:
            pass


# ---------------------------------------------------------------------------
# 2. CONFIG: zonas y criterios fijos
# ---------------------------------------------------------------------------

MONEDA_POR_PAIS = {"Colombia": "COP", "Panamá": "USD"}


def _zonas_config():
    return [
        {
            "zona": z["zona"],
            "ciudad": z["ciudad"],
            "pais": z["pais"],
            "portal": z["portal"],
            "moneda": MONEDA_POR_PAIS.get(z["pais"], "COP"),
            "urls": len(z["urls"]),
        }
        for z in extract.CONFIG_ZONAS
    ]


@router.get("/config")
def config():
    return {
        "zonas": _zonas_config(),
        "criterios_fijos": {
            "tipo_inmueble": ["Apartamento", "Casa"],
            "portales": sorted({z["portal"] for z in extract.CONFIG_ZONAS}),
            "criterio_precio": "precio_m2 < mediana de precio_m2 de su zona (por zona y por moneda)",
            "criterio_calidad": "dentro del polígono real, similar estadístico (MCD), o sin evaluar por falta de coordenadas — y por debajo de la mediana de su zona (el listado ya viene deduplicado desde la limpieza)",
            "frecuencia_sugerida": "mensual",
        },
        "fuente": "clean_listings (Supabase · Project PGI)",
        "ultima_corrida": _ultima_corrida(),
    }


def _ultima_corrida():
    if not db.tabla_existe("clean_listings"):
        return None
    con = db.conectar()
    try:
        f = con.execute("SELECT MAX(fecha_consulta) AS f FROM clean_listings").fetchone()["f"]
        return f
    except Exception:
        return None
    finally:
        con.close()


# ---------------------------------------------------------------------------
# 3. LECTURA DE PREDIOS
# ---------------------------------------------------------------------------

COLUMNAS = """pais, ciudad, zona, moneda, portal, link, tipo_inmueble, titulo,
    precio_venta, area_m2, precio_m2, precio_m2_clasificacion, metodo_atipico,
    mediana_precio_m2_zona, bajo_media_zona, habitaciones, banos,
    posible_duplicado, modelo_repetido_edificio_nuevo, dentro_poligono_real,
    similar_a_zona, filtro_arquitectonico, motivo_no_pasa, disponible,
    requiere_revision"""

# EL ARQUITECTO SOLO VE Y GUARDA DECISIÓN SOBRE LO QUE YA PASÓ ESTOS DOS
# FILTROS. Van aquí, no en la pantalla, y se aplican siempre (no hay "ver
# todo" que los relaje) — tanto en /predios como en /seguimiento.
#   1. Validación geográfica: dentro del polígono real, o fuera pero
#      similar por el método estadístico robusto (MCD), o sin evaluar por
#      falta de coordenadas. "Sin evaluar" (dentro_poligono_real IS NULL,
#      típico de Panamá) NO se excluye: la regla del proyecto es que nunca
#      se descarta por defecto solo por falta de coordenadas.
#   2. precio_m2 por debajo de la mediana de su zona (bajo_media_zona).
#
# NO hay condición de deduplicación aparte: clean_listings ya sale
# deduplicada de script_transform_serava.py (eliminar_duplicados_confirmados
# deja 1 solo representante por grupo chico) — verificado contra la base
# real: ninguno de los grupos marcados posible_duplicado=1 tiene más de 1
# fila en clean_listings.
CRITERIOS_ARQUITECTO = [
    "(dentro_poligono_real = 1 OR similar_a_zona = 1 OR dentro_poligono_real IS NULL)",
    "bajo_media_zona = 1",
]


@router.get("/predios")
def predios(
    paises: str = Query("", description="Colombia,Panamá"),
    ciudades: str = Query(""),
    zonas: str = Query(""),
    limite: int = Query(1500),
):
    if not db.tabla_existe("clean_listings"):
        raise HTTPException(404, "Todavía no existe clean_listings. Corre una extracción primero.")

    where, params = [], []
    for campo, valor in (("pais", paises), ("ciudad", ciudades), ("zona", zonas)):
        vals = [v for v in valor.split(",") if v.strip()]
        if vals:
            where.append(f"{campo} IN ({','.join('?' * len(vals))})")
            params.extend(vals)

    sql = f"SELECT {COLUMNAS} FROM clean_listings"
    sql_where = where + CRITERIOS_ARQUITECTO
    if sql_where:
        sql += " WHERE " + " AND ".join(sql_where)
    # Sin ORDER BY ni LIMIT en el SQL: hay que tener TODAS las filas que
    # cumplen el filtro antes de calcular el Score Zequara y ordenar por él
    # — si se limitara antes, "las mejores" saldrían de un recorte
    # arbitrario en vez de de verdad las mejores del universo completo.
    # El tope `limite` se aplica al final.

    con = db.conectar()
    todas = [dict(r) for r in con.execute(sql, params).fetchall()]

    # Score Zequara por predio: se agrupa por zona para calcular percentiles
    # y el contexto de zona una sola vez por zona (no una consulta por fila).
    por_zona: dict[str, list[dict]] = {}
    for fila in todas:
        por_zona.setdefault(fila["zona"], []).append(fila)
    for zona, filas_zona in por_zona.items():
        info_zona = _zona_stats(con, zona)
        precios = info_zona["_precios"] if info_zona else []
        areas = info_zona["_areas"] if info_zona else []
        for fila in filas_zona:
            score, detalle, av, pct_precio, pct_area = _score_predio_detalle(fila, precios, areas, info_zona)
            fila["score_zequara"] = score
            fila["prioridad_revision"] = detalle["prioridad"]
            fila["percentil_precio_zona"] = pct_precio
            fila["percentil_area_zona"] = pct_area

    todas.sort(key=lambda r: r["score_zequara"], reverse=True)
    truncado_real = len(todas) > limite
    filas = todas[:limite]

    # Resumen del embudo: se calcula sobre TODO el universo geográfico
    # pedido, SIN los dos filtros del arquitecto — si no, el embudo
    # mentiría escondiendo lo que quedó marcado en vez de mostrarlo.
    # "habilitados" abajo sí los aplica, para poder mostrarlo como el
    # último escalón del embudo en la pantalla.
    cond = f" WHERE {' AND '.join(where)}" if where else ""
    geo_params = params

    resumen = dict(
        con.execute(
            f"""SELECT COUNT(*) clean,
                       SUM(bajo_media_zona) bajo,
                       SUM(CASE WHEN {' AND '.join(CRITERIOS_ARQUITECTO)} THEN 1 ELSE 0 END) habilitados,
                       SUM(CASE WHEN precio_m2_clasificacion LIKE 'atipico%' THEN 1 ELSE 0 END) atipicos,
                       SUM(CASE WHEN dentro_poligono_real=0 THEN 1 ELSE 0 END) fuera,
                       SUM(CASE WHEN dentro_poligono_real IS NULL THEN 1 ELSE 0 END) sin_evaluar,
                       SUM(CASE WHEN similar_a_zona=1 THEN 1 ELSE 0 END) similares
                FROM clean_listings{cond}""",
            geo_params,
        ).fetchone()
        or {}
    )
    con.close()

    # Los dos primeros escalones del embudo (extraídos y en scope de zona)
    # solo existen en la base cruda: clean_listings ya viene filtrada.
    if db.tabla_existe("raw_listings"):
        rc = db.conectar()
        rsql = "SELECT COUNT(*) extraidos, SUM(CASE WHEN en_scope_zona='1' THEN 1 ELSE 0 END) en_scope FROM raw_listings"
        if where:
            rsql += " WHERE " + " AND ".join(where)
        r = dict(rc.execute(rsql, geo_params).fetchone())
        rc.close()
        resumen.update(r)

    return {"filas": filas, "resumen": resumen, "truncado": truncado_real}


# ---------------------------------------------------------------------------
# 4. CORRIDA REAL DEL PIPELINE
# ---------------------------------------------------------------------------


class PeticionExtraer(BaseModel):
    zonas: list[str] = []          # vacío = las 10
    solo_transformar: bool = False  # rehacer limpieza sin volver a scrapear


def _correr(zonas_pedidas: list[str], solo_transformar: bool):
    handler = _HandlerBitacora()
    logging.getLogger().addHandler(handler)
    try:
        cfgs = [z for z in extract.CONFIG_ZONAS if not zonas_pedidas or z["zona"] in zonas_pedidas]
        ESTADO["total"] = (0 if solo_transformar else len(cfgs)) + 2

        if not solo_transformar:
            session = extract.requests.Session()
            conn = extract.init_db()
            registros = []
            for cfg in cfgs:
                _log(f"=== {cfg['zona']} ({cfg['ciudad']}) · {cfg['portal']} ===")
                if cfg["portal"] == "metrocuadrado":
                    # tipo de inmueble fijo (apartamento + casa) dentro del script
                    r = extract.recolectar_metrocuadrado(cfg, session)
                else:
                    r = extract.recolectar_encuentra24(cfg, session)
                _log(f"{cfg['zona']}: {len(r)} anuncios extraídos")
                registros.extend(r)
                ESTADO["paso"] += 1

            registros = extract.marcar_bajo_media_por_zona(registros)
            for r in registros:
                extract.guardar_registro(conn, r["url_inmueble"], r)
            conn.commit()
            conn.close()
            _log(f"Guardados {len(registros)} registros en raw_listings")
        ESTADO["paso"] += 1

        _log("Limpieza y validación (transform)…")
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            transform.main()
        for linea in buf.getvalue().splitlines():
            if linea.strip():
                _log(linea.rstrip())
        ESTADO["paso"] += 1
        _log("Corrida terminada.", "ok")
    except Exception as e:  # noqa: BLE001
        ESTADO["error"] = f"{type(e).__name__}: {e}"
        _log(f"ERROR: {ESTADO['error']}", "error")
    finally:
        logging.getLogger().removeHandler(handler)
        ESTADO["corriendo"] = False
        ESTADO["fin"] = datetime.now().isoformat(timespec="seconds")


@router.post("/extraer")
def extraer(p: PeticionExtraer):
    with _LOCK:
        if ESTADO["corriendo"]:
            raise HTTPException(409, "Ya hay una corrida en curso.")
        ESTADO.update(
            corriendo=True, paso=0, total=0, log=[], error=None,
            inicio=datetime.now().isoformat(timespec="seconds"), fin=None,
            zonas=p.zonas or [z["zona"] for z in extract.CONFIG_ZONAS],
        )
    if p.solo_transformar:
        _log("Solo limpieza: no se contacta ningún portal.")
    else:
        _log("Verificando robots.txt con sesión y user-agent propios…")
    threading.Thread(target=_correr, args=(p.zonas, p.solo_transformar), daemon=True).start()
    return {"ok": True, "zonas": ESTADO["zonas"]}


@router.get("/extraer/estado")
def estado(desde: int = 0):
    return {
        "corriendo": ESTADO["corriendo"],
        "paso": ESTADO["paso"],
        "total": ESTADO["total"],
        "error": ESTADO["error"],
        "inicio": ESTADO["inicio"],
        "fin": ESTADO["fin"],
        "log": ESTADO["log"][desde:],
        "n_log": len(ESTADO["log"]),
    }


# ---------------------------------------------------------------------------
# 5. DECISIÓN HUMANA (etapa 1 del embudo, la única ya construida)
# ---------------------------------------------------------------------------


class PeticionSeguimiento(BaseModel):
    links: list[str]
    decision: str            # 'pasa' | 'no_pasa'
    motivo: str | None = None
    responsable: str | None = None


def _links_que_cumplen_criterio(links: list[str]) -> set[str]:
    """Vuelve a preguntarle a la base, no a la pantalla, cuáles de estos
    links cumplen hoy los dos filtros del arquitecto. No basta con que el
    HTML no ofrezca el botón: si alguien manda el link a mano (o la
    pantalla quedó con datos viejos en caché), el servidor es quien manda."""
    if not links or not db.tabla_existe("clean_listings"):
        return set()
    con = db.conectar()
    try:
        marcadores = ",".join("?" * len(links))
        sql = (
            f"SELECT link FROM clean_listings WHERE link IN ({marcadores}) "
            f"AND {' AND '.join(CRITERIOS_ARQUITECTO)}"
        )
        return {r["link"] for r in con.execute(sql, links).fetchall()}
    finally:
        con.close()


@router.post("/seguimiento")
def guardar_seguimiento(p: PeticionSeguimiento):
    """Escribe en seguimiento_propiedades usando el módulo real, que ya
    valida que un 'no_pasa' venga con motivo. Esta tabla es persistente:
    nunca se reconstruye con las corridas del pipeline."""
    if p.decision not in ("pasa", "no_pasa"):
        raise HTTPException(400, "decision debe ser 'pasa' o 'no_pasa'")
    if p.decision == "no_pasa" and not (p.motivo or "").strip():
        raise HTTPException(400, "Un descarte necesita motivo.")

    cumplen = _links_que_cumplen_criterio(p.links)
    guardados, errores = 0, []
    for link in p.links:
        if link not in cumplen:
            errores.append(
                f"{link}: no cumple los criterios del arquitecto (validación "
                "geográfica y mediana de zona) — no se guardó."
            )
            continue
        try:
            seguimiento.actualizar_seguimiento(
                url_inmueble=link,
                filtro_arquitectonico=p.decision,
                motivo_no_pasa=p.motivo if p.decision == "no_pasa" else None,
                responsable=p.responsable,
            )
            guardados += 1
        except Exception as e:  # noqa: BLE001
            errores.append(f"{link}: {e}")
    return {"guardados": guardados, "errores": errores}


# ---------------------------------------------------------------------------
# 6. DATA & SCORE — estadísticas de zona (macro) y de predio (micro)
# ---------------------------------------------------------------------------
# Todo lo que se puede calcular con lo que YA hay en clean_listings se
# calcula de verdad aquí (inventario, mediana/dispersión de precio,
# composición por tipo, antigüedad del anuncio, percentiles, similitud —
# esto último ya lo calcula analisis_similitud.py, aquí solo se expone).
#
# Lo que el pipeline todavía no captura (costo real de remodelación, canon
# de arriendo, score de zona vivo del agente, antigüedad del edificio,
# documentación legal) se marca explícitamente con "sintetico": true y una
# "nota" explicando el supuesto usado — nunca se presenta como dato real.
# Ver el documento "Análisis Add-Value" para la definición completa de cada
# indicador y qué falta construir para volverlo real.

# El único score de ZONA real y documentado que tenemos es el ejemplo de La
# Cabrera en la nota técnica Serava Scoring v9. Para las otras 9 zonas no hay
# un resultado del agente guardado en ningún lado todavía. A pedido de David:
# el prototipo nunca debe mostrar "sin dato" — donde no hay corrida real del
# agente, se calcula un score SINTÉTICO a partir de señales de mercado que sí
# son reales (dispersión de precio y antigüedad del anuncio de la zona),
# dejando claro en `fuente` que es un estimado y no la corrida oficial. La
# Cabrera conserva su valor real documentado.
SCORE_ZONA_REFERENCIA = {
    "La Cabrera": {
        "score": 74.0,
        "fase": "Fase 2 — Preparar entrada",
        "fuente": "Nota técnica Serava Scoring v9, ejemplo documentado (no es una corrida en vivo del agente)",
        "sintetico": False,
    },
}


def _fase_zona(score: float) -> str:
    """Mismos umbrales de decisión de la nota técnica Serava Scoring v9."""
    if score >= 82:
        return "Fase 1 — Operar ahora"
    if score >= 72:
        return "Fase 2 — Preparar entrada"
    if score >= 62:
        return "Fase 3 — Monitorear"
    if score >= 52:
        return "Watchlist — Potencial bajo"
    return "Descartado — Fuera del modelo"


def _score_zona(zona: str, p25, p75, antiguedad_prom):
    """Score de zona: real si está documentado (SCORE_ZONA_REFERENCIA),
    si no, un estimado sintético pero acotado a un rango plausible para una
    zona que el equipo ya tiene activa (40-85) — para que nunca aparezca
    "sin dato" ni un número que contradiga que la zona ya está en operación.
    La dispersión de precio (p75/p25) es un proxy de cuánto stock diferenciado
    hay en la zona; la antigüedad del anuncio, de qué tan rápido rota. Ambos
    son señales reales, pero la fórmula en sí es un supuesto de trabajo."""
    ref = SCORE_ZONA_REFERENCIA.get(zona)
    if ref:
        return dict(ref)
    ratio = (p75 / p25) if (p25 and p75) else 1.5
    dias = antiguedad_prom if antiguedad_prom is not None else 5
    score = 65 + (ratio - 1.5) * 20 + (5 - dias) * 1.5
    score = round(max(40.0, min(85.0, score)), 1)
    return {
        "score": score,
        "fase": _fase_zona(score),
        "fuente": ("Estimado a partir de la dispersión de precios y la antigüedad del anuncio de la "
                   "zona (proxy de mercado) — no es una corrida en vivo del agente."),
        "sintetico": True,
    }


def _percentil_valor(pct: float, lista_ordenada: list[float]):
    """Valor de la lista (ya ordenada) que corresponde al percentil pct."""
    if not lista_ordenada:
        return None
    idx = min(len(lista_ordenada) - 1, max(0, round(pct / 100 * (len(lista_ordenada) - 1))))
    return lista_ordenada[idx]


def _percentil_rango(valor, lista_ordenada: list[float]):
    """En qué percentil cae `valor` dentro de la lista ordenada (0-100)."""
    if valor is None or not lista_ordenada:
        return None
    pos = bisect.bisect_left(lista_ordenada, valor)
    return round(pos / len(lista_ordenada) * 100, 1)


def _zona_stats(con, zona: str):
    """Estadísticas completas de UNA zona (mediana, dispersión, antigüedad,
    score) leídas siempre de la zona completa, no de un subconjunto filtrado
    — para que el score de zona sea el mismo se pida desde donde se pida."""
    filas = con.execute(
        "SELECT precio_m2, area_m2, mediana_precio_m2_zona, moneda, tipo_inmueble, fecha_extraccion "
        "FROM clean_listings WHERE zona=? AND precio_m2 IS NOT NULL",
        (zona,),
    ).fetchall()
    if not filas:
        return None
    precios = sorted(f["precio_m2"] for f in filas)
    areas = sorted(f["area_m2"] for f in filas if f["area_m2"])
    tipos: dict[str, int] = {}
    antiguedades = []
    ahora = datetime.now()
    for f in filas:
        t = f["tipo_inmueble"] or "Sin tipo"
        tipos[t] = tipos.get(t, 0) + 1
        try:
            antiguedades.append((ahora - datetime.fromisoformat(f["fecha_extraccion"])).days)
        except (TypeError, ValueError):
            pass
    n = len(filas)
    p25, p75 = _percentil_valor(25, precios), _percentil_valor(75, precios)
    antiguedad_prom = round(sum(antiguedades) / len(antiguedades)) if antiguedades else None
    return {
        "zona": zona,
        "moneda": filas[0]["moneda"],
        "inventario_activo": n,
        "precio_mediana_m2": filas[0]["mediana_precio_m2_zona"],
        "precio_p25_m2": p25,
        "precio_p75_m2": p75,
        "composicion_tipo": {k: round(v * 100 / n, 1) for k, v in tipos.items()},
        "antiguedad_anuncio_dias_promedio": antiguedad_prom,
        "score_zona": _score_zona(zona, p25, p75, antiguedad_prom),
        "_precios": precios,
        "_areas": areas,
    }


# --- Add-value estimado: SUPUESTOS explícitos, no datos medidos ------------
# capex ≈ precio de compra + 28% de remodelación (supuesto de trabajo); canon
# ≈ 5.4% anual del precio de venta (supuesto de trabajo); precio nuevo de
# zona ≈ mediana de usados + 55% (supuesto de trabajo). Reemplazar por datos
# reales cuando el formulario capture costo de remodelación y canon (sección
# 6 del documento "Análisis Add-Value").
def _add_value_estimado(f: dict):
    capex_m2_estimado = round(f["precio_m2"] * 1.28) if f.get("precio_m2") else None
    canon_estimado_mensual = round(f["precio_venta"] * 0.0045) if f.get("precio_venta") else None
    precio_nuevo_m2_estimado = spread_pct = carry_pct = venta_estimada_total = None
    if capex_m2_estimado and f.get("mediana_precio_m2_zona"):
        precio_nuevo_m2_estimado = round(f["mediana_precio_m2_zona"] * 1.55)
        spread_pct = round((precio_nuevo_m2_estimado - capex_m2_estimado) / capex_m2_estimado * 100, 1)
        if f.get("area_m2"):
            venta_estimada_total = round(precio_nuevo_m2_estimado * f["area_m2"])
    if canon_estimado_mensual and f.get("area_m2") and capex_m2_estimado:
        capex_total_estimado = capex_m2_estimado * f["area_m2"]
        carry_pct = round(canon_estimado_mensual * 12 / capex_total_estimado * 100, 1)
    return {
        "sintetico": True,
        "nota": ("No existe todavía el desglose real de compra vs. remodelación ni el canon de "
                 "arriendo. Estimado con un supuesto de trabajo (remodelación ≈ +28% del precio de "
                 "compra, canon ≈ 5.4% anual) — ver documento «Análisis Add-Value»."),
        "capex_m2_estimado": capex_m2_estimado,
        "canon_estimado_mensual": canon_estimado_mensual,
        "precio_nuevo_m2_estimado": precio_nuevo_m2_estimado,
        "venta_estimada_total": venta_estimada_total,
        "spread_pct": spread_pct,
        "carry_pct": carry_pct,
    }


# --- Score Zequara (predio) ------------------------------------------------
# Índice propio para priorizar CUÁL predio revisar primero — no es el Score
# de Zonas oficial (ese corre por zona completa, lo calcula el agente). Nace
# de la tarea de David: con más de 5.000 predios habilitados, el arquitecto
# no puede revisarlos todos, así que este número ordena de mejor a peor
# candidato usando lo que ya sabemos de cada predio frente a su zona.
# Los tramos de nota (spread/carry) reutilizan las mismas rúbricas 1-10 de
# la nota técnica Serava Scoring v9, solo que expresadas en escala 0-100.
_SPREAD_TRAMOS = [(150, 100), (100, 85), (60, 65), (30, 45), (float("-inf"), 20)]
_CARRY_TRAMOS = [(9, 100), (7, 80), (5, 65), (3, 45), (float("-inf"), 20)]


def _nota_tramo(valor, tramos):
    if valor is None:
        return 50.0
    for umbral, nota in tramos:
        if valor >= umbral:
            return float(nota)
    return float(tramos[-1][1])


def _prioridad_predio(score: float) -> str:
    if score >= 78:
        return "Revisar primero"
    if score >= 62:
        return "Revisar pronto"
    if score >= 45:
        return "Revisar si hay tiempo"
    return "Baja prioridad"


def _score_predio_detalle(f: dict, precios_zona, areas_zona, zona_info):
    """Devuelve (score_final, detalle) — detalle trae cada componente para
    poder mostrar el desglose en la ficha del predio."""
    av = _add_value_estimado(f)
    pct_precio = _percentil_rango(f.get("precio_m2"), precios_zona)
    pct_area = _percentil_rango(f.get("area_m2"), areas_zona)

    precio_score = (100 - pct_precio) if pct_precio is not None else 50.0
    spread_score = _nota_tramo(av["spread_pct"], _SPREAD_TRAMOS)
    carry_score = _nota_tramo(av["carry_pct"], _CARRY_TRAMOS)
    unicidad_score = pct_area if pct_area is not None else 50.0

    dpr, sim = f.get("dentro_poligono_real"), f.get("similar_a_zona")
    if dpr == 1:
        confianza_score = 100.0
    elif sim == 1:
        confianza_score = 75.0
    elif sim == 0:
        confianza_score = 35.0
    else:
        confianza_score = 60.0  # sin evaluar ≠ malo, regla del proyecto

    atipico = (f.get("precio_m2_clasificacion") or "").startswith("atipico")
    atipico_score = 15.0 if atipico else 100.0
    zona_score = zona_info["score_zona"]["score"] if zona_info else 50.0
    zona_sintetico = zona_info["score_zona"]["sintetico"] if zona_info else True

    componentes = [
        {"nombre": "Precio vs. mediana de zona", "peso": 25, "valor": round(precio_score, 1), "sintetico": False},
        {"nombre": "Spread de arbitraje estimado", "peso": 25, "valor": round(spread_score, 1), "sintetico": True},
        {"nombre": "Carry de arriendo estimado", "peso": 10, "valor": round(carry_score, 1), "sintetico": True},
        {"nombre": "Unicidad · tamaño relativo", "peso": 15, "valor": round(unicidad_score, 1), "sintetico": False},
        {"nombre": "Confianza del dato (similitud)", "peso": 10, "valor": round(confianza_score, 1), "sintetico": False},
        {"nombre": "Sin señales de dato atípico", "peso": 5, "valor": round(atipico_score, 1), "sintetico": False},
        {"nombre": "Contexto de zona", "peso": 10, "valor": round(zona_score, 1), "sintetico": zona_sintetico},
    ]
    score = sum(c["valor"] * c["peso"] / 100 for c in componentes)
    score = round(score, 1)
    return score, {
        "valor": score,
        "prioridad": _prioridad_predio(score),
        "componentes": componentes,
        "nota": "Índice propio de Zequara para priorizar revisión — no reemplaza el criterio del arquitecto ni el Score de Zonas oficial.",
    }, av, pct_precio, pct_area


@router.get("/zonas_resumen")
def zonas_resumen(ciudad: str = Query(..., description="Ej.: Bogotá")):
    """Estadísticas de zona (nivel macro) para todas las zonas de una ciudad."""
    if not db.tabla_existe("clean_listings"):
        raise HTTPException(404, "Todavía no existe clean_listings. Corre una extracción primero.")

    zonas_ciudad = [z["zona"] for z in extract.CONFIG_ZONAS if z["ciudad"] == ciudad]
    if not zonas_ciudad:
        raise HTTPException(404, f"No hay zonas configuradas para la ciudad '{ciudad}'.")

    con = db.conectar()
    fecha_ultima_corrida = (con.execute("SELECT MAX(fecha_extraccion) AS f FROM clean_listings").fetchone()["f"] or "")[:10]

    zonas = []
    for zona in zonas_ciudad:
        stats = _zona_stats(con, zona)
        if not stats:
            zonas.append({"zona": zona, "sin_datos": True})
            continue
        publicaciones_ultima_corrida = con.execute(
            "SELECT COUNT(*) AS n FROM clean_listings WHERE zona=? AND substr(fecha_extraccion,1,10)=?",
            (zona, fecha_ultima_corrida),
        ).fetchone()["n"]
        stats.pop("_precios"); stats.pop("_areas")
        stats["publicaciones_ultima_corrida"] = publicaciones_ultima_corrida
        zonas.append(stats)

    con.close()
    return {"ciudad": ciudad, "fecha_ultima_corrida": fecha_ultima_corrida, "zonas": zonas}


@router.get("/predio_analisis")
def predio_analisis(link: str = Query(..., description="El link del predio en clean_listings")):
    """Estadísticas de predio (nivel micro): posición del predio dentro de
    su zona, el Score Zequara del predio (índice propio de priorización), y
    una estimación add-value marcada explícitamente como sintética porque el
    pipeline todavía no captura costo de remodelación ni canon de arriendo
    reales (ver documento «Análisis Add-Value»)."""
    if not db.tabla_existe("clean_listings"):
        raise HTTPException(404, "Todavía no existe clean_listings.")

    con = db.conectar()
    fila = con.execute("SELECT * FROM clean_listings WHERE link=?", (link,)).fetchone()
    if not fila:
        con.close()
        raise HTTPException(404, "No encuentro ese predio en clean_listings.")
    f = dict(fila)
    zona_info = _zona_stats(con, f["zona"])
    con.close()
    precios = zona_info["_precios"] if zona_info else []
    areas = zona_info["_areas"] if zona_info else []

    pct_bajo_mediana = None
    if f.get("mediana_precio_m2_zona"):
        pct_bajo_mediana = round(
            (f["precio_m2"] - f["mediana_precio_m2_zona"]) / f["mediana_precio_m2_zona"] * 100, 1
        )

    score, score_detalle, av, pct_precio, pct_area = _score_predio_detalle(f, precios, areas, zona_info)

    return {
        "link": link, "titulo": f.get("titulo"), "zona": f.get("zona"), "ciudad": f.get("ciudad"),
        "pais": f.get("pais"), "moneda": f.get("moneda"), "portal": f.get("portal"),
        "precio_venta": f.get("precio_venta"), "area_m2": f.get("area_m2"), "precio_m2": f.get("precio_m2"),
        "mediana_precio_m2_zona": f.get("mediana_precio_m2_zona"), "pct_bajo_mediana": pct_bajo_mediana,
        "precio_m2_clasificacion": f.get("precio_m2_clasificacion"),
        "percentil_precio_zona": pct_precio,
        "percentil_area_zona": pct_area,
        "habitaciones": f.get("habitaciones"), "banos": f.get("banos"), "parqueaderos": f.get("parqueaderos"),
        "estrato": f.get("estrato"), "administracion": f.get("administracion"),
        "similitud": {
            "dentro_poligono_real": f.get("dentro_poligono_real"),
            "similar_a_zona": f.get("similar_a_zona"),
            "distancia_similitud": f.get("distancia_similitud"),
            "metodo_similitud": f.get("metodo_similitud"),
        },
        "add_value_estimado": av,
        "score_zequara": score_detalle,
    }
