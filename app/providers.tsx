"use client"

import * as React from "react"

import { MockProvider } from "@/components/mock-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <MockProvider>
        {children}
      </MockProvider>
      <Toaster richColors />
    </ThemeProvider>
  )
}
