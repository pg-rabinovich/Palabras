"use client"

import * as React from "react"

// Paleta neo (coincide con los tokens de globals.css).
const VIOLETA = "109, 40, 255"
const VIOLETA_SOFT = "139, 92, 255"
const LIMA = "217, 255, 31"

type Spark = {
  x: number
  y: number
  tam: number
  color: string
  fase: number
  velocidad: number
  derivaX: number
  derivaY: number
  estrella: boolean
}

type CirculoGlitch = {
  x: number
  y: number
  r: number
  vida: number
  vidaMax: number
  color: string
  saltoCada: number
}

const rnd = (min: number, max: number) => min + Math.random() * (max - min)

export function FondoGlitch({ src = "/images/login-bg.png" }: { src?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    const nodoCanvas = canvasRef.current
    if (!nodoCanvas) return
    const canvas = nodoCanvas
    const contexto = canvas.getContext("2d")
    if (!contexto) return
    // const ya estrechada: TS la mantiene non-null dentro de los closures.
    const ctx = contexto

    let ancho = 0
    let alto = 0
    let sparks: Spark[] = []
    let circulos: CirculoGlitch[] = []
    let cuadro = 0
    let raf = 0
    let imagen: HTMLImageElement | null = null

    function ajustarTamano() {
      const padre = canvas.parentElement
      if (!padre) return
      ancho = padre.clientWidth
      alto = padre.clientHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(ancho * dpr)
      canvas.height = Math.round(alto * dpr)
      canvas.style.width = `${ancho}px`
      canvas.style.height = `${alto}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      generarSparks()
    }

    function generarSparks() {
      const cantidad = Math.min(160, Math.max(28, Math.round((ancho * alto) / 9000)))
      sparks = Array.from({ length: cantidad }, () => {
        const enVioleta = Math.random() > 0.42
        return {
          x: rnd(0, ancho),
          y: rnd(0, alto),
          tam: rnd(2, 7),
          color: enVioleta
            ? Math.random() > 0.5
              ? VIOLETA
              : VIOLETA_SOFT
            : LIMA,
          fase: rnd(0, Math.PI * 2),
          velocidad: rnd(0.01, 0.05),
          derivaX: rnd(-0.12, 0.12),
          derivaY: rnd(-0.18, 0.04),
          estrella: Math.random() > 0.6,
        }
      })
    }

    function dibujarImagen() {
      if (!imagen) {
        ctx.fillStyle = "#050505"
        ctx.fillRect(0, 0, ancho, alto)
        return
      }
      // object-cover manual.
      const escala = Math.max(ancho / imagen.width, alto / imagen.height)
      const w = imagen.width * escala
      const h = imagen.height * escala
      ctx.drawImage(imagen, (ancho - w) / 2, (alto - h) / 2, w, h)
    }

    function dibujarSpark(s: Spark, alfa: number) {
      ctx.strokeStyle = `rgba(${s.color}, ${alfa})`
      ctx.lineWidth = 1.2
      const r = s.tam
      ctx.beginPath()
      ctx.moveTo(s.x - r, s.y)
      ctx.lineTo(s.x + r, s.y)
      ctx.moveTo(s.x, s.y - r)
      ctx.lineTo(s.x, s.y + r)
      if (s.estrella) {
        const d = r * 0.6
        ctx.moveTo(s.x - d, s.y - d)
        ctx.lineTo(s.x + d, s.y + d)
        ctx.moveTo(s.x - d, s.y + d)
        ctx.lineTo(s.x + d, s.y - d)
      }
      ctx.stroke()
    }

    function dibujarFrame(animar: boolean) {
      dibujarImagen()
      // Velo oscuro para integrar las particulas con el fondo.
      ctx.fillStyle = "rgba(5, 5, 5, 0.12)"
      ctx.fillRect(0, 0, ancho, alto)

      for (const s of sparks) {
        if (animar) {
          s.x += s.derivaX
          s.y += s.derivaY
          if (s.x < -10) s.x = ancho + 10
          if (s.x > ancho + 10) s.x = -10
          if (s.y < -10) s.y = alto + 10
          if (s.y > alto + 10) s.y = -10
        }
        const titileo = animar
          ? (Math.sin(cuadro * s.velocidad + s.fase) + 1) / 2
          : 0.7
        dibujarSpark(s, 0.23 + titileo * 0.68)
      }

      if (!animar) return

      // Circulos glitch: aparecen, saltan en pasos y se desvanecen.
      if (cuadro % 26 === 0 && circulos.length < 7) {
        circulos.push({
          x: rnd(ancho * 0.2, ancho * 0.95),
          y: rnd(alto * 0.1, alto * 0.9),
          r: rnd(10, 46),
          vida: 0,
          vidaMax: rnd(50, 120),
          color: Math.random() > 0.5 ? VIOLETA : VIOLETA_SOFT,
          saltoCada: Math.floor(rnd(6, 14)),
        })
      }

      ctx.lineWidth = 1.4
      circulos = circulos.filter((c) => {
        c.vida += 1
        if (c.vida % c.saltoCada === 0) {
          c.x += rnd(-6, 6)
          c.y += rnd(-4, 4)
        }
        const progreso = c.vida / c.vidaMax
        const alfa = Math.sin(progreso * Math.PI) * 0.78
        ctx.strokeStyle = `rgba(${c.color}, ${alfa})`
        ctx.beginPath()
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2)
        ctx.stroke()
        return c.vida < c.vidaMax
      })

      // Bloques glitch ocasionales (sutiles).
      if (cuadro % 70 < 4) {
        const col = Math.random() > 0.5 ? LIMA : VIOLETA
        ctx.fillStyle = `rgba(${col}, 0.27)`
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(
            rnd(ancho * 0.3, ancho),
            rnd(0, alto),
            rnd(4, 22),
            rnd(3, 10)
          )
        }
      }
    }

    function bucle() {
      cuadro += 1
      dibujarFrame(true)
      raf = requestAnimationFrame(bucle)
    }

    function arrancar() {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(bucle)
    }

    const onVisibilidad = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else arrancar()
    }

    const observador = new ResizeObserver(() => {
      ajustarTamano()
    })

    // Carga de imagen.
    const img = new Image()
    img.onload = () => {
      imagen = img
      ajustarTamano()
      arrancar()
    }
    img.onerror = () => {
      imagen = null
      ajustarTamano()
      arrancar()
    }
    img.src = src

    const padre = canvas.parentElement
    if (padre) observador.observe(padre)
    document.addEventListener("visibilitychange", onVisibilidad)

    return () => {
      cancelAnimationFrame(raf)
      observador.disconnect()
      document.removeEventListener("visibilitychange", onVisibilidad)
    }
  }, [src])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
