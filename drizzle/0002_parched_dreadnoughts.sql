CREATE TYPE "public"."rol_usuario" AS ENUM('usuario', 'admin');--> statement-breakpoint
CREATE TABLE "perfiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre_mostrado" text DEFAULT 'Voz anonima' NOT NULL,
	"email" text,
	"rol" "rol_usuario" DEFAULT 'usuario' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participaciones" ADD COLUMN "autor_id" uuid;--> statement-breakpoint
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_autor_id_perfiles_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."perfiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- perfiles.id es el mismo id de auth.users: si se borra el usuario, se borra el perfil.
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_id_auth_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Trigger: al crear un usuario en auth.users, crear su perfil en public.perfiles.
-- nombre_mostrado por defecto = parte local del email (antes del @).
CREATE OR REPLACE FUNCTION "public"."handle_new_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, email, nombre_mostrado)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(split_part(NEW.email, '@', 1), ''), 'Voz anonima')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";--> statement-breakpoint
CREATE TRIGGER "on_auth_user_created"
AFTER INSERT ON "auth"."users"
FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();--> statement-breakpoint

-- RLS como red de seguridad. El rol de la conexion Drizzle (postgres/pooler) la bypassa,
-- asi que lecturas/escrituras del backend siguen funcionando. Esto solo afecta a los
-- clientes anon/authenticated de @supabase/ssr.
ALTER TABLE "perfiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "participaciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "imagenes_participacion" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE POLICY "perfiles_lectura_publica" ON "perfiles"
  FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "perfiles_update_propio" ON "perfiles"
  FOR UPDATE USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);--> statement-breakpoint

CREATE POLICY "participaciones_lectura_publica" ON "participaciones"
  FOR SELECT USING (true);--> statement-breakpoint
CREATE POLICY "imagenes_lectura_publica" ON "imagenes_participacion"
  FOR SELECT USING (true);