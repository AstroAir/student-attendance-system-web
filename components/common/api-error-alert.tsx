"use client"

import * as React from "react"
import { RefreshCcwIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function ApiErrorAlert({
  title = "加载失败",
  error,
  onRetry,
}: {
  title?: string
  error: string
  onRetry?: () => void
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle className="flex items-center justify-between gap-2">
        <span>{title}</span>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCcwIcon />
            重试
          </Button>
        ) : null}
      </AlertTitle>
      <AlertDescription className="wrap-break-word">{error}</AlertDescription>
    </Alert>
  )
}
