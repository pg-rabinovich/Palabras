import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"

import { obtenerBaseDatos } from "@/lib/db/conexion"

export const dynamic = "force-dynamic"

// Cron diario (ver vercel.json): hace un SELECT 1 para que el proyecto de
// Supabase free no se pause por inactividad. Si se define CRON_SECRET, exige
// el header que manda Vercel Cron; si no, queda abierto (la query es inocua).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET

  if (secret) {
    const autorizacion = request.headers.get("authorization")
    if (autorizacion !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
  }

  try {
    const db = obtenerBaseDatos()
    await db.execute(sql`select 1`)
    return NextResponse.json({ ok: true, at: new Date().toISOString() })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
