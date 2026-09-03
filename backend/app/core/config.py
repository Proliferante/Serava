"""
core/config.py
==============
Configuración del backend, leída del entorno. Nada de esto va en código.

Se lee una sola vez al arrancar. Si falta algo que no tiene valor por
defecto razonable, el proceso NO arranca: es mejor que falle al levantar,
donde se ve, que a la primera petición de un usuario.

Variables (ver backend/.env.example):
    DATABASE_URL      cadena de Postgres (Supabase). Obligatoria.
    JWT_SECRET        secreto para firmar los tokens de sesión. Obligatoria
                      en producción; en desarrollo se genera una al azar y
                      se avisa —así nadie despliega con la de ejemplo—.
    JWT_HORAS         duración de la sesión. Por defecto 12, que cubre una
                      jornada sin obligar a entrar dos veces.
    CORS_ORIGINS      lista separada por comas de los dominios que pueden
                      llamar a la API. Por defecto sólo el localhost del
                      frontend en desarrollo.
    METROCUADRADO_API_KEY  llave del portal, para el scraping.
"""

import os
import secrets
import warnings

from dotenv import load_dotenv

load_dotenv()


def _obligatoria(nombre: str) -> str:
    valor = os.environ.get(nombre, "").strip()
    if not valor:
        raise RuntimeError(
            f"Falta la variable de entorno {nombre}. Copia backend/.env.example "
            f"a backend/.env y complétala."
        )
    return valor


# --- base de datos ---------------------------------------------------------
# No se valida al importar: el pipeline (db_admin) ya lanza su propio error
# claro cuando falta, y así los scripts sueltos siguen funcionando igual.
DATABASE_URL = os.environ.get("DATABASE_URL", "").strip()


# --- sesiones --------------------------------------------------------------
JWT_ALGORITMO = "HS256"
JWT_HORAS = int(os.environ.get("JWT_HORAS", "12"))

_secreto = os.environ.get("JWT_SECRET", "").strip()
if not _secreto:
    # En desarrollo se genera una al azar para no obligar a configurar nada.
    # El efecto de lado es deliberado: al reiniciar el servidor todas las
    # sesiones caducan, que es exactamente lo que debe pasar si no hay
    # secreto fijo. En producción hay que definirla.
    _secreto = secrets.token_urlsafe(48)
    warnings.warn(
        "JWT_SECRET no está definida: se generó una al azar para esta "
        "ejecución. Las sesiones se invalidan al reiniciar. Define "
        "JWT_SECRET antes de desplegar.",
        stacklevel=2,
    )
JWT_SECRET = _secreto


# --- CORS ------------------------------------------------------------------
# Por defecto sólo el frontend en desarrollo. Al desplegar hay que poner el
# dominio real: `CORS_ORIGINS=https://panel.zequara.com`. Nunca "*" con
# credenciales, que es lo que hacía antes este backend.
CORS_ORIGINS = [
    o.strip() for o in os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",") if o.strip()
]


# --- cookie de sesión ------------------------------------------------------
# `Secure` hace que el navegador sólo mande la cookie por HTTPS. En localhost
# hay que dejarlo apagado o no se puede entrar: la página va por http y el
# navegador se guardaría la cookie sin mandarla nunca.
#
# AL DESPLEGAR: COOKIE_SEGURA=1. Sin eso, la sesión viaja en claro y cualquiera
# en la misma red puede quedársela.
COOKIE_SEGURA = os.environ.get("COOKIE_SEGURA", "").strip() in ("1", "true", "sí", "si")


# --- scraping --------------------------------------------------------------
METROCUADRADO_API_KEY = os.environ.get("METROCUADRADO_API_KEY", "").strip()


# --- roles -----------------------------------------------------------------
# Los cuatro del equipo. `admin` es el único que crea usuarios.
ROLES = ("admin", "arquitectura", "data", "comercial")


# --- política de contraseñas -----------------------------------------------
# Doce y no ocho. Ocho caracteres es el mínimo que se repite por costumbre
# desde hace treinta años y hoy no aguanta nada; para seis cuentas que dan
# acceso a toda la operación, doce cuesta lo mismo de escribir.
#
# No se exige "una mayúscula, un número y un símbolo": esa regla produce
# `Password1!` y poco más. Lo que sí se comprueba (ver auth_service) es que la
# contraseña no sea una de las obvias ni contenga el propio correo o nombre,
# que es de donde salen de verdad las contraseñas que se adivinan.
CLAVE_MINIMA = 12

# Las que no se aceptan por evidentes. Lista corta a propósito: no pretende
# ser un diccionario, sólo atajar lo que alguien escribiría con prisa.
CLAVES_PROHIBIDAS = {
    "contrasena", "contraseña", "password", "passw0rd", "123456", "12345678",
    "123456789", "1234567890", "qwerty", "abc123", "iloveyou", "admin",
    "administrador", "zequara", "zequora", "proliferante", "bienvenido",
    "welcome", "cambiame", "temporal", "secreto", "letmein",
}
