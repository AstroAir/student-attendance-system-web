"use client"

import {
  RefreshCw,
  Database,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  FileText,
  Thermometer,
  Trash2,
  Plus,
  Search,
} from "lucide-react"
import { useState, useMemo } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { mockDb, isMockEnabled } from "@/lib/mock"
import type { AttendanceStatus } from "@/lib/types"

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; symbol: string; icon: typeof CheckCircle2; color: string }
> = {
  present: { label: "出勤", symbol: "√", icon: CheckCircle2, color: "text-green-500" },
  absent: { label: "旷课", symbol: "X", icon: XCircle, color: "text-red-500" },
  late: { label: "迟到", symbol: "+", icon: Clock, color: "text-orange-500" },
  early_leave: { label: "早退", symbol: "–", icon: LogOut, color: "text-yellow-500" },
  personal_leave: { label: "事假", symbol: "△", icon: FileText, color: "text-blue-500" },
  sick_leave: { label: "病假", symbol: "○", icon: Thermometer, color: "text-purple-500" },
}

export function MockDebugPanel() {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [studentSearch, setStudentSearch] = useState("")
  const [attendanceSearch, setAttendanceSearch] = useState("")

  const mockEnabled = isMockEnabled()

  const stats = useMemo(
    () => {
      if (!mockEnabled) return { students: 0, attendances: 0, classes: 0 }
      return {
        students: mockDb.students.length,
        attendances: mockDb.attendances.length,
        classes: mockDb.getClasses().length,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, mockEnabled]
  )

  const statusStats = useMemo(() => {
    const result: Record<AttendanceStatus, { count: number; percent: string }> = {} as Record<
      AttendanceStatus,
      { count: number; percent: string }
    >
    if (!mockEnabled) {
      for (const status of Object.keys(STATUS_CONFIG) as AttendanceStatus[]) {
        result[status] = { count: 0, percent: "0" }
      }
      return result
    }
    const total = mockDb.attendances.length

    for (const status of Object.keys(STATUS_CONFIG) as AttendanceStatus[]) {
      const count = mockDb.attendances.filter((a) => a.status === status).length
      result[status] = {
        count,
        percent: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
      }
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, mockEnabled])

  const filteredStudents = useMemo(() => {
    if (!mockEnabled) return []
    if (!studentSearch) return mockDb.students.slice(0, 20)
    const search = studentSearch.toLowerCase()
    return mockDb.students
      .filter(
        (s) =>
          s.student_id.toLowerCase().includes(search) ||
          s.name.toLowerCase().includes(search) ||
          s.class.toLowerCase().includes(search)
      )
      .slice(0, 20)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentSearch, refreshKey, mockEnabled])

  const filteredAttendances = useMemo(() => {
    if (!mockEnabled) return []
    if (!attendanceSearch) return mockDb.attendances.slice(0, 20)
    const search = attendanceSearch.toLowerCase()
    return mockDb.attendances
      .filter(
        (a) =>
          a.student_id.toLowerCase().includes(search) ||
          a.name.toLowerCase().includes(search) ||
          a.date.includes(search)
      )
      .slice(0, 20)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceSearch, refreshKey, mockEnabled])

  const handleReset = () => {
    mockDb.reset()
    setRefreshKey((k) => k + 1)
    setStudentSearch("")
    setAttendanceSearch("")
  }

  const handleDeleteStudent = (studentId: string) => {
    mockDb.removeStudent(studentId)
    setRefreshKey((k) => k + 1)
  }

  const handleDeleteAttendance = (id: number) => {
    mockDb.removeAttendance(id)
    setRefreshKey((k) => k + 1)
  }

  if (!mockEnabled) {
    return null
  }

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="fixed bottom-4 right-4 z-50 gap-2 shadow-lg border-primary/20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
              >
                <Database className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Mock</span>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  ON
                </Badge>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>打开 Mock 调试面板</p>
          </TooltipContent>
        </Tooltip>

      <SheetContent className="flex h-full w-full flex-col overflow-hidden sm:max-w-xl" key={refreshKey}>
        <SheetHeader className="shrink-0 space-y-1">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-4 w-4 text-primary" />
            </div>
            Mock 调试面板
          </SheetTitle>
          <SheetDescription>
            查看和管理模拟数据库状态，支持数据浏览和操作
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="py-3">
              <CardContent className="flex flex-col items-center gap-1 p-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-2xl font-bold">{stats.students}</span>
                <span className="text-xs text-muted-foreground">学生</span>
              </CardContent>
            </Card>
            <Card className="py-3">
              <CardContent className="flex flex-col items-center gap-1 p-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                  <Calendar className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-2xl font-bold">{stats.attendances}</span>
                <span className="text-xs text-muted-foreground">考勤记录</span>
              </CardContent>
            </Card>
            <Card className="py-3">
              <CardContent className="flex flex-col items-center gap-1 p-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                  <Building2 className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-2xl font-bold">{stats.classes}</span>
                <span className="text-xs text-muted-foreground">班级</span>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">概览</TabsTrigger>
              <TabsTrigger value="students" className="flex-1">学生</TabsTrigger>
              <TabsTrigger value="attendances" className="flex-1">考勤</TabsTrigger>
            </TabsList>

            {/* 概览 Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              {/* 班级列表 */}
              <Card>
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4" />
                    班级分布
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-2">
                    {mockDb.getClasses().map((c) => (
                      <Badge
                        key={c.name}
                        variant="secondary"
                        className="gap-1.5 px-2.5 py-1"
                      >
                        {c.name}
                        <span className="rounded-full bg-primary/20 px-1.5 text-xs font-semibold">
                          {c.student_count}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 考勤状态分布 */}
              <Card>
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    考勤状态分布
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-3">
                    {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                      const config = STATUS_CONFIG[status]
                      const stat = statusStats[status]
                      const Icon = config.icon
                      const widthPercent = parseFloat(stat.percent)

                      return (
                        <div key={status} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span>{config.symbol} {config.label}</span>
                            </div>
                            <span className="font-medium">
                              {stat.count}
                              <span className="ml-1 text-muted-foreground">
                                ({stat.percent}%)
                              </span>
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full transition-all ${
                                status === "present"
                                  ? "bg-green-500"
                                  : status === "absent"
                                  ? "bg-red-500"
                                  : status === "late"
                                  ? "bg-orange-500"
                                  : status === "early_leave"
                                  ? "bg-yellow-500"
                                  : status === "personal_leave"
                                  ? "bg-blue-500"
                                  : "bg-purple-500"
                              }`}
                              style={{ width: `${Math.max(widthPercent, 1)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 学生 Tab */}
            <TabsContent value="students" className="mt-4">
              <Card>
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      学生列表
                      <Badge variant="outline" className="ml-1">
                        {mockDb.students.length}
                      </Badge>
                    </CardTitle>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                      <Plus className="h-3 w-3" />
                      添加
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索学号、姓名或班级..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="h-9 pl-8"
                    />
                  </div>
                  <ScrollArea className="h-[280px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-24">学号</TableHead>
                          <TableHead>姓名</TableHead>
                          <TableHead>班级</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => (
                          <TableRow key={student.student_id}>
                            <TableCell className="font-mono text-xs">
                              {student.student_id}
                            </TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {student.class}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteStudent(student.student_id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredStudents.length === 0 && (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        未找到匹配的学生
                      </div>
                    )}
                    {filteredStudents.length === 20 && (
                      <div className="py-2 text-center text-xs text-muted-foreground">
                        仅显示前 20 条结果
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 考勤 Tab */}
            <TabsContent value="attendances" className="mt-4">
              <Card>
                <CardHeader className="pb-3 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      考勤记录
                      <Badge variant="outline" className="ml-1">
                        {mockDb.attendances.length}
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索学号、姓名或日期..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="h-9 pl-8"
                    />
                  </div>
                  <ScrollArea className="h-[280px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">日期</TableHead>
                          <TableHead className="w-20">学号</TableHead>
                          <TableHead>姓名</TableHead>
                          <TableHead className="w-16">状态</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAttendances.map((a) => {
                          const config = STATUS_CONFIG[a.status]
                          const Icon = config.icon
                          return (
                            <TableRow key={a.id}>
                              <TableCell className="font-mono text-xs">
                                {a.date}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {a.student_id}
                              </TableCell>
                              <TableCell>{a.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                                  <span className="text-xs">{config.symbol}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteAttendance(a.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    {filteredAttendances.length === 0 && (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        未找到匹配的考勤记录
                      </div>
                    )}
                    {filteredAttendances.length === 20 && (
                      <div className="py-2 text-center text-xs text-muted-foreground">
                        仅显示前 20 条结果
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重置所有数据
            </Button>
          </div>
        </div>
      </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
