import { mergeAttributes, Node } from "@tiptap/core"
import { TextSelection } from "@tiptap/pm/state"

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    verso: {
      /** Convierte el bloque actual en verso (o lo vuelve parrafo). */
      toggleVerso: () => ReturnType
    }
  }
}

/**
 * Bloque para poesia: respeta saltos de linea y espacios tal cual se escriben.
 * Enter agrega un verso nuevo dentro del mismo bloque; Enter dos veces al final sale.
 */
export const Verso = Node.create({
  name: "verso",
  group: "block",
  content: "inline*",
  marks: "_",
  defining: true,
  whitespace: "pre",

  parseHTML() {
    return [{ tag: "div[data-verso]", preserveWhitespace: "full" }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-verso": "", class: "verso" }),
      0,
    ]
  },

  addCommands() {
    return {
      toggleVerso:
        () =>
        ({ commands }) =>
          commands.toggleNode(this.name, "paragraph"),
    }
  },

  addKeyboardShortcuts() {
    return {
      // ⌥⌘V / Ctrl+Alt+V (⇧⌘V en Mac es "pegar sin formato", no lo pisamos).
      "Mod-Alt-v": () => this.editor.commands.toggleVerso(),
      Enter: ({ editor }) => {
        const { state } = editor
        const { $from, empty } = state.selection
        if (!empty || $from.parent.type.name !== this.name) {
          return false
        }
        const texto = $from.parent.textContent
        const alFinal = $from.parentOffset === $from.parent.content.size
        // Doble Enter al final (linea vacia): salir del verso a un parrafo nuevo.
        if (alFinal && texto.endsWith("\n")) {
          return editor.commands.command(({ tr, dispatch }) => {
            if (dispatch) {
              tr.delete($from.pos - 1, $from.pos)
              const despues = tr.mapping.map($from.after())
              tr.insert(despues, state.schema.nodes.paragraph.create())
              tr.setSelection(TextSelection.create(tr.doc, despues + 1))
              tr.scrollIntoView()
            }
            return true
          })
        }
        return editor.commands.insertContent("\n")
      },
    }
  },
})
