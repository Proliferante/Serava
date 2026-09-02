"""
scripts/crear_usuarios.py
=========================
Siembra los usuarios internos del equipo con una contraseña temporal.

    cd backend
    python -m scripts.crear_usuarios

Cada usuario se crea con `debe_cambiar_clave = True`: al entrar por primera
vez la consola le pide cambiarla antes de dejarlo trabajar. Por eso la
contraseña que imprime este script es temporal y de un solo uso.

POR QUÉ SE IMPRIMEN Y NO SE GUARDAN EN NINGÚN ARCHIVO
    Las contraseñas se generan al azar aquí y se muestran UNA VEZ en la
    consola. No se escriben en el repositorio, ni en un .env, ni en la base
    (allí sólo va el hash bcrypt). Si se pierden antes de repartirlas, se
    vuelve a correr el script con --reiniciar y se generan otras.

    Repártelas por un canal privado y de una en una. Cualquiera que las vea
    puede entrar hasta que su dueño la cambie.

OPCIONES
    --reiniciar   a los usuarios que ya existan les pone contraseña nueva y
                  vuelve a exigir el cambio. Sin esto, los existentes se
                  saltan y se avisa.
    --clave X     usa la misma contraseña X para todos en vez de generarlas
                  al azar. Para una demo controlada; no para producción.
"""

import argparse
import secrets
import string
import sys

from app.core import config, security
from app.core.database import escribir, tabla_existe
from app.services import auth_service as svc

# Los seis del equipo, con el rol acordado. Los correos van en minúsculas
# porque así se guardan y así se comparan al entrar: da igual cómo se
# escriban al teclear.
EQUIPO = [
    ("Christian Mejía", "christian.mejia@zequara.com", "arquitectura"),
    ("Laura P.",        "laurap@proliferante.com",     "comercial"),
    ("David C.",        "davidc@proliferante.com",     "data"),
    ("Paola A.",        "paola.a@proliferante.com",    "admin"),
    ("Nati C.",         "nati.c@proliferante.com",     "admin"),
    ("Jesús A.",        "jesus.a@proliferante.com",    "admin"),
]

# Sin caracteres ambiguos (l, I, 1, O, 0): estas contraseñas se leen en voz
# alta o se copian a mano más de una vez.
ALFABETO = "".join(c for c in string.ascii_letters + string.digits if c not in "lI1O0")


def clave_al_azar(n: int = 14) -> str:
    return "".join(secrets.choice(ALFABETO) for _ in range(n))


def main() -> int:
    ap = argparse.ArgumentParser(description="Crea los usuarios internos del equipo.")
    ap.add_argument("--reiniciar", action="store_true",
                    help="reasigna contraseña a los que ya existan")
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

    resultados = []
    for nombre, correo, rol in EQUIPO:
        clave = args.clave or clave_al_azar()
        existente = svc.por_correo(correo)

        if existente and not args.reiniciar:
            resultados.append((correo, rol, None, "ya existía, sin tocar"))
            continue

        if existente:
            with escribir() as con:
                con.execute(
                    "UPDATE usuarios SET clave_hash = ?, rol = ?, nombre = ?, "
                    "activo = TRUE, debe_cambiar_clave = TRUE WHERE id = ?",
                    (security.hashear(clave), rol, nombre, existente["id"]),
                )
            resultados.append((correo, rol, clave, "contraseña reiniciada"))
            continue

        try:
            svc.crear(nombre, correo, rol, clave, debe_cambiar_clave=True)
            resultados.append((correo, rol, clave, "creado"))
        except svc.ErrorAuth as e:
            resultados.append((correo, rol, None, f"ERROR: {e}"))

    ancho = max(len(c) for _, c, _ in EQUIPO) + 2
    print()
    print("  CONTRASEÑAS TEMPORALES — se muestran una sola vez")
    print("  " + "─" * (ancho + 34))
    for correo, rol, clave, nota in resultados:
        print(f"  {correo:<{ancho}} {rol:<13} {clave or '—':<15} {nota}")
    print("  " + "─" * (ancho + 34))
    print("  Repártelas por un canal privado. Al entrar, cada quien tiene que")
    print("  cambiarla antes de poder trabajar.")
    print()

    fallos = [r for r in resultados if r[3].startswith("ERROR")]
    return 1 if fallos else 0


if __name__ == "__main__":
    raise SystemExit(main())
