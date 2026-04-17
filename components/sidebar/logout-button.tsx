"use client"

import Link from "next/link"
import { RiLogoutBoxLine } from "@remixicon/react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function LogoutButton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href="/logout" />}
          tooltip="Log out"
        >
          <RiLogoutBoxLine />
          <span>Log out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
