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

const MAX_IMAGENES = 5
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB por imagen

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
    .replace(/[̀-ͯ]/g, "")
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

  // Login opcional: cualquiera puede subir. Si el usuario es admin, se
  // auto-aprueba; si no (anonimo o usuario comun), queda pendiente de curaduria.
  const supabaseAuth = await crearSupabaseServidor()
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser()

  try {
    const datos = await request.formData()

    // Honeypot: si un bot completa este campo oculto, descartamos en silencio.
    if (String(datos.get("sitio_web") ?? "").trim()) {
      return NextResponse.json({ estado: "borrador" })
    }

    const titulo = String(datos.get("titulo") ?? "").trim()
    const firmaForm = String(datos.get("nombre_autor") ?? "").trim()
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

    const archivos = datos
      .getAll("imagenes")
      .filter(
        (archivo): archivo is File =>
          archivo instanceof File && archivo.size > 0
      )

    // Salvaguardas de imagenes.
    if (archivos.length > MAX_IMAGENES) {
      return NextResponse.json(
        { mensaje: `Maximo ${MAX_IMAGENES} imagenes por pieza.` },
        { status: 400 }
      )
    }
    for (const archivo of archivos) {
      if (!archivo.type.startsWith("image/")) {
        return NextResponse.json(
          { mensaje: "Solo se permiten imagenes." },
          { status: 400 }
        )
      }
      if (archivo.size > MAX_BYTES) {
        return NextResponse.json(
          { mensaje: "Cada imagen debe pesar menos de 5 MB." },
          { status: 400 }
        )
      }
    }

    const db = obtenerBaseDatos()
    const supabase = obtenerSupabaseAdmin()

    // Perfil (si esta logueado): firma por defecto + rol para auto-aprobar.
    const [perfil] = user
      ? await db
          .select({
            nombreMostrado: perfiles.nombreMostrado,
            rol: perfiles.rol,
          })
          .from(perfiles)
          .where(eq(perfiles.id, user.id))
          .limit(1)
      : [undefined]

    const esAdmin = perfil?.rol === "admin"
    const nombreAutor = firmaForm || perfil?.nombreMostrado || "Voz anonima"
    const estado = esAdmin ? "publicada" : "borrador"

    const [participacion] = await db
      .insert(participaciones)
      .values({
        titulo,
        autorId: user?.id ?? null,
        nombreAutor,
        textoJson,
        textoHtml,
        textoPlano,
        estado,
        publicadoEn: esAdmin ? new Date() : null,
      })
      .returning({ id: participaciones.id })

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

    return NextResponse.json({ id: participacion.id, estado })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { mensaje: "No se pudo guardar la participacion." },
      { status: 500 }
    )
  }
}
