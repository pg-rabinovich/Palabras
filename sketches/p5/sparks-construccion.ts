import type P5 from "p5"

import type { P5Sketch } from "./types"

type ColorRgb = readonly [number, number, number]

type Spark = {
  x: number
  y: number
  baseX: number
  baseY: number
  vida: number
  vidaMax: number
  tamano: number
  derivaX: number
  derivaY: number
  fase: number
  color: ColorRgb
  tipo: "cruz" | "punto" | "trazo"
}

const COLORES = {
  violeta: [109, 40, 255],
  violetaSuave: [139, 92, 255],
  lima: [217, 255, 31],
  papel: [242, 238, 230],
} as const satisfies Record<string, ColorRgb>

function rgba(color: ColorRgb, alpha: number) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`
}

function colorAleatorio(p: P5): ColorRgb {
  const colores = [
    COLORES.violeta,
    COLORES.violetaSuave,
    COLORES.lima,
    COLORES.papel,
  ]

  return colores[Math.floor(p.random(colores.length))]
}

function crearSpark(p: P5, ancho: number, alto: number): Spark {
  const alrededorTexto = p.random() > 0.24
  const x = alrededorTexto ? p.random(ancho * 0.08, ancho * 0.92) : p.random(ancho)
  const y = alrededorTexto ? p.random(alto * 0.18, alto * 0.82) : p.random(alto)

  return {
    x,
    y,
    baseX: x,
    baseY: y,
    vida: p.random(0, 90),
    vidaMax: p.random(58, 134),
    tamano: p.random(3.4, 12),
    derivaX: p.random(-0.26, 0.26),
    derivaY: p.random(-0.2, 0.2),
    fase: p.random(p.TWO_PI),
    color: colorAleatorio(p),
    tipo: p.random(["cruz", "punto", "trazo"]) as Spark["tipo"],
  }
}

function dibujarSpark(p: P5, spark: Spark) {
  const progreso = spark.vida / spark.vidaMax
  const pulso = Math.sin(progreso * Math.PI)
  const alpha = pulso * 0.96
  const oscilacion = Math.sin(p.frameCount * 0.025 + spark.fase)
  const x = spark.x + oscilacion * 2.4
  const y = spark.y + Math.cos(p.frameCount * 0.018 + spark.fase) * 1.8

  p.push()
  p.translate(x, y)
  p.rotate(oscilacion * 0.24)
  p.stroke(rgba(spark.color, alpha))
  p.strokeWeight(Math.max(1, spark.tamano * 0.2))
  p.noFill()

  const contexto = p.drawingContext as CanvasRenderingContext2D
  contexto.shadowBlur = spark.tipo === "punto" ? 18 : 13
  contexto.shadowColor = rgba(spark.color, alpha * 0.8)

  if (spark.tipo === "punto") {
    p.noStroke()
    p.fill(rgba(spark.color, alpha * 0.9))
    p.circle(0, 0, spark.tamano * 0.82)
  }

  if (spark.tipo === "cruz") {
    const radio = spark.tamano * (0.9 + pulso * 0.9)
    p.line(-radio, 0, radio, 0)
    p.line(0, -radio, 0, radio)
  }

  if (spark.tipo === "trazo") {
    const largo = spark.tamano * (1.9 + pulso * 1.2)
    p.line(-largo, -largo * 0.25, largo, largo * 0.25)
  }

  contexto.shadowBlur = 0
  p.pop()
}

export const sparksConstruccionSketch: P5Sketch = (p, contexto) => {
  let ancho = 1
  let alto = 1
  let sparks: Spark[] = []

  function ajustarTamano() {
    const tamano = contexto.obtenerTamano()
    ancho = tamano.ancho
    alto = tamano.alto
    p.resizeCanvas(ancho, alto)
    const cantidad = Math.min(46, Math.max(22, Math.round((ancho * alto) / 560)))
    sparks = Array.from({ length: cantidad }, () => crearSpark(p, ancho, alto))
  }

  p.setup = () => {
    const tamano = contexto.obtenerTamano()
    ancho = tamano.ancho
    alto = tamano.alto
    p.createCanvas(ancho, alto)
    p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2))
    p.clear()
    p.frameRate(42)
    sparks = Array.from({ length: 34 }, () => crearSpark(p, ancho, alto))
  }

  p.draw = () => {
    p.clear()

    p.stroke(rgba(COLORES.violeta, 0.28))
    p.strokeWeight(1.2)
    p.noFill()
    p.arc(ancho * 0.64, alto * 0.52, ancho * 0.72, alto * 0.88, -0.4, 2.2)

    p.stroke(rgba(COLORES.lima, 0.2))
    p.arc(ancho * 0.46, alto * 0.5, ancho * 0.48, alto * 0.54, 2.6, 5.6)

    for (const spark of sparks) {
      spark.vida += 1
      spark.x += spark.derivaX
      spark.y += spark.derivaY

      if (
        spark.vida >= spark.vidaMax ||
        spark.x < -12 ||
        spark.x > ancho + 12 ||
        spark.y < -12 ||
        spark.y > alto + 12
      ) {
        Object.assign(spark, crearSpark(p, ancho, alto))
      }

      dibujarSpark(p, spark)
    }

    if (p.frameCount % 28 === 0 && sparks.length < 52) {
      sparks.push(crearSpark(p, ancho, alto))
    }
  }

  p.windowResized = () => {
    ajustarTamano()
  }
}
