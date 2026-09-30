"""
Finanzas automáticas de la ficha del predio.

QUÉ PROBLEMA RESUELVE (reunión del 28-sep-2026)
La consola ya deja armar y publicar la ficha, pero la pestaña Finanzas —unas
cuarenta cifras: TIR por escenario, renta, rango de arriendo, proyección año a
año, payback— había que escribirla a mano. Paola: «la creación de fichas ya
está, pero falta la parte financiera. ¿Cómo se logran estas tablas? ¿Con qué
datos?». Esto las calcula con el modelo de las fichas del evento, a partir de
unos pocos datos del predio, y las devuelve como PROPUESTA para el formulario.

CÓMO SE USA
`calcular_ficha(entradas)` → {"valores": {clave del esquema: cifra}, "resumen",
"avisos", "fuentes"}. No escribe nada en la base: la consola llena el formulario
y quien arma la ficha revisa, corrige y guarda o publica como siempre.

LO QUE HACE FALTA SABER DEL PREDIO
zona, tipo (Apartamento / Casa), área, precio publicado. Opcionales: precio
negociado (si no, publicado − 10 %), costo de remodelación por m² (si no, el de
su ciudad), administración mensual, si está dentro del polígono, rasgos únicos y
las valoraciones de arquitectura de la visita. Si la fotografía de mercado no
tiene arriendo o valor remodelado para el segmento, se pueden escribir a mano.

MÓDULOS
  mercado_referencia.json  fotografía de mercado por zona × tipo × tamaño
  macro.py                 CDT (Superfinanciera) e IPC (DANE/BanRep), en vivo
  modelo.py                el modelo financiero
  score.py, score_modelo.py, zonas_score.json   el Score Zequara de predio
  redactar.py              del resultado a los campos de la ficha
"""
from __future__ import annotations

import json
from pathlib import Path

from app.services.fichas import macro, modelo, redactar, score

AQUI = Path(__file__).resolve().parent
MERCADO = json.loads((AQUI / "mercado_referencia.json").read_text(encoding="utf-8"))


class DatosInsuficientes(ValueError):
    """Falta algo sin lo cual no hay cifras honestas que proponer."""


def zonas_disponibles() -> dict:
    """Qué zonas, tipos y tamaños tienen fotografía de mercado (para la consola)."""
    return {z: {"fecha": d["texto_fecha"], "con_antiguedad": d["con_antiguedad"],
                "tipos": {t: list(x["bandas"]) for t, x in d["tipos"].items()}}
            for z, d in MERCADO["zonas"].items()}


def _segmento(zona: str, tipo: str, area: float, avisos: list[str]) -> tuple[dict, dict, dict, str]:
    z = MERCADO["zonas"].get(zona)
    if not z:
        raise DatosInsuficientes(
            f"No hay fotografía de mercado para «{zona}». Zonas con datos: {', '.join(MERCADO['zonas'])}.")
    bd = modelo.banda(area)
    if bd is None:
        raise DatosInsuficientes(f"El área ({area:g} m²) está por debajo de 60 m²: no hay segmento de tamaño para ella.")
    t = z["tipos"].get(tipo)
    if not t or bd not in t["bandas"]:
        otro = next((k for k, x in z["tipos"].items() if k != tipo and bd in x["bandas"]), None)
        if not otro:
            raise DatosInsuficientes(
                f"No hay comparables de {tipo.lower()} de {modelo.ROTULO_BANDA[bd]} en {zona} en la fotografía de mercado.")
        avisos.append(f"No hay comparables de {tipo.lower()} de {modelo.ROTULO_BANDA[bd]} en {zona}: "
                      f"se usan los de {otro.lower()}. Revisar si es comparable.")
        t = z["tipos"][otro]
    return t["bandas"][bd], t, z, bd


def calcular_ficha(e: dict) -> dict:
    avisos: list[str] = []
    for k in ("zona", "tipo", "area", "publicado"):
        if not e.get(k):
            raise DatosInsuficientes(f"Falta «{k}» del predio para calcular las finanzas.")
    area, zona = float(e["area"]), e["zona"]
    seg, tipo_mercado, z, bd = _segmento(zona, e["tipo"], area, avisos)
    ciudad = e.get("ciudad") or z["ciudad"]

    # Lo que la fotografía puede no tener: arriendo y valor remodelado.
    canon = e.get("canon_m2")
    if not canon and not seg.get("arriendo"):
        raise DatosInsuficientes(
            f"La fotografía no tiene arriendos de {modelo.ROTULO_BANDA[bd]} en {zona}: escribe el canon por m² al mes.")
    valor_manual = None
    if e.get("valor_remodelado_m2"):
        b = float(e["valor_remodelado_m2"])
        # Con un solo número no hay percentiles: se abren ±10 % y se avisa.
        valor_manual = {"conservador": b * 0.9, "base": b, "alto": b * 1.1}
        avisos.append("Valor remodelado escrito a mano: los escenarios conservador y alto son ±10 % de ese valor.")

    cdt, ipc = macro.cdt(), macro.ipc()
    for nombre, d in (("CDT", cdt), ("IPC", ipc)):
        if d.get("origen") != "en vivo" and d.get("aviso"):
            avisos.append(f"{nombre}: no se pudo consultar en vivo ({d['origen']}). Dato del "
                          f"{d.get('fecha_hasta') or d.get('fecha')}.")

    predio = {"area": area, "publicado": float(e["publicado"]), "negociado": e.get("negociado"),
              "remodelacion_m2": e.get("remodelacion_m2"), "administracion": e.get("administracion"), "ciudad": ciudad}
    r = modelo.calcular(predio, seg, ipc["valor"], cdt["valor"], canon_m2=canon, valor_remodelado_m2=valor_manual)

    # ── Avisos que Paola tiene que ver antes de publicar ──────────────────
    if not e.get("negociado"):
        avisos.append(f"Precio negociado supuesto: publicado − 10 % ({redactar.M(r['costo']['negociado'])}). "
                      "Escribe el real si ya se negoció.")
    if not e.get("remodelacion_m2"):
        pendiente = " (PENDIENTE: arquitectura no ha dado el costo de obra de esta ciudad)" \
            if ciudad in modelo.REMODELACION_PENDIENTE else ""
        avisos.append(f"Remodelación supuesta de {redactar.M2(r['costo']['remodelacion_m2'])}/m²{pendiente}.")
    if not e.get("administracion"):
        avisos.append("Sin cuota de administración: el NOI no la descuenta. Escríbela si el anuncio la trae.")
    if not valor_manual and "todas las antigüedades" in seg["post_remodelacion"]["base_muestra"]:
        avisos.append(f"Valor remodelado con {seg['post_remodelacion']['base_muestra']}: puede subestimar lo que vale "
                      "el inmueble ya terminado.")
    if not canon and "todas las antigüedades" in seg["arriendo"]["base_muestra"]:
        avisos.append("Arriendo con todas las antigüedades (sin muestra remodelada suficiente).")
    if r["escenarios"]["base"]["tir"] < cdt["valor"]:
        avisos.append(f"La TIR base ({redactar.P(r['escenarios']['base']['tir'])}) queda por debajo del CDT "
                      f"({redactar.P(cdt['valor'])}).")

    # ── Score ────────────────────────────────────────────────────────────
    x = score.insumos(r, seg, tipo_mercado["area"], zona, area, rasgos=e.get("rasgos"),
                      factores=e.get("factores"), gates=e.get("gates"), dentro_poligono=e.get("dentro_poligono"))
    r["score"] = score.calcular(x) if x else None
    if not x:
        avisos.append(f"Sin notas de zona para {zona}: el Score Zequara no se calcula (se deja en blanco).")
    else:
        if x["zona_origen"] != "oficial":
            avisos.append(f"Las notas de zona de {zona} son estimadas: validarlas con el agente de Score de Zonas.")
        if r["score"]["estado_gates"] != "OK":
            avisos.append(f"Score: {r['score']['estado_gates']}.")

    r["mercado"] = {"segmento": seg, "texto_fecha": z["texto_fecha"], "fuente": z["fuente"]}
    textos = {
        "area": area, "tipo": e["tipo"], "zona": zona, "banda_rotulo": modelo.ROTULO_BANDA[bd],
        "cdt_fuente": (f"promedio ponderado de {cdt['bancos']} bancos, "
                       f"{macro.texto_rango(cdt['fecha_desde'], cdt['fecha_hasta'])}; Superintendencia Financiera"),
        "ipc_fuente": f"DANE, {macro.texto_mes(ipc['fecha'])}",
    }
    esc = r["escenarios"]
    return {
        "valores": redactar.campos(r, textos),
        "resumen": {
            "allin": r["costo"]["allin"], "tir": {k: esc[k]["tir"] for k in esc}, "multiplo": esc["base"]["multiplo"],
            "renta_mensual": r["renta"]["mensual"], "yield": r["renta"]["yield_"],
            "score": r["score"]["score"] if r["score"] else None,
            "prioridad": r["score"]["prioridad_publica"] if r["score"] else None,
            "segmento": f"{zona} · {e['tipo']} · {modelo.ROTULO_BANDA[bd]}",
        },
        "avisos": avisos,
        "fuentes": {
            "mercado": f"{z['fuente']}. Venta: {seg['venta']['n']} anuncios; arriendo: "
                       f"{(seg.get('arriendo') or {}).get('n', 0)} anuncios.",
            "cdt": f"{redactar.P(cdt['valor'])} E.A. · {textos['cdt_fuente']} · {cdt.get('origen')}",
            "ipc": f"{redactar.P(ipc['valor'])} · {textos['ipc_fuente']} · {ipc.get('origen')}",
        },
    }
