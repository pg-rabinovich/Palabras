/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { and, desc, eq } from "drizzle-orm"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { obtenerBaseDatos } from "@/lib/db/conexion"
import {
  imagenesParticipacion,
  participaciones,
} from "@/lib/db/esquema"

export const dynamic = "force-dynamic"

const imagenesReferencia = [
  "/images/banner-home.png",
  "/images/banner-home-2.png",
  "/images/banner-home-3.png",
  "/images/banner-home-4.png",
  "/images/banner-home-new.png",
]

type ObraAbierta = {
  id: string
  titulo: string
  nombreAutor: string
  textoPlano: string
  creadoEn: Date
  urlPublica: string | null
  textoAlternativo: string | null
  imagenReferencia: string
}

async function obtenerObrasAbiertas(): Promise<ObraAbierta[]> {
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
    .orderBy(desc(participaciones.creadoEn))
    .limit(36)

  return filas.map((fila, index) => ({
    ...fila,
    imagenReferencia: imagenesReferencia[index % imagenesReferencia.length],
  }))
}

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

export default async function ObrasAbiertasPage() {
  const obras = await obtenerObrasAbiertas()

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-6 py-6 lg:px-10">
        <div className="pointer-events-none absolute top-24 left-8 h-72 w-72 rounded-full bg-[rgb(109_40_255_/_0.16)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-24 h-72 w-72 rounded-full bg-[rgb(217_255_31_/_0.08)] blur-3xl" />

        <header className="relative flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-[rgb(5_5_5_/_0.72)] px-4 py-4 backdrop-blur sm:rounded-[1.75rem] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:rounded-full">
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase sm:flex sm:flex-wrap sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.24em] lg:gap-3">
            <Link href="/" className="transition-colors hover:text-[rgb(109_40_255)]">
              manifiesto
            </Link>
            <Link
              href="/participacion"
              className="transition-colors hover:text-[rgb(109_40_255)]"
            >
              participacion
            </Link>
            <span className="text-[rgb(217_255_31)]">obras abiertas</span>
          </nav>

          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.2em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)] sm:w-auto sm:tracking-[0.28em]"
          >
            <Link href="/participacion">Nueva participacion</Link>
          </Button>
        </header>

        <div className="relative py-14">
          <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,0.42fr)] lg:items-end">
            <div>
              <div className="font-mono text-[0.68rem] tracking-[0.32em] text-[rgb(217_255_31)] uppercase">
                obras abiertas
              </div>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-none text-balance text-[rgb(242_238_230)] sm:text-6xl">
                Archivo vivo de piezas que empiezan a respirar juntas.
              </h1>
            </div>

            <Card className="border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.72)] p-5 text-[rgb(242_238_230)]">
              <p className="font-mono text-[0.66rem] leading-6 tracking-[0.22em] text-[rgb(217_212_206_/_0.66)] uppercase">
                cada card muestra una mascara visual del archivo. al pasar el
                cursor aparece la imagen subida y el titulo de la pieza.
              </p>
            </Card>
          </div>

          {obras.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {obras.map((obra) => (
                <article
                  key={obra.id}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgb(242_238_230_/_0.12)] bg-[rgb(5_5_5)] shadow-[0_28px_90px_-58px_rgb(0_0_0_/_0.92)] transition-colors hover:border-[rgb(217_255_31_/_0.42)]"
                >
                  <img
                    src={obra.imagenReferencia}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.72] grayscale transition duration-500 group-hover:opacity-0"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_5_5_/_0.18),rgb(5_5_5_/_0.86))] transition duration-500 group-hover:opacity-0" />

                  {obra.urlPublica ? (
                    <img
                      src={obra.urlPublica}
                      alt={obra.textoAlternativo ?? obra.titulo}
                      className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 blur-sm transition duration-500 group-hover:scale-100 group-hover:opacity-[0.82]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[rgb(5_5_5)] opacity-0 transition duration-500 group-hover:opacity-100" />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(5_5_5_/_0.1),rgb(5_5_5_/_0.86))] opacity-0 transition duration-500 group-hover:opacity-100" />

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="font-mono text-[0.62rem] tracking-[0.22em] text-[rgb(217_255_31)] uppercase transition duration-500 group-hover:-translate-y-2 group-hover:text-[rgb(139_92_255)]">
                      {obra.nombreAutor}
                    </div>
                    <h2 className="mt-2 translate-y-5 font-serif text-3xl leading-none text-[rgb(242_238_230)] opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      {obra.titulo}
                    </h2>
                    <p className="mt-3 max-h-0 overflow-hidden font-mono text-[0.66rem] leading-5 text-[rgb(217_212_206_/_0.72)] opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
                      {obra.textoPlano}
                    </p>
                  </div>

                  <div className="absolute top-4 right-4 rounded-full border border-[rgb(242_238_230_/_0.16)] bg-[rgb(5_5_5_/_0.58)] px-3 py-1 font-mono text-[0.58rem] tracking-[0.2em] text-[rgb(242_238_230_/_0.68)] uppercase backdrop-blur">
                    {formatearFecha(obra.creadoEn)}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Card className="border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.72)] p-8 text-[rgb(242_238_230)]">
              <p className="font-serif text-3xl leading-tight">
                Todavia no hay obras abiertas. La primera aparicion puede ser
                una imagen, una frase, o ambas.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 h-11 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.28em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
              >
                <Link href="/participacion">Crear obra</Link>
              </Button>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
