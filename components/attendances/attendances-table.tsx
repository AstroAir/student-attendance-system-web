"use client"

import * as React from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import type { Attendance } from "@/lib/types"
import { attendanceStatusMeta } from "@/lib/attendance"
import { useAttendancesStore } from "@/lib/stores"
import { Badge } from "@/components/ui/badge"
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

export function AttendancesTable({
  items,
  loading,
  onEdit,
}: {
  items: Attendance[]
  loading: boolean
  onEdit: (attendance: Attendance) => void
}) {
  const removeOne = useAttendancesStore((s) => s.removeOne)
  const saving = useAttendancesStore((s) => s.saving)

  async function handleDelete(attendance: Attendance) {
    try {
      await removeOne(attendance.id)
      toast.success("考勤记录已删除")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败")
    }
  }

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="min-w-[820px] rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[90px]">日期</TableHead>
              <TableHead className="w-[140px]">学号</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead className="hidden md:table-cell">班级</TableHead>
              <TableHead className="w-[140px]">状态</TableHead>
              <TableHead className="hidden lg:table-cell">备注</TableHead>
              <TableHead className="w-[80px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeletonRows
                rows={8}
                columns={[
                  { skeletonClassName: "h-4 w-12" },
                  { skeletonClassName: "h-4 w-24" },
                  { skeletonClassName: "h-4 w-16" },
                  { cellClassName: "hidden md:table-cell", skeletonClassName: "h-4 w-28" },
                  { skeletonClassName: "h-6 w-20" },
                  { cellClassName: "hidden lg:table-cell", skeletonClassName: "h-4 w-36" },
                  { cellClassName: "text-right", skeletonClassName: "ml-auto h-8 w-8" },
                ]}
              />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  暂无考勤记录
                </TableCell>
              </TableRow>
            ) : (
              items.map((a) => {
                const meta = attendanceStatusMeta[a.status]

                return (
                  <TableRow key={a.id}>
                    <TableCell className="tabular-nums">{a.date}</TableCell>
                    <TableCell className="font-medium tabular-nums">{a.student_id}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{a.class}</TableCell>
                    <TableCell>
                      <Badge variant={meta.badgeVariant}>
                        {a.status_symbol} {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="hidden lg:table-cell max-w-[240px] truncate"
                      title={a.remark}
                    >
                      {a.remark || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="更多操作">
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(a)}>
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
                                  将删除 {a.name}（{a.student_id}）在 {a.date} 的考勤记录。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={saving}>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  disabled={saving}
                                  onClick={() => {
                                    void handleDelete(a)
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
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  )
}
