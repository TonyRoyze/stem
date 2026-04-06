"use client"

import { useActionState } from "react"
import { RiSaveLine } from "@remixicon/react"

import {
  updateProfile,
  type ProfileFormState,
} from "@/app/profile/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { UserProfile } from "@/lib/convex-server"

const initialState: ProfileFormState = {}

export function ProfileForm({ user }: { user: UserProfile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  )

  return (
    <form action={formAction} className="space-y-5">
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
          defaultValue={user.displayName}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="currentPassword"
          className="text-sm font-medium text-slate-700"
        >
          Current password
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          placeholder="Required to save changes"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="newPassword"
          className="text-sm font-medium text-slate-700"
        >
          New password
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Leave blank to keep your current password"
        />
      </div>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-emerald-700">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        <RiSaveLine className="size-4" />
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  )
}
