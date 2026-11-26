"use client"

import * as React from "react"

/**
 * Teclas de un atajo, en el formato de TipTap: "Mod" es ⌘ en Mac y Ctrl en el
 * resto. Ejemplo: ["Mod", "Shift", "Z"].
 */
export type Atajo = string[]

function detectarMac() {
  if (typeof navigator === "undefined") return false
  const plataforma =
    (navigator as Navigator & { userAgentData?: { platform?: string } })
      .userAgentData?.platform ?? navigator.platform
  return /mac|iphone|ipad/i.test(plataforma)
}

/** true en Mac/iPhone/iPad. En el render de servidor devuelve false. */
export function useEsMac() {
  return React.useSyncExternalStore(
    () => () => {},
    detectarMac,
    () => false
  )
}

const simbolosMac: Record<string, string> = {
  Mod: "⌘",
  Shift: "⇧",
  Alt: "⌥",
  Ctrl: "⌃",
  Enter: "↩",
}

const nombresPc: Record<string, string> = {
  Mod: "Ctrl",
  Enter: "Enter",
}

/** Partes del atajo listas para mostrar como teclas: ["⇧", "⌘", "Z"] o ["Ctrl", "Shift", "Z"]. */
export function teclasDeAtajo(atajo: Atajo, esMac: boolean) {
  if (esMac) {
    // En Mac el orden convencional es ⌃ ⌥ ⇧ ⌘ y despues la tecla.
    const orden = ["Ctrl", "Alt", "Shift", "Mod"]
    const modificadores = orden.filter((m) => atajo.includes(m))
    const resto = atajo.filter((t) => !orden.includes(t))
    return [...modificadores, ...resto].map((t) => simbolosMac[t] ?? t)
  }
  return atajo.map((t) => nombresPc[t] ?? t)
}

/** El atajo como texto corto: "⇧⌘Z" o "Ctrl+Shift+Z". */
export function textoDeAtajo(atajo: Atajo, esMac: boolean) {
  const teclas = teclasDeAtajo(atajo, esMac)
  return esMac ? teclas.join("") : teclas.join("+")
}
