"use client"

import * as React from "react"
import { toast } from "sonner"

import { dateToMmdd } from "@/lib/date"
import { attendanceStatusMeta } from "@/lib/attendance"
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

type AbnormalType = "absent" | "late" | "early_leave" | ""

export function AbnormalReportPanel({
  classOptions,
  loadingClasses,
}: {
  classOptions: Array<{ value: string; label: string }>
  loadingClasses: boolean
}) {
  const abnormal = useReportsStore((s) => s.abnormal)
  const loading = useReportsStore((s) => s.loading)
  const error = useReportsStore((s) => s.error)
  const fetchAbnormal = useReportsStore((s) => s.fetchAbnormal)

  const { today, weekAgo } = React.useMemo(() => {
    const now = new Date()
    const week = new Date(now)
    week.setDate(now.getDate() - 6)
    return { today: dateToMmdd(now), weekAgo: dateToMmdd(week) }
  }, [])
  const [startDate, setStartDate] = useLocalStorageState("reports.abnormal.startDate", weekAgo)
  const [endDate, setEndDate] = useLocalStorageState("reports.abnormal.endDate", today)
  const [className, setClassName] = useLocalStorageState("reports.abnormal.class", "")
  const [type, setType] = useLocalStorageState<AbnormalType>("reports.abnormal.type", "")
  const [cardFilter, setCardFilter] = React.useState<AbnormalType>("")

  const filteredRecords = React.useMemo(() => {
    if (!abnormal) return []
    if (!cardFilter) return abnormal.abnormal_records
    return abnormal.abnormal_records.filter((r) => r.status === cardFilter)
  }, [abnormal, cardFilter])

  const handleQuery = React.useCallback(async () => {
    if (!startDate || !endDate) {
      toast.error("请选择日期范围")
      return
    }
    await fetchAbnormal({
      start_date: startDate,
      end_date: endDate,
      class: className || undefined,
      type: type || undefined,
    })
  }, [className, endDate, fetchAbnormal, startDate, type])

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
              <Label>异常类型</Label>
              <Select
                value={type || "__all"}
                onValueChange={(v) => setType(v === "__all" ? "" : (v as AbnormalType))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">全部</SelectItem>
                  <SelectItem value="absent">旷课</SelectItem>
                  <SelectItem value="late">迟到</SelectItem>
                  <SelectItem value="early_leave">早退</SelectItem>
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:col-span-3 lg:grid-cols-4">
          {loading ? (
            <StatCardsSkeleton count={4} />
          ) : !abnormal ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
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
                  <CardTitle className="text-sm">异常总数</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums">
                  {abnormal.statistics.total_abnormal}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-red-500/50 ${cardFilter === "absent" ? "ring-2 ring-red-500" : ""}`}
                onClick={() => setCardFilter(cardFilter === "absent" ? "" : "absent")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">旷课</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-red-600">
                  {abnormal.statistics.absent_count}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-orange-500/50 ${cardFilter === "late" ? "ring-2 ring-orange-500" : ""}`}
                onClick={() => setCardFilter(cardFilter === "late" ? "" : "late")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">迟到</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-orange-600">
                  {abnormal.statistics.late_count}
                </CardContent>
              </Card>
              <Card
                className={`cursor-pointer transition-all hover:ring-2 hover:ring-yellow-500/50 ${cardFilter === "early_leave" ? "ring-2 ring-yellow-500" : ""}`}
                onClick={() => setCardFilter(cardFilter === "early_leave" ? "" : "early_leave")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">早退</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-semibold tabular-nums text-yellow-600">
                  {abnormal.statistics.early_leave_count}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 异常分布图表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">异常类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[120px] items-center justify-center">
                <div className="text-sm text-muted-foreground">加载中...</div>
              </div>
            ) : !abnormal || abnormal.statistics.total_abnormal === 0 ? (
              <div className="flex h-[120px] items-center justify-center">
                <div className="text-center text-sm text-muted-foreground">
                  <div className="mb-2 text-3xl">✅</div>
                  无异常记录
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {([
                  { key: "absent", label: "旷课", value: abnormal.statistics.absent_count, color: "bg-red-500" },
                  { key: "late", label: "迟到", value: abnormal.statistics.late_count, color: "bg-orange-500" },
                  { key: "early_leave", label: "早退", value: abnormal.statistics.early_leave_count, color: "bg-yellow-500" },
                ] as const).map((item) => {
                  const percent = abnormal.statistics.total_abnormal > 0
                    ? (item.value / abnormal.statistics.total_abnormal) * 100
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
              异常记录
              {cardFilter && (
                <Badge variant="secondary" className="ml-2">
                  {attendanceStatusMeta[cardFilter].label}
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
              <TableHead className="w-[140px]">状态</TableHead>
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
              filteredRecords.map((row, idx) => {
                const meta = attendanceStatusMeta[row.status]
                return (
                  <TableRow key={`${row.student_id}-${row.date}-${idx}`}>
                    <TableCell className="tabular-nums">{row.date}</TableCell>
                    <TableCell className="tabular-nums font-medium">{row.student_id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.class}</TableCell>
                    <TableCell>
                      <Badge variant={meta.badgeVariant}>
                        {row.symbol} {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate" title={row.remark}>
                      {row.remark || "-"}
                    </TableCell>
                  </TableRow>
                )
              })
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
