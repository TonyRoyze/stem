export function AnswerLines({
  count,
  marks,
}: {
  count: number
  marks?: number
}) {
  const lineCount = Math.max(count, 1)

  return (
    <div className="mt-3 space-y-3">
      {Array.from({ length: lineCount }).map((_, index) => (
        <div key={index} className="flex min-h-7 items-end gap-2">
          <span className="flex-1 overflow-hidden whitespace-nowrap text-[10pt] leading-none tracking-[0.3em] text-black">
            {".".repeat(500)}
          </span>
          {index === 0 && typeof marks === "number" ? (
            <span className="shrink-0 font-normal text-black">[{marks}]</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
