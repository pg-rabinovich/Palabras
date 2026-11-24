"use client"

import Link from "next/link"
import { BookOpen, PenLine } from "lucide-react"

import { TarjetaAtmosfera } from "@/components/marketing/tarjeta-atmosfera"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// "Entrar a la instalacion": la instalacion todavia se esta construyendo, asi
// que el boton abre la atmosfera "En proceso" con dos salidas reales
// (escribir una pieza o leer el archivo) en vez de llevar directo al editor.
export function ModalInstalacion() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="h-11 w-full rounded-full bg-primary px-6 font-mono text-[0.68rem] tracking-[0.2em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground sm:w-auto sm:tracking-[0.28em]"
        >
          Entrar a la instalacion
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto border-0 bg-transparent p-0 ring-0 sm:max-w-5xl [&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:text-neo-paper [&_[data-slot=dialog-close]]:hover:bg-neo-paper/10">
        <DialogTitle className="sr-only">
          La instalación está en proceso
        </DialogTitle>
        <TarjetaAtmosfera className="p-6 sm:p-12">
          <div className="mt-4 flex flex-col gap-6 border-t border-neo-paper/14 pt-8 lg:flex-row lg:items-end lg:justify-between">
            <DialogDescription className="max-w-xl font-serif text-xl leading-relaxed text-neo-marble">
              Estamos construyendo la instalación: un espacio donde palabra,
              imagen y presencia se cruzan en vivo. Mientras tanto, ya podés
              escribir y leer lo que otras voces dejaron.
            </DialogDescription>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 rounded-full bg-neo-lime px-6 font-mono text-[0.68rem] tracking-[0.2em] text-neo-black uppercase hover:bg-neo-paper"
              >
                <Link href="/participacion">
                  <PenLine className="size-4" />
                  Escribir una pieza
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-full border-neo-paper/30 bg-transparent px-6 font-mono text-[0.68rem] tracking-[0.2em] text-neo-paper uppercase hover:border-neo-lime hover:bg-transparent hover:text-neo-lime"
              >
                <Link href="/obras-abiertas">
                  <BookOpen className="size-4" />
                  Ver obras abiertas
                </Link>
              </Button>
            </div>
          </div>
        </TarjetaAtmosfera>
      </DialogContent>
    </Dialog>
  )
}
