"use client"

/* eslint-disable @next/next/no-img-element */

import * as React from "react"
import Link from "next/link"
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react"
import ImageExtension from "@tiptap/extension-image"
import Highlight from "@tiptap/extension-highlight"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyleKit } from "@tiptap/extension-text-style"
import Typography from "@tiptap/extension-typography"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import StarterKit from "@tiptap/starter-kit"
import { Check, CircleAlert, Loader2, Plus, Trash2, X } from "lucide-react"

import { BarraHerramientas } from "@/components/participacion/barra-herramientas"
import { MenuSesion, type DatosSesion } from "@/components/layout/menu-sesion"
import { ThemeToggle } from "@/components/theme-toggle"
import { useMenuComandos } from "@/components/participacion/menu-comandos"
import { ComandosSlash } from "@/lib/editor/comandos-slash"
import {
  CursorPalabras,
  preferenciasCursorIniciales,
  type PreferenciasCursor,
} from "@/lib/editor/cursor-palabras"
import { Verso } from "@/lib/editor/verso"
import { cn } from "@/lib/utils"

type VistaPreviaImagen = {
  id: string
  archivo: File
  url: string
}

type EstadoGuardado = "inicial" | "guardando" | "guardado" | "error"

type Borrador = {
  titulo: string
  contenido: unknown
  guardadoEn: string
}

const CLAVE_BORRADOR = "palabras:borrador:v1"
const CLAVE_PREFERENCIAS = "palabras:editor:preferencias:v1"
const PALABRAS_POR_MINUTO = 200

type Preferencias = {
  cursor: PreferenciasCursor
  lienzoAmplio: boolean
  meta: number
}

const preferenciasIniciales: Preferencias = {
  cursor: preferenciasCursorIniciales,
  lienzoAmplio: false,
  meta: 500,
}

function leerJSON<T>(clave: string): T | null {
  try {
    const crudo = window.localStorage.getItem(clave)
    return crudo ? (JSON.parse(crudo) as T) : null
  } catch {
    return null
  }
}

function escribirJSON(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento (modo privado, cuota llena): seguimos sin guardar.
  }
}

function borrarClave(clave: string) {
  try {
    window.localStorage.removeItem(clave)
  } catch {
    // nada
  }
}

function horaCorta(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

type Seccion = { texto: string; nivel: number; pos: number }

function useResumenTexto(editor: Editor | null) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) {
        return {
          palabras: 0,
          caracteres: 0,
          secciones: [] as Seccion[],
          activa: -1,
        }
      }
      const secciones: Seccion[] = []
      e.state.doc.descendants((nodo, pos) => {
        if (nodo.type.name === "heading") {
          secciones.push({
            texto: nodo.textContent.trim() || "Sin título",
            nivel: Number(nodo.attrs.level ?? 2),
            pos,
          })
          return false
        }
        return true
      })
      const desde = e.state.selection.from
      let activa = -1
      secciones.forEach((seccion, i) => {
        if (seccion.pos <= desde) activa = i
      })
      const almacen = e.storage.characterCount as {
        words: () => number
        characters: () => number
      }
      return {
        palabras: almacen.words(),
        caracteres: almacen.characters(),
        secciones,
        activa,
      }
    },
  })
}

const claseEtiqueta =
  "font-mono text-[0.62rem] tracking-[0.26em] text-muted-foreground uppercase"

export function EditorParticipacion({
  firma: firmaInicial,
  logueada = false,
  sesion,
}: {
  firma?: string
  logueada?: boolean
  sesion?: DatosSesion
}) {
  const inputImagenesRef = React.useRef<HTMLInputElement | null>(null)
  const honeypotRef = React.useRef<HTMLInputElement | null>(null)
  const tituloRef = React.useRef<HTMLTextAreaElement | null>(null)

  const [titulo, setTitulo] = React.useState("")
  const [firma, setFirma] = React.useState(firmaInicial ?? "")
  const [imagenes, setImagenes] = React.useState<VistaPreviaImagen[]>([])
  const [estadoGuardado, setEstadoGuardado] =
    React.useState<EstadoGuardado>("inicial")
  const [mensaje, setMensaje] = React.useState("")
  const [guardandoFirma, setGuardandoFirma] = React.useState(false)
  const [mensajeFirma, setMensajeFirma] = React.useState("")
  const [panelAbierto, setPanelAbierto] = React.useState(false)
  const [preferencias, setPreferencias] = React.useState<Preferencias>(
    preferenciasIniciales
  )
  const [borradorGuardadoEn, setBorradorGuardadoEn] = React.useState<
    string | null
  >(null)

  const { puente, menu } = useMenuComandos()
  const firmaCambiada = firma.trim() !== (firmaInicial ?? "").trim()

  function actualizarPreferencias(cambio: Partial<Preferencias>) {
    setPreferencias((actuales) => {
      const nuevas = { ...actuales, ...cambio }
      escribirJSON(CLAVE_PREFERENCIAS, nuevas)
      return nuevas
    })
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      ImageExtension.configure({ allowBase64: false }),
      Highlight,
      TextStyleKit.configure({ lineHeight: false, backgroundColor: false }),
      TextAlign.configure({ types: ["heading", "paragraph", "verso"] }),
      Typography.configure({
        openDoubleQuote: "«",
        closeDoubleQuote: "»",
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: ({ node }) =>
          node.type.name === "heading"
            ? "Título de la sección"
            : "Escribí, o tocá / para formatos…",
      }),
      Verso,
      CursorPalabras,
      ComandosSlash.configure({ puente }),
    ],
    editorProps: {
      attributes: {
        class: "texto-palabras",
        "aria-label": "Texto de tu pieza",
        spellcheck: "true",
      },
    },
    // onCreate corre solo en el navegador: ahi recuperamos borrador y preferencias.
    onCreate: ({ editor: e }) => {
      const guardadas = leerJSON<Partial<Preferencias>>(CLAVE_PREFERENCIAS)
      if (guardadas) {
        setPreferencias((actuales) => ({
          ...actuales,
          ...guardadas,
          cursor: { ...actuales.cursor, ...guardadas.cursor },
        }))
      }
      const borrador = leerJSON<Borrador>(CLAVE_BORRADOR)
      if (borrador?.titulo) {
        setTitulo(borrador.titulo)
      }
      if (borrador?.contenido) {
        e.commands.setContent(borrador.contenido as never, {
          emitUpdate: false,
        })
        setBorradorGuardadoEn(borrador.guardadoEn)
      }
    },
  })

  // Autoguardado del borrador en este dispositivo (texto y titulo).
  const tituloActualRef = React.useRef(titulo)
  React.useEffect(() => {
    tituloActualRef.current = titulo
  }, [titulo])
  const temporizadorRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  const programarGuardado = React.useCallback(() => {
    clearTimeout(temporizadorRef.current)
    temporizadorRef.current = setTimeout(() => {
      if (!editor || editor.isDestroyed) {
        return
      }
      const guardadoEn = new Date().toISOString()
      escribirJSON(CLAVE_BORRADOR, {
        titulo: tituloActualRef.current,
        contenido: editor.getJSON(),
        guardadoEn,
      } satisfies Borrador)
      setBorradorGuardadoEn(guardadoEn)
    }, 700)
  }, [editor])

  React.useEffect(() => {
    if (!editor) {
      return
    }
    editor.on("update", programarGuardado)
    return () => {
      editor.off("update", programarGuardado)
      clearTimeout(temporizadorRef.current)
    }
  }, [editor, programarGuardado])

  function cambiarTitulo(valor: string) {
    setTitulo(valor)
    programarGuardado()
  }

  // El titulo crece con el texto.
  React.useLayoutEffect(() => {
    const campo = tituloRef.current
    if (campo) {
      campo.style.height = "auto"
      campo.style.height = `${campo.scrollHeight}px`
    }
  }, [titulo, preferencias.lienzoAmplio])

  React.useEffect(() => {
    return () => {
      imagenes.forEach((imagen) => URL.revokeObjectURL(imagen.url))
    }
  }, [imagenes])

  React.useEffect(() => {
    if (!panelAbierto) {
      return
    }
    function alTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanelAbierto(false)
      }
    }
    document.addEventListener("keydown", alTecla)
    return () => document.removeEventListener("keydown", alTecla)
  }, [panelAbierto])

  const resumen = useResumenTexto(editor)
  const palabras = resumen?.palabras ?? 0
  const minutosLectura = Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO))
  const progresoMeta = Math.min(
    100,
    Math.round((palabras / Math.max(1, preferencias.meta)) * 100)
  )

  // Persiste la firma en el perfil. Devuelve true si salio bien.
  async function persistirFirma(): Promise<boolean> {
    const nombre = firma.trim()
    if (!nombre) {
      setMensajeFirma("La firma no puede estar vacía.")
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

  function irASeccion(pos: number) {
    if (!editor) {
      return
    }
    const nodo = editor.view.nodeDOM(pos)
    if (nodo instanceof HTMLElement) {
      nodo.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    editor
      .chain()
      .focus()
      .setTextSelection(pos + 1)
      .run()
  }

  async function guardarParticipacion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editor) {
      return
    }

    const textoPlano = editor.getText().trim()
    if (!titulo.trim() || !textoPlano) {
      setEstadoGuardado("error")
      setMensaje("Falta título o texto para enviar.")
      return
    }

    // Si estas logueada y editaste tu firma, la guardamos en tu perfil antes de publicar.
    if (logueada && firmaCambiada) {
      const ok = await persistirFirma()
      if (!ok) {
        setEstadoGuardado("error")
        setMensaje("Revisá la firma antes de publicar.")
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
      setMensaje(resultado.mensaje ?? "No se pudo guardar la participación.")
      return
    }

    borrarClave(CLAVE_BORRADOR)
    setEstadoGuardado("guardado")
    setMensaje(
      resultado.estado === "publicada"
        ? "Publicada. Ya está en Obras abiertas."
        : "Gracias. Tu pieza entró a curaduría: la vas a ver cuando la aprobemos."
    )
  }

  const amplio = preferencias.lienzoAmplio
  const { cursor } = preferencias

  const repaso = [
    {
      ok: titulo.trim().length > 0,
      texto: titulo.trim() ? "Título" : "Falta el título",
    },
    {
      ok: palabras > 0,
      texto:
        palabras > 0
          ? `${palabras} palabras · ${minutosLectura} min de lectura`
          : "Todavía no hay texto",
    },
    {
      ok: firma.trim().length > 0,
      texto: firma.trim()
        ? `Firma: ${firma.trim()}`
        : "Sin firma: se publica como voz anónima",
    },
    {
      ok: true,
      texto:
        imagenes.length === 0
          ? "Sin imágenes adjuntas"
          : `${imagenes.length} ${imagenes.length === 1 ? "imagen adjunta" : "imágenes adjuntas"}`,
    },
  ]

  return (
    <form
      onSubmit={guardarParticipacion}
      className="editor-palabras flex min-h-screen flex-col"
      data-cursor-forma={cursor.forma}
      data-cursor-color={cursor.color}
      data-cursor-titila={cursor.titila ? "si" : "no"}
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
      <input
        ref={inputImagenesRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={agregarImagenes}
      />

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-3 sm:px-7">
        <div className="flex min-w-0 flex-wrap items-center gap-5">
          <Link
            href="/"
            className="font-mono text-xs tracking-[0.24em] text-lime-text uppercase hover:text-foreground"
          >
            palabras
          </Link>
          <span className="max-w-[40ch] truncate font-mono text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
            participación / {titulo.trim() || "borrador"}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.12em] text-muted-foreground uppercase">
          <span
            className={cn(
              "size-2 rounded-full",
              borradorGuardadoEn ? "bg-lime" : "bg-muted-foreground"
            )}
          />
          <span>
            {borradorGuardadoEn
              ? `Borrador guardado en este dispositivo · ${horaCorta(borradorGuardadoEn)}`
              : "Borrador nuevo"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {amplio && (
            <span className="font-mono text-[0.68rem] tracking-[0.12em] text-muted-foreground uppercase">
              {palabras} palabras
            </span>
          )}
          <button
            type="button"
            onClick={() => setPanelAbierto(true)}
            className="h-11 rounded-full bg-lime px-6 font-mono text-[0.68rem] font-medium tracking-[0.14em] text-lime-foreground uppercase hover:bg-primary hover:text-primary-foreground"
          >
            Publicar
          </button>
          {sesion ? <MenuSesion sesion={sesion} /> : <ThemeToggle />}
        </div>
      </header>

      <div className="flex flex-1 items-stretch">
        {!amplio && (
          <aside className="hidden w-[230px] shrink-0 flex-col gap-3 px-6 py-8 lg:flex">
            <span className={claseEtiqueta}>Mapa del texto</span>
            {resumen && resumen.secciones.length > 0 ? (
              <nav
                aria-label="Secciones del texto"
                className="flex flex-col gap-2.5"
              >
                {resumen.secciones.map((seccion, i) => (
                  <button
                    key={`${seccion.pos}-${i}`}
                    type="button"
                    onClick={() => irASeccion(seccion.pos)}
                    className={cn(
                      "border-l py-0.5 text-left font-serif leading-snug transition-colors hover:text-foreground",
                      seccion.nivel === 3
                        ? "pl-6 text-[0.95rem]"
                        : "pl-3 text-base",
                      i === resumen.activa
                        ? "border-lime-text text-lime-text"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {seccion.texto}
                  </button>
                ))}
              </nav>
            ) : (
              <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
                Los títulos de sección que escribas aparecen acá para saltar
                entre partes. Probá con{" "}
                <span className="font-mono text-lime-text">/</span> o
                escribiendo <span className="font-mono">##</span> y un espacio.
              </p>
            )}
          </aside>
        )}

        <main
          className={cn(
            "flex min-w-0 flex-1 justify-center",
            amplio ? "px-3 py-4 sm:px-6 sm:py-5" : "px-3 py-6 sm:px-6"
          )}
        >
          <div
            className={cn(
              "flex w-full flex-col rounded-[22px] border border-border bg-card",
              amplio ? "max-w-[1360px]" : "max-w-[820px]"
            )}
          >
            {editor && (
              <BarraHerramientas
                editor={editor}
                lienzoAmplio={amplio}
                onAlternarLienzo={() =>
                  actualizarPreferencias({ lienzoAmplio: !amplio })
                }
                cursor={cursor}
                onCambiarCursor={(nuevo) =>
                  actualizarPreferencias({ cursor: nuevo })
                }
              />
            )}

            <div
              className={cn(
                "mx-auto flex w-full flex-1 flex-col",
                amplio
                  ? "max-w-[900px] px-6 pt-14 pb-24 sm:px-8"
                  : "px-6 pt-12 pb-20 sm:px-14"
              )}
            >
              <label htmlFor="titulo" className="sr-only">
                Título
              </label>
              <textarea
                id="titulo"
                ref={tituloRef}
                rows={1}
                value={titulo}
                onChange={(event) =>
                  cambiarTitulo(event.target.value.replace(/\n/g, " "))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    editor?.commands.focus("start")
                  }
                }}
                placeholder="Título de tu pieza"
                className="w-full resize-none overflow-hidden bg-transparent font-serif text-[2.6rem] leading-[1.05] font-medium text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-[3.4rem]"
              />
              <div className="mt-3 mb-8 flex flex-wrap items-center gap-3 font-mono text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
                <span>por</span>
                <button
                  type="button"
                  onClick={() => setPanelAbierto(true)}
                  className="text-lime-text uppercase hover:text-foreground"
                >
                  {firma.trim() || "voz anónima"}
                </button>
              </div>

              <EditorContent editor={editor} className="flex-1" />
            </div>
          </div>
        </main>

        {!amplio && (
          <aside className="hidden w-[270px] shrink-0 flex-col gap-7 px-6 py-8 xl:flex">
            <section className="flex flex-col gap-3">
              <span className={claseEtiqueta}>Tu sesión</span>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-border bg-card p-3.5">
                  <div className="font-serif text-3xl leading-none">
                    {palabras}
                  </div>
                  <div className="mt-1.5 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
                    palabras
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3.5">
                  <div className="font-serif text-3xl leading-none">
                    {minutosLectura} min
                  </div>
                  <div className="mt-1.5 font-mono text-[0.6rem] tracking-[0.14em] text-muted-foreground uppercase">
                    de lectura
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-[0.8rem] text-foreground-soft">
                  <label htmlFor="meta">Meta de palabras</label>
                  <span className="text-lime-text tabular-nums">
                    {palabras} /{" "}
                    <input
                      id="meta"
                      type="number"
                      min={50}
                      step={50}
                      value={preferencias.meta}
                      onChange={(event) =>
                        actualizarPreferencias({
                          meta: Math.max(50, Number(event.target.value) || 50),
                        })
                      }
                      className="w-14 bg-transparent text-right text-lime-text outline-none focus-visible:underline"
                    />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-lime transition-[width]"
                    style={{ width: `${progresoMeta}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <span className={claseEtiqueta}>Imágenes adjuntas</span>
              <div className="grid grid-cols-3 gap-2">
                {imagenes.map((imagen) => (
                  <div
                    key={imagen.id}
                    className="group relative aspect-square overflow-hidden rounded-[10px] border border-border"
                  >
                    <img
                      src={imagen.url}
                      alt={imagen.archivo.name}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      aria-label={`Quitar ${imagen.archivo.name}`}
                      onClick={() => quitarImagen(imagen.id)}
                      className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  aria-label="Subir imágenes"
                  onClick={() => inputImagenesRef.current?.click()}
                  className="flex aspect-square items-center justify-center rounded-[10px] border border-dashed border-border-strong text-muted-foreground hover:border-lime-text/60 hover:text-lime-text"
                >
                  <Plus className="size-5" />
                </button>
              </div>
            </section>
          </aside>
        )}
      </div>

      <footer className="flex flex-wrap justify-between gap-3 border-t border-border px-5 py-3 font-mono text-[0.68rem] tracking-[0.1em] text-muted-foreground sm:px-7">
        <span>
          {palabras} palabras · {resumen?.caracteres ?? 0} caracteres ·{" "}
          {resumen?.secciones.length ?? 0} secciones
        </span>
        <span>
          / formatos · Ctrl+B negrita · Ctrl+I itálica · Ctrl+Z deshacer
        </span>
      </footer>

      {panelAbierto && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <button
            type="button"
            aria-label="Cerrar y seguir escribiendo"
            onClick={() => setPanelAbierto(false)}
            className="absolute inset-0 bg-scrim backdrop-blur-[2px]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-panel-publicar"
            className="relative flex h-full w-full max-w-[480px] flex-col gap-6 overflow-y-auto border-l border-border bg-card p-7"
          >
            <div className="flex items-center justify-between gap-3">
              <h2
                id="titulo-panel-publicar"
                className="font-mono text-[0.7rem] tracking-[0.24em] text-lime-text uppercase"
              >
                Antes de publicar
              </h2>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setPanelAbierto(false)}
                className="flex size-11 items-center justify-center rounded-full border border-border-strong text-foreground hover:border-lime-text/60"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="titulo-publicar" className={claseEtiqueta}>
                Título
              </label>
              <input
                id="titulo-publicar"
                value={titulo}
                onChange={(event) => cambiarTitulo(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.preventDefault()
                }}
                placeholder="Nombre de la pieza"
                className="h-12 rounded-xl border border-border bg-background px-3.5 font-serif text-xl text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="firma" className={claseEtiqueta}>
                Firma
              </label>
              <div className="flex gap-2">
                <input
                  id="firma"
                  value={firma}
                  onChange={(event) => setFirma(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.preventDefault()
                  }}
                  placeholder="Voz anónima"
                  maxLength={60}
                  className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 font-mono text-sm tracking-[0.18em] text-foreground uppercase outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring"
                />
                {logueada && (
                  <button
                    type="button"
                    onClick={persistirFirma}
                    disabled={guardandoFirma || !firma.trim() || !firmaCambiada}
                    className="h-12 shrink-0 rounded-xl border border-border-strong px-4 font-mono text-[0.62rem] tracking-[0.14em] text-foreground uppercase disabled:opacity-40"
                  >
                    {guardandoFirma ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Guardar"
                    )}
                  </button>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {mensajeFirma ||
                  "Es tu nombre público en las obras. Lo podés cambiar cuando quieras."}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background p-4">
              <span className={claseEtiqueta}>Repaso</span>
              {repaso.map((item) => (
                <div
                  key={item.texto}
                  className="flex items-center gap-2.5 text-sm text-foreground-soft"
                >
                  {item.ok ? (
                    <Check className="size-4 shrink-0 text-lime-text" />
                  ) : (
                    <CircleAlert className="size-4 shrink-0 text-warning" />
                  )}
                  <span>{item.texto}</span>
                </div>
              ))}
              <button
                type="button"
                onClick={() => inputImagenesRef.current?.click()}
                className="mt-1 self-start font-mono text-[0.62rem] tracking-[0.14em] text-lime-text uppercase hover:text-foreground"
              >
                + Adjuntar imágenes
              </button>
            </div>

            <p className="font-serif text-lg leading-relaxed text-foreground-soft">
              Tu pieza entra a curaduría. La leemos con atención antes de
              sumarla al archivo vivo. Si resuena, aparece en Obras abiertas.
            </p>

            {mensaje && (
              <p
                role="status"
                className={cn(
                  "rounded-xl border px-4 py-3 text-sm",
                  estadoGuardado === "error"
                    ? "border-warning/40 text-warning"
                    : "border-lime-text/40 text-lime-text"
                )}
              >
                {mensaje}
              </p>
            )}

            <div className="mt-auto flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setPanelAbierto(false)}
                className="h-12 flex-1 basis-40 rounded-full border border-border-strong font-mono text-[0.68rem] tracking-[0.14em] text-foreground uppercase hover:border-lime-text/60"
              >
                Seguir escribiendo
              </button>
              <button
                type="submit"
                disabled={
                  estadoGuardado === "guardando" ||
                  estadoGuardado === "guardado"
                }
                className="inline-flex h-12 flex-1 basis-40 items-center justify-center gap-2 rounded-full bg-lime font-mono text-[0.68rem] font-medium tracking-[0.14em] text-lime-foreground uppercase hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
              >
                {estadoGuardado === "guardando" && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {estadoGuardado === "guardado"
                  ? "Enviada"
                  : "Enviar a curaduría"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {menu}
    </form>
  )
}
