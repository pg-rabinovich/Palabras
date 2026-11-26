import { Extension, type Editor, type Range } from "@tiptap/core"
import { PluginKey } from "@tiptap/pm/state"
import type { Atajo } from "@/lib/editor/atajos"
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion"

export type ComandoSlash = {
  id: string
  titulo: string
  descripcion: string
  /** Texto que se escribe ("##") o combinacion de teclas (["Mod", "Alt", "V"]). */
  atajo?: string | Atajo
  palabrasClave: string[]
  ejecutar: (editor: Editor, rango: Range) => void
}

export const comandosSlash: ComandoSlash[] = [
  {
    id: "seccion",
    titulo: "Título de sección",
    descripcion: "Aparece en el mapa del texto",
    atajo: "##",
    palabrasClave: ["titulo", "seccion", "h2", "encabezado"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).setHeading({ level: 2 }).run(),
  },
  {
    id: "subseccion",
    titulo: "Subtítulo",
    descripcion: "Un nivel más chico",
    atajo: "###",
    palabrasClave: ["subtitulo", "h3"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).setHeading({ level: 3 }).run(),
  },
  {
    id: "cita",
    titulo: "Cita",
    descripcion: "Una voz que no es la tuya",
    atajo: ">",
    palabrasClave: ["cita", "quote"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).setBlockquote().run(),
  },
  {
    id: "verso",
    titulo: "Verso",
    descripcion: "Poesía: saltos y sangrías exactas",
    atajo: ["Mod", "Alt", "V"],
    palabrasClave: ["verso", "poesia", "poema"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).setNode("verso").run(),
  },
  {
    id: "lista",
    titulo: "Lista",
    descripcion: "Con viñetas",
    atajo: "-",
    palabrasClave: ["lista", "vinetas"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).toggleBulletList().run(),
  },
  {
    id: "lista-numerada",
    titulo: "Lista numerada",
    descripcion: "1, 2, 3…",
    atajo: "1.",
    palabrasClave: ["numerada", "ordenada"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).toggleOrderedList().run(),
  },
  {
    id: "separador",
    titulo: "Separador",
    descripcion: "Un respiro entre escenas",
    atajo: "***",
    palabrasClave: ["separador", "pausa", "linea"],
    ejecutar: (editor, rango) =>
      editor.chain().focus().deleteRange(rango).setHorizontalRule().run(),
  },
  {
    id: "imagen",
    titulo: "Imagen",
    descripcion: "Desde una dirección web",
    palabrasClave: ["imagen", "foto"],
    ejecutar: (editor, rango) => {
      editor.chain().focus().deleteRange(rango).run()
      const url = window.prompt("URL de la imagen")
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },
]

function normalizar(texto: string) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
}

export function filtrarComandos(consulta: string) {
  const q = normalizar(consulta.trim())
  if (!q) {
    return comandosSlash
  }
  return comandosSlash.filter(
    (comando) =>
      normalizar(comando.titulo).includes(q) ||
      comando.palabrasClave.some((clave) => clave.startsWith(q))
  )
}

/** Puente entre la extension y el componente React que dibuja el menu. */
export type PuenteMenuSlash = {
  alAbrir: (props: SuggestionProps<ComandoSlash>) => void
  alActualizar: (props: SuggestionProps<ComandoSlash>) => void
  alTecla: (props: SuggestionKeyDownProps) => boolean
  alCerrar: () => void
}

export const ComandosSlash = Extension.create<{
  puente: PuenteMenuSlash | null
}>({
  name: "comandosSlash",

  addOptions() {
    return { puente: null }
  },

  addProseMirrorPlugins() {
    const puente = this.options.puente
    return [
      Suggestion<ComandoSlash>({
        editor: this.editor,
        pluginKey: new PluginKey("comandos-slash"),
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        items: ({ query }) => filtrarComandos(query),
        command: ({ editor, range, props }) => props.ejecutar(editor, range),
        render: () => ({
          onStart: (props) => puente?.alAbrir(props),
          onUpdate: (props) => puente?.alActualizar(props),
          onKeyDown: (props) => puente?.alTecla(props) ?? false,
          onExit: () => puente?.alCerrar(),
        }),
      }),
    ]
  },
})
