"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { NodeSelection } from "@tiptap/pm/state"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ExternalLink,
  PenLine,
  Trash2,
  Unlink,
} from "lucide-react"

import {
  alineacionesImagen,
  anchosImagen,
  type AlineacionImagen,
  type AnchoImagen,
} from "@/lib/editor/imagen-palabras"
import { cn } from "@/lib/utils"

const claseMenu =
  "flex items-center gap-0.5 rounded-xl border border-border-strong bg-popover p-1 text-popover-foreground shadow-flotante"

function BotonMenu({
  activo,
  etiqueta,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { activo?: boolean; etiqueta: string }) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      aria-pressed={activo}
      // mousedown: que el boton no le saque el foco (ni la seleccion) al editor.
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-lg px-2 text-[0.78rem] text-foreground-soft transition-colors hover:bg-violet-soft hover:text-lime-text",
        activo && "bg-lime-soft text-lime-text",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function Separador() {
  return (
    <span className="mx-0.5 h-5 w-px bg-border-strong" aria-hidden="true" />
  )
}

function imagenSeleccionada(editor: Editor) {
  const { selection } = editor.state
  return (
    selection instanceof NodeSelection && selection.node.type.name === "image"
  )
}

/** Menu sobre un enlace: abrirlo (para probarlo), editarlo o quitarlo. */
export function MenuEnlace({
  editor,
  onEditar,
}: {
  editor: Editor
  onEditar: () => void
}) {
  const href = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e.isActive("link")
        ? ((e.getAttributes("link").href as string) ?? "")
        : "",
  })

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="menuEnlace"
      shouldShow={({ editor: e }) =>
        e.isActive("link") && !imagenSeleccionada(e)
      }
      options={{ placement: "bottom-start", offset: 8 }}
      className={claseMenu}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir en una pestaña nueva"
        className="inline-flex h-9 max-w-56 items-center gap-2 rounded-lg px-2 text-[0.78rem] text-lime-text hover:bg-violet-soft"
      >
        <ExternalLink className="size-3.5 shrink-0" />
        <span className="truncate">{href.replace(/^https?:\/\//, "")}</span>
      </a>
      <Separador />
      <BotonMenu etiqueta="Editar enlace" onClick={onEditar}>
        <PenLine className="size-4" />
      </BotonMenu>
      <BotonMenu
        etiqueta="Quitar enlace"
        onClick={() =>
          editor.chain().focus().extendMarkRange("link").unsetLink().run()
        }
      >
        <Unlink className="size-4" />
      </BotonMenu>
    </BubbleMenu>
  )
}

const etiquetasAlineacion: Record<AlineacionImagen, string> = {
  izquierda: "Imagen a la izquierda",
  centro: "Imagen al centro",
  derecha: "Imagen a la derecha",
}

const iconosAlineacion: Record<AlineacionImagen, React.ReactNode> = {
  izquierda: <AlignLeft className="size-4" />,
  centro: <AlignCenter className="size-4" />,
  derecha: <AlignRight className="size-4" />,
}

/** Menu sobre una imagen seleccionada: tamano, posicion, descripcion, quitar. */
export function MenuImagen({
  editor,
  onEditar,
}: {
  editor: Editor
  onEditar: () => void
}) {
  const attrs = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const a = e.getAttributes("image") as {
        ancho?: AnchoImagen
        alineacion?: AlineacionImagen
      }
      return { ancho: a.ancho ?? "100", alineacion: a.alineacion ?? "centro" }
    },
  })

  function cambiar(
    valores: Partial<{ ancho: AnchoImagen; alineacion: AlineacionImagen }>
  ) {
    editor.chain().focus().updateAttributes("image", valores).run()
  }

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="menuImagen"
      shouldShow={({ editor: e }) => imagenSeleccionada(e)}
      options={{ placement: "top", offset: 10 }}
      className={claseMenu}
    >
      <span className="px-2 font-mono text-[0.58rem] tracking-[0.18em] text-muted-foreground uppercase">
        Tamaño
      </span>
      {anchosImagen.map((ancho) => (
        <BotonMenu
          key={ancho}
          etiqueta={`Ancho ${ancho}%`}
          activo={attrs.ancho === ancho}
          onClick={() => cambiar({ ancho })}
          className="font-mono text-[0.7rem]"
        >
          {ancho}%
        </BotonMenu>
      ))}
      <Separador />
      {alineacionesImagen.map((alineacion) => (
        <BotonMenu
          key={alineacion}
          etiqueta={etiquetasAlineacion[alineacion]}
          activo={attrs.alineacion === alineacion}
          disabled={attrs.ancho === "100"}
          onClick={() => cambiar({ alineacion })}
          className="disabled:opacity-35"
        >
          {iconosAlineacion[alineacion]}
        </BotonMenu>
      ))}
      <Separador />
      <BotonMenu etiqueta="Cambiar imagen o descripción" onClick={onEditar}>
        <PenLine className="size-4" />
      </BotonMenu>
      <BotonMenu
        etiqueta="Quitar imagen"
        onClick={() => editor.chain().focus().deleteSelection().run()}
        className="hover:text-destructive-foreground"
      >
        <Trash2 className="size-4" />
      </BotonMenu>
    </BubbleMenu>
  )
}
