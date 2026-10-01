"""
api/diagnostico.py
==================
El diagnóstico del inversionista: donde se guarda lo que la persona responde
y deja como datos de contacto.

    POST /api/diagnostico          guarda una solicitud (público, sin sesión)
    GET  /api/admin/diagnostico    las últimas solicitudes (consola, con sesión)

QUÉ PROBLEMA RESUELVE (checkpoint del 30-sep-2026)
    El diagnóstico de la portada y el formulario de solicitud de acceso no
    guardaban nada: el primero mostraba un resultado fijo y el segundo abría
    una confirmación sin enviar nada. Las personas que dejaban su correo y su
    WhatsApp se perdían. Ahora los dos son UN solo flujo (el diagnóstico
    termina en el registro) y lo que se envía queda en `solicitudes_acceso`.

EL RESULTADO LO CALCULA EL FRONTEND, Y AQUÍ SE GUARDA TAL CUAL
    La lógica vive en `frontend/lib/diagnostico.ts`, una sola vez. Aquí se
    guardan las respuestas (los índices de cada opción) junto con la versión
    del cuestionario, así que el resultado siempre se puede recalcular. Alguien
    podría mandar un resultado inventado: lo peor que consigue es salir con
    otra prioridad en la lista del equipo, que de todas formas lo revisa a mano.

DATOS PERSONALES (Ley 1581 de 2012)
    Sin consentimiento no se guarda nada: el endpoint lo exige y deja la hora y
    el texto exacto que la persona aceptó. No se guarda la IP. Los topes de
    peticiones por IP de `core/limites.py` aplican como a todo lo público.
"""

import json
import re
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field, field_validator

from app.core.database import cursor, escribir, tabla_existe

router_publico = APIRouter()
router_admin = APIRouter()

TABLA = "solicitudes_acceso"
CORREO = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
LIMITE_JSON = 20_000  # el resultado ocupa ~2 KB; esto corta cualquier relleno


class Contacto(BaseModel):
    # Sin `min_length`: pydantic respondería en inglés («String should have at
    # least 7 characters») y la persona lo leería tal cual. Los mínimos van en
    # los validadores de abajo, con su mensaje en español.
    nombre: str = Field(max_length=80)
    apellido: str = Field(default="", max_length=80)
    correo: str = Field(max_length=160)
    whatsapp: str = Field(max_length=30)
    ciudad: str = Field(default="", max_length=80)
    pais: str = Field(max_length=60)

    @field_validator("nombre", "pais")
    @classmethod
    def no_vacio(cls, v: str, info) -> str:
        if not v.strip():
            raise ValueError(f"Falta {'tu nombre' if info.field_name == 'nombre' else 'tu país'}.")
        return v.strip()

    @field_validator("correo")
    @classmethod
    def correo_valido(cls, v: str) -> str:
        v = v.strip().lower()
        if not CORREO.match(v):
            raise ValueError("El correo no parece válido.")
        return v

    @field_validator("whatsapp")
    @classmethod
    def telefono_valido(cls, v: str) -> str:
        if sum(c.isdigit() for c in v) < 7:
            raise ValueError("El WhatsApp necesita al menos 7 dígitos.")
        return v.strip()


class Solicitud(BaseModel):
    version: str = Field(min_length=1, max_length=20)
    respuestas: list = Field(min_length=1, max_length=30)
    resultado: dict
    contacto: Contacto
    consentimiento: bool
    consentimiento_texto: str = Field(min_length=10, max_length=600)
    origen: str = Field(default="web", max_length=60)


@router_publico.post("")
def guardar(s: Solicitud):
    if not s.consentimiento:
        raise HTTPException(400, "Para enviar tu solicitud necesitamos tu autorización para tratar tus datos.")
    if len(json.dumps(s.resultado)) > LIMITE_JSON or len(json.dumps(s.respuestas)) > LIMITE_JSON:
        raise HTTPException(413, "La solicitud es demasiado grande.")
    if not tabla_existe(TABLA):
        # Falta correr database/schema.sql en la base. Se dice claro en vez de un 500.
        raise HTTPException(503, "Todavía no podemos registrar solicitudes. Escríbenos y te contactamos.")

    r, c = s.resultado, s.contacto
    ahora = datetime.now(timezone.utc)
    with escribir() as con:
        fila = con.execute(
            f"""INSERT INTO {TABLA}
                   (creado_en, version, respuestas, resultado, perfil, riesgo, compatibilidad, prioridad,
                    nombre, apellido, correo, whatsapp, ciudad, pais,
                    consentimiento_en, consentimiento_texto, origen)
               VALUES (?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               RETURNING id""",
            (ahora, s.version, json.dumps(s.respuestas), json.dumps(r, ensure_ascii=False),
             str(r.get("perfil", ""))[:30], str(r.get("riesgo", ""))[:20],
             _entero(r.get("compatibilidad")), str(r.get("prioridad", ""))[:10],
             c.nombre.strip(), c.apellido.strip(), c.correo, c.whatsapp, c.ciudad.strip(), c.pais.strip(),
             ahora, s.consentimiento_texto, s.origen),
        ).fetchone()
    # Las filas son diccionarios (RealDictCursor en db_admin): por nombre, no por posición.
    return {"ok": True, "id": fila["id"] if fila else None}


def _entero(v):
    try:
        return max(0, min(100, int(v)))
    except (TypeError, ValueError):
        return None


@router_admin.get("")
def listar(limite: int = Query(200, ge=1, le=1000)):
    """Las últimas solicitudes, para que el equipo las vea y contacte."""
    if not tabla_existe(TABLA):
        return {"filas": [], "lista": False}
    with cursor() as con:
        filas = con.execute(
            f"""SELECT id, creado_en, nombre, apellido, correo, whatsapp, ciudad, pais,
                       perfil, riesgo, compatibilidad, prioridad, origen
                  FROM {TABLA} ORDER BY creado_en DESC LIMIT ?""",
            (limite,),
        ).fetchall()
    return {"filas": [dict(f) | {"creado_en": f["creado_en"].isoformat()} for f in filas], "lista": True}
