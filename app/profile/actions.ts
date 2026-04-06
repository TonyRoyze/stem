"use server"

import { revalidatePath } from "next/cache"

import { hashPassword } from "@/lib/auth"
import {
  requireCurrentUser,
  updateCurrentUserProfile,
} from "@/lib/convex-server"

export type ProfileFormState = {
  error?: string
  success?: string
}

function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email)
}

export async function updateProfile(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await requireCurrentUser()
  const displayName = String(formData.get("displayName") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const currentPassword = String(formData.get("currentPassword") ?? "")
  const newPassword = String(formData.get("newPassword") ?? "")

  if (displayName.length < 2) {
    return { error: "Display name must be at least 2 characters." }
  }

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." }
  }

  if (!currentPassword) {
    return { error: "Enter your current password to save changes." }
  }

  if (newPassword && newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." }
  }

  try {
    await updateCurrentUserProfile({
      internalId: user.internalId,
      displayName,
      email,
      currentPasswordHash: await hashPassword(currentPassword),
      nextPasswordHash: newPassword ? await hashPassword(newPassword) : undefined,
    })

    revalidatePath("/profile")
    return { success: "Profile updated." }
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Could not update the profile.",
    }
  }
}
