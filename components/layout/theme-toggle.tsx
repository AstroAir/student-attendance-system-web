"use client"

import * as React from "react"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const current = theme || "system"
  const effectiveTheme = mounted
    ? current === "system"
      ? resolvedTheme
      : current
    : undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="切换主题">
          {effectiveTheme === "dark" ? (
            <MoonIcon />
          ) : effectiveTheme === "light" ? (
            <SunIcon />
          ) : (
            <MonitorIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>浅色</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>深色</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>跟随系统</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
