import Link from "next/link"
import { eq } from "drizzle-orm"

import { obtenerBaseDatos } from "@/lib/db/conexion"
import { perfiles } from "@/lib/db/esquema"
import { Button } from "@/components/ui/button"
import { crearSupabaseServidor } from "@/lib/supabase/servidor"

// Lee la sesion y devuelve la firma + rol del usuario actual (o null).
export async function obtenerSesion() {
  const supabase = await crearSupabaseServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const db = obtenerBaseDatos()
  const [perfil] = await db
    .select({ nombreMostrado: perfiles.nombreMostrado, rol: perfiles.rol })
    .from(perfiles)
    .where(eq(perfiles.id, user.id))
    .limit(1)

  return {
    id: user.id,
    nombreMostrado: perfil?.nombreMostrado ?? "Voz anonima",
    rol: perfil?.rol ?? "usuario",
  }
}

// Bloque de acceso/sesion para los headers (CTA si no hay sesion, firma + salir si la hay).
export async function AccesoNav() {
  const sesion = await obtenerSesion()

  if (!sesion) {
    return (
      <Button
        asChild
        size="lg"
        className="h-11 w-full rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.2em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)] sm:w-auto sm:tracking-[0.28em]"
      >
        <Link href="/participacion">Entrar a la instalacion</Link>
      </Button>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:w-auto lg:justify-end">
      {sesion.rol === "admin" && (
        <Link
          href="/dashboard"
          className="font-mono text-[0.64rem] tracking-[0.24em] text-[rgb(217_255_31)] uppercase transition-colors hover:text-[rgb(109_40_255)]"
        >
          dashboard
        </Link>
      )}
      <span className="font-mono text-[0.64rem] tracking-[0.2em] text-[rgb(217_212_206_/_0.78)] uppercase">
        {sesion.nombreMostrado}
      </span>
      <form action="/auth/salir" method="post">
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.2em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)] sm:w-auto sm:tracking-[0.28em]"
        >
          Salir
        </Button>
      </form>
    </div>
  )
}
