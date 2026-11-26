"use client"

import * as React from "react"
import { Link2, Unlink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type DatosDialogoEnlace = {
  tipo: "enlace"
  href: string
  /** Hay texto seleccionado o ya es un enlace: no hace falta pedir el texto. */
  tieneTexto: boolean
  existe: boolean
}

export type DatosDialogoImagen = {
  tipo: "imagen"
  src: string
  alt: string
  /** true: edita la imagen seleccionada; false: inserta una nueva. */
  editar: boolean
}

export type DatosDialogo = DatosDialogoEnlace | DatosDialogoImagen

/** Agrega https:// si la persona escribio "ejemplo.com". */
export function normalizarUrl(valor: string) {
  const url = valor.trim()
  if (!url) return ""
  if (/^(https?:|mailto:)/i.test(url) || url.startsWith("/")) return url
  if (url.includes("@") && !url.includes("/")) return `mailto:${url}`
  return `https://${url}`
}

const claseEtiqueta =
  "font-mono text-[0.62rem] tracking-[0.22em] text-muted-foreground uppercase"
const claseInput =
  "h-11 rounded-xl border-border-strong bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring"
const claseBotonPrincipal =
  "h-10 rounded-full bg-lime px-5 font-mono text-[0.66rem] tracking-[0.16em] text-lime-foreground uppercase hover:bg-primary hover:text-primary-foreground"
const claseBotonSecundario =
  "h-10 rounded-full border border-border-strong bg-transparent px-5 font-mono text-[0.66rem] tracking-[0.16em] text-foreground uppercase hover:border-lime-text/60 hover:bg-transparent"

// Dialogos del editor (enlace e imagen) con el Dialog de shadcn. Reemplazan a
// window.prompt. Son "controlados": el padre decide cuando abren y con que datos.
export function DialogosEditor({
  dialogo,
  onCerrar,
  onGuardarEnlace,
  onQuitarEnlace,
  onGuardarImagen,
  onDevolverFoco,
}: {
  dialogo: DatosDialogo | null
  onCerrar: () => void
  /** Al cerrar, el foco vuelve al texto (no al boton que abrio el dialogo). */
  onDevolverFoco: () => void
  onGuardarEnlace: (href: string, texto: string) => void
  onQuitarEnlace: () => void
  onGuardarImagen: (src: string, alt: string) => void
}) {
  const abierto = dialogo !== null

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && onCerrar()}>
      <DialogContent
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onDevolverFoco()
        }}
        className="gap-5 rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-flotante ring-0 sm:max-w-md"
      >
        {dialogo?.tipo === "enlace" && (
          <FormEnlace
            datos={dialogo}
            onGuardar={onGuardarEnlace}
            onQuitar={onQuitarEnlace}
            onCancelar={onCerrar}
          />
        )}
        {dialogo?.tipo === "imagen" && (
          <FormImagen
            datos={dialogo}
            onGuardar={onGuardarImagen}
            onCancelar={onCerrar}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function FormEnlace({
  datos,
  onGuardar,
  onQuitar,
  onCancelar,
}: {
  datos: DatosDialogoEnlace
  onGuardar: (href: string, texto: string) => void
  onQuitar: () => void
  onCancelar: () => void
}) {
  const [error, setError] = React.useState("")

  function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // El formulario vive dentro del form del editor: que no lo envie.
    event.stopPropagation()
    const form = new FormData(event.currentTarget)
    const href = normalizarUrl(String(form.get("href") ?? ""))
    if (!href) {
      setError("Escribí una dirección, por ejemplo palabras.com")
      return
    }
    onGuardar(href, String(form.get("texto") ?? "").trim())
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <DialogHeader className="gap-1.5 text-left">
        <DialogTitle className="font-serif text-2xl font-normal text-foreground">
          {datos.existe ? "Editar enlace" : "Agregar enlace"}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
          {datos.tieneTexto
            ? "El texto seleccionado va a llevar a esta dirección."
            : "Escribí el texto que se va a ver y la dirección a la que lleva."}
        </DialogDescription>
      </DialogHeader>

      {!datos.tieneTexto && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="enlace-texto" className={claseEtiqueta}>
            Texto
          </Label>
          <Input
            id="enlace-texto"
            name="texto"
            placeholder="Por ejemplo: mi blog"
            className={claseInput}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="enlace-href" className={claseEtiqueta}>
          Dirección
        </Label>
        <Input
          id="enlace-href"
          name="href"
          defaultValue={datos.href}
          placeholder="palabras.com"
          autoFocus
          aria-invalid={Boolean(error)}
          className={claseInput}
          onChange={() => error && setError("")}
        />
        {error && <span className="text-xs text-warning">{error}</span>}
      </div>

      <DialogFooter className="flex-row flex-wrap items-center gap-2 sm:justify-between">
        {datos.existe ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onQuitar}
            className="h-10 gap-2 rounded-full px-3 text-[0.8rem] text-muted-foreground hover:bg-transparent hover:text-destructive-foreground"
          >
            <Unlink className="size-4" />
            Quitar enlace
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={onCancelar}
            className={claseBotonSecundario}
          >
            Cancelar
          </Button>
          <Button type="submit" className={`${claseBotonPrincipal} gap-2`}>
            <Link2 className="size-4" />
            Guardar
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}

function FormImagen({
  datos,
  onGuardar,
  onCancelar,
}: {
  datos: DatosDialogoImagen
  onGuardar: (src: string, alt: string) => void
  onCancelar: () => void
}) {
  const [error, setError] = React.useState("")

  function enviar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.stopPropagation()
    const form = new FormData(event.currentTarget)
    const src = normalizarUrl(String(form.get("src") ?? ""))
    if (!src || src.startsWith("mailto:")) {
      setError("Pegá la dirección de una imagen (termina en .jpg, .png…)")
      return
    }
    onGuardar(src, String(form.get("alt") ?? "").trim())
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <DialogHeader className="gap-1.5 text-left">
        <DialogTitle className="font-serif text-2xl font-normal text-foreground">
          {datos.editar ? "Editar imagen" : "Agregar imagen"}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
          Pegá la dirección de una imagen. La descripción la leen quienes usan
          lector de pantalla y aparece si la imagen no carga.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen-src" className={claseEtiqueta}>
          Dirección de la imagen
        </Label>
        <Input
          id="imagen-src"
          name="src"
          defaultValue={datos.src}
          placeholder="https://…/foto.jpg"
          autoFocus
          aria-invalid={Boolean(error)}
          className={claseInput}
          onChange={() => error && setError("")}
        />
        {error && <span className="text-xs text-warning">{error}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen-alt" className={claseEtiqueta}>
          Descripción
        </Label>
        <Input
          id="imagen-alt"
          name="alt"
          defaultValue={datos.alt}
          placeholder="Qué se ve en la imagen"
          className={claseInput}
        />
      </div>

      <DialogFooter className="flex-row justify-end gap-2">
        <Button
          type="button"
          onClick={onCancelar}
          className={claseBotonSecundario}
        >
          Cancelar
        </Button>
        <Button type="submit" className={claseBotonPrincipal}>
          {datos.editar ? "Guardar" : "Insertar"}
        </Button>
      </DialogFooter>
    </form>
  )
}
