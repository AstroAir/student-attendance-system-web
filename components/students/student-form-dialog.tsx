"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Student } from "@/lib/types"
import { useStudentsStore } from "@/lib/stores"
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

const schema = z.object({
  student_id: z.string().min(1, "请输入学号"),
  name: z.string().min(1, "请输入姓名"),
  class: z.string().min(1, "请选择班级"),
})

type FormValues = z.infer<typeof schema>

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  classOptions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  classOptions: Array<{ value: string; label: string }>
}) {
  const saving = useStudentsStore((s) => s.saving)
  const createOne = useStudentsStore((s) => s.createOne)
  const updateOne = useStudentsStore((s) => s.updateOne)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_id: student?.student_id ?? "",
      name: student?.name ?? "",
      class: student?.class ?? "",
    },
  })

  React.useEffect(() => {
    form.reset({
      student_id: student?.student_id ?? "",
      name: student?.name ?? "",
      class: student?.class ?? "",
    })
  }, [student, form])

  const isEdit = Boolean(student)

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit && student) {
        await updateOne(student.student_id, {
          name: values.name,
          class: values.class,
        })
        toast.success("学生信息已更新")
      } else {
        await createOne(values)
        toast.success("学生已创建")
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
          <DialogTitle>{isEdit ? "编辑学生" : "新增学生"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "修改学生姓名与班级信息。"
              : "创建新的学生记录，学号不可重复。"}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：张三" {...field} disabled={saving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>班级</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={saving}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="请选择班级" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
