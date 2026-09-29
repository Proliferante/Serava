"""
Variables macro de la ficha: el CDT con el que se compara la TIR y el IPC con
el que se proyecta todo valor futuro.

POR QUÉ EN VIVO (Paola, reunión del 28-sep-2026)
  · El CDT «tiene que venir actualizado diariamente… con alguna fuente oficial
    de tasas de CDT». Antes era un 10,5 % escrito a mano; el oficial del 21 al
    25 de septiembre era 12,03 %.
  · La valorización a 5 años tiene que decir su supuesto: «no se puede llevar
    ningún valor futuro sin los supuestos de crecimiento normales de la
    economía, como el IPC».

FUENTES
  · CDT: Superintendencia Financiera, formato 441, en datos abiertos
    (datos.gov.co, conjunto axk9-g2nh). Promedio ponderado por monto de los
    bancos, plazo 360 días, últimos 5 cortes (el último a veces llega
    incompleto: el 25-sep reportaron 19 bancos contra 26 los días anteriores).
  · IPC: Banco de la República (API pública SUAMECA), serie 100001
    «Inflación total anual» (la calcula el DANE) y la meta de inflación.

POR QUÉ CON CACHÉ Y RESPALDO
Esto corre dentro de una petición de la consola: Paola pulsa «Calcular» y
espera. Si la API de la Superfinanciera tarda o se cae, la ficha no puede
quedarse sin calcular. Por eso, en orden:
  1. lo que ya se consultó en este proceso y sigue fresco (CDT 12 h, IPC 7 días);
  2. lo guardado en disco por otra consulta (sobrevive a un reinicio del proceso);
  3. la API, con un tiempo máximo corto;
  4. el respaldo de `macro_respaldo.json` (los valores del 29-sep-2026).
La respuesta dice SIEMPRE de dónde salió cada tasa y de qué fecha es: la ficha
nunca muestra un dato viejo como si fuera de hoy.

NOTA TLS (BanRep): su servidor no envía el certificado intermedio de la cadena,
así que una verificación estricta falla («unable to get local issuer
certificate»). No se desactiva la verificación: se descarga el intermedio
oficial de DigiCert (la URL que declara el propio certificado en «CA Issuers»)
y se agrega. Sigue siendo una conexión verificada.

Con `FICHAS_MACRO_EN_VIVO=0` en el entorno no se sale a internet (pruebas).
"""
from __future__ import annotations

import json
import os
import ssl
import tempfile
import time
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RESPALDO = AQUI / "macro_respaldo.json"
CACHE_DISCO = Path(tempfile.gettempdir()) / "zequara_fichas_macro.json"

API_CDT = "https://www.datos.gov.co/resource/axk9-g2nh.json"
API_BANREP = "https://suameca.banrep.gov.co/estadisticas-economicas-back/rest/estadisticaEconomicaRestService/consultaMenuXId"
REFERER_BANREP = "https://suameca.banrep.gov.co/estadisticas-economicas/"
INTERMEDIO_BANREP = "http://cacerts.digicert.com/GeoTrustEVRSACAG2.crt"

FRESCO_S = {"cdt": 12 * 3600, "ipc": 7 * 24 * 3600}
TIEMPO_MAX_S = 12
CORTES_CDT = 5
EPOCA = datetime(1970, 1, 1, tzinfo=timezone.utc)
MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
         "septiembre", "octubre", "noviembre", "diciembre"]

_memoria: dict[str, tuple[float, dict]] = {}


def en_vivo() -> bool:
    return os.environ.get("FICHAS_MACRO_EN_VIVO", "1") != "0"


# ── Consultas ────────────────────────────────────────────────────────────

def calcular_cdt(filas: list[dict], cortes: int = CORTES_CDT) -> dict:
    """Promedio ponderado por monto de los últimos `cortes` días. Sin red: se prueba solo."""
    validas = [f for f in filas if float(f.get("monto") or 0) > 0 and f.get("tasa") not in (None, "")]
    fechas = sorted({f["fechacorte"][:10] for f in validas})[-cortes:]
    if not fechas:
        raise ValueError("La API no devolvió tasas de CDT a 360 días.")
    usar = [f for f in validas if f["fechacorte"][:10] in fechas]
    monto = sum(float(f["monto"]) for f in usar)
    tasa = sum(float(f["tasa"]) * float(f["monto"]) for f in usar) / monto
    return {"valor": round(tasa / 100, 4), "fecha_desde": fechas[0], "fecha_hasta": fechas[-1],
            "bancos": len({f["nombreentidad"] for f in usar}),
            "fuente": "Superintendencia Financiera, formato 441 (datos.gov.co)"}


def _consultar_cdt() -> dict:
    desde = (date.today() - timedelta(days=21)).isoformat()
    q = urllib.parse.urlencode({
        "$select": "fechacorte,nombreentidad,tasa,monto",
        "$where": f"descripcion='A 360 DIAS' AND tipoentidad='1' AND fechacorte>='{desde}'",
        "$limit": "5000",
    })
    with urllib.request.urlopen(f"{API_CDT}?{q}", timeout=TIEMPO_MAX_S) as r:
        return calcular_cdt(json.loads(r.read().decode("utf-8")))


def _serie_banrep(id_menu: int, ctx: ssl.SSLContext) -> dict[str, list[tuple[str, float]]]:
    req = urllib.request.Request(f"{API_BANREP}?idMenu={id_menu}", headers={"Referer": REFERER_BANREP})
    with urllib.request.urlopen(req, timeout=TIEMPO_MAX_S, context=ctx) as r:
        d = json.loads(r.read().decode("utf-8"))
    # Milisegundos a medianoche de Bogotá. Se suma a la época en vez de usar
    # fromtimestamp: en Windows este falla con fechas anteriores a 1970.
    return {s["nombre"]: [((EPOCA + timedelta(milliseconds=t, hours=5)).date().isoformat(), float(v))
                          for t, v in s["data"] if v is not None] for s in d["SERIES"]}


def _consultar_ipc() -> dict:
    ctx = ssl.create_default_context()
    der = urllib.request.urlopen(INTERMEDIO_BANREP, timeout=TIEMPO_MAX_S).read()
    ctx.load_verify_locations(cadata=ssl.DER_cert_to_PEM_cert(der))
    s = _serie_banrep(100001, ctx)
    total = next(v for k, v in s.items() if "total anual" in k.lower())
    meta = next(v for k, v in s.items() if "meta" in k.lower())
    return {"valor": round(total[-1][1] / 100, 4), "fecha": total[-1][0], "meta": round(meta[-1][1] / 100, 4),
            "fuente": "DANE, vía Banco de la República (SUAMECA)"}


# ── Caché ────────────────────────────────────────────────────────────────

def _leer_disco() -> dict:
    try:
        return json.loads(CACHE_DISCO.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _guardar_disco(clave: str, dato: dict) -> None:
    try:
        todo = _leer_disco()
        todo[clave] = dato
        CACHE_DISCO.write_text(json.dumps(todo, ensure_ascii=False), encoding="utf-8")
    except OSError:
        pass  # sin disco escribible (algunos contenedores): queda la memoria


def _obtener(clave: str, consultar) -> dict:
    ahora = time.time()
    if clave in _memoria and ahora - _memoria[clave][0] < FRESCO_S[clave]:
        return _memoria[clave][1]
    disco = _leer_disco().get(clave)
    if disco and ahora - disco.get("_t", 0) < FRESCO_S[clave]:
        _memoria[clave] = (disco["_t"], disco)
        return disco
    if en_vivo():
        try:
            dato = consultar() | {"_t": ahora, "origen": "en vivo",
                                   "consultado": datetime.now().isoformat(timespec="seconds")}
            _memoria[clave] = (ahora, dato)
            _guardar_disco(clave, dato)
            return dato
        except Exception as e:  # red caída, API lenta, formato cambiado…
            error = str(e)
    else:
        error = "consulta en vivo desactivada (FICHAS_MACRO_EN_VIVO=0)"
    if disco:  # vencido, pero es mejor que el respaldo fijo
        return disco | {"origen": "guardado (la consulta en vivo falló)", "aviso": error}
    resp = json.loads(RESPALDO.read_text(encoding="utf-8"))[clave]
    return resp | {"origen": "respaldo fijo", "aviso": error}


def cdt() -> dict:
    return _obtener("cdt", _consultar_cdt)


def ipc() -> dict:
    return _obtener("ipc", _consultar_ipc)


# ── Textos ───────────────────────────────────────────────────────────────

def texto_rango(desde: str, hasta: str) -> str:
    """«21 al 25 de septiembre de 2026»."""
    a, b = date.fromisoformat(desde), date.fromisoformat(hasta)
    if a == b:
        return f"{b.day} de {MESES[b.month - 1]} de {b.year}"
    if (a.year, a.month) == (b.year, b.month):
        return f"{a.day} al {b.day} de {MESES[b.month - 1]} de {b.year}"
    return f"{a.day} de {MESES[a.month - 1]} al {b.day} de {MESES[b.month - 1]} de {b.year}"


def texto_mes(fecha_iso: str) -> str:
    a, m, _ = fecha_iso.split("-")
    return f"{MESES[int(m) - 1]} de {a}"
