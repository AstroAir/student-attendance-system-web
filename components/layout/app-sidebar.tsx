"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { navItems } from "@/lib/nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/layout/theme-toggle"

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex flex-col">
            <div className="text-sm font-semibold leading-tight">学生考勤系统</div>
            <div className="text-xs text-muted-foreground leading-tight">管理后台</div>
          </div>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="hidden md:flex items-center justify-between gap-2 px-2">
          <div className="text-xs text-muted-foreground">v1.0</div>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
