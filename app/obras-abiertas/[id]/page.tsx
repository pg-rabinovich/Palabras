/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  firmaDeObra,
  obtenerObraPublicadaPorParametro,
} from "@/lib/obras-abiertas"
import { sanitizarHtmlParticipacion } from "@/lib/sanitizar-html"

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

function HeaderObra() {
  return (
    <header className="relative flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-[rgb(5_5_5_/_0.72)] px-4 py-4 backdrop-blur sm:rounded-[1.75rem] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:rounded-full">
      <nav className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase sm:flex sm:flex-wrap sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.24em] lg:gap-3">
        <Link href="/" className="transition-colors hover:text-[rgb(109_40_255)]">
          manifiesto
        </Link>
        <Link
          href="/obras-abiertas"
          className="transition-colors hover:text-[rgb(109_40_255)]"
        >
          obras abiertas
        </Link>
        <span className="text-[rgb(217_255_31)]">obra</span>
      </nav>

      <Button
        asChild
        size="lg"
        className="h-11 w-full gap-2 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.2em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)] sm:w-auto sm:tracking-[0.28em]"
      >
        <Link href="/obras-abiertas">
          <X className="size-4" />
          Cerrar
        </Link>
      </Button>
    </header>
  )
}

export default async function ObraDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const obra = await obtenerObraPublicadaPorParametro(id)

  if (!obra) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <section className="relative mx-auto w-full max-w-4xl px-6 py-6 lg:px-10">
          <HeaderObra />
          <div className="py-20">
            <Card className="border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.72)] p-8 text-[rgb(242_238_230)]">
              <p className="font-serif text-3xl leading-tight">
                No encontramos esta obra. Puede que aun este en curaduria o
                que ya no este disponible.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 h-11 gap-2 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.28em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
              >
                <Link href="/obras-abiertas">
                  <ArrowLeft className="size-4" />
                  Volver al archivo
                </Link>
              </Button>
            </Card>
          </div>
        </section>
      </main>
    )
  }

  const firma = firmaDeObra(obra.nombreAutor, obra.id)
  const portada = obra.imagenes.find((imagen) => imagen.tipo === "portada")
  const galeria = obra.imagenes.filter((imagen) => imagen.tipo === "galeria")
  const htmlSeguro = sanitizarHtmlParticipacion(obra.textoHtml)

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto w-full max-w-4xl px-6 py-6 lg:px-10">
        <div className="pointer-events-none absolute top-24 left-8 h-72 w-72 rounded-full bg-[rgb(109_40_255_/_0.16)] blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-24 h-72 w-72 rounded-full bg-[rgb(217_255_31_/_0.08)] blur-3xl" />

        <HeaderObra />

        <article className="relative py-14">
          <div className="mb-8">
            <div className="font-mono text-[0.68rem] tracking-[0.32em] text-[rgb(217_255_31)] uppercase">
              {firma}
            </div>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] text-balance text-[rgb(242_238_230)] sm:text-6xl">
              {obra.titulo}
            </h1>
            <div className="mt-4 font-mono text-[0.6rem] tracking-[0.2em] text-[rgb(167_161_154)] uppercase">
              {formatearFecha(obra.publicadoEn ?? obra.creadoEn)}
            </div>
          </div>

          {portada?.urlPublica && (
            <div className="mb-10 overflow-hidden rounded-[2rem] border border-[rgb(242_238_230_/_0.12)] bg-[rgb(5_5_5)] shadow-[0_36px_120px_-56px_rgb(0_0_0_/_0.85)]">
              <img
                src={portada.urlPublica}
                alt={portada.textoAlternativo ?? obra.titulo}
                className="max-h-[32rem] w-full object-cover"
              />
            </div>
          )}

          <div className="participacion-editor">
            <div
              className="ProseMirror text-[rgb(242_238_230)]"
              dangerouslySetInnerHTML={{ __html: htmlSeguro }}
            />
          </div>

          {galeria.length > 0 && (
            <div className="mt-12">
              <div className="mb-4 font-mono text-[0.62rem] tracking-[0.28em] text-[rgb(217_255_31)] uppercase">
                galeria
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {galeria.map(
                  (imagen) =>
                    imagen.urlPublica && (
                      <img
                        key={imagen.id}
                        src={imagen.urlPublica}
                        alt={imagen.textoAlternativo ?? obra.titulo}
                        className="aspect-[4/3] w-full rounded-2xl border border-[rgb(242_238_230_/_0.12)] object-cover"
                      />
                    )
                )}
              </div>
            </div>
          )}

          <div className="mt-16 flex justify-center border-t border-[rgb(242_238_230_/_0.12)] pt-10">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.28em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
            >
              <Link href="/obras-abiertas">
                <ArrowLeft className="size-4" />
                Volver al archivo
              </Link>
            </Button>
          </div>
        </article>
      </section>
    </main>
  )
}
