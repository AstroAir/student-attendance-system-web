export function getTotalPages(total: number, pageSize: number) {
  if (pageSize <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}

export function getPageItems(page: number, totalPages: number) {
  const current = Math.min(Math.max(1, page), totalPages)

  const items: Array<number | "ellipsis"> = []

  const push = (v: number | "ellipsis") => {
    if (items.length === 0 || items[items.length - 1] !== v) items.push(v)
  }

  // Always show first and last, show a window around current.
  const windowStart = Math.max(2, current - 1)
  const windowEnd = Math.min(totalPages - 1, current + 1)

  push(1)

  if (windowStart > 2) push("ellipsis")

  for (let i = windowStart; i <= windowEnd; i += 1) push(i)

  if (windowEnd < totalPages - 1) push("ellipsis")

  if (totalPages > 1) push(totalPages)

  return items
}
