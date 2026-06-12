"use client"

import { P5Canvas } from "@/components/p5/p5-canvas"
import { cn } from "@/lib/utils"
import { sparksConstruccionSketch } from "@/sketches/p5/sparks-construccion"

type SparksConstruccionProps = {
  className?: string
}

export function SparksConstruccion({ className }: SparksConstruccionProps) {
  return (
    <P5Canvas
      sketch={sparksConstruccionSketch}
      className={cn(
        "pointer-events-none absolute -inset-x-12 -inset-y-8 z-20 overflow-visible mix-blend-screen",
        className
      )}
    />
  )
}
