"use client"

import { useEffect, useState } from "react"

let mockInitialized = false

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (mockInitialized) {
      setReady(true)
      return
    }

    const shouldEnableMock =
      process.env.NEXT_PUBLIC_ENABLE_MOCK === "true" ||
      process.env.NODE_ENV === "development"

    if (shouldEnableMock) {
      import("@/lib/mock").then(({ enableMock }) => {
        enableMock()
        mockInitialized = true
        setReady(true)
      })
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return <>{children}</>
}
