import { NextResponse } from "next/server"

import { generatePaperPdf } from "@/lib/printer.service"
import type { PaperDocument } from "@/lib/paper-builder"

export const runtime = "nodejs"

function createFilename(title: string) {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${slug || "exam-paper"}.pdf`
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { document?: PaperDocument }

    if (!body.document) {
      return NextResponse.json(
        { error: "Missing document payload." },
        { status: 400 }
      )
    }

    const pdf = await generatePaperPdf({
      document: body.document,
      baseUrl: new URL(request.url).origin,
    })
    const pdfArrayBuffer = Uint8Array.from(pdf).buffer

    return new NextResponse(
      new Blob([pdfArrayBuffer], { type: "application/pdf" }),
      {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${createFilename(
          body.document.title
        )}"`,
        "Cache-Control": "no-store",
      },
      }
    )
  } catch (error) {
    console.error("Failed to export PDF", error)
    const message =
      error instanceof Error ? error.message : "Failed to generate PDF."

    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
