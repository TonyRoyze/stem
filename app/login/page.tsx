import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { LoginForm } from "@/app/login/login-form"
import { AUTH_COOKIE_NAME, readAuthSession } from "@/lib/auth"
import { getCurrentUser, getUserCount } from "@/lib/convex-server"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>
}) {
  const cookieStore = await cookies()
  const resolvedSearchParams = await searchParams
  const next = resolvedSearchParams.next
  const session = readAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value)

  if (session) {
    const user = await getCurrentUser(session.internalId)
    if (user) {
      redirect(typeof next === "string" && next.startsWith("/") ? next : "/papers")
    }
  }

  const userCount = await getUserCount()
  const hasUsers = userCount > 0
  const requestedMode = resolvedSearchParams.mode
  const mode =
    !hasUsers || requestedMode === "signup" ? "signup" : "signin"
  const alternateMode = mode === "signin" ? "signup" : "signin"
  const alternateHref = next
    ? `/login?mode=${alternateMode}&next=${encodeURIComponent(next)}`
    : `/login?mode=${alternateMode}`

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[32px] border border-emerald-100 bg-white/90 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mb-8 space-y-3">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
            STEM
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              {mode === "signin" ? "Sign in" : hasUsers ? "Create account" : "Create the first account"}
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              {mode === "signin"
                ? "Use your email and password to open the paper builder."
                : hasUsers
                  ? "Create a new account for this workspace, then sign in with those credentials."
                  : "Set up the first user for this workspace. After that, everyone signs in with their own account."}
            </p>
          </div>
        </div>

        <LoginForm
          key={mode}
          mode={mode}
          next={typeof next === "string" ? next : "/papers"}
        />

        {hasUsers ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
            <Link href={alternateHref} className="font-medium text-emerald-700 hover:text-emerald-800">
              {mode === "signin" ? "Create one" : "Sign in instead"}
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  )
}
