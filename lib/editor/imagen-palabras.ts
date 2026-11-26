import ImageExtension from "@tiptap/extension-image"

export const anchosImagen = ["25", "50", "75", "100"] as const
export const alineacionesImagen = ["izquierda", "centro", "derecha"] as const

export type AnchoImagen = (typeof anchosImagen)[number]
export type AlineacionImagen = (typeof alineacionesImagen)[number]

/**
 * Imagen con tamano (porcentaje del ancho de la hoja) y posicion. Se guardan
 * como data-ancho / data-alineacion y el CSS (globals.css) los traduce a
 * ancho y margenes, asi la obra publicada se ve igual que en el editor.
 */
export const ImagenPalabras = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ancho: {
        default: "100",
        parseHTML: (el) => {
          const valor = el.getAttribute("data-ancho")
          return anchosImagen.includes(valor as AnchoImagen) ? valor : "100"
        },
        renderHTML: (attrs) => ({ "data-ancho": attrs.ancho }),
      },
      alineacion: {
        default: "centro",
        parseHTML: (el) => {
          const valor = el.getAttribute("data-alineacion")
          return alineacionesImagen.includes(valor as AlineacionImagen)
            ? valor
            : "centro"
        },
        renderHTML: (attrs) => ({ "data-alineacion": attrs.alineacion }),
      },
    }
  },
}).configure({ allowBase64: false })
