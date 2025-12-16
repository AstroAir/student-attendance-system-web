"use client"

import * as React from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

import type { AttendanceStatus } from "@/lib/types"
import { attendanceStatusMeta } from "@/lib/attendance"
import { dateToMmdd } from "@/lib/date"
import { toCsv } from "@/lib/csv"
import { copyToClipboard, downloadText } from "@/lib/client-actions"
import { useReportsStore } from "@/lib/stores"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { buildDetailsParams, parseDetailsParams } from "@/lib/reports-url-query"
import { MmddPicker } from "@/components/common/mmdd-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows"

export function DetailsReportPanel({
  classOptions,
  loadingClasses,
}: {
  classOptions: Array<{ value: string; label: string }>
  loadingClasses: boolean
}) {
  const searchParams = useSearchParams()

  const details = useReportsStore((s) => s.details)
  const loading = useReportsStore((s) => s.loading)
  const error = useReportsStore((s) => s.error)
  const fetchDetails = useReportsStore((s) => s.fetchDetails)

  const { today, weekAgo } = React.useMemo(() => {
    const now = new Date()
    const week = new Date(now)
    week.setDate(now.getDate() - 6)
    return { today: dateToMmdd(now), weekAgo: dateToMmdd(week) }
  }, [])
  const [startDate, setStartDate] = useLocalStorageState("reports.details.startDate", weekAgo)
  const [endDate, setEndDate] = useLocalStorageState("reports.details.endDate", today)
  const [className, setClassName] = useLocalStorageState("reports.details.class", "")
  const [studentId, setStudentId] = useLocalStorageState("reports.details.studentId", "")

  const [studentIdInput, setStudentIdInput] = React.useState(studentId)

  React.useEffect(() => {
    setStudentIdInput(studentId)
  }, [studentId])

  const didInitRef = React.useRef(false)

  React.useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const fromUrl = parseDetailsParams(searchParams)
    const hasUrlParams = fromUrl.start_date || fromUrl.end_date || fromUrl.class || fromUrl.student_id
    
    if (hasUrlParams && fromUrl.start_date && fromUrl.end_date) {
      setStartDate(fromUrl.start_date)
      setEndDate(fromUrl.end_date)
      setClassName(fromUrl.class ?? "")
      setStudentId(fromUrl.student_id ?? "")

      void fetchDetails({
        start_date: fromUrl.start_date,
        end_date: fromUrl.end_date,
        class: fromUrl.class || undefined,
        student_id: fromUrl.student_id || undefined,
      })
    } else {
      void fetchDetails({
        start_date: startDate,
        end_date: endDate,
        class: className || undefined,
        student_id: studentId || undefined,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleQuery = React.useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("请选择日期范围")
      return
    }

    if (studentIdInput !== studentId) setStudentId(studentIdInput)

    await fetchDetails({
      start_date: startDate,
      end_date: endDate,
      class: className || undefined,
      student_id: studentIdInput || undefined,
    })
  }, [className, endDate, fetchDetails, setStudentId, startDate, studentId, studentIdInput])

  React.useEffect(() => {
    if (error) {
      toast.error(error, {
        action: {
          label: "重试",
          onClick: () => void handleQuery(),
        },
      })
    }
  }, [error, handleQuery])

  async function handleCopyLink() {
    if (!startDate || !endDate) {
      toast.error("请选择日期范围")
      return
    }

    const params = new URLSearchParams()
    params.set("tab", "details")
    for (const [k, v] of buildDetailsParams({
      start_date: startDate,
      end_date: endDate,
      class: className || undefined,
      student_id: studentIdInput || undefined,
    }).entries()) {
      params.set(k, v)
    }

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    await copyToClipboard(url)
    toast.success("已复制分享链接")
  }

  function handleExportCsv() {
    if (!startDate || !endDate) {
      toast.error("请选择日期范围")
      return
    }
    if (!details || details.records.length === 0) {
      toast.error("暂无数据可导出")
      return
    }

    const headers = ["学号", "姓名", "班级", ...dateColumns]
    const rows = details.records.map((row) => {
      const map = new Map<string, string>()
      for (const d of row.attendance_details) map.set(d.date, d.symbol)
      return [row.student_id, row.name, row.class, ...dateColumns.map((d) => map.get(d) || "-")]
    })

    const csv = toCsv({ headers, rows })
    const filename = `report-details-${startDate}-${endDate}${className ? `-${className}` : ""}.csv`
    downloadText(filename, `\ufeff${csv}`, "text/csv;charset=utf-8")
    toast.success("已导出 CSV 并开始下载")
  }

  const dateColumns = React.useMemo(() => {
    const set = new Set<string>()
    for (const r of details?.records || []) {
      for (const d of r.attendance_details || []) set.add(d.date)
    }
    return Array.from(set).sort()
  }, [details])

  function renderCell(status: AttendanceStatus, symbol: string) {
    const meta = attendanceStatusMeta[status]
    return (
      <Badge variant={meta.badgeVariant} className="justify-center">
        {symbol}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>开始日期</Label>
                <MmddPicker value={startDate} onChange={setStartDate} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>结束日期</Label>
                <MmddPicker value={endDate} onChange={setEndDate} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>班级（可选）</Label>
                <Select
                  value={className || "__all"}
                  onValueChange={(v) => setClassName(v === "__all" ? "" : v)}
                  disabled={loading || loadingClasses}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="全部班级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all">全部班级</SelectItem>
                    {classOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>学号（可选）</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleQuery()
                    }}
                    placeholder="例如：2024001"
                    disabled={loading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStudentIdInput("")
                      setStudentId("")
                    }}
                    disabled={loading || (!studentIdInput && !studentId)}
                    aria-label="清空学号"
                  >
                    清空
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCopyLink()}
                disabled={loading}
              >
                复制链接
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={loading}
              >
                导出 CSV
              </Button>
              <Button
                size="sm"
                onClick={() => void handleQuery()}
                disabled={loading}
              >
                查询
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="min-w-[900px] rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">学号</TableHead>
                    <TableHead className="w-[120px]">姓名</TableHead>
                    <TableHead className="w-[140px]">班级</TableHead>
                    {dateColumns.map((d) => (
                      <TableHead key={d} className="w-[70px] text-center tabular-nums">
                        {d}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeletonRows
                      rows={6}
                      columns={[
                        { skeletonClassName: "h-4 w-24" },
                        { skeletonClassName: "h-4 w-20" },
                        { skeletonClassName: "h-4 w-28" },
                        ...Array.from({ length: Math.max(3, dateColumns.length || 3) }).map(() => ({
                          cellClassName: "text-center",
                          skeletonClassName: "mx-auto h-6 w-10",
                        })),
                      ]}
                    />
                  ) : details && details.records.length > 0 ? (
                    details.records.map((row) => {
                      const map = new Map<string, { status: AttendanceStatus; symbol: string }>()
                      for (const d of row.attendance_details) {
                        map.set(d.date, { status: d.status, symbol: d.symbol })
                      }

                      return (
                        <TableRow key={row.student_id}>
                          <TableCell className="tabular-nums font-medium">{row.student_id}</TableCell>
                          <TableCell>{row.name}</TableCell>
                          <TableCell>{row.class}</TableCell>
                          {dateColumns.map((d) => {
                            const v = map.get(d)
                            return (
                              <TableCell key={d} className="text-center">
                                {v ? renderCell(v.status, v.symbol) : <span className="text-muted-foreground">-</span>}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3 + Math.max(1, dateColumns.length)}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
