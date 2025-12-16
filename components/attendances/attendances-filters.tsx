"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

import type { AttendanceStatus } from "@/lib/types"
import { attendanceStatusOptions } from "@/lib/attendance"
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
import { MmddPicker } from "@/components/common/mmdd-picker"

export function AttendancesFilters({
  values,
  classOptions,
  onChange,
  onSearch,
  onReset,
  disabled,
}: {
  values: {
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
  classOptions: Array<{ value: string; label: string }>
  onChange: (patch: Partial<typeof values>) => void
  onSearch: () => void
  onReset: () => void
  disabled?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-3">
            <Label>学号</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={values.student_id}
                onChange={(e) => onChange({ student_id: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch()
                }}
                className="pl-8"
                placeholder="按学号筛选"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label>姓名</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={values.name}
                onChange={(e) => onChange({ name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch()
                }}
                className="pl-8"
                placeholder="按姓名筛选"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label>班级</Label>
            <Select
              value={values.class || "__all"}
              onValueChange={(v) => onChange({ class: v === "__all" ? "" : v })}
              disabled={disabled}
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

          <div className="space-y-2 lg:col-span-3">
            <Label>状态</Label>
            <Select
              value={values.status || "__all"}
              onValueChange={(v) => {
                const status: AttendanceStatus | "" =
                  v === "__all" ? "" : (v as AttendanceStatus)
                onChange({ status })
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">全部状态</SelectItem>
                {attendanceStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.symbol} {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label>日期（精确）</Label>
            <MmddPicker
              value={values.date}
              onChange={(v) => onChange({ date: v })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label>开始日期</Label>
            <MmddPicker
              value={values.start_date}
              onChange={(v) => onChange({ start_date: v })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label>结束日期</Label>
            <MmddPicker
              value={values.end_date}
              onChange={(v) => onChange({ end_date: v })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-2 lg:col-span-3">
            <Label>排序</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={values.sort_by || "date"}
                onValueChange={(v) =>
                  onChange({ sort_by: v as "student_id" | "name" | "date" })
                }
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student_id">学号</SelectItem>
                  <SelectItem value="name">姓名</SelectItem>
                  <SelectItem value="date">日期</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={values.order || "asc"}
                onValueChange={(v) => onChange({ order: v as "asc" | "desc" })}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="asc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">升序</SelectItem>
                  <SelectItem value="desc">降序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="lg:col-span-12 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              onClick={onReset}
              disabled={disabled}
            >
              重置
            </Button>
            <Button className="w-full sm:w-auto" onClick={onSearch} disabled={disabled}>
              查询
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
