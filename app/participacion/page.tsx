import Link from "next/link"

import { obtenerSesion } from "@/components/auth/acceso-nav"
import { EditorParticipacion } from "@/components/participacion/editor-participacion"
import { Button } from "@/components/ui/button"

export default async function ParticipacionPage() {
  const sesion = await obtenerSesion()

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-6 py-6 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-[rgb(5_5_5_/_0.72)] px-4 py-4 backdrop-blur sm:rounded-[1.75rem] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:rounded-full">
          <nav className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase sm:flex sm:flex-wrap sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.24em] lg:gap-3">
            <Link href="/" className="transition-colors hover:text-[rgb(109_40_255)]">
              manifiesto
            </Link>
            <span className="text-[rgb(217_255_31)]">participacion</span>
          </nav>

          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.68rem] uppercase text-[rgb(5_5_5)] hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)] sm:w-auto"
          >
            <Link href="/">Volver</Link>
          </Button>
        </header>

        <div className="py-14">
          <div className="mb-10 max-w-3xl">
            <div className="font-mono text-[0.68rem] uppercase text-[rgb(217_255_31)]">
              participacion
            </div>
            <h1 className="mt-5 font-serif text-5xl leading-none text-balance text-[rgb(242_238_230)] sm:text-6xl">
              Subir imagenes y escribir una pieza colectiva.
            </h1>
          </div>

          <EditorParticipacion firma={sesion?.nombreMostrado} />
        </div>
      </section>
    </main>
  )
}
