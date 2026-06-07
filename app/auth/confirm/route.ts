import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

import { crearSupabaseServidor } from "@/lib/supabase/servidor"

// Destino del enlace del magic link. Verifica el token y entra a la sesion.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = searchParams.get("next") ?? "/participacion"

  if (tokenHash && type) {
    const supabase = await crearSupabaseServidor()
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  return NextResponse.redirect(new URL("/acceso?error=enlace", request.url))
}
