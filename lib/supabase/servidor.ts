import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

// Cliente de Supabase para Server Components y route handlers.
// Lee/escribe la sesion en cookies via next/headers.
export async function crearSupabaseServidor() {
  const almacenCookies = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return almacenCookies.getAll()
        },
        setAll(cookiesAGuardar) {
          try {
            cookiesAGuardar.forEach(({ name, value, options }) => {
              almacenCookies.set(name, value, options)
            })
          } catch {
            // Llamado desde un Server Component: lo ignoramos porque el
            // middleware ya se encarga de refrescar la sesion.
          }
        },
      },
    }
  )
}
