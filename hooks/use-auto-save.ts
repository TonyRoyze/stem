"use client"

import * as React from "react"
import { useMutation } from "convex/react"

import {
  STORAGE_KEY,
  normalizeDocument,
  type PaperDocument,
} from "@/lib/paper-builder"
import { api } from "@/convex/_generated/api"
import { useCurrentUser } from "@/hooks/use-current-user"
import type { Id } from "@/convex/_generated/dataModel"

export type SaveStatus = "idle" | "saving" | "saved" | "offline" | "error"

const AUTO_SAVE_DELAY = 30000

function getDocument(): PaperDocument | null {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) return null
  try {
    return normalizeDocument(JSON.parse(saved) as PaperDocument)
  } catch {
    return null
  }
}

export function useAutoSave(paperId: Id<"papers"> | null) {
  const user = useCurrentUser()
  const savePaper = useMutation(api.papers.upsert)
  const [status, setStatus] = React.useState<SaveStatus>("idle")
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const isOnline = React.useRef(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )

  const clearPendingSave = React.useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
  }, [])

  const performSave = React.useCallback(async () => {
    if (!user) {
      setStatus("idle")
      return
    }

    const document = getDocument()
    if (!document) {
      setStatus("idle")
      return
    }

    if (!navigator.onLine) {
      setStatus("offline")
      return
    }

    setStatus("saving")

    try {
      await savePaper({
        paperId: paperId ?? undefined,
        ownerInternalId: user.internalId,
        title: document.title,
        subtitle: document.subtitle,
        duration: document.duration,
        documentJson: JSON.stringify(document),
      })
      setStatus("saved")
      setLastSaved(new Date())
    } catch (error) {
      console.error("Auto-save failed:", error)
      setStatus("error")
    }
  }, [user, paperId, savePaper])

  React.useEffect(() => {
    const handleOnline = () => {
      isOnline.current = true
      if (status === "offline") {
        performSave()
      }
    }

    const handleOffline = () => {
      isOnline.current = false
      if (status !== "idle" && status !== "saving") {
        setStatus("offline")
      }
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [status, performSave])

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      clearPendingSave()
      saveTimeoutRef.current = setTimeout(performSave, AUTO_SAVE_DELAY)
    }

    return clearPendingSave
  }, [paperId, clearPendingSave, performSave])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      if (event.newValue === null) return

      clearPendingSave()
      saveTimeoutRef.current = setTimeout(performSave, AUTO_SAVE_DELAY)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [clearPendingSave, performSave])

  const saveNow = React.useCallback(() => {
    clearPendingSave()
    void performSave()
  }, [clearPendingSave, performSave])

  return { status, lastSaved, saveNow, performSave }
}
