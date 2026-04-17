import {
  type PaperDocument,
  type QuestionBlock,
  toRoman,
} from "@/lib/paper-builder"
import { cn } from "@/lib/utils"

import { MarksTable } from "./marks-table"
import { AnswerTable, SupportingTable } from "./supporting-table"
import { AnswerLines } from "./answer-lines"
import { Diagram } from "./diagram"
import { InstructionsBox } from "./instruction-box"
import { HeaderBox } from "./header-box"
import { SubQuestionPreview } from "./subquestion"

function PreviewBlock({
  block,
  number,
  subQuestions,
}: {
  block: QuestionBlock
  number: number
  subQuestions: QuestionBlock[]
}) {
  if (block.type === "section") {
    return (
      <section className="paper-break-avoid mt-8">
        <div className="text-md border-y-2 border-black py-2 text-center font-bold tracking-[0.2em] uppercase">
          {block.title}
        </div>
        <p className="text-md mt-3 leading-7 whitespace-pre-wrap text-black">
          {block.description}
        </p>
        <Diagram src={block.diagramDataUrl} />
        <SupportingTable block={block} />
      </section>
    )
  }

  return (
    <section className="paper-break-avoid mt-7 font-newsreader">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-md leading-7 font-semibold whitespace-pre-wrap text-black">
            {number}. {block.title}
          </h3>
        </div>
        <div className="text-md shrink-0 font-medium text-black">
          [{block.points ?? 0} marks]
        </div>
      </div>

      <Diagram src={block.diagramDataUrl} />
      <SupportingTable block={block} />

      {block.type === "mcq" ? (
        (block.answerFormat ?? "lines") === "table" ? (
          <AnswerTable table={block.answerTable} />
        ) : (
          <div className="text-md mt-4 grid gap-x-6 gap-y-2 pl-2">
            {block.options.map((option, optionIndex) => (
              <div
                key={`${block.id}-${optionIndex}`}
                className="flex items-start gap-2 text-black"
              >
                <span className="mt-0.5 shrink-0 font-medium">
                  {String.fromCharCode(65 + optionIndex)}.
                </span>
                <span className="whitespace-pre-wrap">{option}</span>
              </div>
            ))}
          </div>
        )
      ) : null}

      {block.type === "short-answer" ? (
        <div className="mt-3">
          <p className="mt-2 text-xs whitespace-pre-wrap text-slate-600 italic">
            {block.placeholder}
          </p>
          {block.answerFormat === "table" ? (
            <AnswerTable table={block.answerTable} />
          ) : (
            <AnswerLines count={block.lines} />
          )}
        </div>
      ) : null}

      {subQuestions.map((sq, index) => (
        <SubQuestionPreview key={sq.id} block={sq} romanIndex={index + 1} />
      ))}
    </section>
  )
}

export function PreviewPaper({
  document,
  className,
}: {
  document: PaperDocument
  className?: string
}) {
  const topLevelBlocks = document.blocks.filter((b) => !b.parentId)
  let questionNumber = 0
  const pageCount = 4

  return (
    <article
      className={cn(
        "mx-auto w-full max-w-[205mm] bg-white p-[16mm] text-black shadow-[0_24px_60px_rgba(15,23,42,0.08)] print:max-w-none print:p-0 print:shadow-none",
        className
      )}
    >
      <div className="break-after-page">
        <HeaderBox document={document} />

        <section className="mt-6 flex justify-between gap-6 px-2">
          <InstructionsBox text={document.instructions} />
          <MarksTable document={document} />
        </section>
      </div>

      <div className="mt-6">
        {topLevelBlocks.map((block) => {
          const currentNumber =
            block.type === "section" ? questionNumber : ++questionNumber
          const subQuestions = document.blocks.filter(
            (b) => b.parentId === block.id
          )

          return (
            <PreviewBlock
              key={block.id}
              block={block}
              number={currentNumber}
              subQuestions={subQuestions}
            />
          )
        })}
      </div>

    </article>
  )
}
