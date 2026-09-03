"""
scripts/crear_usuarios.py
=========================
Siembra los usuarios internos del equipo.

    cd backend
    python -m scripts.crear_usuarios

Cada uno entra con la contraseña que tiene asignada abajo en `EQUIPO`, y la
puede cambiar cuando quiera desde el menú lateral de la consola. No se le
obliga a cambiarla al entrar: son cuentas de un equipo de seis personas que
tiene que ponerse a trabajar, no altas de un servicio público.

SOBRE ESTAS CONTRASEÑAS
    Son deliberadamente sencillas y predecibles —`Zq<Nombre>26`— porque hay
    que dictarlas y repartirlas. Eso está bien para la consola interna
    mientras vive en `localhost`, y NO está bien el día que esto tenga un
    dominio: antes de publicar, que cada quien cambie la suya desde la
    consola, o se pasa este script a `--azar`.

    En la base sólo se guarda el hash bcrypt, nunca la contraseña.

OPCIONES
    --reiniciar   a los que ya existan les vuelve a poner su contraseña de
                  `EQUIPO`. Sin esto, los existentes se saltan y se avisa.
    --azar        en vez de las de `EQUIPO`, genera una al azar por persona y
                  exige cambiarla al entrar. Es lo que hay que usar cuando
                  esto salga de localhost.
    --clave X     la misma X para todos. Para una demo controlada.
"""

import argparse
import secrets
import string
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
EQUIPO = [
    ("Christian Mejía", "christian.mejia@zequara.com", "arquitectura", "ZqChristian26"),
    ("Laura P.",        "laurap@proliferante.com",     "comercial",    "ZqLaura26"),
    ("David C.",        "davidc@proliferante.com",     "data",         "ZqDavid26"),
    ("Paola A.",        "paola.a@proliferante.com",    "admin",        "ZqPaola26"),
    ("Nati C.",         "nati.c@proliferante.com",     "admin",        "ZqNati26"),
    ("Jesús A.",        "jesus.a@proliferante.com",    "admin",        "ZqJesus26"),
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
    ap.add_argument("--azar", action="store_true",
                    help="contraseña al azar por persona, y obliga a cambiarla al entrar")
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

    # `--azar` es el único modo que obliga a cambiarla: si la contraseña la
    # eligió una persona y se repartió a mano, forzar el cambio tiene sentido
    # sólo cuando esa contraseña es de un solo uso.
    forzar_cambio = args.azar

    resultados = []
    for nombre, correo, rol, clave_fija in EQUIPO:
        clave = args.clave or (clave_al_azar() if args.azar else clave_fija)
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

    ancho = max(len(c) for _, c, _, _ in EQUIPO) + 2
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
