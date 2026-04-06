"use client"

import * as React from "react"
import {
  RiAddLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiCheckboxCircleLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiFileCopyLine,
  RiFileDownloadLine,
  RiFileTextLine,
  RiImageAddLine,
  RiLayoutTopLine,
  RiQuestionAnswerLine,
  RiSparkling2Line,
  RiTableLine,
} from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ExportPdfButton } from "@/components/paper-builder/export-pdf-button"

import {
  type BlockTable,
  STORAGE_KEY,
  cloneBlock,
  createBlock,
  createDefaultPaper,
  normalizeDocument,
  type AnswerFormat,
  type PaperDocument,
  type QuestionBlock,
  type QuestionBlockType,
} from "@/lib/paper-builder"
import { cn } from "@/lib/utils"

const insertActions: Array<{
  type: QuestionBlockType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
    { type: "section", label: "Section", icon: RiLayoutTopLine },
    { type: "mcq", label: "MCQ", icon: RiCheckboxCircleLine },
    { type: "short-answer", label: "Short answer", icon: RiQuestionAnswerLine },
    { type: "long-answer", label: "Long answer", icon: RiFileTextLine },
  ]

function useBuilderDocument() {
  const [document, setDocument] = React.useState<PaperDocument | null>(null)

  React.useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      const initial = createDefaultPaper()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      setDocument(initial)
      return
    }

    try {
      setDocument(normalizeDocument(JSON.parse(saved) as PaperDocument))
    } catch {
      const fallback = createDefaultPaper()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback))
      setDocument(fallback)
    }
  }, [])

  React.useEffect(() => {
    if (!document) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(document))
  }, [document])

  return [document, setDocument] as const
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function DiagramField({
  value,
  onChange,
}: {
  value?: string | null
  onChange: (nextValue: string | null) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <RiImageAddLine className="size-4" />
          Diagram
        </div>
        {value ? (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        ) : null}
      </div>
      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 transition hover:border-emerald-400">
        <RiImageAddLine className="size-4" />
        Upload diagram
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (!file) return
            onChange(await fileToDataUrl(file))
            event.target.value = ""
          }}
        />
      </label>
      {value ? (
        <img
          src={value}
          alt="Question diagram"
          className="mt-4 max-h-64 w-full rounded-2xl border border-slate-200 object-contain bg-white"
        />
      ) : null}
    </div>
  )
}

function updateTableCell(
  table: BlockTable,
  rowIndex: number,
  columnIndex: number,
  value: string
) {
  const rows = table.rows.map((row) => [...row])
  rows[rowIndex][columnIndex] = value
  return { ...table, rows }
}

function TableEditor({
  table,
  onChange,
}: {
  table: BlockTable | null | undefined
  onChange: (table: BlockTable | null) => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <RiTableLine className="size-4" />
          Supporting table
        </div>
        {table ? (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Remove
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                headers: ["Column 1", "Column 2"],
                rows: [
                  ["", ""],
                  ["", ""],
                ],
              })
            }
          >
            Add table
          </Button>
        )}
      </div>
      {table ? (
        <div className="mt-4 p-1 space-y-3 overflow-x-auto">
          <div className="grid min-w-[420px] gap-2" style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0, 1fr))` }}>
            {table.headers.map((header, headerIndex) => (
              <Input
                key={`header-${headerIndex}`}
                value={header}
                onChange={(event) =>
                  onChange({
                    ...table,
                    headers: table.headers.map((current, index) =>
                      index === headerIndex ? event.target.value : current
                    ),
                  })
                }
                className="bg-white"
                placeholder={`Header ${headerIndex + 1}`}
              />
            ))}
          </div>
          {table.rows.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid min-w-[420px] gap-2"
              style={{ gridTemplateColumns: `repeat(${table.headers.length}, minmax(0, 1fr))` }}
            >
              {row.map((cell, columnIndex) => (
                <Input
                  key={`cell-${rowIndex}-${columnIndex}`}
                  value={cell}
                  onChange={(event) =>
                    onChange(updateTableCell(table, rowIndex, columnIndex, event.target.value))
                  }
                  className="bg-white"
                  placeholder="Cell"
                />
              ))}
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  ...table,
                  rows: [...table.rows, table.headers.map(() => "")],
                })
              }
            >
              <RiAddLine className="size-4" />
              Row
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onChange({
                  ...table,
                  headers: [...table.headers, `Column ${table.headers.length + 1}`],
                  rows: table.rows.map((row) => [...row, ""]),
                })
              }
            >
              <RiAddLine className="size-4" />
              Column
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AnswerTableEditor({
  format,
  table,
  onFormatChange,
  onTableChange,
}: {
  format: AnswerFormat
  table: BlockTable | null | undefined
  onFormatChange: (format: AnswerFormat) => void
  onTableChange: (table: BlockTable) => void
}) {
  const resolvedTable = table ?? {
    headers: ["Part", "Answer"],
    rows: [
      ["1", ""],
      ["2", ""],
      ["3", ""],
    ],
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-700">Answer layout</div>
        <div className="flex gap-2">
          <Button
            variant={format === "lines" ? "default" : "outline"}
            size="sm"
            onClick={() => onFormatChange("lines")}
          >
            Lines
          </Button>
          <Button
            variant={format === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => onFormatChange("table")}
          >
            Table rows
          </Button>
        </div>
      </div>
      {format === "table" ? (
        <div className="mt-4 p-1 space-y-3 overflow-x-auto">
          <div
            className="grid min-w-[420px] gap-2"
            style={{
              gridTemplateColumns: `repeat(${resolvedTable.headers.length}, minmax(0, 1fr))`,
            }}
          >
            {resolvedTable.headers.map((header, headerIndex) => (
              <Input
                key={`answer-header-${headerIndex}`}
                value={header}
                onChange={(event) =>
                  onTableChange({
                    ...resolvedTable,
                    headers: resolvedTable.headers.map((current, index) =>
                      index === headerIndex ? event.target.value : current
                    ),
                  })
                }
                className="bg-white"
                placeholder={`Header ${headerIndex + 1}`}
              />
            ))}
          </div>
          {resolvedTable.rows.map((row, rowIndex) => (
            <div
              key={`answer-row-${rowIndex}`}
              className="grid min-w-[420px] gap-2"
              style={{
                gridTemplateColumns: `repeat(${resolvedTable.headers.length}, minmax(0, 1fr))`,
              }}
            >
              {row.map((cell, columnIndex) => (
                <Input
                  key={`answer-cell-${rowIndex}-${columnIndex}`}
                  value={cell}
                  onChange={(event) =>
                    onTableChange(
                      updateTableCell(
                        resolvedTable,
                        rowIndex,
                        columnIndex,
                        event.target.value
                      )
                    )
                  }
                  className="bg-white"
                  placeholder="Cell"
                />
              ))}
            </div>
          ))}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onTableChange({
                  ...resolvedTable,
                  rows: [
                    ...resolvedTable.rows,
                    resolvedTable.headers.map(() => ""),
                  ],
                })
              }
            >
              <RiAddLine className="size-4" />
              Row
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onTableChange({
                  ...resolvedTable,
                  headers: [
                    ...resolvedTable.headers,
                    `Column ${resolvedTable.headers.length + 1}`,
                  ],
                  rows: resolvedTable.rows.map((row) => [...row, ""]),
                })
              }
            >
              <RiAddLine className="size-4" />
              Column
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function BuilderCard({
  block,
  selected,
  index,
  canMoveUp,
  canMoveDown,
  onSelect,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  block: QuestionBlock
  selected: boolean
  index: number
  canMoveUp: boolean
  canMoveDown: boolean
  onSelect: () => void
  onChange: (block: QuestionBlock) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const cardClassName = cn(
    "overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-all",
    selected
      ? "border-emerald-500 shadow-[0_24px_60px_rgba(16,185,129,0.18)]"
      : "border-slate-200 hover:border-slate-300"
  )

  if (block.type === "section") {
    return (
      <Card className={cardClassName} onClick={onSelect}>
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-5">
          <CardTitle className="ml-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Section
          </CardTitle>
          <CardAction className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={!canMoveUp}
            >
              <RiArrowUpLine className="size-4" />
              <span className="sr-only">Move section up</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={!canMoveDown}
            >
              <RiArrowDownLine className="size-4" />
              <span className="sr-only">Move section down</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onDuplicate}>
              <RiFileCopyLine className="size-4" />
              <span className="sr-only">Duplicate section</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete}>
              <RiDeleteBinLine className="size-4" />
              <span className="sr-only">Delete section</span>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Input
            value={block.title}
            onChange={(event) =>
              onChange({ ...block, title: event.target.value })
            }
            className="h-12 rounded-2xl border-slate-200 text-lg font-semibold"
            placeholder="Section title"
          />
          <textarea
            value={block.description}
            onChange={(event) =>
              onChange({ ...block, description: event.target.value })
            }
            className="mt-4 min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
            placeholder="Add instructions for this section"
          />
          <div className="mt-4 grid gap-4">
            <DiagramField
              value={block.diagramDataUrl}
              onChange={(diagramDataUrl) => onChange({ ...block, diagramDataUrl })}
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
      <CardHeader className="flex flex-row items-center justify-between px-5 pt-5">
        <CardTitle className="ml-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
          Question {index}
        </CardTitle>
        <CardAction className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
          >
            <RiArrowUpLine className="size-4" />
            <span className="sr-only">Move section up</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
          >
            <RiArrowDownLine className="size-4" />
            <span className="sr-only">Move section down</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDuplicate}>
            <RiFileCopyLine className="size-4" />
            <span className="sr-only">Duplicate section</span>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onDelete}>
            <RiDeleteBinLine className="size-4" />
            <span className="sr-only">Delete section</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4 px-5">
        <Input
          value={block.title}
          onChange={(event) =>
            onChange({ ...block, title: event.target.value } as QuestionBlock)
          }
          className="h-12 rounded-2xl border-slate-200 text-lg font-semibold"
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
              onChange({ ...block, answerFormat })
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
                  onChange({ ...block, options: [...block.options, "New option"] })
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
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
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
              onChange({ ...block, answerFormat })
            }
            onTableChange={(answerTable) =>
              onChange({ ...block, answerTable })
            }
          />
          </div>
        ) : null}

        {block.type === "long-answer" ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
              <textarea
                value={block.guidance}
                onChange={(event) =>
                  onChange({ ...block, guidance: event.target.value })
                }
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500"
                placeholder="Marking guidance or prompt"
              />
              <label className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-500">
                Answer lines
                <Input
                  type="number"
                  min={3}
                  max={18}
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
              onChange({ ...block, answerFormat })
            }
            onTableChange={(answerTable) =>
              onChange({ ...block, answerTable })
            }
          />
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="mt-5 justify-between px-5">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          {block.type === "mcq"
            ? "Multiple Choice"
            : block.type === "short-answer"
              ? "Short Answer"
              : "Long Answer"}
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

type BuilderShellProps = {
  className?: string
  showHeaderActions?: boolean
}

export function BuilderShell({
  className,
  showHeaderActions = true,
}: BuilderShellProps) {
  const [document, setDocument] = useBuilderDocument()
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null)
  const [pendingScrollBlockId, setPendingScrollBlockId] = React.useState<string | null>(
    null
  )
  const blockRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  React.useEffect(() => {
    if (!document || selectedBlockId) {
      return
    }

    setSelectedBlockId(document.blocks[0]?.id ?? null)
  }, [document, selectedBlockId])

  React.useEffect(() => {
    if (!document) {
      return
    }

    if (document.blocks.length === 0 && selectedBlockId !== null) {
      setSelectedBlockId(null)
    }
  }, [document, selectedBlockId])

  React.useEffect(() => {
    if (!pendingScrollBlockId) {
      return
    }

    const element = blockRefs.current[pendingScrollBlockId]
    if (!element) {
      return
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
    setPendingScrollBlockId(null)
  }, [document, pendingScrollBlockId])

  const updateDocument = React.useCallback(
    (updater: (current: PaperDocument) => PaperDocument) => {
      setDocument((current) => (current ? updater(current) : current))
    },
    [setDocument]
  )

  const addBlock = React.useCallback(
    (type: QuestionBlockType, afterId?: string) => {
      updateDocument((current) => {
        const newBlock = createBlock(type)
        setSelectedBlockId(newBlock.id)
        setPendingScrollBlockId(newBlock.id)

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

        if (index === -1) {
          return current
        }

        const targetIndex = direction === "up" ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= current.blocks.length) {
          return current
        }

        const nextBlocks = [...current.blocks]
        const [movedBlock] = nextBlocks.splice(index, 1)
        nextBlocks.splice(targetIndex, 0, movedBlock)
        setSelectedBlockId(blockId)
        setPendingScrollBlockId(blockId)

        return {
          ...current,
          blocks: nextBlocks,
        }
      })
    },
    [updateDocument]
  )

  const openPreview = React.useCallback(() => {
    window.open("/preview", "_blank", "noopener,noreferrer")
  }, [])

  if (!document) {
    return null
  }

  let questionCount = 0

  return (
    <div
      className={cn(
        "min-h-full",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] gap-6 px-4 py-6 lg:px-8">
        <section className="min-w-0 flex-1">
          <div className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                  <RiSparkling2Line className="size-4" />
                  Canvas Builder
                </div>
                <Input
                  value={document.title}
                  onChange={(event) =>
                    setDocument({ ...document, title: event.target.value })
                  }
                  className="mt-5 h-14 border-0 px-0 md:text-4xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
                />
                <Input
                  value={document.subtitle}
                  onChange={(event) =>
                    setDocument({ ...document, subtitle: event.target.value })
                  }
                  className="mt-2 h-10 border-0 px-0 md:text-lg text-slate-500 shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[420px]">
                <label className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Duration
                  <Input
                    value={document.duration}
                    onChange={(event) =>
                      setDocument({ ...document, duration: event.target.value })
                    }
                    className="mt-2 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  />
                </label>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Sections
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {
                      document.blocks.filter((block) => block.type === "section")
                        .length
                    }
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Questions
                  <div className="mt-2 text-2xl font-semibold text-slate-900">
                    {
                      document.blocks.filter((block) => block.type !== "section")
                        .length
                    }
                  </div>
                </div>
              </div>
            </div>

            <textarea
              value={document.instructions}
              onChange={(event) =>
                setDocument({ ...document, instructions: event.target.value })
              }
              className="mt-6 min-h-28 w-full rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-700 outline-none transition focus:border-emerald-500"
              placeholder="Add overall instructions for students"
            />

            {showHeaderActions ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => openPreview()}>
                  <RiEyeLine className="size-4" />
                  Preview
                </Button>
                <ExportPdfButton>
                  <RiFileDownloadLine className="size-4" />
                  Export PDF
                </ExportPdfButton>
              </div>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6">
            <div className="min-w-0">
              <div className="space-y-5">
                {document.blocks.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                    <div className="mx-auto max-w-xl">
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Empty Canvas
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                        Add your first block
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        Start with a section heading, a multiple choice question,
                        or a written-response block.
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

                {document.blocks.map((block, blockIndex) => {
                  const visibleQuestionIndex =
                    block.type === "section" ? 0 : ++questionCount

                  return (
                    <div
                      key={block.id}
                      className="group relative"
                      ref={(element) => {
                        blockRefs.current[block.id] = element
                      }}
                    >
                      <BuilderCard
                        block={block}
                        selected={selectedBlockId === block.id}
                        index={visibleQuestionIndex}
                        canMoveUp={blockIndex > 0}
                        canMoveDown={blockIndex < document.blocks.length - 1}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onChange={(nextBlock) =>
                          setDocument({
                            ...document,
                            blocks: document.blocks.map((currentBlock) =>
                              currentBlock.id === nextBlock.id
                                ? nextBlock
                                : currentBlock
                            ),
                          })
                        }
                        onMoveUp={() => moveBlock(block.id, "up")}
                        onMoveDown={() => moveBlock(block.id, "down")}
                        onDuplicate={() =>
                          setDocument({
                            ...document,
                            blocks: document.blocks.flatMap((currentBlock) =>
                              currentBlock.id === block.id
                                ? [currentBlock, cloneBlock(currentBlock)]
                                : [currentBlock]
                            ),
                          })
                        }
                        onDelete={() =>
                          setDocument({
                            ...document,
                            blocks: document.blocks.filter(
                              (currentBlock) => currentBlock.id !== block.id
                            ),
                          })
                        }
                      />

                      <div className="pointer-events-none absolute inset-x-8 -bottom-3 flex justify-center opacity-0 transition group-hover:opacity-100">
                        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-lg">
                          {insertActions.map((action) => (
                            <button
                              key={`${block.id}-${action.type}`}
                              type="button"
                              onClick={() => addBlock(action.type, block.id)}
                              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                              <action.icon className="size-4" />
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
