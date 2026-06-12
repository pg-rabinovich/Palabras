import type P5 from "p5"

export type P5SketchContext = {
  contenedor: HTMLElement
  obtenerTamano: () => {
    ancho: number
    alto: number
  }
  movimientoReducido: boolean
}

export type P5Sketch = (p: P5, contexto: P5SketchContext) => void
