# Base de datos

Este proyecto queda preparado para usar Supabase como Postgres y Storage.

## Variables

Crear `.env.local` con los mismos nombres de `.env.example`:

```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
SUPABASE_BUCKET_IMAGENES="imagenes-participacion"
```

`DATABASE_URL` debe usar el connection string de Supabase compatible con entornos serverless. Para DBeaver conviene usar la conexion directa o el session pooler que muestra Supabase en `Connect`.

## Tablas

La primera version usa:

`participaciones`

Campos principales: `titulo`, `texto_json`, `texto_html`, `texto_plano`, `estado`, `creado_en`, `actualizado_en`, `publicado_en`.

`imagenes_participacion`

Campos principales: `participacion_id`, `ruta_archivo`, `url_publica`, `nombre_archivo`, `tipo_mime`, `tamano_bytes`, `texto_alternativo`, `tipo`, `orden`, `creada_en`.

## Migraciones

Generar migracion:

```bash
npm run db:generate
```

Aplicar migracion:

```bash
npm run db:migrate
```

Abrir Drizzle Studio:

```bash
npm run db:studio
```

## DBeaver

1. Abrir DBeaver.
2. Crear nueva conexion `PostgreSQL`.
3. En Supabase, entrar al proyecto y abrir `Connect`.
4. Usar host, puerto, base, usuario y password que muestra Supabase.
5. Probar conexion.
6. Abrir el schema `public`.
7. Ver las tablas `participaciones` e `imagenes_participacion`.

Para ver cambios en tiempo real, refrescar la tabla o usar el boton de recarga de DBeaver despues de guardar desde la app.
