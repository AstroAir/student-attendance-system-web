import type {
  AbnormalReport,
  ApiResponse,
  Attendance,
  AttendanceBatchCreate,
  AttendanceCreate,
  AttendanceDetailsReport,
  AttendanceListResponse,
  AttendanceStatus,
  AttendanceUpdate,
  ClassInfo,
  ClassStudentsResponse,
  DailyReport,
  ImportResult,
  LeaveReport,
  Student,
  StudentCreate,
  StudentListResponse,
  StudentUpdate,
  SummaryReport,
} from "@/lib/types"
import { mockDb } from "./data"

type MockResponse<T> = ApiResponse<T>

function success<T>(data: T, code = 200): MockResponse<T> {
  return { code, message: "success", data }
}

function error(message: string, code = 400): MockResponse<never> {
  return { code, message, data: undefined as never }
}

function parseQuery(url: string): URLSearchParams {
  const idx = url.indexOf("?")
  return new URLSearchParams(idx >= 0 ? url.slice(idx + 1) : "")
}

function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; total: number; page: number; page_size: number } {
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    page_size: pageSize,
  }
}

function sortItems<T>(items: T[], sortBy: keyof T | undefined, order: "asc" | "desc" = "asc"): T[] {
  if (!sortBy) return items
  return [...items].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    if (aVal === bVal) return 0
    const cmp = aVal < bVal ? -1 : 1
    return order === "desc" ? -cmp : cmp
  })
}

function filterStudents(
  students: Student[],
  params: { class?: string; keyword?: string }
): Student[] {
  let result = students
  if (params.class) {
    result = result.filter((s) => s.class === params.class)
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    result = result.filter(
      (s) =>
        s.student_id.toLowerCase().includes(kw) ||
        s.name.toLowerCase().includes(kw)
    )
  }
  return result
}

function filterAttendances(
  attendances: Attendance[],
  params: {
    student_id?: string
    name?: string
    class?: string
    date?: string
    start_date?: string
    end_date?: string
    status?: AttendanceStatus
  }
): Attendance[] {
  let result = attendances

  if (params.student_id) {
    result = result.filter((a) => a.student_id === params.student_id)
  }
  if (params.name) {
    const name = params.name.toLowerCase()
    result = result.filter((a) => a.name.toLowerCase().includes(name))
  }
  if (params.class) {
    result = result.filter((a) => a.class === params.class)
  }
  if (params.date) {
    result = result.filter((a) => a.date === params.date)
  }
  if (params.start_date) {
    result = result.filter((a) => a.date >= params.start_date!)
  }
  if (params.end_date) {
    result = result.filter((a) => a.date <= params.end_date!)
  }
  if (params.status) {
    result = result.filter((a) => a.status === params.status)
  }

  return result
}

export const mockHandlers = {
  // ==================== Students ====================
  "GET /students": (url: string): MockResponse<StudentListResponse> => {
    const q = parseQuery(url)
    const page = parseInt(q.get("page") || "1", 10)
    const pageSize = parseInt(q.get("page_size") || "20", 10)
    const sortBy = q.get("sort_by") as "student_id" | "name" | "class" | null
    const order = (q.get("order") || "asc") as "asc" | "desc"

    let students = filterStudents(mockDb.students, {
      class: q.get("class") || undefined,
      keyword: q.get("keyword") || undefined,
    })
    students = sortItems(students, sortBy || undefined, order)
    return success(paginate(students, page, pageSize))
  },

  "POST /students": (_url: string, body: StudentCreate): MockResponse<Student> => {
    if (mockDb.getStudentById(body.student_id)) {
      return error("学号已存在", 409)
    }
    const student = mockDb.addStudent({
      student_id: body.student_id,
      name: body.name,
      class: body.class,
    })
    return success(student, 201)
  },

  "GET /students/:id": (url: string): MockResponse<Student> => {
    const studentId = url.split("/students/")[1]?.split("?")[0]
    const student = mockDb.getStudentById(studentId)
    if (!student) return error("学生不存在", 404)
    return success(student)
  },

  "PUT /students/:id": (url: string, body: StudentUpdate): MockResponse<Student> => {
    const studentId = url.split("/students/")[1]?.split("?")[0]
    const student = mockDb.updateStudent(studentId, body)
    if (!student) return error("学生不存在", 404)
    return success(student)
  },

  "DELETE /students/:id": (url: string): MockResponse<undefined> => {
    const studentId = url.split("/students/")[1]?.split("?")[0]
    if (!mockDb.removeStudent(studentId)) {
      return error("学生不存在", 404)
    }
    return { code: 204, message: "success", data: undefined }
  },

  // ==================== Attendances ====================
  "GET /attendances": (url: string): MockResponse<AttendanceListResponse> => {
    const q = parseQuery(url)
    const page = parseInt(q.get("page") || "1", 10)
    const pageSize = parseInt(q.get("page_size") || "20", 10)
    const sortBy = q.get("sort_by") as "student_id" | "name" | "date" | null
    const order = (q.get("order") || "asc") as "asc" | "desc"

    let attendances = filterAttendances(mockDb.attendances, {
      student_id: q.get("student_id") || undefined,
      name: q.get("name") || undefined,
      class: q.get("class") || undefined,
      date: q.get("date") || undefined,
      start_date: q.get("start_date") || undefined,
      end_date: q.get("end_date") || undefined,
      status: (q.get("status") as AttendanceStatus) || undefined,
    })
    attendances = sortItems(attendances, sortBy || undefined, order)
    return success(paginate(attendances, page, pageSize))
  },

  "POST /attendances": (_url: string, body: AttendanceCreate): MockResponse<Attendance> => {
    const attendance = mockDb.addAttendance(body)
    if (!attendance) return error("学生不存在", 404)
    return success(attendance, 201)
  },

  "POST /attendances/batch": (
    _url: string,
    body: AttendanceBatchCreate
  ): MockResponse<{ created_count: number }> => {
    let count = 0
    for (const record of body.records) {
      const result = mockDb.addAttendance({
        student_id: record.student_id,
        date: body.date,
        status: record.status,
      })
      if (result) count++
    }
    return success({ created_count: count }, 201)
  },

  "GET /attendances/:id": (url: string): MockResponse<Attendance> => {
    const id = parseInt(url.split("/attendances/")[1]?.split("?")[0], 10)
    const attendance = mockDb.getAttendanceById(id)
    if (!attendance) return error("考勤记录不存在", 404)
    return success(attendance)
  },

  "PUT /attendances/:id": (url: string, body: AttendanceUpdate): MockResponse<Attendance> => {
    const id = parseInt(url.split("/attendances/")[1]?.split("?")[0], 10)
    const attendance = mockDb.updateAttendance(id, body)
    if (!attendance) return error("考勤记录不存在", 404)
    return success(attendance)
  },

  "DELETE /attendances/:id": (url: string): MockResponse<undefined> => {
    const id = parseInt(url.split("/attendances/")[1]?.split("?")[0], 10)
    if (!mockDb.removeAttendance(id)) {
      return error("考勤记录不存在", 404)
    }
    return { code: 204, message: "success", data: undefined }
  },

  // ==================== Reports ====================
  "GET /reports/details": (url: string): MockResponse<AttendanceDetailsReport> => {
    const q = parseQuery(url)
    const startDate = q.get("start_date") || ""
    const endDate = q.get("end_date") || ""
    const classFilter = q.get("class") || undefined
    const studentIdFilter = q.get("student_id") || undefined

    let students = mockDb.students
    if (classFilter) {
      students = students.filter((s) => s.class === classFilter)
    }
    if (studentIdFilter) {
      students = students.filter((s) => s.student_id === studentIdFilter)
    }

    const records = students.map((student) => {
      const attendances = mockDb.attendances.filter(
        (a) =>
          a.student_id === student.student_id &&
          a.date >= startDate &&
          a.date <= endDate
      )
      return {
        student_id: student.student_id,
        name: student.name,
        class: student.class,
        attendance_details: attendances.map((a) => ({
          date: a.date,
          status: a.status,
          symbol: a.status_symbol,
        })),
      }
    })

    return success({
      period: { start_date: startDate, end_date: endDate },
      records,
    })
  },

  "GET /reports/daily": (url: string): MockResponse<DailyReport> => {
    const q = parseQuery(url)
    const date = q.get("date") || ""
    const classFilter = q.get("class") || undefined

    let attendances = mockDb.attendances.filter((a) => a.date === date)
    if (classFilter) {
      attendances = attendances.filter((a) => a.class === classFilter)
    }

    const summary = {
      total_students: attendances.length,
      present: attendances.filter((a) => a.status === "present").length,
      absent: attendances.filter((a) => a.status === "absent").length,
      late: attendances.filter((a) => a.status === "late").length,
      early_leave: attendances.filter((a) => a.status === "early_leave").length,
      personal_leave: attendances.filter((a) => a.status === "personal_leave").length,
      sick_leave: attendances.filter((a) => a.status === "sick_leave").length,
      attendance_rate: "0.00%",
    }

    if (summary.total_students > 0) {
      const rate = (summary.present / summary.total_students) * 100
      summary.attendance_rate = `${rate.toFixed(2)}%`
    }

    const details = attendances.map((a) => ({
      student_id: a.student_id,
      name: a.name,
      class: a.class,
      status: a.status,
      symbol: a.status_symbol,
    }))

    return success({ date, summary, details })
  },

  "GET /reports/summary": (url: string): MockResponse<SummaryReport> => {
    const q = parseQuery(url)
    const startDate = q.get("start_date") || ""
    const endDate = q.get("end_date") || ""
    const classFilter = q.get("class") || undefined

    let students = mockDb.students
    if (classFilter) {
      students = students.filter((s) => s.class === classFilter)
    }

    const summaryData = students.map((student) => {
      const attendances = mockDb.attendances.filter(
        (a) =>
          a.student_id === student.student_id &&
          a.date >= startDate &&
          a.date <= endDate
      )

      const counts = {
        present_count: attendances.filter((a) => a.status === "present").length,
        absent_count: attendances.filter((a) => a.status === "absent").length,
        late_count: attendances.filter((a) => a.status === "late").length,
        early_leave_count: attendances.filter((a) => a.status === "early_leave").length,
        personal_leave_count: attendances.filter((a) => a.status === "personal_leave").length,
        sick_leave_count: attendances.filter((a) => a.status === "sick_leave").length,
      }

      const totalDays = attendances.length
      const rate = totalDays > 0 ? (counts.present_count / totalDays) * 100 : 0

      return {
        student_id: student.student_id,
        name: student.name,
        class: student.class,
        total_days: totalDays,
        ...counts,
        attendance_rate: `${rate.toFixed(2)}%`,
      }
    })

    return success({
      period: { start_date: startDate, end_date: endDate },
      summary: summaryData,
    })
  },

  "GET /reports/abnormal": (url: string): MockResponse<AbnormalReport> => {
    const q = parseQuery(url)
    const startDate = q.get("start_date") || ""
    const endDate = q.get("end_date") || ""
    const classFilter = q.get("class") || undefined
    const typeFilter = q.get("type") as "absent" | "late" | "early_leave" | undefined

    const abnormalStatuses: AttendanceStatus[] = typeFilter
      ? [typeFilter]
      : ["absent", "late", "early_leave"]

    let records = mockDb.attendances.filter(
      (a) =>
        a.date >= startDate &&
        a.date <= endDate &&
        abnormalStatuses.includes(a.status)
    )

    if (classFilter) {
      records = records.filter((a) => a.class === classFilter)
    }

    const abnormalRecords = records.map((a) => ({
      student_id: a.student_id,
      name: a.name,
      class: a.class,
      date: a.date,
      status: a.status,
      symbol: a.status_symbol,
      remark: a.remark,
    }))

    return success({
      period: { start_date: startDate, end_date: endDate },
      abnormal_records: abnormalRecords,
      statistics: {
        total_abnormal: abnormalRecords.length,
        absent_count: records.filter((a) => a.status === "absent").length,
        late_count: records.filter((a) => a.status === "late").length,
        early_leave_count: records.filter((a) => a.status === "early_leave").length,
      },
    })
  },

  "GET /reports/leave": (url: string): MockResponse<LeaveReport> => {
    const q = parseQuery(url)
    const startDate = q.get("start_date") || ""
    const endDate = q.get("end_date") || ""
    const classFilter = q.get("class") || undefined
    const typeFilter = q.get("type") as "personal_leave" | "sick_leave" | undefined

    const leaveStatuses: AttendanceStatus[] = typeFilter
      ? [typeFilter]
      : ["personal_leave", "sick_leave"]

    let records = mockDb.attendances.filter(
      (a) =>
        a.date >= startDate &&
        a.date <= endDate &&
        leaveStatuses.includes(a.status)
    )

    if (classFilter) {
      records = records.filter((a) => a.class === classFilter)
    }

    const leaveRecords = records.map((a) => ({
      student_id: a.student_id,
      name: a.name,
      class: a.class,
      date: a.date,
      type: a.status as "personal_leave" | "sick_leave",
      symbol: a.status_symbol,
      remark: a.remark,
    }))

    return success({
      period: { start_date: startDate, end_date: endDate },
      leave_records: leaveRecords,
      statistics: {
        total_leave: leaveRecords.length,
        personal_leave_count: records.filter((a) => a.status === "personal_leave").length,
        sick_leave_count: records.filter((a) => a.status === "sick_leave").length,
      },
    })
  },

  // ==================== Classes ====================
  "GET /classes": (): MockResponse<ClassInfo[]> => {
    return success(mockDb.getClasses())
  },

  "GET /classes/:name/students": (url: string): MockResponse<ClassStudentsResponse> => {
    const match = url.match(/\/classes\/([^/]+)\/students/)
    const className = decodeURIComponent(match?.[1] || "")
    const students = mockDb.students
      .filter((s) => s.class === className)
      .map((s) => ({ student_id: s.student_id, name: s.name }))

    return success({ class: className, students })
  },

  // ==================== Data Import/Export ====================
  "GET /data/export": (url: string): { format: "json" | "csv"; content: unknown } => {
    const q = parseQuery(url)
    const type = q.get("type") || "all"
    const format = (q.get("format") || "json") as "json" | "csv"

    let data: unknown
    if (type === "students") {
      data = mockDb.students
    } else if (type === "attendances") {
      data = mockDb.attendances
    } else {
      data = { students: mockDb.students, attendances: mockDb.attendances }
    }

    if (format === "csv") {
      if (type === "students") {
        const header = "student_id,name,class"
        const rows = mockDb.students.map(
          (s) => `${s.student_id},${s.name},${s.class}`
        )
        return { format: "csv", content: [header, ...rows].join("\n") }
      } else if (type === "attendances") {
        const header = "id,student_id,name,class,date,status,remark"
        const rows = mockDb.attendances.map(
          (a) =>
            `${a.id},${a.student_id},${a.name},${a.class},${a.date},${a.status},${a.remark}`
        )
        return { format: "csv", content: [header, ...rows].join("\n") }
      }
    }

    return { format: "json", content: data }
  },

  "POST /data/import": (): MockResponse<ImportResult> => {
    return success({
      imported_count: 10,
      skipped_count: 2,
      errors: [],
    })
  },
}

export function matchRoute(
  method: string,
  pathname: string
): { handler: string; match: boolean } {
  const routes = [
    { pattern: /^\/students$/, handler: `${method} /students` },
    { pattern: /^\/students\/[^/]+$/, handler: `${method} /students/:id` },
    { pattern: /^\/attendances$/, handler: `${method} /attendances` },
    { pattern: /^\/attendances\/batch$/, handler: `${method} /attendances/batch` },
    { pattern: /^\/attendances\/\d+$/, handler: `${method} /attendances/:id` },
    { pattern: /^\/reports\/details$/, handler: `${method} /reports/details` },
    { pattern: /^\/reports\/daily$/, handler: `${method} /reports/daily` },
    { pattern: /^\/reports\/summary$/, handler: `${method} /reports/summary` },
    { pattern: /^\/reports\/abnormal$/, handler: `${method} /reports/abnormal` },
    { pattern: /^\/reports\/leave$/, handler: `${method} /reports/leave` },
    { pattern: /^\/classes$/, handler: `${method} /classes` },
    { pattern: /^\/classes\/[^/]+\/students$/, handler: `${method} /classes/:name/students` },
    { pattern: /^\/data\/export$/, handler: `${method} /data/export` },
    { pattern: /^\/data\/import$/, handler: `${method} /data/import` },
  ]

  for (const route of routes) {
    if (route.pattern.test(pathname)) {
      return { handler: route.handler, match: true }
    }
  }

  return { handler: "", match: false }
}
