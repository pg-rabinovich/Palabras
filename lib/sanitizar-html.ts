import sanitizeHtml from "sanitize-html"

// Allowlist acotado a lo que puede producir el editor Tiptap de participacion
// (StarterKit + Underline + Link + Image). Se sanea al GUARDAR, no solo al
// mostrar, porque el endpoint acepta subidas anonimas: el texto_html llega
// directo del cliente y podria no venir del editor real (POST manual).
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
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
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
