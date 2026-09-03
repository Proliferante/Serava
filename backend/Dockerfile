# ═══════════════════════════════════════════════════════════════════════════
#  Imagen del backend de Zequara (FastAPI).
#
#  Existe porque el frontend vive en Vercel y allí sólo corre Next: las
#  llamadas a `/api/*` se reescriben hacia BACKEND_URL, y sin un backend
#  público esa reescritura apunta a 127.0.0.1 y Vercel devuelve 404
#  (DNS_HOSTNAME_RESOLVED_PRIVATE). Esto es lo que se despliega para que
#  BACKEND_URL tenga a dónde apuntar.
#
#  Se instala `requirements.txt` completo, con pandas/scipy/scikit-learn, para
#  que la extracción y el transform funcionen igual que en local. Lo que ya no
#  ocurre es cargarlos al arrancar: `app/api/admin.py` los importa dentro de
#  las dos funciones que los usan, así que el proceso arranca con unos 80 MB
#  en lugar de 350 y cabe en una instancia pequeña.
# ═══════════════════════════════════════════════════════════════════════════

FROM python:3.12-slim

# PYTHONUNBUFFERED para que los logs salgan en el momento y no por bloques:
# con la salida en búfer, un fallo al arrancar no se ve hasta que el proceso
# muere y se pierde justo lo que había que leer.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /srv

# Las dependencias en su propia capa: mientras `requirements.txt` no cambie,
# reconstruir tras editar código no vuelve a compilar nada.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# El puerto lo pone el proveedor (Render, Railway y Fly usan $PORT). El 8000
# de respaldo es para correr la imagen a mano.
ENV PORT=8000
EXPOSE 8000

# `sh -c` y no la forma exec porque hay que expandir $PORT.
#
# Un solo worker a propósito: la caché de tablas y el pool de conexiones son
# por proceso, y con varios cada uno abriría su propio pool contra Supabase.
#
# `--forwarded-allow-ips` con los rangos privados y no con `*`: con el comodín,
# uvicorn se cree la PRIMERA entrada de `X-Forwarded-For`, que la escribe quien
# llama. El borde de Railway reescribe el encabezado y ahí no se puede
# falsificar (comprobado), pero el comodín deja esa puerta abierta para
# cualquier otro sitio donde se despliegue esto. `IPS_DE_CONFIANZA` permite
# cambiarlos sin tocar la imagen si el proveedor sale de esos rangos.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --proxy-headers --forwarded-allow-ips \"${IPS_DE_CONFIANZA:-127.0.0.1,10.0.0.0/8,100.64.0.0/10,172.16.0.0/12,192.168.0.0/16}\""]
