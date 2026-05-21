import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig } from "drizzle-kit"

function cargarEnvLocal() {
  const rutaEnvLocal = resolve(process.cwd(), ".env.local")

  if (!existsSync(rutaEnvLocal)) {
    return
  }

  const contenido = readFileSync(rutaEnvLocal, "utf8")

  for (const linea of contenido.split(/\r?\n/)) {
    const lineaLimpia = linea.trim()

    if (!lineaLimpia || lineaLimpia.startsWith("#")) {
      continue
    }

    const indiceSeparador = lineaLimpia.indexOf("=")

    if (indiceSeparador === -1) {
      continue
    }

    const clave = lineaLimpia.slice(0, indiceSeparador).trim()
    const valor = lineaLimpia
      .slice(indiceSeparador + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, "$2")

    process.env[clave] ??= valor
  }
}

cargarEnvLocal()

export default defineConfig({
  schema: "./lib/db/esquema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
})
