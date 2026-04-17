"use client"

import { RiAddLine, RiTableLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { BlockTable, AnswerFormat } from "@/lib/paper-builder"

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

interface TableEditorProps {
  table: BlockTable | null | undefined
  onChange: (table: BlockTable | null) => void
}

export function TableEditor({ table, onChange }: TableEditorProps) {
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
        <div className="mt-4 space-y-3 overflow-x-auto p-1">
          <div
            className="grid min-w-[420px] gap-2"
            style={{
              gridTemplateColumns: `repeat(${table.headers.length}, minmax(0, 1fr))`,
            }}
          >
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
              style={{
                gridTemplateColumns: `repeat(${table.headers.length}, minmax(0, 1fr))`,
              }}
            >
              {row.map((cell, columnIndex) => (
                <Input
                  key={`cell-${rowIndex}-${columnIndex}`}
                  value={cell}
                  onChange={(event) =>
                    onChange(
                      updateTableCell(
                        table,
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
                  headers: [
                    ...table.headers,
                    `Column ${table.headers.length + 1}`,
                  ],
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

interface AnswerTableEditorProps {
  format: AnswerFormat
  table: BlockTable | null | undefined
  onFormatChange: (format: AnswerFormat) => void
  onTableChange: (table: BlockTable) => void
}

export function AnswerTableEditor({
  format,
  table,
  onFormatChange,
  onTableChange,
}: AnswerTableEditorProps) {
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
        <div className="mt-4 space-y-3 overflow-x-auto p-1">
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
