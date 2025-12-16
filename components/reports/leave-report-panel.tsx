"use client"

import * as React from "react"
import { toast } from "sonner"

import { dateToMmdd } from "@/lib/date"
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

type LeaveType = "personal_leave" | "sick_leave" | ""

export function LeaveReportPanel({
  classOptions,
  loadingClasses,
}: {
  classOptions: Array<{ value: string; label: string }>
  loadingClasses: boolean
}) {
  const leave = useReportsStore((s) => s.leave)
  const loading = useReportsStore((s) => s.loading)
  const error = useReportsStore((s) => s.error)
  const fetchLeave = useReportsStore((s) => s.fetchLeave)

  const { today, weekAgo } = React.useMemo(() => {
    const now = new Date()
    const week = new Date(now)
    week.setDate(now.getDate() - 6)
    return { today: dateToMmdd(now), weekAgo: dateToMmdd(week) }
  }, [])
  const [startDate, setStartDate] = useLocalStorageState("reports.leave.startDate", weekAgo)
  const [endDate, setEndDate] = useLocalStorageState("reports.leave.endDate", today)
  const [className, setClassName] = useLocalStorageState("reports.leave.class", "")
  const [type, setType] = useLocalStorageState<LeaveType>("reports.leave.type", "")
  const [cardFilter, setCardFilter] = React.useState<LeaveType>("")

  const filteredRecords = React.useMemo(() => {
    if (!leave) return []
    if (!cardFilter) return leave.leave_records
    return leave.leave_records.filter((r) => r.type === cardFilter)
  }, [leave, cardFilter])

  const leaveTypeLabels: Record<"personal_leave" | "sick_leave", string> = {
    personal_leave: "事假",
    sick_leave: "病假",
  }

  const handleQuery = React.useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("请选择日期范围")
      return
    }
    await fetchLeave({
      start_date: startDate,
      end_date: endDate,
      class: className || undefined,
      type: type || undefined,
    })
  }, [className, endDate, fetchLeave, startDate, type])

  React.useEffect(() => {
    void handleQuery()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            <div className="space-y-2 lg:col-span-2">
              <Label>开始日期</Label>
              <MmddPicker value={startDate} onChange={setStartDate} disabled={loading} />
            </div>
            <div className="space-y-2 lg:col-span-2">
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
            <div className="space-y-2 lg:col-span-2">
              <Label>请假类型</Label>
              <Select
                value={type || "__all"}
                onValueChange={(v) => setType(v === "__all" ? "" : (v as LeaveType))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">全部</SelectItem>
                  <SelectItem value="personal_leave">事假</SelectItem>
                  <SelectItem value="sick_leave">病假</SelectItem>
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

      <div className="grid gap-4 lg:grid-cols-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-3 lg:col-span-3">
          {loading ? (
            <StatCardsSkeleton count={3} />
          ) : !leave ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
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
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${cardFilter === "" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setCardFilter("")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">请假总数</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {leave.statistics.total_leave}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-blue-500/50 ${cardFilter === "personal_leave" ? "ring-2 ring-blue-500" : ""}`}
                onClick={() => setCardFilter(cardFilter === "personal_leave" ? "" : "personal_leave")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">事假</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-blue-600">
                  {leave.statistics.personal_leave_count}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-purple-500/50 ${cardFilter === "sick_leave" ? "ring-2 ring-purple-500" : ""}`}
                onClick={() => setCardFilter(cardFilter === "sick_leave" ? "" : "sick_leave")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">病假</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-purple-600">
                  {leave.statistics.sick_leave_count}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 请假分布图表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">请假类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[100px] items-center justify-center">
                <div className="text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : !leave || leave.statistics.total_leave === 0 ? (
              <div className="flex h-[100px] items-center justify-center">
                <div className="text-center text-sm text-muted-foreground">
                  <div className="mb-2 text-3xl">📅</div>
                  无请假记录
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {([
                  { key: "personal_leave", label: "事假", value: leave.statistics.personal_leave_count, color: "bg-blue-500" },
                  { key: "sick_leave", label: "病假", value: leave.statistics.sick_leave_count, color: "bg-purple-500" },
                ] as const).map((item) => {
                  const percent = leave.statistics.total_leave > 0
                    ? (item.value / leave.statistics.total_leave) * 100
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
              请假记录
              {cardFilter && (
                <Badge variant="secondary" className="ml-2">
                  {leaveTypeLabels[cardFilter]}
                  <button
                    className="ml-1 hover:text-destructive"
                    onClick={() => setCardFilter("")}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              共 {filteredRecords.length} 条
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">日期</TableHead>
              <TableHead className="w-[140px]">学号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>班级</TableHead>
              <TableHead className="w-[120px]">类型</TableHead>
              <TableHead>备注</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows
                rows={10}
                columns={[
                  { skeletonClassName: "h-4 w-12" },
                  { skeletonClassName: "h-4 w-24" },
                  { skeletonClassName: "h-4 w-20" },
                  { skeletonClassName: "h-4 w-28" },
                  { skeletonClassName: "h-6 w-20" },
                  { skeletonClassName: "h-4 w-36" },
                ]}
              />
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((row, idx) => (
                <TableRow key={`${row.student_id}-${row.date}-${idx}`}>
                  <TableCell className="tabular-nums">{row.date}</TableCell>
                  <TableCell className="tabular-nums font-medium">{row.student_id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.class}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.type === "personal_leave" ? "事假" : "病假"}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate" title={row.remark}>
                    {row.remark || "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
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
