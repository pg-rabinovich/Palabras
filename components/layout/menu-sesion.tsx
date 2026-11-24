"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  ChevronDown,
  LayoutGrid,
  LogOut,
  Moon,
  PenLine,
  Sun,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type DatosSesion = {
  nombreMostrado: string
  rol: string
  /** Piezas esperando curaduria (solo se informa a admins). */
  pendientes?: number
}

function inicial(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || "·"
}

// Chip de sesion del header: inicial + firma; abre un menu con dashboard,
// escribir, tema y salir. Reemplaza al switch de tema suelto cuando hay sesion.
export function MenuSesion({
  sesion,
  className,
}: {
  sesion: DatosSesion
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const formSalirRef = React.useRef<HTMLFormElement | null>(null)
  const esAdmin = sesion.rol === "admin"
  // El tema real solo se conoce en el navegador.
  const montado = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const tema = montado ? (resolvedTheme ?? "dark") : "dark"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full border border-lime-text/45 bg-lime-soft py-0 pr-3.5 pl-2 font-mono text-[0.68rem] tracking-[0.22em] text-foreground uppercase transition-colors outline-none hover:bg-lime/40 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-lime/40",
              className
            )}
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-lime font-serif text-lg font-medium text-lime-foreground normal-case">
                {inicial(sesion.nombreMostrado)}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[12ch] truncate">
              {sesion.nombreMostrado}
            </span>
            <ChevronDown className="size-3.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="w-72 rounded-2xl p-2 shadow-flotante"
        >
          <DropdownMenuLabel className="flex flex-col gap-1 px-3 pt-2.5 pb-3">
            <span className="font-serif text-xl font-normal text-foreground">
              {sesion.nombreMostrado}
            </span>
            <span className="font-mono text-[0.6rem] font-normal tracking-[0.2em] text-muted-foreground uppercase">
              {esAdmin ? "admin · voz pública" : "voz pública"}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {esAdmin && (
              <DropdownMenuItem asChild className="min-h-11 gap-3 px-3">
                <Link href="/dashboard">
                  <LayoutGrid className="size-4" />
                  Dashboard
                  {sesion.pendientes ? (
                    <span className="ml-auto font-mono text-[0.68rem] text-lime-text">
                      {sesion.pendientes}{" "}
                      {sesion.pendientes === 1 ? "pendiente" : "pendientes"}
                    </span>
                  ) : null}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild className="min-h-11 gap-3 px-3">
              <Link href="/participacion">
                <PenLine className="size-4" />
                Escribir una pieza
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-3 pt-2 pb-1 font-mono text-[0.6rem] font-normal tracking-[0.24em] text-muted-foreground uppercase">
            Tema
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup value={tema} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="dark" className="min-h-11 gap-3 px-3">
              <Moon className="size-4" />
              Oscuro
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="light"
              className="min-h-11 gap-3 px-3"
            >
              <Sun className="size-4" />
              Claro
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="min-h-11 gap-3 px-3"
            onSelect={() => formSalirRef.current?.requestSubmit()}
          >
            <LogOut className="size-4" />
            Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <form
        ref={formSalirRef}
        action="/auth/salir"
        method="post"
        className="hidden"
      />
    </>
  )
}
