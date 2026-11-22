/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  calcularSlugsParaLista,
  esIdReal,
  firmaDeObra,
  fondosCards,
  obtenerObrasAbiertas,
} from "@/lib/obras-abiertas"

export const dynamic = "force-dynamic"

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

export default async function ObrasAbiertasPage() {
  const obras = await obtenerObrasAbiertas()
  const slugs = calcularSlugsParaLista(obras)

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-6 py-6 lg:px-10">
        <div className="pointer-events-none absolute top-24 left-8 h-72 w-72 rounded-full bg-[rgb(109_40_255_/_0.16)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-24 h-72 w-72 rounded-full bg-[rgb(217_255_31_/_0.08)] blur-3xl" />

        <header className="relative flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-[rgb(5_5_5_/_0.72)] px-4 py-4 backdrop-blur sm:rounded-[1.75rem] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:rounded-full">
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase sm:flex sm:flex-wrap sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.24em] lg:gap-3">
            <Link
              href="/"
              className="transition-colors hover:text-[rgb(109_40_255)]"
            >
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
          <div className="mb-10">
            <div className="font-mono text-[0.68rem] tracking-[0.32em] text-[rgb(217_255_31)] uppercase">
              obras abiertas
            </div>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-none text-balance text-[rgb(242_238_230)] sm:text-6xl">
              Archivo vivo.
            </h1>
          </div>

          <div className="mb-10 flex items-start gap-4 rounded-2xl border border-[rgb(109_40_255_/_0.3)] bg-[rgb(11_11_15_/_0.72)] px-5 py-4 backdrop-blur">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgb(139_92_255_/_0.45)] text-[rgb(139_92_255)]">
              <BookOpen className="size-4" />
            </span>
            <div>
              <div className="font-mono text-[0.62rem] tracking-[0.28em] text-[rgb(139_92_255)] uppercase">
                lectura
              </div>
              <p className="mt-1.5 font-serif text-lg leading-7 text-[rgb(217_212_206_/_0.86)]">
                Click en una pieza para abrirla completa y leerla.
              </p>
            </div>
          </div>

          {obras.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {obras.map((obra, index) => {
                // Fondo fijo segun el patron (mujer, foto o negro).
                const fondo = fondosCards[index % fondosCards.length]
                const enNegro = fondo === "negro"
                const abrible = esIdReal(obra.id)

                const contenido = (
                  <article
                    className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgb(242_238_230_/_0.12)] bg-[rgb(5_5_5)] shadow-[0_28px_90px_-58px_rgb(0_0_0_/_0.92)] transition-colors hover:border-[rgb(217_255_31_/_0.42)] ${abrible ? "cursor-pointer" : ""}`}
                  >
                    {enNegro ? (
                      <div className="absolute inset-0 bg-[rgb(5_5_5)] transition duration-500 group-hover:opacity-0" />
                    ) : (
                      <img
                        src={fondo}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-[0.72] grayscale transition duration-500 group-hover:opacity-0"
                      />
                    )}
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
                      <div className="truncate font-mono text-[0.62rem] tracking-[0.22em] text-[rgb(217_255_31)] uppercase transition duration-500 group-hover:-translate-y-2 group-hover:text-[rgb(139_92_255)]">
                        {firmaDeObra(obra.nombreAutor, obra.id)}
                      </div>
                      {/* min-h reserva 2 lineas siempre, asi la firma no se desalinea
                          segun el titulo de cada obra tenga 1 o 2 lineas. */}
                      <h2 className="mt-2 line-clamp-2 min-h-[3.75rem] translate-y-5 font-serif text-3xl leading-none text-[rgb(242_238_230)] opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
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
                )

                return abrible ? (
                  <Link
                    key={obra.id}
                    href={`/obras-abiertas/${slugs.get(obra.id) ?? obra.id}`}
                  >
                    {contenido}
                  </Link>
                ) : (
                  <div key={obra.id}>{contenido}</div>
                )
              })}
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
