import { NextResponse } from "next/server"

import { obtenerBaseDatos } from "@/lib/db/conexion"
import {
  imagenesParticipacion,
  participaciones,
} from "@/lib/db/esquema"
import {
  bucketImagenesParticipacion,
  obtenerSupabaseAdmin,
} from "@/lib/supabase/admin"

function faltaConfiguracion() {
  return (
    !process.env.DATABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function limpiarNombreArchivo(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
}

export async function POST(request: Request) {
  if (faltaConfiguracion()) {
    return NextResponse.json(
      {
        mensaje:
          "Falta configurar Supabase y DATABASE_URL para guardar participaciones.",
      },
      { status: 501 }
    )
  }

  try {
    const datos = await request.formData()
    const titulo = String(datos.get("titulo") ?? "").trim()
    const nombreAutor =
      String(datos.get("nombre_autor") ?? "").trim() || "Voz anonima"
    const textoHtml = String(datos.get("texto_html") ?? "")
    const textoPlano = String(datos.get("texto_plano") ?? "").trim()
    const textoJsonRaw = String(datos.get("texto_json") ?? "{}")
    const textoJson = JSON.parse(textoJsonRaw) as unknown

    if (!titulo || !textoPlano) {
      return NextResponse.json(
        { mensaje: "Falta titulo o texto para guardar." },
        { status: 400 }
      )
    }

    const db = obtenerBaseDatos()
    const supabase = obtenerSupabaseAdmin()

    const [participacion] = await db
      .insert(participaciones)
      .values({
        titulo,
        nombreAutor,
        textoJson,
        textoHtml,
        textoPlano,
      })
      .returning({ id: participaciones.id })

    const archivos = datos
      .getAll("imagenes")
      .filter((archivo): archivo is File => archivo instanceof File && archivo.size > 0)

    const imagenesGuardadas: (typeof imagenesParticipacion.$inferInsert)[] = []

    for (const [index, archivo] of archivos.entries()) {
      const nombreLimpio = limpiarNombreArchivo(archivo.name)
      const rutaArchivo = `participaciones/${participacion.id}/${crypto.randomUUID()}-${nombreLimpio}`

      const { error } = await supabase.storage
        .from(bucketImagenesParticipacion)
        .upload(rutaArchivo, archivo, {
          contentType: archivo.type,
          upsert: false,
        })

      if (error) {
        throw error
      }

      const { data } = supabase.storage
        .from(bucketImagenesParticipacion)
        .getPublicUrl(rutaArchivo)

      imagenesGuardadas.push({
        participacionId: participacion.id,
        rutaArchivo,
        urlPublica: data.publicUrl,
        nombreArchivo: archivo.name,
        tipoMime: archivo.type,
        tamanoBytes: archivo.size,
        textoAlternativo: archivo.name,
        tipo: index === 0 ? "portada" : "galeria",
        orden: index,
      })
    }

    if (imagenesGuardadas.length > 0) {
      await db.insert(imagenesParticipacion).values(imagenesGuardadas)
    }

    return NextResponse.json({ id: participacion.id })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { mensaje: "No se pudo guardar la participacion." },
      { status: 500 }
    )
  }
}
