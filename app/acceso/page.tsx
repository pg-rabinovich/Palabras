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

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="relative z-10 flex flex-col gap-5 rounded-full border border-border/80 bg-[rgb(5_5_5_/_0.72)] px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-3 font-mono text-[0.68rem] tracking-[0.24em] text-muted-foreground uppercase">
            <Link
              href="/"
              className="transition-colors hover:text-[rgb(109_40_255)]"
            >
              manifiesto
            </Link>
            <span className="text-[rgb(217_255_31)]">acceso</span>
          </nav>

          <Button
            asChild
            size="lg"
            className="h-11 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] tracking-[0.28em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
          >
            <Link href="/">Volver</Link>
          </Button>
        </header>

        <div className="relative grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_minmax(360px,0.85fr)]">
          {/* Escenario p5 con la imagen + sparks/glitch */}
          <div className="relative hidden min-h-[28rem] overflow-hidden rounded-[2rem] border border-[rgb(242_238_230_/_0.12)] bg-[rgb(5_5_5)] shadow-[0_36px_120px_-56px_rgb(0_0_0_/_0.85)] lg:block lg:min-h-[34rem]">
            <FondoGlitch />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_40%,rgb(5_5_5_/_0.55)_100%)]" />
            <div className="absolute bottom-8 left-8 max-w-sm">
              <div className="font-mono text-[0.62rem] tracking-[0.32em] text-[rgb(217_255_31)] uppercase">
                palabra + imagen + presencia
              </div>
              <p className="mt-3 font-serif text-3xl leading-tight text-[rgb(242_238_230)]">
                Suma tu voz a la instalacion.
              </p>
            </div>
          </div>

          {/* Card de login */}
          <Card className="relative z-10 border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.82)] p-8 text-[rgb(242_238_230)] backdrop-blur">
            <div className="mb-7">
              <div className="font-mono text-[0.66rem] tracking-[0.32em] text-[rgb(217_255_31)] uppercase">
                acceso
              </div>
              <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-balance">
                Entrar a Palabras
              </h1>
              <p className="mt-4 font-serif text-lg leading-7 text-[rgb(217_212_206_/_0.74)]">
                Sin contrasenas. Dejanos tu email y te mandamos un enlace para
                entrar.
              </p>
            </div>

            {error === "enlace" && (
              <p className="mb-5 rounded-2xl border border-[rgb(239_68_68_/_0.4)] bg-[rgb(239_68_68_/_0.08)] px-4 py-3 font-mono text-[0.66rem] leading-5 text-[rgb(252_165_165)]">
                El enlace no es valido o expiro. Pedi uno nuevo.
              </p>
            )}

            <FormularioAcceso />

            <p className="mt-7 font-script text-3xl text-[rgb(217_255_31)]">
              tu palabra cuenta
            </p>
          </Card>
        </div>
      </section>
    </main>
  )
}
