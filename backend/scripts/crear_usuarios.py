"""
scripts/crear_usuarios.py
=========================
Siembra los usuarios internos del equipo.

    cd backend
    python -m scripts.crear_usuarios

Cada uno entra con la contraseña que este script imprime al correrlo, y la
puede cambiar cuando quiera desde el menú lateral de la consola.

AQUÍ NO HAY NINGUNA CONTRASEÑA ESCRITA, Y ESO ES EL PUNTO
    Las hubo: seis, en la lista `EQUIPO`, con nombre y apellido al lado.
    Acabaron publicadas en GitHub en un repositorio público y legibles por
    cualquiera, porque una contraseña escrita en un archivo del repo va donde
    va el repo. El acceso completo a la consola interna estuvo a un clic de
    distancia de quien diera con la URL.

    Ahora se generan en memoria al correr el script, se guarda su hash bcrypt
    y se imprimen una vez en la terminal. Nada toca el disco.

    Para reponer la contraseña de alguien que ya existe, esto no es la
    herramienta: es `scripts/rotar_claves.py`.

OPCIONES
    --reiniciar       a los que ya existan les pone contraseña nueva. Sin
                      esto, los existentes se saltan y se avisa.
    --exigir-cambio   además, la consola les pide cambiarla al entrar.
    --clave X         la misma X para todos. Para una demo controlada; no
                      para producción, y no se escribe en ningún sitio.
"""

import argparse
import sys

# La consola de Windows viene en cp1252, que no puede escribir ni "ñ" ni los
# caracteres de dibujo. Sin esto, el script CREA los usuarios y luego revienta
# al imprimir el resumen — con las contraseñas ya generadas y perdidas, que es
# la peor forma posible de fallar. Se fuerza UTF-8 en la salida, y el separador
# de abajo va en ASCII por si algún terminal tampoco lo acepta.
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.core import config, security
from app.core.database import escribir, tabla_existe
from app.services import auth_service as svc

# Los seis del equipo, con el rol acordado. Los correos van en minúsculas
# porque así se guardan y así se comparan al entrar: da igual cómo se
# escriban al teclear.
#
# El patrón es `nombre.inicial@dominio` — paola.a, nati.c, david.c. Laura y
# David estaban sin el punto (`laurap`, `davidc`) y eran los dos únicos: un
# correo que no sigue el patrón del resto se teclea mal la primera vez, y
# aquí el correo ES la identidad para entrar.
# Quién es quién. SIN contraseña: la pone `auth_service.generar_clave()` al
# correr, y sale por pantalla. Ver el encabezado del archivo para el porqué.
EQUIPO = [
    ("Christian Mejía",  "christian.mejia@zequara.com", "arquitectura"),
    ("Laura P.",         "laura.p@proliferante.com",    "comercial"),
    ("David C.",         "david.c@proliferante.com",    "data"),
    ("Paola A.",         "paola.a@proliferante.com",    "admin"),
    ("Nati C.",          "nati.c@proliferante.com",     "admin"),
    ("Jesús A.",         "jesus.a@proliferante.com",    "admin"),
    ("Natalia Gonzalez", "nata.g@proliferante.com",     "admin"),
]


def main() -> int:
    ap = argparse.ArgumentParser(description="Crea los usuarios internos del equipo.")
    ap.add_argument("--reiniciar", action="store_true",
                    help="pone contraseña nueva a los que ya existan")
    ap.add_argument("--exigir-cambio", action="store_true",
                    help="pedirles que la cambien al entrar")
    ap.add_argument("--clave", default=None,
                    help="usa esta contraseña para todos (demo; no producción)")
    args = ap.parse_args()

    if not config.DATABASE_URL:
        print("ERROR: falta DATABASE_URL. Copia backend/.env.example a "
              "backend/.env y complétalo.", file=sys.stderr)
        return 1

    if not tabla_existe("usuarios"):
        print("ERROR: no existe la tabla `usuarios`. Aplica primero el esquema:\n"
              '  psql "$DATABASE_URL" -f ../database/schema.sql\n'
              "(o pega database/schema.sql en el editor SQL de Supabase)",
              file=sys.stderr)
        return 1

    if args.clave and len(args.clave) < 8:
        print("ERROR: --clave debe tener al menos 8 caracteres.", file=sys.stderr)
        return 1

    forzar_cambio = args.exigir_cambio

    resultados = []
    for nombre, correo, rol in EQUIPO:
        clave = args.clave or svc.generar_clave(correo, nombre)
        existente = svc.por_correo(correo)

        if existente and not args.reiniciar:
            resultados.append((correo, rol, None, "ya existía, sin tocar"))
            continue

        if existente:
            with escribir() as con:
                con.execute(
                    "UPDATE usuarios SET clave_hash = ?, rol = ?, nombre = ?, "
                    "activo = TRUE, debe_cambiar_clave = ? WHERE id = ?",
                    (security.hashear(clave), rol, nombre, forzar_cambio, existente["id"]),
                )
            resultados.append((correo, rol, clave, "contraseña reiniciada"))
            continue

        try:
            svc.crear(nombre, correo, rol, clave, debe_cambiar_clave=forzar_cambio)
            resultados.append((correo, rol, clave, "creado"))
        except svc.ErrorAuth as e:
            resultados.append((correo, rol, None, f"ERROR: {e}"))

    ancho = max(len(c) for _, c, _ in EQUIPO) + 2
    print()
    print("  CONTRASEÑAS DE ACCESO" + (" (temporales, se piden cambiar al entrar)"
                                       if forzar_cambio else ""))
    print("  " + "-" * (ancho + 44))
    for correo, rol, clave, nota in resultados:
        print(f"  {correo:<{ancho}} {rol:<13} {clave or '-':<15} {nota}")
    print("  " + "-" * (ancho + 44))
    if forzar_cambio:
        print("  Repártelas por un canal privado. Al entrar, cada quien tiene que")
        print("  cambiarla antes de poder trabajar.")
    else:
        print("  Repártelas por un canal privado. Cada quien puede cambiarla desde")
        print("  el menú lateral de la consola, en \"Cambiar contraseña\".")
    print()

    fallos = [r for r in resultados if r[3].startswith("ERROR")]
    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
