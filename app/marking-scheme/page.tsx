"use client"

import * as React from "react"
import {
  STORAGE_KEY,
  normalizeDocument,
  type PaperDocument,
  type McqBlock,
  type ShortAnswerBlock,
  toRoman,
} from "@/lib/paper-builder"
import { ExportMarkingSchemeButton } from "@/components/paper-builder/buttons/export-marking-scheme-button"

function useDocument() {
  const [document, setDocument] = React.useState<PaperDocument | null>(null)

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setDocument(normalizeDocument(JSON.parse(saved) as PaperDocument))
      } catch {
        setDocument(null)
      }
    }
  }, [])

  return document
}

function MarkingSchemePreview({ document }: { document: PaperDocument }) {
  const topLevelBlocks = document.blocks.filter((b) => !b.parentId)
  let questionNumber = 0

  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white p-[16mm] font-work-sans print:max-w-none print:p-0">
      <header className="mb-8 text-center">
        <h1 className="text-xl font-bold">{document.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{document.subtitle}</p>
        <h2 className="mt-4 text-lg font-semibold">Marking Scheme</h2>
      </header>

      <table className="w-full border-collapse border text-xs">
        <thead>
          <tr className="border bg-slate-100">
            <th className="w-16 border px-3 py-2 text-left font-semibold">
              Q.No
            </th>
            <th className="border px-3 py-2 text-left font-semibold">
              Answer / Explanation
            </th>
            <th className="w-40 border px-3 py-2 text-left font-semibold">
              Marking Instructions
            </th>
            <th className="w-16 border px-3 py-2 text-center font-semibold">
              Marks
            </th>
          </tr>
        </thead>
        <tbody>
          {topLevelBlocks.map((block) => {
            if (block.type === "section") {
              return (
                <tr key={block.id} className="border bg-slate-50">
                  <td
                    colSpan={4}
                    className="border px-3 py-2 font-bold italic"
                  >
                    {block.title}
                  </td>
                </tr>
              )
            }

            const currentNumber = ++questionNumber
            const subQuestions = document.blocks.filter(
              (b) => b.parentId === block.id
            )

            return (
              <React.Fragment key={block.id}>
                <tr className="border">
                  <td className="border px-3 py-2 align-top font-medium">
                    {currentNumber}
                  </td>
                  <td className="border px-3 py-2 align-top">
                    <div className="space-y-2">
                      <p className="font-medium">{block.title}</p>
                      {block.type === "mcq" && (
                        <p className="text-slate-600">
                          {block.correctAnswer !== undefined && (
                            <span className="ml-2 font-medium text-black">
                              {block.options[block.correctAnswer]}
                            </span>
                          )}
                        </p>
                      )}
                      {block.type === "short-answer" && (
                        <p className="font-medium text-black">
                          {block.answer}
                        </p>
                      )}
                      {block.type === "big-question" && (
                        <p className="text-slate-600 italic">
                          {block.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="border px-3 py-2 align-top">
                    <div className="space-y-1 text-slate-600">
                      <p>{block.markingInstructions}</p>
                    </div>
                  </td>
                  <td className="border px-3 py-2 text-center align-top font-medium">
                    {block.points ?? 0}
                  </td>
                </tr>

                {subQuestions.map((sq, sqIndex) => (
                  <tr key={sq.id} className="border bg-slate-50/50">
                    <td className="border px-3 py-2 align-top text-slate-500">
                      {toRoman(sqIndex + 1)})
                    </td>
                    <td className="border px-3 py-2 align-top">
                      <p className=" text-slate-500">{sq.title}</p>
                      {sq.type === "mcq" && (
                        <p className="text-slate-600">
                          {sq.correctAnswer !== undefined && (
                            <span className="ml-2 font-medium text-black">
                              {sq.options[sq.correctAnswer]}
                            </span>
                          )}
                        </p>
                      )}
                      {sq.type === "short-answer" &&
                        (sq as ShortAnswerBlock).answer && (
                          <p className="mt-1 text-xs font-medium text-black whitespace-pre-line">
                            {(sq as ShortAnswerBlock).answer}
                          </p>
                        )}
                    </td>
                    <td className="border px-3 py-2 align-top">
                      <div className="space-y-1">
                        <p>
                          {(sq as McqBlock).markingInstructions}
                        </p>

                      </div>
                    </td>
                    <td className="border px-3 py-2 text-center align-top font-medium">
                      {sq.points ?? 1}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            )
          })}

          <tr className="border bg-slate-100 font-semibold">
            <td colSpan={3} className="border px-3 py-2 text-right">
              Total Marks
            </td>
            <td className="border px-3 py-2 text-center">
              {topLevelBlocks.reduce((sum, block) => {
                if (block.type === "section") return sum
                return sum + (block.points ?? 0)
              }, 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </article>
  )
}

export default function MarkingSchemePage() {
  const document = useDocument()

  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading marking scheme...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef2f7_0%,#ffffff_100%)] px-4 py-8 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto mb-6 flex w-full max-w-[210mm] items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">
            Marking Scheme Preview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Preview the marking scheme for this exam paper.
          </p>
        </div>
        <ExportMarkingSchemeButton>
          Download Marking Scheme
        </ExportMarkingSchemeButton>
      </div>

      <div className="mx-auto w-full max-w-[210mm]">
        <MarkingSchemePreview document={document} />
      </div>
    </main>
  )
}
