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
  { nombre: "Papel", valor: null, muestra: "#f2eee6" },
  { nombre: "Lima", valor: "#d9ff1f", muestra: "#d9ff1f" },
  { nombre: "Violeta", valor: "#a98bff", muestra: "#a98bff" },
  { nombre: "Piedra", valor: "#a7a19a", muestra: "#a7a19a" },
] as const

type Bloque = "parrafo" | "seccion" | "subseccion" | "verso" | "cita"

function Boton({
  activo,
  etiqueta,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { activo?: boolean; etiqueta: string }) {
  return (
    <button
      type="button"
      title={etiqueta}
      aria-label={etiqueta}
      aria-pressed={activo}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[9px] text-[rgb(232_224_212)] transition-colors hover:bg-[rgb(109_40_255_/_0.22)] hover:text-[rgb(217_255_31)] disabled:opacity-40",
        activo && "bg-[rgb(217_255_31_/_0.14)] text-[rgb(217_255_31)]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function Grupo({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-xl border border-[rgb(242_238_230_/_0.1)] bg-[rgb(5_5_5)] p-[3px]">
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
  "h-9 appearance-none rounded-[9px] bg-transparent pr-7 pl-2.5 text-[0.8rem] text-[rgb(232_224_212)] outline-none hover:bg-[rgb(109_40_255_/_0.22)] focus-visible:ring-1 focus-visible:ring-[rgb(217_255_31)] [&>option]:bg-[rgb(11_11_15)]"

const claseEtiquetaPopover =
  "font-mono text-[0.6rem] tracking-[0.24em] text-[rgb(167_161_154)] uppercase"

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

  const formas: { valor: FormaCursor; etiqueta: string; muestra: React.ReactNode }[] =
    [
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

  const coloresCursor: { valor: ColorCursor; etiqueta: string; muestra: string }[] =
    [
      { valor: "lima", etiqueta: "Lima", muestra: "#d9ff1f" },
      { valor: "blanco", etiqueta: "Blanco clásico", muestra: "#f2eee6" },
    ]

  return (
    <div
      role="toolbar"
      aria-label="Herramientas de texto"
      className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-t-[22px] border-b border-[rgb(242_238_230_/_0.1)] bg-[rgb(16_16_21)] px-3.5 py-2.5"
    >
      <Grupo>
        <Boton
          etiqueta="Deshacer (Ctrl+Z)"
          disabled={!estado.puedeDeshacer}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </Boton>
        <Boton
          etiqueta="Rehacer (Ctrl+Shift+Z)"
          disabled={!estado.puedeRehacer}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </Boton>
      </Grupo>

      <Grupo>
        <label className="relative inline-flex items-center">
          <span className="sr-only">Tipo de bloque</span>
          <select
            value={estado.bloque}
            onChange={(event) => cambiarBloque(event.target.value as Bloque)}
            className={claseSelect}
          >
            <option value="parrafo">Párrafo</option>
            <option value="seccion">Título de sección</option>
            <option value="subseccion">Subtítulo</option>
            <option value="verso">Verso</option>
            <option value="cita">Cita</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 size-3 text-[rgb(167_161_154)]" />
        </label>
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
          <ChevronDown className="pointer-events-none absolute right-2 size-3 text-[rgb(167_161_154)]" />
        </label>
        <Boton
          etiqueta="Achicar letra"
          className="w-7"
          disabled={estado.tamano <= TAMANO_MIN}
          onClick={() => cambiarTamano(-1)}
        >
          <Minus className="size-3.5" />
        </Boton>
        <span
          className="min-w-6 text-center text-[0.8rem] text-[rgb(242_238_230)] tabular-nums"
          aria-label={`Tamaño ${estado.tamano}`}
        >
          {estado.tamano}
        </span>
        <Boton
          etiqueta="Agrandar letra"
          className="w-7"
          disabled={estado.tamano >= TAMANO_MAX}
          onClick={() => cambiarTamano(1)}
        >
          <Plus className="size-3.5" />
        </Boton>
      </Grupo>

      <Grupo>
        <Boton
          etiqueta="Negrita (Ctrl+B)"
          activo={estado.negrita}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Boton>
        <Boton
          etiqueta="Itálica (Ctrl+I)"
          activo={estado.italica}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Boton>
        <Boton
          etiqueta="Subrayado (Ctrl+U)"
          activo={estado.subrayado}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-4" />
        </Boton>
        <Boton
          etiqueta="Tachado"
          activo={estado.tachado}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </Boton>
        <div className="relative" ref={colorRef}>
          <Boton
            etiqueta="Color y resaltado"
            activo={colorAbierto}
            aria-expanded={colorAbierto}
            onClick={() => setColorAbierto((v) => !v)}
            className="flex-col gap-0.5"
          >
            <span className="text-sm leading-none">A</span>
            <span
              className="h-[3px] w-4"
              style={{ background: estado.color ?? "#d9ff1f" }}
            />
          </Boton>
          {colorAbierto && (
            <div className="absolute top-11 left-0 z-30 flex w-56 flex-col gap-3 rounded-2xl border border-[rgb(242_238_230_/_0.16)] bg-[rgb(18_18_23)] p-3.5 shadow-[0_24px_60px_rgb(0_0_0_/_0.75)]">
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
                      "flex h-10 items-center justify-center rounded-lg border border-[rgb(242_238_230_/_0.14)]",
                      (estado.color ?? null) === color.valor &&
                        "border-[rgb(217_255_31)]"
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
                  "flex h-10 items-center gap-2 rounded-lg border border-[rgb(242_238_230_/_0.14)] px-3 text-sm text-[rgb(232_224_212)]",
                  estado.resaltado &&
                    "border-[rgb(217_255_31)] text-[rgb(217_255_31)]"
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
          etiqueta="Alinear a la izquierda"
          activo={estado.alineacion === "left"}
          onClick={() => editor.chain().focus().unsetTextAlign().run()}
        >
          <AlignLeft className="size-4" />
        </Boton>
        <Boton
          etiqueta="Centrar"
          activo={estado.alineacion === "center"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </Boton>
        <Boton
          etiqueta="Alinear a la derecha"
          activo={estado.alineacion === "right"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </Boton>
        <Boton
          etiqueta="Justificar"
          activo={estado.alineacion === "justify"}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="size-4" />
        </Boton>
      </Grupo>

      <Grupo>
        <Boton
          etiqueta="Lista con viñetas"
          activo={estado.vinetas}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Boton>
        <Boton
          etiqueta="Lista numerada"
          activo={estado.numerada}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Boton>
        <Boton
          etiqueta="Cita"
          activo={estado.bloque === "cita"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </Boton>
        <Boton
          etiqueta="Separador"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <span className="text-sm">✦</span>
        </Boton>
      </Grupo>

      <Grupo>
        <Boton etiqueta="Enlace" activo={estado.enlace} onClick={editarEnlace}>
          <Link2 className="size-4" />
        </Boton>
        <Boton etiqueta="Imagen desde URL" onClick={insertarImagen}>
          <ImageIcon className="size-4" />
        </Boton>
        <div className="relative" ref={masRef}>
          <Boton
            etiqueta="Más herramientas"
            activo={masAbierto}
            aria-expanded={masAbierto}
            onClick={() => setMasAbierto((v) => !v)}
          >
            <Ellipsis className="size-4" />
          </Boton>
          {masAbierto && (
            <div className="absolute top-11 right-0 z-30 flex w-[300px] flex-col gap-3 rounded-2xl border border-[rgb(242_238_230_/_0.16)] bg-[rgb(18_18_23)] p-4 shadow-[0_24px_60px_rgb(0_0_0_/_0.75)] sm:right-auto sm:left-0">
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
                      "flex h-11 items-center justify-center rounded-lg border border-[rgb(242_238_230_/_0.14)] bg-[rgb(5_5_5)] text-[rgb(232_224_212)]",
                      cursor.forma === forma.valor &&
                        "border-[rgb(217_255_31)] bg-[rgb(217_255_31_/_0.1)] text-[rgb(217_255_31)]"
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
                      "flex h-11 items-center justify-center gap-2 rounded-lg border border-[rgb(242_238_230_/_0.14)] bg-[rgb(5_5_5)] text-[0.8rem] text-[rgb(232_224_212)]",
                      cursor.color === color.valor &&
                        "border-[rgb(217_255_31)] bg-[rgb(217_255_31_/_0.1)] text-[rgb(217_255_31)]"
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
              <label className="flex min-h-11 items-center justify-between gap-3 text-[0.82rem] text-[rgb(217_212_206)]">
                Titilar
                <input
                  type="checkbox"
                  checked={cursor.titila}
                  onChange={(event) =>
                    onCambiarCursor({ ...cursor, titila: event.target.checked })
                  }
                  className="size-5 accent-[rgb(217_255_31)]"
                />
              </label>
              <div className="flex flex-col border-t border-[rgb(242_238_230_/_0.1)] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetAllMarks().clearNodes().run()
                    setMasAbierto(false)
                  }}
                  className="flex min-h-10 items-center gap-2 text-left text-[0.82rem] text-[rgb(232_224_212)] hover:text-[rgb(217_255_31)]"
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
                  className="flex min-h-10 items-center gap-2 text-left text-[0.82rem] text-[rgb(232_224_212)] hover:text-[rgb(217_255_31)]"
                >
                  <span className="w-4 text-center font-serif italic">V</span>
                  Verso (Ctrl+Shift+V)
                </button>
              </div>
            </div>
          )}
        </div>
      </Grupo>

      <button
        type="button"
        onClick={onAlternarLienzo}
        aria-pressed={lienzoAmplio}
        className={cn(
          "ml-auto inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 font-mono text-[0.62rem] tracking-[0.14em] uppercase transition-colors",
          lienzoAmplio
            ? "border-[rgb(242_238_230_/_0.2)] text-[rgb(242_238_230)] hover:border-[rgb(217_255_31_/_0.5)]"
            : "border-[rgb(217_255_31_/_0.45)] bg-[rgb(217_255_31_/_0.08)] text-[rgb(217_255_31)] hover:bg-[rgb(217_255_31_/_0.16)]"
        )}
      >
        {lienzoAmplio ? (
          <Minimize2 className="size-4" />
        ) : (
          <Maximize2 className="size-4" />
        )}
        {lienzoAmplio ? "Reducir lienzo" : "Agrandar lienzo"}
      </button>
    </div>
  )
}
