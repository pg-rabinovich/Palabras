import sanitizeHtml from "sanitize-html"

// Allowlist acotado a lo que puede producir el editor Tiptap de participacion
// (StarterKit + Highlight + TextStyle (color, fuente, tamano) + TextAlign +
// Verso). Se sanea al GUARDAR, no solo al mostrar, porque el endpoint acepta
// subidas anonimas: el texto_html llega directo del cliente y podria no venir
// del editor real (POST manual).
//
// Los estilos inline solo pasan con valores conocidos (regex estrictas), asi
// nadie puede colar CSS arbitrario.

const alineacion = [/^(left|center|right|justify)$/]
const colorSeguro = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*[\d.\s,%]+\)$/i]
const tamanoSeguro = [/^(1[4-9]|[2-4]\d)px$/]
const fuenteSegura = [/^var\(--font-(serif|sans|mono)\)$/]

export function sanitizarHtmlParticipacion(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "code",
      "pre",
      "hr",
      "mark",
      "span",
      "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
      p: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      span: ["style"],
      div: ["data-verso", "class", "style"],
    },
    allowedClasses: {
      div: ["verso"],
    },
    allowedStyles: {
      p: { "text-align": alineacion },
      h1: { "text-align": alineacion },
      h2: { "text-align": alineacion },
      h3: { "text-align": alineacion },
      div: { "text-align": alineacion },
      span: {
        color: colorSeguro,
        "font-size": tamanoSeguro,
        "font-family": fuenteSegura,
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      }),
    },
  })
}
