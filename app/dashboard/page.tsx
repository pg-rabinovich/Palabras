/* eslint-disable @next/next/no-img-element */

import Link from "next/link"

import { HeaderNav } from "@/components/layout/header-nav"
import { redirect } from "next/navigation"
import { and, desc, eq } from "drizzle-orm"

import { obtenerSesion } from "@/components/auth/acceso-nav"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { obtenerBaseDatos } from "@/lib/db/conexion"
import { imagenesParticipacion, participaciones } from "@/lib/db/esquema"

import { moverParticipacion } from "./acciones"

export const dynamic = "force-dynamic"

type ObraModeracion = {
  id: string
  titulo: string
  nombreAutor: string
  textoPlano: string
  estado: "borrador" | "publicada" | "rechazada"
  creadoEn: Date
  urlPublica: string | null
  textoAlternativo: string | null
}

function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(fecha)
}

function FormAccion({
  id,
  estado,
  label,
  tono,
}: {
  id: string
  estado: ObraModeracion["estado"]
  label: string
  tono: "primario" | "suave"
}) {
  return (
    <form action={moverParticipacion} className="flex-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="estado" value={estado} />
      <Button
        type="submit"
        variant={tono === "suave" ? "ghost" : "default"}
        className={
          tono === "primario"
            ? "h-10 w-full rounded-full bg-lime font-mono text-[0.62rem] tracking-[0.2em] text-lime-foreground uppercase hover:bg-primary hover:text-primary-foreground"
            : "h-10 w-full rounded-full border border-border-strong font-mono text-[0.62rem] tracking-[0.2em] text-foreground-soft uppercase hover:border-destructive/50 hover:text-destructive-foreground"
        }
      >
        {label}
      </Button>
    </form>
  )
}

function TarjetaObra({
  obra,
  children,
}: {
  obra: ObraModeracion
  children: React.ReactNode
}) {
  return (
    <Card className="flex flex-col gap-4 overflow-hidden border-border bg-card/82 p-4 text-foreground">
      {obra.urlPublica ? (
        <img
          src={obra.urlPublica}
          alt={obra.textoAlternativo ?? obra.titulo}
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-border-strong font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
          sin imagen
        </div>
      )}

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-mono text-[0.6rem] tracking-[0.22em] text-lime-text uppercase">
            {obra.nombreAutor}
          </span>
          <span className="shrink-0 font-mono text-[0.56rem] tracking-[0.18em] text-muted-foreground uppercase">
            {formatearFecha(obra.creadoEn)}
          </span>
        </div>
        <h2 className="font-serif text-2xl leading-tight">{obra.titulo}</h2>
        <p className="line-clamp-4 font-mono text-[0.66rem] leading-5 text-foreground-soft">
          {obra.textoPlano}
        </p>
      </div>

      <div className="flex gap-2">{children}</div>
    </Card>
  )
}

function Seccion({
  titulo,
  obras,
  children,
}: {
  titulo: string
  obras: ObraModeracion[]
  children: (obra: ObraModeracion) => React.ReactNode
}) {
  return (
    <div className="mt-12 first:mt-0">
      <div className="mb-5 font-mono text-[0.66rem] tracking-[0.28em] text-lime-text uppercase">
        {titulo} · {obras.length}
      </div>
      {obras.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {obras.map((obra) => (
            <TarjetaObra key={obra.id} obra={obra}>
              {children(obra)}
            </TarjetaObra>
          ))}
        </div>
      ) : (
        <p className="font-mono text-[0.66rem] text-muted-foreground">
          Nada por aca.
        </p>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  const sesion = await obtenerSesion()

  if (!sesion || sesion.rol !== "admin") {
    redirect("/")
  }

  const db = obtenerBaseDatos()
  const filas = await db
    .select({
      id: participaciones.id,
      titulo: participaciones.titulo,
      nombreAutor: participaciones.nombreAutor,
      textoPlano: participaciones.textoPlano,
      estado: participaciones.estado,
      creadoEn: participaciones.creadoEn,
      urlPublica: imagenesParticipacion.urlPublica,
      textoAlternativo: imagenesParticipacion.textoAlternativo,
    })
    .from(participaciones)
    .leftJoin(
      imagenesParticipacion,
      and(
        eq(imagenesParticipacion.participacionId, participaciones.id),
        eq(imagenesParticipacion.tipo, "portada")
      )
    )
    .orderBy(desc(participaciones.creadoEn))
    .limit(200)

  const pendientes = filas.filter((f) => f.estado === "borrador")
  const publicadas = filas.filter((f) => f.estado === "publicada")
  const rechazadas = filas.filter((f) => f.estado === "rechazada")

  return (
    <main className="relative min-h-screen overflow-hidden">
      <section className="relative mx-auto w-full max-w-7xl px-6 py-6 lg:px-10">
        <HeaderNav>
          <Link href="/" className="transition-colors hover:text-violet-text">
            manifiesto
          </Link>
          <Link
            href="/obras-abiertas"
            className="transition-colors hover:text-violet-text"
          >
            obras abiertas
          </Link>
          <span className="text-lime-text">dashboard</span>
        </HeaderNav>

        <div className="relative py-14">
          <div className="mb-4">
            <div className="font-mono text-[0.68rem] tracking-[0.32em] text-lime-text uppercase">
              curaduria · {pendientes.length} pendiente
              {pendientes.length === 1 ? "" : "s"}
            </div>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-none text-balance text-foreground sm:text-6xl">
              Panel de curaduria.
            </h1>
          </div>

          <Seccion titulo="pendientes" obras={pendientes}>
            {(obra) => (
              <>
                <FormAccion
                  id={obra.id}
                  estado="publicada"
                  label="Aprobar"
                  tono="primario"
                />
                <FormAccion
                  id={obra.id}
                  estado="rechazada"
                  label="Rechazar"
                  tono="suave"
                />
              </>
            )}
          </Seccion>

          <Seccion titulo="publicadas" obras={publicadas}>
            {(obra) => (
              <FormAccion
                id={obra.id}
                estado="borrador"
                label="Despublicar"
                tono="suave"
              />
            )}
          </Seccion>

          <Seccion titulo="rechazadas" obras={rechazadas}>
            {(obra) => (
              <FormAccion
                id={obra.id}
                estado="borrador"
                label="Restaurar"
                tono="suave"
              />
            )}
          </Seccion>
        </div>
      </section>
    </main>
  )
}
