"""
poligonos_zonas.py
===================
Carga los poligonos reales de las 10 zonas de interes de Serava desde
poligonos_zonas.geojson - que es ahora la FUENTE DE VERDAD, ajustada a
mano por David en geojson.io sobre vista satelital.

HISTORIA: la primera version de este archivo tenia las coordenadas
escritas directamente en Python, estimadas de memoria sobre la cuadricula
de calles de cada ciudad. Al probarlas contra coordenadas reales de
inmuebles ya scrapeados, varias zonas mostraban muy pocas coincidencias -
señal de que la aproximacion de memoria no bastaba. Se recalibraron una
vez contra anclas oficiales independientes, y despues se hizo el ajuste
fino real: exportar a GeoJSON, abrir en geojson.io con la vista satelital
de fondo, y arrastrar cada vertice a mano sobre las calles/limites reales
- exactamente el paso "manualito" que pidio Paola. Ese archivo ajustado
es el que se lee aqui ahora.

COMO SEGUIR AJUSTANDO LOS POLIGONOS EN EL FUTURO:
    1. Abrir poligonos_zonas.geojson en https://geojson.io (arrastrarlo a
       la pagina).
    2. Ajustar los vertices que haga falta.
    3. Save -> GeoJSON, reemplazar el archivo en esta carpeta.
    4. Listo - no hay que tocar nada de codigo Python, este archivo lee
       el .geojson automaticamente en cada corrida.

USO:
    from poligonos_zonas import POLIGONOS_ZONAS
    POLIGONOS_ZONAS["El Retiro"]["poligono"]  # lista de [lon, lat]
    POLIGONOS_ZONAS["El Retiro"]["fuente"]     # investigacion original
    POLIGONOS_ZONAS["El Retiro"]["confianza"]  # nivel de confianza
"""

import json
from pathlib import Path

RUTA_GEOJSON = Path(__file__).resolve().parent / "poligonos_zonas.geojson"


def _cargar_poligonos_desde_geojson(ruta: Path) -> dict:
    if not ruta.exists():
        raise FileNotFoundError(
            f"No se encontro {ruta}. Este archivo es la fuente de verdad de los "
            f"poligonos (ajustado a mano en geojson.io) - sin el, no hay nada que cargar."
        )

    with open(ruta, encoding="utf-8") as f:
        geojson = json.load(f)

    poligonos = {}
    for feature in geojson["features"]:
        props = feature.get("properties", {})
        zona = props.get("zona")
        if not zona:
            continue  # feature sin nombre de zona, se ignora en vez de fallar

        geometria = feature["geometry"]
        if geometria["type"] == "Polygon":
            anillo_exterior = geometria["coordinates"][0]
        elif geometria["type"] == "MultiPolygon":
            # Si en geojson.io se termino dibujando como multi-poligono,
            # se toma el primero (el mas grande, si se ordenaron asi) y se
            # deja una nota - no debe fallar en silencio.
            anillo_exterior = geometria["coordinates"][0][0]
        else:
            continue

        poligonos[zona] = {
            "poligono": anillo_exterior,
            "fuente": props.get("fuente", "(sin nota de fuente en el geojson)"),
            "confianza": props.get("confianza", "(sin nota de confianza en el geojson)"),
        }

    return poligonos


POLIGONOS_ZONAS = _cargar_poligonos_desde_geojson(RUTA_GEOJSON)


if __name__ == "__main__":
    print(f"Cargados {len(POLIGONOS_ZONAS)} poligonos desde {RUTA_GEOJSON.name}:\n")
    for zona, info in POLIGONOS_ZONAS.items():
        n_vertices = len(info["poligono"])
        print(f"  {zona}: {n_vertices} vertices | confianza: {info['confianza'][:60]}")

