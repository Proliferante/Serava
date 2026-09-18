"""
scripts/rotar_claves.py
=======================
Pone contraseñas nuevas al equipo y las enseña UNA vez.

    cd backend
    python -m scripts.rotar_claves                    # todas las cuentas activas
    python -m scripts.rotar_claves laura.p@proliferante.com david.c@proliferante.com

POR QUÉ EXISTE
    Hasta ahora la única forma de reponer una contraseña era editar la lista
    `EQUIPO` de `crear_usuarios.py` y correrlo con `--reiniciar`. Eso obliga a
    escribir la contraseña en un archivo del repo para poder aplicarla, y de
    ahí salió el problema que este script viene a cerrar: las seis del equipo
    acabaron publicadas en GitHub, legibles por cualquiera.

    Aquí la contraseña no pasa por el disco en ningún momento. Se genera en
    memoria, se guarda su hash bcrypt en la base y se imprime en la terminal.
    Ni el script la contiene, ni queda en un archivo, ni se registra en la
    bitácora.

LO QUE TIENES QUE HACER CON LA SALIDA
    Repartirla por un canal privado y cerrar la terminal. Si la pierdes, se
    vuelve a correr: no hay forma de recuperarla, y eso es exactamente lo que
    se quiere de una contraseña guardada como hash.

OPCIONES
    --exigir-cambio   además, la consola le pide cambiarla la primera vez que
                      entre. Sin esto, la contraseña que sale aquí es la de
                      siempre hasta que cada quien la cambie por su cuenta.
    --incluir-inactivos  también las cuentas desactivadas.
"""

import argparse
import sys

# Misma razón que en los otros scripts: la consola de Windows viene en cp1252
# y no puede escribir «ñ» ni los caracteres de dibujo.
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from app.core.database import tabla_existe
from app.services import auth_service as svc


def main() -> int:
    ap = argparse.ArgumentParser(description="Rota contraseñas del equipo y las enseña una vez.")
    ap.add_argument("correos", nargs="*", help="a quiénes. Sin argumentos, a todos los activos.")
    ap.add_argument("--exigir-cambio", action="store_true",
                    help="pedir que la cambien al entrar")
    ap.add_argument("--incluir-inactivos", action="store_true",
                    help="también las cuentas desactivadas")
    a = ap.parse_args()

    if not tabla_existe("usuarios"):
        print("ERROR: no existe la tabla `usuarios`.", file=sys.stderr)
        return 1

    todos = svc.listar()
    if a.correos:
        pedidos = {svc.normalizar_correo(c) for c in a.correos}
        objetivo = [u for u in todos if u["correo"] in pedidos]
        faltan = pedidos - {u["correo"] for u in objetivo}
        for f in sorted(faltan):
            print(f"  AVISO: no existe ninguna cuenta con el correo {f}")
    else:
        objetivo = [u for u in todos if a.incluir_inactivos or u["activo"]]

    if not objetivo:
        print("  No hay ninguna cuenta que rotar.")
        return 1

    resultados = []
    for u in objetivo:
        clave = svc.generar_clave(u["correo"], u["nombre"])
        try:
            svc.poner_clave(u["id"], clave, exigir_cambio=a.exigir_cambio,
                            correo=u["correo"], nombre=u["nombre"])
            resultados.append((u["correo"], u["rol"], clave, "cambiada"))
        except svc.ErrorAuth as e:
            resultados.append((u["correo"], u["rol"], None, f"ERROR: {e}"))

    ancho = max(len(r[0]) for r in resultados)
    print()
    print("  CONTRASEÑAS NUEVAS" + (" (se piden cambiar al entrar)" if a.exigir_cambio else ""))
    print("  " + "-" * (ancho + 42))
    for correo, rol, clave, nota in resultados:
        print(f"  {correo:<{ancho}}  {rol:<13} {clave or '-':<18} {nota}")
    print("  " + "-" * (ancho + 42))
    print()
    print("  Repártelas por un canal privado y cierra esta terminal.")
    print("  No quedan escritas en ningún archivo: en la base sólo está su hash.")
    print("  Si las pierdes, vuelve a correr esto — no hay forma de recuperarlas.")
    print()

    return 1 if any(r[3].startswith("ERROR") for r in resultados) else 0


if __name__ == "__main__":
    raise SystemExit(main())
