"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import type { Attendance, AttendanceStatus } from "@/lib/types"
import { attendanceStatusOptions } from "@/lib/attendance"
import { isValidMmdd } from "@/lib/date"
import { useAttendancesStore } from "@/lib/stores"
import { MmddPicker } from "@/components/common/mmdd-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const attendanceStatusEnumValues = [
  "present",
  "absent",
  "personal_leave",
  "sick_leave",
  "late",
  "early_leave",
] as const

const schema = z.object({
  student_id: z.string().min(1, "请输入学号"),
  date: z
    .string()
    .min(1, "请输入日期")
    .refine((v) => isValidMmdd(v), "日期格式应为 MM-DD"),
  status: z.enum(attendanceStatusEnumValues),
  remark: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function AttendanceFormDialog({
  open,
  onOpenChange,
  attendance,
  defaultDate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance?: Attendance | null
  defaultDate: string
}) {
  const saving = useAttendancesStore((s) => s.saving)
  const createOne = useAttendancesStore((s) => s.createOne)
  const updateOne = useAttendancesStore((s) => s.updateOne)

  const isEdit = Boolean(attendance)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_id: attendance?.student_id ?? "",
      date: attendance?.date ?? defaultDate,
      status: attendance?.status ?? "present",
      remark: attendance?.remark ?? "",
    },
  })

  React.useEffect(() => {
    if (!open) return

    form.reset({
      student_id: attendance?.student_id ?? "",
      date: attendance?.date ?? defaultDate,
      status: attendance?.status ?? "present",
      remark: attendance?.remark ?? "",
    })
  }, [attendance, defaultDate, form, open])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && attendance) {
        await updateOne(attendance.id, {
          status: values.status,
          remark: values.remark || "",
        })
        toast.success("考勤记录已更新")
      } else {
        await createOne({
          student_id: values.student_id,
          date: values.date,
          status: values.status,
          remark: values.remark || "",
        })
        toast.success("考勤记录已创建")
      }

      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑考勤记录" : "新增考勤记录"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "修改考勤状态与备注。"
              : "新增单条考勤记录。日期格式为 MM-DD。"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>学号</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：2024001"
                      {...field}
                      disabled={saving || isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日期（MM-DD）</FormLabel>
                  <FormControl>
                    <MmddPicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={saving || isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>考勤状态</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as AttendanceStatus)}
                    disabled={saving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择状态" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {attendanceStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.symbol} {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="可选"
                      rows={3}
                      {...field}
                      disabled={saving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                取消
              </Button>
              <Button type="submit" disabled={saving}>
                {isEdit ? "保存" : "创建"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
