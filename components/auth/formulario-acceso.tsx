"use client"

import * as React from "react"
import { Loader2, Mail, Send } from "lucide-react"

import { crearSupabaseCliente } from "@/lib/supabase/cliente"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EstadoEnvio = "inicial" | "enviando" | "enviado" | "error"

type FormularioAccesoProps = {
  habilitado?: boolean
}

export function FormularioAcceso({ habilitado = false }: FormularioAccesoProps) {
  const [email, setEmail] = React.useState("")
  const [estado, setEstado] = React.useState<EstadoEnvio>("inicial")
  const [mensaje, setMensaje] = React.useState("")

  async function pedirEnlace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!habilitado) {
      setEstado("error")
      setMensaje("El acceso publico todavia no esta habilitado.")
      return
    }

    const correo = email.trim()
    if (!correo) {
      setEstado("error")
      setMensaje("Escribi un email valido.")
      return
    }

    setEstado("enviando")
    setMensaje("")

    const supabase = crearSupabaseCliente()
    // Sin query: coincide exacto con la allow-list de Supabase. El destino
    // por defecto (/participacion) lo resuelve el route handler /auth/confirm.
    const emailRedirectTo = `${window.location.origin}/auth/confirm`

    const { error } = await supabase.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo },
    })

    if (error) {
      setEstado("error")
      setMensaje("No se pudo enviar el enlace. Proba de nuevo.")
      return
    }

    setEstado("enviado")
    setMensaje("Te enviamos un enlace a tu correo. Abrilo para entrar.")
  }

  if (estado === "enviado") {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-lime-text/40 text-lime-text">
          <Mail className="size-5" />
        </span>
        <p className="font-serif text-2xl leading-tight text-foreground">
          Revisa tu correo
        </p>
        <p className="font-mono text-[0.7rem] leading-6 tracking-[0.04em] text-foreground-soft">
          {mensaje}
        </p>
        <button
          type="button"
          onClick={() => {
            setEstado("inicial")
            setMensaje("")
          }}
          className="font-mono text-[0.64rem] tracking-[0.24em] text-muted-foreground uppercase transition-colors hover:text-lime-text"
        >
          Usar otro email
        </button>
      </div>
    )
  }

  if (!habilitado) {
    return (
      <form onSubmit={(event) => event.preventDefault()} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-mono text-[0.7rem] tracking-[0.24em] text-lime-text uppercase"
          >
            tu email
          </Label>
          <Input
            id="email"
            type="email"
            readOnly
            aria-disabled="true"
            placeholder="proximamente"
            className="h-12 cursor-default border-border bg-card/76 font-mono text-sm tracking-[0.04em] text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring"
          />
        </div>

        <Button
          type="button"
          size="lg"
          aria-disabled="true"
          className="h-12 w-full cursor-default rounded-full bg-primary px-6 font-mono text-[0.7rem] tracking-[0.24em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground"
        >
          Proximamente
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={pedirEnlace} className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="font-mono text-[0.7rem] tracking-[0.24em] text-lime-text uppercase"
        >
          tu email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voz@correo.com"
          className="h-12 border-border bg-card/76 font-mono text-sm tracking-[0.04em] text-foreground placeholder:text-muted-foreground/70 focus-visible:border-ring"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={estado === "enviando"}
        className="h-12 w-full rounded-full bg-primary px-6 font-mono text-[0.7rem] tracking-[0.24em] text-primary-foreground uppercase hover:bg-lime hover:text-lime-foreground"
      >
        {estado === "enviando" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Recibir enlace
      </Button>

      <p className="min-h-5 font-mono text-[0.66rem] leading-5 text-muted-foreground">
        {mensaje}
      </p>
    </form>
  )
}
