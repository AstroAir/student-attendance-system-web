import type { AttendanceStatus } from "@/lib/types"

export const attendanceStatusMeta: Record<
  AttendanceStatus,
  {
    label: string
    symbol: string
    badgeVariant: "default" | "secondary" | "outline" | "destructive"
  }
> = {
  present: { label: "出勤", symbol: "√", badgeVariant: "secondary" },
  absent: { label: "旷课", symbol: "X", badgeVariant: "destructive" },
  personal_leave: { label: "事假", symbol: "△", badgeVariant: "outline" },
  sick_leave: { label: "病假", symbol: "○", badgeVariant: "outline" },
  late: { label: "迟到", symbol: "+", badgeVariant: "default" },
  early_leave: { label: "早退", symbol: "–", badgeVariant: "default" },
}

export const attendanceStatusOptions = (
  Object.keys(attendanceStatusMeta) as AttendanceStatus[]
).map((value) => ({
  value,
  ...attendanceStatusMeta[value],
}))
