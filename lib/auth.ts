export const AUTH_COOKIE_NAME = "stem_auth"
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const encoder = new TextEncoder()

export type AuthSession = {
  internalId: string
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(password)
  )
  return toHex(digest)
}

export function createAuthCookieValue(session: AuthSession) {
  return session.internalId
}

export function readAuthSession(value?: string | null): AuthSession | null {
  if (!value || !value.trim()) {
    return null
  }
  return { internalId: value.trim() }
}

export function isValidAuthCookie(value?: string | null) {
  return readAuthSession(value) !== null
}

export const authCookieOptions = {
  httpOnly: true,
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}
