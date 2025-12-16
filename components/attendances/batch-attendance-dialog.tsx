"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { toast } from "sonner"

import type { AttendanceStatus } from "@/lib/types"
import { attendanceStatusMeta, attendanceStatusOptions } from "@/lib/attendance"
import { useAttendancesStore, useClassesStore } from "@/lib/stores"
import { MmddPicker } from "@/components/common/mmdd-picker"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function BatchAttendanceDialog({
  open,
  onOpenChange,
  classOptions,
  defaultDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  classOptions: Array<{ value: string; label: string }>
  defaultDate: string
}) {
  const saving = useAttendancesStore((s) => s.saving)
  const batchCreate = useAttendancesStore((s) => s.batchCreate)

  const classStudents = useClassesStore((s) => s.classStudents)
  const loadingStudents = useClassesStore((s) => s.loadingStudents)
  const fetchClassStudents = useClassesStore((s) => s.fetchClassStudents)

  const [className, setClassName] = React.useState("")
  const [date, setDate] = React.useState(defaultDate)
  const [defaultStatus, setDefaultStatus] = React.useState<AttendanceStatus>(
    "present"
  )

  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const [statusById, setStatusById] = React.useState<
    Record<string, AttendanceStatus>
  >({})

  const [keyword, setKeyword] = React.useState("")
  const [onlySelected, setOnlySelected] = React.useState(false)

  const students = React.useMemo(
    () => classStudents?.students || [],
    [classStudents]
  )

  React.useEffect(() => {
    if (!open) return
    setClassName("")
    setDate(defaultDate)
    setDefaultStatus("present")
    setSelected({})
    setStatusById({})
  }, [defaultDate, open])

  React.useEffect(() => {
    if (!open) return
    if (!className) return
    void fetchClassStudents(className)
  }, [className, fetchClassStudents, open])

  React.useEffect(() => {
    if (!students.length) return

    setSelected((prev) => {
      const next = { ...prev }
      for (const s of students) {
        if (next[s.student_id] === undefined) next[s.student_id] = true
      }
      return next
    })

    setStatusById((prev) => {
      const next = { ...prev }
      for (const s of students) {
        if (next[s.student_id] === undefined) next[s.student_id] = defaultStatus
      }
      return next
    })
  }, [defaultStatus, students])

  const filteredStudents = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return students.filter((s) => {
      if (onlySelected && !selected[s.student_id]) return false
      if (!kw) return true
      return (
        s.student_id.toLowerCase().includes(kw) ||
        s.name.toLowerCase().includes(kw)
      )
    })
  }, [keyword, onlySelected, selected, students])

  function toggleAll(value: boolean) {
    const next: Record<string, boolean> = {}
    for (const s of students) next[s.student_id] = value
    setSelected(next)
  }

  function applyDefaultToSelected() {
    setStatusById((prev) => {
      const next = { ...prev }
      for (const s of students) {
        if (selected[s.student_id]) {
          next[s.student_id] = defaultStatus
        }
      }
      return next
    })
  }

  async function handleSubmit() {
    if (!className) {
      toast.error("请选择班级")
      return
    }

    if (!date) {
      toast.error("请选择日期")
      return
    }

    const chosen = students.filter((s) => selected[s.student_id])

    if (chosen.length === 0) {
      toast.error("请至少选择一名学生")
      return
    }

    try {
      const res = await batchCreate({
        date,
        records: chosen.map((s) => ({
          student_id: s.student_id,
          status: statusById[s.student_id] || defaultStatus,
        })),
      })

      toast.success(`批量创建成功：${res.created_count} 条`)
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "批量创建失败")
    }
  }

  const selectedCount = students.filter((s) => selected[s.student_id]).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90svh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>批量新增考勤记录</DialogTitle>
          <DialogDescription>
            选择班级与日期，并为学生批量设置考勤状态。
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>班级</Label>
                <Select
                  value={className}
                  onValueChange={(v) => setClassName(v)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择班级" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>日期（MM-DD）</Label>
                <MmddPicker value={date} onChange={setDate} disabled={saving} />
              </div>

              <div className="space-y-2">
                <Label>默认状态</Label>
                <Select
                  value={defaultStatus}
                  onValueChange={(v) => setDefaultStatus(v as AttendanceStatus)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.symbol} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="space-y-1 lg:col-span-3">
                  <div className="text-sm font-medium">
                    学生列表{className ? `（${className}）` : ""}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    已选 {selectedCount} 人
                    {filteredStudents.length !== students.length
                      ? `，当前显示 ${filteredStudents.length} 人`
                      : ""}
                  </div>
                </div>

                <div className="space-y-2 lg:col-span-5">
                  <Label>搜索</Label>
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      className="pl-8"
                      placeholder="按学号/姓名搜索"
                      disabled={saving || loadingStudents || students.length === 0}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:col-span-2 lg:justify-end">
                  <Checkbox
                    checked={onlySelected}
                    onCheckedChange={(v) => setOnlySelected(v === true)}
                    disabled={saving || students.length === 0}
                  />
                  <div className="text-sm">只看已选</div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:col-span-2 lg:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAll(true)}
                    disabled={saving || loadingStudents || students.length === 0}
                  >
                    全选
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAll(false)}
                    disabled={saving || loadingStudents || students.length === 0}
                  >
                    全不选
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyDefaultToSelected}
                    disabled={saving || loadingStudents || students.length === 0}
                  >
                    应用默认
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                {loadingStudents ? (
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <Skeleton className="h-6 w-52" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                    ))}
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    {className ? "该班级暂无学生" : "请选择班级以加载学生"}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    无匹配学生
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredStudents.map((s) => {
                      const checked = Boolean(selected[s.student_id])
                      const st = statusById[s.student_id] || defaultStatus
                      const meta = attendanceStatusMeta[st]

                      return (
                        <div
                          key={s.student_id}
                          className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setSelected((prev) => ({
                                  ...prev,
                                  [s.student_id]: v === true,
                                }))
                              }}
                              disabled={saving}
                            />
                            <div className="text-sm">
                              <div className="font-medium">
                                {s.name}{" "}
                                <span className="text-muted-foreground">({s.student_id})</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                当前：{meta.symbol} {meta.label}
                              </div>
                            </div>
                          </div>

                          <div className="sm:w-[180px]">
                            <Select
                              value={st}
                              onValueChange={(v) =>
                                setStatusById((prev) => ({
                                  ...prev,
                                  [s.student_id]: v as AttendanceStatus,
                                }))
                              }
                              disabled={saving || !checked}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="请选择" />
                              </SelectTrigger>
                              <SelectContent>
                                {attendanceStatusOptions.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.symbol} {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 border-t pt-4 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            取消
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={saving}>
            提交
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
