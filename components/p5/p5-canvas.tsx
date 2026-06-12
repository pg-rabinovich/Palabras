"use client"

import * as React from "react"
import type P5 from "p5"

import { cn } from "@/lib/utils"
import type { P5Sketch } from "@/sketches/p5/types"

type P5Constructor = new (
  sketch: (p: P5) => void,
  node?: HTMLElement
) => P5

type P5CanvasProps = {
  sketch: P5Sketch
  className?: string
  ariaLabel?: string
  respetarMovimientoReducido?: boolean
}

function useMovimientoReducido() {
  const [movimientoReducido, setMovimientoReducido] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const actualizar = () => setMovimientoReducido(mediaQuery.matches)

    actualizar()
    mediaQuery.addEventListener("change", actualizar)

    return () => {
      mediaQuery.removeEventListener("change", actualizar)
    }
  }, [])

  return movimientoReducido
}

export function P5Canvas({
  sketch,
  className,
  ariaLabel,
  respetarMovimientoReducido = true,
}: P5CanvasProps) {
  const contenedorRef = React.useRef<HTMLDivElement | null>(null)
  const movimientoReducido = useMovimientoReducido()

  React.useEffect(() => {
    const contenedor = contenedorRef.current

    if (!contenedor) {
      return
    }

    const contenedorSeguro = contenedor

    if (respetarMovimientoReducido && movimientoReducido) {
      contenedorSeguro.replaceChildren()
      return
    }

    let instancia: P5 | null = null
    let observador: ResizeObserver | null = null
    let cancelado = false

    async function montarSketch() {
      const moduloP5 = await import("p5")

      if (cancelado) {
        return
      }

      const ConstructorP5 = moduloP5.default as unknown as P5Constructor

      instancia = new ConstructorP5((p) => {
        sketch(p, {
          contenedor: contenedorSeguro,
          movimientoReducido,
          obtenerTamano: () => ({
            ancho: Math.max(1, contenedorSeguro.clientWidth),
            alto: Math.max(1, contenedorSeguro.clientHeight),
          }),
        })
      }, contenedorSeguro)

      observador = new ResizeObserver(() => {
        const instanciaConResize = instancia as
          | (P5 & { windowResized?: () => void })
          | null

        instanciaConResize?.windowResized?.()
      })
      observador.observe(contenedorSeguro)
      window.requestAnimationFrame(() => {
        const instanciaConResize = instancia as
          | (P5 & { windowResized?: () => void })
          | null

        instanciaConResize?.windowResized?.()
      })
    }

    montarSketch()

    return () => {
      cancelado = true
      observador?.disconnect()
      instancia?.remove()
      instancia = null
      contenedorSeguro.replaceChildren()
    }
  }, [movimientoReducido, respetarMovimientoReducido, sketch])

  return (
    <div
      ref={contenedorRef}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("overflow-hidden", className)}
    />
  )
}
