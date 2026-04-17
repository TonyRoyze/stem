import type { BlockTable, QuestionBlock } from "@/lib/paper-builder"

export function SupportingTable({ block }: { block: QuestionBlock }) {
  if (!block.table) {
    return null
  }

  return (
    <div className="mt-3 overflow-hidden px-5">
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="border-b border-black">
            {block.table.headers.map((header, index) => (
              <th
                key={`${block.id}-header-${index}`}
                className="border-r border-black px-2 py-2 font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, rowIndex) => (
            <tr
              key={`${block.id}-row-${rowIndex}`}
              className="border-b border-black"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={`${block.id}-cell-${rowIndex}-${cellIndex}`}
                  className="border-r border-black px-2 py-1.5 text-center"
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

export function AnswerTable({ table }: { table: BlockTable | null | undefined }) {
  if (!table) {
    return null
  }

  return (
    <div className="mt-3 overflow-hidden px-5">
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="border-b border-black">
            {table.headers.map((header, index) => (
              <th
                key={`answer-header-${index}`}
                className="border-r border-black px-2 py-2 font-semibold"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={`answer-${rowIndex}`} className="border-b border-black">
              {row.map((cell, cellIndex) => (
                <td
                  key={`answer-${rowIndex}-${cellIndex}`}
                  className="border-r border-black px-2 py-1.5 text-center"
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