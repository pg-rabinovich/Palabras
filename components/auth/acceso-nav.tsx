import Link from "next/link"
import { cache } from "react"
import { count, eq } from "drizzle-orm"

import { obtenerBaseDatos } from "@/lib/db/conexion"
import { participaciones, perfiles } from "@/lib/db/esquema"
import { Button } from "@/components/ui/button"
import { crearSupabaseServidor } from "@/lib/supabase/servidor"

// Lee la sesion y devuelve la firma + rol del usuario actual (o null).
// cache(): varias llamadas en un mismo request (pagina + header) hacen una sola consulta.
export const obtenerSesion = cache(async function obtenerSesion() {
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

  const rol = perfil?.rol ?? "usuario"

  // Para admins: cuantas piezas esperan curaduria (se muestra en el menu).
  let pendientes = 0
  if (rol === "admin") {
    const [fila] = await db
      .select({ total: count() })
      .from(participaciones)
      .where(eq(participaciones.estado, "borrador"))
    pendientes = Number(fila?.total ?? 0)
  }

  return {
    id: user.id,
    nombreMostrado: perfil?.nombreMostrado ?? "Voz anonima",
    rol,
    pendientes,
  }
})

// Bloque de acceso/sesion para los headers (CTA si no hay sesion, firma + salir si la hay).
export async function AccesoNav() {
  const sesion = await obtenerSesion()

  if (!sesion) {
    return (
      <Button
        asChild
        size="lg"
        className="h-11 w-full rounded-full bg-primary px-6 font-mono text-[0.68rem] tracking-[0.2em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground sm:w-auto sm:tracking-[0.28em]"
      >
        <Link href="/participacion">Entrar a la instalacion</Link>
      </Button>
    )
  }

  // Con sesion, la firma, el dashboard y Salir viven en el menu del header.
  return null
}
