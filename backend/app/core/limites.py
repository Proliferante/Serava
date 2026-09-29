"""
core/limites.py
===============
Los tres frenos que van delante de todos los endpoints, en un solo middleware:

    1. Quién llama — la IP real, y si la petición viene del frontend.
    2. Cuánto pesa — cuerpos de más de 1 MB se cortan antes de leerse.
    3. Con qué frecuencia — topes por minuto, por IP y por sesión.

POR QUÉ UN MIDDLEWARE ASGI Y NO `@app.middleware("http")`
    El tope de tamaño tiene que contar los bytes MIENTRAS llegan. Con el
    decorador de Starlette la petición ya está envuelta y el cuerpo se lee
    entero después; aquí se envuelve `receive` y se corta en cuanto se pasa,
    aunque el cliente mienta en `Content-Length` o mande el cuerpo por trozos.

LA IP REAL, Y POR QUÉ HACE FALTA UN SECRETO
    En producción el navegador no habla con este backend: habla con Vercel, y
    Vercel reenvía a Railway. Railway reescribe `X-Forwarded-For` con la IP
    que ve conectarse, y la que se conecta es Vercel. Si es así, todos los
    visitantes parecen el mismo puñado de IPs, y un tope por IP castiga a
    todos a la vez —o bloquea al equipo entero con los fallos de login de una
    persona—. Con la firma de abajo deja de importar qué haga Railway.

    El middleware de Next (`frontend/middleware.ts`) mete la IP del visitante
    en `X-Zq-Cliente` y firma la petición con `X-Zq-Proxy`, que lleva
    `PROXY_SECRETO`. Aquí sólo se cree `X-Zq-Cliente` si el secreto coincide:
    sin él, cualquiera podría inventarse la IP que quisiera.

    Y con el secreto configurado se exige en TODO (menos `/api/salud`, que es
    el chequeo de vida de Railway). Eso cierra la puerta de atrás: la URL de
    Railway es pública, y sin esto alguien podría atacarla directamente y
    saltarse el firewall de Vercel entero.

    Sin `PROXY_SECRETO` (en local), no se exige nada y la IP sale como antes,
    de `intentos.ip_de`.

POR QUÉ EN MEMORIA
    El backend corre con un worker y una réplica (ver Dockerfile y
    railway.toml), así que un diccionario en el proceso ve todas las
    peticiones. El día que haya varias réplicas, cada una contaría por su lado
    y los topes se multiplicarían: entonces esto pasa a Redis, con la misma
    interfaz.

    Esto NO para una avalancha de verdad. Un proceso de Python que rechaza un
    millón de peticiones por minuto se ahoga igual rechazándolas. Contra eso
    están las reglas de límite del firewall de Vercel, que cortan en el borde
    antes de que nada llegue aquí. Este freno es la segunda línea: el abuso
    que se cuela, los scripts que recorren la API a mano, el login.
"""

import hashlib
import hmac
import json
import time
from dataclasses import dataclass

from fastapi import HTTPException

from app.core import config, intentos

# Rutas que no pasan por ningún freno: el chequeo de vida del proveedor. Si se
# frenara, un pico de tráfico haría que Railway creyera muerto el proceso y lo
# reiniciara, que es justo lo que no hay que hacer en un pico.
LIBRES = ("/api/salud",)

# Rutas con su propio tope de tamaño. Las fotos llegan a FOTO_MAXIMA_MB y el
# endpoint ya lo comprueba él mismo; aquí se le deja un margen por el
# envoltorio multipart.
CUERPO_MAXIMO = 1 * 1024 * 1024
CUERPOS_GRANDES = {
    "/api/admin/flujo/ficha/foto": (config.FOTO_MAXIMA_MB + 1) * 1024 * 1024,
}


@dataclass(frozen=True)
class Tope:
    nombre: str
    peticiones: int
    segundos: int


# Por minuto. Holgados a propósito: una persona trabajando en la consola hace
# unas pocas peticiones por clic, y quien choque con esto tiene que ser un
# script, no alguien que va rápido.
LOGIN = Tope("login", 10, 60)          # por IP; el freno fino es intentos.py
ESCRITURA = Tope("escritura", 60, 60)  # por sesión, o por IP sin sesión
CONSOLA = Tope("consola", 600, 60)     # lecturas con sesión, por sesión
PUBLICO = Tope("publico", 120, 60)     # lecturas sin sesión, por IP
# Los `fetch` de servidor de Next (las páginas públicas pidiendo predios y
# HUB) vienen firmados pero sin IP de visitante: salen de Vercel, no de un
# navegador. Van a una cubeta propia y ancha para que el tráfico de las
# páginas no se coma el tope de nadie.
SERVIDOR = Tope("servidor", 1200, 60)
# Techo por IP para todo lo que lleva cookie. Sin él, alguien podría mandar
# una cookie inventada distinta en cada petición y estrenar cubeta cada vez.
TECHO_IP = Tope("ip", 1200, 60)


class _Contador:
    """Ventana deslizante aproximada: la ventana actual más la anterior,
    pesada por cuánto queda de ella. Dos enteros por clave, y sin la ráfaga
    doble que deja pasar una ventana fija justo en el cambio de minuto."""

    MAX_CLAVES = 50_000

    def __init__(self):
        self._c: dict[str, tuple[int, int, int]] = {}  # clave -> (ventana, actual, anterior)
        self._barrido = 0.0

    def pasar(self, clave: str, tope: Tope, ahora: float) -> int:
        """Cuenta la petición. Devuelve 0 si pasa, o los segundos que faltan."""
        ventana = int(ahora // tope.segundos)
        v, actual, anterior = self._c.get(clave, (ventana, 0, 0))
        if v != ventana:
            anterior = actual if v == ventana - 1 else 0
            actual = 0
        transcurrido = (ahora % tope.segundos) / tope.segundos
        estimado = anterior * (1 - transcurrido) + actual
        if estimado >= tope.peticiones:
            self._c[clave] = (ventana, actual, anterior)
            return max(1, int(tope.segundos * (1 - transcurrido)) + 1)
        self._c[clave] = (ventana, actual + 1, anterior)
        self._barrer(ahora)
        return 0

    def _barrer(self, ahora: float) -> None:
        # Que la memoria no crezca sin fin con IPs que pasan una vez. Se barre
        # cada minuto, o antes si se llenó.
        if ahora - self._barrido < 60 and len(self._c) < self.MAX_CLAVES:
            return
        self._barrido = ahora
        minuto = int(ahora // 60)
        self._c = {k: e for k, e in self._c.items() if e[0] >= minuto - 1}
        if len(self._c) >= self.MAX_CLAVES:
            # Lleno de claves vivas: es un ataque repartido entre muchas IPs.
            # Se suelta todo antes que dejar crecer la memoria hasta tumbar el
            # proceso; contra eso está el firewall del borde.
            self._c.clear()

    def vaciar(self) -> None:
        self._c.clear()


contador = _Contador()


def _ahora() -> float:
    """El reloj de los topes. Aparte para que las pruebas lo puedan parar: si
    no, cien peticiones seguidas que caen a caballo de un cambio de minuto
    mueven la ventana y la prueba falla una de cada tantas sin que nada esté
    mal."""
    return time.time()


def _cabecera(scope, nombre: bytes) -> str | None:
    for k, v in scope.get("headers") or ():
        if k == nombre:
            return v.decode("latin-1")
    return None


def _cookie(scope, nombre: str) -> str | None:
    crudo = _cabecera(scope, b"cookie") or ""
    for parte in crudo.split(";"):
        k, _, v = parte.strip().partition("=")
        if k == nombre and v:
            return v
    return None


def del_proxy(scope) -> bool:
    """Si la petición trae la firma del frontend. Comparación en tiempo
    constante: con `==` se podría adivinar el secreto letra a letra midiendo
    cuánto tarda en fallar."""
    if not config.PROXY_SECRETO:
        return False
    firma = _cabecera(scope, b"x-zq-proxy") or ""
    return hmac.compare_digest(firma.encode(), config.PROXY_SECRETO.encode())


class _Peticion:
    """Lo mínimo que `intentos.ip_de` necesita, sin montar un Request."""

    def __init__(self, scope):
        self.headers = {k.decode("latin-1"): v.decode("latin-1")
                        for k, v in scope.get("headers") or ()}
        cliente = scope.get("client")
        self.client = type("C", (), {"host": cliente[0] if cliente else None})()


def ip_real(scope) -> str | None:
    if del_proxy(scope):
        ip = (_cabecera(scope, b"x-zq-cliente") or "").strip()
        if ip:
            return ip[:64]
    return intentos.ip_de(_Peticion(scope))


def _huella(sid: str) -> str:
    # En la memoria del proceso no se guarda la sesión tal cual: un volcado de
    # memoria no debería repartir sesiones válidas.
    return hashlib.sha256(sid.encode()).hexdigest()[:24]


def topes_de(metodo: str, ruta: str, ip: str | None, sid: str | None) -> list[tuple[str, Tope]]:
    """Las cubetas por las que pasa una petición."""
    quien_ip = f"ip:{ip or '?'}"
    if metodo == "POST" and ruta == "/api/auth/login":
        return [(quien_ip, LOGIN)]

    escribe = metodo in ("POST", "PUT", "PATCH", "DELETE")
    if sid:
        quien = f"s:{_huella(sid)}"
        return [(quien, ESCRITURA if escribe else CONSOLA), (quien_ip, TECHO_IP)]
    return [(quien_ip, ESCRITURA if escribe else PUBLICO)]


async def _responder(send, estado: int, detalle: str, extra: list | None = None):
    cuerpo = json.dumps({"detail": detalle}).encode()
    await send({
        "type": "http.response.start", "status": estado,
        "headers": [(b"content-type", b"application/json"),
                    (b"content-length", str(len(cuerpo)).encode())] + (extra or []),
    })
    await send({"type": "http.response.body", "body": cuerpo})


class _Excedido(HTTPException):
    """Un `HTTPException` y no una excepción cualquiera: FastAPI convierte
    cualquier otra cosa que salte al leer el cuerpo en un 400 genérico
    ("error parsing the body"), y lo que hay que decir es 413."""

    def __init__(self):
        super().__init__(413, "La petición es demasiado grande.")


class Frenos:
    """Middleware ASGI. Va el primero de la cadena (se añade el último)."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            return await self.app(scope, receive, send)

        ruta = scope.get("path", "")
        metodo = scope.get("method", "GET")

        if ruta in LIBRES or metodo == "OPTIONS":
            return await self.app(scope, receive, send)

        # 1. La puerta de atrás. Con secreto configurado, lo que no venga del
        # frontend no entra. 404 y no 403: a quien llama directo a Railway no
        # hay por qué confirmarle que ahí hay una API.
        if config.PROXY_SECRETO and not del_proxy(scope):
            return await _responder(send, 404, "Not Found")

        # 2. El tamaño declarado. Si miente, lo pilla el contador de abajo.
        tope_cuerpo = CUERPOS_GRANDES.get(ruta, CUERPO_MAXIMO)
        declarado = _cabecera(scope, b"content-length")
        if declarado and declarado.isdigit() and int(declarado) > tope_cuerpo:
            return await _responder(send, 413, "La petición es demasiado grande.")

        # 3. La frecuencia.
        ip = ip_real(scope)
        scope.setdefault("state", {})["ip"] = ip
        ahora = _ahora()
        if del_proxy(scope) and not _cabecera(scope, b"x-zq-cliente"):
            cubetas = [("srv", SERVIDOR)]
        else:
            cubetas = topes_de(metodo, ruta, ip, _cookie(scope, "zq_sesion"))
        for clave, tope in cubetas:
            espera = contador.pasar(f"{tope.nombre}|{clave}", tope, ahora)
            if espera:
                return await _responder(
                    send, 429,
                    "Demasiadas peticiones seguidas. Espera un momento y vuelve a intentarlo.",
                    [(b"retry-after", str(espera).encode())],
                )

        recibido = 0
        empezo = False

        async def recibir():
            nonlocal recibido
            mensaje = await receive()
            if mensaje["type"] == "http.request":
                recibido += len(mensaje.get("body", b""))
                if recibido > tope_cuerpo:
                    raise _Excedido()
            return mensaje

        async def enviar(mensaje):
            nonlocal empezo
            if mensaje["type"] == "http.response.start":
                empezo = True
            await send(mensaje)

        try:
            await self.app(scope, recibir, enviar)
        except _Excedido:
            if not empezo:
                await _responder(send, 413, "La petición es demasiado grande.")
