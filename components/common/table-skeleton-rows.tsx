"use client"

import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { TableCell, TableRow } from "@/components/ui/table"

export function TableSkeletonRows({
  rows,
  columns,
}: {
  rows: number
  columns: Array<{ cellClassName?: string; skeletonClassName?: string }>
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {columns.map((col, j) => (
            <TableCell key={j} className={col.cellClassName}>
              <Skeleton className={col.skeletonClassName || "h-4 w-16"} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
