-- Generado por backend/scripts/mudanza.py a partir del proyecto
-- zefxnsnctllplctttcuk. No se edita a mano: se vuelve a generar.

-- Extensiones que usa el esquema.
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public."bitacora" (
    "id" bigserial,
    "usuario_id" integer,
    "correo" text,
    "accion" text NOT NULL,
    "detalle" text,
    "ip" text,
    "momento" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "bitacora_pkey" PRIMARY KEY (id)
);

CREATE TABLE public."clean_listings" (
    "pais" text,
    "ciudad" text,
    "zona" text,
    "moneda" text,
    "portal" text,
    "link" text,
    "codigo_anuncio" text,
    "tipo_inmueble" text,
    "titulo" text,
    "precio_venta" double precision,
    "area_m2" double precision,
    "precio_m2" double precision,
    "precio_m2_clasificacion" text,
    "metodo_atipico" text,
    "mediana_precio_m2_zona" double precision,
    "bajo_media_zona" boolean,
    "habitaciones" double precision,
    "banos" double precision,
    "parqueaderos" double precision,
    "estrato" double precision,
    "administracion" double precision,
    "barrio_texto" text,
    "barrio_comun_texto" text,
    "posible_duplicado" boolean,
    "modelo_repetido_edificio_nuevo" boolean,
    "dentro_poligono_real" boolean,
    "distancia_similitud" double precision,
    "metodo_similitud" text,
    "similar_a_zona" boolean,
    "latitud" double precision,
    "longitud" double precision,
    "fecha_extraccion" text,
    "fecha_consulta" text,
    "observaciones" text,
    "filtro_arquitectonico" text,
    "motivo_no_pasa" text,
    "disponible" text,
    "motivo_no_disponible" text,
    "estado_seguimiento" text,
    "responsable" text,
    "fecha_actualizacion" text,
    "etapa" text,
    "requiere_revision" boolean
);

CREATE TABLE public."hub_contenido" (
    "id" serial,
    "slug" text NOT NULL,
    "tipo" text NOT NULL,
    "categoria" text NOT NULL,
    "titulo" text NOT NULL,
    "descripcion" text DEFAULT ''::text NOT NULL,
    "meta" text DEFAULT ''::text NOT NULL,
    "enlace" text DEFAULT ''::text NOT NULL,
    "foto" text,
    "pie_foto" text DEFAULT ''::text NOT NULL,
    "destacado" boolean DEFAULT false NOT NULL,
    "publicado" boolean DEFAULT false NOT NULL,
    "orden" integer DEFAULT 0 NOT NULL,
    "creado_en" timestamp with time zone DEFAULT now() NOT NULL,
    "actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
    "creado_por" text DEFAULT ''::text NOT NULL,
    CONSTRAINT "hub_contenido_pkey" PRIMARY KEY (id),
    CONSTRAINT "hub_contenido_slug_key" UNIQUE (slug)
);

CREATE TABLE public."inmueble_detalle" (
    "url_inmueble" text NOT NULL,
    "contacto_nombre" text,
    "contacto_telefono" text,
    "visita_fecha" date,
    "visita_hora" text,
    "visita_notas" text,
    "titulo" text,
    "habitaciones" integer,
    "banos" integer,
    "area_confirmada_m2" numeric,
    "tipo_transformacion" text,
    "notas_visita" text,
    "actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
    "actualizado_por" text,
    "ficha" jsonb,
    "ficha_fotos" jsonb,
    "ficha_publicada" boolean DEFAULT false NOT NULL,
    "ficha_guardada_en" timestamp with time zone,
    "ficha_guardada_por" text,
    "slug" text,
    "zona" text,
    "ciudad" text,
    "pais" text,
    "precio_venta" numeric,
    "parqueaderos" integer,
    "origen" text,
    CONSTRAINT "inmueble_detalle_pkey" PRIMARY KEY (url_inmueble)
);

CREATE TABLE public."intentos_acceso" (
    "id" bigserial,
    "correo" text,
    "ip" text,
    "exito" boolean NOT NULL,
    "motivo" text,
    "momento" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "intentos_acceso_pkey" PRIMARY KEY (id)
);

CREATE TABLE public."raw_listings" (
    "id" serial,
    "url_inmueble" text,
    "pais" text,
    "ciudad" text,
    "zona" text,
    "portal" text,
    "titulo" text,
    "codigo_anuncio" text,
    "tipo_inmueble" text,
    "precio_venta" text,
    "area_m2" text,
    "precio_m2" text,
    "habitaciones" text,
    "banos" text,
    "parqueaderos" text,
    "estrato" text,
    "barrio_texto" text,
    "barrio_comun_texto" text,
    "administracion" text,
    "antiguedad_texto" text,
    "latitud" text,
    "longitud" text,
    "en_scope_zona" text,
    "bajo_media_zona" text,
    "fecha_extraccion" text,
    CONSTRAINT "raw_listings_pkey" PRIMARY KEY (id),
    CONSTRAINT "raw_listings_url_inmueble_key" UNIQUE (url_inmueble)
);

CREATE TABLE public."seguimiento_propiedades" (
    "url_inmueble" text NOT NULL,
    "filtro_arquitectonico" text DEFAULT 'pendiente'::text,
    "motivo_no_pasa" text,
    "disponible" text DEFAULT 'pendiente'::text,
    "motivo_no_disponible" text,
    "estado_seguimiento" text,
    "responsable" text,
    "fecha_actualizacion" text,
    "etapa" text DEFAULT 'nuevo'::text,
    CONSTRAINT "seguimiento_etapa_valida" CHECK ((etapa = ANY (ARRAY['nuevo'::text, 'preseleccion'::text, 'visita'::text, 'publicado'::text, 'descartado'::text]))),
    CONSTRAINT "seguimiento_propiedades_pkey" PRIMARY KEY (url_inmueble)
);

CREATE TABLE public."sesiones" (
    "id" text NOT NULL,
    "usuario_id" integer NOT NULL,
    "creada" timestamp with time zone DEFAULT now() NOT NULL,
    "ultima_actividad" timestamp with time zone DEFAULT now() NOT NULL,
    "expira" timestamp with time zone NOT NULL,
    "revocada" timestamp with time zone,
    "ip" text,
    "agente" text,
    CONSTRAINT "sesiones_pkey" PRIMARY KEY (id)
);

CREATE TABLE public."usuarios" (
    "id" serial,
    "nombre" text NOT NULL,
    "correo" text NOT NULL,
    "clave_hash" text NOT NULL,
    "rol" text NOT NULL,
    "activo" boolean DEFAULT true NOT NULL,
    "debe_cambiar_clave" boolean DEFAULT true NOT NULL,
    "creado_en" timestamp with time zone DEFAULT now() NOT NULL,
    "ultimo_acceso" timestamp with time zone,
    CONSTRAINT "usuarios_rol_valido" CHECK ((rol = ANY (ARRAY['admin'::text, 'arquitectura'::text, 'data'::text, 'comercial'::text]))),
    CONSTRAINT "usuarios_pkey" PRIMARY KEY (id)
);

-- Índices que no vienen de una restricción.
CREATE INDEX bitacora_momento_idx ON public.bitacora USING btree (momento DESC);
CREATE INDEX clean_listings_ciudad_idx ON public.clean_listings USING btree (ciudad);
CREATE INDEX clean_listings_fecha_idx ON public.clean_listings USING btree (fecha_extraccion);
CREATE INDEX clean_listings_link_idx ON public.clean_listings USING btree (link);
CREATE INDEX clean_listings_zona_idx ON public.clean_listings USING btree (zona);
CREATE UNIQUE INDEX inmueble_detalle_slug_idx ON public.inmueble_detalle USING btree (slug) WHERE (slug IS NOT NULL);
CREATE INDEX intentos_correo_momento_idx ON public.intentos_acceso USING btree (lower(correo), momento DESC);
CREATE INDEX intentos_ip_momento_idx ON public.intentos_acceso USING btree (ip, momento DESC);
CREATE INDEX seguimiento_etapa_idx ON public.seguimiento_propiedades USING btree (etapa);
CREATE INDEX sesiones_expira_idx ON public.sesiones USING btree (expira);
CREATE INDEX sesiones_usuario_idx ON public.sesiones USING btree (usuario_id);
CREATE UNIQUE INDEX usuarios_correo_unico ON public.usuarios USING btree (lower(correo));

-- Claves foráneas, al final: necesitan todas las tablas creadas.
ALTER TABLE public."bitacora" ADD CONSTRAINT "bitacora_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE public."inmueble_detalle" ADD CONSTRAINT "inmueble_detalle_url_inmueble_fkey" FOREIGN KEY (url_inmueble) REFERENCES seguimiento_propiedades(url_inmueble) ON DELETE CASCADE;
ALTER TABLE public."sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
