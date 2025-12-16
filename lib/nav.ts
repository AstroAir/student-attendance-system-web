import type { LucideIcon } from "lucide-react"
import {
  BarChart3Icon,
  BookOpenCheckIcon,
  DatabaseIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  UsersIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "仪表盘", href: "/", icon: LayoutDashboardIcon },
  { title: "学生管理", href: "/students", icon: UsersIcon },
  { title: "考勤记录", href: "/attendances", icon: BookOpenCheckIcon },
  { title: "统计报表", href: "/reports", icon: BarChart3Icon },
  { title: "班级管理", href: "/classes", icon: GraduationCapIcon },
  { title: "数据导入导出", href: "/data", icon: DatabaseIcon },
]
