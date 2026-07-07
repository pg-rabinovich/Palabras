import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { obtenerBaseDatos } from "@/lib/db/conexion"
import { perfiles } from "@/lib/db/esquema"
import { crearSupabaseServidor } from "@/lib/supabase/servidor"

// Actualiza la firma (nombre_mostrado) del usuario logueado.
export async function PATCH(request: Request) {
  const supabase = await crearSupabaseServidor()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { mensaje: "Necesitas iniciar sesion." },
      { status: 401 }
    )
  }

  const cuerpo = (await request.json().catch(() => ({}))) as {
    nombreMostrado?: string
  }
  const nombre = String(cuerpo.nombreMostrado ?? "").trim()

  if (!nombre) {
    return NextResponse.json(
      { mensaje: "La firma no puede estar vacia." },
      { status: 400 }
    )
  }

  if (nombre.length > 60) {
    return NextResponse.json(
      { mensaje: "La firma es demasiado larga (max 60)." },
      { status: 400 }
    )
  }

  try {
    const db = obtenerBaseDatos()
    await db
      .update(perfiles)
      .set({ nombreMostrado: nombre, actualizadoEn: new Date() })
      .where(eq(perfiles.id, user.id))

    return NextResponse.json({ nombreMostrado: nombre })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { mensaje: "No se pudo guardar la firma." },
      { status: 500 }
    )
  }
}
