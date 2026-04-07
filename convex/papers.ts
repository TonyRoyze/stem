import { v } from "convex/values"

import { mutation, query } from "./_generated/server"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function createUniqueSlug(ctx: any, title: string) {
  const base = slugify(title) || "untitled-paper"
  let slug = base
  let suffix = 1

  while (
    await ctx.db
      .query("papers")
      .withIndex("by_slug", (q: any) => q.eq("slug", slug))
      .unique()
  ) {
    suffix += 1
    slug = `${base}-${suffix}`
  }

  return slug
}

function buildRouteKey(paper: {
  _id: string
  slug?: string
}) {
  return paper.slug ?? paper._id
}

export const list = query({
    const papers = await ctx.db
      .query("papers")
      .collect()

    return papers.map((paper) => ({
      _id: paper._id,
      _creationTime: paper._creationTime,
      slug: paper.slug ?? null,
      routeKey: buildRouteKey(paper),
      title: paper.title,
      subtitle: paper.subtitle,
      duration: paper.duration,
      createdAt: paper.createdAt,
      updatedAt: paper.updatedAt,
    }))
  },
})

export const listRecentCreated = query({

    return papers
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map((paper) => ({
        _id: paper._id,
        slug: paper.slug ?? null,
        routeKey: buildRouteKey(paper),
        title: paper.title,
        createdAt: paper.createdAt,
      }))
  },
})

export const get = query({
  args: {
    paperId: v.id("papers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.paperId)
  },
})

export const getByRouteKey = query({
  args: {
    routeKey: v.string(),
  },
  handler: async (ctx, args) => {
    const bySlug = await ctx.db
      .query("papers")
      .withIndex("by_slug", (q) => q.eq("slug", args.routeKey))
      .unique()

    if (bySlug) {
      return bySlug
    }

    const papers = await ctx.db.query("papers").collect()
    return papers.find((paper) => paper._id === args.routeKey) ?? null
  },
})

export const upsert = mutation({
  args: {
    paperId: v.optional(v.id("papers")),
    title: v.string(),
    subtitle: v.string(),
    duration: v.string(),
    documentJson: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    if (args.paperId) {
      const existing = await ctx.db.get(args.paperId)

      if (!existing) {
        throw new Error("Paper not found.")
      }

      const slug = existing.slug ?? (await createUniqueSlug(ctx, args.title))

      await ctx.db.patch(args.paperId, {
        slug,
        title: args.title,
        subtitle: args.subtitle,
        duration: args.duration,
        documentJson: args.documentJson,
        updatedAt: now,
      })

      return {
        paperId: args.paperId,
        slug,
      }
    }

    const slug = await createUniqueSlug(ctx, args.title)

    const paperId = await ctx.db.insert("papers", {
      slug,
      title: args.title,
      subtitle: args.subtitle,
      duration: args.duration,
      documentJson: args.documentJson,
      createdAt: now,
      updatedAt: now,
    })

    return {
      paperId,
      slug,
    }
  },
})
