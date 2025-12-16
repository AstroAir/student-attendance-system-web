import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        <div className="text-sm font-medium">{title}</div>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </CardContent>
    </Card>
  )
}
