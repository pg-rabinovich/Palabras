"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { obtenerSesion } from "@/components/auth/acceso-nav"
import { obtenerBaseDatos } from "@/lib/db/conexion"
import { participaciones } from "@/lib/db/esquema"

type Estado = "borrador" | "publicada" | "rechazada"
const ESTADOS_VALIDOS: Estado[] = ["borrador", "publicada", "rechazada"]

async function esAdmin() {
  const sesion = await obtenerSesion()
  return sesion?.rol === "admin"
}

// Cambia el estado de una participacion (aprobar/rechazar/despublicar/restaurar).
export async function moverParticipacion(formData: FormData) {
  if (!(await esAdmin())) return

  const id = String(formData.get("id") ?? "")
  const estado = String(formData.get("estado") ?? "") as Estado

  if (!id || !ESTADOS_VALIDOS.includes(estado)) return

  const db = obtenerBaseDatos()
  await db
    .update(participaciones)
    .set({
      estado,
      publicadoEn: estado === "publicada" ? new Date() : null,
      actualizadoEn: new Date(),
    })
    .where(eq(participaciones.id, id))

  revalidatePath("/dashboard")
  revalidatePath("/obras-abiertas")
}
