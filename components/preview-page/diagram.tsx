export function Diagram({ src }: { src?: string | null }) {
  if (!src) {
    return null
  }

  return (
    <div className="mt-3">
      <img
        src={src}
        alt="Question diagram"
        className="max-h-[80mm] max-w-full object-contain"
      />
    </div>
  )
}