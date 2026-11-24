import { cn } from "@/lib/utils"

// Bloque "atmosfera": superficie de marca siempre oscura (ver .mood-card en
// globals.css). El texto usa los tokens "neo" fijos, no los que cambian con el tema.
// Se usa en la home y dentro del modal de "Entrar a la instalacion".
export function TarjetaAtmosfera({
  className,
  children,
}: {
  className?: string
  /** Contenido extra al pie (por ejemplo, acciones del modal). */
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "mood-card grid gap-6 overflow-hidden rounded-[1.5rem] border border-border p-8 text-neo-paper lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)] lg:items-end",
        className
      )}
    >
      <div>
        <div className="font-mono text-[0.62rem] tracking-[0.28em] text-neo-lime uppercase">
          atmosfera
        </div>
        <p className="mt-4 max-w-3xl font-serif text-3xl leading-tight text-balance sm:text-5xl">
          En Proceso Σε εξέλιξη In Progress En cours В процессе Em processo In
          Arbeit In uitvoering Under arbete
        </p>
      </div>
      <div className="space-y-2">
        <div className="font-script text-3xl text-neo-lime sm:text-4xl">
          palabra + imagen + presencia
        </div>
        <p className="font-mono text-[0.68rem] tracking-[0.24em] text-neo-marble/62 uppercase">
          collective writing // poetic interface // visual storytelling
        </p>
      </div>
      {children && <div className="lg:col-span-2">{children}</div>}
    </div>
  )
}
