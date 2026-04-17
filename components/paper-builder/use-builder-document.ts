import * as React from "react"
import {
  STORAGE_KEY,
  createDefaultPaper,
  normalizeDocument,
  type PaperDocument,
} from "@/lib/paper-builder"

export function useBuilderDocument() {
  const [document, setDocument] = React.useState<PaperDocument | null>(null)

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      const initial = createDefaultPaper()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      setDocument(initial)
      return
    }

    try {
      setDocument(normalizeDocument(JSON.parse(saved) as PaperDocument))
    } catch {
      const fallback = createDefaultPaper()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      setDocument(fallback)
    }
  }, [])

  React.useEffect(() => {
    if (!document) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
  }, [document])

  return [document, setDocument] as const
}
