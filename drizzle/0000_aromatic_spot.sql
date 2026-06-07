CREATE TYPE "public"."estado_participacion" AS ENUM('borrador', 'publicada');--> statement-breakpoint
CREATE TYPE "public"."tipo_imagen_participacion" AS ENUM('portada', 'galeria', 'editor');--> statement-breakpoint
CREATE TABLE "imagenes_participacion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participacion_id" uuid NOT NULL,
	"ruta_archivo" text NOT NULL,
	"url_publica" text,
	"nombre_archivo" text NOT NULL,
	"tipo_mime" text NOT NULL,
	"tamano_bytes" integer NOT NULL,
	"ancho" integer,
	"alto" integer,
	"texto_alternativo" text,
	"tipo" "tipo_imagen_participacion" DEFAULT 'galeria' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"creada_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"titulo" text NOT NULL,
	"texto_json" jsonb NOT NULL,
	"texto_html" text NOT NULL,
	"texto_plano" text NOT NULL,
	"estado" "estado_participacion" DEFAULT 'borrador' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"publicado_en" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "imagenes_participacion" ADD CONSTRAINT "imagenes_participacion_participacion_id_participaciones_id_fk" FOREIGN KEY ("participacion_id") REFERENCES "public"."participaciones"("id") ON DELETE cascade ON UPDATE no action;