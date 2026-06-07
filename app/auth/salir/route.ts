import { NextResponse, type NextRequest } from "next/server"

import { crearSupabaseServidor } from "@/lib/supabase/servidor"

export async function POST(request: NextRequest) {
  const supabase = await crearSupabaseServidor()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/", request.url), { status: 303 })
}
