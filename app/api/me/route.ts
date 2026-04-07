import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { AUTH_COOKIE_NAME, readAuthSession } from "@/lib/auth"
import { getCurrentUser } from "@/lib/convex-server"

export async function GET() {
  const cookieStore = await cookies()
  const session = readAuthSession(cookieStore.get(AUTH_COOKIE_NAME)?.value)

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = await getCurrentUser(session.internalId)
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      name: user.displayName,
      email: user.email,
      avatar: "",
    },
  })
}
