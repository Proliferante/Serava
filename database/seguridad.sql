-- ═══════════════════════════════════════════════════════════════════════════
-- ZEQUARA · endurecimiento de la base (Postgres / Supabase)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Se aplica DESPUÉS de schema.sql, y es idempotente: se puede correr las
-- veces que haga falta.
--
-- EL PROBLEMA QUE RESUELVE
--
-- Supabase publica una API REST (PostgREST) sobre la misma base, y la llave
-- "publishable" que la abre está pensada para ir dentro del navegador: es
-- pública por diseño. Quien la tenga puede pedirle a esa API lo que los roles
-- `anon` y `authenticated` tengan permitido.
--
-- Al revisarlo, esos dos roles tenían SELECT, INSERT, UPDATE, DELETE y
-- TRUNCATE sobre `usuarios` y sobre `inmueble_detalle`. Lo único que impedía
-- que cualquiera leyera los hashes de contraseña —o vaciara la tabla de
-- usuarios— era que RLS estaba activado sin ninguna política, así que negaba
-- todo por defecto.
--
-- Eso funciona, pero es un solo cerrojo. El día que alguien añada una política
-- permisiva desde el panel de Supabase (o desactive RLS "un momento para
-- probar"), los permisos siguen ahí debajo y la tabla queda abierta de par en
-- par. Este archivo quita los permisos, que es el cerrojo de verdad: aunque
-- RLS se caiga, no hay nada que conceder.
--
-- NADA DE ESTO AFECTA AL BACKEND. La aplicación se conecta como `postgres`,
-- dueño de las tablas, y los permisos del dueño no se tocan.
--
-- Para aplicarlo:
--   psql "$DATABASE_URL" -f database/seguridad.sql
-- o pegarlo en el editor SQL de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- 1. QUITAR LOS PERMISOS DE LOS ROLES PÚBLICOS
-- ───────────────────────────────────────────────────────────────────────────
--
-- `anon`          — quien llega con la llave publicable, sin sesión.
-- `authenticated` — quien tiene una sesión de Supabase Auth. Como el proyecto
--                   no usa Supabase Auth (la sesión la emite nuestro backend),
--                   este rol no debería poder nada tampoco.
-- `service_role`  — la llave de servidor. Se deja intacta a propósito: es
--                   secreta y es la que usaría un proceso nuestro si algún día
--                   hace falta. Si se filtra, el problema es la filtración.

REVOKE ALL ON TABLE usuarios                FROM anon, authenticated;
REVOKE ALL ON TABLE inmueble_detalle        FROM anon, authenticated;
REVOKE ALL ON TABLE seguimiento_propiedades FROM anon, authenticated;
REVOKE ALL ON TABLE clean_listings          FROM anon, authenticated;
REVOKE ALL ON TABLE raw_listings            FROM anon, authenticated;

-- La secuencia del id de usuarios: sin esto, un rol con INSERT recuperado
-- podría seguir pidiéndole números.
REVOKE ALL ON SEQUENCE usuarios_id_seq FROM anon, authenticated;

-- Y que las tablas que se creen a partir de ahora no nazcan con permisos.
-- Sin esta línea, la próxima tabla que alguien cree repite el problema.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    REVOKE ALL ON SEQUENCES FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- 2. RLS ACTIVADO EN TODAS, COMO SEGUNDO CERROJO
-- ───────────────────────────────────────────────────────────────────────────
--
-- `usuarios`, `inmueble_detalle` y `seguimiento_propiedades` ya lo tenían.
-- Las dos del pipeline no, y aunque hoy `anon` no tiene permisos sobre ellas,
-- activarlo cuesta nada y cierra el caso de que alguien conceda un SELECT
-- "para una prueba".
--
-- Sin políticas = se niega todo. El backend no se entera: se conecta como
-- dueño de las tablas, y RLS no se aplica al dueño salvo que se fuerce (no se
-- fuerza).

ALTER TABLE usuarios                ENABLE ROW LEVEL SECURITY;
ALTER TABLE inmueble_detalle        ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimiento_propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clean_listings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_listings            ENABLE ROW LEVEL SECURITY;


-- ───────────────────────────────────────────────────────────────────────────
-- 3. REGISTRO DE INTENTOS DE ENTRADA
-- ───────────────────────────────────────────────────────────────────────────
--
-- Para dos cosas: frenar la fuerza bruta (el backend cuenta los fallos
-- recientes por correo y por IP antes de dejar intentar otra vez) y poder
-- responder "¿quién entró y cuándo?" cuando alguien lo pregunte.
--
-- NO se guarda la contraseña probada. Nunca, ni en los intentos fallidos: un
-- registro de contraseñas equivocadas es, sobre todo, un registro de
-- contraseñas de otras cuentas escritas por error.

CREATE TABLE IF NOT EXISTS intentos_acceso (
    id        BIGSERIAL PRIMARY KEY,
    correo    TEXT,
    ip        TEXT,
    exito     BOOLEAN     NOT NULL,
    motivo    TEXT,
    momento   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- El índice que usa el conteo de fallos recientes.
CREATE INDEX IF NOT EXISTS intentos_correo_momento_idx
    ON intentos_acceso (lower(correo), momento DESC);
CREATE INDEX IF NOT EXISTS intentos_ip_momento_idx
    ON intentos_acceso (ip, momento DESC);

ALTER TABLE intentos_acceso ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE intentos_acceso FROM anon, authenticated;
REVOKE ALL ON SEQUENCE intentos_acceso_id_seq FROM anon, authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- 4. COMPROBACIÓN
-- ───────────────────────────────────────────────────────────────────────────
-- Después de correr esto, esta consulta no debe devolver ninguna fila:
--
--   SELECT grantee, table_name, privilege_type
--     FROM information_schema.role_table_grants
--    WHERE grantee IN ('anon','authenticated') AND table_schema='public';
