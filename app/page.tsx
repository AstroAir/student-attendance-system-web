import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">仪表盘</h1>
        <p className="text-sm text-muted-foreground">
          在这里快速进入各模块，完成学生管理、考勤录入与统计分析。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link href="/students" className="block">
          <Card className="h-full hover:bg-accent/30 transition-colors">
            <CardHeader>
              <CardTitle>学生管理</CardTitle>
              <CardDescription>新增、编辑、删除学生信息</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">支持分页、排序和筛选。</CardContent>
          </Card>
        </Link>

        <Link href="/attendances" className="block">
          <Card className="h-full hover:bg-accent/30 transition-colors">
            <CardHeader>
              <CardTitle>考勤记录</CardTitle>
              <CardDescription>单条录入 / 批量录入 / 修改记录</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">支持按日期、班级、状态等筛选。</CardContent>
          </Card>
        </Link>

        <Link href="/reports" className="block">
          <Card className="h-full hover:bg-accent/30 transition-colors">
            <CardHeader>
              <CardTitle>统计报表</CardTitle>
              <CardDescription>日报、明细、汇总、异常、请假</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">快速查看统计结果与异常情况。</CardContent>
          </Card>
        </Link>

        <Link href="/classes" className="block">
          <Card className="h-full hover:bg-accent/30 transition-colors">
            <CardHeader>
              <CardTitle>班级管理</CardTitle>
              <CardDescription>查看班级列表及班级学生</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">用于批量考勤录入前的学生选择。</CardContent>
          </Card>
        </Link>

        <Link href="/data" className="block">
          <Card className="h-full hover:bg-accent/30 transition-colors">
            <CardHeader>
              <CardTitle>数据导入导出</CardTitle>
              <CardDescription>导入 JSON/CSV，导出 JSON/CSV</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">支持学生与考勤数据。</CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
