"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { RiAddLine } from "@remixicon/react"

import { api } from "@/convex/_generated/api"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { ImportPaperCard } from "@/components/home-page/import-paper-card"
import { PaperCard } from "@/components/home-page/paper-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function PapersPage() {
  const user = useCurrentUser()
  const papers = useQuery(
    api.papers.list,
    user ? { ownerInternalId: user.internalId } : "skip"
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Papers</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Button nativeButton={false} render={<Link href="/papers/new" />}>
            <RiAddLine className="size-4" />
            New Paper
          </Button>
        </header>

        <div className="p-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ImportPaperCard />
          {papers === undefined ? (
            <div className="text-sm text-slate-500">Loading papers...</div>
          ) : papers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No papers saved yet.
            </div>
          ) : (
            papers.map((paper) => (
              <PaperCard key={paper._id} paper={paper} />
            ))
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
