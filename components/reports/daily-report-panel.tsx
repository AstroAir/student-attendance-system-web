"use client"

import * as React from "react"
import { toast } from "sonner"

import { dateToMmdd } from "@/lib/date"
import { attendanceStatusMeta } from "@/lib/attendance"
import type { AttendanceStatus } from "@/lib/types"
import { useReportsStore } from "@/lib/stores"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { MmddPicker } from "@/components/common/mmdd-picker"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { StatCardsSkeleton } from "@/components/common/stat-cards-skeleton"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DailyReportPanel({
  classOptions,
  loadingClasses,
}: {
  classOptions: Array<{ value: string; label: string }>
  loadingClasses: boolean
}) {
  const daily = useReportsStore((s) => s.daily)
  const loading = useReportsStore((s) => s.loading)
  const error = useReportsStore((s) => s.error)
  const fetchDaily = useReportsStore((s) => s.fetchDaily)

  const today = React.useMemo(() => dateToMmdd(new Date()), [])
  const [date, setDate] = useLocalStorageState("reports.daily.date", today)
  const [className, setClassName] = useLocalStorageState("reports.daily.class", "")
  const [statusFilter, setStatusFilter] = React.useState<AttendanceStatus | "all">("all")

  const filteredDetails = React.useMemo(() => {
    if (!daily) return []
    if (statusFilter === "all") return daily.details
    return daily.details.filter((d) => d.status === statusFilter)
  }, [daily, statusFilter])

  const handleQuery = React.useCallback(async () => {
    if (!date) {
      toast.error("请选择日期")
      return
    }
    await fetchDaily({ date, class: className || undefined })
  }, [className, date, fetchDaily])

  React.useEffect(() => {
    void handleQuery()
  }, [handleQuery])

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

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-4">
              <Label>日期（MM-DD）</Label>
              <MmddPicker value={date} onChange={setDate} disabled={loading} />
            </div>
            <div className="space-y-2 lg:col-span-6">
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
              <Button
                className="w-full lg:w-auto"
                onClick={() => void handleQuery()}
                disabled={loading}
              >
                查询
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:col-span-2 lg:grid-cols-4">
          {loading ? (
            <StatCardsSkeleton count={8} />
          ) : !daily ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">--</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums text-muted-foreground">
                    --
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${statusFilter === "all" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">总人数</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {daily.summary.total_students}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-green-500/50 ${statusFilter === "present" ? "ring-2 ring-green-500" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "present" ? "all" : "present")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">出勤</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-green-600">
                  {daily.summary.present}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-red-500/50 ${statusFilter === "absent" ? "ring-2 ring-red-500" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "absent" ? "all" : "absent")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">旷课</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-red-600">
                  {daily.summary.absent}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-orange-500/50 ${statusFilter === "late" ? "ring-2 ring-orange-500" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "late" ? "all" : "late")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">迟到</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-orange-600">
                  {daily.summary.late}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-yellow-500/50 ${statusFilter === "early_leave" ? "ring-2 ring-yellow-500" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "early_leave" ? "all" : "early_leave")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">早退</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-yellow-600">
                  {daily.summary.early_leave}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-blue-500/50 ${statusFilter === "personal_leave" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "personal_leave" ? "all" : "personal_leave")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">事假</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-blue-600">
                  {daily.summary.personal_leave}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-purple-500/50 ${statusFilter === "sick_leave" ? "ring-2 ring-purple-500" : ""}`}
                onClick={() => setStatusFilter(statusFilter === "sick_leave" ? "all" : "sick_leave")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">病假</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-purple-600">
                  {daily.summary.sick_leave}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">出勤率</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {daily.summary.attendance_rate}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 考勤分布图表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">考勤状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : !daily || daily.summary.total_students === 0 ? (
              <div className="flex h-[200px] items-center justify-center">
                <div className="text-center text-sm text-muted-foreground">
                  <div className="mb-2 text-3xl">📊</div>
                  暂无数据
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {([
                  { key: "present", label: "出勤", value: daily.summary.present, color: "bg-green-500" },
                  { key: "absent", label: "旷课", value: daily.summary.absent, color: "bg-red-500" },
                  { key: "late", label: "迟到", value: daily.summary.late, color: "bg-orange-500" },
                  { key: "early_leave", label: "早退", value: daily.summary.early_leave, color: "bg-yellow-500" },
                  { key: "personal_leave", label: "事假", value: daily.summary.personal_leave, color: "bg-blue-500" },
                  { key: "sick_leave", label: "病假", value: daily.summary.sick_leave, color: "bg-purple-500" },
                ] as const).map((item) => {
                  const percent = daily.summary.total_students > 0
                    ? (item.value / daily.summary.total_students) * 100
                    : 0
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="font-medium tabular-nums">
                          {item.value}
                          <span className="ml-1 text-muted-foreground">({percent.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all ${item.color}`}
                          style={{ width: `${Math.max(percent, 0.5)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              明细（{daily?.date || date}）
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {attendanceStatusMeta[statusFilter].label}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => setStatusFilter("all")}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              共 {filteredDetails.length} 条
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">学号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>班级</TableHead>
                  <TableHead className="w-[120px]">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeletonRows
                    rows={8}
                    columns={[
                      { skeletonClassName: "h-4 w-24" },
                      { skeletonClassName: "h-4 w-20" },
                      { skeletonClassName: "h-4 w-32" },
                      { skeletonClassName: "h-6 w-20" },
                    ]}
                  />
                ) : filteredDetails.length > 0 ? (
                  filteredDetails.map((row) => {
                    const meta = attendanceStatusMeta[row.status]

                    return (
                      <TableRow key={`${row.student_id}-${row.name}`}>
                        <TableCell className="tabular-nums font-medium">
                          {row.student_id}
                        </TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.class}</TableCell>
                        <TableCell>
                          <Badge variant={meta.badgeVariant}>
                            {row.symbol} {meta.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
