import { existsSync } from "node:fs"

import puppeteer from "puppeteer"

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
