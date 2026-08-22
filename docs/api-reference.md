# Backend: estado y puntos de integración

Este documento no describe una API existente. **No hay backend.** Describe lo que
hay en el repositorio, y el inventario exacto de los puntos donde el frontend
espera uno.

---

## 1. Lo que hay hoy

El árbol de `backend/`, `database/` y la infraestructura existen como esqueleto,
pero **todos los archivos tienen 0 bytes**:

```
backend/
  requirements.txt          0 B
  .env.example              0 B
  app/
    main.py                 0 B
    api/
      auth.py               0 B
      dashboard.py          0 B
      inmuebles.py          0 B
      notificaciones.py     0 B
    core/
      config.py             0 B
      database.py           0 B
      security.py           0 B
    services/
      auth_service.py       0 B
      gcs_service.py        0 B
      inmueble_service.py   0 B

database/
  schema.sql                0 B
  seeds/data.sql            0 B

docker-compose.yml          0 B
.env.example                0 B
```

Del lado del frontend, [`frontend/lib/api.ts`](../frontend/lib/api.ts) también está
vacío y [`frontend/.env.local.example`](../frontend/.env.local.example) igual. No hay
cliente HTTP, ni variables de entorno, ni manejo de carga o error en ninguna
pantalla.

### Lo que el esqueleto deja entrever

Los nombres de archivo son la única intención registrada, y son coherentes con lo
que pide el frontend:

| Archivo previsto | Lo que le tocaría cubrir |
|---|---|
| `api/auth.py` + `services/auth_service.py` + `core/security.py` | Login del inversionista y sesión del área privada |
| `api/inmuebles.py` + `services/inmueble_service.py` | Catálogo de predios, ficha, análisis de valor y portafolio |
| `api/dashboard.py` | Las diez vistas del panel: avance, presupuesto, aprobaciones, interventoría, operación, documentos |
| `api/notificaciones.py` | La campana de la barra de proyecto y el badge de Aprobaciones |
| `services/gcs_service.py` | Almacenamiento de fotos de obra y documentos (Google Cloud Storage, por el nombre) |
| `core/config.py`, `core/database.py` | Configuración y conexión |
| `requirements.txt` vacío | La pila de Python no está fijada; la estructura `app/api · app/core · app/services` es el reparto habitual de FastAPI |

Nada de esto está implementado. Tomarlo como un plan, no como un contrato.

---

## 2. Puntos de integración abiertos en el frontend

Cada fila es un sitio donde hoy no pasa nada y donde entraría una llamada. Están
anotados en el propio código.

### Autenticación

| Archivo | Qué hace hoy |
|---|---|
| [`components/sections/login/LoginScreen.tsx:72`](../frontend/components/sections/login/LoginScreen.tsx#L72) | `submit` comprueba que usuario y clave no estén vacíos y hace `router.push("/predios")`. El comentario lo dice: *"Todavía no hay backend: el prototipo entra directo al área privada."* |
| [`components/responsive/login/LoginCompact.tsx:40`](../frontend/components/responsive/login/LoginCompact.tsx#L40) | Lo mismo en la vista fluida |

Consecuencia que conviene tener presente: **el área privada no está protegida**.
`/predios` y `/panel/*` se sirven a cualquiera que escriba la URL. No hay middleware,
ni cookie, ni comprobación en servidor.

### Formularios

| Archivo | Qué hace hoy |
|---|---|
| [`components/sections/solicitud/SolicitudAccesoScreen.tsx:234`](../frontend/components/sections/solicitud/SolicitudAccesoScreen.tsx#L234) | `onSubmit` sólo abre el modal de confirmación. El comentario marca el sitio: *"Cuando exista el backend, el POST va aquí antes de abrirlo."* |
| [`components/responsive/solicitud/SolicitudCompact.tsx:135`](../frontend/components/responsive/solicitud/SolicitudCompact.tsx#L135) | Igual en la vista fluida |
| [`components/DiagnosticoModal.tsx`](../frontend/components/DiagnosticoModal.tsx) | Las siete respuestas y los datos de contacto se quedan en estado local; el paso `capture` no envía nada |

### Catálogo y filtros

| Archivo | Qué hace hoy |
|---|---|
| [`app/predios/page.tsx:49`](../frontend/app/predios/page.tsx#L49) | *"Desplegable de la barra de filtros. Sin lógica todavía: no hay catálogo."* Los seis filtros y "Limpiar filtros" son decorativos |
| [`components/responsive/predios/PrediosCompact.tsx:125`](../frontend/components/responsive/predios/PrediosCompact.tsx#L125) | Lo mismo en la vista fluida |
| [`components/sections/hub/HubSection1Hero.tsx`](../frontend/components/sections/hub/HubSection1Hero.tsx) | Buscador, pestañas y chips de filtro tienen estado local pero no consultan nada |

### Panel

| Archivo | Qué hace hoy |
|---|---|
| [`components/sections/panel/AvanceScreen.tsx:16`](../frontend/components/sections/panel/AvanceScreen.tsx#L16) | Las notas por etapa son el formulario del diseño: *"no hay endpoint todavía, así que no persisten"* |
| [`components/sections/panel/OperacionScreen.tsx:19`](../frontend/components/sections/panel/OperacionScreen.tsx#L19) | *"Los filtros de la bitácora están pintados pero no filtran: el catálogo de eventos todavía no viene de ningún sitio"* |
| [`components/sections/panel/GestorScreen.tsx:13`](../frontend/components/sections/panel/GestorScreen.tsx#L13) | *"Escribir, agendar y añadir al calendario piden backend, que todavía no existe"* |
| [`components/sections/panel/AprobacionesScreen.tsx`](../frontend/components/sections/panel/AprobacionesScreen.tsx) | Los botones de aprobar/rechazar no tienen manejador |
| [`components/sections/panel/DocumentosScreen.tsx`](../frontend/components/sections/panel/DocumentosScreen.tsx) | Las descargas no apuntan a ningún archivo |
| [`components/panel/Shell.tsx`](../frontend/components/panel/Shell.tsx) | Campana de notificaciones, badge `2` de Aprobaciones y avatar `NR`: todo fijo |

En todas las vistas del panel, además, el proyecto (`La Cabrera · Bogotá`), el
estado (`En obra · Semana 9 de 12`) y las cifras vienen como valores por defecto de
`Shell` o escritos dentro de cada pantalla.

---

## 3. Las formas de datos que ya existen

Antes de diseñar la API conviene mirar estos tres tipos: son lo que el frontend ya
sabe pintar, y por tanto el contrato mínimo que tendría que alimentar.

### `Predio` — tarjeta y catálogo

[`components/predios/PredioCard.tsx:59`](../frontend/components/predios/PredioCard.tsx#L59)

```ts
type Predio = {
  badge:     { label: string; tone: "green" | "gold" | "amber" | "steel" | "dark" };
  score:     number;          // Score Zequara, 0–100
  photo:     string;          // pie del hueco de foto
  city:      string;          // "La Cabrera · Bogotá"
  title:     string;
  chip:      string;          // tipo de transformación previsto
  specs:     string;          // "320 m² · 3 hab · 3 baños · 2 parq"
  price:     string;          // "COP $3.100M"  ← ya formateado
  priceNote: string;
  tir:       number;          // TIR estimada, %
  horizon:   string;          // "Horizonte: 5 años"
  status:    string;
};
```

Los ocho registros de ejemplo están en
[`components/predios/data.ts`](../frontend/components/predios/data.ts). Nótese que
`price`, `specs` y `horizon` llegan **ya formateados como texto**: si la API devuelve
números y unidades, el formateo hay que añadirlo en el frontend.

### `Propiedad` — portafolio del inversionista

[`components/predios/PropiedadCard.tsx:33`](../frontend/components/predios/PropiedadCard.tsx#L33)

```ts
type Propiedad = {
  state:  { label: string; tone: "obra" | "arrendado" };
  photo:  string;
  city:   string;
  title:  string;
  specs:  string;
  metric:
    | { kind: "obra";  label: string; pct: number; aside: string; note: string }
    | { kind: "renta"; label: string; value: string; aside: string };
  invest: string;
  href:   string;   // destino de la tarjeta: "/panel" o "/panel/operacion"
};
```

La unión discriminada de `metric` es el punto interesante: la tarjeta cambia de
bloque según el activo esté en obra (barra de avance) o arrendado (canon e inquilino).

### `PanelKey` — las diez vistas privadas

[`components/panel/Shell.tsx`](../frontend/components/panel/Shell.tsx)

```ts
type PanelKey =
  | "resumen" | "avance" | "presupuesto" | "aprobaciones" | "interventoria"
  | "operacion" | "fotos" | "valor" | "documentos" | "gestor";
```

---

## 4. Al conectar la API, tener en cuenta

1. **Todo el contenido está dentro de los componentes.** Sólo `predios/data.ts` está
   extraído, y únicamente porque lo comparten las dos vistas. El primer trabajo real
   de integración es sacar el contenido de cada pantalla a módulos de datos.
2. **Hay dos árboles que pintar.** Cada pantalla tiene versión de escritorio y versión
   fluida (ver [arquitectura.md](arquitectura.md) §2). Los datos deben venir de un
   único sitio y consumirse desde ambos, como ya hace `data.ts`.
3. **No hay estados de carga ni de error** en ninguna pantalla, ni esqueletos. Habrá
   que añadirlos en las primitivas (`Card`/`PCard`, `StatCard`, `DocRow`…) para no
   repetirlos veinte veces.
4. **Las páginas son server components** que sólo componen. Es el sitio natural para
   el `fetch`, dejando los componentes de presentación como están.
5. **Falta protección del área privada.** Cuando exista autenticación real hay que
   añadir middleware sobre `/predios/*` y `/panel/*`; hoy son públicas.
