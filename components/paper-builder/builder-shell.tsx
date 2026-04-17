"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"

import { useBuilderDocument } from "./use-builder-document"
import { insertActions } from "./block-actions"
import { BlockList } from "./block-list"
import type {
  PaperDocument,
  QuestionBlock,
  QuestionBlockType,
} from "@/lib/paper-builder"
import { createBlock } from "@/lib/paper-builder"
import { cn } from "@/lib/utils"

import { BuilderHeader } from "./builder-header"

type BuilderShellProps = {
  className?: string
  showHeaderActions?: boolean
}

export function BuilderShell({
  className,
  showHeaderActions = true,
}: BuilderShellProps) {
  const [document, setDocument] = useBuilderDocument()
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(
    null
  )
  const [importJson, setImportJson] = React.useState("")

  React.useEffect(() => {
    if (!document || selectedBlockId) return
    setSelectedBlockId(document.blocks[0]?.id ?? null)
  }, [document, selectedBlockId])

  React.useEffect(() => {
    if (!document) return
    if (document.blocks.length === 0 && selectedBlockId !== null) {
      setSelectedBlockId(null)
    }
  }, [document, selectedBlockId])

  const updateDocument = React.useCallback(
    (updater: (current: PaperDocument) => PaperDocument) => {
      setDocument((current) => (current ? updater(current) : current))
    },
    [setDocument]
  )

  const addBlock = React.useCallback(
    (type: QuestionBlockType, afterId?: string, parentId?: string) => {
      updateDocument((current) => {
        const newBlock = createBlock(type)
        if (parentId) {
          newBlock.parentId = parentId
        }
        setSelectedBlockId(newBlock.id)

        if (!afterId) {
          return { ...current, blocks: [...current.blocks, newBlock] }
        }

        const index = current.blocks.findIndex((block) => block.id === afterId)
        if (index === -1) {
          return { ...current, blocks: [...current.blocks, newBlock] }
        }

        const nextBlocks = [...current.blocks]
        nextBlocks.splice(index + 1, 0, newBlock)
        return { ...current, blocks: nextBlocks }
      })
    },
    [updateDocument]
  )

  const moveBlock = React.useCallback(
    (blockId: string, direction: "up" | "down") => {
      updateDocument((current) => {
        const index = current.blocks.findIndex((block) => block.id === blockId)
        if (index === -1) return current

        const targetIndex = direction === "up" ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= current.blocks.length)
          return current

        const nextBlocks = [...current.blocks]
        const [movedBlock] = nextBlocks.splice(index, 1)
        nextBlocks.splice(targetIndex, 0, movedBlock)
        setSelectedBlockId(blockId)

        return { ...current, blocks: nextBlocks }
      })
    },
    [updateDocument]
  )

  const moveSubQuestion = React.useCallback(
    (parentId: string, subQuestionId: string, direction: "up" | "down") => {
      updateDocument((current) => {
        const subQuestions = current.blocks.filter(
          (b) => b.parentId === parentId
        )
        const currentIndex = subQuestions.findIndex(
          (b) => b.id === subQuestionId
        )
        if (currentIndex === -1) return current

        const targetIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1
        if (targetIndex < 0 || targetIndex >= subQuestions.length)
          return current

        const nextBlocks = [...current.blocks]
        const currentSubIndex = nextBlocks.findIndex(
          (b) => b.id === subQuestionId
        )
        if (currentSubIndex === -1) return current

        const [movedBlock] = nextBlocks.splice(currentSubIndex, 1)
        const newSubIndex = nextBlocks.findIndex(
          (b) => b.id === subQuestions[targetIndex].id
        )
        nextBlocks.splice(newSubIndex, 0, movedBlock)

        return { ...current, blocks: nextBlocks }
      })
    },
    [updateDocument]
  )

  const updateBlock = React.useCallback(
    (block: QuestionBlock) => {
      if (!document) return
      setDocument({
        ...document,
        blocks: document.blocks.map((currentBlock) =>
          currentBlock.id === block.id ? block : currentBlock
        ),
      })
    },
    [document, setDocument]
  )

  if (!document) {
    return null
  }

  return (
    <div className={cn("min-h-full", className)}>
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
        <section className="min-w-0 flex-1">
          <BuilderHeader
            document={document}
            setDocument={setDocument}
            showHeaderActions={showHeaderActions}
            importJson={importJson}
            setImportJson={setImportJson}
          />

          <div className="mt-8 grid gap-6">
            <div className="min-w-0">
              <div className="space-y-5">
                {document.blocks.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="mx-auto max-w-xl">
                      <div className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
                        Empty Canvas
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                        Add your first block
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        Start with a section heading, a multiple choice
                        question, or a written-response block.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      {insertActions.map((action) => (
                        <Button
                          key={`empty-${action.type}`}
                          variant="outline"
                          onClick={() => addBlock(action.type)}
                        >
                          <action.icon className="size-4" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mb-4 flex items-center gap-2">
                  <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    Blocks
                  </span>
                  <div className="flex gap-1">
                    {insertActions.map((action) => (
                      <Button
                        key={`add-${action.type}`}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => addBlock(action.type)}
                      >
                        <action.icon className="size-3" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <BlockList
                  document={document}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onUpdateBlock={updateBlock}
                  onUpdateDocument={setDocument}
                  onAddBlock={addBlock}
                  onMoveBlock={moveBlock}
                  onMoveSubQuestion={moveSubQuestion}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
