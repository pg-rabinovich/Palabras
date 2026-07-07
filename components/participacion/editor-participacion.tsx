"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"
import { EditorContent, useEditor, type JSONContent } from "@tiptap/react"
import ImageExtension from "@tiptap/extension-image"
import LinkExtension from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import {
  Bold,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Save,
  Sparkles,
  Trash2,
  UnderlineIcon,
  Undo2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type VistaPreviaImagen = {
  id: string
  archivo: File
  url: string
}

type EstadoGuardado = "inicial" | "guardando" | "guardado" | "error"

const contenidoInicial: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
}

function BotonEditor({
  activo,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  activo?: boolean
}) {
  return (
    <Button
      type="button"
      variant={activo ? "secondary" : "ghost"}
      size="icon-sm"
      className={cn(
        "border border-[rgb(242_238_230_/_0.1)] text-[rgb(242_238_230_/_0.76)] hover:border-[rgb(109_40_255)] hover:bg-[rgb(109_40_255_/_0.16)] hover:text-[rgb(217_255_31)]",
        activo &&
          "border-[rgb(217_255_31_/_0.42)] bg-[rgb(217_255_31_/_0.12)] text-[rgb(217_255_31)]",
        className
      )}
      {...props}
    />
  )
}

export function EditorParticipacion({
  firma: firmaInicial,
  logueada = false,
}: {
  firma?: string
  logueada?: boolean
}) {
  const inputImagenesRef = React.useRef<HTMLInputElement | null>(null)
  const honeypotRef = React.useRef<HTMLInputElement | null>(null)
  const [titulo, setTitulo] = React.useState("")
  const [firma, setFirma] = React.useState(firmaInicial ?? "")
  const [imagenes, setImagenes] = React.useState<VistaPreviaImagen[]>([])
  const [estadoGuardado, setEstadoGuardado] =
    React.useState<EstadoGuardado>("inicial")
  const [mensaje, setMensaje] = React.useState("")
  const [guardandoFirma, setGuardandoFirma] = React.useState(false)
  const [mensajeFirma, setMensajeFirma] = React.useState("")

  const firmaCambiada = firma.trim() !== (firmaInicial ?? "").trim()

  // Persiste la firma en el perfil. Devuelve true si salio bien.
  async function persistirFirma(): Promise<boolean> {
    const nombre = firma.trim()

    if (!nombre) {
      setMensajeFirma("La firma no puede estar vacia.")
      return false
    }

    setGuardandoFirma(true)
    setMensajeFirma("")

    const respuesta = await fetch("/api/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreMostrado: nombre }),
    })

    setGuardandoFirma(false)

    if (!respuesta.ok) {
      const resultado = (await respuesta.json().catch(() => ({}))) as {
        mensaje?: string
      }
      setMensajeFirma(resultado.mensaje ?? "No se pudo guardar la firma.")
      return false
    }

    setMensajeFirma("Firma guardada.")
    return true
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({
        openOnClick: false,
      }),
      ImageExtension.configure({
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: "Escribi una escena, poema, nota o fragmento colectivo...",
      }),
    ],
    content: contenidoInicial,
    editorProps: {
      attributes: {
        class:
          "min-h-[18rem] rounded-b-[1.25rem] px-5 py-5 font-serif text-xl leading-8 text-[rgb(242_238_230)] outline-none",
      },
    },
  })

  React.useEffect(() => {
    return () => {
      imagenes.forEach((imagen) => URL.revokeObjectURL(imagen.url))
    }
  }, [imagenes])

  function agregarImagenes(event: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(event.target.files ?? []).filter((archivo) =>
      archivo.type.startsWith("image/")
    )

    if (archivos.length === 0) {
      return
    }

    setImagenes((actuales) => [
      ...actuales,
      ...archivos.map((archivo) => ({
        id: crypto.randomUUID(),
        archivo,
        url: URL.createObjectURL(archivo),
      })),
    ])

    event.target.value = ""
  }

  function quitarImagen(id: string) {
    setImagenes((actuales) => {
      const imagen = actuales.find((item) => item.id === id)

      if (imagen) {
        URL.revokeObjectURL(imagen.url)
      }

      return actuales.filter((item) => item.id !== id)
    })
  }

  function insertarImagenPorUrl() {
    const url = window.prompt("URL de la imagen")

    if (!url || !editor) {
      return
    }

    editor.chain().focus().setImage({ src: url }).run()
  }

  async function guardarParticipacion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editor) {
      return
    }

    const textoPlano = editor.getText().trim()

    if (!titulo.trim() || !textoPlano) {
      setEstadoGuardado("error")
      setMensaje("Falta titulo o texto para guardar.")
      return
    }

    // Si estas logueada y editaste tu firma, la guardamos en tu perfil antes de publicar.
    if (logueada && firmaCambiada) {
      const ok = await persistirFirma()
      if (!ok) {
        setEstadoGuardado("error")
        setMensaje("Revisa la firma antes de publicar.")
        return
      }
    }

    const datos = new FormData()
    datos.append("titulo", titulo.trim())
    datos.append("nombre_autor", firma.trim())
    datos.append("texto_json", JSON.stringify(editor.getJSON()))
    datos.append("texto_html", editor.getHTML())
    datos.append("texto_plano", textoPlano)
    datos.append("sitio_web", honeypotRef.current?.value ?? "")

    imagenes.forEach((imagen) => {
      datos.append("imagenes", imagen.archivo)
    })

    setEstadoGuardado("guardando")
    setMensaje("")

    const respuesta = await fetch("/api/participaciones", {
      method: "POST",
      body: datos,
    })

    const resultado = (await respuesta.json().catch(() => ({}))) as {
      mensaje?: string
      id?: string
      estado?: string
    }

    if (!respuesta.ok) {
      setEstadoGuardado("error")
      setMensaje(resultado.mensaje ?? "No se pudo guardar la participacion.")
      return
    }

    setEstadoGuardado("guardado")
    setMensaje(
      resultado.estado === "publicada"
        ? "Publicada. Ya esta en Obras abiertas."
        : "Gracias. Tu pieza entro a curaduria: la vas a ver cuando la aprobemos."
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 rounded-2xl border border-[rgb(217_255_31_/_0.25)] bg-[rgb(11_11_15_/_0.72)] px-5 py-4 backdrop-blur">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgb(217_255_31_/_0.4)] text-[rgb(217_255_31)]">
          <Sparkles className="size-4" />
        </span>
        <div>
          <div className="font-mono text-[0.62rem] tracking-[0.28em] text-[rgb(217_255_31)] uppercase">
            curaduria
          </div>
          <p className="mt-1.5 font-serif text-lg leading-7 text-[rgb(217_212_206_/_0.86)]">
            Tu pieza entra a una curaduria. La leemos con atencion antes de
            sumarla al archivo vivo. Si resuena, aparece en Obras abiertas.
          </p>
        </div>
      </div>

      <form
        onSubmit={guardarParticipacion}
        className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]"
      >
        {/* Honeypot anti-bots: invisible para personas. */}
        <input
          ref={honeypotRef}
          type="text"
          name="sitio_web"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <section className="min-w-0 space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="titulo"
              className="font-mono text-[0.7rem] text-[rgb(217_255_31)] uppercase"
            >
              titulo
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Nombre de la participacion"
              className="h-12 border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.76)] font-serif text-xl text-[rgb(242_238_230)] placeholder:text-[rgb(167_161_154_/_0.62)] focus-visible:border-[rgb(109_40_255)]"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="firma"
              className="font-mono text-[0.7rem] text-[rgb(217_255_31)] uppercase"
            >
              firma
            </Label>
            <div className="flex gap-2">
              <Input
                id="firma"
                value={firma}
                onChange={(event) => setFirma(event.target.value)}
                placeholder="Voz anonima"
                maxLength={60}
                className="h-12 border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.76)] font-mono text-sm tracking-[0.18em] text-[rgb(242_238_230)] uppercase placeholder:text-[rgb(167_161_154_/_0.62)] focus-visible:border-[rgb(109_40_255)]"
              />
              {logueada && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={persistirFirma}
                  disabled={guardandoFirma || !firma.trim() || !firmaCambiada}
                  className="h-12 shrink-0 rounded-md px-4 font-mono text-[0.66rem] uppercase"
                >
                  {guardandoFirma ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              )}
            </div>
            <p className="font-mono text-[0.66rem] leading-5 text-[rgb(167_161_154_/_0.74)]">
              {mensajeFirma ||
                "Es tu nombre publico en las obras. Lo podes cambiar cuando quieras."}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="font-mono text-[0.7rem] text-[rgb(217_255_31)] uppercase">
              imagenes
            </Label>
            <input
              ref={inputImagenesRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={agregarImagenes}
            />
            <button
              type="button"
              onClick={() => inputImagenesRef.current?.click()}
              className="group flex min-h-40 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[rgb(242_238_230_/_0.18)] bg-[rgb(11_11_15_/_0.7)] p-6 text-center transition-colors hover:border-[rgb(217_255_31_/_0.5)] hover:bg-[rgb(217_255_31_/_0.06)]"
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-[rgb(242_238_230_/_0.14)] text-[rgb(217_255_31)] transition-colors group-hover:border-[rgb(217_255_31_/_0.6)]">
                <Upload className="size-5" />
              </span>
              <span className="font-serif text-2xl text-[rgb(242_238_230)]">
                Subir imagenes
              </span>
            </button>

            {imagenes.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {imagenes.map((imagen) => (
                  <div
                    key={imagen.id}
                    className="relative overflow-hidden rounded-2xl border border-[rgb(242_238_230_/_0.12)] bg-[rgb(5_5_5)]"
                  >
                    <img
                      src={imagen.url}
                      alt={imagen.archivo.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      title="Quitar imagen"
                      aria-label="Quitar imagen"
                      onClick={() => quitarImagen(imagen.id)}
                      className="absolute top-3 right-3"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0">
          <Card className="overflow-hidden rounded-[1.5rem] border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.82)]">
            <CardHeader className="gap-4 border-b border-[rgb(242_238_230_/_0.1)] pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <BotonEditor
                  title="Negrita"
                  aria-label="Negrita"
                  activo={editor?.isActive("bold")}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Italica"
                  aria-label="Italica"
                  activo={editor?.isActive("italic")}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Subrayado"
                  aria-label="Subrayado"
                  activo={editor?.isActive("underline")}
                  onClick={() =>
                    editor?.chain().focus().toggleUnderline().run()
                  }
                >
                  <UnderlineIcon className="size-3" />
                </BotonEditor>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <BotonEditor
                  title="Titulo 1"
                  aria-label="Titulo 1"
                  activo={editor?.isActive("heading", { level: 1 })}
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                >
                  <Heading1 className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Titulo 2"
                  aria-label="Titulo 2"
                  activo={editor?.isActive("heading", { level: 2 })}
                  onClick={() =>
                    editor?.chain().focus().toggleHeading({ level: 2 }).run()
                  }
                >
                  <Heading2 className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Lista"
                  aria-label="Lista"
                  activo={editor?.isActive("bulletList")}
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                >
                  <List className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Lista numerada"
                  aria-label="Lista numerada"
                  activo={editor?.isActive("orderedList")}
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                >
                  <ListOrdered className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Cita"
                  aria-label="Cita"
                  activo={editor?.isActive("blockquote")}
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                >
                  <Quote className="size-3" />
                </BotonEditor>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <BotonEditor
                  title="Imagen por URL"
                  aria-label="Imagen por URL"
                  onClick={insertarImagenPorUrl}
                >
                  <ImageIcon className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Deshacer"
                  aria-label="Deshacer"
                  onClick={() => editor?.chain().focus().undo().run()}
                >
                  <Undo2 className="size-3" />
                </BotonEditor>
                <BotonEditor
                  title="Rehacer"
                  aria-label="Rehacer"
                  onClick={() => editor?.chain().focus().redo().run()}
                >
                  <Redo2 className="size-3" />
                </BotonEditor>
              </div>
              <CardTitle className="font-serif text-3xl text-[rgb(242_238_230)]">
                Texto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="participacion-editor">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-h-6 font-mono text-xs text-[rgb(167_161_154)]">
              {mensaje}
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={estadoGuardado === "guardando"}
              className="h-11 rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.7rem] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
            >
              {estadoGuardado === "guardando" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar
            </Button>
          </div>
        </section>
      </form>
    </div>
  )
}
