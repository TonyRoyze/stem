"use client"

import * as React from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { NavMain } from "@/components/nav-main"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { RiGalleryLine, RiPulseLine, RiCommandLine, RiQuillPenLine, RiFolderOpenLine, RiEyeLine } from "@remixicon/react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
    },
    // {
    //   title: "Preview",
    //   url: "/preview",
    //   icon: (
    //     <RiEyeLine
    //     />
    //   ),
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const recentPapers = useQuery(api.papers.listRecentCreated)

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
      <SidebarRail />
    </Sidebar>
  )
}
