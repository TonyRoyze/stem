import type { QuestionBlock } from "@/lib/paper-builder"
import { toRoman } from "@/lib/paper-builder"
import { AnswerTable, SupportingTable } from "./supporting-table"
import { AnswerLines } from "./answer-lines"
import { Diagram } from "./diagram"

export function SubQuestionPreview({
  block,
  romanIndex,
}: {
  block: QuestionBlock
  romanIndex: number
}) {
  return (
    <div className="mt-4 ml-2 pl-4 font-newsreader">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-2">
          <span className="text-md font-medium text-black">
            ({toRoman(romanIndex)})
          </span>
          <h4 className="text-md font-medium text-black">{block.title}</h4>
        </div>
        <div className="shrink-0 text-sm mt-0.5 font-medium text-slate-600">
          [{block.points ?? 0}]
        </div>
      </div>

      <Diagram src={block.diagramDataUrl} />
      <SupportingTable block={block} />

      {block.type === "short-answer" ? (
        <div className="mt-2">
          <p className="text-xs whitespace-pre-wrap text-slate-600 italic">
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
          <p className="text-xs whitespace-pre-wrap text-slate-600 italic">
            {block.description}
          </p>
        </div>
      ) : null}

      {block.type === "mcq" ? (
        (block.answerFormat ?? "lines") === "table" ? (
          <AnswerTable table={block.answerTable} />
        ) : (
          <div className="text-md mt-3 grid gap-x-6 gap-y-2 pl-2">
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