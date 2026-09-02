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

## 3. Esquema y usuarios

El esquema está en `database/schema.sql` y es **idempotente**: se puede correr
sobre la base que ya está viva sin borrar nada. Aplícalo de una de las dos
formas:

- Pegar el contenido en el editor SQL de Supabase, o
- `psql "$DATABASE_URL" -f ../database/schema.sql`

Crea `usuarios` e `inmueble_detalle`, y le añade la columna `etapa` a
`seguimiento_propiedades`. Las tablas del pipeline (`raw_listings`,
`clean_listings`) no las toca.

Después, los seis usuarios del equipo:

```bash
.venv/Scripts/python.exe -m scripts.crear_usuarios
```

Imprime **una sola vez** una contraseña temporal por persona. Cópialas y
repártelas por un canal privado: al entrar, cada quien tiene que cambiarla
antes de poder trabajar. Si se pierden, `--reiniciar` genera otras.

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
| `POST /login` | entrar; devuelve token y usuario |
| `GET /yo` | quién soy; valida el token en cada llamada |
| `POST /cambiar-clave` | cambiar la propia contraseña |
| `GET /usuarios` | listar (sólo admin) |
| `POST /usuarios` | crear (sólo admin) |
| `POST /usuarios/{id}/activo` | dar de baja o alta (sólo admin) |

Contraseñas con bcrypt; sesión con JWT de 12 horas. El rol viaja dentro del
token, así que autorizar no consulta la base — pero `activo` **sí** se
comprueba en cada petición: desactivar a alguien lo echa en la petición
siguiente, no cuando caduque su token.

**Los cuatro roles:** `admin`, `arquitectura`, `data`, `comercial`. Hoy están
abiertos salvo la pantalla de usuarios, que es sólo de admin — como se acordó
en la reunión, para habilitar el primer flujo. Cerrarlos es cambiar
`Depends(usuario_actual)` por `Depends(exige_rol("data", "admin"))` en el
endpoint que toque, y la lista de `PERMISOS` en
`frontend/components/admin/sesion.tsx`. Los dos sitios están señalados con un
comentario.

## Flujo de inmuebles — `/api/admin/flujo`

Las cinco pantallas del correo, contra la base:

| | |
|---|---|
| `GET /?etapa=` | listado de una etapa |
| `GET /conteos` | cuántos hay en cada una |
| `POST /decidir` | continúa · no continúa · no disponible |
| `POST /visita` | agendar |
| `POST /completar` | completar tras la visita y publicar |

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

Los siete endpoints que ya existían (config, predios, extraer, estado,
seguimiento, zonas_resumen, predio_analisis). No se tocaron.

---

# Antes de publicar en un dominio

- **`CORS_ORIGINS`** — hoy por defecto es sólo `localhost:3000`. Al desplegar,
  el dominio real: `CORS_ORIGINS=https://panel.zequara.com`. Antes esto estaba
  en `["*"]`, que con credenciales es justo lo que no se debe hacer.
- **`JWT_SECRET`** — fijo y distinto del de desarrollo.
- **`BACKEND_URL`** en el frontend, apuntando al backend desplegado.
- La llave de Metrocuadrado ahora se puede poner en `METROCUADRADO_API_KEY`.
  No es un secreto —es la que el propio sitio usa en el navegador de cualquier
  visitante—, pero si rota, se cambia ahí sin editar código.
