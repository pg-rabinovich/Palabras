"use client"

import * as React from "react"
import type { SuggestionProps } from "@tiptap/suggestion"

import { textoDeAtajo, useEsMac } from "@/lib/editor/atajos"
import type { ComandoSlash, PuenteMenuSlash } from "@/lib/editor/comandos-slash"
import { cn } from "@/lib/utils"

type EstadoMenu = {
  abierto: boolean
  items: ComandoSlash[]
  posicion: { top: number; left: number } | null
  elegir: ((item: ComandoSlash) => void) | null
}

const cerrado: EstadoMenu = {
  abierto: false,
  items: [],
  posicion: null,
  elegir: null,
}

const iconos: Record<string, React.ReactNode> = {
  seccion: <span className="font-serif text-xl">H</span>,
  subseccion: <span className="font-serif text-base">h</span>,
  cita: <span className="font-serif text-2xl leading-none">“</span>,
  verso: <span className="font-serif text-lg italic">V</span>,
  lista: <span className="text-lg">•</span>,
  "lista-numerada": <span className="font-mono text-xs">1.</span>,
  separador: <span className="text-lime-text">✦</span>,
  imagen: <span className="text-sm">▢</span>,
}

function posicionDesde(props: SuggestionProps<ComandoSlash>) {
  const rect = props.clientRect?.()
  if (!rect) {
    return null
  }
  // Alto aproximado: cabecera + pie + una fila por opcion.
  const alto = 84 + Math.max(1, props.items.length) * 46
  const abajo = rect.bottom + 8
  const top =
    abajo + alto > window.innerHeight ? Math.max(8, rect.top - alto - 8) : abajo
  const left = Math.min(rect.left, window.innerWidth - 348)
  return { top, left: Math.max(8, left) }
}

/**
 * Devuelve el puente que se le pasa a la extension ComandosSlash y el menu
 * flotante ya dibujado. El puente es estable (no cambia entre renders).
 */
export function useMenuComandos() {
  const esMac = useEsMac()
  const [estado, setEstado] = React.useState<EstadoMenu>(cerrado)
  const [indice, setIndice] = React.useState(0)
  const estadoRef = React.useRef(estado)
  const indiceRef = React.useRef(indice)

  React.useEffect(() => {
    estadoRef.current = estado
    indiceRef.current = indice
  }, [estado, indice])

  const puente = React.useMemo<PuenteMenuSlash>(() => {
    const actualizar = (props: SuggestionProps<ComandoSlash>) => {
      const siguiente: EstadoMenu = {
        abierto: true,
        items: props.items,
        posicion: posicionDesde(props),
        elegir: (item) => props.command(item),
      }
      estadoRef.current = siguiente
      indiceRef.current = 0
      setEstado(siguiente)
      setIndice(0)
    }

    return {
      alAbrir: actualizar,
      alActualizar: actualizar,
      alCerrar: () => {
        estadoRef.current = cerrado
        setEstado(cerrado)
      },
      alTecla: ({ event }) => {
        const { items, elegir, abierto } = estadoRef.current
        if (!abierto) {
          return false
        }
        if (event.key === "Escape") {
          estadoRef.current = cerrado
          setEstado(cerrado)
          return true
        }
        if (items.length === 0) {
          return false
        }
        if (event.key === "ArrowDown") {
          const nuevo = (indiceRef.current + 1) % items.length
          indiceRef.current = nuevo
          setIndice(nuevo)
          return true
        }
        if (event.key === "ArrowUp") {
          const nuevo = (indiceRef.current - 1 + items.length) % items.length
          indiceRef.current = nuevo
          setIndice(nuevo)
          return true
        }
        if (event.key === "Enter") {
          const item = items[indiceRef.current]
          if (item && elegir) {
            elegir(item)
          }
          return true
        }
        return false
      },
    }
  }, [])

  const menu =
    estado.abierto && estado.posicion ? (
      <div
        role="listbox"
        aria-label="Formatos"
        style={{ top: estado.posicion.top, left: estado.posicion.left }}
        className="fixed z-50 flex w-[340px] flex-col gap-0.5 rounded-2xl border border-border-strong bg-popover p-1.5 shadow-flotante"
      >
        <span className="px-2.5 pt-2 pb-1 font-mono text-[0.62rem] tracking-[0.24em] text-muted-foreground uppercase">
          Formatos
        </span>
        {estado.items.length === 0 ? (
          <span className="px-2.5 py-3 text-sm text-muted-foreground">
            Nada coincide. Seguí escribiendo o tocá Esc.
          </span>
        ) : (
          estado.items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={i === indice}
              onMouseEnter={() => setIndice(i)}
              onMouseDown={(event) => {
                event.preventDefault()
                estado.elegir?.(item)
              }}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-1.5 text-left text-foreground",
                i === indice && "bg-lime-soft"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-strong text-foreground-soft",
                  i === indice && "border-lime-text/50 text-lime-text"
                )}
              >
                {iconos[item.id]}
              </span>
              <span className="flex flex-1 flex-col">
                <span className="text-sm font-medium">{item.titulo}</span>
                <span className="text-xs text-muted-foreground">
                  {item.descripcion}
                </span>
              </span>
              {item.atajo && (
                <span className="font-mono text-[0.68rem] text-muted-foreground">
                  {typeof item.atajo === "string"
                    ? item.atajo
                    : textoDeAtajo(item.atajo, esMac)}
                </span>
              )}
            </button>
          ))
        )}
        <div className="mt-1 flex justify-between border-t border-border px-2.5 pt-2 pb-1 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground">
          <span>↑↓ elegir · Enter insertar</span>
          <span>Esc cerrar</span>
        </div>
      </div>
    ) : null

  return { puente, menu }
}
