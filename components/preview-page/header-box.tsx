import type { PaperDocument } from "@/lib/paper-builder"

export function HeaderBox({ document }: { document: PaperDocument }) {
  const topLevelBlocks = document.blocks.filter((b) => !b.parentId)
  const totalMarks = topLevelBlocks.reduce((sum, block) => {
    return block.type === "section" ? sum : sum + (block.points ?? 0)
  }, 0)

  return (
    <header className="border-[3px] border-black p-4 text-center font-work-sans">
      <div className="border border-black px-6 py-4">
        <img src="https://royalinstitute.org/wp-content/uploads/2025/10/Picture1-e1606878141326.png" alt="Logo" className="mx-auto h-50 grayscale" />
        <h1 className="mt-1 text-2xl font-bold tracking-wide">
          {document.title}
        </h1>
        <p className="text-md mt-1 font-medium">{document.subtitle}</p>

        <div className="text-md mt-4 grid grid-cols-2 gap-4 border-t border-t-slate-400 pt-4">
          <div className="text-left">
            <p>
              <span className="font-semibold">Name:</span>
              <span className="ml-2 inline-block min-w-48 border-b border-black align-bottom" />
            </p>
            <p className="mt-2">
              <span className="font-semibold">
                Duration: {document.duration}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold">Class:</span>
              <span className="ml-2 inline-block min-w-48 border-b border-black align-bottom" />
            </p>
            <p className="mt-2">
              <span className="font-semibold">Total Marks: {totalMarks}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}