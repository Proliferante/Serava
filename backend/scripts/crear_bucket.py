"""
scripts/crear_bucket.py
=======================
Crea (o repara) el bucket de Supabase Storage donde viven las fotos de la
ficha del predio, y comprueba que de verdad funciona.

    cd backend
    python -m scripts.crear_bucket

POR QUÉ EXISTE, SI SE PUEDE HACER A CLIC
    Se puede, y está bien hacerlo así. Lo que no se puede hacer a clic es
    COMPROBARLO: el panel de Supabase enseña un bucket creado igual esté
    público o privado, y el error de "privado" no aparece en la consola al
    subir —la subida va con la clave de servicio y funciona— sino más tarde,
    en la ficha del inversionista, como una foto rota. Este script sube un
    píxel, lo pide desde fuera SIN credenciales —que es exactamente lo que
    hará el navegador de quien mire la ficha— y lo borra. Si eso pasa, está
    bien configurado de verdad.

    También deja el bucket con el tope de tamaño y los formatos que acepta el
    backend, para que un archivo que aquí se rechaza no se cuele por otro
    camino.

LO QUE NECESITA
    En backend/.env:
        SUPABASE_URL=https://xxxxxxxx.supabase.co
        SUPABASE_SERVICE_KEY=<la clave service_role>
        SUPABASE_BUCKET=fichas        (opcional; `fichas` por defecto)

OPCIONES
    --ajustar   si el bucket ya existe, le vuelve a poner público, el tope de
                tamaño y los formatos. Sin esto, un bucket existente se deja
                como está y sólo se informa de cómo está.
    --probar    no crea nada: sólo hace la prueba de subida y lectura.
"""

import argparse
import base64
import sys
import uuid

# Misma razón que en `crear_usuarios`: la consola de Windows viene en cp1252 y
# no puede escribir ni "ñ" ni los caracteres de dibujo.
for _flujo in (sys.stdout, sys.stderr):
    try:
        _flujo.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import requests

from app.core import config
from app.services import almacenamiento as alm

# Un PNG de 1×1 transparente. Va escrito aquí y no como archivo suelto para
# que el script no dependa de nada del disco.
PIXEL = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk"
    "+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)

TIPOS = sorted(alm.TIPOS)


def _cabeceras() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {config.SUPABASE_SERVICE_KEY}",
        "apikey": config.SUPABASE_SERVICE_KEY,
        "Content-Type": "application/json",
    }


def _bucket_url(cola: str = "") -> str:
    return f"{config.SUPABASE_URL}/storage/v1/bucket{cola}"


def _cuerpo_bucket() -> dict:
    return {
        "public": True,
        # En bytes. Tiene que ser al menos el tope del backend, o el rechazo
        # llegaría de Supabase con un mensaje que nadie sabría traducir.
        "file_size_limit": config.FOTO_MAXIMA_MB * 1024 * 1024,
        "allowed_mime_types": TIPOS,
    }


def _falta_configuracion() -> str | None:
    if not config.SUPABASE_URL:
        return "Falta SUPABASE_URL en backend/.env."
    if not config.SUPABASE_SERVICE_KEY:
        return "Falta SUPABASE_SERVICE_KEY en backend/.env (la clave service_role)."
    if not config.SUPABASE_URL.startswith("https://"):
        return f"SUPABASE_URL no parece una URL: {config.SUPABASE_URL}"
    return None


def mirar() -> dict | None:
    """El bucket, si existe. None si no."""
    r = requests.get(_bucket_url(f"/{config.SUPABASE_BUCKET}"),
                     headers=_cabeceras(), timeout=30)
    if r.status_code == 404:
        return None
    if r.status_code == 400:
        # Supabase devuelve 400 con "Bucket not found" en algunas versiones.
        if "not found" in (r.text or "").lower():
            return None
    if r.status_code >= 400:
        raise SystemExit(f"  Supabase respondió {r.status_code}: {(r.text or '')[:300]}")
    return r.json()


def crear() -> None:
    cuerpo = {"id": config.SUPABASE_BUCKET, "name": config.SUPABASE_BUCKET, **_cuerpo_bucket()}
    r = requests.post(_bucket_url(), headers=_cabeceras(), json=cuerpo, timeout=30)
    if r.status_code >= 400:
        raise SystemExit(f"  No se pudo crear: {r.status_code} · {(r.text or '')[:300]}")


def ajustar() -> None:
    r = requests.put(_bucket_url(f"/{config.SUPABASE_BUCKET}"),
                     headers=_cabeceras(), json=_cuerpo_bucket(), timeout=30)
    if r.status_code >= 400:
        raise SystemExit(f"  No se pudo ajustar: {r.status_code} · {(r.text or '')[:300]}")


def probar() -> bool:
    """Sube un píxel, lo lee sin credenciales y lo borra.

    La lectura va con `requests` pelado y a propósito sin cabeceras: si
    pasara la clave, un bucket privado también respondería 200 y la prueba
    diría que todo está bien mientras la ficha del inversionista sigue
    enseñando fotos rotas.
    """
    ruta = f"_prueba/{uuid.uuid4().hex[:10]}.png"
    print(f"  · subiendo   {ruta}")
    try:
        url = alm.subir(PIXEL, ruta, "image/png")
    except alm.ErrorDeSubida as e:
        print(f"  ✗ la subida falló: {e}")
        return False

    print(f"  · leyendo    {url}")
    r = requests.get(url, timeout=30)
    ok = r.status_code == 200 and r.content == PIXEL

    if not ok:
        print(f"  ✗ la lectura pública devolvió {r.status_code}"
              f"{' con un contenido distinto' if r.status_code == 200 else ''}.")
        print("    El bucket existe pero NO es público. En el panel de Supabase:")
        print(f"    Storage → {config.SUPABASE_BUCKET} → los tres puntos → Edit bucket")
        print("    → activa «Public bucket» → Save. O vuelve a correr esto con --ajustar.")
    else:
        print("  ✓ se lee desde fuera sin credenciales, que es lo que hará el navegador")

    alm.borrar(ruta)
    print("  · borrado    el archivo de prueba")
    return ok


def main() -> int:
    p = argparse.ArgumentParser(description="Crea y comprueba el bucket de fotos de la ficha.")
    p.add_argument("--ajustar", action="store_true",
                   help="si ya existe, le vuelve a poner público, tope y formatos")
    p.add_argument("--probar", action="store_true",
                   help="no crea nada: sólo la prueba de subida y lectura")
    a = p.parse_args()

    problema = _falta_configuracion()
    if problema:
        print()
        print(f"  {problema}")
        print()
        print("  Las dos están en Supabase → Project Settings → API:")
        print("    · Project URL          → SUPABASE_URL")
        print("    · service_role (secret) → SUPABASE_SERVICE_KEY")
        print()
        print("  La service_role NO es la anon. Va sólo en backend/.env, nunca en el")
        print("  frontend ni en un commit.")
        print()
        return 1

    print()
    print(f"  Proyecto: {config.SUPABASE_URL}")
    print(f"  Bucket:   {config.SUPABASE_BUCKET}")
    print()

    if not a.probar:
        actual = mirar()
        if actual is None:
            print("  · no existía, creándolo…")
            crear()
            print(f"  ✓ creado · público · hasta {config.FOTO_MAXIMA_MB} MB por archivo")
            print(f"    formatos: {', '.join(TIPOS)}")
        else:
            publico = actual.get("public")
            print(f"  · ya existe · público: {'sí' if publico else 'NO'}"
                  f" · tope: {actual.get('file_size_limit') or 'sin tope'}")
            if a.ajustar:
                ajustar()
                print(f"  ✓ ajustado · público · hasta {config.FOTO_MAXIMA_MB} MB por archivo")
            elif not publico:
                print("    Está privado y la ficha lo necesita público.")
                print("    Vuelve a correr esto con --ajustar.")
        print()

    print("  Prueba de ida y vuelta:")
    ok = probar()
    print()
    if ok:
        print("  Todo listo. Ya se pueden subir fotos desde «Armar la ficha».")
    else:
        print("  Arregla lo de arriba y vuelve a correr: python -m scripts.crear_bucket --probar")
    print()
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
