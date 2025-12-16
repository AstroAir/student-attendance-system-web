"use client"

import * as React from "react"
import { PlusIcon, Rows3Icon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { dateToMmdd } from "@/lib/date"
import type { Attendance, AttendanceStatus } from "@/lib/types"
import { useAttendancesStore, useClassesStore } from "@/lib/stores"
import { buildAttendancesQueryString, parseAttendancesQueryFromSearchParams } from "@/lib/url-query"
import { copyToClipboard } from "@/lib/client-actions"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { PaginationControl } from "@/components/common/pagination-control"
import { AttendanceFormDialog } from "@/components/attendances/attendance-form-dialog"
import { AttendancesFilters } from "@/components/attendances/attendances-filters"
import { AttendancesTable } from "@/components/attendances/attendances-table"
import { BatchAttendanceDialog } from "@/components/attendances/batch-attendance-dialog"
import { Button } from "@/components/ui/button"

export default function AttendancesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  const list = useAttendancesStore((s) => s.list)
  const query = useAttendancesStore((s) => s.query)
  const loadingList = useAttendancesStore((s) => s.loadingList)
  const error = useAttendancesStore((s) => s.error)
  const fetchList = useAttendancesStore((s) => s.fetchList)
  const setQuery = useAttendancesStore((s) => s.setQuery)

  const classes = useClassesStore((s) => s.classes)
  const fetchClasses = useClassesStore((s) => s.fetchClasses)

  const today = React.useMemo(() => dateToMmdd(new Date()), [])

  const classOptions = React.useMemo(
    () => classes.map((c) => ({ value: c.name, label: c.name })),
    [classes]
  )

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Attendance | null>(null)

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

    const fromUrl = parseAttendancesQueryFromSearchParams(searchParams)
    const patch = {
      page: fromUrl.page ?? 1,
      page_size: fromUrl.page_size ?? 20,
      student_id: fromUrl.student_id ?? "",
      name: fromUrl.name ?? "",
      class: fromUrl.class ?? "",
      date: fromUrl.date ?? "",
      start_date: fromUrl.start_date ?? "",
      end_date: fromUrl.end_date ?? "",
      status: fromUrl.status,
      sort_by: fromUrl.sort_by ?? "date",
      order: fromUrl.order ?? "asc",
    }

    void fetchList(patch).finally(() => {
      setDidInitUrl(true)
    })
  }, [fetchClasses, fetchList, searchParams])

  React.useEffect(() => {
    if (!didInitUrl) return

    const qs = buildAttendancesQueryString(query)
    const next = qs ? `${pathname}?${qs}` : pathname

    const urlNorm = normalizedSearch(new URLSearchParams(searchParamsString))
    const storeNorm = normalizedSearch(new URLSearchParams(qs))
    if (urlNorm === storeNorm) return

    router.replace(next)
  }, [didInitUrl, normalizedSearch, pathname, query, router, searchParamsString])

  React.useEffect(() => {
    if (!didInitUrl) return

    const fromUrl = parseAttendancesQueryFromSearchParams(searchParams)
    const patch = {
      page: fromUrl.page ?? 1,
      page_size: fromUrl.page_size ?? 20,
      student_id: fromUrl.student_id ?? "",
      name: fromUrl.name ?? "",
      class: fromUrl.class ?? "",
      date: fromUrl.date ?? "",
      start_date: fromUrl.start_date ?? "",
      end_date: fromUrl.end_date ?? "",
      status: fromUrl.status,
      sort_by: fromUrl.sort_by ?? "date",
      order: fromUrl.order ?? "asc",
    }

    const current = queryRef.current
    const sameQuery =
      current.page === patch.page &&
      current.page_size === patch.page_size &&
      (current.student_id ?? "") === patch.student_id &&
      (current.name ?? "") === patch.name &&
      (current.class ?? "") === patch.class &&
      (current.date ?? "") === patch.date &&
      (current.start_date ?? "") === patch.start_date &&
      (current.end_date ?? "") === patch.end_date &&
      current.status === patch.status &&
      (current.sort_by ?? "date") === patch.sort_by &&
      (current.order ?? "asc") === patch.order

    if (sameQuery) return

    void fetchList(patch)
  }, [didInitUrl, fetchList, searchParams, searchParamsString])

  type FilterValues = {
    student_id: string
    name: string
    class: string
    date: string
    start_date: string
    end_date: string
    status: AttendanceStatus | ""
    sort_by: "student_id" | "name" | "date"
    order: "asc" | "desc"
  }

  const filterValues: FilterValues = {
    student_id: query.student_id || "",
    name: query.name || "",
    class: query.class || "",
    date: query.date || "",
    start_date: query.start_date || "",
    end_date: query.end_date || "",
    status: query.status ?? "",
    sort_by: query.sort_by ?? "date",
    order: query.order ?? "asc",
  }

  function handleSearch() {
    void fetchList({ page: 1 })
  }

  function handleReset() {
    void fetchList({
      page: 1,
      page_size: 20,
      student_id: "",
      name: "",
      class: "",
      date: "",
      start_date: "",
      end_date: "",
      status: undefined,
      sort_by: "date",
      order: "asc",
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
        title="考勤记录"
        description="管理考勤记录，支持筛选、分页与批量录入。"
        actions={
          <>
            <Button variant="outline" onClick={() => void handleCopyFilterLink()}>
              复制筛选链接
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setBatchDialogOpen(true)
              }}
            >
              <Rows3Icon />
              批量录入
            </Button>
            <Button
              onClick={() => {
                setEditing(null)
                setDialogOpen(true)
              }}
            >
              <PlusIcon />
              新增记录
            </Button>
          </>
        }
      />

      <AttendancesFilters
        values={filterValues}
        classOptions={classOptions}
        disabled={loadingList}
        onChange={(patch) => {
          const nextSortBy = patch.sort_by ?? filterValues.sort_by
          const nextOrder = patch.order ?? filterValues.order
          const nextStatus = patch.status === "" ? undefined : patch.status

          setQuery({
            page: 1,
            student_id: patch.student_id ?? filterValues.student_id,
            name: patch.name ?? filterValues.name,
            class: patch.class ?? filterValues.class,
            date: patch.date ?? filterValues.date,
            start_date: patch.start_date ?? filterValues.start_date,
            end_date: patch.end_date ?? filterValues.end_date,
            status: nextStatus,
            sort_by: nextSortBy,
            order: nextOrder,
          })
        }}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {list && !loadingList && list.items.length === 0 ? (
        <EmptyState
          title="暂无考勤记录"
          description="请新增单条考勤记录，或使用批量录入。"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBatchDialogOpen(true)
                }}
              >
                <Rows3Icon />
                批量录入
              </Button>
              <Button
                onClick={() => {
                  setEditing(null)
                  setDialogOpen(true)
                }}
              >
                <PlusIcon />
                新增记录
              </Button>
            </div>
          }
        />
      ) : (
        <AttendancesTable
          items={list?.items || []}
          loading={loadingList}
          onEdit={(attendance) => {
            setEditing(attendance)
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

      <AttendanceFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
        attendance={editing}
        defaultDate={filterValues.date || today}
      />

      <BatchAttendanceDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        classOptions={classOptions}
        defaultDate={filterValues.date || today}
      />
    </div>
  )
}
