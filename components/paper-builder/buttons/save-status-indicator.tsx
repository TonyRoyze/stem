"use client"

import * as React from "react"
import {
  RiLoader4Line,
  RiCheckLine,
  RiCloudOffLine,
  RiErrorWarningLine,
  RiRefreshLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import type { SaveStatus } from "@/hooks/use-auto-save"

interface SaveStatusIndicatorProps {
  status: SaveStatus
  lastSaved: Date | null
  onSaveNow: () => void
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  onSaveNow,
}: SaveStatusIndicatorProps) {
  const [timeAgo, setTimeAgo] = React.useState<string>("")

  React.useEffect(() => {
    if (!lastSaved) return

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000)
      if (seconds < 60) {
        setTimeAgo("just now")
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        setTimeAgo(`${minutes}m ago`)
      } else {
        const hours = Math.floor(seconds / 3600)
        setTimeAgo(`${hours}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 60000)
    return () => clearInterval(interval)
  }, [lastSaved])

  if (status === "idle") {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      {status === "saving" && (
        <>
          <RiLoader4Line className="size-4 animate-spin" />
          <span>Saving...</span>
        </>
      )}

      {status === "saved" && (
        <>
          <RiCheckLine className="size-4 text-emerald-500" />
          <span>Saved {timeAgo}</span>
        </>
      )}

      {status === "offline" && (
        <>
          <RiCloudOffLine className="size-4 text-amber-500" />
          <span className="text-amber-600">Offline</span>
          <Button variant="ghost" size="xs" onClick={onSaveNow}>
            <RiRefreshLine className="size-3" />
            Retry
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <RiErrorWarningLine className="size-4 text-red-500" />
          <span className="text-red-600">Save failed</span>
          <Button variant="ghost" size="xs" onClick={onSaveNow}>
            <RiRefreshLine className="size-3" />
            Retry
          </Button>
        </>
      )}
    </div>
  )
}
