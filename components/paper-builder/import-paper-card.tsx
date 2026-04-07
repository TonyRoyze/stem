"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { RiFileUploadLine, RiLoader4Line } from "@remixicon/react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  normalizeDocument,
  type PaperDocument,
} from "@/lib/paper-builder"

type ImportPayload = {
  title?: string
  subtitle?: string
  duration?: string
  documentJson?: string
}

function isPaperDocument(value: unknown): value is PaperDocument {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.title === "string" &&
    typeof candidate.subtitle === "string" &&
    typeof candidate.duration === "string" &&
    typeof candidate.instructions === "string" &&
    Array.isArray(candidate.blocks)
  )
}

function parseImportValue(input: string) {
  const parsed = JSON.parse(input) as unknown

  if (typeof parsed === "string") {
    const nested = JSON.parse(parsed) as unknown

    if (!isPaperDocument(nested)) {
      throw new Error("The provided string is not a valid paper document.")
    }

    return normalizeDocument(nested)
  }

  if (isPaperDocument(parsed)) {
    return normalizeDocument(parsed)
  }

  if (parsed && typeof parsed === "object") {
    const payload = parsed as ImportPayload

    if (typeof payload.documentJson === "string") {
      const document = JSON.parse(payload.documentJson) as unknown

      if (!isPaperDocument(document)) {
        throw new Error("`documentJson` does not contain a valid paper document.")
      }

      const normalized = normalizeDocument(document)

      return {
        ...normalized,
        title: payload.title ?? normalized.title,
        subtitle: payload.subtitle ?? normalized.subtitle,
        duration: payload.duration ?? normalized.duration,
      }
    }
  }

  throw new Error(
    "Paste either a full paper object, a full saved-paper object with `documentJson`, or a raw document JSON string."
  )
}

export function ImportPaperCard() {
  const router = useRouter()
  const createPaper = useMutation(api.papers.upsert)
  const [value, setValue] = React.useState("")
  const [isPending, setIsPending] = React.useState(false)

  const handleImport = React.useCallback(() => {
    void (async () => {
      setIsPending(true)

      try {
        const document = parseImportValue(value)
        const result = await createPaper({
          title: document.title,
          subtitle: document.subtitle,
          duration: document.duration,
          documentJson: JSON.stringify(document),
        })

        router.push(`/papers/${result.slug}`)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to import paper."
        window.alert(message)
      } finally {
        setIsPending(false)
      }
    })()
  }, [createPaper, router, value])

  return (
    <Card className="rounded-[28px] border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <CardTitle className="text-xl text-slate-950">Import Paper JSON</CardTitle>
        <p className="text-sm text-slate-500">
          Paste a full saved-paper object or a raw `documentJson` payload to create
          a new paper in Convex.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="min-h-56 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 outline-none transition focus:border-emerald-500"
        />
        <Button onClick={handleImport} disabled={isPending || !value.trim()}>
          {isPending ? (
            <RiLoader4Line className="size-4 animate-spin" />
          ) : (
            <RiFileUploadLine className="size-4" />
          )}
          Import Paper
        </Button>
      </CardContent>
    </Card>
  )
}
