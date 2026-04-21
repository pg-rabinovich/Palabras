import Link from "next/link"

import { HeroStage } from "@/components/marketing/hero-stage"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    title: "Escribir sin distracciones",
    description:
      "Una mesa limpia para enfocarte en la voz, el ritmo y la estructura de cada texto.",
  },
  {
    title: "Colaborar con otros",
    description:
      "Comparte borradores, comentarios y nuevas versiones sin perder el hilo creativo.",
  },
  {
    title: "Organizar obras y textos",
    description:
      "Reune escenas, capitulos y notas en un mismo lugar para avanzar con claridad.",
  },
]

const editorialWords = [
  "manuscrito",
  "escena",
  "novela",
  "personajes",
  "poema",
]

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--editorial-glow),_transparent_45%)]" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(255,255,255,0.45),transparent)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-6 pb-20 pt-6 lg:px-10 lg:pb-28">
          <header className="flex items-center justify-between rounded-full border border-border/70 bg-background/80 px-4 py-3 shadow-sm backdrop-blur">
            <div>
              <div className="text-sm font-semibold tracking-[0.2em] uppercase">
                Palabras
              </div>
              <div className="text-xs text-muted-foreground">
                Espacio editorial para crear en equipo
              </div>
            </div>

            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Empezar</Link>
            </Button>
          </header>

          <div className="grid gap-16 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-editorial-line bg-editorial-paper px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-editorial-ink">
                Escritura, obras y colaboracion
              </div>

              <h1 className="mt-8 max-w-xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
                Un lugar para que las palabras encuentren forma.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Palabras reune borradores, obras y procesos creativos en una
                experiencia limpia, moderna y pensada para escribir mejor hoy y
                crecer con colaboracion mañana.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-11 px-5 text-sm">
                  <Link href="/dashboard">Empezar a escribir</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 px-5 text-sm">
                  <Link href="#features">Ver enfoque</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {editorialWords.map((word) => (
                  <span
                    key={word}
                    className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            <HeroStage />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-7xl px-6 pb-24 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <div className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Primera version
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            Base clara para una app de escritura que despues pueda sumar auth,
            proyectos y trabajo compartido.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="relative overflow-hidden border-border/70 bg-card/90 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]"
            >
              <div className="absolute inset-x-6 top-0 h-1 rounded-full bg-primary/70" />
              <CardHeader>
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  0{index + 1}
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    "borradores",
                    "versiones",
                    "notas",
                    "estructura",
                    "feedback",
                  ]
                    .slice(index, index + 3)
                    .map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
