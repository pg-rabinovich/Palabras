/* eslint-disable @next/next/no-img-element */

import Link from "next/link"

import { HeaderNav } from "@/components/layout/header-nav"
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
    <HeaderNav
      accionDerecha={
        <Button
          asChild
          size="lg"
          className="h-11 w-full gap-2 rounded-full bg-primary px-6 font-mono text-[0.68rem] tracking-[0.2em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground sm:w-auto sm:tracking-[0.28em]"
        >
          <Link href="/obras-abiertas">
            <X className="size-4" />
            Cerrar
          </Link>
        </Button>
      }
    >
      <Link href="/" className="transition-colors hover:text-violet-text">
        manifiesto
      </Link>
      <Link
        href="/obras-abiertas"
        className="transition-colors hover:text-violet-text"
      >
        obras abiertas
      </Link>
      <span className="text-lime-text">obra</span>
    </HeaderNav>
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
            <Card className="border-border bg-card/72 p-8 text-foreground">
              <p className="font-serif text-3xl leading-tight">
                No encontramos esta obra. Puede que aun este en curaduria o que
                ya no este disponible.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 h-11 gap-2 rounded-full bg-primary px-6 font-mono text-[0.68rem] tracking-[0.28em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground"
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
        <div className="pointer-events-none absolute top-24 left-8 h-72 w-72 rounded-full bg-violet-soft blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-24 h-72 w-72 rounded-full bg-lime-soft blur-3xl" />

        <HeaderObra />

        <article className="relative py-14">
          <div className="mb-8">
            <div className="font-mono text-[0.68rem] tracking-[0.32em] text-lime-text uppercase">
              {firma}
            </div>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] text-balance text-foreground sm:text-6xl">
              {obra.titulo}
            </h1>
            <div className="mt-4 font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
              {formatearFecha(obra.publicadoEn ?? obra.creadoEn)}
            </div>
          </div>

          {portada?.urlPublica && (
            <div className="mb-10 overflow-hidden rounded-[2rem] border border-border bg-marco shadow-profunda">
              <img
                src={portada.urlPublica}
                alt={portada.textoAlternativo ?? obra.titulo}
                className="max-h-[32rem] w-full object-cover"
              />
            </div>
          )}

          <div className="editor-palabras">
            <div
              className="texto-palabras"
              dangerouslySetInnerHTML={{ __html: htmlSeguro }}
            />
          </div>

          {galeria.length > 0 && (
            <div className="mt-12">
              <div className="mb-4 font-mono text-[0.62rem] tracking-[0.28em] text-lime-text uppercase">
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
                        className="aspect-[4/3] w-full rounded-2xl border border-border object-cover"
                      />
                    )
                )}
              </div>
            </div>
          )}

          <div className="mt-16 flex justify-center border-t border-border pt-10">
            <Button
              asChild
              size="lg"
              className="h-11 gap-2 rounded-full bg-primary px-6 font-mono text-[0.68rem] tracking-[0.28em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground"
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
