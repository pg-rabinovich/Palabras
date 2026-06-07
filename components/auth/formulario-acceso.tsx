"use client"

import * as React from "react"
import { Loader2, Mail, Send } from "lucide-react"

import { crearSupabaseCliente } from "@/lib/supabase/cliente"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type EstadoEnvio = "inicial" | "enviando" | "enviado" | "error"

export function FormularioAcceso() {
  const [email, setEmail] = React.useState("")
  const [estado, setEstado] = React.useState<EstadoEnvio>("inicial")
  const [mensaje, setMensaje] = React.useState("")

  async function pedirEnlace(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

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
        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-[rgb(217_255_31_/_0.4)] text-[rgb(217_255_31)]">
          <Mail className="size-5" />
        </span>
        <p className="font-serif text-2xl leading-tight text-[rgb(242_238_230)]">
          Revisa tu correo
        </p>
        <p className="font-mono text-[0.7rem] leading-6 tracking-[0.04em] text-[rgb(217_212_206_/_0.7)]">
          {mensaje}
        </p>
        <button
          type="button"
          onClick={() => {
            setEstado("inicial")
            setMensaje("")
          }}
          className="font-mono text-[0.64rem] tracking-[0.24em] text-[rgb(167_161_154)] uppercase transition-colors hover:text-[rgb(217_255_31)]"
        >
          Usar otro email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={pedirEnlace} className="space-y-5">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="font-mono text-[0.7rem] tracking-[0.24em] text-[rgb(217_255_31)] uppercase"
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
          className="h-12 border-[rgb(242_238_230_/_0.12)] bg-[rgb(11_11_15_/_0.76)] font-mono text-sm tracking-[0.04em] text-[rgb(242_238_230)] placeholder:text-[rgb(167_161_154_/_0.62)] focus-visible:border-[rgb(109_40_255)]"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={estado === "enviando"}
        className="h-12 w-full rounded-full bg-[rgb(242_238_230)] px-6 font-mono text-[0.7rem] tracking-[0.24em] text-[rgb(5_5_5)] uppercase hover:bg-[rgb(217_255_31)] hover:text-[rgb(36_18_56)]"
      >
        {estado === "enviando" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        Recibir enlace
      </Button>

      <p className="min-h-5 font-mono text-[0.66rem] leading-5 text-[rgb(167_161_154)]">
        {mensaje}
      </p>
    </form>
  )
}
