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
