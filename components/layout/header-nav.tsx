import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

type HeaderNavProps = {
  /** Links de navegacion (varian por pagina). */
  children: React.ReactNode
  /** Boton/form/accion de la derecha (varia por pagina: Volver, Salir, AccesoNav...). */
  accionDerecha?: React.ReactNode
  className?: string
}

// Pill-header compartido por todas las paginas. Antes estaba duplicado
// copy-pasteado en 6 archivos; ahora vive en un solo lugar y siempre incluye
// el switch de tema.
export function HeaderNav({ children, accionDerecha, className }: HeaderNavProps) {
  return (
    <header
      className={cn(
        "relative flex flex-col gap-4 rounded-[1.5rem] border border-border/80 bg-card/72 px-4 py-4 backdrop-blur sm:rounded-[1.75rem] sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:rounded-full",
        className
      )}
    >
      <nav className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[0.66rem] tracking-[0.16em] text-muted-foreground uppercase sm:flex sm:flex-wrap sm:gap-4 sm:text-[0.68rem] sm:tracking-[0.24em] lg:gap-3">
        {children}
      </nav>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {accionDerecha}
      </div>
    </header>
  )
}
