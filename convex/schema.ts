import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  papers: defineTable({
    slug: v.optional(v.string()),
    title: v.string(),
    subtitle: v.string(),
    duration: v.string(),
    documentJson: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_slug", ["slug"]),
})
