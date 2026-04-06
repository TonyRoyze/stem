"use client"

import * as React from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { RiGalleryLine, RiPulseLine, RiCommandLine, RiFolderOpenLine, RiUserLine } from "@remixicon/react"

// This is sample data.
const data = {
  teams: [
    {
      name: "STEM",
      logo: (
        <RiGalleryLine
        />
      ),
      plan: "Academy",
    },
    {
      name: "Acme Corp.",
      logo: (
        <RiPulseLine
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <RiCommandLine
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    // {
    //   title: "Paper Builder",
    //   url: "/papers/new",
    //   icon: (
    //     <RiQuillPenLine
    //     />
    //   ),
    //   isActive: true,
    // },
    {
      title: "Papers",
      url: "/papers",
      icon: (
        <RiFolderOpenLine
        />
      ),
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const recentPapers = useQuery(api.papers.listRecentCreated)
  const [user, setUser] = React.useState<{
    name: string
    email: string
    avatar: string
  } | null>(null)

  const navItems = React.useMemo(() => {
    return data.navMain.map((item) =>
      item.title === "Papers"
        ? {
            ...item,
            items:
              recentPapers?.map((paper) => ({
                title: paper.title,
                url: `/papers/${paper.routeKey}`,
              })) ?? [],
          }
        : item
    )
  }, [recentPapers])

  React.useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        const response = await fetch("/api/me", { credentials: "include" })
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          user?: {
            name: string
            email: string
            avatar: string
          } | null
        }

        if (isMounted && payload.user) {
          setUser(payload.user)
        }
      } catch {
        // Leave the footer hidden if the lookup fails.
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      {user ? (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      ) : null}
      <SidebarRail />
    </Sidebar>
  )
}
