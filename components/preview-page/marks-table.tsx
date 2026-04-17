import type { PaperDocument } from "@/lib/paper-builder"

export function MarksTable({ document }: { document: PaperDocument }) {
  const topLevelBlocks = document.blocks.filter((b) => !b.parentId)
  let questionNumber = 0

  return (
    <div className="w-[38%] shrink-0">
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="border-b border-black">
            <th className="border-r border-black px-2 py-2 font-semibold">
              Question
            </th>
            <th className="border-r border-black px-2 py-2 font-semibold">
              Allotted
            </th>
            <th className="px-2 py-2 font-semibold">Obtained</th>
          </tr>
        </thead>
        <tbody>
          {topLevelBlocks.map((block) => {
            if (block.type === "section") return null
            const num = ++questionNumber
            const points = block.points ?? 0
            return (
              <tr key={block.id} className="border-b border-black">
                <td className="border-r border-black px-2 py-1.5 text-center">
                  {num}
                </td>
                <td className="border-r border-black px-2 py-1.5 text-center">
                  {points}
                </td>
                <td className="px-2 py-1.5" />
              </tr>
            )
          })}
          {Array.from({ length: 10 - questionNumber }).map((_, index) => (
            <tr key={index} className="border-b border-black">
              <td className="border-r border-black px-2 py-1.5 text-center">
                {index + questionNumber + 1}
              </td>
              <td className="border-r border-black px-2 py-1.5 text-center"/>
              <td className="px-2 py-1.5" />
            </tr>
          ))}
          <tr className="border-t-2 border-black font-semibold">
            <td className="border-r border-black px-2 py-1.5 text-center">
              Total
            </td>
            <td className="border-r border-black px-2 py-1.5 text-center">
              {topLevelBlocks.reduce((sum, b) => sum + (b.points ?? 0), 0)}
            </td>
            <td className="px-2 py-1.5" />
          </tr>
        </tbody>
      </table>
    </div>
  )
}