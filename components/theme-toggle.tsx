"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

// Switch de tema. Espera a montar en cliente antes de mostrar el icono real:
// next-themes no sabe la preferencia guardada durante el render de servidor.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [montado, setMontado] = React.useState(false)

  React.useEffect(() => {
    setMontado(true)
  }, [])

  const esOscuro = montado && resolvedTheme === "dark"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      aria-label={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={esOscuro ? "Modo claro" : "Modo oscuro"}
      onClick={() => setTheme(esOscuro ? "light" : "dark")}
      className="shrink-0 rounded-full border border-border text-foreground-soft hover:border-neo-lime/60 hover:text-lime-text"
    >
      {montado ? (
        esOscuro ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  )
}
