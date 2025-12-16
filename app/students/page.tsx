"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { useClassesStore, useStudentsStore } from "@/lib/stores"
import { buildStudentsQueryString, parseStudentsQueryFromSearchParams } from "@/lib/url-query"
import { copyToClipboard } from "@/lib/client-actions"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { PaginationControl } from "@/components/common/pagination-control"
import { StudentFormDialog } from "@/components/students/student-form-dialog"
import { StudentsFilters } from "@/components/students/students-filters"
import { StudentsTable } from "@/components/students/students-table"

export default function StudentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const list = useStudentsStore((s) => s.list)
  const query = useStudentsStore((s) => s.query)
  const loadingList = useStudentsStore((s) => s.loadingList)
  const error = useStudentsStore((s) => s.error)
  const fetchList = useStudentsStore((s) => s.fetchList)
  const setQuery = useStudentsStore((s) => s.setQuery)

  const classes = useClassesStore((s) => s.classes)
  const fetchClasses = useClassesStore((s) => s.fetchClasses)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  const [didInitUrl, setDidInitUrl] = React.useState(false)
  const didInitRef = React.useRef(false)
  const queryRef = React.useRef(query)

  React.useEffect(() => {
    queryRef.current = query
  }, [query])

  React.useEffect(() => {
    if (error) {
      toast.error(error, {
        action: {
          label: "重试",
          onClick: () => void fetchList(),
        },
      })
    }
  }, [error, fetchList])

  const editingStudent = React.useMemo(() => {
    if (!editingId) return null
    const items = list?.items || []
    return items.find((s) => s.student_id === editingId) || null
  }, [editingId, list])

  const classOptions = React.useMemo(
    () => classes.map((c) => ({ value: c.name, label: c.name })),
    [classes]
  )

  const normalizedSearch = React.useCallback((sp: { entries: () => IterableIterator<[string, string]> }) => {
    const entries = Array.from(sp.entries()).sort(([a], [b]) => a.localeCompare(b))
    const p = new URLSearchParams()
    for (const [k, v] of entries) p.append(k, v)
    return p.toString()
  }, [])

  React.useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    void fetchClasses()

    const fromUrl = parseStudentsQueryFromSearchParams(searchParams)
    const patch = {
      page: fromUrl.page ?? 1,
      page_size: fromUrl.page_size ?? 20,
      sort_by: fromUrl.sort_by ?? "student_id",
      order: fromUrl.order ?? "asc",
      class: fromUrl.class ?? "",
      keyword: fromUrl.keyword ?? "",
    }

    void fetchList(patch).finally(() => {
      setDidInitUrl(true)
    })
  }, [fetchClasses, fetchList, searchParams])

  React.useEffect(() => {
    if (!didInitUrl) return

    const qs = buildStudentsQueryString(query)
    const next = qs ? `${pathname}?${qs}` : pathname

    const urlNorm = normalizedSearch(new URLSearchParams(searchParamsString))
    const storeNorm = normalizedSearch(new URLSearchParams(qs))
    if (urlNorm === storeNorm) return

    router.replace(next)
  }, [didInitUrl, normalizedSearch, pathname, query, router, searchParamsString])

  React.useEffect(() => {
    if (!didInitUrl) return

    const fromUrl = parseStudentsQueryFromSearchParams(searchParams)
    const patch = {
      page: fromUrl.page ?? 1,
      page_size: fromUrl.page_size ?? 20,
      sort_by: fromUrl.sort_by ?? "student_id",
      order: fromUrl.order ?? "asc",
      class: fromUrl.class ?? "",
      keyword: fromUrl.keyword ?? "",
    }

    const current = queryRef.current
    const sameQuery =
      current.page === patch.page &&
      current.page_size === patch.page_size &&
      (current.sort_by ?? "student_id") === patch.sort_by &&
      (current.order ?? "asc") === patch.order &&
      (current.class ?? "") === patch.class &&
      (current.keyword ?? "") === patch.keyword

    if (sameQuery) return

    void fetchList(patch)
  }, [didInitUrl, fetchList, searchParams, searchParamsString])

  function handleSearch() {
    void fetchList({ page: 1 })
  }

  function handleReset() {
    void fetchList({
      page: 1,
      page_size: 20,
      sort_by: "student_id",
      order: "asc",
      class: "",
      keyword: "",
    })
  }

  async function handleCopyFilterLink() {
    try {
      const url = `${window.location.origin}${pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`
      await copyToClipboard(url)
      toast.success("已复制当前筛选链接")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "复制失败")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="学生管理"
        description="管理学生基础信息，支持分页、排序和筛选。"
        actions={
          <>
            <Button variant="outline" onClick={() => void handleCopyFilterLink()}>
              复制筛选链接
            </Button>
            <Button
              onClick={() => {
                setEditingId(null)
                setDialogOpen(true)
              }}
            >
              <PlusIcon />
              新增学生
            </Button>
          </>
        }
      />

      <StudentsFilters
        keyword={query.keyword || ""}
        classValue={query.class || ""}
        sortBy={query.sort_by || "student_id"}
        order={query.order || "asc"}
        classOptions={classOptions}
        disabled={loadingList}
        onChange={(patch) => {
          setQuery({
            page: 1,
            keyword: patch.keyword ?? query.keyword,
            class: patch.class ?? query.class,
            sort_by: patch.sort_by ?? query.sort_by,
            order: patch.order ?? query.order,
          })
        }}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {list && !loadingList && list.items.length === 0 ? (
        <EmptyState
          title="暂无学生数据"
          description="请先新增学生，或调整筛选条件。"
          action={
            <Button
              onClick={() => {
                setEditingId(null)
                setDialogOpen(true)
              }}
            >
              <PlusIcon />
              新增学生
            </Button>
          }
        />
      ) : (
        <StudentsTable
          items={list?.items || []}
          loading={loadingList}
          onEdit={(student) => {
            setEditingId(student.student_id)
            setDialogOpen(true)
          }}
        />
      )}

      {list ? (
        <PaginationControl
          page={list.page}
          pageSize={list.page_size}
          total={list.total}
          onPageChange={(page) => {
            void fetchList({ page })
          }}
        />
      ) : null}

      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingId(null)
        }}
        student={editingStudent}
        classOptions={classOptions}
      />
    </div>
  )
}
