"use client"

import * as React from "react"

export type CurrentUser = {
  internalId: string
  name: string
  email: string
  avatar: string
}

let cachedPromise: Promise<CurrentUser | null> | null = null

function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (!cachedPromise) {
    cachedPromise = fetch("/api/me", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          return null
        }

        const payload = (await response.json()) as {
          user?: CurrentUser | null
        }

        return payload.user ?? null
      })
      .catch(() => null)
  }

  return cachedPromise
}

export function invalidateCurrentUser() {
  cachedPromise = null
}

const CurrentUserContext = React.createContext<CurrentUser | null>(null)

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<CurrentUser | null>(null)

  React.useEffect(() => {
    let isMounted = true

    fetchCurrentUser().then((result) => {
      if (isMounted && result) {
        setUser(result)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  return React.useContext(CurrentUserContext)
}
