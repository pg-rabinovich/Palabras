import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as esquema from "@/lib/db/esquema"

let cliente: postgres.Sql | undefined

export function obtenerBaseDatos() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("Falta configurar DATABASE_URL.")
  }

  cliente ??= postgres(databaseUrl, {
    prepare: false,
  })

  return drizzle(cliente, { schema: esquema })
}
