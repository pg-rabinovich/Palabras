import { relations } from "drizzle-orm"
import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const estadoParticipacion = pgEnum("estado_participacion", [
  "borrador",
  "publicada",
])

export const tipoImagenParticipacion = pgEnum("tipo_imagen_participacion", [
  "portada",
  "galeria",
  "editor",
])

export const participaciones = pgTable("participaciones", {
  id: uuid("id").defaultRandom().primaryKey(),
  titulo: text("titulo").notNull(),
  nombreAutor: text("nombre_autor").default("Voz anonima").notNull(),
  textoJson: jsonb("texto_json").notNull(),
  textoHtml: text("texto_html").notNull(),
  textoPlano: text("texto_plano").notNull(),
  estado: estadoParticipacion("estado").default("borrador").notNull(),
  creadoEn: timestamp("creado_en", { withTimezone: true }).defaultNow().notNull(),
  actualizadoEn: timestamp("actualizado_en", { withTimezone: true })
    .defaultNow()
    .notNull(),
  publicadoEn: timestamp("publicado_en", { withTimezone: true }),
})

export const imagenesParticipacion = pgTable("imagenes_participacion", {
  id: uuid("id").defaultRandom().primaryKey(),
  participacionId: uuid("participacion_id")
    .notNull()
    .references(() => participaciones.id, { onDelete: "cascade" }),
  rutaArchivo: text("ruta_archivo").notNull(),
  urlPublica: text("url_publica"),
  nombreArchivo: text("nombre_archivo").notNull(),
  tipoMime: text("tipo_mime").notNull(),
  tamanoBytes: integer("tamano_bytes").notNull(),
  ancho: integer("ancho"),
  alto: integer("alto"),
  textoAlternativo: text("texto_alternativo"),
  tipo: tipoImagenParticipacion("tipo").default("galeria").notNull(),
  orden: integer("orden").default(0).notNull(),
  creadaEn: timestamp("creada_en", { withTimezone: true }).defaultNow().notNull(),
})

export const participacionesRelations = relations(participaciones, ({ many }) => ({
  imagenes: many(imagenesParticipacion),
}))

export const imagenesParticipacionRelations = relations(
  imagenesParticipacion,
  ({ one }) => ({
    participacion: one(participaciones, {
      fields: [imagenesParticipacion.participacionId],
      references: [participaciones.id],
    }),
  })
)
