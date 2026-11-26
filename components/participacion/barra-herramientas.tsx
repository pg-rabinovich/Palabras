"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Ellipsis,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"

import type {
  ColorCursor,
  FormaCursor,
  PreferenciasCursor,
} from "@/lib/editor/cursor-palabras"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  teclasDeAtajo,
  textoDeAtajo,
  useEsMac,
  type Atajo,
} from "@/lib/editor/atajos"
import { cn } from "@/lib/utils"

const TAMANO_BASE = 23
const TAMANO_MIN = 14
const TAMANO_MAX = 48

const fuentes = [
  { valor: "serif", etiqueta: "Cormorant", css: "var(--font-serif)" },
  { valor: "sans", etiqueta: "Plex Sans", css: "var(--font-sans)" },
  { valor: "mono", etiqueta: "Plex Mono", css: "var(--font-mono)" },
] as const

const colores = [
  // Los valores son tokens (no colores): el texto guardado cambia con el tema.
  { nombre: "Tinta", valor: null, muestra: "var(--foreground)" },
  { nombre: "Lima", valor: "var(--tinta-lima)", muestra: "var(--tinta-lima)" },
  {
    nombre: "Violeta",
    valor: "var(--tinta-violeta)",
    muestra: "var(--tinta-violeta)",
  },
  {
    nombre: "Piedra",
    valor: "var(--tinta-piedra)",
    muestra: "var(--tinta-piedra)",
  },
] as const

type Bloque = "parrafo" | "seccion" | "subseccion" | "verso" | "cita"

// Tooltip de las herramientas: nombre, que hace y su atajo (⌘ en Mac).
function Ayuda({
  titulo,
  descripcion,
  atajo,
  children,
}: {
  titulo: string
  descripcion?: string
  atajo?: Atajo
  children: React.ReactNode
}) {
  const esMac = useEsMac()
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={8}
        className="max-w-64 flex-col items-start gap-1"
      >
        <span className="flex w-full items-center justify-between gap-4 text-[0.8rem] font-medium text-foreground">
          {titulo}
          {atajo && (
            <span className="flex shrink-0 gap-1" aria-label="Atajo">
              {teclasDeAtajo(atajo, esMac).map((tecla, i) => (
                <kbd
                  key={`${tecla}-${i}`}
                  className="min-w-5 rounded-md border border-border-strong bg-background px-1.5 py-0.5 text-center font-mono text-[0.65rem] text-foreground-soft"
                >
                  {tecla}
                </kbd>
              ))}
            </span>
          )}
        </span>
        {descripcion && (
          <span className="text-[0.75rem] leading-relaxed text-muted-foreground">
            {descripcion}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

function Boton({
  activo,
  etiqueta,
  descripcion,
  atajo,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  activo?: boolean
  etiqueta: string
  descripcion?: string
  atajo?: Atajo
}) {
  return (
    <Ayuda titulo={etiqueta} descripcion={descripcion} atajo={atajo}>
      <button
        type="button"
        aria-label={etiqueta}
        aria-pressed={activo}
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-[9px] text-foreground-soft transition-colors hover:bg-violet-soft hover:text-lime-text disabled:opacity-40",
          activo && "bg-lime-soft text-lime-text",
          className
        )}
        {...props}
      >
        {children}
      </button>
    </Ayuda>
  )
}

function Grupo({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-border bg-background p-[3px]">
      {children}
    </div>
  )
}

function usePopover() {
  const [abierto, setAbierto] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!abierto) {
      return
    }
    function alClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAbierto(false)
      }
    }
    function alTecla(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAbierto(false)
      }
    }
    document.addEventListener("mousedown", alClick)
    document.addEventListener("keydown", alTecla)
    return () => {
      document.removeEventListener("mousedown", alClick)
      document.removeEventListener("keydown", alTecla)
    }
  }, [abierto])

  return { abierto, setAbierto, ref }
}

const claseSelect =
  "h-9 appearance-none rounded-[9px] bg-transparent pr-7 pl-2.5 text-[0.8rem] text-foreground-soft outline-none hover:bg-violet-soft focus-visible:ring-1 focus-visible:ring-ring [&>option]:bg-popover"

const claseEtiquetaPopover =
  "font-mono text-[0.6rem] tracking-[0.24em] text-muted-foreground uppercase"

export function BarraHerramientas({
  editor,
  lienzoAmplio,
  onAlternarLienzo,
  cursor,
  onCambiarCursor,
}: {
  editor: Editor
  lienzoAmplio: boolean
  onAlternarLienzo: () => void
  cursor: PreferenciasCursor
  onCambiarCursor: (cursor: PreferenciasCursor) => void
}) {
  const esMac = useEsMac()
  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const estilo = e.getAttributes("textStyle") as {
        fontFamily?: string
        fontSize?: string
        color?: string
      }
      let bloque: Bloque = "parrafo"
      if (e.isActive("heading", { level: 2 })) bloque = "seccion"
      else if (e.isActive("heading", { level: 3 })) bloque = "subseccion"
      else if (e.isActive("verso")) bloque = "verso"
      else if (e.isActive("blockquote")) bloque = "cita"

      return {
        bloque,
        fuente:
          fuentes.find((fuente) => fuente.css === estilo.fontFamily)?.valor ??
          "serif",
        tamano: estilo.fontSize
          ? Number.parseInt(estilo.fontSize, 10)
          : TAMANO_BASE,
        color: estilo.color ?? null,
        negrita: e.isActive("bold"),
        italica: e.isActive("italic"),
        subrayado: e.isActive("underline"),
        tachado: e.isActive("strike"),
        resaltado: e.isActive("highlight"),
        enlace: e.isActive("link"),
        alineacion:
          (["center", "right", "justify"] as const).find((a) =>
            e.isActive({ textAlign: a })
          ) ?? "left",
        vinetas: e.isActive("bulletList"),
        numerada: e.isActive("orderedList"),
        puedeDeshacer: e.can().undo(),
        puedeRehacer: e.can().redo(),
      }
    },
  })

  const {
    abierto: colorAbierto,
    setAbierto: setColorAbierto,
    ref: colorRef,
  } = usePopover()
  const {
    abierto: masAbierto,
    setAbierto: setMasAbierto,
    ref: masRef,
  } = usePopover()

  function cambiarBloque(bloque: Bloque) {
    const cadena = editor.chain().focus()
    switch (bloque) {
      case "seccion":
        cadena.setHeading({ level: 2 }).run()
        break
      case "subseccion":
        cadena.setHeading({ level: 3 }).run()
        break
      case "verso":
        cadena.setNode("verso").run()
        break
      case "cita":
        cadena.setParagraph().setBlockquote().run()
        break
      default:
        if (editor.isActive("blockquote")) {
          cadena.lift("blockquote").setParagraph().run()
        } else {
          cadena.setParagraph().run()
        }
    }
  }

  function cambiarFuente(valor: string) {
    const fuente = fuentes.find((f) => f.valor === valor)
    if (!fuente || fuente.valor === "serif") {
      editor.chain().focus().unsetFontFamily().run()
      return
    }
    editor.chain().focus().setFontFamily(fuente.css).run()
  }

  function cambiarTamano(delta: number) {
    const nuevo = Math.min(
      TAMANO_MAX,
      Math.max(TAMANO_MIN, estado.tamano + delta)
    )
    if (nuevo === TAMANO_BASE) {
      editor.chain().focus().unsetFontSize().run()
    } else {
      editor.chain().focus().setFontSize(`${nuevo}px`).run()
    }
  }

  function editarEnlace() {
    const anterior = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Dirección del enlace", anterior ?? "https://")
    if (url === null) {
      return
    }
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run()
  }

  function insertarImagen() {
    const url = window.prompt("URL de la imagen")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const formas: {
    valor: FormaCursor
    etiqueta: string
    muestra: React.ReactNode
  }[] = [
    {
      valor: "barra-inclinada",
      etiqueta: "Barra inclinada",
      muestra: <span className="font-mono text-lg">/</span>,
    },
    {
      valor: "barra",
      etiqueta: "Barra clásica",
      muestra: <span className="font-mono text-lg">|</span>,
    },
    {
      valor: "bloque",
      etiqueta: "Bloque",
      muestra: <span className="block h-5 w-2.5 bg-current" />,
    },
  ]

  const coloresCursor: {
    valor: ColorCursor
    etiqueta: string
    muestra: string
  }[] = [
    { valor: "lima", etiqueta: "Lima", muestra: "var(--cursor-lima)" },
    { valor: "blanco", etiqueta: "Clásico", muestra: "var(--cursor-clasico)" },
  ]

  return (
    <TooltipProvider delayDuration={350}>
      <div
        role="toolbar"
        aria-label="Herramientas de texto"
        className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-t-[22px] border-b border-border bg-surface-raised px-3.5 py-2.5"
      >
        <Grupo>
          <Boton
            etiqueta="Deshacer"
            descripcion="Vuelve atrás el último cambio."
            atajo={["Mod", "Z"]}
            disabled={!estado.puedeDeshacer}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-4" />
          </Boton>
          <Boton
            etiqueta="Rehacer"
            descripcion="Recupera lo que deshiciste."
            atajo={["Mod", "Shift", "Z"]}
            disabled={!estado.puedeRehacer}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-4" />
          </Boton>
        </Grupo>

        <Grupo>
          <Ayuda
            titulo="Tipo de bloque"
            descripcion="Convierte el párrafo en título de sección, subtítulo, verso o cita."
          >
            <label className="relative inline-flex items-center">
              <span className="sr-only">Tipo de bloque</span>
              <select
                value={estado.bloque}
                onChange={(event) =>
                  cambiarBloque(event.target.value as Bloque)
                }
                className={claseSelect}
              >
                <option value="parrafo">Párrafo</option>
                <option value="seccion">Título de sección</option>
                <option value="subseccion">Subtítulo</option>
                <option value="verso">Verso</option>
                <option value="cita">Cita</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 size-3 text-muted-foreground" />
            </label>
          </Ayuda>
          <Ayuda
            titulo="Tipografía"
            descripcion="Cambia la letra de lo seleccionado: Cormorant, Plex Sans o Plex Mono."
          >
            <label className="relative inline-flex items-center">
              <span className="sr-only">Fuente</span>
              <select
                value={estado.fuente}
                onChange={(event) => cambiarFuente(event.target.value)}
                className={cn(claseSelect, "font-serif text-[0.95rem]")}
              >
                {fuentes.map((fuente) => (
                  <option key={fuente.valor} value={fuente.valor}>
                    {fuente.etiqueta}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 size-3 text-muted-foreground" />
            </label>
          </Ayuda>
          <Boton
            etiqueta="Achicar letra"
            descripcion="Achica el texto seleccionado (o lo que escribas desde acá)."
            className="w-7"
            disabled={estado.tamano <= TAMANO_MIN}
            onClick={() => cambiarTamano(-1)}
          >
            <Minus className="size-3.5" />
          </Boton>
          <span
            className="min-w-6 text-center text-[0.8rem] text-foreground tabular-nums"
            aria-label={`Tamaño ${estado.tamano}`}
          >
            {estado.tamano}
          </span>
          <Boton
            etiqueta="Agrandar letra"
            descripcion="Agranda el texto seleccionado (o lo que escribas desde acá)."
            className="w-7"
            disabled={estado.tamano >= TAMANO_MAX}
            onClick={() => cambiarTamano(1)}
          >
            <Plus className="size-3.5" />
          </Boton>
        </Grupo>

        <Grupo>
          <Boton
            etiqueta="Negrita"
            descripcion="Aplica negrita a lo seleccionado."
            atajo={["Mod", "B"]}
            activo={estado.negrita}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" />
          </Boton>
          <Boton
            etiqueta="Itálica"
            descripcion="Aplica itálica a lo seleccionado."
            atajo={["Mod", "I"]}
            activo={estado.italica}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" />
          </Boton>
          <Boton
            etiqueta="Subrayado"
            descripcion="Subraya lo seleccionado."
            atajo={["Mod", "U"]}
            activo={estado.subrayado}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="size-4" />
          </Boton>
          <Boton
            etiqueta="Tachado"
            descripcion="Tacha lo seleccionado, sin borrarlo."
            atajo={["Mod", "Shift", "S"]}
            activo={estado.tachado}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="size-4" />
          </Boton>
          <div className="relative" ref={colorRef}>
            <Boton
              etiqueta="Color y resaltado"
              descripcion="Pintá la letra de lima, violeta o piedra, o resaltá con marcador."
              atajo={["Mod", "Shift", "H"]}
              activo={colorAbierto}
              aria-expanded={colorAbierto}
              onClick={() => setColorAbierto((v) => !v)}
              className="flex-col gap-0.5"
            >
              <span className="text-sm leading-none">A</span>
              <span
                className="h-[3px] w-4"
                style={{ background: estado.color ?? "var(--tinta-lima)" }}
              />
            </Boton>
            {colorAbierto && (
              <div className="absolute top-11 left-0 z-30 flex w-56 flex-col gap-3 rounded-2xl border border-border-strong bg-popover p-3.5 shadow-flotante">
                <span className={claseEtiquetaPopover}>Color de letra</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {colores.map((color) => (
                    <button
                      key={color.nombre}
                      type="button"
                      title={color.nombre}
                      aria-label={color.nombre}
                      onClick={() => {
                        if (color.valor) {
                          editor.chain().focus().setColor(color.valor).run()
                        } else {
                          editor.chain().focus().unsetColor().run()
                        }
                        setColorAbierto(false)
                      }}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg border border-border",
                        (estado.color ?? null) === color.valor &&
                          "border-lime-text"
                      )}
                    >
                      <span
                        className="size-4 rounded-full"
                        style={{ background: color.muestra }}
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-pressed={estado.resaltado}
                  onClick={() => {
                    editor.chain().focus().toggleHighlight().run()
                    setColorAbierto(false)
                  }}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-foreground-soft",
                    estado.resaltado && "border-lime-text text-lime-text"
                  )}
                >
                  <Highlighter className="size-4" />
                  {estado.resaltado ? "Quitar resaltado" : "Resaltar"}
                </button>
              </div>
            )}
          </div>
        </Grupo>

        <Grupo>
          <Boton
            etiqueta="Alinear párrafo a la izquierda"
            descripcion="Se aplica al párrafo entero. Para alinear solo una frase, dejala en su propio párrafo."
            atajo={["Mod", "Shift", "L"]}
            activo={estado.alineacion === "left"}
            onClick={() => editor.chain().focus().unsetTextAlign().run()}
          >
            <AlignLeft className="size-4" />
          </Boton>
          <Boton
            etiqueta="Centrar párrafo"
            descripcion="Se aplica al párrafo entero. Para centrar solo una frase, dejala en su propio párrafo."
            atajo={["Mod", "Shift", "E"]}
            activo={estado.alineacion === "center"}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="size-4" />
          </Boton>
          <Boton
            etiqueta="Alinear párrafo a la derecha"
            descripcion="Se aplica al párrafo entero."
            atajo={["Mod", "Shift", "R"]}
            activo={estado.alineacion === "right"}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="size-4" />
          </Boton>
          <Boton
            etiqueta="Justificar párrafo"
            descripcion="Estira las líneas para que lleguen a los dos bordes."
            atajo={["Mod", "Shift", "J"]}
            activo={estado.alineacion === "justify"}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="size-4" />
          </Boton>
        </Grupo>

        <Grupo>
          <Boton
            etiqueta="Lista con viñetas"
            descripcion="También escribiendo - y un espacio al empezar la línea."
            atajo={["Mod", "Shift", "8"]}
            activo={estado.vinetas}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-4" />
          </Boton>
          <Boton
            etiqueta="Lista numerada"
            descripcion="También escribiendo 1. y un espacio al empezar la línea."
            atajo={["Mod", "Shift", "7"]}
            activo={estado.numerada}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-4" />
          </Boton>
          <Boton
            etiqueta="Cita"
            descripcion="Una voz que no es la tuya. También escribiendo > y un espacio."
            atajo={["Mod", "Shift", "B"]}
            activo={estado.bloque === "cita"}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="size-4" />
          </Boton>
          <Boton
            etiqueta="Separador ✦"
            descripcion="Un respiro entre escenas. También escribiendo *** y un espacio."
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <span className="text-sm">✦</span>
          </Boton>
        </Grupo>

        <Grupo>
          <Boton
            etiqueta="Enlace"
            descripcion="Convierte lo seleccionado en un enlace. Dejalo vacío para quitarlo."
            activo={estado.enlace}
            onClick={editarEnlace}
          >
            <Link2 className="size-4" />
          </Boton>
          <Boton
            etiqueta="Imagen"
            descripcion="Inserta una imagen desde una dirección web."
            onClick={insertarImagen}
          >
            <ImageIcon className="size-4" />
          </Boton>
          <div className="relative" ref={masRef}>
            <Boton
              etiqueta="Más herramientas"
              descripcion="Cursor (forma, color, titileo), verso y limpiar formato."
              activo={masAbierto}
              aria-expanded={masAbierto}
              onClick={() => setMasAbierto((v) => !v)}
            >
              <Ellipsis className="size-4" />
            </Boton>
            {masAbierto && (
              <div className="absolute top-11 right-0 z-30 flex w-[300px] flex-col gap-3 rounded-2xl border border-border-strong bg-popover p-4 shadow-flotante sm:right-auto sm:left-0">
                <span className={claseEtiquetaPopover}>Cursor · forma</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {formas.map((forma) => (
                    <button
                      key={forma.valor}
                      type="button"
                      title={forma.etiqueta}
                      aria-label={forma.etiqueta}
                      aria-pressed={cursor.forma === forma.valor}
                      onClick={() =>
                        onCambiarCursor({ ...cursor, forma: forma.valor })
                      }
                      className={cn(
                        "flex h-11 items-center justify-center rounded-lg border border-border bg-background text-foreground-soft",
                        cursor.forma === forma.valor &&
                          "border-lime-text bg-lime-soft text-lime-text"
                      )}
                    >
                      {forma.muestra}
                    </button>
                  ))}
                </div>
                <span className={claseEtiquetaPopover}>Cursor · color</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {coloresCursor.map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      aria-pressed={cursor.color === color.valor}
                      onClick={() =>
                        onCambiarCursor({ ...cursor, color: color.valor })
                      }
                      className={cn(
                        "flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background text-[0.8rem] text-foreground-soft",
                        cursor.color === color.valor &&
                          "border-lime-text bg-lime-soft text-lime-text"
                      )}
                    >
                      <span
                        className="size-3.5 rounded-full"
                        style={{ background: color.muestra }}
                      />
                      {color.etiqueta}
                    </button>
                  ))}
                </div>
                <label className="flex min-h-11 items-center justify-between gap-3 text-[0.82rem] text-foreground-soft">
                  Titilar
                  <input
                    type="checkbox"
                    checked={cursor.titila}
                    onChange={(event) =>
                      onCambiarCursor({
                        ...cursor,
                        titila: event.target.checked,
                      })
                    }
                    className="size-5 accent-lime-text"
                  />
                </label>
                <div className="flex flex-col border-t border-border pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetAllMarks().clearNodes().run()
                      setMasAbierto(false)
                    }}
                    className="flex min-h-10 items-center gap-2 text-left text-[0.82rem] text-foreground-soft hover:text-lime-text"
                  >
                    <RemoveFormatting className="size-4" />
                    Limpiar formato
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().toggleVerso().run()
                      setMasAbierto(false)
                    }}
                    className="flex min-h-10 items-center gap-2 text-left text-[0.82rem] text-foreground-soft hover:text-lime-text"
                  >
                    <span className="w-4 text-center font-serif italic">V</span>
                    Verso ({textoDeAtajo(["Mod", "Alt", "V"], esMac)})
                  </button>
                </div>
              </div>
            )}
          </div>
        </Grupo>

        <Ayuda
          titulo={lienzoAmplio ? "Reducir lienzo" : "Agrandar lienzo"}
          descripcion={
            lienzoAmplio
              ? "Vuelve a mostrar el mapa del texto y los paneles."
              : "Oculta los márgenes y deja solo la hoja."
          }
        >
          <button
            type="button"
            onClick={onAlternarLienzo}
            aria-pressed={lienzoAmplio}
            className={cn(
              "ml-auto inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 font-mono text-[0.62rem] tracking-[0.14em] uppercase transition-colors",
              lienzoAmplio
                ? "border-border-strong text-foreground hover:border-lime-text/50"
                : "border-lime-text/45 bg-lime-soft/60 text-lime-text hover:bg-lime-soft"
            )}
          >
            {lienzoAmplio ? (
              <Minimize2 className="size-4" />
            ) : (
              <Maximize2 className="size-4" />
            )}
            {lienzoAmplio ? "Reducir lienzo" : "Agrandar lienzo"}
          </button>
        </Ayuda>
      </div>
    </TooltipProvider>
  )
}
