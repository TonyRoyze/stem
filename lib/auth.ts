export const AUTH_COOKIE_NAME = "stem_auth"
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const encoder = new TextEncoder()

export type AuthSession = {
  internalId: string
}

function getDevFallbackSecret() {
  return process.env.NODE_ENV === "production"
    ? ""
    : "stem-dev-secret-change-me"
}

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? getDevFallbackSecret()
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
}

async function createSignature(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(value)
  )

  return toHex(signature)
}

export async function hashPassword(password: string) {
  const secret = getAuthSecret()
  if (!secret) {
    throw new Error("AUTH_SECRET must be configured.")
  }

  return createSignature(secret, `password:${password}`)
}

export async function createAuthCookieValue(session: AuthSession) {
  const secret = getAuthSecret()
  if (!secret) {
    throw new Error("AUTH_SECRET must be configured.")
  }

  return `${session.internalId}.${await createSignature(secret, session.internalId)}`
}

export async function readAuthSession(value?: string | null) {
  if (!value) {
    return null
  }

  const separatorIndex = value.indexOf(".")
  if (separatorIndex <= 0) {
    return null
  }

  const internalId = value.slice(0, separatorIndex)
  const signature = value.slice(separatorIndex + 1)
  const secret = getAuthSecret()

  if (!secret || !internalId || !signature) {
    return null
  }

  const expected = await createSignature(secret, internalId)
  if (signature !== expected) {
    return null
  }

  return { internalId }
}

export async function isValidAuthCookie(value?: string | null) {
  return (await readAuthSession(value)) !== null
}

export const authCookieOptions = {
  httpOnly: true,
  maxAge: AUTH_COOKIE_MAX_AGE,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
}
