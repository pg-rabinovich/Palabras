import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
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
  { label: "participacion", href: "#participacion" },
  { label: "dashboard" },
]

export default function Page() {
  return (
    <main className="relative overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-6 lg:px-10 lg:pb-20">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-[rgb(109_40_255_/_0.16)] blur-3xl" />
        <div className="absolute right-8 top-40 h-64 w-64 rounded-full bg-[rgb(217_255_31_/_0.08)] blur-3xl" />

        <header className="relative flex flex-col gap-5 rounded-full border border-border/80 bg-[rgb(5_5_5_/_0.72)] px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-3 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-muted-foreground">
            {navLinks.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-[rgb(109_40_255)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className="cursor-default transition-colors hover:text-[rgb(109_40_255)]"
                >
                  {item.label}
                </span>
              )
            )}
          </nav>

          <Button
            asChild
            size="lg"
            className="h-11 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[rgb(5_5_5)] hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
          >
            <Link href="#participacion">Entrar a la instalacion</Link>
          </Button>
        </header>

        <div id="manifiesto" className="relative pt-24">
          <div className="overflow-hidden rounded-[2rem] border border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.82)] shadow-[0_30px_90px_-54px_rgb(0_0_0_/_0.8)]">
            <div className="relative aspect-[16/8] w-full sm:aspect-[16/7] lg:aspect-[16/4.5]">
              <Image
                src="/images/banner-home-3.png"
                alt="Banner principal de Palabras"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 1120px, 100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgb(5_5_5_/_0.12)_55%,rgb(5_5_5_/_0.28)_100%)]" />
            </div>
          </div>

          <div className="h-2" />
        </div>
      </section>

      <div id="programacion" className="absolute top-[18rem]" />

      <section id="participacion" className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-10 lg:px-10">
        <div className="mb-8 max-w-3xl">
          <div className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-[rgb(217_255_31)]">
            modos de participacion
          </div>
          <h2 className="mt-5 font-serif text-5xl leading-[0.95] text-balance text-[rgb(242_238_230)] sm:text-6xl">
            Una experiencia artistica, usable e inmersiva sin renunciar a la
            estructura.
          </h2>
        </div>

        <div className="mb-8">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src="/images/banner-home-4.png"
              alt="Banner secundario de Palabras"
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 1120px, 100vw"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {participationModes.map((mode, index) => (
            <Card
              key={mode.title}
              className="border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.82)] text-[rgb(242_238_230)]"
            >
              <CardHeader>
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-[rgb(217_255_31)]">
                  {mode.label}
                </div>
                <CardTitle className="font-serif text-4xl leading-none">
                  {mode.title}
                </CardTitle>
                <CardDescription className="font-serif text-lg leading-8 text-[rgb(217_212_206_/_0.72)]">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={
                    index === 1
                      ? "h-1 w-28 rounded-full bg-[linear-gradient(90deg,rgb(109_40_255),rgb(217_255_31))]"
                      : "h-1 w-28 rounded-full bg-[linear-gradient(90deg,rgb(217_255_31),rgb(109_40_255))]"
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 overflow-hidden border-[rgb(242_238_230_/_0.12)] bg-[linear-gradient(135deg,rgb(36_18_56),rgb(11_11_15)_52%,rgb(5_5_5))] text-[rgb(242_238_230)]">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)] lg:items-end">
            <div>
              <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[rgb(217_255_31)]">
                atmosfera
              </div>
              <p className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-balance sm:text-5xl">
                Oscura pero respirable. Experimental pero elegante. Intensa sin
                convertirse en ruido.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-script text-4xl text-[rgb(217_255_31)]">
                palabra + imagen + presencia
              </div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[rgb(217_212_206_/_0.62)]">
                collective writing // poetic interface // visual storytelling
              </p>
            </div>
          </CardContent>
        </Card>

        <footer
          id="footer"
          className="mt-20 grid gap-6 border-t border-[rgb(242_238_230_/_0.12)] pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        >
          <div>
            <div className="font-mono text-sm uppercase tracking-[0.28em] text-[rgb(242_238_230)]">
              Palabras
            </div>
            <p className="mt-3 max-w-xl font-serif text-lg leading-8 text-[rgb(217_212_206_/_0.68)]">
              Plataforma experimental para escritura colectiva, lectura, imagen,
              streaming y narrativa visual.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 font-mono text-[0.64rem] uppercase tracking-[0.28em] text-muted-foreground">
            {["poesia", "lectura", "comunidad", "archivo", "instalacion"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgb(242_238_230_/_0.12)] px-3 py-2"
              >
                {item}
              </span>
            ))}
          </div>
        </footer>
      </section>
    </main>
  )
}
