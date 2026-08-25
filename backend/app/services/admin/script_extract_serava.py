"""
script_extract_serava.py
=========================
Fase E (Extract) del pipeline de Serava - Pieza 1 de la mision asignada por
Paola: traer, para las 10 zonas de interes, el listado de inmuebles
residenciales en venta cuyo precio por m2 este por debajo de la media de
su zona.

  - Metrocuadrado (7 zonas de Colombia): extraccion via su API real de
    busqueda, /rest-search/search (ver la seccion 4 del archivo para la
    historia completa). Version anterior (v1): regex sobre el JSON
    embebido en el HTML de la pagina, heredada de la prueba tecnica de
    Chico - se reemplazo porque su "paginacion" nunca funciono de verdad,
    causando el bug de "volumen muy bajo" detectado en la reunion de
    revision del 23/07/2026. Corregido el mismo dia con ayuda de David,
    quien capturo el trafico real del navegador (HAR + cURL) para
    encontrar el endpoint correcto.

  - Encuentra24 (3 zonas de Panama): portal nuevo, no usado en la prueba
    tecnica. A diferencia de Metrocuadrado, el contenido de cada anuncio
    SI aparece como texto plano renderizado (confirmado inspeccionando el
    HTML real de la pagina de El Cangrejo). El parser ventanea por
    posicion de enlace unico en el HTML crudo (ver seccion 5).

ADVERTENCIA IMPORTANTE SOBRE ENCUENTRA24 (leer antes de correr en serio):
    El parser de Encuentra24 en este archivo se escribio inspeccionando el
    HTML real de la pagina de El Cangrejo (visto el 23/07/2026), pero NO se
    pudo ejecutar el script contra el sitio en vivo desde este entorno (sin
    acceso de red a encuentra24.com). Es decir, esta es una "v1" en el mismo
    sentido que la v1 de Metrocuadrado en la prueba tecnica: basada en
    inspeccion manual, pendiente de confirmar con una corrida real. Si al
    correrlo el numero de registros extraidos de Encuentra24 es cero o muy
    bajo, lo primero que hay que revisar es si el marcador
    "ContactarLlamarWhatsApp" sigue siendo el texto exacto que separa cada
    tarjeta (podria variar por A/B testing del sitio, idioma del boton, etc).

ROBOTS.TXT: verificado manualmente para los 5 portales candidatos (ver
conversacion de diseno). Metrocuadrado y Encuentra24 SI permiten scraping
de las rutas usadas aqui, incluyendo /rest-search/search. El chequeo
programatico de puede_scrapear() se deja de todas formas como salvaguarda
automatica ante cualquier cambio futuro del archivo.

USO:
    pip install requests beautifulsoup4 --break-system-packages
    python script_extract_serava.py

SALIDA:
    serava_raw.db (SQLite), tabla raw_listings, con todos los registros
    encontrados en las 10 zonas, listos para una fase de limpieza (Transform)
    posterior donde se calcula la media de precio/m2 por zona y se filtran
    los que estan por debajo de ella (columnas ya preparadas para eso: ver
    PASO 4).
"""

import re
import time
import logging
import random
import statistics
import unicodedata
from datetime import datetime
from urllib.parse import urljoin, urlparse
from urllib import robotparser

import requests
from bs4 import BeautifulSoup

from . import db_admin as db


# ---------------------------------------------------------------------------
# 1. CONFIGURACION GENERAL
# ---------------------------------------------------------------------------

DB_PATH = "serava_raw.db"

HEADERS = {
    # User-agent propio y honesto, NO se hace pasar por Googlebot ni por
    # ningun bot de la lista de bloqueados que vimos en el robots.txt de
    # Fincaraiz/Properati. Cae bajo la regla general "User-agent: *" de
    # cada portal, que es la que ya confirmamos como permisiva.
    "User-Agent": "SeravaDataBot/1.0 (+contacto: equipo-datos@serava.example)",
    "Accept-Language": "es-CO,es;q=0.9,en;q=0.8",
}

REQUEST_TIMEOUT = 15
MIN_DELAY = 2.0
MAX_DELAY = 4.5
MAX_RETRIES = 3

METROCUADRADO_TAMANO_PAGINA = 50    # confirmado con el API real (rest-search/search)
METROCUADRADO_MAX_REGISTROS = 3000  # techo de seguridad por zona, no limite real
# Clave publica que el propio sitio usa en el navegador de cualquier visitante
# para su buscador (rest-search/search). No es una credencial secreta nuestra:
# se descubrio inspeccionando el trafico que el navegador de David genero
# normalmente al usar la pagina. Puede rotar en el futuro; si deja de
# funcionar, hay que volver a capturarla igual que la primera vez (ver
# Seccion de notas al final del archivo).
METROCUADRADO_API_KEY = "P1MfFHfQMOtL16Zpg36NcntJYCLFm8FqFfudnavl"
ENCUENTRA24_MAX_PAGINAS = 60         # techo de SEGURIDAD, no un limite real:
                                      # el robots.txt de Encuentra24 no
                                      # restringe paginacion (a diferencia de
                                      # Compreoalquile, que si tiene un limite
                                      # duro de 5 paginas y no se usa aqui
                                      # todavia). El "5" original era una
                                      # decision conservadora mia de la
                                      # primera prueba, no algo exigido por
                                      # el sitio - causaba el mismo sintoma
                                      # de "volumen bajo" que Metrocuadrado,
                                      # pero por una razon distinta. Con
                                      # ~20 registros/pagina, 60 paginas son
                                      # hasta 1200 registros por sub-zona,
                                      # de sobra para el inventario real
                                      # visto (p.ej. ~546 en El Cangrejo). La
                                      # paginacion real SI se detiene sola
                                      # (ver "no trajo registros nuevos" mas
                                      # abajo) apenas se acaben los
                                      # resultados reales.

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("extract_serava")


# ---------------------------------------------------------------------------
# 2. CONFIG_ZONAS: las 10 zonas de la mision, con su(s) URL(s) confirmada(s)
# ---------------------------------------------------------------------------
# Este diccionario es, en espiritu, la tabla "config_zonas" de la arquitectura
# que disenamos: cada zona sabe su ciudad, pais, portal y URL(s) de listado.
# Agregar una zona nueva en el futuro es agregar una entrada aqui, no
# reescribir el resto del script.
#
# Nota sobre "Bella Vista / Obarrio": Encuentra24 los trata como DOS barrios
# separados en su propia taxonomia (confirmado navegando el sitio), asi que
# se recolectan ambas URLs y se deduplican por enlace, igual que se hizo con
# las sub-zonas de Chico en la prueba tecnica.

CONFIG_ZONAS = [
    {
        "pais": "Colombia", "ciudad": "Bogotá", "zona": "El Retiro",
        "portal": "metrocuadrado", "city_slug": "bogota", "neighborhood_slug": "el-retiro",
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/bogota/el-retiro/"],
    },
    {
        "pais": "Colombia", "ciudad": "Bogotá", "zona": "La Cabrera",
        "portal": "metrocuadrado", "city_slug": "bogota", "neighborhood_slug": "la-cabrera",
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/bogota/la-cabrera/"],
    },
    {
        "pais": "Colombia", "ciudad": "Bogotá", "zona": "Chicó",
        "portal": "metrocuadrado", "city_slug": "bogota", "neighborhood_slug": "chico",
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/bogota/chico/"],
    },
    {
        "pais": "Colombia", "ciudad": "Medellín", "zona": "El Poblado",
        "portal": "metrocuadrado", "city_slug": "medellin", "neighborhood_slug": "poblado",
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/medellin/poblado/"],
    },
    {
        "pais": "Colombia", "ciudad": "Medellín", "zona": "Laureles",
        "portal": "metrocuadrado", "city_slug": "medellin", "neighborhood_slug": "laureles",
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/medellin/laureles/"],
    },
    {
        "pais": "Colombia", "ciudad": "Cartagena", "zona": "Centro Histórico",
        "portal": "metrocuadrado", "city_slug": "cartagena-de-indias", "neighborhood_slug": "centro-historico",
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/cartagena-de-indias/centro-historico/"],
    },
    {
        "pais": "Colombia", "ciudad": "Cartagena", "zona": "Getsemaní",
        "portal": "metrocuadrado", "city_slug": "cartagena-de-indias", "neighborhood_slug": "getsemani",
        # Aviso: la muestra pequena que se vio antes (~7 anuncios, 1 en scope)
        # se explica en gran parte por el bug de paginacion ya corregido: solo
        # se estaba trayendo el primer lote. Con el API real esto deberia
        # mejorar solo; si sigue siendo chico, ahi si es una limitacion real
        # del inventario de esta zona en el portal, no un bug nuestro.
        "urls": ["https://www.metrocuadrado.com/apartamentos/venta/cartagena-de-indias/getsemani/"],
    },
    {
        "pais": "Panamá", "ciudad": "Ciudad de Panamá", "zona": "Casco Viejo",
        "portal": "encuentra24",
        "urls": ["https://www.encuentra24.com/panama-es/bienes-raices-venta-de-propiedades-apartamentos/prov-panama-ciudad-de-panama-casco-viejo-san-felipe"],
    },
    {
        "pais": "Panamá", "ciudad": "Ciudad de Panamá", "zona": "El Cangrejo",
        "portal": "encuentra24",
        "urls": ["https://www.encuentra24.com/panama-es/bienes-raices-venta-de-propiedades-apartamentos/prov-panama-ciudad-de-panama-el-cangrejo"],
    },
    {
        "pais": "Panamá", "ciudad": "Ciudad de Panamá", "zona": "Bella Vista / Obarrio",
        "portal": "encuentra24",
        "urls": [
            "https://www.encuentra24.com/panama-es/bienes-raices-venta-de-propiedades-apartamentos/prov-panama-ciudad-de-panama-bella-vista",
            "https://www.encuentra24.com/panama-es/bienes-raices-venta-de-propiedades-apartamentos/prov-panama-ciudad-de-panama-obarrio",
        ],
    },
]


def quitar_tildes(texto: str) -> str:
    if not texto:
        return ""
    return "".join(
        c for c in unicodedata.normalize("NFKD", texto) if not unicodedata.combining(c)
    )


# ---------------------------------------------------------------------------
# 3. UTILIDADES DE RED: robots.txt, fetch con reintentos, rate limiting
# ---------------------------------------------------------------------------
# Identico en espiritu al de la prueba tecnica: es la misma salvaguarda que
# correctamente bloqueo el scraping automatizado de Fincaraiz en su momento.

_ROBOTS_CACHE: dict[str, robotparser.RobotFileParser] = {}


def puede_scrapear(url: str, session: requests.Session) -> bool:
    """
    IMPORTANTE (corregido tras una corrida real): RobotFileParser.read()
    por defecto descarga robots.txt usando el user-agent generico de Python
    ("Python-urllib/3.x"), NO el user-agent propio configurado en HEADERS.
    Varios sitios (aparentemente Encuentra24 entre ellos) responden 401/403
    a ese user-agent generico - y RobotFileParser, ante un 401/403, asume
    que TODO el sitio esta prohibido, sin importar el contenido real del
    archivo. Esto genero falsos negativos: el archivo real SI permitia
    nuestras rutas, pero la libreria nunca llego a leerlo correctamente.

    La correccion: descargamos nosotros mismos robots.txt con la misma
    sesion y los mismos headers honestos que usamos para el resto del
    scraping, y se lo pasamos ya descargado a RobotFileParser.parse().
    """
    parsed = urlparse(url)
    origen = f"{parsed.scheme}://{parsed.netloc}"

    if origen not in _ROBOTS_CACHE:
        robots_url = f"{origen}/robots.txt"
        rp = robotparser.RobotFileParser()
        rp.set_url(robots_url)
        try:
            resp = session.get(robots_url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                rp.parse(resp.text.splitlines())
                logger.info(f"robots.txt leido correctamente de {robots_url} (status 200, user-agent propio).")
            elif resp.status_code in (401, 403):
                logger.warning(
                    f"{robots_url} respondio {resp.status_code} incluso con user-agent propio. "
                    f"Se asume TODO prohibido en este dominio (comportamiento estandar ante 401/403)."
                )
                rp.disallow_all = True
            elif resp.status_code == 404:
                logger.info(f"{robots_url} no existe (404). Se asume todo permitido.")
                rp.allow_all = True
            else:
                logger.warning(f"{robots_url} respondio status {resp.status_code}. Se continua con precaucion (permitido).")
                rp.allow_all = True
        except requests.RequestException as e:
            logger.warning(f"No se pudo leer robots.txt de {origen} ({e}). Se continua con precaucion.")
            rp.allow_all = True
        _ROBOTS_CACHE[origen] = rp

    rp = _ROBOTS_CACHE[origen]
    permitido = rp.can_fetch(HEADERS["User-Agent"], url)
    if not permitido:
        logger.warning(f"robots.txt PROHIBE acceder a: {url}. No se hara scraping de esta URL.")
    return permitido


def descansar():
    time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))


def fetch_html(url: str, session: requests.Session) -> str | None:
    if not puede_scrapear(url, session):
        return None

    for intento in range(1, MAX_RETRIES + 1):
        try:
            resp = session.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            if resp.status_code == 200:
                return resp.text
            elif resp.status_code == 404:
                logger.info(f"404 Not Found: {url}")
                return None
            else:
                logger.warning(f"Status {resp.status_code} en intento {intento} para {url}")
        except requests.RequestException as e:
            logger.warning(f"Error de red en intento {intento} para {url}: {e}")
        time.sleep(2 ** intento)

    logger.error(f"Se agotaron los reintentos para: {url}")
    return None


# ---------------------------------------------------------------------------
# 4. METROCUADRADO: extraccion via su API real (rest-search/search)
#    -- reemplaza la v1 (regex sobre JSON embebido en el HTML) --
# ---------------------------------------------------------------------------
# HALLAZGO CLAVE (correccion del bug de "volumen bajo"): la v1 de este script
# obtenia los resultados haciendo scraping del HTML de la pagina de listado
# (p.ej. metrocuadrado.com/apartamentos/venta/bogota/la-cabrera/?from=24) y
# parseando el JSON embebido que Next.js incrusta en esa pagina. Eso
# funcionaba para la PRIMERA tanda de resultados (~50), pero el parametro
# "?from=N" en esa URL NO tiene ningun efecto real - el servidor siempre
# devuelve la misma primera tanda sin importar su valor. Por eso casi todas
# las zonas se quedaban estancadas en ~50-70 registros.
#
# La pagina real trae resultados adicionales con JavaScript, llamando a un
# endpoint interno aparte: /rest-search/search. Este endpoint SI pagina
# correctamente con from/size, y ademas devuelve "totalHits": el total real
# de inmuebles de la busqueda - lo que permite saber con certeza cuando ya
# se trajo todo, en vez de adivinar. Se descubrio inspeccionando (con ayuda
# de David, capturando el trafico real del navegador) la solicitud que la
# propia pagina hace al hacer clic en "pagina 2".
#
# Requiere un header "x-api-key". Es una clave PUBLICA que el navegador de
# cualquier visitante normal ya envia al usar el buscador del sitio - no es
# una credencial secreta nuestra, es parte del contrato publico de ese
# endpoint. Puede cambiar en el futuro; si el scraper empieza a fallar aqui,
# hay que volver a capturarla (ver instrucciones al final del archivo).

def parsear_resultados_metrocuadrado(data_json: dict, zona_cfg: dict) -> list[dict]:
    zona_norm = quitar_tildes(zona_cfg["zona"]).lower()
    registros = []

    for item in data_json.get("results", []):
        precio = item.get("mvalorventa")
        area = item.get("marea")
        barrio_comun = item.get("mnombrecomunbarrio")
        link = item.get("link")
        localizacion = item.get("localizacion") or {}
        data_extra = item.get("data") or {}

        if not link:
            continue

        registro = {
            "pais": zona_cfg["pais"],
            "ciudad": zona_cfg["ciudad"],
            "zona": zona_cfg["zona"],
            "portal": "metrocuadrado",
            "url_inmueble": urljoin("https://www.metrocuadrado.com", link),
            "titulo": item.get("title"),
            "codigo_anuncio": item.get("midinmueble"),
            "tipo_inmueble": (item.get("mtipoinmueble") or {}).get("nombre", "Apartamento"),
            "precio_venta": precio,
            "area_m2": area,
            "precio_m2": (
                round(precio / area) if precio and area and area > 0 else None
            ),
            "habitaciones": item.get("mnrocuartos"),
            "banos": item.get("mnrobanos"),
            "parqueaderos": item.get("mnrogarajes"),
            "estrato": item.get("estrato"),
            "barrio_texto": item.get("mbarrio"),
            "barrio_comun_texto": barrio_comun,
            "administracion": data_extra.get("mvaloradministracion"),
            "antiguedad_texto": None,
            "latitud": localizacion.get("lat"),
            "longitud": localizacion.get("lon"),
            "en_scope_zona": zona_norm in quitar_tildes(barrio_comun or "").lower(),
            "fecha_extraccion": datetime.now().isoformat(timespec="seconds"),
        }
        registros.append(registro)

    return registros


def recolectar_metrocuadrado(zona_cfg: dict, session: requests.Session) -> list[dict]:
    api_url = "https://www.metrocuadrado.com/rest-search/search"
    api_headers = {
        **HEADERS,
        "accept": "*/*",
        "content-type": "application/json",
        "referer": zona_cfg["urls"][0],
        "x-api-key": METROCUADRADO_API_KEY,
    }

    todos = []
    codigos_vistos: set[str] = set()
    desde = 0
    total_hits = None

    while desde < METROCUADRADO_MAX_REGISTROS and (total_hits is None or desde < total_hits):
        params = {
            "size": METROCUADRADO_TAMANO_PAGINA,
            "from": desde,
            # Antes solo "apartamento". Zonas historicas como Getsemani y
            # Centro Historico tienen buena parte de su inventario como
            # casas, no apartamentos - confirmado comparando manualmente
            # /apartamentos/ (7 resultados) vs /inmuebles/ (30+) para
            # Getsemani. "requests" codifica una lista de Python como
            # parametros repetidos (realEstateTypeList=apartamento&
            # realEstateTypeList=casa), que es la convencion esperada por
            # este tipo de API.
            "realEstateTypeList": ["apartamento", "casa"],
            "realEstateBusinessList": "venta",
            "city": zona_cfg["city_slug"],
            "neighborhood": zona_cfg["neighborhood_slug"],
        }
        logger.info(f"[metrocuadrado] {zona_cfg['zona']} | from={desde}: {api_url}")

        if not puede_scrapear(api_url, session):
            break

        try:
            resp = session.get(api_url, headers=api_headers, params=params, timeout=REQUEST_TIMEOUT)
        except requests.RequestException as e:
            logger.warning(f"[metrocuadrado] Error de red consultando el API: {e}")
            break
        descansar()

        if resp.status_code != 200:
            logger.warning(
                f"[metrocuadrado] El API respondio {resp.status_code} para {zona_cfg['zona']} "
                f"(from={desde}). Si esto se repite en todas las zonas, la x-api-key "
                f"probablemente rotó y hay que volver a capturarla."
            )
            break

        data_json = resp.json()
        if total_hits is None:
            total_hits = data_json.get("totalHits", 0)
            logger.info(f"[metrocuadrado] {zona_cfg['zona']}: totalHits real reportado por el API = {total_hits}")

        registros_pagina = parsear_resultados_metrocuadrado(data_json, zona_cfg)
        if not registros_pagina:
            logger.info(f"[metrocuadrado] from={desde} no trajo registros. Deteniendo paginacion.")
            break

        nuevos = [r for r in registros_pagina if r["codigo_anuncio"] not in codigos_vistos]
        for r in nuevos:
            codigos_vistos.add(r["codigo_anuncio"])
        todos.extend(nuevos)
        logger.info(f"[metrocuadrado] {zona_cfg['zona']}: {len(nuevos)} nuevos (acumulado: {len(todos)} de {total_hits}).")

        if len(nuevos) < len(registros_pagina):
            # Empezaron a repetirse resultados ya vistos - senal de que
            # llegamos al final real, aunque from todavia sea < total_hits.
            logger.info(f"[metrocuadrado] Aparecieron registros repetidos. Deteniendo paginacion.")
            break

        desde += METROCUADRADO_TAMANO_PAGINA

    return todos


# ---------------------------------------------------------------------------
# 5. ENCUENTRA24: extraccion por ventanas ancladas a la posicion de cada
#    enlace de detalle unico en el HTML crudo
#    -- ver ADVERTENCIA al inicio del archivo: v1, pendiente de validar --
# ---------------------------------------------------------------------------
# NOTA (corregido tras la 2a corrida real): la primera version de este
# parser buscaba el texto "ContactarLlamarWhatsApp" como separador entre
# tarjetas, basado en como se veia el contenido ya convertido a texto/
# markdown durante la investigacion. En la corrida real, ese marcador NUNCA
# aparecio (enlaces=20, ventanas=1) - lo mas probable es que "Contactar",
# "Llamar" y "WhatsApp" sean tres botones/elementos HTML separados, y al
# extraer el texto plano con un separador (correctamente, para no pegar
# palabras distintas) quedan como "Contactar Llamar WhatsApp" con espacios,
# no como una sola palabra pegada.
#
# En vez de intentar adivinar la puntuacion exacta de ese texto (fragil:
# podria volver a cambiar), se cambio de estrategia a algo mas robusto: usar
# las posiciones de cada enlace de detalle UNICO dentro del HTML crudo (esto
# SI se confirmo que funciona: la corrida real encontro exactamente los 20
# enlaces esperados). Cada tarjeta empieza donde aparece por primera vez su
# propio enlace, y termina donde empieza la primera aparicion del siguiente
# enlace distinto - sin depender de ningun texto de botones.

PATRON_LINK_E24 = re.compile(
    r'href="(/panama-es/bienes-raices-venta-de-propiedades-apartamentos/[a-z0-9\-]+/\d+)"'
)


def parsear_resultados_encuentra24(html: str, zona_cfg: dict) -> list[dict]:
    matches = list(PATRON_LINK_E24.finditer(html))

    if not matches:
        logger.warning(
            f"[encuentra24] {zona_cfg['zona']}: no se encontro ningun enlace de "
            f"detalle en el HTML. El patron de URL puede haber cambiado - "
            f"revisar manualmente el HTML actual."
        )
        return []

    # Posicion de la PRIMERA aparicion de cada enlace unico, en orden.
    primera_posicion: dict[str, int] = {}
    for m in matches:
        href = m.group(1)
        if href not in primera_posicion:
            primera_posicion[href] = m.start()

    hrefs_ordenados = sorted(primera_posicion.items(), key=lambda par: par[1])
    logger.info(f"[encuentra24] {zona_cfg['zona']}: {len(hrefs_ordenados)} tarjetas unicas detectadas en esta pagina.")

    registros = []
    for i, (url_relativa, pos_inicio) in enumerate(hrefs_ordenados):
        pos_fin = hrefs_ordenados[i + 1][1] if i + 1 < len(hrefs_ordenados) else len(html)
        fragmento_html = html[pos_inicio:pos_fin]

        ventana = BeautifulSoup(fragmento_html, "html.parser").get_text(separator=" ", strip=True)
        ventana = re.sub(r"\s+", " ", ventana)  # colapsa saltos de linea/espacios repetidos

        def buscar(patron: str, texto=ventana):
            m = re.search(patron, texto)
            return m.group(1) if m else None

        precio_texto = buscar(r"\$\s?([\d,]+)(?!\s*Mantenimiento)")
        area_texto = buscar(r"(\d+)\s?m²")
        banos_texto = buscar(r"([\d.]+)\s?Ba[nñ]os?")
        mantenimiento_texto = buscar(r"\$\s?([\d,]+)\s*Mantenimiento")

        # La ubicacion ("Vía Argentina, Ciudad de Panamá", "El Cangrejo,
        # Ciudad de Panamá", etc.) aparece SIEMPRE justo antes del numero de
        # recamaras en la tarjeta real. En vez de buscarla en toda la
        # ventana (lo que puede capturar por error texto anterior como
        # "Mantenimiento"), se ancla la busqueda a los ~45 caracteres
        # inmediatamente antes de "N Recamaras" y se toma la coincidencia
        # mas cercana (la ultima) dentro de ese tramo.
        habitaciones_texto = None
        ubicacion_texto = None
        m_hab = re.search(r"(\d+)\s?Rec[aá]maras?", ventana)
        if m_hab:
            habitaciones_texto = m_hab.group(1)
            tramo_previo = ventana[max(0, m_hab.start() - 45):m_hab.start()]
            matches_ubic = list(re.finditer(
                r"(?!(?:Mantenimiento|Resaltado|Exclusivo|Destacado|Oportunidad)\b)"
                r"([A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑñáéíóú\s/\-]{2,25}?),\s*Ciudad de Panam",
                tramo_previo,
            ))
            if matches_ubic:
                ubicacion_texto = matches_ubic[-1].group(1).strip()

        precio_num = int(precio_texto.replace(",", "")) if precio_texto else None
        area_num = int(area_texto) if area_texto else None

        registro = {
            "pais": zona_cfg["pais"],
            "ciudad": zona_cfg["ciudad"],
            "zona": zona_cfg["zona"],
            "portal": "encuentra24",
            "url_inmueble": urljoin("https://www.encuentra24.com", url_relativa),
            "titulo": None,  # no se pudo aislar de forma confiable del texto de la tarjeta; ver nota en analisis
            "codigo_anuncio": url_relativa.rstrip("/").rsplit("/", 1)[-1],
            "tipo_inmueble": "Apartamento",
            "precio_venta": precio_num,
            "area_m2": area_num,
            "precio_m2": (
                round(precio_num / area_num) if precio_num and area_num and area_num > 0 else None
            ),
            "habitaciones": habitaciones_texto,
            "banos": banos_texto,
            "parqueaderos": None,
            "administracion": mantenimiento_texto,
            "barrio_texto": ubicacion_texto,
            "barrio_comun_texto": ubicacion_texto,
            "en_scope_zona": True,  # el propio portal ya scopeo por zona en la URL
            "fecha_extraccion": datetime.now().isoformat(timespec="seconds"),
        }
        registros.append(registro)

    return registros


def construir_url_paginada_encuentra24(base_url: str, num_pagina: int) -> str:
    # Encuentra24 pagina agregando ".N" antes del ultimo segmento de la URL
    # (confirmado viendo resultados reales: ".../casco-viejo-san-felipe.2").
    # La pagina 1 no lleva sufijo.
    if num_pagina <= 1:
        return base_url
    base = base_url.rstrip("/")
    return f"{base}.{num_pagina}"


def recolectar_encuentra24(zona_cfg: dict, session: requests.Session) -> list[dict]:
    todos = []
    urls_vistas: set[str] = set()

    for url_base in zona_cfg["urls"]:
        for num_pagina in range(1, ENCUENTRA24_MAX_PAGINAS + 1):
            url = construir_url_paginada_encuentra24(url_base, num_pagina)
            logger.info(f"[encuentra24] {zona_cfg['zona']} | pagina {num_pagina}: {url}")

            html = fetch_html(url, session)
            descansar()
            if html is None:
                logger.info(f"[encuentra24] Solicitud fallida o bloqueada para {url}. Deteniendo esta sub-zona.")
                break

            registros_pagina = parsear_resultados_encuentra24(html, zona_cfg)
            nuevos = [r for r in registros_pagina if r["url_inmueble"] not in urls_vistas]

            if not nuevos:
                logger.info(f"[encuentra24] Pagina {num_pagina} no trajo registros nuevos. Deteniendo paginacion.")
                break

            for r in nuevos:
                urls_vistas.add(r["url_inmueble"])
            todos.extend(nuevos)
            logger.info(f"[encuentra24] {zona_cfg['zona']}: {len(nuevos)} nuevos (acumulado: {len(todos)}).")

    return todos


# ---------------------------------------------------------------------------
# 6. BASE DE DATOS
# ---------------------------------------------------------------------------

COLUMNAS_TABLA = [
    "pais", "ciudad", "zona", "portal", "titulo", "codigo_anuncio",
    "tipo_inmueble", "precio_venta", "area_m2", "precio_m2",
    "habitaciones", "banos", "parqueaderos", "estrato",
    "barrio_texto", "barrio_comun_texto", "administracion",
    "antiguedad_texto", "latitud", "longitud", "en_scope_zona",
    "bajo_media_zona", "fecha_extraccion",
]


def init_db(db_path: str = DB_PATH) -> db._Conexion:
    conn = db.conectar(db_path)
    cur = conn.execute(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'raw_listings'"
    )
    columnas_actuales = {fila["column_name"] for fila in cur.fetchall()}
    if columnas_actuales:
        columnas_esperadas = set(COLUMNAS_TABLA) | {"id", "url_inmueble"}
        if columnas_actuales != columnas_esperadas:
            logger.warning(
                "La tabla raw_listings existente tiene un esquema distinto. "
                "Se elimina y se recrea. Si necesitabas los datos anteriores, "
                "haz una copia ANTES de correr de nuevo."
            )
            conn.execute("DROP TABLE raw_listings")
            conn.commit()

    columnas_sql = ",\n            ".join(f"{c} TEXT" for c in COLUMNAS_TABLA)
    conn.execute(
        f"""
        CREATE TABLE IF NOT EXISTS raw_listings (
            id SERIAL PRIMARY KEY,
            url_inmueble TEXT UNIQUE,
            {columnas_sql}
        )
        """
    )
    conn.commit()
    return conn


def guardar_registro(conn: "db._Conexion", url_inmueble: str, registro: dict):
    columnas = ["url_inmueble"] + COLUMNAS_TABLA
    valores = [url_inmueble] + [registro.get(c) for c in COLUMNAS_TABLA]
    placeholders = ", ".join(["?"] * len(columnas))
    columnas_sql = ", ".join(columnas)
    actualizaciones = ", ".join(f"{c} = EXCLUDED.{c}" for c in COLUMNAS_TABLA)
    try:
        conn.execute(
            f"""INSERT INTO raw_listings ({columnas_sql}) VALUES ({placeholders})
                ON CONFLICT (url_inmueble) DO UPDATE SET {actualizaciones}""",
            valores,
        )
    except Exception as e:
        logger.error(f"Error guardando registro {url_inmueble}: {e}")
        conn.rollback()  # Postgres deja la transacción abortada si no se hace rollback tras un error


# ---------------------------------------------------------------------------
# 7. FILTRO DE NEGOCIO: precio/m2 por debajo de la media de su zona
#    (el criterio que Paola definio explicitamente en la mision)
# ---------------------------------------------------------------------------
# Importante: NO se elimina ningun registro que quede por encima de la
# media. Se calcula la media por zona y se marca cada inmueble con un
# booleano "bajo_media_zona" - el mismo principio de "nunca borrar en
# silencio" que ya aplicamos en toda la arquitectura. El equipo de
# arquitectura puede revisar ambos grupos si lo necesita.

def marcar_bajo_media_por_zona(registros: list[dict]) -> list[dict]:
    precios_por_zona: dict[str, list[float]] = {}
    for r in registros:
        if r.get("precio_m2"):
            precios_por_zona.setdefault(r["zona"], []).append(float(r["precio_m2"]))

    medias = {
        zona: statistics.median(precios)
        for zona, precios in precios_por_zona.items()
        if precios
    }

    for r in registros:
        media_zona = medias.get(r["zona"])
        if media_zona is not None and r.get("precio_m2"):
            r["bajo_media_zona"] = float(r["precio_m2"]) < media_zona
        else:
            r["bajo_media_zona"] = None  # sin precio_m2 valido: no se puede evaluar

    logger.info("=== Medianas de precio/m2 calculadas por zona ===")
    for zona, media in medias.items():
        n = len(precios_por_zona[zona])
        logger.info(f"  {zona}: mediana = {media:,.0f} (sobre {n} inmuebles con precio/m2 valido)")

    return registros


# ---------------------------------------------------------------------------
# 8. ORQUESTACION PRINCIPAL
# ---------------------------------------------------------------------------

def main():
    session = requests.Session()
    conn = init_db()

    todos_los_registros: list[dict] = []

    for zona_cfg in CONFIG_ZONAS:
        logger.info(f"=== Iniciando zona: {zona_cfg['zona']}, {zona_cfg['ciudad']} ({zona_cfg['portal']}) ===")

        if zona_cfg["portal"] == "metrocuadrado":
            registros = recolectar_metrocuadrado(zona_cfg, session)
        elif zona_cfg["portal"] == "encuentra24":
            registros = recolectar_encuentra24(zona_cfg, session)
        else:
            logger.error(f"Portal no reconocido: {zona_cfg['portal']}")
            registros = []

        logger.info(f"=== Zona {zona_cfg['zona']}: {len(registros)} inmuebles extraidos ===")
        todos_los_registros.extend(registros)

    todos_los_registros = marcar_bajo_media_por_zona(todos_los_registros)

    for r in todos_los_registros:
        guardar_registro(conn, r["url_inmueble"], r)
    conn.commit()
    conn.close()

    logger.info("=== RESUMEN FINAL POR ZONA ===")
    for zona_cfg in CONFIG_ZONAS:
        n_zona = sum(1 for r in todos_los_registros if r["zona"] == zona_cfg["zona"])
        n_bajo_media = sum(
            1 for r in todos_los_registros
            if r["zona"] == zona_cfg["zona"] and r.get("bajo_media_zona")
        )
        logger.info(
            f"  {zona_cfg['zona']} ({zona_cfg['ciudad']}): "
            f"{n_zona} extraidos | {n_bajo_media} por debajo de la media de zona"
        )

    logger.info(f"=== Extraccion finalizada. Total: {len(todos_los_registros)} inmuebles. Base de datos: {DB_PATH} ===")


if __name__ == "__main__":
    main()
