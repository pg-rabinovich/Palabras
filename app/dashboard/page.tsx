import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const drafts = [
  {
    title: "Los nombres del agua",
    meta: "Novela · 12 escenas",
    progress: "Ultima edicion: ayer",
  },
  {
    title: "Atlas para una obra breve",
    meta: "Teatro · 3 actos",
    progress: "Borrador inicial",
  },
  {
    title: "Bitacora de una ciudad",
    meta: "Ensayo · 8 notas",
    progress: "Listo para revision",
  },
]

const quickPanels = [
  {
    title: "Pulso creativo",
    description: "Tu escritorio esta listo para retomar ideas, escenas y decisiones.",
    accent: "Sesion abierta",
  },
  {
    title: "Colaboracion",
    description: "Pronto podras invitar lectores y coautores sin cambiar la estructura actual.",
    accent: "Preparado para crecer",
  },
]

const pillars = [
  "Crear obras con una estructura clara",
  "Moverte entre borradores y versiones",
  "Abrir el espacio a colaboracion futura",
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-background/80 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.2em]">
              Palabras
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Tu dashboard inicial para escribir con foco.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" size="lg">
              <Link href="/">Volver al ingreso</Link>
            </Button>
            <Button size="lg" className="h-11 px-5 text-sm">
              Crear obra
            </Button>
          </div>
        </header>

        <section className="grid gap-6 py-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <Card className="overflow-hidden border-border/70 bg-card/95 shadow-[0_24px_80px_-45px_rgba(15,23,42,0.35)]">
            <div className="h-1 w-full bg-primary/80" />
            <CardHeader className="gap-4 pb-5">
              <div className="inline-flex w-fit rounded-full border border-editorial-line bg-editorial-paper px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-editorial-ink">
                Dashboard principal
              </div>
              <CardTitle className="text-3xl text-balance">
                Una mesa de trabajo sobria para arrancar hoy y escalar pronto.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base">
                Esta primera version ya separa ingreso y tablero, para que luego
                podamos sumar autenticacion, obras reales y colaboracion sin
                rearmar la experiencia base.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {drafts.map((draft) => (
                <div
                  key={draft.title}
                  className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-medium">{draft.title}</div>
                      <div className="text-sm text-muted-foreground">{draft.meta}</div>
                    </div>
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {draft.progress}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {quickPanels.map((panel, index) => (
              <Card key={panel.title} className="border-border/70 bg-card/90">
                <CardHeader className="pb-3">
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    0{index + 1}
                  </div>
                  <CardTitle className="text-xl">{panel.title}</CardTitle>
                  <CardDescription>{panel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                    {panel.accent}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="border-border/70 bg-editorial-paper/80">
            <CardHeader>
              <div className="text-sm font-medium uppercase tracking-[0.24em] text-editorial-ink/70">
                Direccion del producto
              </div>
              <CardTitle className="text-2xl">Lo que ya podemos sostener desde esta base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar}
                  className="rounded-2xl border border-editorial-line bg-background/75 px-4 py-3 text-sm text-editorial-ink"
                >
                  {pillar}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70 bg-card/95">
            <CardHeader>
              <div className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Proxima capa
              </div>
              <CardTitle className="text-2xl">Expansion natural para las siguientes iteraciones</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {["Auth", "Obras", "Colaboracion"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border/70 bg-background/80 p-4"
                >
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    0{index + 1}
                  </div>
                  <div className="mt-3 text-base font-medium">{item}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item === "Auth" &&
                      "El boton Empezar ya puede convertirse luego en acceso real sin rehacer la home."}
                    {item === "Obras" &&
                      "El dashboard ya tiene espacio para conectar listas y estados desde una base de datos."}
                    {item === "Colaboracion" &&
                      "La UI ya sugiere comentarios, versiones e invitados como siguiente paso natural."}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
