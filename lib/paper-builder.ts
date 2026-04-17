export type Paper = {
  _id: string
  _creationTime: number
  slug: string | null
  routeKey: string
  title: string
  subtitle: string
  duration: string
  ownerInternalId: string
  createdAt: number
  updatedAt: number
}
export type QuestionBlockType =
  | "section"
  | "mcq"
  | "short-answer"
  | "big-question"
export type AnswerFormat = "lines" | "table"

export type BlockTable = {
  headers: string[]
  rows: string[][]
}

export type BaseBlock = {
  id: string
  type: QuestionBlockType
  title: string
  points?: number
  diagramDataUrl?: string | null
  table?: BlockTable | null
  parentId?: string
}

export type SectionBlock = BaseBlock & {
  type: "section"
  description: string
}

export type McqBlock = BaseBlock & {
  type: "mcq"
  options: string[]
  answerFormat?: "lines" | "table"
  answerTable?: BlockTable | null
  correctAnswer?: number
  markingInstructions?: string
}

export type ShortAnswerBlock = BaseBlock & {
  type: "short-answer"
  placeholder: string
  lines: number
  answerFormat?: AnswerFormat
  answerTable?: BlockTable | null
  markingInstructions?: string
  answer?: string
}

export type BigQuestionBlock = BaseBlock & {
  type: "big-question"
  description: string
  markingInstructions?: string
}

export type QuestionBlock =
  | SectionBlock
  | McqBlock
  | ShortAnswerBlock
  | BigQuestionBlock

export type PaperDocument = {
  title: string
  subtitle: string
  duration: string
  instructions: string
  blocks: QuestionBlock[]
}

export function toRoman(num: number): string {
  const romanNumerals = [
    "i",
    "ii",
    "iii",
    "iv",
    "v",
    "vi",
    "vii",
    "viii",
    "ix",
    "x",
    "xi",
    "xii",
    "xiii",
    "xiv",
    "xv",
    "xvi",
    "xvii",
    "xviii",
    "xix",
    "xx",
  ]
  return romanNumerals[num - 1] ?? num.toString()
}

export function isSubQuestion(block: QuestionBlock): boolean {
  return Boolean(block.parentId)
}

export function getSubQuestions(
  blocks: QuestionBlock[],
  parentId: string
): QuestionBlock[] {
  return blocks.filter((block) => block.parentId === parentId)
}

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

function createDefaultTable(): BlockTable {
  return {
    headers: ["Column 1", "Column 2"],
    rows: [
      ["", ""],
      ["", ""],
    ],
  }
}

function createDefaultAnswerTable() {
  return {
    headers: ["Part", "Answer"],
    rows: [
      ["1", ""],
      ["2", ""],
      ["3", ""],
    ],
  }
}

export function createBlock(type: QuestionBlockType): QuestionBlock {
  switch (type) {
    case "section":
      return {
        id: createId("section"),
        type,
        title: "New Section",
        description: "Add instructions or context for this section.",
        diagramDataUrl: null,
        table: null,
      }
    case "mcq":
      return {
        id: createId("mcq"),
        type,
        title: "Untitled multiple choice question",
        points: 1,
        diagramDataUrl: null,
        table: null,
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        answerFormat: "lines",
        answerTable: createDefaultAnswerTable(),
      }
    case "short-answer":
      return {
        id: createId("short"),
        type,
        title: "Untitled short answer question",
        points: 3,
        diagramDataUrl: null,
        table: null,
        placeholder: "",
        lines: 3,
        answerFormat: "lines",
        answerTable: createDefaultAnswerTable(),
      }
    case "big-question":
      return {
        id: createId("bigq"),
        type,
        title: "Untitled big question",
        points: 20,
        diagramDataUrl: null,
        table: null,
        description: "",
      }
  }
}

export function createDefaultPaper(): PaperDocument {
  return {
    title: "STEM Assessment Paper",
    subtitle: "Midterm Examination",
    duration: "60 minutes",
    instructions:
      "Answer all questions. Show clear working where relevant. Use diagrams, tables, or examples if they help explain your reasoning.",
    blocks: [
      {
        id: createId("section"),
        type: "section",
        title: "Section A",
        description: "Answer all multiple choice questions in this section.",
        diagramDataUrl: null,
        table: null,
      },
      {
        id: createId("mcq"),
        type: "mcq",
        title: "Which process converts liquid water into water vapor?",
        points: 1,
        diagramDataUrl: null,
        table: null,
        options: ["Condensation", "Evaporation", "Freezing", "Precipitation"],
        answerFormat: "lines",
        answerTable: createDefaultAnswerTable(),
      },
      {
        id: createId("short"),
        type: "short-answer",
        title: "Explain why plants need sunlight for photosynthesis.",
        points: 3,
        diagramDataUrl: null,
        table: createDefaultTable(),
        placeholder: "Write 2-3 sentences.",
        lines: 3,
        answerFormat: "lines",
        answerTable: createDefaultAnswerTable(),
      },
      {
        id: createId("bigq"),
        type: "big-question",
        title: "Understanding the Water Cycle",
        points: 20,
        diagramDataUrl: null,
        table: null,
        description: "Answer all sub-questions related to the water cycle.",
      },
    ],
  }
}

export const STORAGE_KEY = "paper-builder-document"

function cloneTable(table?: BlockTable | null) {
  if (!table) {
    return null
  }

  return {
    headers: [...table.headers],
    rows: table.rows.map((row) => [...row]),
  }
}

export function cloneBlock(block: QuestionBlock): QuestionBlock {
  return {
    ...block,
    id: createId(block.type),
    table: cloneTable(block.table),
    ...(block.type === "mcq"
      ? {
          options: [...block.options],
          answerTable: cloneTable(
            block.answerTable ?? createDefaultAnswerTable()
          ),
        }
      : {}),
    ...(block.type === "short-answer"
      ? {
          answerTable: cloneTable(
            block.answerTable ?? createDefaultAnswerTable()
          ),
        }
      : {}),
  } as QuestionBlock
}

export function normalizeDocument(document: PaperDocument): PaperDocument {
  return {
    ...document,
    blocks: document.blocks.map((block) => {
      if (block.type === "mcq") {
        return {
          ...block,
          diagramDataUrl: block.diagramDataUrl ?? null,
          table: cloneTable(block.table),
          answerFormat: block.answerFormat ?? "lines",
          answerTable: cloneTable(
            block.answerTable ?? createDefaultAnswerTable()
          ),
        }
      }
      if (block.type === "short-answer") {
        return {
          ...block,
          diagramDataUrl: block.diagramDataUrl ?? null,
          table: cloneTable(block.table),
          answerFormat: block.answerFormat ?? "lines",
          answerTable: cloneTable(
            block.answerTable ?? createDefaultAnswerTable()
          ),
        }
      }
      return {
        ...block,
        diagramDataUrl: block.diagramDataUrl ?? null,
        table: cloneTable(block.table),
      }
    }),
  }
}
