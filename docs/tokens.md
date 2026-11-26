# Tokens de color

Palabras tiene dos temas: **oscuro** (el que se ve por defecto) y **claro** (opcional, se elige
desde el menú de sesión o el botón sol/luna). Para que los dos funcionen siempre, hay una sola
regla:

> **En los componentes nunca se escribe un color.** Ni `#d9ff1f`, ni `rgb(...)`, ni
> `bg-[rgb(...)]`, ni `bg-black`. Se usa el **nombre** de un token: `text-lime-text`,
> `bg-card`, `border-border`…

Todos los colores viven en `app/globals.css`, en tres bloques:

- `:root`: la paleta de marca (`--neo-*`) y los valores del tema oscuro (base).
- `.dark`: los mismos valores oscuros, explícitos.
- `.light`: los valores del tema claro.

Cada token tiene además su clase de Tailwind (`bg-*`, `text-*`, `border-*`, `ring-*`…), definida
en el bloque `@theme inline` del mismo archivo. El tema lo maneja `next-themes`
(`components/theme-provider.tsx`, `defaultTheme="dark"`).

Para chequear que nadie escribió un color suelto:

```bash
npm run check:colores
```

---

## Paleta de marca (fija en los dos temas)

| Token | Color | Para qué |
|---|---|---|
| `neo-black` | `#050505` | Negro de marca |
| `neo-paper` | `#f2eee6` | Crudo / papel |
| `neo-lime` | `#d9ff1f` | Lima |
| `neo-violet` | `#6d28ff` | Violeta |

Se usan directo (`text-neo-lime`, `bg-neo-black`) **solo** en superficies que son oscuras en los
dos temas, como la tarjeta de atmósfera (`.mood-card`). En el resto de la app, usá los tokens
semánticos de abajo.

---

## Tokens semánticos (cambian con el tema)

### Superficies

| Token | Oscuro | Claro | Cuándo usarlo |
|---|---|---|---|
| `background` | `#050505` | `#f2eee6` | Fondo de la página |
| `card` | `#0b0b0f` | `#faf7f1` | Cards, la hoja del editor, paneles |
| `popover` | `#0b0b0f` | `#fdfbf7` | Menús y elementos flotantes |
| `surface-raised` | `#101015` | `#ebe5da` | Barras y cabeceras dentro de una card (la barra del editor) |
| `muted` | `#121217` | `#eee6db` | Fondos apagados (pistas de progreso, etc.) |

### Texto

| Token | Oscuro | Claro | Cuándo usarlo |
|---|---|---|---|
| `foreground` | `#f2eee6` | `#050505` | Texto principal y títulos |
| `foreground-soft` | `#d9d4ce` | `#3c3730` | Cuerpo de texto, descripciones |
| `muted-foreground` | `#a7a19a` | `#6b665f` | Etiquetas, ayudas, texto tenue |

### Lima y violeta

Cada color de marca tiene **dos usos distintos**: como relleno y como texto. No son
intercambiables, porque el lima puro sobre crudo no se lee (contraste 1,1:1).

| Token | Oscuro | Claro | Cuándo usarlo |
|---|---|---|---|
| `lime` | `#d9ff1f` | `#d9ff1f` | **Relleno**: botones, puntos, barras de progreso |
| `lime-foreground` | `#050505` | `#050505` | Texto **sobre** un relleno lima |
| `lime-text` | `#d9ff1f` | `#566300` (oliva) | **Texto** lima: etiquetas, links activos, íconos |
| `lime-soft` | lima 13 % | lima 50 % | Fondo de estados activos (botón presionado, opción elegida) |
| `violet` | `#6d28ff` | `#6d28ff` | Relleno violeta |
| `violet-text` | `#a98bff` | `#6d28ff` | Texto violeta (hover de links) |
| `violet-soft` | violeta 22 % | violeta 12 % | Fondo de hover |

### Bordes, foco y estados

| Token | Oscuro | Claro | Cuándo usarlo |
|---|---|---|---|
| `border` | papel 14 % | negro 10 % | Bordes normales |
| `border-strong` | papel 22 % | negro 20 % | Bordes más marcados (bordes punteados, inputs) |
| `ring` | violeta | violeta | Foco de teclado (`focus-visible:ring-ring`) |
| `highlight` | lima 22 % | lima 60 % | Resaltado de texto (`<mark>`) |
| `selection` | violeta 50 % | violeta 20 % | Texto seleccionado |
| `warning` | `#ffb36b` | `#9a4a08` | Avisos (por ejemplo, "sin firma") |
| `destructive` / `destructive-foreground` | rojo / `#fca5a5` | rojo / `#b91c1c` | Errores, rechazar |
| `scrim` | negro 65 % | sepia 35 % | Velo detrás de diálogos y paneles |

### Botones: combinaciones listas

| Botón | Clases |
|---|---|
| Principal (negro en claro, crudo en oscuro) | `bg-primary text-primary-foreground` |
| Lima | `bg-lime text-lime-foreground` |
| Principal que se vuelve lima al pasar | `bg-primary text-primary-foreground hover:bg-lime hover:text-lime-foreground` |
| Borde | `border border-border-strong text-foreground hover:border-lime-text/60` |

Regla: si cambiás el fondo en `hover:`, cambiá también el texto en `hover:`. Si no, en un tema
queda negro sobre negro.

### Sombras

| Clase | Cuándo usarla |
|---|---|
| `shadow-flotante` | Menús, el menú `/` del editor, popovers |
| `shadow-profunda` | Imágenes grandes, paneles destacados |

---

## Sobre fotos: siempre oscuro

Las fotos y las cards de obras tienen un **marco oscuro en los dos temas** (convención de
galería). Todo lo que va encima de una foto usa estos tokens fijos, **nunca** `foreground` ni
`lime-text`:

| Token | Color | Cuándo usarlo |
|---|---|---|
| `marco` | `#050505` | Fondo detrás de una foto |
| `sobre-foto` | `#f2eee6` | Títulos sobre foto |
| `sobre-foto-suave` | `#d9d4ce` | Texto secundario sobre foto |
| `sobre-foto-acento` | `#d9ff1f` | Etiquetas lima sobre foto |
| `sobre-foto-violeta` | `#8b5cff` | Hover violeta sobre foto |

Para que el texto se lea aunque la foto sea clara en esa zona, existen las clases
`velo-inferior`, `velo-lateral`, `card-veil-rest` y `card-veil-hover` (en `globals.css`).

---

## Dentro del texto del editor

- **Colores de letra**: el editor guarda `var(--tinta-<color>)`, no un color. Hay ocho:
  `lima`, `violeta`, `rosa`, `coral`, `ambar`, `menta`, `cielo` y `piedra`, cada uno con un
  valor para oscuro y otro para claro (todos con contraste de 5,3:1 o más sobre la hoja). Así un texto pintado de lima se ve lima en oscuro y oliva
  en claro, también en la obra publicada. El sanitizador (`lib/sanitizar-html.ts`) solo acepta
  esos valores.
- **Imágenes**: guardan su tamaño (`data-ancho`: 25, 50, 75 o 100) y su posición
  (`data-alineacion`: izquierda, centro o derecha); el CSS de `globals.css` los aplica en el
  editor y en la obra publicada.
- **Cursor**: `cursor-lima` (lima en oscuro, oliva con brillo lima en claro) y `cursor-clasico`
  (blanco en oscuro, tinta negra en claro).

---

## Cómo agregar un token nuevo

1. En `app/globals.css`, agregá la variable en `:root` y en `.dark` (valor oscuro) y en
   `.light` (valor claro). Si es igual en los dos temas, alcanza con `:root`.
2. En el bloque `@theme inline`, agregá `--color-<nombre>: var(--<nombre>);` para tener las
   clases `bg-<nombre>`, `text-<nombre>`, etc. (para sombras: `--shadow-<nombre>`).
3. Revisá el contraste en claro: el texto necesita al menos **4,5:1** contra su fondo.
4. Corré `npm run check:colores`.

## Componentes de shadcn

Usamos siempre componentes de shadcn (`components/ui`). Al agregar uno con la CLI:

- Si cambia `import { cn } from "cn"`, corregilo a `@/lib/utils` y desinstalá el paquete `cn`
  que la CLI agrega por error.
- Si trae colores fijos (por ejemplo, `bg-black/80` en el velo del `Dialog`), cambialos por un
  token (`bg-scrim`).
- Si pregunta si pisar `button.tsx`, respondé que no: está personalizado.
