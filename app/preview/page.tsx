"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"

import { ExportQuestionPaperButton } from "@/components/paper-builder/buttons/export-question-paper-button"
import { PreviewPaper } from "@/components/preview-page/preview-paper"
import {
  STORAGE_KEY,
  createDefaultPaper,
  type PaperDocument,
} from "@/lib/paper-builder"

function PreviewContent() {
  const searchParams = useSearchParams()
  const [paperDocument, setPaperDocument] =
    React.useState<PaperDocument | null>(null)

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      setPaperDocument(createDefaultPaper())
      return
    }

    try {
      setPaperDocument(JSON.parse(saved) as PaperDocument)
    } catch {
      setPaperDocument(createDefaultPaper())
    }
  }, [])

  React.useEffect(() => {
    if (!paperDocument || searchParams.get("print") !== "1") {
      return
    }

    const timeout = window.setTimeout(() => {
      const button = document.querySelector<HTMLButtonElement>(
        "[data-export-pdf-trigger]"
      )
      button?.click()
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [paperDocument, searchParams])

  if (!paperDocument) {
    return null
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f7_0%,#ffffff_100%)] px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[210mm] items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">PDF Preview</h1>
          <p className="mt-1 text-sm text-slate-500">
            This route is clean on purpose so it can be printed or captured as a
            PDF.
          </p>
        </div>
        <ExportQuestionPaperButton data-export-pdf-trigger>
          Download PDF
        </ExportQuestionPaperButton>
      </div>

      <div className="preview-pages relative mx-auto w-full max-w-[210mm] print:max-w-none">
        <div className="preview-page-guides pointer-events-none absolute inset-0 hidden md:block print:hidden" />
        <PreviewPaper document={paperDocument} className="relative z-10" />
      </div>
    </main>
  )
}

export default function PreviewPage() {
  return (
    <React.Suspense fallback={null}>
      <PreviewContent />
    </React.Suspense>
  )
}
