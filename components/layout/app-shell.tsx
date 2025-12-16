"use client"

import * as React from "react"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { CommandPalette } from "@/components/common/command-palette"
import { MockDebugPanel } from "@/components/common/mock-debug-panel"
import { cn } from "@/lib/utils"
import {
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarRail />
      <SidebarInset>
        <header
          className={cn(
            "sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-backdrop-filter:bg-background/60"
          )}
        >
          <SidebarTrigger />
          <div className="flex-1" />
          <CommandPalette />
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
        <MockDebugPanel />
      </SidebarInset>
    </SidebarProvider>
  )
}
