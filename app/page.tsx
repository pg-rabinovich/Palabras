import Image from "next/image"
import Link from "next/link"

import { AccesoNav } from "@/components/auth/acceso-nav"
import { HeaderNav } from "@/components/layout/header-nav"
import { SparksConstruccion } from "@/components/p5/sparks-construccion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const participationModes = [
  {
    label: "01",
    title: "Obras abiertas",
    href: "/obras-abiertas",
    description:
      "Espacios para iniciar piezas colectivas, invitar otras voces y sostener procesos largos.",
  },
  {
    label: "02",
    title: "Salas en vivo",
    description:
      "Programaciones donde la lectura se convierte en streaming, subtitulo y presencia compartida.",
  },
  {
    label: "03",
    title: "Archivo sensible",
    description:
      "Un catalogo visual para poemas, imagenes, versiones, notas y materiales de instalacion.",
  },
]

const navLinks = [
  { label: "manifiesto", href: "#manifiesto" },
  { label: "programacion", href: "#programacion" },
  { label: "participacion", href: "/participacion" },
  { label: "obras abiertas", href: "/obras-abiertas" },
]

export default function Page() {
  return (
    <main className="relative overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-6 pt-6 pb-16 lg:px-10 lg:pb-20">
        <div className="absolute top-20 left-0 h-72 w-72 rounded-full bg-neo-violet/16 blur-3xl" />
        <div className="absolute top-40 right-8 h-64 w-64 rounded-full bg-neo-lime/8 blur-3xl" />

        <HeaderNav accionDerecha={<AccesoNav />}>
          {navLinks.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-neo-violet"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="cursor-default transition-colors hover:text-neo-violet"
              >
                {item.label}
              </span>
            )
          )}
        </HeaderNav>

        <div id="manifiesto" className="relative pt-24">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card/82 shadow-[0_30px_90px_-54px_rgb(0_0_0_/_0.8)]">
            <div className="relative aspect-[16/8] w-full sm:aspect-[16/7] lg:aspect-[16/4.5]">
              <Image
                src="/images/banner-home-3.png"
                alt="Banner principal de Palabras"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 1120px, 100vw"
              />
              <div className="hero-fade-bottom absolute inset-0" />
            </div>
          </div>

          <div className="h-2" />
        </div>
      </section>

      <div id="programacion" className="absolute top-[18rem]" />

      <section
        id="participacion"
        className="relative mx-auto w-full max-w-7xl px-6 pt-10 pb-24 lg:px-10"
      >
        <div className="mb-8 max-w-3xl">
          <div className="font-mono text-[0.68rem] tracking-[0.32em] text-lime-text uppercase">
            modos de participacion
          </div>
          <h2 className="mt-5 font-serif text-5xl leading-[0.95] text-balance text-foreground sm:text-6xl">
            Una experiencia artistica{" "}
            <span className="relative isolate inline-block whitespace-nowrap text-foreground">
              <SparksConstruccion />
              <span className="relative z-10">en construccion</span>
            </span>
            .
          </h2>
        </div>

        <div className="mb-8">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/banner-home-new.png"
              alt="Banner secundario de Palabras"
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 1120px, 100vw"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {participationModes.map((mode, index) => {
            const card = (
              <Card className="h-full border-border bg-card/82 text-foreground transition-colors hover:border-neo-lime/42">
                <CardHeader>
                  <div className="font-mono text-[0.68rem] tracking-[0.32em] text-lime-text uppercase">
                    {mode.label}
                  </div>
                  <CardTitle className="font-serif text-4xl leading-none">
                    {mode.title}
                  </CardTitle>
                  <CardDescription className="font-serif text-lg leading-8 text-foreground-soft/72">
                    {mode.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={
                      index === 1
                        ? "h-1 w-28 rounded-full bg-[linear-gradient(90deg,var(--neo-violet),var(--neo-lime))]"
                        : "h-1 w-28 rounded-full bg-[linear-gradient(90deg,var(--neo-lime),var(--neo-violet))]"
                    }
                  />
                </CardContent>
              </Card>
            )

            if (mode.href) {
              return (
                <Link
                  key={mode.title}
                  href={mode.href}
                  className="block h-full"
                >
                  {card}
                </Link>
              )
            }

            return <div key={mode.title}>{card}</div>
          })}
        </div>

        {/* Card de acento fija oscura en ambos temas (ver .mood-card en globals.css):
            el texto usa los swatches "neo" fijos, no los tokens que flipean. */}
        <Card className="mood-card mt-8 overflow-hidden border-border text-neo-paper">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)] lg:items-end">
            <div>
              <div className="font-mono text-[0.62rem] tracking-[0.28em] text-neo-lime uppercase">
                atmosfera
              </div>
              <p className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-balance sm:text-5xl">
                En Proceso Σε εξέλιξη In Progress En cours В процессе Em
                processo In Arbeit In uitvoering Under arbete
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-script text-4xl text-neo-lime">
                palabra + imagen + presencia
              </div>
              <p className="font-mono text-[0.68rem] tracking-[0.24em] text-neo-marble/62 uppercase">
                collective writing // poetic interface // visual storytelling
              </p>
            </div>
          </CardContent>
        </Card>

        <footer
          id="footer"
          className="mt-20 grid gap-6 border-t border-border pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        >
          <div>
            <div className="font-mono text-sm tracking-[0.28em] text-foreground uppercase">
              Palabras
            </div>
            <p className="mt-3 max-w-xl font-serif text-lg leading-8 text-foreground-soft/68">
              Plataforma experimental para escritura colectiva, lectura, imagen,
              streaming y narrativa visual.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 font-mono text-[0.64rem] tracking-[0.28em] text-muted-foreground uppercase">
            {["poesia", "lectura", "comunidad", "archivo", "instalacion"].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-border px-3 py-2"
                >
                  {item}
                </span>
              )
            )}
          </div>
        </footer>
      </section>
    </main>
  )
}
