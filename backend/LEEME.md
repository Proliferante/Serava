# Backend de Zequara — cómo arrancarlo

Esto es lo mínimo para tener la consola interna funcionando contra la base
real, en orden. Los cuatro pasos son de una vez; después basta con el punto 4.

## 1. Variables de entorno

```bash
cd backend
cp .env.example .env
```

Abre `.env` y pon dos cosas:

- **`DATABASE_URL`** — la cadena de Supabase. Está en el panel del proyecto
  ("Project PGI") → *Project Settings* → *Database* → *Connection string (URI)*.
  Sin esto no arranca nada; el backend responde `503` con ese mismo mensaje.
- **`JWT_SECRET`** — genera uno:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(48))"
  ```
  Si lo dejas vacío el backend se inventa uno en cada arranque y avisa: sirve
  para probar, pero cierra la sesión de todos cada vez que reinicias.

`.env` está en `.gitignore`. No se sube nunca.

## 2. Dependencias

```bash
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt  (macOS/Linux)
```

## 3. Esquema, seguridad y usuarios

El esquema está en `database/schema.sql` y es **idempotente**: se puede correr
sobre la base que ya está viva sin borrar nada. Aplícalo de una de las dos
formas:

- Pegar el contenido en el editor SQL de Supabase, o
- `psql "$DATABASE_URL" -f ../database/schema.sql`

Crea `usuarios` e `inmueble_detalle`, y le añade la columna `etapa` a
`seguimiento_propiedades`. Las tablas del pipeline (`raw_listings`,
`clean_listings`) no las toca.

**Después, `database/seguridad.sql`, por el mismo camino.** No es opcional:
quita a los roles públicos de Supabase (`anon`, `authenticated`) los permisos
que traían sobre `usuarios` e `inmueble_detalle` —incluidos DELETE y
TRUNCATE—, activa RLS en las cinco tablas y crea `intentos_acceso`, que es lo
que frena la fuerza bruta en el login. El archivo explica por qué en detalle.

Para comprobar que quedó bien, esta consulta no debe devolver ninguna fila:

```sql
SELECT grantee, table_name, privilege_type
  FROM information_schema.role_table_grants
 WHERE grantee IN ('anon','authenticated') AND table_schema='public';
```

Después, los seis usuarios del equipo:

```bash
.venv/Scripts/python.exe -m scripts.crear_usuarios
```

Cada uno entra con la contraseña que tiene asignada en `EQUIPO`, dentro del
propio script, y la puede cambiar cuando quiera desde el menú lateral de la
consola. Son sencillas a propósito, porque hay que repartirlas.

**Antes de que esto tenga dominio**, córrelo con `--azar`: genera una
contraseña aleatoria por persona y obliga a cambiarla al entrar.

## 4. Arrancar

Dos procesos, en dos terminales:

```bash
# terminal 1 — backend
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000

# terminal 2 — frontend
cd frontend
npm run dev
```

La consola queda en **http://localhost:3000/admin**.

El frontend habla con el backend por una reescritura de Next (ver
`frontend/next.config.js`): todo lo que empieza por `/api` se reenvía a
`http://127.0.0.1:8000`. Por eso las peticiones salen del mismo origen y no
hay CORS que configurar en desarrollo. Al desplegar se pone `BACKEND_URL`
apuntando al backend real.

La documentación de la API se genera sola en **http://localhost:8000/docs**.

## Comprobar que está bien

```bash
curl http://localhost:8000/api/salud          # {"ok":true}
curl http://localhost:3000/api/salud          # lo mismo, por el proxy
.venv/Scripts/python.exe -m pytest tests -q   # 22 pruebas
```

---

# Lo que hay

## Sesión y usuarios — `/api/auth`

| | |
|---|---|
| `POST /login` | entrar; pone la cookie de sesión |
| `POST /salir` | cerrar la sesión actual, de verdad |
| `POST /salir-todas` | cerrar las demás sesiones |
| `GET /yo` | quién soy |
| `GET /sesiones` | mis sesiones abiertas |
| `POST /cambiar-clave` | cambiar la propia contraseña |
| `GET /usuarios` | listar (sólo admin) |
| `POST /usuarios` | crear (sólo admin) |
| `POST /usuarios/{id}/activo` | dar de baja o alta (sólo admin) |

### Cómo está montada la sesión

Contraseñas con **bcrypt**. La sesión viaja en una cookie **`HttpOnly`,
`SameSite=Strict`** y —en producción— **`Secure`**, y su estado vive en la
tabla `sesiones`.

Las tres decisiones y por qué:

- **Cookie y no `sessionStorage`.** Lo que guarda JavaScript lo lee
  JavaScript, y por tanto lo lee cualquier script inyectado. Con `HttpOnly`,
  un XSS podría hacer peticiones mientras la pestaña está abierta, pero no
  llevarse la sesión para usarla desde otro sitio y otro día.
- **`SameSite=Strict`.** El navegador no manda la cookie en peticiones que
  nazcan en otro sitio: eso cierra el CSRF de raíz. Como segundo cerrojo, el
  servidor rechaza toda escritura que traiga un `Origin` que no esté en
  `CORS_ORIGINS`.
- **Estado en tabla y no JWT.** Un JWT firmado no se puede retirar. Con la
  sesión en la base, cerrar sesión la mata de verdad, cambiar la contraseña
  cierra las demás, y dar de baja a alguien lo saca al momento.

Dos relojes: **12 horas** de tope absoluto y **2 horas** de inactividad. Y
`activo` se comprueba contra la base en cada petición.

### Freno a la fuerza bruta

5 fallos por correo en 15 minutos bloquean esa cuenta; 20 por IP bloquean esa
conexión. Va antes de comprobar la contraseña, para que un intento bloqueado
no cueste un bcrypt. Queda en `intentos_acceso`; la contraseña probada no se
guarda nunca.

### Política de contraseñas

Mínimo **12 caracteres**, no puede ser una de las obvias (ni con año pegado
detrás: `Zequara2026!` se rechaza), y no puede contener el nombre ni el correo
de su dueño. No se exige "una mayúscula y un símbolo": esa regla produce
`Password1!` y da sensación de seguridad sin darla.

### Cabeceras y bitácora

`X-Frame-Options: DENY` (contra el clickjacking), `nosniff`, `Referrer-Policy`
y una CSP que no permite nada —la API sólo devuelve JSON—. HSTS sólo cuando
`COOKIE_SEGURA=1`. Las acciones sensibles (entrar, salir, crear o desactivar
usuarios, cambiar contraseña) quedan en `bitacora`.

**Los cuatro roles:** `admin`, `arquitectura`, `data`, `comercial`. Hoy están
abiertos salvo la pantalla de usuarios, que es sólo de admin — como se acordó
en la reunión, para habilitar el primer flujo. Cerrarlos es cambiar
`Depends(usuario_actual)` por `Depends(exige_rol("data", "admin"))` en el
endpoint que toque, y la lista de `PERMISOS` en
`frontend/components/admin/sesion.tsx`. Los dos sitios están señalados con un
comentario.

## Flujo de inmuebles — `/api/admin/flujo`

Las pantallas del correo, contra la base:

| | |
|---|---|
| `GET /?etapa=` | listado de una etapa |
| `GET /conteos` | cuántos hay en cada una |
| `POST /decidir` | continúa · no continúa · no disponible |
| `POST /visita` | agendar |
| `POST /completar` | completar tras la visita y publicar |

**Dónde empieza el flujo.** No en el scraping. El scraping se corre en
Extracción de predios (`/api/admin`) y deja miles de anuncios en
`clean_listings` con etapa `nuevo`. Lo que alguien **acepta** ahí
—`POST /api/admin/seguimiento` con `decision: "pasa"`— pasa a la etapa
`revision`, que es la primera pantalla del flujo: Revisión general. Descartar
lleva a `descartado`.

Las seis etapas, en orden: `nuevo` (lo trajo el scraping, nadie lo ha
mirado; no se pinta en el flujo) → `revision` → `preseleccion` → `visita` →
`publicado`, y `descartado` desde cualquier punto. La lista está escrita en
tres sitios que tienen que coincidir: el `CHECK` de `database/schema.sql`,
`ETAPAS` en `api/flujo.py` y `VALORES_VALIDOS_ETAPA` en
`services/admin/seguimiento.py`.

**Descartado no vuelve a salir.** `GET /api/admin/predios` —la tabla de la
extracción— excluye lo descartado leyendo `seguimiento_propiedades` **en
vivo**, no la copia que el pipeline deja en `clean_listings`: esa copia es
una foto del momento de la corrida, así que un descarte de hoy no aparecía
hasta la corrida siguiente y hasta entonces el anuncio volvía a la tabla
como si nadie lo hubiera mirado.

**Cómo se guarda el estado, y por qué así.** El inmueble vive en
`clean_listings`, que el pipeline **reconstruye en cada corrida**. Su estado
—en qué etapa va, quién decidió y por qué— vive en
`seguimiento_propiedades`, que el pipeline lee pero **nunca reconstruye**. Lo
que el equipo completa tras la visita, en `inmueble_detalle`.

Las tres se unen por la URL del anuncio, que es lo único estable entre
corridas. De ahí sale la garantía que pide el correo: un inmueble descartado
en agosto sigue descartado en septiembre aunque el scraping se corra desde
cero. Si ese estado viviera en `clean_listings`, se perdería en la corrida
siguiente.

## Consola del pipeline — `/api/admin`

Los siete endpoints de siempre (config, predios, extraer, estado,
seguimiento, zonas_resumen, predio_analisis).

Dos cosas de `predios` y `seguimiento` que conviene saber:

- **Los booleanos son booleanos.** `dentro_poligono_real`, `similar_a_zona`,
  `bajo_media_zona`, `posible_duplicado` y
  `modelo_repetido_edificio_nuevo` son `boolean` en Postgres (los escribe
  pandas desde el dataframe de la limpieza). Compararlos con `= 1` no
  devuelve falso: revienta con «operator does not exist: boolean =
  integer», o sea 500 y pantalla vacía. Van con `IS TRUE` / `IS FALSE` /
  `IS NULL`, y para contarlos `COUNT(*) FILTER`, no `SUM(columna)`.
- **`en_scope_zona` es texto y no tiene un solo formato**: hay `'1'`/`'0'`
  de unas corridas y `'true'`/`'false'` de otras. Se compara contra las
  dos formas o el embudo se deja filas fuera.

---

# Antes de publicar en un dominio

- **`CORS_ORIGINS`** — hoy por defecto es sólo `localhost:3000`. Al desplegar,
  el dominio real: `CORS_ORIGINS=https://panel.zequara.com`. Antes esto estaba
  en `["*"]`, que con credenciales es justo lo que no se debe hacer.
- **Contraseñas** — `python -m scripts.crear_usuarios --azar --reiniciar`, y
  repartir las nuevas. Las de `EQUIPO` son predecibles por diseño.
- **`database/seguridad.sql` aplicado**, y la consulta de comprobación de
  arriba devolviendo cero filas.
- **La contraseña de la base de datos** — cámbiala en Supabase y actualiza
  `DATABASE_URL`. Estuvo en un chat.
- **`COOKIE_SEGURA=1`** — sin esto la cookie de sesión viaja en claro y
  cualquiera en la misma red puede quedársela. Es la más importante de esta
  lista.
- **`JWT_SECRET`** — fijo y distinto del de desarrollo.
- **`BACKEND_URL`** en el frontend, apuntando al backend desplegado.
- La llave de Metrocuadrado ahora se puede poner en `METROCUADRADO_API_KEY`.
  No es un secreto —es la que el propio sitio usa en el navegador de cualquier
  visitante—, pero si rota, se cambia ahí sin editar código.
