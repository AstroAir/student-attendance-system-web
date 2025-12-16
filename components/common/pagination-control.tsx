"use client"

import * as React from "react"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getPageItems, getTotalPages } from "@/lib/pagination"

export function PaginationControl({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = getTotalPages(total, pageSize)
  const items = React.useMemo(
    () => getPageItems(page, totalPages),
    [page, totalPages]
  )

  if (totalPages <= 1) return null

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onPageChange(Math.max(1, page - 1))
            }}
          />
        </PaginationItem>

        {items.map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <PaginationItem key={`e-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onPageChange(Math.min(totalPages, page + 1))
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
