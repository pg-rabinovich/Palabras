import { createBrowserClient } from "@supabase/ssr"

// Cliente de Supabase para componentes "use client" (ej. el formulario de acceso).
export function crearSupabaseCliente() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
