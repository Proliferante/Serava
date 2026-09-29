-- ═══════════════════════════════════════════════════════════════════════════
--  cerrar_zequara.sql — cierra la API pública de Supabase sobre `public`
--  Proyecto: Zequara (fktnxbmundhmwlqibfcc)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- QUÉ PASÓ
--   `mudanza_zequara.sql` recreó las 9 tablas en el proyecto nuevo con su DDL,
--   pero no trajo lo que `seguridad.sql` había hecho en PGI: quitarles los
--   permisos a `anon` y `authenticated` y activar RLS. En un proyecto de
--   Supabase recién creado, esos dos roles tienen TODO sobre `public` por
--   defecto, y la API REST (`https://<ref>.supabase.co/rest/v1/...`) los
--   atiende con la llave publicable, que no es secreta. Supabase lo avisó el
--   27 de septiembre de 2026 como `rls_disabled_in_public`.
--
--   Lo expuesto incluía `usuarios` (hashes de contraseña) y `sesiones` (los
--   identificadores de sesión vivos: con uno se entra a la consola como su
--   dueño). Por eso el paso 4 cierra todas las sesiones.
--
-- POR QUÉ NO ROMPE EL BACKEND
--   El backend entra por DATABASE_URL como `postgres`, dueño de las tablas.
--   RLS no se aplica al dueño salvo con FORCE, y aquí no se fuerza. Las fotos
--   van al almacén con la llave de servicio, que también se salta RLS.
--
-- CÓMO SE APLICA
--   Supabase → proyecto Zequara → SQL Editor → pegar entero → Run.
--   Se puede correr más de una vez sin daño.
-- ═══════════════════════════════════════════════════════════════════════════


-- 1. RLS EN TODAS LAS TABLAS DE `public`, Y SIN PERMISOS PARA LA API ──────────
--
-- En bucle y no tabla por tabla: así entran también las que crea el backend
-- solo al arrancar (`hub_contenido`, `raw_listings`…) y cualquiera que se
-- haya añadido después de escribir esto.
--
-- Sin políticas, RLS niega todo. Y el REVOKE quita el permiso aunque alguien
-- active una política "para probar": son dos cerrojos, no uno.

DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', t.tablename);
  END LOOP;
END $$;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;


-- 2. LO QUE SE CREE MAÑANA NACE CERRADO ───────────────────────────────────────
--
-- Los permisos por defecto de Supabase le dan a `anon` todo lo nuevo que
-- cree `postgres`. El backend crea tablas al arrancar, así que sin esto la
-- próxima tabla volvería a nacer abierta.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;


-- 3. Y CON RLS ACTIVADO DESDE QUE NACE ────────────────────────────────────────
--
-- Un disparador de eventos que activa RLS en cada tabla nueva de `public`.
-- Es el que recomienda la documentación de Supabase para este aviso.

CREATE OR REPLACE FUNCTION public.rls_en_tablas_nuevas()
RETURNS event_trigger LANGUAGE plpgsql AS $$
DECLARE obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands()
             WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
               AND object_type = 'table' AND schema_name = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
  END LOOP;
END $$;

REVOKE ALL ON FUNCTION public.rls_en_tablas_nuevas() FROM anon, authenticated, public;

DROP EVENT TRIGGER IF EXISTS rls_en_tablas_nuevas;
CREATE EVENT TRIGGER rls_en_tablas_nuevas ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_en_tablas_nuevas();


-- 4. CERRAR TODAS LAS SESIONES ────────────────────────────────────────────────
--
-- La tabla `sesiones` estuvo legible desde fuera. No se sabe si alguien la
-- leyó, y no hace falta saberlo: cerrarlas cuesta que el equipo vuelva a
-- entrar una vez, y deja inservible cualquier identificador copiado.

UPDATE public.sesiones SET revocada = now() WHERE revocada IS NULL;


-- 5. COMPROBACIÓN ─────────────────────────────────────────────────────────────
--
-- Tiene que salir `rls = true` y `anon_puede = false` en todas las filas.

SELECT c.relname                                            AS tabla,
       c.relrowsecurity                                     AS rls,
       has_table_privilege('anon', c.oid, 'SELECT')         AS anon_puede
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY 1;
