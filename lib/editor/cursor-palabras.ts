import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export type FormaCursor = "barra-inclinada" | "barra" | "bloque"
export type ColorCursor = "lima" | "blanco"

export type PreferenciasCursor = {
  forma: FormaCursor
  color: ColorCursor
  titila: boolean
}

export const preferenciasCursorIniciales: PreferenciasCursor = {
  forma: "barra-inclinada",
  color: "lima",
  titila: true,
}

const claveCursor = new PluginKey("cursor-palabras")

/**
 * Dibuja un cursor propio (un widget de ancho cero en la posicion del cursor).
 * La forma, el color y el titileo se controlan por CSS con atributos data-* en
 * el contenedor del editor, asi cambiar la preferencia no re-crea el editor.
 * Mientras se escribe el widget se recrea, la animacion reinicia y el cursor
 * queda visible, como un cursor nativo.
 */
export const CursorPalabras = Extension.create({
  name: "cursorPalabras",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: claveCursor,
        props: {
          decorations(state) {
            const { selection } = state
            if (!selection.empty) {
              return null
            }
            const pos = selection.head
            const widget = Decoration.widget(
              pos,
              () => {
                const marca = document.createElement("span")
                marca.className = "cursor-palabras"
                marca.setAttribute("aria-hidden", "true")
                return marca
              },
              { key: `cursor-${pos}-${Date.now()}`, side: 1, marks: [] }
            )
            return DecorationSet.create(state.doc, [widget])
          },
        },
      }),
    ]
  },
})
