"""
script_transform_serava.py
===========================
Fase T (Transform) del pipeline de Serava - continua directamente donde
termina script_extract_serava.py.

Es una extension del script_transform.py de la prueba tecnica de Chico,
adaptada para un caso mas complejo: 10 zonas, 4 ciudades, 2 paises y 2
monedas en vez de una sola zona en una sola moneda.

HALLAZGO IMPORTANTE (documentado aqui, igual que se documento el caso de
Chico en la prueba tecnica): al revisar los datos crudos de Metrocuadrado,
se confirmo que el propio filtro de zona del portal MEZCLA barrios vecinos.
Por ejemplo, la busqueda de "El Retiro" en Metrocuadrado trae tambien
inmuebles cuyo barrio real es "La Cabrera", "Chico" o "Los Rosales" - zonas
adyacentes en la vida real, pero que no son la zona pedida. Esto es
exactamente el mismo fenomeno que ya se investigo a nivel de arquitectura
(la discusion sobre "filtro de portal" vs. "poligono real de la zona"): el
filtro del portal NO es una garantia perfecta, es un primer filtro
automatico que reduce el problema, pero no lo resuelve del todo. La
resolucion completa (validacion contra el poligono real) es trabajo de una
fase posterior; por ahora, este script aplica el mismo criterio ya usado en
la prueba tecnica: se conservan solo los registros donde el nombre de la
zona SI aparece en el texto de barrio que trae el propio portal
(en_scope_zona = 1), y se deja documentado cuantos registros se excluyen
por zona para que la limitacion quede visible, no escondida.

QUE HACE ESTE SCRIPT:
1. Lee raw_listings desde serava_raw.db, filtrando a en_scope_zona = 1.
2. Convierte los campos de texto a sus tipos numericos reales.
3. Asigna la moneda correspondiente segun el pais (Colombia -> COP,
   Panama -> USD) - IMPORTANTE para no comparar ni graficar precios de
   distintas monedas como si fueran comparables.
4. Marca precios atipicos combinando DOS metodos, ambos calculados POR
   ZONA (no de forma global): mezclar, por ejemplo, La Cabrera en pesos
   con Casco Viejo en dolares en un solo calculo de atipicos no tendria
   sentido. Metodo 1: IQR de Tukey sobre el precio/m2 crudo (el original).
   Metodo 2: z-score robusto de Iglewicz-Hoaglin (mediana + MAD) sobre el
   logaritmo del precio/m2, mas sofisticado porque corrige el sesgo hacia
   la derecha tipico de precios inmobiliarios y no lo distorsionan los
   propios atipicos (a diferencia de un z-score con desviacion estandar).
   Se marca atipica si cualquiera de los dos la señala.
5. Marca posibles duplicados (mismo precio + area dentro de la misma zona).
6. Recalcula "bajo_media_zona" sobre los datos YA limpios y deduplicados
   (la version calculada en la extraccion usaba los datos crudos, que
   podian incluir duplicados que sesgan la mediana).
7. Valida cada inmueble contra el poligono real de su zona (columna
   dentro_poligono_real: True / False / None si no hay poligono o
   coordenadas para evaluar - ver poligonos_zonas.py y
   validar_poligono.py). Solo cubre hoy las 7 zonas de Colombia, que son
   las que traen coordenadas desde Metrocuadrado.
8. Para los que quedan fuera del poligono, corre el analisis de similitud
   estadistica (Mahalanobis robusto via MCD, con respaldo k-NN para
   zonas con poca muestra - ver analisis_similitud.py) contra los
   inmuebles SI confirmados dentro de su zona, marcando
   similar_a_zona: True / False / None.
9. Guarda el resultado en clean_listings (serava_clean.db) y exporta
   serava_clean.csv.

ARCHIVOS QUE DEBEN ESTAR EN LA MISMA CARPETA (este script los importa):
    poligonos_zonas.py, poligonos_zonas.geojson, validar_poligono.py,
    analisis_similitud.py

USO:
    pip install -r requirements_dashboard.txt
    python script_transform_serava.py
"""

import math
import statistics
from datetime import datetime

import pandas as pd

from . import db_admin as db

from .validar_poligono import marcar_dentro_poligono
from .analisis_similitud import marcar_similitud
from .seguimiento import cruzar_seguimiento


# ---------------------------------------------------------------------------
# 1. CONFIGURACION
# ---------------------------------------------------------------------------

RAW_DB_PATH = "serava_raw.db"
CLEAN_DB_PATH = "serava_clean.db"
CLEAN_CSV_PATH = "serava_clean.csv"

FECHA_CONSULTA = datetime.now().strftime("%Y-%m-%d")

MONEDA_POR_PAIS = {
    "Colombia": "COP",
    "Panamá": "USD",
}

# Piso absoluto de precio/m2 por moneda: cualquier valor por debajo de esto
# se marca como atipico_bajo sin importar el calculo estadistico, porque
# huele a error de digitacion del anunciante (le faltan ceros, por ejemplo).
# Mismo criterio de la prueba tecnica, con un piso separado para USD.
PISO_ABSOLUTO_PRECIO_M2 = {
    "COP": 1_000_000,   # ningun apartamento legitimo en estas zonas de Colombia baja de esto
    "USD": 500,          # ningun apartamento legitimo en estas zonas de Panama baja de esto
}

# Umbral del z-score robusto de Iglewicz & Hoaglin (MAD): el valor estandar
# de la literatura para "modified z-score", equivalente en espiritu al 1.5*IQR
# de Tukey pero basado en la mediana y la desviacion absoluta mediana en vez
# de cuartiles.
UMBRAL_Z_ROBUSTO = 3.5


# ---------------------------------------------------------------------------
# 2. CARGA DE DATOS CRUDOS
# ---------------------------------------------------------------------------

def cargar_datos_crudos(db_path: str = RAW_DB_PATH) -> pd.DataFrame:
    df = pd.read_sql("SELECT * FROM raw_listings WHERE en_scope_zona = '1'", db.engine())
    return df


# ---------------------------------------------------------------------------
# 3. LIMPIEZA DE TIPOS
# ---------------------------------------------------------------------------

def a_entero(valor):
    if valor is None or valor == "" or pd.isna(valor):
        return None
    try:
        return int(float(valor))
    except (ValueError, TypeError):
        return None


def a_decimal(valor):
    if valor is None or valor == "" or pd.isna(valor):
        return None
    try:
        return float(valor)
    except (ValueError, TypeError):
        return None


def limpiar_tipos(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    for col in ["precio_venta", "area_m2", "precio_m2", "habitaciones", "banos",
                "parqueaderos", "estrato", "administracion", "latitud", "longitud"]:
        df[col] = df[col].apply(a_decimal)

    # precio_m2 recalculado desde cero (no se confia en el valor guardado en
    # la extraccion): mas confiable que depender de que nunca haya cambiado
    # de tipo entre la extraccion y este punto.
    df["precio_m2"] = df.apply(
        lambda fila: round(fila["precio_venta"] / fila["area_m2"])
        if pd.notna(fila["precio_venta"]) and pd.notna(fila["area_m2"]) and fila["area_m2"] > 0
        else None,
        axis=1,
    )

    df["moneda"] = df["pais"].map(MONEDA_POR_PAIS).fillna("Desconocida")
    return df


# ---------------------------------------------------------------------------
# 4. PRECIOS ATIPICOS -- CALCULADO POR ZONA, NO GLOBAL
# ---------------------------------------------------------------------------

def marcar_precios_atipicos(df: pd.DataFrame) -> pd.DataFrame:
    """
    La pregunta que responde esta funcion es siempre "¿esta propiedad es un
    dato atipico EN COMPARACION CON SU ZONA?" - por eso todo se calcula por
    (zona, moneda), nunca de forma global: mezclar zonas de paises y monedas
    distintas en un solo calculo no tendria sentido (un precio/m2 "normal"
    en USD para Casco Viejo se veria como un atipico absurdo si se
    comparara contra precios en COP de La Cabrera).

    Se combinan DOS metodos independientes, no uno solo:
    1. IQR de Tukey (1.5x rango intercuartil) sobre el precio/m2 crudo -
       el metodo original, robusto por diseño (los cuartiles no los mueve
       el propio atipico).
    2. z-score robusto de Iglewicz-Hoaglin (mediana + MAD, umbral 3.5)
       sobre el LOGARITMO del precio/m2. Dos razones para el logaritmo:
       el precio/m2 inmobiliario tiene cola larga a la derecha (pocos
       predios de lujo estiran la distribucion), y el z-score robusto
       asume una comparacion de distancias simetrica - calcularlo sobre
       el log la simetriza antes de medir, en vez de asumir una campana
       sobre datos que no la tienen. La MAD (no la desviacion estandar)
       es lo que lo hace robusto: la desviacion estandar la distorsionan
       los mismos atipicos que se quiere detectar, la MAD no (mismo
       principio que ya se aplico para Mahalanobis robusto vs. clasico en
       analisis_similitud.py).

    Se marca atipica una propiedad si CUALQUIERA de los dos metodos la
    señala (union, no interseccion): coherente con el principio general
    del proyecto de marcar de mas para que el arquitecto revise, en vez de
    esconder un atipico real por exigir que ambos metodos coincidan.
    "metodo_atipico" documenta cual(es) la marcaron, para que quede
    trazable por que se le puso esa etiqueta a cada predio.

    Ningun registro se elimina: solo se clasifica (normal / atipico_alto /
    atipico_bajo), igual que en la prueba tecnica.
    """
    df = df.copy()
    df["precio_m2_clasificacion"] = "sin_dato"
    df["metodo_atipico"] = None

    for (zona, moneda), grupo in df.groupby(["zona", "moneda"]):
        precios_validos = grupo["precio_m2"].dropna()
        if len(precios_validos) < 4:
            # Muestra muy chica (ej. Getsemani) para que un calculo de
            # cuartiles o de MAD tenga sentido estadistico; se deja todo
            # como "sin_dato" para esa zona en vez de fabricar limites con
            # 1-3 puntos.
            continue

        q1 = precios_validos.quantile(0.25)
        q3 = precios_validos.quantile(0.75)
        iqr = q3 - q1
        limite_inferior_iqr = q1 - 1.5 * iqr
        limite_superior_iqr = q3 + 1.5 * iqr
        piso_absoluto = PISO_ABSOLUTO_PRECIO_M2.get(moneda, 0)

        log_precios = precios_validos.apply(math.log)
        mediana_log = log_precios.median()
        mad_log = (log_precios - mediana_log).abs().median()

        def clasificar(
            precio_m2,
            li_iqr=limite_inferior_iqr, ls_iqr=limite_superior_iqr,
            mediana_log=mediana_log, mad_log=mad_log, piso=piso_absoluto,
        ):
            if precio_m2 is None or pd.isna(precio_m2):
                return "sin_dato", None
            if precio_m2 < piso:
                return "atipico_bajo", "piso_absoluto"

            metodos_bajo, metodos_alto = [], []
            if precio_m2 < li_iqr:
                metodos_bajo.append("iqr")
            elif precio_m2 > ls_iqr:
                metodos_alto.append("iqr")

            if mad_log > 0:
                z_robusto = 0.6745 * (math.log(precio_m2) - mediana_log) / mad_log
                if z_robusto < -UMBRAL_Z_ROBUSTO:
                    metodos_bajo.append("mad_log")
                elif z_robusto > UMBRAL_Z_ROBUSTO:
                    metodos_alto.append("mad_log")

            if metodos_bajo:
                return "atipico_bajo", "+".join(metodos_bajo)
            if metodos_alto:
                return "atipico_alto", "+".join(metodos_alto)
            return "normal", None

        mascara = (df["zona"] == zona) & (df["moneda"] == moneda)
        resultado = df.loc[mascara, "precio_m2"].apply(clasificar)
        df.loc[mascara, "precio_m2_clasificacion"] = resultado.apply(lambda r: r[0])
        df.loc[mascara, "metodo_atipico"] = resultado.apply(lambda r: r[1])

    return df


# ---------------------------------------------------------------------------
# 5. POSIBLES DUPLICADOS
# ---------------------------------------------------------------------------

UMBRAL_GRUPO_MODELO_REPETIDO = 4  # a partir de este tamano de grupo, es mas
                                   # probable que sea un edificio nuevo con
                                   # varias unidades del mismo modelo que una
                                   # republicacion del mismo anuncio


def marcar_posibles_duplicados(df: pd.DataFrame) -> pd.DataFrame:
    """
    Corregido tras la reunion de revision: el criterio anterior (mismo
    precio + area exactos) marcaba como "duplicado" cosas como un edificio
    nuevo con 10 unidades identicas del mismo modelo en venta - que son 10
    predios reales y distintos, no una republicacion. Confirmado con datos
    reales: existen grupos de hasta 10 anuncios con el mismo precio+area
    exactos en una sola zona, un patron mucho mas consistente con
    "edificio nuevo, mismo modelo de apartamento" que con "el mismo aviso
    publicado varias veces".

    Ahora se distinguen dos cosas, no una sola:
    1. Se agregan habitaciones y banos al criterio de coincidencia (ya no
       solo precio+area), para reducir falsos positivos de unidades
       genuinamente distintas que solo comparten precio y area por
       casualidad.
    2. Dentro de los que coinciden en todo eso, se separan por el TAMANO
       del grupo:
       - Grupos chicos (2-3 coincidencias): "posible_duplicado" = True -
         patron mas consistente con republicacion del mismo anuncio real,
         vale la pena que alguien lo revise.
       - Grupos grandes (4 o mas): "posible_duplicado" = False, pero se
         marcan por separado como "modelo_repetido_edificio_nuevo" = True -
         son predios reales y distintos, no hay que tratarlos como
         duplicados, solo queda documentado por que comparten specs.

    Ningun registro se elimina en ningun caso - mismo principio de
    siempre.
    """
    df = df.copy()
    columnas_coincidencia = ["zona", "precio_venta", "area_m2", "habitaciones", "banos"]

    df["grupo_tamano"] = df.groupby(columnas_coincidencia)["zona"].transform("size")
    # Solo cuenta como "coincidencia" si hay al menos 2 Y todas las
    # columnas de comparacion tienen dato valido (evita que varios NaN se
    # agrupen entre si como si fueran iguales).
    tiene_datos_completos = df[columnas_coincidencia].notna().all(axis=1)
    df.loc[~tiene_datos_completos, "grupo_tamano"] = 1

    df["posible_duplicado"] = tiene_datos_completos & (df["grupo_tamano"] >= 2) & (df["grupo_tamano"] < UMBRAL_GRUPO_MODELO_REPETIDO)
    df["modelo_repetido_edificio_nuevo"] = tiene_datos_completos & (df["grupo_tamano"] >= UMBRAL_GRUPO_MODELO_REPETIDO)

    return df


def eliminar_duplicados_confirmados(df: pd.DataFrame) -> pd.DataFrame:
    """
    A pedido explicito (revision del 05/08): para los duplicados de grupo
    chico (posible_duplicado = True - candidatos a republicacion del mismo
    anuncio), se deja solo 1 representante por grupo en vez de mostrar los
    2-3 repetidos. Es una EXCEPCION deliberada al principio general de "no
    borrar nada": aqui si se quita, porque son, con alta probabilidad, el
    mismo inmueble contado varias veces.

    NO toca "modelo_repetido_edificio_nuevo" (grupos grandes) - esos siguen
    siendo predios reales y distintos, se conservan todos.

    El dato crudo completo (antes de este paso) sigue intacto en
    raw_listings/serava_raw.db, asi que nada se pierde de forma
    irrecuperable - solo se resume en la tabla final que ve el equipo.
    """
    df = df.copy()
    es_duplicado = df["posible_duplicado"] == True  # noqa: E712
    df_sin_duplicados_de_grupo_chico = df[~es_duplicado]

    columnas_coincidencia = ["zona", "precio_venta", "area_m2", "habitaciones", "banos"]
    df_un_representante_por_grupo = (
        df[es_duplicado]
        .sort_values("fecha_extraccion")
        .drop_duplicates(subset=columnas_coincidencia, keep="first")
    )

    eliminados = es_duplicado.sum() - len(df_un_representante_por_grupo)
    if eliminados > 0:
        print(f"  Se eliminaron {eliminados} registros duplicados (se dejó 1 representante por grupo chico).")

    resultado = pd.concat([df_sin_duplicados_de_grupo_chico, df_un_representante_por_grupo], ignore_index=True)
    return resultado


# ---------------------------------------------------------------------------
# 6. RECALCULO DE "BAJO LA MEDIA DE LA ZONA" SOBRE DATOS YA LIMPIOS
# ---------------------------------------------------------------------------
# El criterio de negocio, tal como lo definio Paola: inmuebles cuyo precio
# por m2 esta por debajo de la MEDIA (mediana, para que no la distorsionen
# valores extremos) de precio/m2 de su zona. Se recalcula aqui, sobre datos
# ya deduplicados y depurados de zona - la version de la extraccion se hizo
# sobre datos crudos, sin esas correcciones todavia aplicadas.

def recalcular_bajo_media_zona(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    medianas = {}
    for zona, grupo in df.groupby("zona"):
        precios = grupo.loc[grupo["posible_duplicado"] == False, "precio_m2"].dropna()  # noqa: E712
        if len(precios) > 0:
            medianas[zona] = statistics.median(precios)

    df["mediana_precio_m2_zona"] = df["zona"].map(medianas)
    df["bajo_media_zona"] = (df["precio_m2"] < df["mediana_precio_m2_zona"]).astype("boolean")
    df.loc[df["precio_m2"].isna() | df["mediana_precio_m2_zona"].isna(), "bajo_media_zona"] = pd.NA
    return df


# ---------------------------------------------------------------------------
# 7. TABLA FINAL
# ---------------------------------------------------------------------------

COLUMNAS_FINALES = [
    "pais", "ciudad", "zona", "moneda", "portal", "url_inmueble", "codigo_anuncio",
    "tipo_inmueble", "titulo", "precio_venta", "area_m2", "precio_m2",
    "precio_m2_clasificacion", "metodo_atipico", "mediana_precio_m2_zona", "bajo_media_zona",
    "habitaciones", "banos", "parqueaderos", "estrato", "administracion",
    "barrio_texto", "barrio_comun_texto", "posible_duplicado", "modelo_repetido_edificio_nuevo",
    "dentro_poligono_real", "distancia_similitud", "metodo_similitud", "similar_a_zona",
    "latitud", "longitud", "fecha_extraccion",
]


def construir_tabla_final(df: pd.DataFrame) -> pd.DataFrame:
    df_final = df[COLUMNAS_FINALES].rename(columns={"url_inmueble": "link"})
    df_final["fecha_consulta"] = FECHA_CONSULTA

    def observaciones(fila):
        notas = []
        if fila["precio_m2_clasificacion"] == "atipico_bajo":
            notas.append(
                f"Precio/m² anormalmente bajo para su zona ({fila['metodo_atipico']}): "
                "revisar posible error de digitación"
            )
        elif fila["precio_m2_clasificacion"] == "atipico_alto":
            notas.append(f"Precio/m² anormalmente alto para su zona ({fila['metodo_atipico']})")
        if fila["posible_duplicado"]:
            notas.append(
                "Mismo precio, área, habitaciones y baños que 1-2 anuncios más de la misma zona: "
                "posible republicación del mismo inmueble"
            )
        if fila["modelo_repetido_edificio_nuevo"]:
            notas.append(
                "Comparte precio/área/habitaciones/baños con 3 o más anuncios de la misma zona: "
                "patrón típico de edificio nuevo con varias unidades del mismo modelo, no se trata como duplicado"
            )
        dentro = fila["dentro_poligono_real"]
        if pd.notna(dentro) and not bool(dentro):
            similar = fila["similar_a_zona"]
            if pd.notna(similar) and bool(similar):
                notas.append(
                    f"Fuera del polígono real de la zona, pero estadísticamente similar a los "
                    f"predios confirmados dentro ({fila['metodo_similitud']}): candidato a incluir igual"
                )
            elif pd.notna(similar) and not bool(similar):
                notas.append(
                    f"Fuera del polígono real de la zona y NO parecido a los predios confirmados "
                    f"dentro ({fila['metodo_similitud']}): revisar con más cuidado"
                )
            else:
                notas.append("Fuera del polígono real de la zona; sin suficiente muestra para evaluar similitud")
        return "; ".join(notas)

    df_final["observaciones"] = df_final.apply(observaciones, axis=1)
    return df_final


# ---------------------------------------------------------------------------
# 8. GUARDADO
# ---------------------------------------------------------------------------

def guardar(df_final: pd.DataFrame):
    df_final.to_sql("clean_listings", db.engine(), if_exists="replace", index=False)
    df_final.to_csv(CLEAN_CSV_PATH, index=False, encoding="utf-8-sig")


# ---------------------------------------------------------------------------
# 9. ORQUESTACION PRINCIPAL
# ---------------------------------------------------------------------------

def main():
    print("Cargando datos crudos (solo en_scope_zona = 1)...")
    df_crudo = cargar_datos_crudos()
    print(f"  {len(df_crudo)} registros cargados.")

    print("\nRegistros excluidos por zona (en_scope_zona = 0) - LIMITACION CONOCIDA:")
    excluidos = pd.read_sql(
        "SELECT zona, COUNT(*) as excluidos FROM raw_listings WHERE en_scope_zona = '0' GROUP BY zona",
        db.engine(),
    )
    if len(excluidos) > 0:
        print(excluidos.to_string(index=False))
    else:
        print("  (ninguno)")

    print("\nLimpiando tipos y asignando moneda por pais...")
    df_limpio = limpiar_tipos(df_crudo)

    print("Marcando precios atipicos (IQR + z-score robusto MAD sobre log, por zona)...")
    df_limpio = marcar_precios_atipicos(df_limpio)
    print(df_limpio["precio_m2_clasificacion"].value_counts().to_string())
    print(df_limpio.loc[df_limpio["precio_m2_clasificacion"].str.startswith("atipico"), "metodo_atipico"].value_counts().to_string())

    print("\nMarcando posibles duplicados (mismo precio + area en la misma zona)...")
    df_limpio = marcar_posibles_duplicados(df_limpio)
    print(f"  Posibles duplicados (grupos chicos, republicación probable): {df_limpio['posible_duplicado'].sum()} de {len(df_limpio)}")
    print(f"  Modelo repetido en edificio nuevo (grupos grandes, no son duplicados): {df_limpio['modelo_repetido_edificio_nuevo'].sum()} de {len(df_limpio)}")

    print("\nEliminando duplicados confirmados (se deja 1 representante por grupo chico)...")
    df_limpio = eliminar_duplicados_confirmados(df_limpio)
    print(f"  Quedan {len(df_limpio)} registros después de eliminar duplicados.")

    print("\nRecalculando 'bajo_media_zona' sobre datos limpios y deduplicados...")
    df_limpio = recalcular_bajo_media_zona(df_limpio)

    print("\nValidando cada inmueble contra el polígono real de su zona...")
    df_limpio = marcar_dentro_poligono(df_limpio)
    resumen_poligono = (
        df_limpio.groupby("zona")["dentro_poligono_real"]
        .value_counts(dropna=False)
        .unstack(fill_value=0)
    )
    print(resumen_poligono.to_string())

    print("\nAnalizando similitud de los que quedaron fuera del polígono (MCD robusto / k-NN de respaldo)...")
    df_limpio = marcar_similitud(df_limpio)
    fuera = df_limpio[df_limpio["dentro_poligono_real"] == False]  # noqa: E712
    if len(fuera) > 0:
        resumen_similitud = fuera.groupby("zona")["similar_a_zona"].value_counts(dropna=False).unstack(fill_value=0)
        print(resumen_similitud.to_string())
    else:
        print("  (ningun inmueble quedo fuera del poligono en esta corrida)")

    print("\nConstruyendo tabla final...")
    df_final = construir_tabla_final(df_limpio)

    print("Cruzando con el estado de seguimiento persistente (filtro arquitectónico, disponibilidad)...")
    df_final = cruzar_seguimiento(df_final, columna_url="link")
    print(f"  Requieren revisión todavía: {int(df_final['requiere_revision'].sum())} de {len(df_final)}")
    ya_resueltos = (~df_final["requiere_revision"]).sum()
    if ya_resueltos > 0:
        print(f"  Ya resueltos en corridas anteriores (no_pasa / no_disponible): {ya_resueltos}")

    print("Guardando serava_clean.db y serava_clean.csv...")
    guardar(df_final)

    print(f"\nListo. {len(df_final)} registros limpios guardados.")
    print("\nResumen final por zona:")
    resumen = (
        df_final.groupby(["ciudad", "zona", "moneda"])
        .agg(
            inmuebles=("precio_m2", "count"),
            mediana_precio_m2=("precio_m2", "median"),
            bajo_media=("bajo_media_zona", "sum"),
        )
        .reset_index()
    )
    print(resumen.to_string(index=False))


if __name__ == "__main__":
    main()
