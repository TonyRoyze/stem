import { ConvexHttpClient } from "convex/browser"
import { makeFunctionReference } from "convex/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { AUTH_COOKIE_NAME, readAuthSession } from "@/lib/auth"

export type UserProfile = {
  _id: string
  internalId: string
  email: string
  displayName: string
  createdAt: number
  updatedAt: number
}

const userCountRef = makeFunctionReference<"query", Record<string, never>, number>(
  "users:count"
)

const getByInternalIdRef = makeFunctionReference<
  "query",
  { internalId: string },
  UserProfile | null
>("users:getByInternalId")

const loginRef = makeFunctionReference<
  "mutation",
  { email: string; passwordHash: string },
  UserProfile | null
>("users:login")

const createUserRef = makeFunctionReference<
  "mutation",
  { displayName: string; email: string; passwordHash: string },
  UserProfile
>("users:createUser")

const updateProfileRef = makeFunctionReference<
  "mutation",
  {
    internalId: string
    displayName: string
    email: string
    currentPasswordHash: string
    nextPasswordHash?: string
  },
  UserProfile
>("users:updateProfile")

function getConvexServerClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL must be configured.")
  }

  return new ConvexHttpClient(url)
}

export async function getUserCount() {
  return getConvexServerClient().query(userCountRef, {})
}

export async function getCurrentUser(internalId: string) {
  return getConvexServerClient().query(getByInternalIdRef, { internalId })
}

export async function getLoginUser(email: string, passwordHash: string) {
  return getConvexServerClient().mutation(loginRef, { email, passwordHash })
}

export async function createUser(args: {
  displayName: string
  email: string
  passwordHash: string
}) {
  return getConvexServerClient().mutation(createUserRef, args)
}

export async function updateCurrentUserProfile(args: {
  internalId: string
  displayName: string
  email: string
  currentPasswordHash: string
  nextPasswordHash?: string
}) {
  return getConvexServerClient().mutation(updateProfileRef, args)
}

export async function requireCurrentUser() {
  const cookieStore = await cookies()
  const session = await readAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value)

  if (!session) {
    redirect("/login?next=/profile")
  }

  const user = await getCurrentUser(session.internalId)
  if (!user) {
    redirect("/login?next=/profile")
  }

  return user
}
