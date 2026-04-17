import {
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiLayoutTopLine,
  RiQuestionAnswerLine,
} from "@remixicon/react"
import type { QuestionBlockType } from "@/lib/paper-builder"

export const insertActions: Array<{
  type: QuestionBlockType
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { type: "section", label: "Section", icon: RiLayoutTopLine },
  { type: "mcq", label: "MCQ", icon: RiCheckboxCircleLine },
  { type: "short-answer", label: "Short answer", icon: RiQuestionAnswerLine },
  { type: "big-question", label: "Big Question", icon: RiFileTextLine },
]
