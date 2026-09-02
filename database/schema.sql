-- ═══════════════════════════════════════════════════════════════════════════
-- ZEQUARA · esquema de la base (Postgres / Supabase, proyecto "Project PGI")
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Este archivo estaba vacío: el esquema existía sólo dentro de Supabase y no
-- había de dónde recrearlo. Aquí queda escrito.
--
-- Dos familias de tablas, y la diferencia entre ellas es la regla más
-- importante de todo el proyecto:
--
--   1. LO QUE EL PIPELINE RECONSTRUYE — `raw_listings` y `clean_listings`.
--      Cada corrida del scraping las vuelve a escribir. Nada que haya
--      escrito una persona puede vivir aquí: se perdería en la corrida
--      siguiente. Su forma la definen los scripts
--      (app/services/admin/script_extract_serava.py y script_transform_*),
--      que las crean con pandas.to_sql — por eso abajo sólo se documentan,
--      no se declaran columna por columna.
--
--   2. LO QUE ESCRIBEN LAS PERSONAS — `usuarios`, `seguimiento_propiedades`
--      e `inmueble_detalle`. El pipeline NUNCA las toca; sólo lee la
--      segunda para cruzarla. Estas sí se declaran aquí, completas.
--
-- Para aplicarlo: pégalo en el editor SQL de Supabase, o
--   psql "$DATABASE_URL" -f database/schema.sql
-- Es idempotente (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS): se puede correr
-- sobre la base que ya está viva sin borrar nada.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1. TABLAS DEL PIPELINE (documentadas, las crean los scripts)
-- ───────────────────────────────────────────────────────────────────────────
--
-- raw_listings    — un registro por anuncio tal como llegó del portal, más
--                   `en_scope_zona`. La escribe script_extract_serava.py.
-- clean_listings  — el resultado de la limpieza: deduplicado, mediana de
--                   precio/m² por zona y moneda, marca de atípico,
--                   validación contra polígono y similitud MCD. La escribe
--                   script_transform_serava.py, que además le cruza el
--                   estado humano con LEFT JOIN por link.
--
-- Columnas de clean_listings que consume la consola (api/admin.py, COLUMNAS):
--   pais, ciudad, zona, moneda, portal, link, tipo_inmueble, titulo,
--   precio_venta, area_m2, precio_m2, precio_m2_clasificacion,
--   metodo_atipico, mediana_precio_m2_zona, bajo_media_zona, habitaciones,
--   banos, posible_duplicado, modelo_repetido_edificio_nuevo,
--   dentro_poligono_real, similar_a_zona, filtro_arquitectonico,
--   motivo_no_pasa, disponible, requiere_revision
--
-- Las cuatro últimas no son del scraping: entran por el cruce con
-- seguimiento_propiedades.


-- ───────────────────────────────────────────────────────────────────────────
-- 2. USUARIOS INTERNOS
-- ───────────────────────────────────────────────────────────────────────────
--
-- Los crea un administrador; no hay registro abierto. El rol decide a qué
-- módulos de la consola entra cada quien.
--
-- `correo` se guarda siempre en minúsculas y es la identidad para entrar:
-- que alguien escriba "Nati.C@..." o "nati.c@..." no puede cambiar quién es.
-- Lo garantiza el índice único sobre lower(correo), no la buena voluntad del
-- código que inserta.
--
-- `clave_hash` es bcrypt. Nunca se guarda ni se registra la contraseña.
--
-- `debe_cambiar_clave` arranca en TRUE para los usuarios que crea el
-- administrador con una contraseña temporal: mientras esté en TRUE la
-- consola pide cambiarla antes de dejar trabajar. Sin esto, la contraseña
-- temporal que se reparte por chat se queda puesta para siempre.

CREATE TABLE IF NOT EXISTS usuarios (
    id                  SERIAL PRIMARY KEY,
    nombre              TEXT        NOT NULL,
    correo              TEXT        NOT NULL,
    clave_hash          TEXT        NOT NULL,
    rol                 TEXT        NOT NULL,
    activo              BOOLEAN     NOT NULL DEFAULT TRUE,
    debe_cambiar_clave  BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),
    ultimo_acceso       TIMESTAMPTZ,
    CONSTRAINT usuarios_rol_valido
        CHECK (rol IN ('admin', 'arquitectura', 'data', 'comercial'))
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_correo_unico
    ON usuarios (lower(correo));


-- ───────────────────────────────────────────────────────────────────────────
-- 3. SEGUIMIENTO — el estado humano de cada inmueble
-- ───────────────────────────────────────────────────────────────────────────
--
-- La tabla que hace que "descartado no vuelve a entrar" funcione. La crea
-- app/services/admin/seguimiento.py; se declara aquí igual para que el
-- esquema esté completo en un solo sitio.
--
-- El pipeline la LEE (cruzar_seguimiento, LEFT JOIN por url_inmueble) y
-- nunca la reconstruye: un `no_pasa` de agosto sigue vigente en septiembre
-- aunque el scraping se corra desde cero.

CREATE TABLE IF NOT EXISTS seguimiento_propiedades (
    url_inmueble          TEXT PRIMARY KEY,
    filtro_arquitectonico TEXT DEFAULT 'pendiente',   -- pendiente | pasa | no_pasa
    motivo_no_pasa        TEXT,
    disponible            TEXT DEFAULT 'pendiente',   -- pendiente | disponible | no_disponible
    motivo_no_disponible  TEXT,
    estado_seguimiento    TEXT,                       -- texto corto: "contactado", "visita agendada"…
    responsable           TEXT,
    fecha_actualizacion   TEXT
);

-- Las cinco pantallas del flujo necesitan saber en qué etapa va cada
-- inmueble sin tener que deducirlo de tres campos a la vez. `etapa` es esa
-- respuesta directa, y es lo que consulta GET /api/admin/flujo.
--
-- Se deriva de los otros campos, no los reemplaza: 'nuevo' mientras nadie
-- decida, 'preseleccion' al pasar el primer filtro, 'visita' al agendar,
-- 'publicado' al completar tras la visita, 'descartado' en cualquier punto.
ALTER TABLE seguimiento_propiedades
    ADD COLUMN IF NOT EXISTS etapa TEXT DEFAULT 'nuevo';

-- `ADD CONSTRAINT` no acepta IF NOT EXISTS en Postgres, así que va envuelto:
-- si el archivo se corre dos veces, la segunda no falla.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'seguimiento_etapa_valida'
    ) THEN
        ALTER TABLE seguimiento_propiedades
            ADD CONSTRAINT seguimiento_etapa_valida
            CHECK (etapa IN ('nuevo', 'preseleccion', 'visita', 'publicado', 'descartado'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS seguimiento_etapa_idx
    ON seguimiento_propiedades (etapa);


-- ───────────────────────────────────────────────────────────────────────────
-- 4. DETALLE DEL INMUEBLE — la visita y lo que se completa después
-- ───────────────────────────────────────────────────────────────────────────
--
-- Tabla aparte y no columnas nuevas en `clean_listings`, por la regla del
-- principio: clean_listings se reconstruye en cada corrida y esto lo
-- escriben personas. Se relaciona por la misma clave que el seguimiento —
-- la URL del anuncio — porque es lo único estable entre corridas: los ids
-- de fila de clean_listings cambian cada vez.
--
-- Pantalla 3 llena el contacto y la cita; pantalla 4, el resto.

CREATE TABLE IF NOT EXISTS inmueble_detalle (
    url_inmueble        TEXT PRIMARY KEY
                        REFERENCES seguimiento_propiedades (url_inmueble)
                        ON DELETE CASCADE,

    -- contacto y visita (pantalla 3)
    contacto_nombre     TEXT,
    contacto_telefono   TEXT,
    visita_fecha        DATE,
    visita_hora         TEXT,
    visita_notas        TEXT,

    -- lo que confirma arquitectura tras la visita (pantalla 4)
    titulo              TEXT,
    habitaciones        INTEGER,
    banos               INTEGER,
    area_confirmada_m2  NUMERIC,
    tipo_transformacion TEXT,
    notas_visita        TEXT,

    actualizado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
    actualizado_por     TEXT
);
