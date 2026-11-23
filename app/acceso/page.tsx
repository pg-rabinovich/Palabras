import Link from "next/link"

import { FondoGlitch } from "@/components/auth/fondo-glitch"
import { FormularioAcceso } from "@/components/auth/formulario-acceso"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  // El login ahora es solo el acceso admin de resguardo (el publico participa
  // sin cuenta desde /participacion), asi que siempre queda funcional.
  const accesoHabilitado = true

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="relative z-10 flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-background/72 px-4 py-4 backdrop-blur sm:rounded-[1.75rem] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:rounded-full">
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase sm:flex sm:flex-wrap sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.24em] lg:gap-3">
            <Link
              href="/"
              className="transition-colors hover:text-violet-text"
            >
              manifiesto
            </Link>
            <span className="text-lime-text">acceso</span>
          </nav>

          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-full bg-primary px-6 font-mono text-[0.68rem] tracking-[0.2em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground sm:w-auto sm:tracking-[0.28em]"
          >
            <Link href="/">Volver</Link>
          </Button>
        </header>

        <div className="relative grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_minmax(360px,0.85fr)] lg:items-stretch">
          {/* Escenario p5 con la imagen + sparks/glitch */}
          <div className="relative hidden min-h-[28rem] overflow-hidden rounded-[2rem] border border-border bg-marco shadow-profunda lg:block lg:min-h-[34rem]">
            <FondoGlitch />
            <div className="absolute inset-0 velo-lateral" />
            <div className="absolute bottom-8 left-8 max-w-sm">
              <div className="font-mono text-[0.62rem] tracking-[0.32em] text-sobre-foto-acento uppercase">
                palabra + imagen + presencia
              </div>
              <p className="mt-3 font-serif text-3xl leading-tight text-sobre-foto">
                Suma tu voz a la instalacion.
              </p>
            </div>
          </div>

          {/* Card de login */}
          <Card className="relative z-10 flex flex-col justify-center border-border bg-card/82 p-8 text-foreground backdrop-blur lg:min-h-[34rem]">
            <div className="mb-7">
              <div className="font-mono text-[0.66rem] tracking-[0.32em] text-lime-text uppercase">
                acceso
              </div>
              <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-balance">
                Entrar a Palabras
              </h1>
              <p className="mt-4 font-serif text-lg leading-7 text-foreground-soft">
                Sin contrasenas. Dejanos tu email y te mandamos un enlace para
                entrar.
              </p>
            </div>

            {error === "enlace" && (
              <p className="mb-5 rounded-2xl border border-destructive/40 bg-destructive/8 px-4 py-3 font-mono text-[0.66rem] leading-5 text-destructive-foreground">
                El enlace no es valido o expiro. Pedi uno nuevo.
              </p>
            )}

            <FormularioAcceso habilitado={accesoHabilitado} />

            <p className="mt-7 font-script text-3xl text-lime-text">
              tu palabra cuenta
            </p>
          </Card>
        </div>
      </section>
    </main>
  )
}
