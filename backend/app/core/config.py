"""
core/config.py
==============
Configuración del backend, leída del entorno. Nada de esto va en código.

Se lee una sola vez al arrancar. Si falta algo que no tiene valor por
defecto razonable, el proceso NO arranca: es mejor que falle al levantar,
donde se ve, que a la primera petición de un usuario.

Variables (ver backend/.env.example):
    DATABASE_URL      cadena de Postgres (Supabase). Obligatoria.
    SESION_HORAS      duración de la sesión. Por defecto 12, que cubre una
                      jornada sin obligar a entrar dos veces.
    CORS_ORIGINS      lista separada por comas de los dominios que pueden
                      llamar a la API. Por defecto sólo el localhost del
                      frontend en desarrollo.
    METROCUADRADO_API_KEY  llave del portal, para el scraping.
"""

import os

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
# Ya no hay ningún secreto que configurar, y eso es la mitad del asunto: la
# sesión es un identificador al azar cuyo estado vive en la tabla `sesiones`
# (ver core/sesiones.py). Aquí hubo un JWT_SECRET mientras la sesión fue un
# token firmado; al pasar a sesiones con estado, el token dejó de usarse y el
# secreto sólo servía para avisar de que faltaba algo que ya no hacía falta.
SESION_HORAS = int(os.environ.get("SESION_HORAS", "12"))


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


# --- documentación interactiva ---------------------------------------------
# `/docs`, `/redoc` y `/openapi.json` son cómodos mientras se desarrolla y un
# regalo para quien husmee en producción: publican las 24 rutas, qué recibe
# cada una y con qué forma. No filtran credenciales, pero entregan el mapa
# completo de una API que sólo usa el equipo.
#
# Cerradas salvo que se pidan a propósito. En local se pone DOCS_ABIERTAS=1
# en backend/.env; en el proveedor, no se pone.
DOCS_ABIERTAS = os.environ.get("DOCS_ABIERTAS", "").strip() in ("1", "true", "sí", "si")


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
