import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { obtenerBaseDatos } from "@/lib/db/conexion"
import {
  imagenesParticipacion,
  participaciones,
  perfiles,
} from "@/lib/db/esquema"
import {
  bucketImagenesParticipacion,
  obtenerSupabaseAdmin,
} from "@/lib/supabase/admin"
import { crearSupabaseServidor } from "@/lib/supabase/servidor"

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

  // Login obligatorio para publicar.
  const supabaseAuth = await crearSupabaseServidor()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { mensaje: "Necesitas iniciar sesion para publicar." },
      { status: 401 }
    )
  }

  try {
    const datos = await request.formData()
    const titulo = String(datos.get("titulo") ?? "").trim()
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

    // La firma sale del perfil, no del formulario (snapshot al momento de guardar).
    const [perfil] = await db
      .select({ nombreMostrado: perfiles.nombreMostrado })
      .from(perfiles)
      .where(eq(perfiles.id, user.id))
      .limit(1)

    const nombreAutor = perfil?.nombreMostrado ?? "Voz anonima"

    const [participacion] = await db
      .insert(participaciones)
      .values({
        titulo,
        autorId: user.id,
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
