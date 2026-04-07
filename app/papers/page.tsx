"use client"

import Link from "next/link"
import { useQuery } from "convex/react"
import { RiAddLine, RiFileList3Line } from "@remixicon/react"

import { api } from "@/convex/_generated/api"
import { AppSidebar } from "@/components/app-sidebar"
import { ImportPaperCard } from "@/components/paper-builder/import-paper-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp)
}

export default function PapersPage() {

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
              <Link key={paper._id} href={`/papers/${paper.routeKey}`} className="block">
                <Card className="rounded-[28px] border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_24px_60px_rgba(16,185,129,0.12)]">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-950">
                      {paper.title}
                    </CardTitle>
                    <div className="text-sm text-slate-500">
                      {paper.subtitle || "No subtitle"}
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-4 pb-5">
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Duration: {paper.duration || "Not set"}</div>
                      <div>Updated: {formatDate(paper.updatedAt)}</div>
                    </div>
                    <div className="absolute right-5 bottom-0 text-sm font-medium text-emerald-700">
                      Open Paper
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
