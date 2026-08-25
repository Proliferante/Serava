"""
validar_poligono.py
====================
Aplica la capa de validacion geografica que se discutio en el diseno de
arquitectura: usa el poligono real de cada zona (poligonos_zonas.py) para
confirmar si un inmueble, segun su latitud/longitud, cae de verdad dentro
del limite real de su zona - o si solo quedo ahi por el filtro de texto
del portal (en_scope_zona).

QUE HACE Y QUE NO HACE:
    - SI marca cada inmueble con "dentro_poligono_real": True / False / None.
    - NO elimina ningun registro. Nunca. El equipo de arquitectura puede
      seguir viendo los que quedan fuera si les interesan (ver la idea de
      Paola/David sobre analisis de similitud para los que caen "cerca"
      del poligono, pendiente como tarea aparte).
    - Solo puede evaluar inmuebles que tengan latitud/longitud. Hoy eso
      cubre las 7 zonas de Colombia (Metrocuadrado trae coordenadas). Las
      3 zonas de Panama (Encuentra24) no tienen coordenadas en esta
      extraccion todavia, asi que quedan con dentro_poligono_real = None
      hasta que se resuelva eso (geocodificacion pendiente, tarea aparte).

USO:
    from validar_poligono import marcar_dentro_poligono
    df = marcar_dentro_poligono(df)  # df debe tener columnas zona, latitud, longitud
"""

from shapely.geometry import Point, Polygon
import math

from .poligonos_zonas import POLIGONOS_ZONAS

_POLIGONOS_SHAPELY = {
    zona: Polygon(info["poligono"]) for zona, info in POLIGONOS_ZONAS.items()
}


def _es_nulo(valor) -> bool:
    """True para None, NaN de pandas/numpy, o 0.0 exacto (coordenada
    placeholder invalida - se confirmo con datos reales que existen
    varios registros con latitud=0, longitud=0, que no es una coordenada
    real en ninguna de las 10 zonas)."""
    if valor is None:
        return True
    try:
        return math.isnan(float(valor)) or float(valor) == 0.0
    except (TypeError, ValueError):
        return True


def esta_dentro_del_poligono(zona: str, latitud, longitud) -> bool | None:
    """
    Devuelve True/False si se puede evaluar, o None si falta el poligono
    de esa zona o falta/es invalida la coordenada del inmueble (nunca se
    asume nada en esos casos, se deja explicitamente sin evaluar).
    """
    if zona not in _POLIGONOS_SHAPELY:
        return None
    if _es_nulo(latitud) or _es_nulo(longitud):
        return None

    punto = Point(float(longitud), float(latitud))
    return _POLIGONOS_SHAPELY[zona].contains(punto)


def marcar_dentro_poligono(df):
    """Agrega la columna 'dentro_poligono_real' a un DataFrame con
    columnas 'zona', 'latitud', 'longitud'."""
    df = df.copy()
    df["dentro_poligono_real"] = df.apply(
        lambda fila: esta_dentro_del_poligono(fila["zona"], fila.get("latitud"), fila.get("longitud")),
        axis=1,
    )
    return df


if __name__ == "__main__":
    import pandas as pd

    df = pd.read_csv("serava_clean.csv")
    df = marcar_dentro_poligono(df)

    print("=== Resultado de la validacion contra el poligono real, por zona ===")
    resumen = (
        df.groupby("zona")["dentro_poligono_real"]
        .value_counts(dropna=False)
        .unstack(fill_value=0)
    )
    print(resumen)

    df.to_csv("serava_clean_con_poligono.csv", index=False)
    print("\nGuardado: serava_clean_con_poligono.csv")
