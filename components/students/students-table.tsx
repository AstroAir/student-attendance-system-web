"use client"

import * as React from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import type { Student } from "@/lib/types"
import { useStudentsStore } from "@/lib/stores"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function StudentsTable({
  items,
  loading,
  onEdit,
}: {
  items: Student[]
  loading: boolean
  onEdit: (student: Student) => void
}) {
  const removeOne = useStudentsStore((s) => s.removeOne)
  const saving = useStudentsStore((s) => s.saving)

  async function handleDelete(student: Student) {
    try {
      await removeOne(student.student_id)
      toast.success("学生已删除")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    }
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="min-w-[520px] rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">学号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead className="hidden sm:table-cell">班级</TableHead>
              <TableHead className="w-[80px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows
                rows={8}
                columns={[
                  { skeletonClassName: "h-4 w-24" },
                  { skeletonClassName: "h-4 w-20" },
                  { cellClassName: "hidden sm:table-cell", skeletonClassName: "h-4 w-32" },
                  { cellClassName: "text-right", skeletonClassName: "ml-auto h-8 w-8" },
                ]}
              />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  暂无学生数据
                </TableCell>
              </TableRow>
            ) : (
              items.map((s) => (
                <TableRow key={s.student_id}>
                  <TableCell className="font-medium tabular-nums">{s.student_id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{s.class}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="更多操作">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(s)}>
                          <PencilIcon />
                          编辑
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2Icon />
                              删除
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除？</AlertDialogTitle>
                              <AlertDialogDescription>
                                将删除学生：{s.name}（{s.student_id}）。此操作不可撤销。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={saving}>取消</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={saving}
                                onClick={() => {
                                  void handleDelete(s)
                                }}
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}
