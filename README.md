# Zequara

Sitio y plataforma de Zequara: inversión inmobiliaria gestionada de principio a fin
—se busca el activo, se remodela con interventoría independiente y se administra—.

El repositorio se llama `serava` y el paquete del frontend `serava-frontend`: es el
nombre anterior del proyecto. La marca, los textos y los logotipos son Zequara.

## Estado

| Parte | Estado |
|---|---|
| `frontend/` | **En marcha.** 22 rutas con vista de escritorio y vista fluida de móvil/tablet. La consola interna (`/admin`) opera contra el backend; el resto del sitio sigue sobre contenido escrito en el código. |
| `backend/` | **En marcha, parcial.** Sesión y usuarios internos, el flujo de inmuebles y la consola del pipeline (scraping, limpieza, seguimiento) funcionan. Inmuebles, dashboard y notificaciones del portal de cliente siguen a 0 bytes. |
| `database/` | **Postgres en Supabase.** Cinco tablas: `raw_listings` y `clean_listings` (las reconstruye el pipeline), `usuarios`, `seguimiento_propiedades` e `inmueble_detalle` (las escriben las personas). El esquema está en `database/schema.sql`. |
| `docker-compose.yml` | Vacío. |

Para arrancar el backend y crear los usuarios del equipo:
**[backend/LEEME.md](backend/LEEME.md)**.

## Arrancar

Dos procesos. El backend primero:

```bash
cd backend                      # ver backend/LEEME.md para .env y usuarios
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev                     # http://localhost:3000
```

El sitio público funciona sin backend. La consola interna
(http://localhost:3000/admin) lo necesita: sin él, el acceso responde que no
hay conexión con la base.

Scripts del frontend: `dev`, `build`, `start`, `lint`.

Nota: no lances `npm run build` con el `dev` corriendo — comparten `.next` y el
servidor de desarrollo se rompe.

## Mapa del repositorio

```
frontend/          Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · framer-motion
  app/             una carpeta por ruta; los page.tsx sólo componen
  components/
    sections/      vistas del lienzo fijo de 1920 px
    responsive/    vistas fluidas (< 1280 px)
    panel/         marco y primitivas del área privada
    predios/       tarjetas y pantallas del área de predios
    motion/        vocabulario de animación compartido
  styles/globals.css   micro-interacciones (.ix-*, .pnl-*) y prefers-reduced-motion
  public/figma/    assets exportados de Figma

backend/           FastAPI · Postgres (Supabase)
  app/api/         auth.py (sesión y usuarios) · admin.py (pipeline) · flujo.py
  app/core/        config, conexión, contraseñas y tokens
  app/services/    auth_service.py · admin/ (scraping, limpieza, seguimiento)
  scripts/         crear_usuarios.py — siembra el equipo
  tests/           pruebas de sesión y permisos
database/          schema.sql — las cinco tablas
docs/              esta documentación
```

## Documentación

- [docs/arquitectura.md](docs/arquitectura.md) — cómo está construido el frontend: el
  lienzo escalado, el árbol dual escritorio/móvil, el sistema de diseño, el
  movimiento, rendimiento y las trampas conocidas.
- [docs/flujos-negocio.md](docs/flujos-negocio.md) — el recorrido pantalla por pantalla,
  qué muestra cada una y qué está pintado pero todavía no funciona.
- [docs/api-reference.md](docs/api-reference.md) — estado del backend y los puntos de
  integración que el frontend deja abiertos, con archivo y línea.
- [docs/propuesta-backend.pdf](docs/propuesta-backend.pdf) — propuesta de construcción
  del backend en siete fases: stack, modelo de dominio, endpoints, plan y riesgos.
  La fuente es [docs/propuesta-backend.html](docs/propuesta-backend.html); para
  regenerar el PDF:

  ```bash
  chrome --headless=new --no-pdf-header-footer \
    --print-to-pdf=docs/propuesta-backend.pdf docs/propuesta-backend.html
  ```
