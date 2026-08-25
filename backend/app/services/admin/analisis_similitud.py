"""
analisis_similitud.py
======================
Implementa la idea que a Paola le gusto en la reunion de revision: para
los predios que el scraping SI trajo pero que quedaron marcados como
"fuera del poligono real" de su zona (dentro_poligono_real = False), en
vez de descartarlos sin mas, se compara que tan PARECIDOS son (precio/m2,
area, habitaciones, banos) a los predios que si estan confirmados dentro
del poligono. Si son muy parecidos, es una senal de que probablemente si
son parte real del mercado de la zona, aunque el limite administrativo
del barrio los deje un poco afuera.

METODO Y POR QUE (respuesta a la preocupacion de David sobre atipicos):
    La distancia de Mahalanobis clasica usa el promedio y la covarianza
    de TODO el grupo de referencia - y ambos son sensibles a atipicos: un
    solo predio con un precio raro puede desviar el promedio e inflar la
    covarianza, "enmascarando" otros atipicos y distorsionando las
    distancias de todos los demas.

    Solucion aplicada aqui, en dos capas de defensa:
    1. El grupo de referencia de cada zona excluye de entrada los predios
       ya marcados como atipicos por el pipeline de limpieza
       (precio_m2_clasificacion != "normal").
    2. Sobre lo que queda, se usa MCD (Minimum Covariance Determinant,
       sklearn.covariance.MinCovDet) en vez del promedio/covarianza
       clasicos: MCD busca el nucleo mas compacto de puntos y calcula el
       promedio/covarianza SOLO sobre ese nucleo, ignorando automaticamente
       cualquier atipico que se haya colado.

    Si una zona no tiene muestra suficiente para que MCD tenga sentido
    (regla practica: al menos 5 veces el numero de variables usadas), se
    cae a un metodo mas simple que no asume ninguna distribucion:
    distancia promedio a los k vecinos mas cercanos (k-NN) dentro del
    grupo de referencia, en variables estandarizadas de forma robusta.

    En cualquier caso: esto NUNCA decide solo. Se marca como CANDIDATO
    (similar_a_zona = True/False/None), para que el equipo de arquitectura
    lo revise - mismo principio de todo el proyecto.

USO:
    from analisis_similitud import marcar_similitud
    df = marcar_similitud(df)  # requiere columnas: zona, dentro_poligono_real,
                                 # precio_m2_clasificacion, precio_m2, area_m2,
                                 # habitaciones, banos
"""

import numpy as np
import pandas as pd
from scipy.stats import chi2
from sklearn.covariance import MinCovDet
from sklearn.preprocessing import RobustScaler
from sklearn.neighbors import NearestNeighbors

COLUMNAS_SIMILITUD = ["precio_m2", "area_m2", "habitaciones", "banos"]
MIN_MUESTRA_POR_VARIABLE = 5  # regla practica para que MCD tenga sentido
PERCENTIL_UMBRAL_CHI2 = 0.975  # que tan estricto es "suficientemente parecido"
K_VECINOS_RESPALDO = 3


def _preparar_datos(df_zona: pd.DataFrame, columnas: list[str]):
    datos = df_zona[columnas].apply(pd.to_numeric, errors="coerce")
    filas_validas = datos.dropna()
    return filas_validas


def _evaluar_con_mcd(referencia: pd.DataFrame, candidatos: pd.DataFrame, columnas: list[str]):
    """Metodo principal: Mahalanobis robusto via MCD. Devuelve (distancias, umbral, es_similar)."""
    escalador = RobustScaler().fit(referencia)
    ref_escalada = escalador.transform(referencia)
    cand_escalados = escalador.transform(candidatos[columnas])

    mcd = MinCovDet(random_state=42).fit(ref_escalada)
    distancias = np.sqrt(mcd.mahalanobis(cand_escalados))

    umbral = np.sqrt(chi2.ppf(PERCENTIL_UMBRAL_CHI2, df=len(columnas)))
    return distancias, umbral, distancias <= umbral


def _evaluar_con_knn(referencia: pd.DataFrame, candidatos: pd.DataFrame, columnas: list[str], k: int):
    """Metodo de respaldo para zonas con poca muestra: distancia promedio a
    los k vecinos mas cercanos del grupo de referencia, sin asumir ninguna
    distribucion. El umbral se define como 1.5x la distancia promedio
    interna del propio grupo de referencia entre si (que tan dispersos son
    los predios "normales" entre ellos mismos)."""
    escalador = RobustScaler().fit(referencia)
    ref_escalada = escalador.transform(referencia)
    cand_escalados = escalador.transform(candidatos[columnas])

    k_efectivo = min(k, len(referencia))
    vecinos = NearestNeighbors(n_neighbors=k_efectivo).fit(ref_escalada)

    distancias_cand, _ = vecinos.kneighbors(cand_escalados)
    distancias = distancias_cand.mean(axis=1)

    # dispersion interna del grupo de referencia (cada punto contra sus
    # propios vecinos, sin contarse a si mismo)
    if len(referencia) > k_efectivo:
        dist_internas, _ = vecinos.kneighbors(ref_escalada, n_neighbors=k_efectivo + 1)
        dispersión_interna = dist_internas[:, 1:].mean()
    else:
        dispersión_interna = distancias.mean()

    umbral = 1.5 * dispersión_interna
    return distancias, umbral, distancias <= umbral


def marcar_similitud(
    df: pd.DataFrame,
    columnas: list[str] = None,
    min_muestra_por_variable: int = MIN_MUESTRA_POR_VARIABLE,
) -> pd.DataFrame:
    columnas = columnas or COLUMNAS_SIMILITUD
    df = df.copy()
    df["distancia_similitud"] = np.nan
    df["metodo_similitud"] = None
    df["similar_a_zona"] = pd.array([None] * len(df), dtype="boolean")

    for zona, df_zona in df.groupby("zona"):
        idx_candidatos = df_zona.index[df_zona["dentro_poligono_real"] == False]  # noqa: E712
        if len(idx_candidatos) == 0:
            continue  # nada que evaluar en esta zona

        idx_referencia = df_zona.index[
            (df_zona["dentro_poligono_real"] == True)  # noqa: E712
            & (df_zona["precio_m2_clasificacion"] == "normal")
        ]

        referencia = _preparar_datos(df.loc[idx_referencia], columnas)
        candidatos_todos = df.loc[idx_candidatos]
        candidatos_validos = _preparar_datos(candidatos_todos, columnas)

        if len(candidatos_validos) == 0:
            continue

        minimo_necesario = min_muestra_por_variable * len(columnas)

        if len(referencia) >= minimo_necesario:
            distancias, umbral, es_similar = _evaluar_con_mcd(referencia, candidatos_validos, columnas)
            metodo = "mcd_robusto"
        elif len(referencia) >= 2:
            distancias, umbral, es_similar = _evaluar_con_knn(referencia, candidatos_validos, columnas, K_VECINOS_RESPALDO)
            metodo = "knn_respaldo"
        else:
            # Ni siquiera hay 2 predios de referencia (ej. Getsemani) - no
            # hay con que comparar. Se deja explicitamente sin evaluar, no
            # se inventa un resultado.
            continue

        df.loc[candidatos_validos.index, "distancia_similitud"] = distancias
        df.loc[candidatos_validos.index, "metodo_similitud"] = metodo
        df.loc[candidatos_validos.index, "similar_a_zona"] = es_similar

    return df


if __name__ == "__main__":
    df = pd.read_csv("serava_clean_con_poligono.csv")
    df = marcar_similitud(df)

    print("=== Metodo usado por zona ===")
    print(df[df["dentro_poligono_real"] == False].groupby("zona")["metodo_similitud"].value_counts(dropna=False))

    print("\n=== Candidatos por similitud (entre los que quedaron fuera del poligono) ===")
    resumen = (
        df[df["dentro_poligono_real"] == False]
        .groupby("zona")["similar_a_zona"]
        .value_counts(dropna=False)
        .unstack(fill_value=0)
    )
    print(resumen)

    df.to_csv("serava_clean_con_similitud.csv", index=False)
    print("\nGuardado: serava_clean_con_similitud.csv")
