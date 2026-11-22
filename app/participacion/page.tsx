import { obtenerSesion } from "@/components/auth/acceso-nav"
import { EditorParticipacion } from "@/components/participacion/editor-participacion"

export default async function ParticipacionPage() {
  const sesion = await obtenerSesion()

  return (
    <main className="min-h-screen bg-[rgb(5_5_5)] text-[rgb(242_238_230)]">
      <h1 className="sr-only">Escribir una pieza colectiva</h1>
      <EditorParticipacion
        firma={sesion?.nombreMostrado}
        logueada={Boolean(sesion)}
      />
    </main>
  )
}
