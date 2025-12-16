"use client"

import * as React from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

import { dateToMmdd } from "@/lib/date"
import { toCsv } from "@/lib/csv"
import { copyToClipboard, downloadText } from "@/lib/client-actions"
import { useReportsStore } from "@/lib/stores"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { buildSummaryParams, parseSummaryParams } from "@/lib/reports-url-query"
import { MmddPicker } from "@/components/common/mmdd-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

export function SummaryReportPanel({
  classOptions,
  loadingClasses,
}: {
  classOptions: Array<{ value: string; label: string }>
  loadingClasses: boolean
}) {
  const searchParams = useSearchParams()

  const summary = useReportsStore((s) => s.summary)
  const loading = useReportsStore((s) => s.loading)
  const error = useReportsStore((s) => s.error)
  const fetchSummary = useReportsStore((s) => s.fetchSummary)

  const { today, weekAgo } = React.useMemo(() => {
    const now = new Date()
    const week = new Date(now)
    week.setDate(now.getDate() - 6)
    return { today: dateToMmdd(now), weekAgo: dateToMmdd(week) }
  }, [])
  const [startDate, setStartDate] = useLocalStorageState("reports.summary.startDate", weekAgo)
  const [endDate, setEndDate] = useLocalStorageState("reports.summary.endDate", today)
  const [className, setClassName] = useLocalStorageState("reports.summary.class", "")

  const didInitRef = React.useRef(false)

  React.useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const fromUrl = parseSummaryParams(searchParams)
    const hasUrlParams = fromUrl.start_date || fromUrl.end_date || fromUrl.class

    if (hasUrlParams && fromUrl.start_date && fromUrl.end_date) {
      setStartDate(fromUrl.start_date)
      setEndDate(fromUrl.end_date)
      setClassName(fromUrl.class ?? "")

      void fetchSummary({
        start_date: fromUrl.start_date,
        end_date: fromUrl.end_date,
        class: fromUrl.class || undefined,
      })
    } else {
      void fetchSummary({
        start_date: startDate,
        end_date: endDate,
        class: className || undefined,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleQuery = React.useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("请选择日期范围")
      return
    }
    await fetchSummary({ start_date: startDate, end_date: endDate, class: className || undefined })
  }, [className, endDate, fetchSummary, startDate])

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
    params.set("tab", "summary")
    for (const [k, v] of buildSummaryParams({
      start_date: startDate,
      end_date: endDate,
      class: className || undefined,
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
    if (!summary || summary.summary.length === 0) {
      toast.error("暂无数据可导出")
      return
    }

    const csv = toCsv({
      headers: [
        "学号",
        "姓名",
        "班级",
        "总天数",
        "出勤",
        "旷课",
        "迟到",
        "早退",
        "事假",
        "病假",
        "出勤率",
      ],
      rows: summary.summary.map((r) => [
        r.student_id,
        r.name,
        r.class,
        r.total_days,
        r.present_count,
        r.absent_count,
        r.late_count,
        r.early_leave_count,
        r.personal_leave_count,
        r.sick_leave_count,
        r.attendance_rate,
      ]),
    })

    const filename = `report-summary-${startDate}-${endDate}${className ? `-${className}` : ""}.csv`
    downloadText(filename, `\ufeff${csv}`, "text/csv;charset=utf-8")
    toast.success("已导出 CSV 并开始下载")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-3">
              <Label>开始日期</Label>
              <MmddPicker value={startDate} onChange={setStartDate} disabled={loading} />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>结束日期</Label>
              <MmddPicker value={endDate} onChange={setEndDate} disabled={loading} />
            </div>
            <div className="space-y-2 lg:col-span-4">
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
            <div className="flex items-end lg:col-span-2 lg:justify-end">
              <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row lg:justify-end">
                <Button
                  variant="outline"
                  className="w-full lg:w-auto"
                  onClick={() => void handleCopyLink()}
                  disabled={loading}
                >
                  复制链接
                </Button>
                <Button
                  variant="outline"
                  className="w-full lg:w-auto"
                  onClick={handleExportCsv}
                  disabled={loading}
                >
                  导出 CSV
                </Button>
                <Button
                  className="w-full lg:w-auto"
                  onClick={() => void handleQuery()}
                  disabled={loading}
                >
                  查询
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="min-w-[980px] rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">学号</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>班级</TableHead>
                <TableHead className="w-[90px]">总天数</TableHead>
                <TableHead className="w-[90px]">出勤</TableHead>
                <TableHead className="w-[90px]">旷课</TableHead>
                <TableHead className="w-[90px]">迟到</TableHead>
                <TableHead className="w-[90px]">早退</TableHead>
                <TableHead className="w-[90px]">事假</TableHead>
                <TableHead className="w-[90px]">病假</TableHead>
                <TableHead className="w-[110px]">出勤率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeletonRows
                  rows={10}
                  columns={Array.from({ length: 11 }).map(() => ({ skeletonClassName: "h-4 w-16" }))}
                />
              ) : summary && summary.summary.length > 0 ? (
                summary.summary.map((row) => (
                  <TableRow key={row.student_id}>
                    <TableCell className="tabular-nums font-medium">{row.student_id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.class}</TableCell>
                    <TableCell className="tabular-nums">{row.total_days}</TableCell>
                    <TableCell className="tabular-nums">{row.present_count}</TableCell>
                    <TableCell className="tabular-nums">{row.absent_count}</TableCell>
                    <TableCell className="tabular-nums">{row.late_count}</TableCell>
                    <TableCell className="tabular-nums">{row.early_leave_count}</TableCell>
                    <TableCell className="tabular-nums">{row.personal_leave_count}</TableCell>
                    <TableCell className="tabular-nums">{row.sick_leave_count}</TableCell>
                    <TableCell className="tabular-nums">{row.attendance_rate}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
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
    </div>
  )
}
