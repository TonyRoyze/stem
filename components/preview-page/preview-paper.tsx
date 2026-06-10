import { type PaperDocument, type QuestionBlock } from "@/lib/paper-builder"
import { cn } from "@/lib/utils"

import { MarksTable } from "./marks-table"
import { AnswerTable, SupportingTable } from "./supporting-table"
import { AnswerLines } from "./answer-lines"
import { Diagram } from "./diagram"
import { InstructionsBox } from "./instruction-box"
import { HeaderBox } from "./header-box"
import { SubQuestionPreview } from "./subquestion"

function getTotalMarks(blocks: QuestionBlock[]) {
  return blocks.reduce((sum, block) => {
    if (block.type === "section" || block.parentId) {
      return sum
    }

    return sum + (block.points ?? 0)
  }, 0)
}

function getPaperTypography(): React.CSSProperties {
  return {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: "12pt",
    lineHeight: 1.15,
  }
}

function getQuestionTotal(block: QuestionBlock, subQuestions: QuestionBlock[]) {
  const subQuestionTotal = subQuestions.reduce(
    (sum, subQuestion) => sum + (subQuestion.points ?? 0),
    0
  )

  return subQuestionTotal || block.points || 0
}

function formatTotalLine(block: QuestionBlock, subQuestions: QuestionBlock[]) {
  const total = getQuestionTotal(block, subQuestions)
  const pointValues = subQuestions
    .map((subQuestion) => subQuestion.points ?? 0)
    .filter((points) => points > 0)
  const hasOnlyMcqSubQuestions =
    subQuestions.length > 0 &&
    subQuestions.every((subQuestion) => subQuestion.type === "mcq")
  const hasUniformPoints =
    pointValues.length === subQuestions.length &&
    pointValues.every((points) => points === pointValues[0])

  if (hasOnlyMcqSubQuestions && hasUniformPoints) {
    return `[Total = ${subQuestions.length}×${pointValues[0]} = ${total} Marks]`
  }

  return `[Total = ${total} Marks]`
}

function formatInlineMarks(points?: number) {
  const value = points ?? 0

  return `(${value} ${value === 1 ? "mark" : "marks"})`
}

function PreviewBlock({
  block,
  number,
  subQuestions,
}: {
  block: QuestionBlock
  number: number
  subQuestions: QuestionBlock[]
}) {
  const showShortQuestionMarks = block.type === "short-answer"

  if (block.type === "section") {
    return (
      <section className="paper-break-avoid mt-6">
        <div className="border-y-2 border-black py-1.5 text-center font-bold uppercase">
          {block.title}
        </div>
        <p className="mt-3 whitespace-pre-wrap text-black">
          {block.description}
        </p>
        <Diagram src={block.diagramDataUrl} />
        <SupportingTable block={block} />
      </section>
    )
  }

  return (
    <section className="paper-break-avoid mt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold whitespace-pre-wrap text-black">
            {number}. {block.title}
          </h3>
        </div>
        {showShortQuestionMarks ? (
          <div className="shrink-0 font-normal text-black">
            {formatInlineMarks(block.points)}
          </div>
        ) : null}
      </div>

      <Diagram src={block.diagramDataUrl} />
      <SupportingTable block={block} />

      {block.type === "mcq" ? (
        (block.answerFormat ?? "lines") === "table" ? (
          <AnswerTable table={block.answerTable} />
        ) : (
          <div className="mt-4 grid gap-x-6 gap-y-2 pl-2">
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
          <p className="mt-2 text-[10pt] whitespace-pre-wrap text-slate-600 italic">
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

      <div className="mt-3 text-right font-medium">
        {formatTotalLine(block, subQuestions)}
      </div>
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
  const totalMarks = getTotalMarks(document.blocks)

  return (
    <article
      className={cn(
        "mx-auto w-full max-w-[210mm] bg-white px-[25.4mm] pt-[25.4mm] pb-[22mm] text-black shadow-[0_24px_60px_rgba(15,23,42,0.08)] print:max-w-none print:p-0 print:shadow-none",
        className
      )}
      style={getPaperTypography()}
    >
      <div className="paper-cover-page break-after-page">
        <HeaderBox document={document} />

        <section className="mt-6 flex justify-between gap-6 px-2">
          <InstructionsBox text={document.instructions} />
          <MarksTable document={document} />
        </section>

        <footer className="mt-12 text-center text-[11pt] print:hidden">
          Total number of pages: This document consists of printed pages.
        </footer>
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

      {/*<footer className="preview-paper-footer paper-break-avoid mt-12 border-t border-black pt-2 text-center text-[10pt]">
        Royal Institute International School
      </footer>*/}
    </article>
  )
}
