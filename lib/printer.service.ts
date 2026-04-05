import { existsSync } from "node:fs"

import puppeteer from "puppeteer"

import { STORAGE_KEY, type PaperDocument } from "@/lib/paper-builder"

function resolveBrowserExecutable() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    (() => {
      try {
        return puppeteer.executablePath()
      } catch {
        return undefined
      }
    })(),
    "/Applications/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ].filter(Boolean) as string[]

  return candidates.find((path) => existsSync(path))
}

export async function generatePaperPdf({
  document,
  baseUrl,
}: {
  document: PaperDocument
  baseUrl: string
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

    await page.goto(new URL("/preview", baseUrl).toString(), {
      waitUntil: "networkidle0",
    })

    await page.evaluate((payload) => {
      window.localStorage.setItem(payload.storageKey, JSON.stringify(payload.document))
    }, { storageKey: STORAGE_KEY, document })

    await page.reload({
      waitUntil: "networkidle0",
    })

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: "15mm",
        right: "15mm",
        bottom: "15mm",
        left: "15mm",
      },
    })
  } finally {
    await browser.close()
  }
}
