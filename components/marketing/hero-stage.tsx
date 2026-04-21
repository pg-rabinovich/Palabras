import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const floatingWords = [
  { label: "voz", className: "left-4 top-10 animate-float-slow" },
  { label: "ritmo", className: "right-12 top-8 animate-float-delayed" },
  { label: "escena", className: "left-8 bottom-24 animate-drift-horizontal" },
  { label: "trama", className: "right-4 bottom-14 animate-float-slow" },
  { label: "borrador", className: "left-1/2 top-2 -translate-x-1/2 animate-float-delayed" },
]

const marqueeWords = [
  "novela",
  "guion",
  "poema",
  "ensayo",
  "idea",
  "capitulo",
  "personajes",
  "colaboracion",
]

export function HeroStage() {
  return (
    <div className="relative mx-auto flex aspect-[5/4] w-full max-w-2xl items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-editorial-paper p-6 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--editorial-glow),_transparent_56%)]" />
      <div className="absolute inset-x-6 top-8 h-px bg-border/70" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.35)_100%)] dark:bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_100%)]" />

      {floatingWords.map((word) => (
        <div
          key={word.label}
          className={cn(
            "absolute rounded-full border border-editorial-line bg-background/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-editorial-ink shadow-sm backdrop-blur",
            word.className
          )}
        >
          {word.label}
        </div>
      ))}

      <Card className="absolute left-4 top-14 w-[72%] rotate-[-6deg] border-editorial-line/80 bg-background/95 shadow-xl animate-float-slow">
        <CardHeader className="gap-3 border-b border-border/70 pb-4">
          <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Obra en progreso
          </div>
          <CardTitle className="text-2xl font-semibold text-balance">
            La ciudad aprende a pronunciarse otra vez.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-5 text-sm leading-7 text-muted-foreground">
          <p>
            Un espacio para transformar notas, escenas y conversaciones en una
            obra viva.
          </p>
          <div className="space-y-2">
            <div className="h-px w-full bg-border/70" />
            <div className="h-px w-4/5 bg-border/60" />
            <div className="h-px w-2/3 bg-border/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="absolute right-2 top-24 w-[44%] rotate-[8deg] border-editorial-line/80 bg-card/95 shadow-lg animate-float-delayed">
        <CardHeader className="pb-3">
          <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            Mesa compartida
          </div>
          <CardTitle className="text-base">Comentarios y versiones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0 text-sm text-muted-foreground">
          <div className="rounded-2xl bg-muted/70 p-3">Ana sugiere abrir con una imagen mas silenciosa.</div>
          <div className="rounded-2xl bg-secondary/80 p-3">Martin ajusta el tono del segundo acto.</div>
        </CardContent>
      </Card>

      <Card className="absolute bottom-16 left-10 w-[52%] border-editorial-line/80 bg-editorial-wash/90 shadow-lg animate-drift-horizontal">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {["estructura", "dialogo", "tema", "notas", "versiones"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-editorial-line bg-background/80 px-3 py-1 text-xs text-editorial-ink"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-[2rem] border-t border-border/70 bg-background/75 py-4 backdrop-blur mask-fade-x">
        <div className="flex w-max min-w-full animate-marquee gap-3 px-4">
          {[...marqueeWords, ...marqueeWords].map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="rounded-full border border-border/70 bg-card px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
