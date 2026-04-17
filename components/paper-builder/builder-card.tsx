"use client"

import * as React from "react"
import { RiAddLine, RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type {
  QuestionBlock,
  McqBlock,
  ShortAnswerBlock,
  BigQuestionBlock,
} from "@/lib/paper-builder"
import { DiagramField } from "./diagram-field"
import { TableEditor, AnswerTableEditor } from "./table-editor"

interface BuilderCardProps {
  block: QuestionBlock
  selected: boolean
  index: number
  onSelect: () => void
  onChange: (block: QuestionBlock) => void
}

export function BuilderCard({
  block,
  selected,
  index,
  onSelect,
  onChange,
}: BuilderCardProps) {
  const [showMarkingDetails, setShowMarkingDetails] = React.useState(false)
  const cardClassName = cn(
    "overflow-hidden rounded-2xl border bg-white shadow-sm transition-all",
    selected ? "border-emerald-500" : "border-slate-200 hover:border-slate-300"
  )

  if (block.type === "section") {
    return (
      <Card className={cardClassName} onClick={onSelect}>
        <CardContent className="px-4 py-4">
          <Input
            value={block.title}
            onChange={(event) =>
              onChange({ ...block, title: event.target.value })
            }
            className="h-10 rounded-xl border-slate-200 text-base font-semibold"
            placeholder="Section title"
          />
          <textarea
            value={block.description}
            onChange={(event) =>
              onChange({ ...block, description: event.target.value })
            }
            className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition outline-none focus:border-emerald-500"
            placeholder="Add instructions for this section"
          />
          <div className="mt-3 grid gap-3">
            <DiagramField
              value={block.diagramDataUrl}
              onChange={(diagramDataUrl) =>
                onChange({ ...block, diagramDataUrl })
              }
            />
            <TableEditor
              table={block.table}
              onChange={(table) => onChange({ ...block, table })}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cardClassName} onClick={onSelect}>
      <CardContent className="space-y-4 px-4 py-4">
        <Input
          value={block.title}
          onChange={(event) =>
            onChange({ ...block, title: event.target.value } as QuestionBlock)
          }
          className="h-10 rounded-xl border-slate-200 text-base font-semibold"
          placeholder="Type your question"
        />
        <DiagramField
          value={block.diagramDataUrl}
          onChange={(diagramDataUrl) =>
            onChange({ ...block, diagramDataUrl } as QuestionBlock)
          }
        />

        <TableEditor
          table={block.table}
          onChange={(table) => onChange({ ...block, table } as QuestionBlock)}
        />

        {block.type === "mcq" ? (
          <div className="space-y-4">
            <AnswerTableEditor
              format={block.answerFormat ?? "lines"}
              table={block.answerTable}
              onFormatChange={(answerFormat) =>
                onChange({
                  ...block,
                  answerFormat: answerFormat as "lines" | "table",
                })
              }
              onTableChange={(answerTable) =>
                onChange({ ...block, answerTable })
              }
            />
            {(block.answerFormat ?? "lines") === "lines" ? (
              <div className="space-y-3">
                {block.options.map((option, optionIndex) => (
                  <div
                    key={`${block.id}-${optionIndex}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <div className="size-4 rounded-full border border-slate-400" />
                    <Input
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...block.options]
                        nextOptions[optionIndex] = event.target.value
                        onChange({ ...block, options: nextOptions })
                      }}
                      className="border-0 px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...block,
                      options: [...block.options, "New option"],
                    })
                  }
                >
                  <RiAddLine className="size-4" />
                  Add option
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {block.type === "short-answer" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <textarea
                value={block.placeholder}
                onChange={(event) =>
                  onChange({ ...block, placeholder: event.target.value })
                }
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition outline-none focus:border-emerald-500"
                placeholder="Student guidance"
              />
              <label className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
                Answer lines
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={block.lines}
                  onChange={(event) =>
                    onChange({
                      ...block,
                      lines: Number(event.target.value),
                    })
                  }
                  className="mt-2 border-0 px-0 shadow-none focus-visible:ring-0"
                />
              </label>
            </div>
            <AnswerTableEditor
              format={block.answerFormat ?? "lines"}
              table={block.answerTable}
              onFormatChange={(answerFormat) =>
                onChange({
                  ...block,
                  answerFormat: answerFormat as "lines" | "table",
                })
              }
              onTableChange={(answerTable) =>
                onChange({ ...block, answerTable })
              }
            />
          </div>
        ) : null}

        {block.type === "big-question" ? (
          <div className="space-y-4">
            <textarea
              value={block.description}
              onChange={(event) =>
                onChange({ ...block, description: event.target.value })
              }
              className="min-h-20 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition outline-none focus:border-emerald-500"
              placeholder="Question description or context"
            />
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setShowMarkingDetails(!showMarkingDetails)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <span>Marking Details</span>
            {showMarkingDetails ? (
              <RiArrowUpSLine className="size-4" />
            ) : (
              <RiArrowDownSLine className="size-4" />
            )}
          </button>
          {showMarkingDetails && (
            <div className="space-y-4 border-t border-slate-200 px-4 py-4">
              {block.type === "mcq" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Correct Answer
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(block as McqBlock).options.map((option, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...block,
                            correctAnswer: idx,
                          } as QuestionBlock)
                        }
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-sm transition",
                          (block as McqBlock).correctAnswer === idx
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {option || `Option ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Marking Instructions
                </label>
                <textarea
                  value={
                    block.type === "mcq"
                      ? ((block as McqBlock).markingInstructions ?? "")
                      : block.type === "short-answer"
                        ? ((block as ShortAnswerBlock).markingInstructions ??
                          "")
                        : ((block as BigQuestionBlock).markingInstructions ??
                          "")
                  }
                  onChange={(event) => {
                    if (block.type === "mcq") {
                      onChange({
                        ...block,
                        markingInstructions: event.target.value,
                      } as QuestionBlock)
                    } else if (block.type === "short-answer") {
                      onChange({
                        ...block,
                        markingInstructions: event.target.value,
                      } as QuestionBlock)
                    } else {
                      onChange({
                        ...block,
                        markingInstructions: event.target.value,
                      } as QuestionBlock)
                    }
                  }}
                  className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition outline-none focus:border-emerald-500"
                  placeholder="Add specific marking criteria or instructions for graders"
                />
              </div>

              {block.type === "short-answer" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Model Answer
                  </label>
                  <textarea
                    value={(block as ShortAnswerBlock).answer ?? ""}
                    onChange={(event) =>
                      onChange({
                        ...block,
                        answer: event.target.value,
                      } as QuestionBlock)
                    }
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition outline-none focus:border-emerald-500"
                    placeholder="Enter the model answer for this question"
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-5 justify-between px-5">
        <div className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
          {block.type === "mcq"
            ? "Multiple Choice"
            : block.type === "short-answer"
              ? "Short Answer"
              : "Big Question"}
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
          <span>Points</span>
          <Input
            type="number"
            min={0}
            value={block.points ?? 0}
            onChange={(event) =>
              onChange({
                ...block,
                points: Number(event.target.value),
              } as QuestionBlock)
            }
            className="h-auto w-16 border-0 bg-transparent px-0 text-right shadow-none focus-visible:ring-0"
          />
        </label>
      </CardFooter>
    </Card>
  )
}
