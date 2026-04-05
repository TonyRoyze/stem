"use client"

import * as React from "react"
import { RiLoader4Line, RiSaveLine } from "@remixicon/react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"

import { Button } from "@/components/ui/button"
import type { Id } from "@/convex/_generated/dataModel"
import { STORAGE_KEY, type PaperDocument, normalizeDocument } from "@/lib/paper-builder"
import { api } from "@/convex/_generated/api"

export function SavePaperButton({
  paperId,
}: {
  paperId?: Id<"papers"> | null
}) {
  const router = useRouter()
  const savePaper = useMutation(api.papers.upsert)
  const [isPending, setIsPending] = React.useState(false)

  const handleSave = React.useCallback(() => {
    void (async () => {
      setIsPending(true)

      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        const fallbackDocument: PaperDocument = normalizeDocument({
          title: "Untitled Paper",
          subtitle: "",
          duration: "",
          instructions: "",
          blocks: [],
        })
        const document = saved
          ? normalizeDocument(JSON.parse(saved) as PaperDocument)
          : fallbackDocument

        const result = await savePaper({
          paperId: paperId ?? undefined,
          title: document.title,
          subtitle: document.subtitle,
          duration: document.duration,
          documentJson: JSON.stringify(document),
        })

        if (!paperId) {
          router.replace(`/papers/${result.slug}`)
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to save paper"
        window.alert(message)
      } finally {
        setIsPending(false)
      }
    })()
  }, [paperId, router, savePaper])

  return (
    <Button onClick={handleSave} disabled={isPending}>
      {isPending ? (
        <RiLoader4Line className="size-4 animate-spin" />
      ) : (
        <RiSaveLine className="size-4" />
      )}
      {paperId ? "Save Changes" : "Save Paper"}
    </Button>
  )
}
