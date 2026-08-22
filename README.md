# Zequara

Sitio y plataforma de Zequara: inversión inmobiliaria gestionada de principio a fin
—se busca el activo, se remodela con interventoría independiente y se administra—.

El repositorio se llama `serava` y el paquete del frontend `serava-frontend`: es el
nombre anterior del proyecto. La marca, los textos y los logotipos son Zequara.

## Estado

| Parte | Estado |
|---|---|
| `frontend/` | **En marcha.** 21 rutas, cada una con vista de escritorio y vista fluida de móvil/tablet. Sin datos reales: todo el contenido está escrito en el código. |
| `backend/` | **Vacío.** Existe el esqueleto de carpetas (`api/`, `core/`, `services/`) pero los doce archivos `.py` tienen 0 bytes. |
| `database/` | **Vacío.** `schema.sql` y `seeds/data.sql` a 0 bytes. |
| `docker-compose.yml`, `.env.example` | **Vacíos.** |

Es decir: hoy esto es un frontend completo sobre contenido fijo. No hay API, ni
base de datos, ni autenticación real. Los puntos exactos donde entraría cada uno
están inventariados en [docs/api-reference.md](docs/api-reference.md).

## Arrancar

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`.

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

backend/           esqueleto FastAPI, sin código
database/          esqueleto SQL, sin contenido
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
