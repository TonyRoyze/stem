import type { BlockTable, PaperDocument, QuestionBlock } from "@/lib/paper-builder"
import { cn } from "@/lib/utils"

function AnswerLines({ count }: { count: number }) {
  return (
    <div className="mt-3 space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-6 border-b border-slate-400" />
      ))}
    </div>
  )
}

function SupportingTable({
  block,
}: {
  block: QuestionBlock
}) {
  if (!block.table) {
    return null
  }

  return (
    <div className="mt-4 overflow-hidden border border-slate-400">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {block.table.headers.map((header, index) => (
              <th
                key={`${block.id}-header-${index}`}
                className="border border-slate-400 px-3 py-2 text-left font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, rowIndex) => (
            <tr key={`${block.id}-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`${block.id}-cell-${rowIndex}-${cellIndex}`}
                  className="border border-slate-300 px-3 py-2 align-top"
                >
                  {cell || "\u00A0"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Diagram({
  src,
}: {
  src?: string | null
}) {
  if (!src) {
    return null
  }

  return (
    <div className="mt-4">
      <img
        src={src}
        alt="Question diagram"
        className="max-h-[90mm] max-w-full border border-slate-300 object-contain"
      />
    </div>
  )
}

function AnswerTable({
  table,
}: {
  table: BlockTable | null | undefined
}) {
  if (!table) {
    return null
  }

  return (
    <div className="mt-4 overflow-hidden border border-slate-400">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {table.headers.map((header, index) => (
              <th
                key={`answer-header-${index}`}
                className="border border-slate-400 px-3 py-2 text-left font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`answer-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td
                  key={`answer-${rowIndex}-${cellIndex}`}
                  className="border border-slate-300 px-3 py-3"
                >
                  {cell || "\u00A0"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PreviewBlock({
  block,
  number,
}: {
  block: QuestionBlock
  number: number
}) {
  if (block.type === "section") {
    return (
      <section className="paper-break-avoid mt-8">
        <div className="border-y border-slate-900 py-2 text-center text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">
          {block.title}
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-700">{block.description}</p>
        <Diagram src={block.diagramDataUrl} />
        <SupportingTable block={block} />
      </section>
    )
  }

  return (
    <section className="paper-break-avoid mt-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium leading-7 text-slate-950">
            {number}. {block.title}
          </h3>
        </div>
        <div className="shrink-0 text-sm text-slate-700">[{block.points ?? 0} marks]</div>
      </div>

      <Diagram src={block.diagramDataUrl} />
      <SupportingTable block={block} />

      {block.type === "mcq" ? (
        (block.answerFormat ?? "lines") === "table" ? (
          <AnswerTable table={block.answerTable} />
        ) : (
          <div className="mt-4 space-y-3 pl-2">
            {block.options.map((option, optionIndex) => (
              <div key={`${block.id}-${optionIndex}`} className="flex items-start gap-3 text-sm text-slate-800">
                <span className="mt-0.5 inline-flex size-4 items-center justify-center rounded-full border border-slate-700" />
                <span>{option}</span>
              </div>
            ))}
          </div>
        )
      ) : null}

      {block.type === "short-answer" ? (
        <div className="mt-3">
          <p className="text-sm italic text-slate-600">{block.placeholder}</p>
          {block.answerFormat === "table" ? (
            <AnswerTable table={block.answerTable} />
          ) : (
            <AnswerLines count={block.lines} />
          )}
        </div>
      ) : null}

      {block.type === "long-answer" ? (
        <div className="mt-3">
          <p className="text-sm italic text-slate-600">{block.guidance}</p>
          {block.answerFormat === "table" ? (
            <AnswerTable table={block.answerTable} />
          ) : (
            <AnswerLines count={block.lines} />
          )}
        </div>
      ) : null}
    </section>
  )
}

export function PreviewDocument({
  document,
  className,
}: {
  document: PaperDocument
  className?: string
}) {
  let questionNumber = 0
  const questionCount = document.blocks.filter((block) => block.type !== "section").length

  return (
    <article
      className={cn(
        "mx-auto w-full max-w-[210mm] bg-white p-[14mm] text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.08)] print:max-w-none print:p-0 print:shadow-none",
        className
      )}
    >
      <header className="border border-slate-900 p-5">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.26em] text-slate-700">
            Examination Paper
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{document.title}</h1>
          <p className="mt-2 text-sm text-slate-700">{document.subtitle}</p>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-300 pt-4 text-sm">
          <div>
            <span className="font-medium">Duration:</span> {document.duration}
          </div>
          {/* <div>
            <span className="font-medium">Total Questions:</span> {questionCount}
          </div> */}
          <div>
            <span className="font-medium">Candidate No:</span>
            <span className="ml-2 inline-block min-w-28 border-b border-slate-500" />
          </div>
          <div>
            <span className="font-medium">Name:</span>
            <span className="ml-2 inline-block min-w-[85%] border-b border-slate-500" />
          </div>
          <div>
            <span className="font-medium">Class:</span>
            <span className="ml-2 inline-block min-w-[85%] border-b border-slate-500" />
          </div>
        </div>
      </header>

      <section className="mt-6 border border-slate-300 bg-slate-50 px-4 py-3">
        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-800">
          Instructions
        </div>
        <p className="mt-2 text-sm leading-7 text-slate-700">{document.instructions}</p>
      </section>

      <div className="mt-6">
        {document.blocks.map((block) => {
          const currentNumber =
            block.type === "section" ? questionNumber : ++questionNumber

          return <PreviewBlock key={block.id} block={block} number={currentNumber} />
        })}
      </div>
    </article>
  )
}
