import { RiFingerprintLine, RiMailLine, RiUserLine } from "@remixicon/react"

import { ProfileForm } from "@/app/profile/profile-form"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { requireCurrentUser } from "@/lib/convex-server"

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp)
}

export default async function ProfilePage() {
  const user = await requireCurrentUser()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
          <Card className="rounded-[28px] border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">
                Account settings
              </CardTitle>
              <CardDescription>
                Update your name, email address, and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">
                Account details
              </CardTitle>
              <CardDescription>
                Your internal user ID stays stable even if your email changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <RiFingerprintLine className="size-4" />
                  Internal ID
                </div>
                <div className="font-mono text-sm text-slate-950">
                  {user.internalId}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <RiUserLine className="size-4" />
                  Display name
                </div>
                <div className="text-sm text-slate-950">{user.displayName}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <RiMailLine className="size-4" />
                  Email
                </div>
                <div className="text-sm text-slate-950">{user.email}</div>
              </div>

              <div className="space-y-1 text-sm text-slate-500">
                <div>Created: {formatDate(user.createdAt)}</div>
                <div>Last updated: {formatDate(user.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
