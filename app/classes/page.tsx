"use client"

import * as React from "react"
import { toast } from "sonner"

import { useClassesStore } from "@/lib/stores"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"
import { TableSkeletonRows } from "@/components/common/table-skeleton-rows"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ClassesPage() {
  const classes = useClassesStore((s) => s.classes)
  const selectedClass = useClassesStore((s) => s.selectedClass)
  const classStudents = useClassesStore((s) => s.classStudents)
  const loadingClasses = useClassesStore((s) => s.loadingClasses)
  const loadingStudents = useClassesStore((s) => s.loadingStudents)
  const error = useClassesStore((s) => s.error)

  const fetchClasses = useClassesStore((s) => s.fetchClasses)
  const fetchClassStudents = useClassesStore((s) => s.fetchClassStudents)
  const selectClass = useClassesStore((s) => s.selectClass)

  const [didInit, setDidInit] = React.useState(false)
  const [didRestore, setDidRestore] = React.useState(false)
  const [storedSelectedClass, setStoredSelectedClass] = useLocalStorageState(
    "classes.selectedClass",
    ""
  )

  React.useEffect(() => {
    void fetchClasses().finally(() => {
      setDidInit(true)
    })
  }, [fetchClasses])

  React.useEffect(() => {
    if (!didInit) return
    if (didRestore) return
    if (loadingClasses) return

    const saved = storedSelectedClass || null
    if (!saved) {
      setDidRestore(true)
      return
    }

    const exists = classes.some((c) => c.name === saved)
    if (exists) {
      selectClass(saved)
    } else {
      setStoredSelectedClass("")
      selectClass(null)
    }

    setDidRestore(true)
  }, [classes, didInit, didRestore, loadingClasses, selectClass, setStoredSelectedClass, storedSelectedClass])

  React.useEffect(() => {
    if (!didRestore) return
    if (selectedClass) {
      setStoredSelectedClass(selectedClass)
    } else if (storedSelectedClass) {
      setStoredSelectedClass("")
    }
  }, [didRestore, selectedClass, setStoredSelectedClass, storedSelectedClass])

  React.useEffect(() => {
    if (!selectedClass) return
    void fetchClassStudents(selectedClass)
  }, [fetchClassStudents, selectedClass])

  React.useEffect(() => {
    if (error) {
      toast.error(error, {
        action: {
          label: "重试",
          onClick: () => void fetchClasses(),
        },
      })
    }
  }, [error, fetchClasses])

  async function handleRefresh() {
    await fetchClasses()
    if (selectedClass) {
      await fetchClassStudents(selectedClass)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="班级管理"
        description="查看班级列表与班级学生信息。"
        actions={
          <Button variant="outline" onClick={() => void handleRefresh()} disabled={loadingClasses}>
            刷新
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">班级列表</CardTitle>
          </CardHeader>
          <CardContent>
            {didInit && !loadingClasses && classes.length === 0 ? (
              <EmptyState
                title="暂无班级数据"
                description="请先在后端导入/创建班级与学生数据。"
                action={
                  <Button variant="outline" onClick={() => void fetchClasses()}>
                    刷新
                  </Button>
                }
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>班级</TableHead>
                      <TableHead className="w-[110px]">人数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingClasses ? (
                      <TableSkeletonRows
                        rows={8}
                        columns={[{ skeletonClassName: "h-4 w-32" }, { skeletonClassName: "h-4 w-16" }]}
                      />
                    ) : (
                      classes.map((c) => (
                        <TableRow
                          key={c.name}
                          className={
                            selectedClass === c.name
                              ? "bg-accent/40"
                              : "cursor-pointer hover:bg-accent/30"
                          }
                          onClick={() => {
                            selectClass(c.name)
                          }}
                        >
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="tabular-nums">{c.student_count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">班级学生</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {selectedClass ? `当前班级：${selectedClass}` : "请选择左侧班级"}
            </div>

            <Separator />

            {selectedClass && classStudents && !loadingStudents && classStudents.students.length === 0 ? (
              <EmptyState
                title="该班级暂无学生"
                description="请先导入/创建该班级的学生数据。"
                action={
                  <Button variant="outline" onClick={() => void fetchClassStudents(selectedClass)}>
                    刷新
                  </Button>
                }
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">学号</TableHead>
                      <TableHead>姓名</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingStudents ? (
                      <TableSkeletonRows
                        rows={8}
                        columns={[{ skeletonClassName: "h-4 w-24" }, { skeletonClassName: "h-4 w-20" }]}
                      />
                    ) : selectedClass && classStudents && classStudents.students.length > 0 ? (
                      classStudents.students.map((s) => (
                        <TableRow key={s.student_id}>
                          <TableCell className="tabular-nums font-medium">{s.student_id}</TableCell>
                          <TableCell>{s.name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                          {selectedClass ? "该班级暂无学生" : "请选择班级"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
