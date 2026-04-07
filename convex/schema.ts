import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    internalId: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    displayName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_internalId", ["internalId"])
    .index("by_email", ["email"]),
  papers: defineTable({
    slug: v.optional(v.string()),
    ownerInternalId: v.string(),
    title: v.string(),
    subtitle: v.string(),
    duration: v.string(),
    documentJson: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerInternalId"]),
})
