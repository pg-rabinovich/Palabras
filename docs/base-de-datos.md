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

`perfiles`

1:1 con `auth.users` de Supabase (mismo `id`). Se crea automaticamente con el trigger
`on_auth_user_created` cuando se registra un usuario. Campos: `id`, `nombre_mostrado` (la firma
publica), `email`, `rol` (`usuario` | `admin`), `creado_en`, `actualizado_en`.

`participaciones`

Campos principales: `titulo`, `autor_id` (FK a `perfiles`, se completa con el usuario logueado),
`nombre_autor` (snapshot de la firma), `texto_json`, `texto_html`, `texto_plano`, `estado`,
`creado_en`, `actualizado_en`, `publicado_en`.

`imagenes_participacion`

Campos principales: `participacion_id`, `ruta_archivo`, `url_publica`, `nombre_archivo`, `tipo_mime`, `tamano_bytes`, `texto_alternativo`, `tipo`, `orden`, `creada_en`.

## Autenticacion (magic link)

Se usa Supabase Auth con magic link (sin contrasenas). Para que el login funcione:

1. En Supabase, ir a `Authentication > URL Configuration` y agregar a *Redirect URLs*:
   - `http://localhost:3000/auth/confirm`
   - `https://<tu-dominio-vercel>/auth/confirm`
2. (Opcional pero recomendado) En `Authentication > Email Templates > Magic Link`, asegurarse de
   que el enlace use el flujo de `token_hash` apuntando a `/auth/confirm`.

El trigger y las policies RLS se aplican junto con la migracion `0002` (`npm run db:migrate`).
La conexion de Drizzle usa un rol que bypassa RLS, por eso las lecturas/escrituras del backend
siguen funcionando; RLS solo limita a los clientes anon/authenticated del browser.

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
