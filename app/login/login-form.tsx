"use client"

import { useActionState } from "react"
import { RiLockPasswordLine, RiUserAddLine } from "@remixicon/react"

import {
  createAccount,
  login,
  type AuthFormState,
} from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initialState: AuthFormState = {}

export function LoginForm({
  mode,
  next,
}: {
  mode: "signin" | "signup"
  next?: string
}) {
  const isSignIn = mode === "signin"
  const [state, formAction, isPending] = useActionState(
    isSignIn ? login : createAccount,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/papers"} />

      {!isSignIn ? (
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-slate-700"
          >
            Display name
          </label>
          <Input
            id="displayName"
            name="displayName"
            placeholder="Jane Doe"
            required
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete={isSignIn ? "email" : "username"}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignIn ? "current-password" : "new-password"}
          placeholder={isSignIn ? "Enter password" : "Create a password"}
          required
        />
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isSignIn ? (
          <RiLockPasswordLine className="size-4" />
        ) : (
          <RiUserAddLine className="size-4" />
        )}
        {isPending
          ? isSignIn
            ? "Signing in..."
            : "Creating account..."
          : isSignIn
            ? "Sign in"
            : "Create account"}
      </Button>
    </form>
  )
}
