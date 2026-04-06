import { v } from "convex/values"

import { mutation, query, type MutationCtx } from "./_generated/server"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function createUniqueInternalId(ctx: MutationCtx, email: string) {
  const localPart = normalizeEmail(email).split("@")[0] ?? "member"
  const base = `usr_${slugify(localPart).slice(0, 16) || "member"}`
  let internalId = base
  let suffix = 1

  while (
    await ctx.db
      .query("users")
      .withIndex("by_internalId", (q) => q.eq("internalId", internalId))
      .unique()
  ) {
    suffix += 1
    internalId = `${base}_${suffix}`
  }

  return internalId
}

function toPublicUser(user: {
  _id: string
  internalId: string
  email: string
  displayName: string
  createdAt: number
  updatedAt: number
}) {
  return {
    _id: user._id,
    internalId: user.internalId,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export const count = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    return users.length
  },
})

export const getByInternalId = query({
  args: {
    internalId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_internalId", (q) => q.eq("internalId", args.internalId))
      .unique()

    return user ? toPublicUser(user) : null
  },
})

export const login = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(args.email)))
      .unique()

    if (!user || user.passwordHash !== args.passwordHash) {
      return null
    }

    return toPublicUser(user)
  },
})

export const createUser = mutation({
  args: {
    displayName: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email)
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique()

    if (existingUser) {
      throw new Error("That email address is already in use.")
    }

    const now = Date.now()
    const internalId = await createUniqueInternalId(ctx, email)

    const userId = await ctx.db.insert("users", {
      internalId,
      email,
      displayName: args.displayName.trim(),
      passwordHash: args.passwordHash,
      createdAt: now,
      updatedAt: now,
    })

    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error("Could not create the user.")
    }

    return toPublicUser(user)
  },
})

export const updateProfile = mutation({
  args: {
    internalId: v.string(),
    displayName: v.string(),
    email: v.string(),
    currentPasswordHash: v.string(),
    nextPasswordHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_internalId", (q) => q.eq("internalId", args.internalId))
      .unique()

    if (!user) {
      throw new Error("User not found.")
    }

    if (user.passwordHash !== args.currentPasswordHash) {
      throw new Error("Current password is incorrect.")
    }

    const email = normalizeEmail(args.email)
    const existingEmailUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique()

    if (existingEmailUser && existingEmailUser._id !== user._id) {
      throw new Error("That email address is already in use.")
    }

    await ctx.db.patch(user._id, {
      displayName: args.displayName.trim(),
      email,
      passwordHash: args.nextPasswordHash ?? user.passwordHash,
      updatedAt: Date.now(),
    })

    const updatedUser = await ctx.db.get(user._id)
    if (!updatedUser) {
      throw new Error("Could not update the user.")
    }

    return toPublicUser(updatedUser)
  },
})
