"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"

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

export function StudentsFilters({
  keyword,
  classValue,
  sortBy,
  order,
  classOptions,
  onChange,
  onSearch,
  onReset,
  disabled,
}: {
  keyword: string
  classValue: string
  sortBy: string
  order: string
  classOptions: Array<{ value: string; label: string }>
  onChange: (patch: {
    keyword?: string
    class?: string
    sort_by?: "student_id" | "name" | "class" | undefined
    order?: "asc" | "desc" | undefined
  }) => void
  onSearch: () => void
  onReset: () => void
  disabled?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-2 md:col-span-2 lg:col-span-4">
            <Label>关键词</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => onChange({ keyword: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSearch()
                }}
                className="pl-8"
                placeholder="按学号或姓名搜索"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>班级</Label>
            <Select
              value={classValue || "__all"}
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

          <div className="space-y-2 lg:col-span-2">
            <Label>排序字段</Label>
            <Select
              value={sortBy || "student_id"}
              onValueChange={(v) =>
                onChange({
                  sort_by: (v || undefined) as "student_id" | "name" | "class" | undefined,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="student_id" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student_id">学号</SelectItem>
                <SelectItem value="name">姓名</SelectItem>
                <SelectItem value="class">班级</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>排序方向</Label>
            <Select
              value={order || "asc"}
              onValueChange={(v) => onChange({ order: (v || undefined) as "asc" | "desc" })}
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

          <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-2 sm:flex-row sm:justify-end md:items-end">
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
