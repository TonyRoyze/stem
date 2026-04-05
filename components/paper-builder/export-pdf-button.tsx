"use client"

import * as React from "react"
import { RiLoader4Line } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { STORAGE_KEY, type PaperDocument } from "@/lib/paper-builder"

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}

function getFilenameFromHeaders(response: Response) {
  const disposition = response.headers.get("Content-Disposition")
  const match = disposition?.match(/filename="(.+?)"/)

  return match?.[1] ?? "exam-paper.pdf"
}

export function ExportPdfButton({
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const [isPending, setIsPending] = React.useState(false)

  const handleExport = React.useCallback(() => {
    void (async () => {
      setIsPending(true)

      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)

        if (!saved) {
          return
        }

        const document = JSON.parse(saved) as PaperDocument
        const response = await fetch("/api/export-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ document }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(payload?.error ?? "Failed to export PDF")
        }

        const blob = await response.blob()
        downloadBlob(blob, getFilenameFromHeaders(response))
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to export PDF"
        window.alert(message)
      } finally {
        setIsPending(false)
      }
    })()
  }, [])

  return (
    <Button onClick={handleExport} disabled={isPending} {...props}>
      {isPending ? <RiLoader4Line className="size-4 animate-spin" /> : children}
    </Button>
  )
}
