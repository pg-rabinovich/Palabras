import { and, asc, desc, eq } from "drizzle-orm"

import { obtenerBaseDatos } from "@/lib/db/conexion"
import { imagenesParticipacion, participaciones } from "@/lib/db/esquema"

// Imagen fija de las cards: la mujer con el rayo (la misma del inicio).
export const imagenMujer = "/images/banner-home-3.png"

// Fondos fijos de las cards, se repiten en orden. "negro" = card en negro.
// Para variar el mosaico, agrega/reordena imagenes aca.
export const fondosCards = [
  imagenMujer,
  "/images/imogen_cunningh.jpg",
  imagenMujer,
  "negro",
  "/images/imogen_cunningh2.jpg",
  imagenMujer,
]

// Firmas inventadas para las piezas sin autor real: mezcla de personas y
// colectivos/companias de guion.
const firmasInventadas = [
  "Lucia Vera",
  "Taller Nocturno",
  "Mateo Roldan",
  "Colectivo Margen",
  "Irene Salas",
  "Sala Cero Guion",
  "Tomas Bruno",
  "Compania La Trama",
  "Camila Ferrer",
  "Cuarto de Guion",
  "Julian Ocampo",
  "Mesa de Luz",
  "Renata Ibanez",
  "Los Copistas",
  "Bruno Lisandro",
  "Cooperativa Relampago",
  "Paula Cifuentes",
  "Guionistas del Sur",
  "Nicolas Aymar",
  "Casa Borrador",
  "Delfina Otero",
  "Ensamble Papel",
  "Simon Vidal",
  "Estudio Palabra Viva",
  "Valentina Cruz",
  "Fabrica de Escenas",
  "Emilio Sosa",
  "Circulo de Tinta",
  "Antonia Reyes",
  "Ultimo Acto",
  "Federico Lamas",
  "Los Insomnes",
  "Sofia Bianchi",
  "Club de Relatos",
  "Ramiro Quiroga",
  "Taller Subterraneo",
  "Milagros Duarte",
  "Sociedad del Borrador",
  "Ignacio Farias",
  "Nucleo Ficcion",
  "Clara Bermudez",
  "Los Sin Firma",
  "Agustin Paredes",
  "Compania Fragmento",
  "Victoria Nardi",
  "Prosa Colectiva",
  "Franco Aguero",
]

// Hash estable de un string (para asignar una firma inventada por id, no por
// posicion en la lista: asi la grilla y la vista de detalle siempre coinciden).
function hashEstable(valor: string) {
  let hash = 0
  for (let i = 0; i < valor.length; i++) {
    hash = (hash * 31 + valor.charCodeAt(i)) >>> 0
  }
  return hash
}

// Si la firma guardada es anonima, devuelve una inventada estable por id.
export function firmaDeObra(nombreAutor: string, id: string) {
  const anonima =
    !nombreAutor || nombreAutor.trim().toLowerCase() === "voz anonima"
  return anonima
    ? firmasInventadas[hashEstable(id) % firmasInventadas.length]
    : nombreAutor
}

export type ObraAbierta = {
  id: string
  titulo: string
  nombreAutor: string
  textoPlano: string
  creadoEn: Date
  urlPublica: string | null
  textoAlternativo: string | null
}

// Muestras que se usan si la base no esta disponible (Supabase pausado, corte,
// etc.) o si todavia no hay obras. Asi el link publico nunca se cae ni se ve vacio.
export const obrasDeMuestra: ObraAbierta[] = [
  {
    id: "muestra-1",
    titulo: "Ritual de las cosas que no dije",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Guardo las palabras como quien guarda semillas: sin saber cual va a crecer.",
    creadoEn: new Date("2026-05-02T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-2",
    titulo: "Cartografia de una madrugada",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Dibujar el insomnio como si fuera un pais con fronteras propias.",
    creadoEn: new Date("2026-05-08T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-3",
    titulo: "Coro para voces que se apagan",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Escribir a varias manos hasta que ninguna sea la duena del texto.",
    creadoEn: new Date("2026-05-15T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-4",
    titulo: "Inventario de gestos minimos",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Una mano que se abre. Una pausa. La escena entera en un parpadeo.",
    creadoEn: new Date("2026-05-21T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-5",
    titulo: "Notas al margen del cuerpo",
    nombreAutor: "Voz anonima",
    textoPlano: "Lo que la piel recuerda cuando la memoria decide olvidar.",
    creadoEn: new Date("2026-05-27T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-6",
    titulo: "Manual para desarmar el silencio",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Cada palabra es una herramienta y tambien una pequena traicion.",
    creadoEn: new Date("2026-06-03T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-7",
    titulo: "Escenas para un teatro sin publico",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Ensayar la ternura frente a butacas vacias, por si algun dia vuelven.",
    creadoEn: new Date("2026-06-10T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
  {
    id: "muestra-8",
    titulo: "Archivo de futuros posibles",
    nombreAutor: "Voz anonima",
    textoPlano:
      "Todo lo que todavia no pasa tambien merece un lugar donde vivir.",
    creadoEn: new Date("2026-06-18T12:00:00Z"),
    urlPublica: null,
    textoAlternativo: null,
  },
]

// Una muestra "es" real si su id calza con un uuid de la base.
const RE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function esIdReal(id: string) {
  return RE_UUID.test(id)
}

export async function obtenerObrasAbiertas(): Promise<ObraAbierta[]> {
  try {
    const db = obtenerBaseDatos()

    const filas = await db
      .select({
        id: participaciones.id,
        titulo: participaciones.titulo,
        nombreAutor: participaciones.nombreAutor,
        textoPlano: participaciones.textoPlano,
        creadoEn: participaciones.creadoEn,
        urlPublica: imagenesParticipacion.urlPublica,
        textoAlternativo: imagenesParticipacion.textoAlternativo,
      })
      .from(participaciones)
      .leftJoin(
        imagenesParticipacion,
        and(
          eq(imagenesParticipacion.participacionId, participaciones.id),
          eq(imagenesParticipacion.tipo, "portada")
        )
      )
      .where(eq(participaciones.estado, "publicada"))
      .orderBy(desc(participaciones.creadoEn))
      .limit(36)

    return filas.length > 0 ? filas : obrasDeMuestra
  } catch {
    // Base no disponible (pausa de Supabase, corte, etc.): mostramos muestras.
    return obrasDeMuestra
  }
}

export type ObraDetalle = {
  id: string
  titulo: string
  nombreAutor: string
  textoHtml: string
  creadoEn: Date
  publicadoEn: Date | null
  imagenes: {
    id: string
    urlPublica: string | null
    textoAlternativo: string | null
    tipo: "portada" | "galeria" | "editor"
  }[]
}

// Obra completa por id, solo si esta publicada. null si no existe/no es publica.
export async function obtenerObraPublicadaPorId(
  id: string
): Promise<ObraDetalle | null> {
  if (!esIdReal(id)) {
    return null
  }

  try {
    const db = obtenerBaseDatos()

    const [obra] = await db
      .select({
        id: participaciones.id,
        titulo: participaciones.titulo,
        nombreAutor: participaciones.nombreAutor,
        textoHtml: participaciones.textoHtml,
        creadoEn: participaciones.creadoEn,
        publicadoEn: participaciones.publicadoEn,
      })
      .from(participaciones)
      .where(
        and(eq(participaciones.id, id), eq(participaciones.estado, "publicada"))
      )
      .limit(1)

    if (!obra) {
      return null
    }

    const imagenes = await db
      .select({
        id: imagenesParticipacion.id,
        urlPublica: imagenesParticipacion.urlPublica,
        textoAlternativo: imagenesParticipacion.textoAlternativo,
        tipo: imagenesParticipacion.tipo,
      })
      .from(imagenesParticipacion)
      .where(eq(imagenesParticipacion.participacionId, id))
      .orderBy(asc(imagenesParticipacion.tipo), asc(imagenesParticipacion.orden))

    return { ...obra, imagenes }
  } catch {
    return null
  }
}

// Convierte un titulo en un slug legible: minusculas, sin acentos, guiones.
function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

type ObraParaSlug = { id: string; titulo: string; creadoEn: Date }

// Asigna a cada obra un slug basado puramente en su titulo ("mi-obra"). Si dos
// obras publicadas tienen el mismo titulo (colision real, poco frecuente), a
// la mas nueva se le agrega un sufijo "-2", "-3"... en vez de mostrar un id.
function asignarSlugs(obras: ObraParaSlug[]): Map<string, string> {
  const porBase = new Map<string, ObraParaSlug[]>()

  for (const obra of obras) {
    const base = slugificar(obra.titulo) || obra.id.split("-")[0]
    const lista = porBase.get(base) ?? []
    lista.push(obra)
    porBase.set(base, lista)
  }

  const resultado = new Map<string, string>()

  for (const [base, lista] of porBase) {
    const ordenadas = [...lista].sort(
      (a, b) => a.creadoEn.getTime() - b.creadoEn.getTime()
    )
    ordenadas.forEach((obra, index) => {
      resultado.set(obra.id, index === 0 ? base : `${base}-${index + 1}`)
    })
  }

  return resultado
}

// Slugs para una lista ya cargada (ej. la grilla de obras-abiertas), sin
// pegarle de nuevo a la base.
export function calcularSlugsParaLista(obras: ObraParaSlug[]): Map<string, string> {
  return asignarSlugs(obras)
}

async function obtenerMapaDeSlugsPublicados(): Promise<Map<string, string>> {
  try {
    const db = obtenerBaseDatos()
    const filas = await db
      .select({
        id: participaciones.id,
        titulo: participaciones.titulo,
        creadoEn: participaciones.creadoEn,
      })
      .from(participaciones)
      .where(eq(participaciones.estado, "publicada"))

    return asignarSlugs(filas)
  } catch {
    return new Map()
  }
}

// Resuelve una obra publicada a partir del slug de la URL (o, por
// compatibilidad, de un uuid completo).
export async function obtenerObraPublicadaPorParametro(
  parametro: string
): Promise<ObraDetalle | null> {
  if (esIdReal(parametro)) {
    return obtenerObraPublicadaPorId(parametro)
  }

  const mapa = await obtenerMapaDeSlugsPublicados()
  const id = [...mapa.entries()].find(([, slug]) => slug === parametro)?.[0]

  return id ? obtenerObraPublicadaPorId(id) : null
}
