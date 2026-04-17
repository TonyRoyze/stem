export function AnswerLines({ count }: { count: number }) {
  return (
    <div className="mt-3 space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-6 border-b border-slate-400" />
      ))}
    </div>
  )
}