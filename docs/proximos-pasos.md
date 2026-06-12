# Próximos pasos y configuración pendiente

Estado al 2026-06-06: el login con magic link (Supabase) está funcionando en local y en
producción (`palabras-one.vercel.app`). Falta resolver el envío de emails y seguir con features.

---

## 1. Emails de auth con Resend — PENDIENTE (alta prioridad)

**Problema:** el mailer de prueba incorporado de Supabase tiene un límite muy bajo
(~2-4 mails/hora a nivel de todo el proyecto). Al probar el login se llega enseguida al error
`over_email_send_rate_limit` / "email rate limit exceeded". No sirve para uso real.

**Solución:** conectar un SMTP propio (Resend). Todo por dashboard, sin tocar código.

### Pasos
1. Crear cuenta en [resend.com](https://resend.com) con el gmail del proyecto.
2. Resend → **API Keys → Create API Key** → copiar la key.
3. Supabase → **Authentication → Emails → SMTP Settings** → activar **Enable Custom SMTP**:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: *(la API Key de Resend)*
   - Sender email: `onboarding@resend.dev` *(test, ver nota)*
   - Sender name: `Palabras`
4. Supabase → **Authentication → Rate Limits** → subir "emails per hour" (ej. 30-50).

### Nota importante sobre el dominio
Con el remitente de prueba `onboarding@resend.dev`, **Resend solo entrega al email con el que te
registraste** (alcanza para testear). Para enviar a cualquier persona hace falta un **dominio propio
verificado** en Resend (DNS/SPF/DKIM). `vercel.app` no sirve para esto: hay que comprar un dominio
(ej. `palabras.art`). Recién ahí el login queda usable para público real.

---

## 2. Roadmap de features

- **Ver/abrir las obras publicadas**: vista de detalle de cada participación (hoy solo se listan en
  `/obras-abiertas`, no se pueden abrir).
- **Editar perfil**: que el usuario pueda cambiar su firma (`perfiles.nombre_mostrado`); hoy sale
  automáticamente de la parte antes del `@` del email (trigger `handle_new_user`).
- **Flujo de estado** `borrador → publicada`: hoy todo se guarda como borrador y se muestra sin filtrar.
- **Dashboard admin**: el rol `admin` ya existe en el esquema; falta la pantalla para moderar/despublicar.
- **Limpieza**: el `?redirect=/participacion` que agrega `proxy.ts` al rebotar a `/acceso` hoy se
  ignora; se puede usar para volver a la página original tras loguear, o quitarlo.
- **p5.js**: reservado para piezas generativas más elaboradas (el fondo del login quedó en Canvas 2D
  nativo por peso/tipado).
- **Dominio propio**: necesario para emails a público (ver arriba) y para identidad del portfolio.

---

## Contexto del proyecto
La idea a futuro es que Palabras funcione también como **portfolio** (mostrar trabajo, buscar
oportunidades, etc.). Se construye paso a paso.
