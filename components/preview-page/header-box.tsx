import type { PaperDocument } from "@/lib/paper-builder"

export function HeaderBox({ document }: { document: PaperDocument }) {
  const topLevelBlocks = document.blocks.filter((b) => !b.parentId)
  const totalMarks = topLevelBlocks.reduce((sum, block) => {
    return block.type === "section" ? sum : sum + (block.points ?? 0)
  }, 0)

  return (
    <header className="border-[2px] border-black p-3 text-center">
      <div className="border border-black px-6 py-4">
        <img
          src="https://royalinstitute.org/wp-content/uploads/2025/10/Picture1-e1606878141326.png"
          alt="Logo"
          className="mx-auto h-36 grayscale"
        />
        <h1 className="mt-2 text-[20pt] leading-tight font-bold whitespace-pre-line">
          {document.title}
        </h1>
        <p className="mt-1 text-[12pt] font-medium whitespace-pre-line">
          {document.subtitle}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-t-slate-400 pt-4 text-[12pt]">
          <div className="text-left">
            <p>
              <span className="font-semibold">Name:</span>
              <span className="ml-2 inline-block min-w-40 border-b border-black align-bottom" />
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
              <span className="ml-2 inline-block min-w-40 border-b border-black align-bottom" />
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
