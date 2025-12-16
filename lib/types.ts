export type AttendanceStatus =
  | "present"
  | "absent"
  | "personal_leave"
  | "sick_leave"
  | "late"
  | "early_leave"

export type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

export type ApiResponseNoData = {
  code: number
  message: string
}

export type ErrorResponse = {
  code: number
  message: string
  errors?: Array<{
    field?: string
    message?: string
  }>
}

export type Student = {
  student_id: string
  name: string
  class: string
}

export type StudentBasic = {
  student_id: string
  name: string
}

export type StudentCreate = {
  student_id: string
  name: string
  class: string
}

export type StudentUpdate = {
  name?: string
  class?: string
}

export type StudentListResponse = {
  total: number
  page: number
  page_size: number
  items: Student[]
}

export type Attendance = {
  id: number
  student_id: string
  name: string
  class: string
  date: string
  status: AttendanceStatus
  status_symbol: string
  remark: string
}

export type AttendanceCreate = {
  student_id: string
  date: string
  status: AttendanceStatus
  remark?: string
}

export type AttendanceBatchCreate = {
  date: string
  records: Array<{
    student_id: string
    status: AttendanceStatus
  }>
}

export type AttendanceUpdate = {
  status?: AttendanceStatus
  remark?: string
}

export type AttendanceListResponse = {
  total: number
  page: number
  page_size: number
  items: Attendance[]
}

export type DatePeriod = {
  start_date: string
  end_date: string
}

export type AttendanceDetailsReport = {
  period: DatePeriod
  records: Array<{
    student_id: string
    name: string
    class: string
    attendance_details: Array<{
      date: string
      status: AttendanceStatus
      symbol: string
    }>
  }>
}

export type DailyReport = {
  date: string
  summary: {
    total_students: number
    present: number
    absent: number
    late: number
    early_leave: number
    personal_leave: number
    sick_leave: number
    attendance_rate: string
  }
  details: Array<{
    student_id: string
    name: string
    class: string
    status: AttendanceStatus
    symbol: string
  }>
}

export type SummaryReport = {
  period: DatePeriod
  summary: Array<{
    student_id: string
    name: string
    class: string
    total_days: number
    present_count: number
    absent_count: number
    late_count: number
    early_leave_count: number
    personal_leave_count: number
    sick_leave_count: number
    attendance_rate: string
  }>
}

export type AbnormalReport = {
  period: DatePeriod
  abnormal_records: Array<{
    student_id: string
    name: string
    class: string
    date: string
    status: AttendanceStatus
    symbol: string
    remark: string
  }>
  statistics: {
    total_abnormal: number
    absent_count: number
    late_count: number
    early_leave_count: number
  }
}

export type LeaveReport = {
  period: DatePeriod
  leave_records: Array<{
    student_id: string
    name: string
    class: string
    date: string
    type: "personal_leave" | "sick_leave"
    symbol: string
    remark: string
  }>
  statistics: {
    total_leave: number
    personal_leave_count: number
    sick_leave_count: number
  }
}

export type ClassInfo = {
  name: string
  student_count: number
}

export type ClassStudentsResponse = {
  class: string
  students: StudentBasic[]
}

export type ImportResult = {
  imported_count: number
  skipped_count: number
  errors: Array<{
    line: number
    message: string
  }>
}
