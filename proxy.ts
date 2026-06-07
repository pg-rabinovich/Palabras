import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Rutas que requieren sesion. El resto es publico (lectura abierta).
const RUTAS_PRIVADAS = ["/participacion"]

export async function proxy(request: NextRequest) {
  let respuesta = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesAGuardar) {
          cookiesAGuardar.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          respuesta = NextResponse.next({ request })
          cookiesAGuardar.forEach(({ name, value, options }) => {
            respuesta.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANTE: refresca la sesion. No poner logica entre createServerClient y getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const esPrivada = RUTAS_PRIVADAS.some((ruta) =>
    request.nextUrl.pathname.startsWith(ruta)
  )

  if (esPrivada && !user) {
    const urlAcceso = request.nextUrl.clone()
    urlAcceso.pathname = "/acceso"
    urlAcceso.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(urlAcceso)
  }

  return respuesta
}

export const config = {
  matcher: [
    // Todo menos assets estaticos, imagenes y favicon.
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
