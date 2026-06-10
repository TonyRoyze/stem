import type { QuestionBlock } from "@/lib/paper-builder"
import { toRoman } from "@/lib/paper-builder"
import { AnswerTable, SupportingTable } from "./supporting-table"
import { AnswerLines } from "./answer-lines"
import { Diagram } from "./diagram"

function formatInlineMarks(points?: number) {
  const value = points ?? 0

  return `(${value} ${value === 1 ? "mark" : "marks"})`
}

export function SubQuestionPreview({
  block,
  romanIndex,
}: {
  block: QuestionBlock
  romanIndex: number
}) {
  const showShortQuestionMarks = block.type === "short-answer"

  return (
    <div className="paper-break-avoid mt-4 ml-2 pl-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-2">
          <span className="font-medium text-black">
            ({toRoman(romanIndex)})
          </span>
          <h4 className="font-medium text-black">{block.title}</h4>
        </div>
        {showShortQuestionMarks ? (
          <div className="shrink-0 font-normal text-black">
            {formatInlineMarks(block.points)}
          </div>
        ) : null}
      </div>

      <Diagram src={block.diagramDataUrl} />
      <SupportingTable block={block} />

      {block.type === "short-answer" ? (
        <div className="mt-2">
          <p className="text-[10pt] whitespace-pre-wrap text-slate-600 italic">
            {block.placeholder}
          </p>
          {block.answerFormat === "table" ? (
            <AnswerTable table={block.answerTable} />
          ) : (
            <AnswerLines count={block.lines} />
          )}
        </div>
      ) : null}

      {block.type === "big-question" ? (
        <div className="mt-2">
          <p className="text-[10pt] whitespace-pre-wrap text-slate-600 italic">
            {block.description}
          </p>
        </div>
      ) : null}

      {block.type === "mcq" ? (
        (block.answerFormat ?? "lines") === "table" ? (
          <AnswerTable table={block.answerTable} />
        ) : (
          <div className="mt-3 grid gap-x-6 gap-y-2 pl-2">
            {block.options.map((option, optionIndex) => (
              <div
                key={`${block.id}-${optionIndex}`}
                className="flex items-start gap-2"
              >
                <span className="shrink-0 font-medium">
                  {String.fromCharCode(97 + optionIndex)}.
                </span>
                <span className="whitespace-pre-wrap">{option}</span>
              </div>
            ))}
          </div>
        )
      ) : null}
    </div>
  )
}
