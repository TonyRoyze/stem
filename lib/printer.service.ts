import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import puppeteer from "puppeteer"
import { PDFDocument } from "pdf-lib"
import * as opentype from "opentype.js"

import { STORAGE_KEY, type PaperDocument } from "@/lib/paper-builder"

function resolveBrowserExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    puppeteer.executablePath(),
    "/Applications/Helium.app/Contents/MacOS/Helium",
  ].filter((candidate): candidate is string => Boolean(candidate))

  const executablePath = candidates.find((candidate) => existsSync(candidate))

  return executablePath
}

function createHeaderTemplate(pageNumber: number) {
  return `
    <div style="width:100%; margin:0 1in; font-size:11px; color:#000; font-family:Calibri,Arial,sans-serif;">
      <div style="text-align:center;">${pageNumber}</div>
    </div>
  `
}

let cooperBlackFooterImage: string | null = null

function getCooperBlackFooterImage() {
  if (!cooperBlackFooterImage) {
    const fontPath = join(process.cwd(), "public/fonts/cooper-black.woff")
    const fontBuffer = readFileSync(fontPath)
    const font = opentype.parse(
      fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      )
    )
    const path = font.getPath("Royal Institute International School", 0, 20, 16)
    const box = path.getBoundingBox()
    const padding = 2
    const viewBox = [
      box.x1 - padding,
      box.y1 - padding,
      box.x2 - box.x1 + padding * 2,
      box.y2 - box.y1 + padding * 2,
    ].join(" ")
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
        <path fill="#000" d="${path.toPathData(2)}"/>
      </svg>
    `

    cooperBlackFooterImage = `data:image/svg+xml;base64,${Buffer.from(
      svg
    ).toString("base64")}`
  }

  return cooperBlackFooterImage
}

function createFooterTemplate(showFooter: boolean) {
  if (!showFooter) {
    return "<div></div>"
  }

  const footerImage = getCooperBlackFooterImage()

  return `
    <div style="width:100%; margin:0 1in; font-size:10px; color:#000;">
      <div style="border-top:1px solid #000; padding-top:5px; text-align:center;">
        <img src="${footerImage}" alt="Royal Institute International School" style="display:inline-block; width:245px; height:auto;" />
      </div>
    </div>
  `
}

async function mergePdfPages(pdfs: Uint8Array[]) {
  const mergedPdf = await PDFDocument.create()

  for (const pdfBytes of pdfs) {
    const sourcePdf = await PDFDocument.load(pdfBytes)
    const pages = await mergedPdf.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices()
    )

    for (const page of pages) {
      mergedPdf.addPage(page)
    }
  }

  return mergedPdf.save()
}

async function generatePdf({
  document,
  baseUrl,
  cookies,
  path,
}: {
  document: PaperDocument
  baseUrl: string
  cookies?: Array<{ name: string; value: string }>
  path: string
}) {
  const executablePath = resolveBrowserExecutable()

  if (!executablePath) {
    throw new Error(
      "No Chromium executable was found for PDF export. Install the Puppeteer browser or set PUPPETEER_EXECUTABLE_PATH."
    )
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()

    if (cookies && cookies.length > 0) {
      await page.setCookie(
        ...cookies.map((c) => ({
          name: c.name,
          value: c.value,
          domain: new URL(baseUrl).hostname,
          path: "/",
        }))
      )
    }

    await page.goto(new URL(path, baseUrl).toString(), {
      waitUntil: "networkidle0",
    })

    await page.evaluate(
      (payload) => {
        window.localStorage.setItem(
          payload.storageKey,
          JSON.stringify(payload.document)
        )
      },
      { storageKey: STORAGE_KEY, document }
    )

    await page.reload({
      waitUntil: "networkidle0",
    })

    await page.waitForSelector("article", { timeout: 10000 })

    const pdfOptions = {
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      margin: {
        top: "1in",
        right: "1in",
        bottom: "1in",
        left: "1in",
      },
      timeout: 0,
    } satisfies Parameters<typeof page.pdf>[0]

    const countPdf = await page.pdf({
      ...pdfOptions,
      headerTemplate: createHeaderTemplate(1),
      footerTemplate: "<div></div>",
    })
    const pageCount = (await PDFDocument.load(countPdf)).getPageCount()

    if (pageCount <= 1) {
      return countPdf
    }

    const pages: Uint8Array[] = []

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      pages.push(
        await page.pdf({
          ...pdfOptions,
          pageRanges: String(pageNumber),
          headerTemplate: createHeaderTemplate(pageNumber),
          footerTemplate: createFooterTemplate(pageNumber > 1),
        })
      )
    }

    return await mergePdfPages(pages)
  } finally {
    await browser.close()
  }
}

export async function generatePaperPdf({
  document,
  baseUrl,
  cookies,
}: {
  document: PaperDocument
  baseUrl: string
  cookies?: Array<{ name: string; value: string }>
}) {
  return generatePdf({ document, baseUrl, cookies, path: "/preview" })
}

export async function generateMarkingSchemePdf({
  document,
  baseUrl,
  cookies,
}: {
  document: PaperDocument
  baseUrl: string
  cookies?: Array<{ name: string; value: string }>
}) {
  return generatePdf({ document, baseUrl, cookies, path: "/marking-scheme" })
}
