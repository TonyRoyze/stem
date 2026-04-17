export function InstructionsBox({ text }: { text: string }) {
  const lines = text.split("\n").filter((line) => line.trim())

  return (
    <div className="min-w-0 flex-1">
      <h2 className="text-md font-semibold tracking-wide underline underline-offset-2">
        Instructions to the candidates:
      </h2>
      <ul className="mt-2 space-y-1 text-xs leading-relaxed">
        {lines.map((line, index) => (
          <li key={index} className="flex gap-2">
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}