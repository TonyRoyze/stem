"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  createAuthCookieValue,
  hashPassword,
} from "@/lib/auth"
import { createUser, getLoginUser } from "@/lib/convex-server"

export type AuthFormState = {
  error?: string
}

function getRedirectTarget(formData: FormData) {
  const next = formData.get("next")
  return typeof next === "string" && next.startsWith("/") ? next : "/papers"
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email)
}

export async function login(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = getRedirectTarget(formData)

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." }
  }

  if (!password) {
    return { error: "Enter your password to continue." }
  }

  const user = await getLoginUser(email, await hashPassword(password))
  if (!user) {
    return { error: "Incorrect email or password." }
  }

  const cookieStore = await cookies()
  cookieStore.set(
    AUTH_COOKIE_NAME,
    await createAuthCookieValue({ internalId: user.internalId }),
    authCookieOptions
  )

  redirect(redirectTo)
}

export async function createAccount(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const displayName = String(formData.get("displayName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")
  const redirectTo = getRedirectTarget(formData)

  if (displayName.length < 2) {
    return { error: "Enter a display name with at least 2 characters." }
  }

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." }
  }

  if (password.length < 8) {
    return { error: "Use a password with at least 8 characters." }
  }

  try {
    const user = await createUser({
      displayName,
      email,
      passwordHash: await hashPassword(password),
    })

    const cookieStore = await cookies()
    cookieStore.set(
      AUTH_COOKIE_NAME,
      await createAuthCookieValue({ internalId: user.internalId }),
      authCookieOptions
    )

    redirect(redirectTo)
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Could not create the first account.",
    }
  }
}
