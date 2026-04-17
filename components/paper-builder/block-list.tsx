"use client"

import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiFileTextLine,
  RiLayoutTopLine,
  RiQuestionAnswerLine,
} from "@remixicon/react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { insertActions } from "./block-actions"
import type { PaperDocument, QuestionBlock } from "@/lib/paper-builder"
import { cloneBlock, toRoman } from "@/lib/paper-builder"
import { BuilderCard } from "./builder-card"



interface BlockListProps {
  document: PaperDocument
  selectedBlockId: string | null
  onSelectBlock: (id: string) => void
  onUpdateBlock: (block: QuestionBlock) => void
  onUpdateDocument: (document: PaperDocument) => void
  onAddBlock: (
    type: (typeof insertActions)[number]["type"],
    afterId?: string,
    parentId?: string
  ) => void
  onMoveBlock: (blockId: string, direction: "up" | "down") => void
  onMoveSubQuestion: (
    parentId: string,
    subQuestionId: string,
    direction: "up" | "down"
  ) => void
}

export function BlockList({
  document,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateDocument,
  onAddBlock,
  onMoveBlock,
  onMoveSubQuestion,
}: BlockListProps) {
  const topLevelBlocks = document.blocks.filter((b) => !b.parentId)
  const topLevelCount = topLevelBlocks.length

  let questionCount = 0

  return (
    <Accordion className="space-y-3">
      {topLevelBlocks.map((block, blockIndex) => {
        const visibleQuestionIndex =
          block.type === "section" ? 0 : ++questionCount
        const subQuestions = document.blocks.filter(
          (b) => b.parentId === block.id
        )

        return (
          <AccordionItem key={block.id} value={block.id}>
            <div className="flex items-center gap-2 rounded-t-xl border border-slate-200 bg-white px-4 py-3">
              <AccordionTrigger className="flex-1 text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    {block.type === "section"
                      ? "Section"
                      : `Q${visibleQuestionIndex}`}
                  </span>
                  <span className="line-clamp-1 text-sm font-medium text-slate-700">
                    {block.title || "Untitled"}
                  </span>
                </div>
              </AccordionTrigger>
              {block.type !== "section" && (
                <span className="mr-2 text-xs text-slate-500">
                  {block.points ?? 0} pts
                </span>
              )}
              {subQuestions.length > 0 && (
                <span className="mr-2 rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  {subQuestions.length} sub
                </span>
              )}
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveBlock(block.id, "up")
                  }}
                  disabled={blockIndex === 0}
                >
                  <RiArrowUpLine className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveBlock(block.id, "down")
                  }}
                  disabled={blockIndex >= topLevelCount - 1}
                >
                  <RiArrowDownLine className="size-4" />
                </Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateDocument({
                      ...document,
                      blocks: document.blocks.flatMap((currentBlock) =>
                        currentBlock.id === block.id
                          ? [currentBlock, cloneBlock(currentBlock)]
                          : [currentBlock]
                      ),
                    })
                  }}
                >
                  <RiFileCopyLine className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdateDocument({
                      ...document,
                      blocks: document.blocks.filter(
                        (currentBlock) =>
                          currentBlock.id !== block.id &&
                          currentBlock.parentId !== block.id
                      ),
                    })
                  }}
                >
                  <RiDeleteBinLine className="size-4 text-red-500" />
                </Button>
              </ButtonGroup>
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddBlock("section", block.id)
                  }}
                  title="Add Section"
                >
                  <RiLayoutTopLine className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddBlock("mcq", block.id)
                  }}
                  title="Add MCQ"
                >
                  <RiCheckboxCircleLine className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddBlock("short-answer", block.id)
                  }}
                  title="Add Short Answer"
                >
                  <RiQuestionAnswerLine className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddBlock("big-question", block.id)
                  }}
                  title="Add Big Question"
                >
                  <RiFileTextLine className="size-4" />
                </Button>
              </ButtonGroup>
            </div>
            <AccordionContent>
              <div className="rounded-b-xl border border-t-0 border-slate-200 bg-white px-5 pt-4 pb-5">
                <BuilderCard
                  block={block}
                  selected={selectedBlockId === block.id}
                  index={visibleQuestionIndex}
                  onSelect={() => onSelectBlock(block.id)}
                  onChange={onUpdateBlock}
                />

                {block.type === "big-question" && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium tracking-wide text-slate-600 uppercase">
                        Sub-questions
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddBlock("mcq", block.id, block.id)}
                          className="h-7 border-emerald-200 text-xs text-emerald-600 hover:bg-emerald-50"
                        >
                          <RiCheckboxCircleLine className="size-3" />
                          MCQ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onAddBlock("short-answer", block.id, block.id)
                          }
                          className="h-7 border-emerald-200 text-xs text-emerald-600 hover:bg-emerald-50"
                        >
                          <RiQuestionAnswerLine className="size-3" />
                          Short
                        </Button>
                      </div>
                    </div>

                    {subQuestions.length > 0 ? (
                      <Accordion className="space-y-2">
                        {subQuestions.map((sq, sqIndex) => (
                          <AccordionItem
                            key={sq.id}
                            value={sq.id}
                            className="rounded-xl border border-slate-200 bg-white"
                          >
                            <div className="flex items-center gap-2 px-4 py-3">
                              <AccordionTrigger className="flex-1 text-left hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                    ({toRoman(sqIndex + 1)})
                                  </span>
                                  <span className="line-clamp-1 text-sm text-slate-600">
                                    {sq.title || "Untitled sub-question"}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    {sq.points ?? 1} pts
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <ButtonGroup>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMoveSubQuestion(block.id, sq.id, "up")
                                }}
                                disabled={sqIndex === 0}
                              >
                                <RiArrowUpLine className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMoveSubQuestion(block.id, sq.id, "down")
                                }}
                                disabled={sqIndex >= subQuestions.length - 1}
                              >
                                <RiArrowDownLine className="size-4" />
                              </Button>
                              </ButtonGroup>
                              <ButtonGroup>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onUpdateDocument({
                                    ...document,
                                    blocks: document.blocks.flatMap((b) =>
                                      b.id === sq.id ? [b, cloneBlock(b)] : [b]
                                    ),
                                  })
                                }}
                              >
                                <RiFileCopyLine className="size-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onUpdateDocument({
                                    ...document,
                                    blocks: document.blocks.filter(
                                      (b) => b.id !== sq.id
                                    ),
                                  })
                                }}
                              >
                                <RiDeleteBinLine className="size-4 text-red-500" />
                              </Button>
                              </ButtonGroup>
                            </div>
                            <AccordionContent>
                              <div className="px-4 pb-4">
                                <BuilderCard
                                  block={sq}
                                  selected={selectedBlockId === sq.id}
                                  index={sqIndex + 1}
                                  onSelect={() => onSelectBlock(sq.id)}
                                  onChange={(updatedBlock) => {
                                    onUpdateDocument({
                                      ...document,
                                      blocks: document.blocks.map((b) =>
                                        b.id === sq.id ? updatedBlock : b
                                      ),
                                    })
                                  }}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-xs text-slate-400">
                        No sub-questions yet. Click "MCQ" or "Short" to add one.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
