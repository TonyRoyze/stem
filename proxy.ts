import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { AUTH_COOKIE_NAME, isValidAuthCookie } from "@/lib/auth"

const PUBLIC_PATHS = new Set(["/login"])

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const isAuthenticated = await isValidAuthCookie(
    request.cookies.get(AUTH_COOKIE_NAME)?.value
  )

  if (isAuthenticated) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  const nextPath = `${pathname}${search}`

  if (pathname !== "/") {
    loginUrl.searchParams.set("next", nextPath)
  }

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/", "/papers/:path*", "/preview", "/profile", "/api/export-pdf"],
}
