"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import Link from "next/link"
import type { Id } from "@/convex/_generated/dataModel"
import {
  RiFileDownloadLine,
  RiEyeLine,
  RiFileList3Line,
} from "@remixicon/react"

import { api } from "@/convex/_generated/api"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { BuilderShell } from "@/components/paper-builder/builder-shell"
import { ExportQuestionPaperButton } from "@/components/paper-builder/buttons/export-question-paper-button"
import { ExportMarkingSchemeButton } from "@/components/paper-builder/buttons/export-marking-scheme-button"
import { SavePaperButton } from "@/components/paper-builder/save-paper-button"
import { SaveStatusIndicator } from "@/components/paper-builder/buttons/save-status-indicator"
import { useAutoSave } from "@/hooks/use-auto-save"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  STORAGE_KEY,
  createDefaultPaper,
  normalizeDocument,
  type PaperDocument,
} from "@/lib/paper-builder"

export function EditorPage({
  routeKey,
  isNewPaper = false,
}: {
  routeKey?: string
  isNewPaper?: boolean
}) {
  const savedPaper = useQuery(
    api.papers.getByRouteKey,
    routeKey ? { routeKey } : "skip"
  )
  const [builderKey, setBuilderKey] = React.useState(
    isNewPaper ? `new-paper-${Date.now()}` : "paper-editor"
  )

  React.useEffect(() => {
    if (isNewPaper) {
      const nextDocument = createDefaultPaper()
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDocument))
      setBuilderKey(`new-paper-${Date.now()}`)
      return
    }

    if (!savedPaper) {
      return
    }

    const nextDocument = normalizeDocument(
      JSON.parse(savedPaper.documentJson) as PaperDocument
    )

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDocument))
    setBuilderKey(String(savedPaper._id))
  }, [isNewPaper, savedPaper])

  const paperId = savedPaper?._id as Id<"papers"> | undefined
  const isLoadingPaper = Boolean(routeKey) && savedPaper === undefined
  const isMissingPaper = Boolean(routeKey) && savedPaper === null

  const { status, lastSaved, performSave } = useAutoSave(paperId ?? null)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/papers">Papers</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {routeKey ? "Edit Paper" : "Paper Builder"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <SaveStatusIndicator
              status={status}
              lastSaved={lastSaved}
              onSaveNow={performSave}
            />
            <SavePaperButton paperId={paperId ?? null} />
            <Button
              variant="outline"
              onClick={() =>
                window.open("/preview", "_blank", "noopener,noreferrer")
              }
            >
              <RiEyeLine className="size-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open("/marking-scheme", "_blank", "noopener,noreferrer")
              }
            >
              <RiFileList3Line className="size-4" />
              Preview Marking Scheme
            </Button>
            <ExportQuestionPaperButton>
              <RiFileDownloadLine className="size-4" />
              Export Question Paper
            </ExportQuestionPaperButton>
            <ExportMarkingSchemeButton>
              <RiFileDownloadLine className="size-4" />
              Export Marking Scheme
            </ExportMarkingSchemeButton>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {isLoadingPaper ? (
            <div className="p-6 text-sm text-slate-500">Loading paper...</div>
          ) : isMissingPaper ? (
            <div className="p-6 text-sm text-slate-500">
              Paper not found. Open a saved paper from the papers page or start
              a new one.
            </div>
          ) : (
            <BuilderShell
              key={builderKey}
              showHeaderActions={true}
              className="min-h-full"
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
